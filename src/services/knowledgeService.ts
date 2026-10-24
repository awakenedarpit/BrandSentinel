import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { KnowledgeDoc } from '../types';
import { Database } from '../types/database';


export function mapRowToKnowledgeDoc(row: Database['public']['Tables']['knowledge_documents']['Row']): KnowledgeDoc {
  return {
    id: row.id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    rulesExtracted: row.rules_extracted,
    vectorIndex: row.vector_index,
    status: row.status,
    lastIndexed: row.last_indexed,
    chunksCount: row.chunks_count,
    description: row.description || ''
  };
}

/**
 * Fetch knowledge documents from API endpoint (which queries Supabase with fallback)
 */
export async function fetchKnowledgeDocuments(): Promise<{
  docs: KnowledgeDoc[];
  source: 'supabase' | 'local';
  error?: string;
}> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return { docs: [], source: 'local', error: 'Sign in to load your knowledge base.' };
    const apiRes = await fetch('/api/documents', { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (Array.isArray(data.documents)) {
        return {
          docs: data.documents,
          source: data.source === 'supabase' ? 'supabase' : 'local'
        };
      }
    }
  } catch (_e) {
    // Use the authenticated Supabase query below if the API is unavailable.
  }

  if (!isSupabaseConfigured()) return { docs: [], source: 'local', error: 'Supabase is not configured.' };

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { docs: [], source: 'local', error: 'Sign in to load your knowledge base.' };
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) return { docs: [], source: 'local', error: error.message };
    if (!data) return { docs: [], source: 'supabase' };

    return {
      docs: data.map(mapRowToKnowledgeDoc),
      source: 'supabase'
    };
  } catch (err: any) {
    return { docs: [], source: 'local', error: err.message };
  }
}

/**
 * Delete a knowledge document and its associated vector chunks safely
 */
export async function deleteKnowledgeDocument(docId: string): Promise<boolean> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error('Sign in before deleting documents.');
    const res = await fetch(`/api/documents/${encodeURIComponent(docId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${sessionData.session.access_token}` } });
    if (res.ok) return true;
  } catch (_e) {
    // ignore
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return false;
    await supabase.from('document_chunks').delete().eq('document_id', docId).eq('user_id', authData.user.id);
    const { error } = await supabase.from('knowledge_documents').delete().eq('id', docId).eq('user_id', authData.user.id);
    return !error;
  } catch (_e) {
    return false;
  }
}

/**
 * Live semantic vector search against knowledge base
 */
export async function searchKnowledgeVector(query: string): Promise<Array<{
  id: string;
  sourceDoc: string;
  page: number;
  textSnippet: string;
  cosineSimilarity: number;
  tags: string[];
}>> {
  if (!query || !query.trim()) return [];

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return [];
    const res = await fetch('/api/retrieve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
      body: JSON.stringify({ query, topK: 5, threshold: 0.35 })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.chunks)) {
        return data.chunks.map((c: any) => ({
          id: c.id,
          sourceDoc: c.docName,
          page: c.pageNumber || 1,
          textSnippet: c.content,
          cosineSimilarity: c.similarity,
          tags: ['RAG Vector Search', `Cosine: ${c.similarity}`]
        }));
      }
    }
  } catch (_err) {
    // fallback
  }

  return [];
}
