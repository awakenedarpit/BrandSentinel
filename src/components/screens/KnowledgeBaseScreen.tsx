import React, { useState, useEffect } from 'react';
import { KnowledgeDoc } from '../../types';
import { fetchKnowledgeDocuments, deleteKnowledgeDocument, searchKnowledgeVector } from '../../services/knowledgeService';
import { sampleGroundedChunks } from '../../modules/knowledge/knowledgeService';

interface KnowledgeBaseScreenProps {
  onOpenImportModal: () => void;
}

export const KnowledgeBaseScreen: React.FC<KnowledgeBaseScreenProps> = ({
  onOpenImportModal
}) => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local'>('local');

  const [searchChunkQuery, setSearchChunkQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [liveSearchResults, setLiveSearchResults] = useState<any[] | null>(null);
  const [isSearchingVector, setIsSearchingVector] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchKnowledgeDocuments();
      setDocs(res.docs);
      setSource(res.source);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch knowledge documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Handle vector search debounce
  useEffect(() => {
    if (!searchChunkQuery.trim()) {
      setLiveSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingVector(true);
      try {
        const results = await searchKnowledgeVector(searchChunkQuery);
        setLiveSearchResults(results.length > 0 ? results : null);
      } catch (_e) {
        setLiveSearchResults(null);
      } finally {
        setIsSearchingVector(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchChunkQuery]);

  const handleDeleteDoc = async (docId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${fileName}" and all its vector chunks?`)) {
      return;
    }

    try {
      await deleteKnowledgeDocument(docId);
      setDocs(prev => prev.filter(d => d.id !== docId));
      setActionNotice(`Successfully deleted ${fileName} and purged vector chunks.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setError(`Failed to delete document: ${err.message}`);
    }
  };

  const displayedChunks = liveSearchResults !== null
    ? liveSearchResults
    : sampleGroundedChunks.filter((chunk) => {
        if (selectedDocId) {
          const doc = docs.find(d => d.id === selectedDocId);
          if (doc && !chunk.sourceDoc.toLowerCase().includes(doc.fileName.toLowerCase())) {
            return false;
          }
        }
        if (!searchChunkQuery.trim()) return true;
        const q = searchChunkQuery.toLowerCase();
        return (
          chunk.textSnippet.toLowerCase().includes(q) ||
          chunk.sourceDoc.toLowerCase().includes(q) ||
          chunk.tags.some((t: string) => t.toLowerCase().includes(q))
        );
      });

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm mb-space-lg p-space-lg border border-outline-variant/30">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-lg">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-code text-label-code tracking-wider uppercase font-semibold">
                RAG Knowledge Corpus
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-code text-label-code flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                Index: novafit-primary-v2
              </span>
              <span className={`px-2 py-0.5 rounded-full font-label-code text-label-code text-[11px] font-bold ${
                source === 'supabase' ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-surface-container text-on-surface-variant'
              }`}>
                {source === 'supabase' ? 'Supabase Metadata' : 'Local Seed Docs'}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Brand Knowledge Base
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Authoritative documents, style sheets, and FTC legal manuals semantically vectorized into groundable knowledge chunks with Gemini embeddings.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start xl:self-auto">
            <button
              onClick={loadDocuments}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors"
              title="Refresh knowledge documents"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>Refresh</span>
            </button>

            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold shadow-md hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">post_add</span>
              <span>Upload New Brand Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="mb-space-md p-3.5 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-between">
          <div className="flex items-center gap-2 font-body-sm font-semibold">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="font-semibold text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="mb-space-md p-3.5 rounded-xl bg-error-container text-on-error-container flex items-center justify-between">
          <div className="flex items-center gap-2 font-body-sm">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
          <button onClick={loadDocuments} className="font-semibold text-xs underline">
            Retry
          </button>
        </div>
      )}

      {/* Ingested Documents Grid */}
      <div className="mb-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">folder</span>
          <span>Indexed Brand Source Documents ({docs.length})</span>
        </h2>

        {isLoading ? (
          <div className="p-10 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[28px] text-primary animate-spin">sync</span>
            <p className="font-body-sm font-semibold">Loading document metadata from database...</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="p-10 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col items-center justify-center text-center gap-2">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">description</span>
            <p className="font-headline-sm font-semibold text-on-surface">No Documents Registered</p>
            <p className="font-body-sm text-on-surface-variant max-w-sm">
              Upload compliance manuals or brand tone PDFs to ground your rules with exact RAG citations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {docs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
                className={`p-space-md rounded-xl bg-surface-container-lowest border transition-all cursor-pointer ${
                  selectedDocId === doc.id
                    ? 'ring-2 ring-primary border-primary shadow-md'
                    : 'border-outline-variant/30 hover:shadow-sm hover:border-outline-variant'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center font-bold text-[18px]">
                      <span className="material-symbols-outlined">
                        {doc.fileType === 'PDF' ? 'picture_as_pdf' : 'description'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-[15px] text-on-surface font-semibold truncate max-w-xs">
                        {doc.fileName}
                      </h3>
                      <p className="font-label-code text-[11px] text-on-surface-variant">
                        {doc.fileSize} • {doc.chunksCount} chunks • {doc.rulesExtracted} rules extracted
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDoc(doc.id, doc.fileName);
                      }}
                      className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                      title="Delete document and chunks"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                    <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#10b981] font-label-code text-[10px] font-bold">
                      {doc.status}
                    </span>
                  </div>
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                  {doc.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-outline-variant/10 flex items-center justify-between font-label-meta text-[11px] text-on-surface-variant">
                  <span>Last Indexed: <strong className="text-on-surface">{doc.lastIndexed}</strong></span>
                  <span className="text-primary font-semibold hover:underline">
                    {selectedDocId === doc.id ? 'Hide Chunks' : 'Inspect Vector Chunks'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RAG Vector Chunks Explorer */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-outline-variant/20">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">database</span>
              <span>Vector Chunks Explorer (pgvector / Gemini Semantic Grounding)</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Examine the exact grounded text passages referenced during content audits.
              {isSearchingVector && <span className="ml-2 text-primary font-semibold">Running Gemini vector search...</span>}
            </p>
          </div>

          <div className="relative min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchChunkQuery}
              onChange={(e) => setSearchChunkQuery(e.target.value)}
              placeholder="Live vector search with Gemini embeddings..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {displayedChunks.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-body-sm">
              No matching vector chunks found for query "{searchChunkQuery}".
            </div>
          ) : (
            displayedChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-space-md rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex flex-col gap-2 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-code text-label-code font-bold text-primary">
                      {chunk.id}
                    </span>
                    <span className="font-label-meta text-xs text-on-surface font-semibold">
                      {chunk.sourceDoc} (Page {chunk.page})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-label-code text-xs px-2 py-0.5 rounded bg-[#ecfdf5] text-[#10b981] font-bold">
                      Cosine Similarity: {chunk.cosineSimilarity}
                    </span>
                  </div>
                </div>

                <blockquote className="font-body-md text-body-md text-on-surface italic bg-surface-container-lowest p-3 rounded-lg border-l-2 border-primary">
                  "{chunk.textSnippet}"
                </blockquote>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {(chunk.tags || []).map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded font-label-meta text-[10px] bg-surface-container text-on-surface-variant uppercase font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
