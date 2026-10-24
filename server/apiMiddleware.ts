import type { Connect } from 'vite';
import {
  ingestDocument,
  retrieveRelevantChunks,
  auditWithGeminiRAG,
  inMemoryDocumentStore,
  serverSupabase
} from './ragEngine';

// Parse JSON request body helper with stream guard
async function parseJsonBody(req: Connect.IncomingMessage): Promise<any> {
  if ((req as any).body && typeof (req as any).body === 'object') {
    return (req as any).body;
  }
  if (req.readableEnded) {
    return {};
  }
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body && body.trim() ? JSON.parse(body) : {});
      } catch (_e) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', err => reject(err));
  });
}

// Send JSON response helper
function sendJson(res: any, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Vite plugin middleware providing server-side RAG and Gemini endpoints
 */
export function createRAGApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const rawUrl = req.url || '';

    // Only intercept requests directed to /api
    if (!rawUrl.startsWith('/api') || (rawUrl.length > 4 && rawUrl[4] !== '/' && rawUrl[4] !== '?')) {
      return next();
    }

    const method = (req.method || 'GET').toUpperCase();
    const parsedUrl = new URL(rawUrl, 'http://localhost:3000');
    // Normalize path by stripping trailing slashes (except root /)
    const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';

    // Set standard CORS headers for local developer experience & preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    try {
      // 0. GET /api -> API directory & status
      if (pathname === '/api') {
        const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);
        return sendJson(res, 200, {
          name: 'BrandSentinel AI API',
          status: 'operational',
          geminiConfigured: hasGeminiKey,
          endpoints: [
            { path: '/api/health', methods: ['GET', 'HEAD'], description: 'Server and AI health status' },
            { path: '/api/documents', methods: ['GET'], description: 'List knowledge documents' },
            { path: '/api/documents/:id', methods: ['DELETE'], description: 'Delete knowledge document' },
            { path: '/api/ingest', methods: ['POST', 'GET'], description: 'Ingest and chunk PDF / text guideline documents' },
            { path: '/api/retrieve', methods: ['POST', 'GET'], description: 'Vector similarity search over guideline chunks' },
            { path: '/api/audit-rag', methods: ['POST', 'GET'], description: 'Live Gemini RAG compliance audit' }
          ]
        });
      }

      // 1. GET /api/health
      if (pathname === '/api/health') {
        if (method !== 'GET' && method !== 'HEAD') {
          return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
        }
        const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);
        return sendJson(res, 200, {
          status: 'ok',
          geminiConfigured: hasGeminiKey,
          embeddingModel: 'gemini-embedding-001',
          auditModel: 'gemini-3.8-flash'
        });
      }

      // 2. GET /api/documents
      if (pathname === '/api/documents') {
        if (method !== 'GET') {
          return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
        }
        // First try Supabase
        try {
          const { data, error } = await serverSupabase
            .from('knowledge_documents')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped = data.map(d => ({
              id: d.id,
              fileName: d.file_name,
              fileType: d.file_type,
              fileSize: d.file_size,
              rulesExtracted: d.rules_extracted,
              vectorIndex: d.vector_index,
              status: d.status,
              lastIndexed: d.last_indexed,
              chunksCount: d.chunks_count,
              description: d.description || ''
            }));
            return sendJson(res, 200, { documents: mapped, source: 'supabase' });
          }
        } catch (_e) {
          // ignore, fall back to in-memory store
        }

        // In-memory documents fallback
        const inMemDocs = Array.from(inMemoryDocumentStore.documents.values());
        return sendJson(res, 200, { documents: inMemDocs, source: 'in-memory' });
      }

      // 3. POST /api/ingest (and alias /api/upload)
      if (pathname === '/api/ingest' || pathname === '/api/upload') {
        if (method === 'GET') {
          return sendJson(res, 200, {
            endpoint: pathname,
            status: 'ready',
            description: 'Send a POST request with JSON { fileName, base64Content or textContent, fileSize?, fileType?, brandProfileId?, description? } to ingest document guidelines.'
          });
        }
        if (method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
        }

        const payload = await parseJsonBody(req);
        const {
          id,
          fileName,
          fileType,
          fileSize,
          base64Content,
          textContent,
          brandProfileId,
          description
        } = payload;

        if (!fileName) {
          return sendJson(res, 400, { error: 'Missing required field: fileName' });
        }

        let buffer: Buffer;
        if (base64Content) {
          buffer = Buffer.from(base64Content, 'base64');
        } else if (textContent) {
          buffer = Buffer.from(textContent, 'utf-8');
        } else {
          return sendJson(res, 400, { error: 'Missing file content (base64Content or textContent)' });
        }

        const docId = id || `doc-${Date.now()}`;
        const normalizedType = fileType?.toUpperCase() || (fileName.endsWith('.pdf') ? 'PDF' : 'MD');

        const result = await ingestDocument({
          id: docId,
          fileName,
          fileType: normalizedType as any,
          fileSize: fileSize || `${Math.round(buffer.length / 1024)} KB`,
          buffer,
          brandProfileId: brandProfileId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          description
        });

        return sendJson(res, 200, result);
      }

      // 4. POST /api/retrieve (and alias /api/search)
      if (pathname === '/api/retrieve' || pathname === '/api/search') {
        if (method === 'GET') {
          const queryParam = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query');
          if (!queryParam) {
            return sendJson(res, 200, {
              endpoint: pathname,
              status: 'ready',
              description: 'Send a POST request with JSON { query: string, topK?: number, threshold?: number, brandProfileId?: string } or GET ?q=query to retrieve semantic chunks.'
            });
          }
          const topK = parseInt(parsedUrl.searchParams.get('topK') || '5', 10);
          const threshold = parseFloat(parsedUrl.searchParams.get('threshold') || '0.35');
          const brandProfileId = parsedUrl.searchParams.get('brandProfileId') || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

          const chunks = await retrieveRelevantChunks(queryParam, brandProfileId, { topK, threshold });
          return sendJson(res, 200, { chunks, count: chunks.length, status: chunks.length > 0 ? 'success' : 'empty' });
        }

        if (method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed. Use POST or GET ?q=query.' });
        }

        const payload = await parseJsonBody(req);
        const { query, brandProfileId, topK, threshold } = payload;

        if (!query) {
          return sendJson(res, 400, { error: 'Missing query in request body' });
        }

        const chunks = await retrieveRelevantChunks(
          query,
          brandProfileId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          { topK, threshold }
        );

        return sendJson(res, 200, { chunks, count: chunks.length, status: chunks.length > 0 ? 'success' : 'empty' });
      }

      // 5. POST /api/audit-rag (and alias /api/audit)
      if (pathname === '/api/audit-rag' || pathname === '/api/audit') {
        if (method === 'GET') {
          return sendJson(res, 200, {
            endpoint: pathname,
            status: 'ready',
            description: 'Send a POST request with JSON { copy: string, rules?: any[], brandProfileId?: string, campaignContext?: { campaignName?: string, publishingSurface?: string } } to run a live Gemini RAG compliance audit.'
          });
        }

        if (method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
        }

        const payload = await parseJsonBody(req);
        const { copy, rules, brandProfileId, campaignContext } = payload;

        if (typeof copy !== 'string') {
          return sendJson(res, 400, { error: 'Missing or invalid copy field' });
        }

        const auditResponse = await auditWithGeminiRAG({
          copy,
          rules: rules || [],
          brandProfileId: brandProfileId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          campaignContext
        });

        return sendJson(res, 200, auditResponse);
      }

      // 6. DELETE /api/documents/:id
      if (pathname.startsWith('/api/documents/') && method === 'DELETE') {
        const docId = pathname.replace('/api/documents/', '').trim();
        if (!docId) {
          return sendJson(res, 400, { error: 'Missing document id' });
        }

        // Delete from in-memory store
        inMemoryDocumentStore.documents.delete(docId);
        inMemoryDocumentStore.chunks.delete(docId);

        // Delete from Supabase
        try {
          await serverSupabase.from('document_chunks').delete().eq('document_id', docId);
          await serverSupabase.from('knowledge_documents').delete().eq('id', docId);
        } catch (_e) {
          // ignore
        }

        return sendJson(res, 200, { success: true, message: `Document ${docId} deleted.` });
      }

      // Route not found
      return sendJson(res, 404, {
        error: 'API route not found',
        requestedPath: pathname,
        requestedMethod: method,
        availableRoutes: [
          '/api/health',
          '/api/documents',
          '/api/documents/:id',
          '/api/ingest',
          '/api/retrieve',
          '/api/audit-rag'
        ]
      });
    } catch (err: any) {
      console.error('[API Middleware Error]:', err);
      return sendJson(res, 500, {
        error: err.message || 'Internal server error',
        details: err.stack ? err.stack.split('\n').slice(0, 3) : undefined
      });
    }
  };
}
