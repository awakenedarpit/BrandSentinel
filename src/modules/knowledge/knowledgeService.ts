import { KnowledgeDoc } from '../../types';

/**
 * Local Knowledge Retrieval Service
 * Clearly labelled simulated/local data representing ingested brand guidelines,
 * style books, and legal mandates ready to be connected to a real RAG pipeline.
 */

export const demoKnowledgeDocs: KnowledgeDoc[] = [
  {
    id: 'doc-001',
    fileName: 'NovaFit_Compliance_Manual_2025.pdf',
    fileType: 'PDF',
    fileSize: '14.2 MB',
    rulesExtracted: 8,
    vectorIndex: 'novafit-primary-v2',
    status: 'Synced',
    lastIndexed: '12 mins ago',
    chunksCount: 142,
    description: 'Master legal and commercial compliance handbook covering FDA/FTC claim restrictions, trademark rules, and safety disclaimers.'
  },
  {
    id: 'doc-002',
    fileName: 'NovaFit_Voice_Tone_Guide.pdf',
    fileType: 'PDF',
    fileSize: '8.6 MB',
    rulesExtracted: 6,
    vectorIndex: 'novafit-primary-v2',
    status: 'Synced',
    lastIndexed: '2 hours ago',
    chunksCount: 88,
    description: 'Comprehensive tone archetype definitions: encouraging, realistic, and empathetic guidelines for copywriters and agencies.'
  },
  {
    id: 'doc-003',
    fileName: 'NovaFit_Brand_Deck.pdf',
    fileType: 'PDF',
    fileSize: '24.1 MB',
    rulesExtracted: 5,
    vectorIndex: 'novafit-primary-v2',
    status: 'Synced',
    lastIndexed: 'Yesterday',
    chunksCount: 210,
    description: 'Visual identity system, approved brand slogans ("Progress Over Perfection"), imagery art direction, and color palettes.'
  },
  {
    id: 'doc-004',
    fileName: 'NovaFit_Tone_Matrix_Q3.md',
    fileType: 'MD',
    fileSize: '42 KB',
    rulesExtracted: 4,
    vectorIndex: 'novafit-primary-v2',
    status: 'Synced',
    lastIndexed: '3 days ago',
    chunksCount: 18,
    description: 'Quarterly tactical messaging guardrails and prohibited competitor comparisons for paid social channels.'
  }
];

export interface RAGChunkPreview {
  id: string;
  sourceDoc: string;
  page: number;
  textSnippet: string;
  cosineSimilarity: number;
  tags: string[];
}

export const sampleGroundedChunks: RAGChunkPreview[] = [
  {
    id: 'chunk-302',
    sourceDoc: 'NovaFit_Compliance_Manual_2025.pdf',
    page: 14,
    textSnippet: 'NovaFit communications must never promise guaranteed results or specific outcome timelines. Physical fitness adaptations differ by metabolic and lifestyle factors.',
    cosineSimilarity: 0.96,
    tags: ['FTC Truth in Advertising', 'Absolute Claims', 'Section 3.2']
  },
  {
    id: 'chunk-118',
    sourceDoc: 'NovaFit_Voice_Tone_Guide.pdf',
    page: 8,
    textSnippet: 'Use encouraging, realistic, and inclusive language. Avoid hyperbolic generalizations that imply effortless universal success.',
    cosineSimilarity: 0.88,
    tags: ['Tone Guardrails', 'Empathy', 'Universality']
  },
  {
    id: 'chunk-441',
    sourceDoc: 'NovaFit_Compliance_Manual_2025.pdf',
    page: 22,
    textSnippet: 'Mandatory disclaimer: "Results vary by individual." Must accompany any customer transformation testimonial or short-term program claim.',
    cosineSimilarity: 0.94,
    tags: ['Mandatory Disclaimers', 'Legal Requirements', 'Section 4.1']
  }
];

export function getKnowledgeDocs(): KnowledgeDoc[] {
  return demoKnowledgeDocs;
}

export function searchKnowledgeChunks(query: string): RAGChunkPreview[] {
  if (!query) return sampleGroundedChunks;
  const q = query.toLowerCase();
  return sampleGroundedChunks.filter(c => 
    c.textSnippet.toLowerCase().includes(q) ||
    c.sourceDoc.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
}
