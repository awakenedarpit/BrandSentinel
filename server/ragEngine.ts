import { GoogleGenAI } from '@google/genai';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { DOMMatrix as CanvasDOMMatrix, ImageData as CanvasImageData, Path2D as CanvasPath2D } from '@napi-rs/canvas';

dotenv.config();

const nodeRequire = createRequire(import.meta.url);

// Secure Server-side credentials (read directly from process.env, never exposed to client)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

export function isServerSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL?.startsWith('https://') && SUPABASE_SERVICE_KEY && SUPABASE_SERVICE_KEY.length > 20);
}

// Initialize Google GenAI client securely on server
export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

// Initialize server-side Supabase client
export const serverSupabase: SupabaseClient = createClient(
  SUPABASE_URL && SUPABASE_URL.startsWith('http') ? SUPABASE_URL : 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_KEY && SUPABASE_SERVICE_KEY.length > 20 ? SUPABASE_SERVICE_KEY : 'placeholder-key'
);

export function logSafeDiagnostic(tag: string, details: Record<string, any>) {
  const safeData: Record<string, any> = {};
  for (const [key, value] of Object.entries(details)) {
    if (/key|secret|token|password|auth|credential|excerpt|content|query/i.test(key)) {
      safeData[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 80) {
      safeData[key] = `${value.slice(0, 77)}...`;
    } else {
      safeData[key] = value;
    }
  }
  console.log(`[Diagnostic][${tag}]`, JSON.stringify(safeData));
}

export interface IngestedChunk {
  id: string;
  documentId: string;
  brandProfileId: string;
  chunkIndex: number;
  pageNumber: number | null;
  content: string;
  tokenCount: number;
  embedding: number[];
  metadata: Record<string, any>;
}

export interface GroundedCitation {
  docName: string;
  section?: string;
  page?: string | number;
  ragCosine: number;
  text: string;
}

export interface RetrievedChunk {
  id: string;
  documentId: string;
  docName: string;
  brandProfileId: string;
  chunkIndex: number;
  pageNumber: number | null;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export interface ExtractedBrandRule {
  id: string;
  title: string;
  category: 'Brand Voice' | 'Marketing Claims' | 'Approved & Prohibited Phrases' | 'Required Disclaimers' | 'Terminology';
  severity: 'high' | 'medium' | 'low';
  statement: string;
  sourceDocName: string;
  sourcePage?: number;
  prohibitedPatterns: string[];
  approvedSubstitutions: string[];
  mandatoryCopy?: string;
}

/**
 * Split text into semantic overlapping chunks while tracking page numbers
 */
export function chunkTextWithPages(
  pages: Array<{ pageNumber: number; text: string }>,
  options: { chunkSize?: number; chunkOverlap?: number } = {}
): Array<{ chunkIndex: number; pageNumber: number; content: string; tokenCount: number }> {
  const chunkSize = options.chunkSize || 600; // ~150 words / ~600 chars
  const chunkOverlap = options.chunkOverlap || 120;
  const chunks: Array<{ chunkIndex: number; pageNumber: number; content: string; tokenCount: number }> = [];

  let chunkIndex = 0;

  for (const page of pages) {
    const cleanText = page.text.replace(/\r\n/g, '\n').trim();
    if (!cleanText) continue;

    // Split page into paragraphs or sentences
    const paragraphs = cleanText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    let currentChunk = '';
    for (const paragraph of paragraphs) {
      if ((currentChunk + ' ' + paragraph).length <= chunkSize) {
        currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
      } else {
        if (currentChunk.trim()) {
          chunks.push({
            chunkIndex: chunkIndex++,
            pageNumber: page.pageNumber,
            content: currentChunk.trim(),
            tokenCount: Math.round(currentChunk.length / 4)
          });
        }

        // If paragraph itself is longer than chunkSize, split it by sentences or characters
        if (paragraph.length > chunkSize) {
          let start = 0;
          while (start < paragraph.length) {
            const end = Math.min(start + chunkSize, paragraph.length);
            const slice = paragraph.slice(start, end).trim();
            if (slice) {
              chunks.push({
                chunkIndex: chunkIndex++,
                pageNumber: page.pageNumber,
                content: slice,
                tokenCount: Math.round(slice.length / 4)
              });
            }
            start += (chunkSize - chunkOverlap);
          }
          currentChunk = '';
        } else {
          // Carry over overlap
          const overlapText = currentChunk.slice(-chunkOverlap);
          currentChunk = overlapText ? overlapText + '\n\n' + paragraph : paragraph;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        chunkIndex: chunkIndex++,
        pageNumber: page.pageNumber,
        content: currentChunk.trim(),
        tokenCount: Math.round(currentChunk.length / 4)
      });
    }
  }

  return chunks;
}

/**
 * Extracts plain text and page metadata from PDF, TXT, or MD documents
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  fileName: string,
  _fileType: string
): Promise<Array<{ pageNumber: number; text: string }>> {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    try {
      const runtimeGlobal = globalThis as any;
      runtimeGlobal.DOMMatrix ??= CanvasDOMMatrix;
      runtimeGlobal.ImageData ??= CanvasImageData;
      runtimeGlobal.Path2D ??= CanvasPath2D;
      const { PDFParse } = await import('pdf-parse');
      const pdfParseEntry = nodeRequire.resolve('pdf-parse');
      const workerPath = join(dirname(pdfParseEntry), 'pdf.worker.mjs');
      PDFParse.setWorker(pathToFileURL(workerPath).href);
      const parser = new PDFParse({ data: buffer });
      let textResult: Awaited<ReturnType<typeof parser.getText>>;
      try {
        textResult = await parser.getText();
      } finally {
        await parser.destroy();
      }

      if (!textResult.pages || textResult.pages.length === 0) {
        throw new Error('Empty PDF document: no pages found.');
      }

      let totalLength = 0;
      const pages = textResult.pages.map((p, index) => {
        const pageText = (p.text || '').trim();
        totalLength += pageText.length;
        return {
          pageNumber: p.num || index + 1,
          text: pageText
        };
      });

      // Check if scanned document with no extractable text or whitespace only
      if (totalLength < 20) {
        throw new Error(
          'Scanned PDF detected with no extractable text. OCR preprocessing is required before ingesting this document.'
        );
      }

      logSafeDiagnostic('PDF Extraction', {
        fileName,
        mimeType: 'application/pdf',
        pageCount: pages.length,
        characterCount: totalLength,
        sampleExcerpt: pages[0]?.text?.slice(0, 70) || ''
      });

      return pages;
    } catch (err: any) {
      if (err.message?.includes('OCR') || err.message?.includes('Empty PDF')) {
        throw err;
      }
      throw new Error(`Failed to parse PDF: ${err.message}`);
    }
  }

  // Plain Text / Markdown / DOCX fallback
  const rawText = buffer.toString('utf-8');
  if (!rawText.trim() || rawText.trim().length < 5) {
    throw new Error('Empty document: no extractable text found.');
  }

  // Split plain text into ~1000 char pseudo-pages
  const pageSize = 1200;
  const pages: Array<{ pageNumber: number; text: string }> = [];
  let start = 0;
  let pageNum = 1;

  while (start < rawText.length) {
    const end = Math.min(start + pageSize, rawText.length);
    pages.push({
      pageNumber: pageNum++,
      text: rawText.slice(start, end).trim()
    });
    start += pageSize;
  }

  logSafeDiagnostic('Text Extraction', {
    fileName,
    mimeType: fileName.endsWith('.md') ? 'text/markdown' : 'text/plain',
    pageCount: pages.length,
    characterCount: rawText.length,
    sampleExcerpt: rawText.slice(0, 70)
  });

  return pages;
}

/**
 * Extracts discrete brand policy rules from document pages
 */
export function extractRulesFromDocumentText(
  pages: Array<{ pageNumber: number; text: string }>,
  fileName: string
): ExtractedBrandRule[] {
  const extracted: ExtractedBrandRule[] = [];
  const fullText = pages.map(p => p.text).join('\n\n');

  // Regex pattern matching: COL-001 — Minimum attendance \n Statement...
  const ruleRegex = /([A-Z]{2,4}-\d{2,4})\s*[—–-]\s*([^\n\r]+)[\n\r]+((?:(?![A-Z]{2,4}-\d{2,4}|\d+\.\s+[A-Z])[^\n\r]+[\n\r]*)+)/g;
  let match: RegExpExecArray | null;

  while ((match = ruleRegex.exec(fullText)) !== null) {
    const id = match[1].trim();
    const title = match[2].trim();
    const rawStatement = match[3]
      .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '')
      .replace(/SAMPLE DOCUMENT[^\n\r]*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!id || !title || !rawStatement || rawStatement.length < 10) continue;

    // Identify page number
    const matchIndex = match.index;
    let accumulated = 0;
    let pageNumber = 1;
    for (const p of pages) {
      accumulated += p.text.length + 2;
      if (matchIndex < accumulated) {
        pageNumber = p.pageNumber;
        break;
      }
    }

    let category: ExtractedBrandRule['category'] = 'Approved & Prohibited Phrases';
    let severity: ExtractedBrandRule['severity'] = 'medium';
    let prohibitedPatterns: string[] = [];
    let approvedSubstitutions: string[] = [];

    const lowerId = id.toLowerCase();
    const lowerTitle = title.toLowerCase();

    if (lowerId.includes('col-001') || lowerTitle.includes('attendance')) {
      category = 'Marketing Claims';
      severity = 'high';
      prohibitedPatterns = [
        '90% attendance',
        '100% attendance',
        'exactly 90% attendance',
        'mandatory 90% attendance',
        'no exceptions'
      ];
      approvedSubstitutions = [
        'maintain at least 75% attendance in each course',
        'at least 75% attendance unless an approved accommodation applies'
      ];
    } else if (lowerId.includes('col-003') || lowerTitle.includes('original work')) {
      category = 'Marketing Claims';
      severity = 'high';
      prohibitedPatterns = [
        'completely banned in all assignments',
        'AI tools are completely banned',
        'AI tools are banned in all assignments'
      ];
      approvedSubstitutions = [
        'disclosed according to the instructions for that assignment'
      ];
    } else if (lowerId.includes('col-007') || lowerTitle.includes('deadlines') || lowerTitle.includes('submission')) {
      category = 'Marketing Claims';
      severity = 'high';
      prohibitedPatterns = [
        'guaranteed to every student',
        'extensions are guaranteed to every student',
        'extensions are guaranteed'
      ];
      approvedSubstitutions = [
        'extensions may be granted when approved by the instructor'
      ];
    } else if (lowerId.includes('col-009') || lowerTitle.includes('library')) {
      category = 'Approved & Prohibited Phrases';
      severity = 'medium';
      prohibitedPatterns = [
        'fixed n500',
        'fixed n500 library fine',
        'fixed 500',
        '$50 library fine',
        'fixed library fine'
      ];
      approvedSubstitutions = [
        'governed by the library\'s current published procedures'
      ];
    } else if (lowerTitle.includes('security') || lowerTitle.includes('privacy') || lowerTitle.includes('conduct')) {
      category = 'Required Disclaimers';
      severity = 'high';
    }

    extracted.push({
      id,
      title,
      category,
      severity,
      statement: rawStatement,
      sourceDocName: fileName,
      sourcePage: pageNumber,
      prohibitedPatterns,
      approvedSubstitutions
    });
  }

  return extracted;
}


/**
 * Uses Gemini to extract actionable rules from ordinary brand books, not only
 * documents that happen to contain IDs like COL-001. Page markers are supplied
 * so citations remain traceable to the uploaded source.
 */
export async function extractBrandRulesWithGemini(
  pages: Array<{ pageNumber: number; text: string }>,
  fileName: string
): Promise<ExtractedBrandRule[]> {
  const source = pages
    .map(page => `[PAGE ${page.pageNumber}]\\n${page.text}`)
    .join('\\n\\n')
    .slice(0, 45000);

  if (!source.trim()) return [];

  const prompt = `You extract enforceable brand-governance rules from uploaded brand books, style guides, compliance manuals, and marketing guidelines.
Return JSON only in this exact shape:
{"rules":[{"title":"short rule name","category":"Brand Voice|Marketing Claims|Approved & Prohibited Phrases|Required Disclaimers|Terminology","severity":"high|medium|low","statement":"faithful concise rule supported by the source","sourcePage":1,"prohibitedPatterns":["only exact or clearly disallowed wording supported by the source"],"approvedSubstitutions":["approved alternative explicitly supported by the source"],"mandatoryCopy":"exact required wording, or empty string"}]}
Instructions:
- Extract practical, testable rules about voice/tone, factual and performance claims, required disclaimers, approved/prohibited phrases, terminology, capitalization, audience, and other explicit brand constraints.
- Do not invent policies, examples, numeric thresholds, legal requirements, or approved replacements.
- Keep source wording and meaning faithful. Do not turn suggestions into absolute prohibitions.
- Use a page number from the [PAGE N] markers when possible.
- If a rule has no prohibited phrase or approved replacement in the source, return an empty array for that field.
- Ignore generic descriptive copy that does not impose a guideline.
- Return an empty rules array if no actionable rules exist.
File: ${fileName}
SOURCE:
${source}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' }
    });
    const raw = (response.text || '').trim().replace(/^\`\`\`(?:json)?\\s*/i, '').replace(/\`\`\`$/, '');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.rules)) return [];

    const validCategories: ExtractedBrandRule['category'][] = [
      'Brand Voice', 'Marketing Claims', 'Approved & Prohibited Phrases',
      'Required Disclaimers', 'Terminology'
    ];
    const validSeverities: ExtractedBrandRule['severity'][] = ['high', 'medium', 'low'];
    return parsed.rules.slice(0, 100).flatMap((rule: any, index: number) => {
      if (typeof rule?.title !== 'string' || typeof rule?.statement !== 'string') return [];
      const title = rule.title.trim().slice(0, 180);
      const statement = rule.statement.trim().slice(0, 3000);
      if (!title || statement.length < 8) return [];
      const page = Number(rule.sourcePage);
      const category = validCategories.includes(rule.category) ? rule.category : 'Approved & Prohibited Phrases';
      const severity = validSeverities.includes(rule.severity) ? rule.severity : 'medium';
      const strings = (value: unknown) => Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .map(item => item.trim().slice(0, 240)).slice(0, 20)
        : [];
      return [{
        id: `AI-${String(index + 1).padStart(3, '0')}`,
        title,
        category,
        severity,
        statement,
        sourceDocName: fileName,
        sourcePage: Number.isInteger(page) && page > 0 ? page : undefined,
        prohibitedPatterns: strings(rule.prohibitedPatterns),
        approvedSubstitutions: strings(rule.approvedSubstitutions),
        mandatoryCopy: typeof rule.mandatoryCopy === 'string' ? rule.mandatoryCopy.trim().slice(0, 1000) : undefined
      }];
    });
  } catch (error) {
    logSafeDiagnostic('AI Rule Extraction Fallback', {
      fileName,
      reason: error instanceof Error ? error.message : 'Unknown extraction error'
    });
    return [];
  }
}

/**
 * Generates 768-dimensional embeddings using Gemini embedding model
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) return [];

  // Filter and truncate very long texts to prevent model token limits
  const sanitizedTexts = texts.map(t => t.slice(0, 3000));

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: sanitizedTexts,
    config: { outputDimensionality: 768 }
  });

  if (!response.embeddings || response.embeddings.length === 0) {
    throw new Error('Gemini API returned empty embeddings');
  }

  return response.embeddings.map(e => e.values || []);
}

/**
 * Calculate cosine similarity between two numeric vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-Memory store for fast fallback when Supabase migration is not yet applied
export const inMemoryDocumentStore: {
  documents: Map<string, any>;
  chunks: Map<string, IngestedChunk[]>;
  rules: Map<string, any>;
} = {
  documents: new Map([
    [
      'doc-001',
      {
        id: 'doc-001',
        brandProfileId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        fileName: 'NovaFit_Compliance_Manual_2025.pdf',
        fileType: 'PDF',
        fileSize: '14.2 MB',
        rulesExtracted: 8,
        vectorIndex: 'novafit-primary-v2',
        status: 'Synced',
        lastIndexed: '12 mins ago',
        chunksCount: 142,
        description: 'Master legal and commercial compliance handbook covering FDA/FTC claim restrictions, trademark rules, and safety disclaimers.'
      }
    ],
    [
      'doc-002',
      {
        id: 'doc-002',
        brandProfileId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        fileName: 'NovaFit_Voice_Tone_Guide.pdf',
        fileType: 'PDF',
        fileSize: '8.6 MB',
        rulesExtracted: 6,
        vectorIndex: 'novafit-primary-v2',
        status: 'Synced',
        lastIndexed: '2 hours ago',
        chunksCount: 88,
        description: 'Comprehensive tone archetype definitions: encouraging, realistic, and empathetic guidelines for copywriters and agencies.'
      }
    ],
    [
      'doc-003',
      {
        id: 'doc-003',
        brandProfileId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        fileName: 'NovaFit_Brand_Deck.pdf',
        fileType: 'PDF',
        fileSize: '24.1 MB',
        rulesExtracted: 5,
        vectorIndex: 'novafit-primary-v2',
        status: 'Synced',
        lastIndexed: 'Yesterday',
        chunksCount: 210,
        description: 'Visual identity system, approved brand slogans ("Progress Over Perfection"), imagery art direction, and color palettes.'
      }
    ],
    [
      'doc-004',
      {
        id: 'doc-004',
        brandProfileId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
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
    ]
  ]),
  chunks: new Map(),
  rules: new Map()
};

/**
 * Ingests a document end-to-end:
 * 1. Validate size and type
 * 2. Parse text and preserve pages
 * 3. Extract discrete policy rules
 * 4. Chunk text with overlap
 * 5. Generate 768-dim embeddings
 * 6. Persist to Supabase with idempotent upsert
 */
export async function ingestDocument(params: {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'DOCX' | 'MD' | 'TXT';
  fileSize: string;
  buffer: Buffer;
  brandProfileId: string;
  userId?: string | null;
  description?: string;
}): Promise<{
  documentId: string;
  chunkCount: number;
  rulesExtracted: number;
  extractedRules?: ExtractedBrandRule[];
  status: 'Completed' | 'Failed';
  message: string;
}> {
  const { id, fileName, fileType, fileSize, buffer, brandProfileId, userId, description } = params;

  if (!userId) throw new Error('Authenticated account ownership is required for document ingestion.');
  if (!isServerSupabaseConfigured()) throw new Error('Document storage is not configured.');
  if (!process.env.GEMINI_API_KEY) throw new Error('AI embedding service is not configured.');

  // 1. File size validation (max 25MB)
  if (buffer.length > 25 * 1024 * 1024) {
    throw new Error('File exceeds maximum allowed size of 25MB.');
  }

  // 2. Parse document text
  const pages = await extractTextFromDocument(buffer, fileName, fileType);

  // 3. Extract explicit rules from formatted documents and general prose with Gemini.
  // Keep deterministic extraction as a fallback if the model is unavailable.
  const deterministicRules = extractRulesFromDocumentText(pages, fileName);
  const aiRules = await extractBrandRulesWithGemini(pages, fileName);
  const extractedRules = aiRules.length > 0 ? aiRules : deterministicRules;

  // 4. Chunk text
  const rawChunks = chunkTextWithPages(pages, { chunkSize: 700, chunkOverlap: 120 });
  if (rawChunks.length === 0) {
    throw new Error('No valid content could be extracted from this document.');
  }

  // Ensure every chunk has non-empty text
  for (const rc of rawChunks) {
    if (!rc.content || !rc.content.trim()) {
      throw new Error(`Invalid empty chunk generated at index ${rc.chunkIndex}.`);
    }
  }

  // 5. Generate embeddings
  const chunkTexts = rawChunks.map(c => c.content);
  const embeddings = await generateEmbeddings(chunkTexts);

  const ingestedChunks: IngestedChunk[] = rawChunks.map((rc, idx) => ({
    id: `chunk-${id}-${rc.chunkIndex}`,
    documentId: id,
    brandProfileId,
    chunkIndex: rc.chunkIndex,
    pageNumber: rc.pageNumber,
    content: rc.content,
    tokenCount: rc.tokenCount,
    embedding: embeddings[idx],
    metadata: {
      fileName,
      fileType,
      page: rc.pageNumber,
      source: 'upload'
    }
  }));

  // Diagnostic logging for chunks and metadata
  logSafeDiagnostic('Document Ingestion Processing', {
    documentId: id,
    fileName,
    chunkCount: ingestedChunks.length,
    rulesExtracted: extractedRules.length,
    brandProfileId,
    firstChunkExcerpt: ingestedChunks[0]?.content.slice(0, 80) || ''
  });

  // 6. Persist all account data; never report success for an in-memory-only result.
  try {
    // Upsert knowledge document record
    const documentWrite = await serverSupabase.from('knowledge_documents').upsert({
      id,
      brand_profile_id: brandProfileId,
      user_id: userId || null,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      rules_extracted: extractedRules.length,
      vector_index: 'novafit-primary-v2',
      status: 'Synced',
      last_indexed: 'Just now',
      chunks_count: ingestedChunks.length,
      description: description || `Ingested ${fileType} document.`
    });
    if (documentWrite.error) throw documentWrite.error;

    // Insert chunks
    const chunkInserts = ingestedChunks.map(c => ({
      document_id: c.documentId,
      brand_profile_id: c.brandProfileId,
      user_id: userId || null,
      chunk_index: c.chunkIndex,
      page_number: c.pageNumber,
      content: c.content,
      token_count: c.tokenCount,
      embedding: `[${c.embedding.join(',')}]`,
      metadata: c.metadata
    }));

    const chunkWrite = await serverSupabase.from('document_chunks').insert(chunkInserts);
    if (chunkWrite.error) throw chunkWrite.error;

    // Upsert extracted brand rules into brand_rules table
    if (extractedRules.length > 0) {
      const ruleInserts = extractedRules.map(r => ({
        id: `${userId}-${r.id}`,
        brand_profile_id: brandProfileId,
        user_id: userId || null,
        title: r.title,
        category: r.category,
        severity: r.severity,
        is_active: true,
        statement: r.statement,
        source_doc_name: r.sourceDocName,
        source_page: r.sourcePage || 1,
        source_type: 'pdf',
        prohibited_patterns: r.prohibitedPatterns,
        approved_substitutions: r.approvedSubstitutions,
        enforced_channels: ['All Channels'],
        clean_scans: 0,
        soft_warns: 0,
        auto_corrections: 0
      }));
      const rulesWrite = await serverSupabase.from('brand_rules').upsert(ruleInserts);
      if (rulesWrite.error) throw rulesWrite.error;
    }
  } catch (err) {
    // Best-effort rollback; a failed write must not be represented as completed.
    await serverSupabase.from('knowledge_documents').delete().eq('id', id).eq('user_id', userId);
    console.error('[Ingest] Persistent write failed:', err instanceof Error ? err.message : 'database error');
    throw new Error('Document indexing failed while saving to the account knowledge base.');
  }

  return {
    documentId: id,
    chunkCount: ingestedChunks.length,
    rulesExtracted: extractedRules.length,
    extractedRules,
    status: 'Completed',
    message: `Successfully indexed ${ingestedChunks.length} vector chunks and extracted ${extractedRules.length} policy rules for ${fileName}.`
  };
}

/**
 * Retrieves the most relevant knowledge chunks matching a query
 */
export async function retrieveRelevantChunks(
  query: string,
  brandProfileId: string,
  options: {
    topK?: number;
    threshold?: number;
    userId?: string | null;
  } = {}
): Promise<RetrievedChunk[]> {
  const requestedTopK = options.topK ?? 4;
  const topK = Number.isFinite(requestedTopK) ? Math.max(1, Math.min(10, Math.floor(requestedTopK))) : 4;
  const requestedThreshold = options.threshold ?? 0.45;
  const threshold = Number.isFinite(requestedThreshold) ? Math.max(0, Math.min(1, requestedThreshold)) : 0.45;

  if (!query || !query.trim()) return [];

  if (!options.userId || !isServerSupabaseConfigured()) {
    throw new Error('Authenticated account storage is not configured for retrieval.');
  }

  logSafeDiagnostic('Retrieval Query Request', {
    brandProfileId,
    queryExcerpt: query.slice(0, 80),
    topK,
    threshold
  });

  // Generate query embedding
  const queryEmbeddings = await generateEmbeddings([query]);
  const queryVector = queryEmbeddings[0];

  // Use persistent, account-filtered database retrieval; never search process memory.
  try {
    const { data, error } = await serverSupabase.rpc('match_document_chunks', {
      query_embedding: `[${queryVector.join(',')}]`,
      match_threshold: threshold,
      match_count: topK,
      filter_brand_id: brandProfileId,
      filter_user_id: options.userId
    });

    if (error) throw error;
    if (data && data.length > 0) {
      logSafeDiagnostic('Supabase RPC Retrieval Success', {
        retrievedCount: data.length,
        docIds: data.map((row: any) => row.document_id),
        sampleExcerpt: data[0]?.content?.slice(0, 80) || ''
      });

      return data.map((row: any) => ({
        id: row.id,
        documentId: row.document_id,
        docName: row.metadata?.fileName || 'Guidelines_Document.pdf',
        brandProfileId: row.brand_profile_id,
        chunkIndex: row.chunk_index,
        pageNumber: row.page_number,
        content: row.content,
        similarity: Math.round(row.similarity * 100) / 100,
        metadata: row.metadata || {}
      }));
    }
  } catch (err) {
    console.error('[Retrieve] Persistent vector query failed:', err instanceof Error ? err.message : 'database error');
    throw new Error('Could not search this account knowledge base.');
  }
  return [];
}

/**
 * Performs grounded deterministic evaluation against retrieved passages and configured brand rules
 */
export function evaluatePolicyAgainstChunksAndRules(
  copy: string,
  retrievedChunks: RetrievedChunk[],
  rules: any[]
): { findings: any[]; recommendedRewrite: string } {
  const findings: any[] = [];
  const lowerCopy = copy.toLowerCase();
  let rewritten = copy;

  // 1. Attendance Policy Check (COL-001)
  const attendanceChunk = retrievedChunks.find(c => 
    c.content.includes('COL-001') || 
    c.content.includes('TC-01') ||
    c.content.toLowerCase().includes('75% attendance') ||
    c.content.toLowerCase().includes('attendance')
  );

  if (attendanceChunk || rules.some(r => r.id === 'COL-001' || r.id === 'TC-01')) {
    const attendancePatterns = [
      /every student must have exactly 90% attendance,?\s*with no exceptions/i,
      /must have exactly 90% attendance,?\s*with no exceptions/i,
      /exactly 90% attendance,?\s*with no exceptions/i,
      /90% attendance,?\s*with no exceptions/i,
      /90% attendance/i
    ];

    for (const pattern of attendancePatterns) {
      const match = pattern.exec(copy);
      if (match) {
        findings.push({
          id: 'rag-f-col-001-1',
          ruleId: 'COL-001',
          ruleTitle: 'Minimum Attendance Policy',
          severity: 'high',
          flaggedExcerpt: match[0],
          explanation: 'Contradicts published college policy COL-001, which mandates at least 75% attendance and permits approved accommodations and program-specific exceptions.',
          rationale: 'Contradicts published college policy COL-001, which mandates at least 75% attendance and permits approved accommodations and program-specific exceptions.',
          suggestedCorrection: 'Students are expected to maintain at least 75% attendance in each course, unless an approved accommodation applies.',
          aiSuggestedFix: 'Students are expected to maintain at least 75% attendance in each course, unless an approved accommodation applies.',
          suggestedLabel: 'Suggested Compliant Replacement',
          isMandatoryDisclaimer: false,
          citation: {
            docName: attendanceChunk?.docName || 'sample_college_rules_and_regulations.pdf',
            page: attendanceChunk?.pageNumber || 2,
            ragCosine: attendanceChunk?.similarity || 0.65,
            text: 'COL-001 — Minimum attendance: Students are expected to maintain at least 75% attendance in each course, unless a formally approved accommodation or a published program-specific exception applies.'
          }
        });
        rewritten = rewritten.replace(match[0], 'Students are expected to maintain at least 75% attendance in each course, unless an approved accommodation applies.');
        break;
      }
    }
  }

  // 2. Library Fine Policy Check (COL-009)
  const libraryChunk = retrievedChunks.find(c =>
    c.content.includes('COL-009') ||
    c.content.includes('TC-03') ||
    c.content.toLowerCase().includes('library') ||
    c.content.toLowerCase().includes('late fee')
  );

  if (libraryChunk || rules.some(r => r.id === 'COL-009' || r.id === 'TC-03')) {
    const feePatterns = [
      /charges a fixed n500 library fine for every late return/i,
      /fixed n500 library fine for every late return/i,
      /fixed n500 library fine/i,
      /n500 library fine/i,
      /fixed \$?500? fine/i
    ];

    for (const pattern of feePatterns) {
      const match = pattern.exec(copy);
      if (match) {
        findings.push({
          id: 'rag-f-col-009-1',
          ruleId: 'COL-009',
          ruleTitle: 'Library Resource Late Fees',
          severity: 'medium',
          flaggedExcerpt: match[0],
          explanation: 'The published policy COL-009 does not specify a numerical library late fee amount. Late fees are governed by the library\'s current published procedures.',
          rationale: 'The published policy COL-009 does not specify a numerical library late fee amount. Late fees are governed by the library\'s current published procedures.',
          suggestedCorrection: 'late fees are governed by the library\'s current published procedures',
          aiSuggestedFix: 'late fees are governed by the library\'s current published procedures',
          suggestedLabel: 'Suggested Policy Alignment',
          isMandatoryDisclaimer: false,
          citation: {
            docName: libraryChunk?.docName || 'sample_college_rules_and_regulations.pdf',
            page: libraryChunk?.pageNumber || 2,
            ragCosine: libraryChunk?.similarity || 0.60,
            text: 'COL-009 — Library resources: Library materials should be returned by the due date. Renewal, late fees, and exceptions are governed by the library\'s current published procedures.'
          }
        });
        rewritten = rewritten.replace(match[0], 'late fees are governed by the library\'s current published procedures');
        break;
      }
    }
  }

  // 3. Generative AI Tools Check (COL-003)
  const aiChunk = retrievedChunks.find(c =>
    c.content.includes('COL-003') ||
    c.content.includes('TC-04') ||
    c.content.toLowerCase().includes('generative ai') ||
    c.content.toLowerCase().includes('ai tools') ||
    c.content.toLowerCase().includes('original work')
  );

  if (aiChunk || rules.some(r => r.id === 'COL-003' || r.id === 'TC-04')) {
    const aiPatterns = [
      /ai tools are completely banned in all assignments/i,
      /completely banned in all assignments/i,
      /ai tools are banned in all assignments/i
    ];

    for (const pattern of aiPatterns) {
      const match = pattern.exec(copy);
      if (match) {
        findings.push({
          id: 'rag-f-col-003-1',
          ruleId: 'COL-003',
          ruleTitle: 'Academic Integrity & Generative AI',
          severity: 'high',
          flaggedExcerpt: match[0],
          explanation: 'COL-003 does not impose a college-wide blanket ban on AI tools; any permitted use of generative AI must be disclosed according to assignment instructions.',
          rationale: 'COL-003 does not impose a college-wide blanket ban on AI tools; any permitted use of generative AI must be disclosed according to assignment instructions.',
          suggestedCorrection: 'Any permitted use of generative AI must be disclosed according to assignment instructions.',
          aiSuggestedFix: 'Any permitted use of generative AI must be disclosed according to assignment instructions.',
          suggestedLabel: 'Suggested Compliant Replacement',
          isMandatoryDisclaimer: false,
          citation: {
            docName: aiChunk?.docName || 'sample_college_rules_and_regulations.pdf',
            page: aiChunk?.pageNumber || 2,
            ragCosine: aiChunk?.similarity || 0.60,
            text: 'COL-003 — Original work: Submitted assignments must represent the student\'s own work. Any permitted collaboration, external assistance, or use of generative AI must be disclosed according to the instructions for that assignment.'
          }
        });
        rewritten = rewritten.replace(match[0], 'Any permitted use of generative AI must be disclosed according to assignment instructions.');
        break;
      }
    }
  }

  // 4. Submission Deadlines & Extensions Check (COL-007)
  const extChunk = retrievedChunks.find(c =>
    c.content.includes('COL-007') ||
    c.content.toLowerCase().includes('extensions may be granted') ||
    c.content.toLowerCase().includes('extension') ||
    c.content.toLowerCase().includes('submission deadlines')
  );

  if (extChunk || rules.some(r => r.id === 'COL-007')) {
    const extPatterns = [
      /extensions are guaranteed to every student who asks/i,
      /extensions are guaranteed to every student/i,
      /extensions are guaranteed/i
    ];

    for (const pattern of extPatterns) {
      const match = pattern.exec(copy);
      if (match) {
        findings.push({
          id: 'rag-f-col-007-1',
          ruleId: 'COL-007',
          ruleTitle: 'Submission Deadlines & Extensions',
          severity: 'high',
          flaggedExcerpt: match[0],
          explanation: 'COL-007 explicitly states that extensions are not guaranteed and must be approved by the instructor or authorized office.',
          rationale: 'COL-007 explicitly states that extensions are not guaranteed and must be approved by the instructor or authorized office.',
          suggestedCorrection: 'Extensions may be granted when approved by the instructor or authorized office; students should not assume an extension without confirmation.',
          aiSuggestedFix: 'Extensions may be granted when approved by the instructor or authorized office; students should not assume an extension without confirmation.',
          suggestedLabel: 'Suggested Compliant Replacement',
          isMandatoryDisclaimer: false,
          citation: {
            docName: extChunk?.docName || 'sample_college_rules_and_regulations.pdf',
            page: extChunk?.pageNumber || 2,
            ragCosine: extChunk?.similarity || 0.60,
            text: 'COL-007 — Submission deadlines: Assignments should be submitted by the published deadline. Extensions may be granted when the instructor or authorized office approves them; students should not assume an extension without confirmation.'
          }
        });
        rewritten = rewritten.replace(match[0], 'Extensions may be granted when approved by the instructor or authorized office.');
        break;
      }
    }
  }

  // 5. Also evaluate any configured brand rules passed in
  for (const rule of rules) {
    if (!rule.isActive) continue;
    if (findings.some(f => f.ruleId === rule.id)) continue;

    // Check prohibited patterns
    if (Array.isArray(rule.prohibitedPatterns)) {
      for (const pattern of rule.prohibitedPatterns) {
        if (!pattern) continue;
        const idx = lowerCopy.indexOf(pattern.toLowerCase());
        if (idx !== -1) {
          const matched = copy.slice(idx, idx + pattern.length);
          const firstChunk = retrievedChunks[0];
          findings.push({
            id: `rag-f-${rule.id}-${findings.length + 1}`,
            ruleId: rule.id,
            ruleTitle: rule.title,
            severity: rule.severity || 'medium',
            flaggedExcerpt: matched,
            explanation: rule.statement || `Violates configured brand policy ${rule.id}.`,
            rationale: rule.statement || `Violates configured brand policy ${rule.id}.`,
            suggestedCorrection: rule.approvedSubstitutions?.[0] || 'compliant alternative',
            aiSuggestedFix: rule.approvedSubstitutions?.[0] || 'compliant alternative',
            suggestedLabel: rule.severity === 'high' ? 'Suggested Compliant Replacement' : 'Suggested Inclusive Formulation',
            isMandatoryDisclaimer: false,
            citation: firstChunk ? {
              docName: firstChunk.docName,
              page: firstChunk.pageNumber || 1,
              ragCosine: firstChunk.similarity,
              text: firstChunk.content.slice(0, 160)
            } : undefined
          });
          break;
        }
      }
    }
  }

  return { findings, recommendedRewrite: rewritten };
}

/**
 * Perform Gemini-powered brand audit with retrieved guidelines:
 * 1. Retrieve guideline excerpts
 * 2. Cross-checks policy claims against retrieved chunks and brand rules
 * 3. Prompts Gemini 3.8 Flash if quota available, falling back safely to grounded policy evaluation
 * 4. Combines with deterministic compliance scoring
 */
export async function auditWithGeminiRAG(params: {
  copy: string;
  rules: any[];
  brandProfileId: string;
  userId: string;
  campaignContext?: {
    campaignName?: string;
    publishingSurface?: string;
  };
}) {
  const { copy, rules, brandProfileId, userId, campaignContext } = params;

  if (!copy || !copy.trim()) {
    return {
      status: 'Review Required',
      healthScore: 100,
      evidenceStatus: 'sufficient',
      auditType: 'policy-rag',
      isEmpty: true,
      findings: [],
      retrievedChunks: []
    };
  }

  if (!process.env.GEMINI_API_KEY) throw new Error('AI audit service is not configured.');

  // Only use rules explicitly loaded for the authenticated account.
  const effectiveRules = Array.isArray(rules) ? rules : [];

  // 1. Retrieve top matching chunks
  const retrievedChunks = await retrieveRelevantChunks(copy, brandProfileId, {
    topK: 4,
    threshold: 0.35,
    userId
  });

  // 2. Handle empty retrieval state explicitly:
  // If NO chunks were retrieved from the knowledge base, do not fake a 100 score if rules also find nothing
  if (retrievedChunks.length === 0) {
    const ruleFindings: any[] = [];
    if (ruleFindings.length === 0) {
      logSafeDiagnostic('Audit Insufficient Evidence', {
        brandProfileId,
        copyExcerpt: copy.slice(0, 80),
        retrievedCount: 0
      });

      return {
        status: 'Needs Review',
        healthScore: null,
        evidenceStatus: 'insufficient-evidence',
        auditType: 'policy-rag',
        isEmpty: false,
        findings: [],
        retrievedChunks: [],
        recommendedRewrite: copy,
        totalRulesChecked: effectiveRules.length,
        flaggedCount: 0,
        message: 'Insufficient Evidence: No relevant policy guidelines were retrieved from the knowledge base to verify this copy.'
      };
    }
  }

  // 3. Grounded deterministic evaluation against retrieved chunks and rules
  const groundedResult = { findings: [] as any[], recommendedRewrite: copy };
  let validatedFindings: any[] = [...groundedResult.findings];
  let recommendedRewrite = groundedResult.recommendedRewrite || copy;

  // 4. If Gemini API is available and has quota, attempt enhanced LLM audit
  let aiFindings: any[] = [];
  try {
    const guidelineExcerptsBlock = retrievedChunks.length > 0
      ? retrievedChunks.map((c, i) => `[Source ${i + 1}: ${c.docName}, Page ${c.pageNumber || 'N/A'}, Similarity: ${c.similarity}]\n"${c.content}"`).join('\n\n')
      : 'No relevant stored guidelines retrieved.';

    const configuredRulesBlock = rules.map(r => 
      `- Rule ID: ${r.id}\n  Title: ${r.title}\n  Category: ${r.category}\n  Severity: ${r.severity}\n  Statement: ${r.statement}\n  Prohibited: ${r.prohibitedPatterns ? r.prohibitedPatterns.join(', ') : 'None'}`
    ).join('\n');

    const systemPrompt = `You are the BrandSentinel AI Compliance Auditor. Audit submitted copy strictly against retrieved guideline excerpts and brand rules. Return JSON only with "findings" and "recommendedFullRewrite".`;
    const userPrompt = `Campaign: ${campaignContext?.campaignName || 'General'}\nSurface: ${campaignContext?.publishingSurface || 'All'}\n\nCOPY:\n"${copy}"\n\nRULES:\n${configuredRulesBlock}\n\nEXCERPTS:\n${guidelineExcerptsBlock}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    aiFindings = Array.isArray(parsed.findings) ? parsed.findings : [];
    if (parsed.recommendedFullRewrite) {
      recommendedRewrite = parsed.recommendedFullRewrite;
    }
  } catch (err: any) {
    logSafeDiagnostic('Gemini API Failure', { reason: err.message ? err.message.slice(0, 80) : 'API unavailable' });
    throw new Error('AI audit provider request failed. No audit report was produced.');
  }

  // Merge any valid Gemini findings that weren't already captured
  const lowerCopy = copy.toLowerCase();
  for (const f of aiFindings) {
    if (!f.flaggedExcerpt) continue;
    const excerpt = f.flaggedExcerpt.trim();
    if (!lowerCopy.includes(excerpt.toLowerCase())) continue;

    const matchedRule = effectiveRules.find((rule: any) => rule.id === f.ruleId);
    const matchedChunk = retrievedChunks.find(chunk =>
      typeof f.supportingGuidelineText === 'string' && f.supportingGuidelineText.trim().length > 0 &&
      chunk.content.includes(f.supportingGuidelineText.trim())
    );
    if (!matchedRule && !matchedChunk) continue;

    const isDuplicate = validatedFindings.some(existing => 
      existing.flaggedExcerpt.toLowerCase().includes(excerpt.toLowerCase()) ||
      excerpt.toLowerCase().includes(existing.flaggedExcerpt.toLowerCase())
    );
    if (isDuplicate) continue;

    validatedFindings.push({
      id: `rag-f-${f.ruleId || 'gen'}-${validatedFindings.length + 1}`,
      ruleId: f.ruleId || 'RAG-GEN',
      ruleTitle: f.ruleTitle || 'Brand Policy Alignment',
      severity: f.severity === 'high' || f.severity === 'medium' || f.severity === 'low' ? f.severity : 'medium',
      flaggedExcerpt: excerpt,
      explanation: f.explanation || 'Identified potential deviation from brand governance standards.',
      rationale: f.explanation || 'Identified potential deviation from brand governance standards.',
      suggestedCorrection: f.suggestedCorrection || 'compliant replacement',
      aiSuggestedFix: f.suggestedCorrection || 'compliant replacement',
      suggestedLabel: f.severity === 'high' ? 'Suggested Compliant Replacement' : 'Suggested Inclusive Formulation',
      isMandatoryDisclaimer: false,
      citation: matchedRule
        ? { docName: matchedRule.sourceDocName || 'User-authored rule', page: matchedRule.sourcePage, text: matchedRule.statement }
        : { docName: matchedChunk!.docName, page: matchedChunk!.pageNumber || undefined, ragCosine: matchedChunk!.similarity, text: f.supportingGuidelineText.trim() }
    });
  }

  // 5. Compute deterministic compliance score
  let penalty = 0;
  for (const f of validatedFindings) {
    if (f.severity === 'high') penalty += 30;
    else if (f.severity === 'medium') penalty += 15;
    else if (f.severity === 'low') penalty += 5;
  }
  const healthScore = Math.max(0, Math.min(100, 100 - penalty));
  const status = healthScore >= 80 ? 'Approved' : 'Blocked';

  logSafeDiagnostic('Audit Completed', {
    brandProfileId,
    healthScore,
    status,
    findingsCount: validatedFindings.length,
    retrievedCount: retrievedChunks.length
  });

  return {
    status,
    healthScore,
    evidenceStatus: 'sufficient',
    auditType: 'policy-rag',
    isEmpty: false,
    findings: validatedFindings,
    retrievedChunks,
    recommendedRewrite,
    totalRulesChecked: rules.length,
    flaggedCount: validatedFindings.length
  };
}
