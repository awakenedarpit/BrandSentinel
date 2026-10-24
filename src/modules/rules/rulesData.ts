import { BrandRule, BrandProfile } from '../../types';

export const novaFitBrandProfile: BrandProfile = {
  name: 'NovaFit',
  tagline: 'Fitness & Wellness Governance',
  industry: 'Health, Wellness & Connected Fitness',
  voicePersona: ['Encouraging', 'Realistic', 'Inclusive'],
  activeVersion: 'v2.8 (Synced)',
  primaryContact: {
    name: 'Elena Vance',
    title: 'VP Brand Governance',
    email: 'elena.vance@novafit.internal'
  }
};

export const initialBrandRules: BrandRule[] = [
  {
    id: 'BG-001',
    title: 'Prohibited Absolute Claims',
    category: 'Marketing Claims',
    severity: 'high',
    isActive: true,
    statement: 'Never promise guaranteed results under any circumstance. Fitness adaptations are individual and non-linear.',
    source: {
      docName: 'NovaFit_Compliance_Manual_2025.pdf',
      page: 14,
      paragraph: 'Section 3.2',
      type: 'pdf'
    },
    prohibitedPatterns: [
      'guaranteed results',
      'guaranteed weight loss',
      '100% foolproof',
      'guaranteed success',
      'instant results'
    ],
    approvedSubstitutions: [
      'sustainable progress',
      'proven methodology',
      'consistent habits',
      'adaptable coaching'
    ],
    enforcedChannels: ['Social Media', 'Paid Ads', 'Emails', 'Landing Pages'],
    stats: {
      cleanScans: 340,
      softWarns: 0,
      autoCorrections: 128
    }
  },
  {
    id: 'BG-002',
    title: 'Brand Voice Realism & Universality',
    category: 'Brand Voice',
    severity: 'medium',
    isActive: true,
    statement: "Use encouraging language without unrealistic promises. Avoid hyperbolic generalizations like 'works for everyone'.",
    source: {
      docName: 'NovaFit_Voice_Tone_Guide.pdf',
      page: 8,
      paragraph: 'Paragraph 3',
      type: 'pdf'
    },
    prohibitedPatterns: [
      'works for everyone',
      'effortless transformation',
      'instant fitness',
      'suitable for all without exception',
      'zero effort'
    ],
    approvedSubstitutions: [
      'adaptable for all fitness journeys',
      'meet your personal goals',
      'designed for every level'
    ],
    enforcedChannels: ['Blog Posts', 'Video Captions', 'Newsletters', 'Social Media'],
    stats: {
      cleanScans: 412,
      softWarns: 14,
      autoCorrections: 32
    }
  },
  {
    id: 'BG-003',
    title: 'Mandatory Outcome Disclaimer',
    category: 'Required Disclaimers',
    severity: 'medium',
    isActive: true,
    statement: "Include 'Results vary by individual' wherever any personal transformation, routine, or timeline is stated in marketing messages.",
    source: {
      docName: 'NovaFit_Compliance_Manual_2025.pdf',
      page: 22,
      paragraph: 'Legal Mandate v3',
      type: 'manual'
    },
    prohibitedPatterns: [
      'in 7 days',
      'within 14 days',
      'overnight transformation',
      'rapid burn'
    ],
    approvedSubstitutions: [
      'first week milestones',
      'consistent routine',
      'progressive training'
    ],
    triggerWords: [
      '7 days',
      '14 days',
      'in 7 days',
      'in 14 days',
      'days',
      'week',
      'transformation',
      'results',
      'timeline',
      'routine',
      'plan'
    ],
    mandatoryCopy: 'Results vary by individual.',
    placementRequirement: 'Minimum 9pt font or visible for at least 3 consecutive seconds in video content.',
    enforcedChannels: ['Testimonials', 'Paid Reels', 'Meta Carousels', 'Landing Pages'],
    stats: {
      cleanScans: 890,
      softWarns: 4,
      autoCorrections: 82
    }
  },
  {
    id: 'BG-004',
    title: 'Community Empowerment Taglines',
    category: 'Approved & Prohibited Phrases',
    severity: 'low',
    isActive: true,
    statement: "Reinforce community empowerment with approved slogans: 'Progress Over Perfection', 'Your Pace, Your Power'.",
    source: {
      docName: 'NovaFit_Brand_Deck.pdf',
      page: 2,
      type: 'pdf'
    },
    prohibitedPatterns: [
      'pain is weakness leaving the body',
      'no excuses ever',
      'beast mode only'
    ],
    approvedSubstitutions: [
      'Progress Over Perfection',
      'Your Pace, Your Power'
    ],
    enforcedChannels: ['Push Notifications', 'Billboards', 'Brand Collateral', 'Social Media'],
    stats: {
      cleanScans: 1205,
      softWarns: 0,
      autoCorrections: 0
    }
  },
  {
    id: 'BG-005',
    title: 'Brand Wordmark & CamelCase Typography',
    category: 'Terminology',
    severity: 'high',
    isActive: true,
    statement: "Always spell 'NovaFit' as a single CamelCase word with capital N and capital F. Never write 'Nova Fit' or 'novafit'.",
    source: {
      docName: 'NovaFit_Compliance_Manual_2025.pdf',
      page: 4,
      paragraph: 'Trademark Serial #9842109',
      type: 'manual'
    },
    prohibitedPatterns: [
      'Nova Fit',
      'novafit',
      'Nova-Fit',
      'NOVAFIT'
    ],
    approvedSubstitutions: [
      'NovaFit'
    ],
    regexPattern: '\\b(Nova\\s+Fit|novafit|Nova-Fit)\\b',
    enforcedChannels: ['All Marketing & Legal Touchpoints (Universal Guardrail)'],
    stats: {
      cleanScans: 3100,
      softWarns: 0,
      autoCorrections: 1290
    }
  },
  {
    id: 'BG-006',
    title: 'Medical & Therapeutic Advice Restriction',
    category: 'Marketing Claims',
    severity: 'high',
    isActive: true,
    statement: 'Never state or imply that NovaFit programs treat, cure, or diagnose any medical illness or injury.',
    source: {
      docName: 'NovaFit_Compliance_Manual_2025.pdf',
      page: 18,
      type: 'pdf'
    },
    prohibitedPatterns: ['cures chronic pain', 'replaces physical therapy', 'doctor approved cure'],
    approvedSubstitutions: ['supports active wellness', 'consult with a healthcare professional'],
    enforcedChannels: ['Paid Ads', 'Email', 'Landing Page'],
    stats: { cleanScans: 280, softWarns: 0, autoCorrections: 14 }
  },
  {
    id: 'BG-007',
    title: 'Competitor Defamation & Comparative Claims',
    category: 'Marketing Claims',
    severity: 'high',
    isActive: true,
    statement: 'Avoid naming competitors disparagingly without substantiated third-party verified lab tests.',
    source: {
      docName: 'NovaFit_Compliance_Manual_2025.pdf',
      page: 30,
      type: 'manual'
    },
    prohibitedPatterns: ['better than Peloton in every way', 'destroys ordinary gym apps'],
    approvedSubstitutions: ['stands out through personalized community coaching'],
    enforcedChannels: ['Social Media', 'Paid Ads'],
    stats: { cleanScans: 190, softWarns: 0, autoCorrections: 0 }
  },
  {
    id: 'BG-008',
    title: 'Subscription Auto-Renewal Transparency',
    category: 'Required Disclaimers',
    severity: 'high',
    isActive: true,
    statement: 'Any promotional discount price must state the renewal rate clearly beside the CTA.',
    source: {
      docName: 'NovaFit_Compliance_Manual_2025.pdf',
      page: 45,
      type: 'template'
    },
    prohibitedPatterns: ['free forever without conditions'],
    approvedSubstitutions: ['renews at standard monthly rate after initial period'],
    enforcedChannels: ['Landing Pages', 'Paid Ads'],
    stats: { cleanScans: 540, softWarns: 0, autoCorrections: 4 }
  }
];
