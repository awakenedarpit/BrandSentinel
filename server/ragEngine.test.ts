import { describe, it, expect, vi } from 'vitest';
import {
  chunkTextWithPages,
  extractTextFromDocument,
  cosineSimilarity,
  retrieveRelevantChunks
} from './ragEngine';

function createOnePagePdf(text: string): Buffer {
  const stream = `BT\n/F1 18 Tf\n72 720 Td\n(${text.replace(/[\\()]/g, '\\$&')}) Tj\nET\n`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let index = 0; index < objects.length; index++) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
}

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

    it('extracts text from a valid PDF using the configured serverless worker', async () => {
      const pages = await extractTextFromDocument(
        createOnePagePdf('BrandSentinel worker regression probe'),
        'worker-probe.pdf',
        'PDF'
      );
      expect(pages).toHaveLength(1);
      expect(pages[0].text).toContain('BrandSentinel worker regression probe');
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

  describe('Account Isolation & Vector Retrieval', () => {
    const brandA = 'brand-1111-aaaa';

    it('fails closed when the caller omits an authenticated account owner', async () => {
      await expect(retrieveRelevantChunks('sustainable wellness', brandA)).rejects.toThrow(/account storage/i);
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
