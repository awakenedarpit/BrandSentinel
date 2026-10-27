import type { IncomingMessage, ServerResponse } from 'node:http';

function sendJson(res: ServerResponse, status: number, payload: Record<string, unknown>, headOnly = false) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(headOnly ? undefined : JSON.stringify(payload));
}

function safeErrorSummary(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error';
  return error.message
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/(?:AIza[\w-]{20,}|eyJ[\w.-]{20,}|sb_secret_[\w-]+)/g, '[REDACTED]')
    .slice(0, 180);
}

/**
 * Vercel serverless catch-all for BrandSentinel API routes.
 * Health is deliberately independent from the AI/PDF dependency graph. Other
 * routes load middleware lazily so module initialization errors are controlled.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = (req.method || 'GET').toUpperCase();
  const pathname = new URL(req.url || '/', 'http://localhost').pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/api/health') {
    if (method !== 'GET' && method !== 'HEAD') {
      return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
    }
    return sendJson(res, 200, {
      status: 'ok',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      supabaseConfigured: Boolean(
        (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.startsWith('https://') &&
        process.env.SUPABASE_SECRET_KEY && process.env.SUPABASE_SECRET_KEY.length > 20
      )
    }, method === 'HEAD');
  }

  try {
    const { createRAGApiMiddleware } = await import('../server/apiMiddleware.js');
    const middleware = createRAGApiMiddleware();
    await middleware(req as any, res as any, (error?: unknown) => {
      if (res.writableEnded) return;
      if (error) return sendJson(res, 500, { error: 'API request failed.' });
      return sendJson(res, 404, { error: 'API route not found.' });
    });
  } catch (error) {
    console.error('[API Initialization Error]', error instanceof Error ? error.name : 'UnknownError', safeErrorSummary(error));
    if (!res.writableEnded) {
      sendJson(res, 500, { error: 'The API service could not initialize. Check server function configuration and logs.' });
    }
  }
}
