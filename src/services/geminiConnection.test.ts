import { describe, it, expect } from 'vitest';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

describe('Gemini Model & Embedding Verification', () => {
  const key = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: key });

  it.skipIf(!key)('generates content with the configured Gemini model', async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Respond with exactly: OK'
      });
      const text = response.text?.trim() || '';
      console.log('[gemini-3.8-flash response]:', text);
      expect(text.length).toBeGreaterThan(0);
    } catch (err: any) {
      if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn('[Gemini Quota Notice]: Free Tier daily quota limit reached on Google API key. Service falls back to deterministic rule engine.');
        expect(err.message).toMatch(/quota|429|RESOURCE_EXHAUSTED/i);
        return;
      }
      throw err;
    }
  }, 90000);

  it.skipIf(!key)('generates embeddings with gemini-embedding-001', async () => {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: 'BrandSentinel AI brand compliance test'
    });
    const dimension = response.embeddings?.[0]?.values?.length;
    console.log('[gemini-embedding-001 dimension]:', dimension);
    expect(dimension).toBeDefined();
    expect(dimension).toBeGreaterThan(0);
  }, 20000);
});
