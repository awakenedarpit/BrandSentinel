import { BrandRule, AuditFinding } from '../../types';
import { evaluateCopy, AuditResult } from '../audit/auditEngine';

export interface AIServiceConfig {
  model: 'gemini-3.8-flash' | 'gemini-2.5-flash' | 'local-deterministic';
  useServerRAG: boolean;
  endpointUrl?: string;
}

export const defaultAIConfig: AIServiceConfig = {
  model: 'gemini-3.8-flash',
  useServerRAG: true,
  endpointUrl: '/api/audit-rag'
};

export interface RAGAuditResponse extends Omit<AuditResult, 'healthScore'> {
  healthScore: number | null;
  evidenceStatus?: 'sufficient' | 'insufficient-evidence';
  auditType?: 'policy-rag' | 'content-rules';
  message?: string;
  retrievedChunks?: Array<{
    id: string;
    documentId: string;
    docName: string;
    pageNumber: number | null;
    content: string;
    similarity: number;
  }>;
  recommendedRewrite?: string;
  isAiAudited?: boolean;
}

/**
 * Audits marketing copy using the secure server-side Gemini + RAG pipeline.
 * Transparently falls back to local deterministic rule evaluation if server is unreachable.
 */
export async function auditTextWithAI(
  copy: string,
  rules: BrandRule[],
  campaignContext?: {
    campaignName?: string;
    publishingSurface?: string;
  }
): Promise<RAGAuditResponse> {
  if (!copy || !copy.trim()) {
    return {
      ...evaluateCopy(copy, rules),
      evidenceStatus: 'sufficient',
      auditType: 'policy-rag'
    };
  }

  try {
    const res = await fetch('/api/audit-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        copy,
        rules,
        brandProfileId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        campaignContext
      })
    });

    if (res.ok) {
      const data = await res.json();
      const localCounts = evaluateCopy(copy, rules);

      return {
        ...localCounts,
        status: data.status || localCounts.status,
        healthScore: data.healthScore !== undefined ? data.healthScore : localCounts.healthScore,
        evidenceStatus: data.evidenceStatus || 'sufficient',
        auditType: data.auditType || 'policy-rag',
        message: data.message,
        isEmpty: data.isEmpty !== undefined ? data.isEmpty : false,
        findings: Array.isArray(data.findings) ? data.findings : localCounts.findings,
        retrievedChunks: data.retrievedChunks || [],
        recommendedRewrite: data.recommendedRewrite,
        isAiAudited: true
      };
    }
  } catch (err) {
    console.warn('[AI Service] Server RAG endpoint unreachable, falling back to local engine:', err);
  }

  // Fallback to local deterministic evaluation
  const localResult = evaluateCopy(copy, rules);
  return {
    ...localResult,
    evidenceStatus: 'sufficient',
    auditType: 'content-rules',
    isAiAudited: false
  };
}

/**
 * Uploads and extracts a document via server-side ingestion
 */
export async function ingestDocumentFile(file: File): Promise<{
  success: boolean;
  documentId?: string;
  chunkCount?: number;
  rulesExtracted?: number;
  message: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Content = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.md') ? 'MD' : 'TXT',
            fileSize: `${Math.round(file.size / 1024)} KB`,
            base64Content,
            brandProfileId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
            description: `Uploaded ${file.name} for brand compliance grounding.`
          })
        });

        const data = await res.json();
        if (res.ok) {
          resolve({
            success: true,
            documentId: data.documentId,
            chunkCount: data.chunkCount,
            rulesExtracted: data.rulesExtracted,
            message: data.message
          });
        } else {
          resolve({
            success: false,
            message: data.error || 'Failed to ingest document.'
          });
        }
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate compliant rewrite suggestion
 */
export function getRecommendedRewrite(copy: string, findings: AuditFinding[]): string {
  let result = copy;
  
  // Replace prohibited absolutes
  if (result.includes('guaranteed results')) {
    result = result.replace(/guaranteed results/gi, 'sustainable, personalized results');
  }
  
  // Replace timeframe if needed
  if (result.includes('in 7 days')) {
    result = result.replace(/in 7 days/gi, 'in your first week');
  }

  // Replace universality
  if (result.includes('works for everyone')) {
    result = result.replace(/works for everyone/gi, 'designed for all fitness levels');
  }

  // Append disclaimer if missing
  const needsDisclaimer = findings.some(f => f.isMandatoryDisclaimer);
  if (needsDisclaimer && !result.toLowerCase().includes('results vary by individual')) {
    result = result.trim();
    if (!result.endsWith('.')) result += '.';
    result += ' Results vary by individual.';
  }

  return result;
}
