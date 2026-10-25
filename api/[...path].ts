import type { IncomingMessage, ServerResponse } from 'node:http';
import { createRAGApiMiddleware } from '../server/apiMiddleware';

/**
 * Vercel serverless catch-all for the RAG API.
 * Vite's configureServer middleware only runs locally, so production needs
 * this function to expose /api/ingest, /api/documents, /api/retrieve, etc.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const middleware = createRAGApiMiddleware();

  void middleware(req as any, res as any, (error?: unknown) => {
    if (res.writableEnded) return;

    if (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'API request failed.' }));
      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'API route not found.' }));
  });
}
