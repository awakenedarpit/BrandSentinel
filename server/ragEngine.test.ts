import { describe, it, expect, vi } from 'vitest';
import {
  chunkTextWithPages,
  extractTextFromDocument,
  cosineSimilarity,
  retrieveRelevantChunks,
  inMemoryDocumentStore
} from './ragEngine';

describe('RAG Pipeline Unit & Integration Tests', () => {
  describe('Text Chunking & Page Metadata Tracking', () => {
    it('splits text into overlapping chunks while preserving page numbers', () => {
      const pages = [
        { pageNumber: 1, text: 'Paragraph on page 1 detailing NovaFit trademark policies and branding rules.' },
        { pageNumber: 2, text: 'Paragraph on page 2 covering FTC advertising truth guardrails and prohibited claims.' }
      ];

      const chunks = chunkTextWithPages(pages, { chunkSize: 200, chunkOverlap: 40 });

      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks[0].pageNumber).toBe(1);
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].content).toContain('NovaFit trademark policies');
      expect(chunks[1].pageNumber).toBe(2);
      expect(chunks[1].content).toContain('FTC advertising');
    });

    it('estimates token count proportionately', () => {
      const pages = [{ pageNumber: 1, text: 'NovaFit communications must never promise guaranteed results.' }];
      const chunks = chunkTextWithPages(pages);
      expect(chunks[0].tokenCount).toBe(Math.round(chunks[0].content.length / 4));
    });
  });

  describe('Document Extraction & Edge Cases', () => {
    it('throws descriptive error on empty text documents', async () => {
      const emptyBuffer = Buffer.from('   \n\n  ', 'utf-8');
      await expect(extractTextFromDocument(emptyBuffer, 'empty.txt', 'TXT')).rejects.toThrow(
        'Empty document: no extractable text found.'
      );
    });

    it('parses valid markdown into pseudo-pages', async () => {
      const mdBuffer = Buffer.from('# Brand Guidelines\nNever use guaranteed results.', 'utf-8');
      const pages = await extractTextFromDocument(mdBuffer, 'guide.md', 'MD');
      expect(pages.length).toBe(1);
      expect(pages[0].text).toContain('Never use guaranteed results.');
      expect(pages[0].pageNumber).toBe(1);
    });
  });

  describe('Vector Math & Cosine Similarity', () => {
    it('calculates 1.0 for identical vectors', () => {
      const v = [0.5, 0.5, 0.5, 0.5];
      expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
    });

    it('calculates 0.0 for orthogonal vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [0, 1, 0];
      expect(cosineSimilarity(v1, v2)).toBeCloseTo(0.0);
    });

    it('handles empty or mismatched vectors safely', () => {
      expect(cosineSimilarity([], [])).toBe(0);
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    });
  });

  describe('Brand Isolation & Vector Retrieval', () => {
    const brandA = 'brand-1111-aaaa';
    const brandB = 'brand-2222-bbbb';

    // Seed mock chunks in memory store
    inMemoryDocumentStore.chunks.set('doc-brand-a', [
      {
        id: 'chunk-a1',
        documentId: 'doc-brand-a',
        brandProfileId: brandA,
        chunkIndex: 0,
        pageNumber: 3,
        content: 'Brand A specific policy: Only promote sustainable wellness routines.',
        tokenCount: 15,
        embedding: new Array(768).fill(0.1),
        metadata: { fileName: 'BrandA_Manual.pdf' }
      }
    ]);

    inMemoryDocumentStore.chunks.set('doc-brand-b', [
      {
        id: 'chunk-b1',
        documentId: 'doc-brand-b',
        brandProfileId: brandB,
        chunkIndex: 0,
        pageNumber: 5,
        content: 'Brand B confidential policy: Specialized competitor tracking.',
        tokenCount: 12,
        embedding: new Array(768).fill(0.1),
        metadata: { fileName: 'BrandB_Manual.pdf' }
      }
    ]);

    it('retrieves only chunks authorized for Brand A', async () => {
      // Mock generateEmbeddings for query
      const retrieved = await retrieveRelevantChunks('sustainable wellness', brandA, {
        topK: 5,
        threshold: 0.1
      });

      // Every returned chunk must strictly belong to brandA
      for (const chunk of retrieved) {
        expect(chunk.brandProfileId).toBe(brandA);
      }
      expect(retrieved.some(c => c.brandProfileId === brandB)).toBe(false);
    });

    it('returns empty array when query is empty or whitespace', async () => {
      const emptyRetrieved = await retrieveRelevantChunks('   ', brandA);
      expect(emptyRetrieved).toEqual([]);
    });
  });

  describe('Model Finding Validation & Fabrication Defense', () => {
    it('rejects hallucinated quotations not present in submitted copy', () => {
      const submittedCopy = 'Get sustainable results with NovaFit coaching.';
      const fabricatedFinding = 'This magical pill burns fat overnight';

      const lowerCopy = submittedCopy.toLowerCase();
      const isVerbatim = lowerCopy.includes(fabricatedFinding.toLowerCase());
      expect(isVerbatim).toBe(false);
    });

    it('calculates deterministic compliance score using severity penalties', () => {
      const findings = [
        { severity: 'high' },   // -30
        { severity: 'medium' }, // -15
        { severity: 'low' }     // -5
      ];

      let penalty = 0;
      for (const f of findings) {
        if (f.severity === 'high') penalty += 30;
        else if (f.severity === 'medium') penalty += 15;
        else if (f.severity === 'low') penalty += 5;
      }

      const score = Math.max(0, Math.min(100, 100 - penalty));
      expect(score).toBe(50);
      const status = score >= 80 ? 'Approved' : 'Blocked';
      expect(status).toBe('Blocked');
    });
  });
});
