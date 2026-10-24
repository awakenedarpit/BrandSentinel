import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import {
  extractTextFromDocument,
  extractRulesFromDocumentText,
  chunkTextWithPages,
  ingestDocument,
  retrieveRelevantChunks,
  auditWithGeminiRAG,
  inMemoryDocumentStore
} from './ragEngine';

const SAMPLE_PDF_PATH = '/Users/user/Downloads/sample_college_rules_and_regulations.pdf';
const BRAND_PROFILE_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

describe('College Policy Rule Extraction & RAG Pipeline Regression Tests', () => {
  let pdfBuffer: Buffer;

  beforeAll(async () => {
    expect(fs.existsSync(SAMPLE_PDF_PATH)).toBe(true);
    pdfBuffer = fs.readFileSync(SAMPLE_PDF_PATH);

    // Ingest the sample PDF into the RAG engine
    await ingestDocument({
      id: 'doc-college-test',
      fileName: 'sample_college_rules_and_regulations.pdf',
      fileType: 'PDF',
      fileSize: `${Math.round(pdfBuffer.length / 1024)} KB`,
      buffer: pdfBuffer,
      brandProfileId: BRAND_PROFILE_ID,
      description: 'Sample Student Handbook for BrandSentinel AI Testing'
    });
  });

  // Test 1: Ingest sample college PDF and verify extracted text and rule extraction
  describe('1. PDF Rule Extraction & Verification', () => {
    it('extracts text from all pages and verifies presence of 75% attendance rule and COL-001', async () => {
      const pages = await extractTextFromDocument(pdfBuffer, 'sample_college_rules_and_regulations.pdf', 'PDF');
      
      expect(pages.length).toBe(4);
      const fullText = pages.map(p => p.text).join('\n\n');

      // Check explicit keywords from sample college PDF
      expect(fullText).toContain('COL-001');
      expect(fullText).toContain('75% attendance');
      expect(fullText).toContain('approved accommodation');
      expect(fullText).toContain('COL-009');
      expect(fullText).toContain('Library materials should be returned by the due date');
    });

    it('extracts structured brand policy rules (COL-001 through COL-014)', async () => {
      const pages = await extractTextFromDocument(pdfBuffer, 'sample_college_rules_and_regulations.pdf', 'PDF');
      const rules = extractRulesFromDocumentText(pages, 'sample_college_rules_and_regulations.pdf');

      expect(rules.length).toBeGreaterThanOrEqual(14);

      // Verify COL-001 minimum attendance
      const col001 = rules.find(r => r.id === 'COL-001');
      expect(col001).toBeDefined();
      expect(col001?.title).toBe('Minimum attendance');
      expect(col001?.statement).toContain('75% attendance');
      expect(col001?.severity).toBe('high');
      expect(col001?.prohibitedPatterns).toContain('90% attendance');

      // Verify COL-003 academic integrity & generative AI
      const col003 = rules.find(r => r.id === 'COL-003');
      expect(col003).toBeDefined();
      expect(col003?.title).toBe('Original work');
      expect(col003?.statement).toContain('generative AI must be disclosed');

      // Verify COL-007 deadlines & extensions
      const col007 = rules.find(r => r.id === 'COL-007');
      expect(col007).toBeDefined();
      expect(col007?.title).toBe('Submission deadlines');
      expect(col007?.statement).toContain('Extensions may be granted when the instructor or authorized office approves');

      // Verify COL-009 library resources
      const col009 = rules.find(r => r.id === 'COL-009');
      expect(col009).toBeDefined();
      expect(col009?.title).toBe('Library resources');
      expect(col009?.statement).toContain('governed by the library\'s current published procedures');
    });

    it('creates semantic chunks with valid page numbers and document ID', () => {
      const chunks = inMemoryDocumentStore.chunks.get('doc-college-test');
      expect(chunks).toBeDefined();
      expect(chunks!.length).toBeGreaterThan(0);

      for (const chunk of chunks!) {
        expect(chunk.content.trim().length).toBeGreaterThan(0);
        expect(chunk.brandProfileId).toBe(BRAND_PROFILE_ID);
        expect(chunk.documentId).toBe('doc-college-test');
        expect(chunk.embedding.length).toBe(768);
      }
    });
  });

  // Test 2: Query the attendance rule and verify the correct source passage is retrieved
  describe('2. Vector Retrieval & Passage Grounding', () => {
    it('retrieves COL-001 source passage when querying attendance expectation', async () => {
      const chunks = await retrieveRelevantChunks(
        'What is the attendance expectation, and what exceptions are mentioned?',
        BRAND_PROFILE_ID,
        { topK: 3 }
      );

      expect(chunks.length).toBeGreaterThan(0);
      const topChunk = chunks[0];
      expect(topChunk.content).toContain('COL-001');
      expect(topChunk.content).toContain('75% attendance');
      expect(topChunk.similarity).toBeGreaterThan(0.5);
    });
  });

  // Test 3: Ask for the exact library late fee and verify the system does not invent an amount
  describe('3. Unstated Fee Grounding (TC-03)', () => {
    it('retrieves COL-009 / TC-03 and confirms no numerical fee amount is specified', async () => {
      const chunks = await retrieveRelevantChunks(
        'Does the policy specify the exact library late fee amount?',
        BRAND_PROFILE_ID,
        { topK: 5 }
      );

      expect(chunks.length).toBeGreaterThan(0);
      const libraryChunk = chunks.find(c =>
        c.content.includes('COL-009') ||
        c.content.includes('TC-03') ||
        c.content.toLowerCase().includes('library late fee') ||
        c.content.toLowerCase().includes('library materials')
      );
      expect(libraryChunk).toBeDefined();

      // Ensure the authoritative guideline does NOT specify a numerical fine like $50 or n500
      expect(libraryChunk?.content).not.toMatch(/\$50/);
      expect(libraryChunk?.content).not.toMatch(/n500/i);
      
      const mentionsPolicy = libraryChunk?.content.includes('governed by the library\'s current published procedures') ||
        libraryChunk?.content.includes('does not specify a numerical library late fee');
      expect(mentionsPolicy).toBe(true);
    });
  });

  // Test 4: Audit text claiming 90% attendance with no exceptions and verify finding cites COL-001
  describe('4. Policy Violation Audit & Grounded Findings', () => {
    it('audits sample copy and identifies all policy contradictions with proper citations and score reduction', async () => {
      const sampleCopy =
        'Every student must have exactly 90% attendance, with no exceptions. The college charges a fixed n500 library fine for every late return. AI tools are completely banned in all assignments. Extensions are guaranteed to every student who asks.';

      const result = await auditWithGeminiRAG({
        copy: sampleCopy,
        rules: [],
        brandProfileId: BRAND_PROFILE_ID
      });

      // Must be Blocked with reduced health score
      expect(result.status).toBe('Blocked');
      expect(result.healthScore).toBeLessThan(70);
      expect(result.evidenceStatus).toBe('sufficient');

      // Verify attendance finding specifically cites COL-001
      const attendanceFinding = result.findings.find(f => f.ruleId === 'COL-001');
      expect(attendanceFinding).toBeDefined();
      expect(attendanceFinding?.severity).toBe('high');
      expect(attendanceFinding?.flaggedExcerpt).toContain('90% attendance');
      expect(attendanceFinding?.explanation).toContain('COL-001');
      expect(attendanceFinding?.citation.text).toContain('75% attendance');

      // Verify library fine finding specifically cites COL-009
      const libraryFinding = result.findings.find(f => f.ruleId === 'COL-009');
      expect(libraryFinding).toBeDefined();
      expect(libraryFinding?.flaggedExcerpt).toContain('fixed n500 library fine');
      expect(libraryFinding?.explanation).toContain('does not specify a numerical library late fee amount');

      // Verify AI tool finding specifically cites COL-003
      const aiFinding = result.findings.find(f => f.ruleId === 'COL-003');
      expect(aiFinding).toBeDefined();
      expect(aiFinding?.flaggedExcerpt).toContain('AI tools are completely banned in all assignments');

      // Verify extension finding specifically cites COL-007
      const extFinding = result.findings.find(f => f.ruleId === 'COL-007');
      expect(extFinding).toBeDefined();
      expect(extFinding?.flaggedExcerpt).toContain('Extensions are guaranteed to every student who asks');
    });
  });

  // Test 5: Simulate empty retrieval and verify UI does not incorrectly claim all policies are satisfied
  describe('5. Empty Retrieval & Insufficient Evidence Safeguard', () => {
    it('returns insufficient-evidence state instead of default 100 health when no relevant guidelines match', async () => {
      const unrelatedCopy = 'Our campus robotics club won first place at the annual regional drone symposium.';

      // Query with an unknown/empty brand where no chunks match
      const result = await auditWithGeminiRAG({
        copy: unrelatedCopy,
        rules: [],
        brandProfileId: 'brand-with-no-documents-0000'
      });

      expect(result.status).toBe('Needs Review');
      expect(result.healthScore).toBeNull();
      expect(result.evidenceStatus).toBe('insufficient-evidence');
      expect(result.findings.length).toBe(0);
      expect(result.message).toContain('Insufficient Evidence');
    });
  });
});
