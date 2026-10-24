import { AuditReport } from '../../types';

export const demoScenarioA = {
  id: 'SCENARIO-A',
  title: 'Scenario A (Non-Compliant)',
  campaignName: 'NovaFit Summer Transformation Launch 2025',
  publishingSurface: 'Social Media',
  policySet: 'SOCIAL_COMMERCIAL_V2',
  copy: 'Get guaranteed results in 7 days! This plan works for everyone.',
  score: 42,
  status: 'Blocked' as const,
  violationsCount: 2,
  verdictTitle: 'Publishing Blocked',
  verdictSubtitle: '2 severe policy violations must be addressed before this copy can be scheduled or exported.'
};

export const demoScenarioB = {
  id: 'SCENARIO-B',
  title: 'Scenario B (Compliant)',
  campaignName: 'NovaFit Summer Transformation Launch 2025',
  publishingSurface: 'Social Media',
  policySet: 'SOCIAL_COMMERCIAL_V2',
  copy: 'Achieve progressive, sustainable results through consistent training. This program is designed to adapt to your personal pace.\n\n*Results vary by individual. Regular exercise and balanced nutrition required.',
  score: 98,
  status: 'Approved' as const,
  violationsCount: 0,
  verdictTitle: 'Publishing Approved',
  verdictSubtitle: '100% compliant with NovaFit v2.8 Brand Manual and FTC commercial guidance.'
};

export const demoAuditReport2025: AuditReport = {
  id: '#AUD-2025-0894',
  campaignName: 'NovaFit Summer Transformation Campaign — Instagram Feed Ad',
  targetEntity: 'NovaFit (Fitness & Wellness)',
  publishingSurface: 'Paid Social (Meta Feed)',
  submittedCopy: 'Get guaranteed results in 7 days! This plan works for everyone.',
  remediatedCopy: 'Get sustainable, personalized results in your first week. Designed for all fitness levels. Results vary by individual.',
  timestamp: 'May 24, 2025 at 14:32:08 UTC',
  status: 'Blocked',
  healthScore: 42,
  totalRulesChecked: 24,
  flaggedCount: 3,
  executionLatencyMs: 412,
  imageAsset: {
    name: 'nova_summer_promo_1080x1080.jpg',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU8om7yVTejvbXEc_gmMP2HwSEkkMIc79etucKM-KKAdW9yz9U1xhpx7BpsbMfugnUI3gXIWYIL43mKx3QacjcehNC21MPg3zpBUkkK_s_ufxrGyCXbNhhMCjxNba9gjWboUG8EnF6PoSOH8r8LU3zklTC-061VjvQaJ4cp38r_xo4NSXFK7BiSDNqW2rTU3QW3olo29bzL6PU2Tlop3kzLnWys7Kl6_taAJaNxDMr',
    scanResult: 'Computer Vision Scan: 0 OCR anomalies detected • Color profile compliant with NovaFit Violet/Navy palette',
    valid: true
  },
  approver: {
    name: 'Elena Vance',
    title: 'VP Brand Governance',
    avatarInitials: 'EV',
    status: 'Assigned'
  },
  findings: [
    {
      ruleId: 'BG-001',
      ruleTitle: 'Prohibited Absolute Claim Violation',
      severity: 'high',
      flaggedExcerpt: 'guaranteed results',
      rationale: "Direct breach of NovaFit's core scientific integrity policy and FTC marketing truth regulations. Fitness outcomes are intrinsically dependent on non-deterministic physiological variables.",
      citation: {
        docName: 'NovaFit_Brand_Compliance_Manual_2025.pdf',
        section: 'Section 3.2',
        page: 'Page 14',
        ragCosine: 0.96,
        text: 'NovaFit communications must never promise guaranteed results or specific outcome timelines. Physical fitness adaptations differ by metabolic and lifestyle factors.'
      },
      aiSuggestedFix: 'Get sustainable, personalized results in your first week',
      suggestedLabel: 'Suggested AI Compliant Replacement'
    },
    {
      ruleId: 'BG-002',
      ruleTitle: 'Overpromising Universality vs Inclusive Voice',
      severity: 'medium',
      flaggedExcerpt: 'works for everyone',
      rationale: 'Violates tone guidelines regarding empathetic realism. Sweeping generalizations degrade brand trust and exclude individuals with differing athletic baselines.',
      citation: {
        docName: 'NovaFit_Brand_Guidelines_Voice_Tone.pdf',
        page: 'Page 8, Paragraph 3',
        ragCosine: 0.88,
        text: 'Use encouraging, realistic, and inclusive language. Avoid hyperbolic generalizations that imply effortless universal success.'
      },
      aiSuggestedFix: 'designed for all fitness levels',
      suggestedLabel: 'Suggested Inclusive Formulation'
    },
    {
      ruleId: 'BG-003',
      ruleTitle: 'Omission of Mandatory Regulatory Disclaimer',
      severity: 'medium',
      flaggedExcerpt: 'in 7 days',
      rationale: 'Campaign mentions a specific duration ("7 days") alongside physical transformation claims without providing the mandatory legal outcome variability qualifier.',
      citation: {
        docName: 'NovaFit_Compliance_Manual_2025.pdf',
        page: 'Page 22',
        section: 'Legal Mandate v3',
        ragCosine: 0.94,
        text: 'Include "Results vary by individual" wherever any personal transformation, routine, or timeline is stated in marketing messages.'
      },
      aiSuggestedFix: 'Results vary by individual.',
      suggestedLabel: 'Mandatory Disclaimer Insertion',
      isMandatoryDisclaimer: true
    }
  ],
  auditLog: [
    {
      event: 'Audit Engine Completed',
      time: '14:32:08 UTC',
      detail: 'BrandSentinel v3.2 flagged 2 rules and 1 missing disclaimer',
      dotColor: 'bg-primary'
    },
    {
      event: 'Vector Chunks Grounded',
      time: '14:32:07 UTC',
      detail: 'Cross-referenced 3 knowledge chunks in novafit-primary-v2',
      dotColor: 'bg-secondary-container'
    },
    {
      event: 'Creative Ingested',
      time: '14:32:04 UTC',
      detail: 'Payload submitted by Marcus Chen via Meta Ads API sync',
      dotColor: 'bg-outline-variant'
    }
  ]
};

export const pastAuditHistory: AuditReport[] = [
  demoAuditReport2025,
  {
    id: '#AUD-2025-0893',
    campaignName: 'Hydration SmartBottle Launch Email',
    targetEntity: 'NovaFit (Fitness & Wellness)',
    publishingSurface: 'Email Newsletter',
    submittedCopy: 'Rehydrate with precision tracking. Progress Over Perfection with every sip.',
    remediatedCopy: 'Rehydrate with precision tracking. Progress Over Perfection with every sip.',
    timestamp: 'May 23, 2025 at 18:14:22 UTC',
    status: 'Approved',
    healthScore: 100,
    totalRulesChecked: 24,
    flaggedCount: 0,
    executionLatencyMs: 298,
    approver: {
      name: 'Elena Vance',
      title: 'VP Brand Governance',
      avatarInitials: 'EV',
      status: 'Approved'
    },
    findings: [],
    auditLog: [
      {
        event: 'Auto-Approved',
        time: '18:14:22 UTC',
        detail: 'Zero policy flags detected',
        dotColor: 'bg-[#10b981]'
      }
    ]
  },
  {
    id: '#AUD-2025-0891',
    campaignName: 'Summer Cardio Bootcamp Influencer Brief',
    targetEntity: 'NovaFit (Fitness & Wellness)',
    publishingSurface: 'Influencer Brief',
    submittedCopy: 'Join Nova Fit athletes for an extreme shred session.',
    remediatedCopy: 'Join NovaFit athletes for an energized community training session.',
    timestamp: 'May 22, 2025 at 11:05:40 UTC',
    status: 'Review Required',
    healthScore: 78,
    totalRulesChecked: 24,
    flaggedCount: 1,
    executionLatencyMs: 340,
    approver: {
      name: 'Elena Vance',
      title: 'VP Brand Governance',
      avatarInitials: 'EV',
      status: 'Pending'
    },
    findings: [
      {
        ruleId: 'BG-005',
        ruleTitle: 'Wordmark Spelling Violation',
        severity: 'high',
        flaggedExcerpt: 'Nova Fit',
        rationale: "Disallowed space between syllables. Trademark canonical form is 'NovaFit'.",
        citation: {
          docName: 'NovaFit_Compliance_Manual_2025.pdf',
          page: 'Page 4',
          ragCosine: 0.99,
          text: "Always spell 'NovaFit' as a single CamelCase word with capital N and capital F."
        },
        aiSuggestedFix: 'NovaFit',
        suggestedLabel: 'Correct Trademark'
      }
    ],
    auditLog: [
      {
        event: 'Review Dispatched',
        time: '11:05:40 UTC',
        detail: 'Sent to Elena Vance for trademark spelling review',
        dotColor: 'bg-[#f59e0b]'
      }
    ]
  },
  {
    id: '#AUD-2025-0888',
    campaignName: 'Q2 Performance Nutrition Landing Page',
    targetEntity: 'NovaFit (Fitness & Wellness)',
    publishingSurface: 'Landing Page',
    submittedCopy: 'Fuel your active recovery with plant-based protein. Results vary by individual.',
    remediatedCopy: 'Fuel your active recovery with plant-based protein. Results vary by individual.',
    timestamp: 'May 20, 2025 at 09:12:15 UTC',
    status: 'Approved',
    healthScore: 96,
    totalRulesChecked: 24,
    flaggedCount: 0,
    executionLatencyMs: 310,
    approver: {
      name: 'Elena Vance',
      title: 'VP Brand Governance',
      avatarInitials: 'EV',
      status: 'Approved'
    },
    findings: [],
    auditLog: [
      {
        event: 'Published',
        time: '09:12:15 UTC',
        detail: 'Compliance certification signed',
        dotColor: 'bg-[#10b981]'
      }
    ]
  }
];
