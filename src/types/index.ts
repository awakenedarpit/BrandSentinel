export type Severity = 'high' | 'medium' | 'low';

export type PolicyCategory = 
  | 'Brand Voice'
  | 'Marketing Claims'
  | 'Approved & Prohibited Phrases'
  | 'Required Disclaimers'
  | 'Terminology';

export interface BrandRule {
  id: string; // e.g. BG-001
  title: string;
  category: PolicyCategory;
  severity: Severity;
  isActive: boolean;
  statement: string;
  source: {
    docName: string;
    page?: number;
    paragraph?: string;
    type: 'pdf' | 'manual' | 'template';
  };
  prohibitedPatterns: string[];
  approvedSubstitutions: string[];
  enforcedChannels: string[];
  triggerWords?: string[]; // trigger words that invoke a mandatory disclaimer check
  stats?: {
    cleanScans?: number;
    softWarns?: number;
    autoCorrections?: number;
  };
  mandatoryCopy?: string;
  regexPattern?: string;
  placementRequirement?: string;
}

export interface AuditFinding {
  id?: string; // unique stable finding ID, e.g. 'f-BG-001-0'
  ruleId: string;
  ruleTitle: string;
  category?: PolicyCategory;
  severity: Severity;
  flaggedExcerpt: string;
  startIndex?: number;
  endIndex?: number;
  explanation?: string;
  rationale: string; // alias for explanation
  suggestedCorrection?: string;
  aiSuggestedFix: string; // alias for suggestedCorrection
  suggestedLabel: string;
  citation: {
    docName: string;
    section?: string;
    page?: string;
    ragCosine: number;
    text: string;
  };
  isMandatoryDisclaimer?: boolean;
  isFalsePositive?: boolean;
  isApplied?: boolean;
}

export interface AuditReport {
  id: string; // e.g. #AUD-2025-0894
  campaignName: string;
  targetEntity: string;
  publishingSurface: string;
  submittedCopy: string;
  remediatedCopy: string;
  timestamp: string;
  status: 'Approved' | 'Blocked' | 'Review Required';
  healthScore: number;
  totalRulesChecked: number;
  flaggedCount: number;
  executionLatencyMs: number;
  findings: AuditFinding[];
  approver: {
    name: string;
    title: string;
    avatarInitials: string;
    status: 'Assigned' | 'Pending' | 'Approved';
  };
  auditLog: Array<{
    event: string;
    time: string;
    detail: string;
    dotColor: string;
  }>;
  imageAsset?: {
    name: string;
    url: string;
    scanResult: string;
    valid: boolean;
  };
}

export interface KnowledgeDoc {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'DOCX' | 'MD' | 'TXT';
  fileSize: string;
  rulesExtracted: number;
  vectorIndex: string;
  status: 'Synced' | 'Indexing' | 'Draft' | 'Pending' | 'Processing' | 'Completed' | 'Failed';
  lastIndexed: string;
  chunksCount: number;
  description: string;
}

export interface BrandProfile {
  name: string;
  tagline: string;
  industry: string;
  voicePersona: string[];
  activeVersion: string;
  primaryContact: {
    name: string;
    title: string;
    email: string;
  };
}
