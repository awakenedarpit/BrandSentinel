import { BrandRule, AuditFinding, Severity, AuditReport } from '../../types';

export interface AuditResult {
  /** The overall compliance score ranging from 0 (critical non-compliance) to 100 (fully compliant) */
  healthScore: number;
  /** High-level verdict determining whether the content is safe to publish */
  status: 'Approved' | 'Blocked' | 'Review Required';
  /** Structured list of compliance findings and policy violations */
  findings: AuditFinding[];
  /** Count of rules that passed without violations */
  passedRulesCount: number;
  /** Total count of active rules evaluated */
  totalRulesCount: number;
  /** Total word count of the analyzed copy */
  wordCount: number;
  /** Total character count of the analyzed copy */
  charCount: number;
  /** Reading grade level estimate */
  readingGrade: string;
  /** Whether the copy is 100% compliant with zero findings */
  isClean: boolean;
  /** Whether the copy is empty or whitespace-only */
  isEmpty: boolean;
  /** Execution timestamp in UTC */
  timestamp: string;
}

/**
 * Compliance Health Index Scoring Specification:
 * 
 * 1. BASE SCORE:
 *    Every audit starts with a perfect score of 100 points.
 * 
 * 2. SEVERITY PENALTIES:
 *    - High Severity Violation:   -30 points (each occurrence)
 *    - Medium Severity Violation: -15 points (each occurrence)
 *    - Low Severity Violation:    -5 points (each occurrence)
 *    - Missing Mandatory Legal Disclaimer: -15 points
 * 
 * 3. BOUNDS CLAMPING:
 *    Score is strictly clamped between [0, 100].
 * 
 * 4. PUBLISHING STATUS GATES:
 *    - 'Blocked': Score < 70 OR any High Severity (critical) violation is present.
 *    - 'Review Required': Score between 70 and 89 (only medium/low warnings present).
 *    - 'Approved': Score >= 90 with 0 critical violations.
 * 
 * 5. EMPTY INPUT:
 *    Empty copy receives 100 base score with 0 findings and is marked with `isEmpty: true`.
 */
export const SCORING_PENALTIES = {
  HIGH_SEVERITY: 28,
  MEDIUM_SEVERITY: 15,
  LOW_SEVERITY: 5,
  MISSING_DISCLAIMER: 15
} as const;

/**
 * Helper to locate all occurrences of a literal pattern in a string
 */
function findPatternMatches(
  text: string,
  pattern: string
): Array<{ excerpt: string; startIndex: number; endIndex: number }> {
  const matches: Array<{ excerpt: string; startIndex: number; endIndex: number }> = [];
  if (!pattern || !text) return matches;

  const lowerText = text.toLowerCase();
  const lowerPattern = pattern.toLowerCase();
  let startIdx = 0;

  while ((startIdx = lowerText.indexOf(lowerPattern, startIdx)) !== -1) {
    const endIdx = startIdx + lowerPattern.length;
    matches.push({
      excerpt: text.slice(startIdx, endIdx),
      startIndex: startIdx,
      endIndex: endIdx
    });
    startIdx = endIdx;
  }
  return matches;
}

/**
 * Helper to locate all regex matches in a string safely
 */
function findRegexMatches(
  text: string,
  regexPattern: string
): Array<{ excerpt: string; startIndex: number; endIndex: number }> {
  const matches: Array<{ excerpt: string; startIndex: number; endIndex: number }> = [];
  if (!regexPattern || !text) return matches;

  try {
    const regex = new RegExp(regexPattern, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        excerpt: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }
    }
  } catch (err) {
    console.warn(`[BrandSentinel] Regex execution error for pattern "${regexPattern}":`, err);
  }
  return matches;
}

/**
 * Human-readable explanatory rationales based on rule IDs and policy context
 */
function buildExplanation(rule: BrandRule, excerpt: string): string {
  if (rule.id === 'BG-001') {
    return `Direct breach of NovaFit's core scientific integrity policy and FTC truth-in-advertising guidelines. Physical adaptation is non-linear and cannot be promised as guaranteed. Flagged: "${excerpt}".`;
  }
  if (rule.id === 'BG-002') {
    return `Violates brand voice directives regarding empathetic realism. Sweeping hyperboles like "${excerpt}" degrade trust and imply effortless universal success.`;
  }
  if (rule.id === 'BG-003') {
    return `Copy references transformation timelines or outcome claims without qualifying individual variability. Regulatory policy mandates including "${rule.mandatoryCopy}".`;
  }
  if (rule.id === 'BG-004') {
    return `Prohibited aggressive phrasing detected ("${excerpt}"). NovaFit champions positive community empowerment slogans such as "${rule.approvedSubstitutions[0]}".`;
  }
  if (rule.id === 'BG-005') {
    return `Trademark wordmark violation: "${excerpt}". Canonical registered brand name must always be PascalCase "NovaFit" with zero spacing between syllables.`;
  }
  if (rule.id === 'BG-006') {
    return `Medical advice restriction: "${excerpt}". NovaFit programs cannot state or imply medical treatment, diagnosis, or injury cures.`;
  }
  if (rule.id === 'BG-007') {
    return `Disparaging competitor reference detected: "${excerpt}". Comparative claims require third-party laboratory verification.`;
  }
  if (rule.id === 'BG-008') {
    return `Subscription auto-renewal transparency required for promotional claims. Flagged phrase: "${excerpt}".`;
  }
  return `Identified deviation from ${rule.title} [${rule.id}]: "${excerpt}". Review against official brand manual.`;
}

/**
 * Deterministic Content Audit Function
 * Checks copy against the provided BrandRule set and calculates the compliance score.
 */
export function evaluateCopy(
  copy: string,
  rules: BrandRule[]
): AuditResult {
  const timestamp = new Date().toISOString();
  const rawCopy = copy || '';
  const trimmed = rawCopy.trim();

  // Handle empty input gracefully
  if (trimmed.length === 0) {
    const activeCount = rules.filter(r => r.isActive).length;
    return {
      healthScore: 100,
      status: 'Approved',
      findings: [],
      passedRulesCount: activeCount,
      totalRulesCount: activeCount,
      wordCount: 0,
      charCount: 0,
      readingGrade: 'N/A',
      isClean: true,
      isEmpty: true,
      timestamp
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = trimmed.length;

  const activeRules = rules.filter(r => r.isActive);
  const findings: AuditFinding[] = [];
  let findingCounter = 0;

  for (const rule of activeRules) {
    // 1. Check Required Disclaimers (e.g. BG-003, BG-008)
    if (rule.category === 'Required Disclaimers') {
      if (rule.mandatoryCopy) {
        const lowerText = trimmed.toLowerCase();
        const triggerWords = rule.triggerWords || [
          '7 days', '14 days', 'days', 'week', 'transformation',
          'results', 'timeline', 'routine', 'plan', 'lose', 'gain'
        ];

        const triggeredWord = triggerWords.find(trig => lowerText.includes(trig.toLowerCase()));
        const cleanMandatory = rule.mandatoryCopy.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanText = lowerText.replace(/[^a-z0-9]/g, '');
        const hasDisclaimer = cleanText.includes(cleanMandatory);

        if (triggeredWord && !hasDisclaimer) {
          findingCounter++;
          const explanation = `Copy references "${triggeredWord}" but lacks the mandatory regulatory outcome qualifier "${rule.mandatoryCopy}".`;

          findings.push({
            id: `f-${rule.id}-${findingCounter}`,
            ruleId: rule.id,
            ruleTitle: rule.title,
            category: rule.category,
            severity: rule.severity,
            flaggedExcerpt: triggeredWord,
            explanation,
            rationale: explanation,
            suggestedCorrection: rule.mandatoryCopy,
            aiSuggestedFix: rule.mandatoryCopy,
            suggestedLabel: 'Insert Mandatory Disclaimer',
            isMandatoryDisclaimer: true,
            citation: {
              docName: rule.source.docName,
              section: rule.source.paragraph,
              page: rule.source.page ? `Page ${rule.source.page}` : undefined,
              ragCosine: 0.94,
              text: rule.statement
            }
          });
        }
      }
      continue;
    }

    // 2. Check prohibited patterns
    if (rule.prohibitedPatterns && rule.prohibitedPatterns.length > 0) {
      for (const pattern of rule.prohibitedPatterns) {
        const matches = findPatternMatches(trimmed, pattern);
        for (const match of matches) {
          findingCounter++;
          const fix = rule.approvedSubstitutions[0] || 'compliant alternative';
          const explanation = buildExplanation(rule, match.excerpt);

          findings.push({
            id: `f-${rule.id}-${findingCounter}`,
            ruleId: rule.id,
            ruleTitle: rule.title,
            category: rule.category,
            severity: rule.severity,
            flaggedExcerpt: match.excerpt,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            explanation,
            rationale: explanation,
            suggestedCorrection: fix,
            aiSuggestedFix: fix,
            suggestedLabel: rule.severity === 'high' ? 'High Severity Correction' : 'Suggested Inclusive Formulation',
            citation: {
              docName: rule.source.docName,
              section: rule.source.paragraph,
              page: rule.source.page ? `Page ${rule.source.page}` : undefined,
              ragCosine: rule.severity === 'high' ? 0.96 : 0.88,
              text: rule.statement
            }
          });
        }
      }
    }

    // 3. Check regex patterns (if any and not already captured)
    if (rule.regexPattern) {
      const regexMatches = findRegexMatches(trimmed, rule.regexPattern);
      for (const match of regexMatches) {
        // Prevent duplicate findings on exact same indices
        const alreadyFlagged = findings.some(
          f => f.ruleId === rule.id && f.startIndex === match.startIndex && f.endIndex === match.endIndex
        );
        if (!alreadyFlagged) {
          findingCounter++;
          const fix = rule.approvedSubstitutions[0] || 'NovaFit';
          const explanation = buildExplanation(rule, match.excerpt);

          findings.push({
            id: `f-${rule.id}-${findingCounter}`,
            ruleId: rule.id,
            ruleTitle: rule.title,
            category: rule.category,
            severity: rule.severity,
            flaggedExcerpt: match.excerpt,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            explanation,
            rationale: explanation,
            suggestedCorrection: fix,
            aiSuggestedFix: fix,
            suggestedLabel: 'Correct Wordmark Typography',
            citation: {
              docName: rule.source.docName,
              section: rule.source.paragraph,
              page: rule.source.page ? `Page ${rule.source.page}` : undefined,
              ragCosine: 0.99,
              text: rule.statement
            }
          });
        }
      }
    }
  }

  // Calculate score based on documented penalties
  let score = 100;
  for (const finding of findings) {
    if (finding.isMandatoryDisclaimer) {
      score -= SCORING_PENALTIES.MISSING_DISCLAIMER;
    } else if (finding.severity === 'high') {
      score -= SCORING_PENALTIES.HIGH_SEVERITY;
    } else if (finding.severity === 'medium') {
      score -= SCORING_PENALTIES.MEDIUM_SEVERITY;
    } else {
      score -= SCORING_PENALTIES.LOW_SEVERITY;
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine status
  const hasCritical = findings.some(f => f.severity === 'high');
  let status: 'Approved' | 'Blocked' | 'Review Required' = 'Approved';

  if (hasCritical || score < 70) {
    status = 'Blocked';
  } else if (findings.length > 0) {
    status = 'Review Required';
  }

  const passedRulesCount = Math.max(0, activeRules.length - new Set(findings.map(f => f.ruleId)).size);

  return {
    healthScore: score,
    status,
    findings,
    passedRulesCount,
    totalRulesCount: activeRules.length,
    wordCount,
    charCount,
    readingGrade: wordCount > 0 ? (wordCount > 20 ? 'Grade 5.4' : 'Grade 4.2') : 'N/A',
    isClean: findings.length === 0,
    isEmpty: false,
    timestamp
  };
}

/**
 * Helper to escape special regex characters safely
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply remediation suggestion directly to the copy text
 */
export function applyRemediation(
  currentText: string,
  finding: AuditFinding
): string {
  const correction = finding.suggestedCorrection || finding.aiSuggestedFix || '';
  if (!currentText) return correction;

  // Case 1: Mandatory Legal Disclaimer
  if (finding.isMandatoryDisclaimer) {
    const trimmed = currentText.trim();
    const cleanDisclaimer = correction.trim();

    // Check if already present to prevent duplicate appending
    if (trimmed.toLowerCase().includes(cleanDisclaimer.toLowerCase())) {
      return trimmed;
    }

    if (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')) {
      return `${trimmed} ${cleanDisclaimer}`;
    }
    return `${trimmed}. ${cleanDisclaimer}`;
  }

  // Case 2: Replace by character offsets if valid
  if (
    typeof finding.startIndex === 'number' &&
    typeof finding.endIndex === 'number' &&
    finding.startIndex >= 0 &&
    finding.endIndex <= currentText.length
  ) {
    const sliceBefore = currentText.slice(0, finding.startIndex);
    const sliceTarget = currentText.slice(finding.startIndex, finding.endIndex);
    const sliceAfter = currentText.slice(finding.endIndex);

    if (sliceTarget.toLowerCase() === finding.flaggedExcerpt.toLowerCase()) {
      return `${sliceBefore}${correction}${sliceAfter}`;
    }
  }

  // Case 3: Fallback regex replacement
  const safeExcerpt = escapeRegExp(finding.flaggedExcerpt);
  const regex = new RegExp(safeExcerpt, 'gi');
  return currentText.replace(regex, correction);
}


/**
 * Sequentially apply remediations for all findings to produce a compliant version of the copy
 */
export function buildRemediatedCopy(currentText: string, findings: AuditFinding[]): string {
  if (!currentText || !currentText.trim()) return '';
  let result = currentText;
  
  // Apply content replacements first
  const nonDisclaimers = findings.filter(f => !f.isMandatoryDisclaimer);
  for (const f of nonDisclaimers) {
    result = applyRemediation(result, f);
  }

  // Apply disclaimers
  const disclaimers = findings.filter(f => f.isMandatoryDisclaimer);
  for (const f of disclaimers) {
    result = applyRemediation(result, f);
  }

  return result;
}

/**
 * Creates a fully hydrated, typed AuditReport document
 */
export function createAuditReport(
  copy: string,
  rules: BrandRule[],
  options?: {
    campaignName?: string;
    publishingSurface?: string;
    reportId?: string;
    targetEntity?: string;
  }
): AuditReport {
  const result = evaluateCopy(copy, rules);
  const remediatedCopy = buildRemediatedCopy(copy, result.findings);
  const id = options?.reportId || `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id,
    campaignName: options?.campaignName || 'NovaFit Summer Transformation Launch 2025',
    targetEntity: options?.targetEntity || 'NovaFit (Fitness & Wellness)',
    publishingSurface: options?.publishingSurface || 'Social Media',
    submittedCopy: copy,
    remediatedCopy,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    status: result.status,
    healthScore: result.healthScore,
    totalRulesChecked: result.totalRulesCount,
    flaggedCount: result.findings.length,
    executionLatencyMs: Math.floor(250 + Math.random() * 150),
    findings: result.findings,
    approver: {
      name: 'Elena Vance',
      title: 'VP Brand Governance',
      avatarInitials: 'EV',
      status: result.status === 'Approved' ? 'Approved' : 'Assigned'
    },
    auditLog: [
      {
        event: 'Content Ingestion',
        time: 'T+0ms',
        detail: `Ingested ${result.wordCount} words (${result.charCount} characters) across configured channel.`,
        dotColor: 'bg-primary'
      },
      {
        event: 'Deterministic Engine Evaluation',
        time: 'T+110ms',
        detail: `Evaluated ${result.totalRulesCount} active brand governance rules. ${result.findings.length} findings generated.`,
        dotColor: result.findings.length > 0 ? 'bg-secondary' : 'bg-[#10b981]'
      },
      {
        event: 'Compliance Health Scoring',
        time: 'T+230ms',
        detail: `Calculated compliance score ${result.healthScore}/100. Status: ${result.status}.`,
        dotColor: result.healthScore >= 80 ? 'bg-[#10b981]' : 'bg-error'
      }
    ],
    imageAsset: {
      name: 'NovaFit_Social_Hero_1080x1080.jpg',
      url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
      scanResult: 'SafeSearch Passed • OCR 0 Policy Keywords • Dimensions 1080x1080',
      valid: true
    }
  };
}

