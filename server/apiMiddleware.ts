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

// Resolve and validate the Supabase access token for every data endpoint.
async function authenticatedUserId(req: Connect.IncomingMessage): Promise<string | null> {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const { data, error } = await serverSupabase.auth.getUser(match[1]);
  return error || !data.user ? null : data.user.id;
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
        const userId = await authenticatedUserId(req);
        if (!userId) return sendJson(res, 401, { error: 'Authentication required.' });
        try {
          const { data, error } = await serverSupabase
            .from('knowledge_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (error) return sendJson(res, 500, { error: 'Could not load this account knowledge base.' });
          if (data) {
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
          return sendJson(res, 500, { error: 'Could not load this account knowledge base.' });
        }
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

        const userId = await authenticatedUserId(req);
        if (!userId) return sendJson(res, 401, { error: 'Authentication required.' });
        const payload = await parseJsonBody(req);
        const {
          id,
          fileName,
          fileType,
          fileSize,
          base64Content,
          textContent,
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

        let profileQuery = await serverSupabase.from('brand_profiles').select('id').eq('user_id', userId).limit(1).maybeSingle();
        if (profileQuery.error) return sendJson(res, 500, { error: 'Could not load your brand profile.' });
        let ownedBrandProfileId = profileQuery.data?.id;
        if (!ownedBrandProfileId) {
          const createdProfile = await serverSupabase.from('brand_profiles').insert({ user_id: userId, name: 'My Brand' }).select('id').single();
          if (createdProfile.error || !createdProfile.data) return sendJson(res, 500, { error: 'Could not create your brand profile.' });
          ownedBrandProfileId = createdProfile.data.id;
        }
        const result = await ingestDocument({
          id: docId,
          fileName,
          fileType: normalizedType as any,
          fileSize: fileSize || `${Math.round(buffer.length / 1024)} KB`,
          buffer,
          brandProfileId: ownedBrandProfileId,
          userId,
          description
        });

        return sendJson(res, 200, result);
      }

      // 4. POST /api/retrieve (and alias /api/search)
      if (pathname === '/api/retrieve' || pathname === '/api/search') {
        if (method === 'GET') {
          const userId = await authenticatedUserId(req);
          if (!userId) return sendJson(res, 401, { error: 'Authentication required.' });
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
          const profile = await serverSupabase.from('brand_profiles').select('id').eq('user_id', userId).limit(1).maybeSingle();
          if (profile.error) return sendJson(res, 500, { error: 'Could not load your brand profile.' });
          if (!profile.data) return sendJson(res, 200, { chunks: [], count: 0, status: 'empty' });
          const chunks = await retrieveRelevantChunks(queryParam, profile.data.id, { topK, threshold, userId });
          return sendJson(res, 200, { chunks, count: chunks.length, status: chunks.length > 0 ? 'success' : 'empty' });
        }

        if (method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed. Use POST or GET ?q=query.' });
        }

        const userId = await authenticatedUserId(req);
        if (!userId) return sendJson(res, 401, { error: 'Authentication required.' });
        const payload = await parseJsonBody(req);
        const { query, topK, threshold } = payload;

        if (!query) {
          return sendJson(res, 400, { error: 'Missing query in request body' });
        }

        const profile = await serverSupabase.from('brand_profiles').select('id').eq('user_id', userId).limit(1).maybeSingle();
        if (profile.error) return sendJson(res, 500, { error: 'Could not load your brand profile.' });
        if (!profile.data) return sendJson(res, 200, { chunks: [], count: 0, status: 'empty' });
        const chunks = await retrieveRelevantChunks(query, profile.data.id, { topK, threshold, userId });

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

        const userId = await authenticatedUserId(req);
        if (!userId) return sendJson(res, 401, { error: 'Authentication required.' });
        const payload = await parseJsonBody(req);
        const { copy, campaignContext } = payload;

        if (typeof copy !== 'string') {
          return sendJson(res, 400, { error: 'Missing or invalid copy field' });
        }

        const profile = await serverSupabase.from('brand_profiles').select('id').eq('user_id', userId).limit(1).maybeSingle();
        if (profile.error) return sendJson(res, 500, { error: 'Could not load your brand profile.' });
        if (!profile.data) return sendJson(res, 200, { status: 'Needs Review', healthScore: null, evidenceStatus: 'insufficient-evidence', findings: [], retrievedChunks: [], message: 'Upload your own brand guidelines before auditing.' });
        const { data: ownedRules, error: rulesError } = await serverSupabase.from('brand_rules').select('*').eq('user_id', userId).eq('brand_profile_id', profile.data.id).eq('is_active', true);
        if (rulesError) return sendJson(res, 500, { error: 'Could not load your brand rules.' });
        const mappedRules = (ownedRules || []).map((r: any) => ({ id: r.id, title: r.title, category: r.category, severity: r.severity, isActive: r.is_active, statement: r.statement, prohibitedPatterns: r.prohibited_patterns || [], approvedSubstitutions: r.approved_substitutions || [], mandatoryCopy: r.mandatory_copy || undefined, regexPattern: r.regex_pattern || undefined, placementRequirement: r.placement_requirement || undefined }));
        const auditResponse = await auditWithGeminiRAG({ copy, rules: mappedRules, brandProfileId: profile.data.id, userId, campaignContext });

        return sendJson(res, 200, auditResponse);
      }

      // 6. DELETE /api/documents/:id
      if (pathname.startsWith('/api/documents/') && method === 'DELETE') {
        const userId = await authenticatedUserId(req);
        if (!userId) return sendJson(res, 401, { error: 'Authentication required.' });
        const docId = pathname.replace('/api/documents/', '').trim();
        if (!docId) {
          return sendJson(res, 400, { error: 'Missing document id' });
        }

        const { data: ownedDoc, error: ownerError } = await serverSupabase.from('knowledge_documents').select('id').eq('id', docId).eq('user_id', userId).maybeSingle();
        if (ownerError) return sendJson(res, 500, { error: 'Could not verify document ownership.' });
        if (!ownedDoc) return sendJson(res, 404, { error: 'Document not found in your account.' });
        const { error: chunksError } = await serverSupabase.from('document_chunks').delete().eq('document_id', docId).eq('user_id', userId);
        if (chunksError) return sendJson(res, 500, { error: 'Could not delete document chunks.' });
        const { error: deleteError } = await serverSupabase.from('knowledge_documents').delete().eq('id', docId).eq('user_id', userId);
        if (deleteError) return sendJson(res, 500, { error: 'Could not delete document.' });
        inMemoryDocumentStore.documents.delete(docId);
        inMemoryDocumentStore.chunks.delete(docId);
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
