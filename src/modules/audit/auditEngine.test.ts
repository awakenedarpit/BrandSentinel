import { describe, it, expect } from 'vitest';
import { evaluateCopy, applyRemediation, SCORING_PENALTIES } from './auditEngine';
import { initialBrandRules } from '../rules/rulesData';
import { BrandRule } from '../../types';

describe('BrandSentinel Deterministic Content Audit Engine', () => {
  it('correctly audits empty input without errors', () => {
    const result = evaluateCopy('', initialBrandRules);
    expect(result.healthScore).toBe(100);
    expect(result.status).toBe('Approved');
    expect(result.findings).toHaveLength(0);
    expect(result.isEmpty).toBe(true);
    expect(result.wordCount).toBe(0);
    expect(result.charCount).toBe(0);
  });

  it('correctly audits whitespace-only input without errors', () => {
    const result = evaluateCopy('   \n\t  ', initialBrandRules);
    expect(result.healthScore).toBe(100);
    expect(result.status).toBe('Approved');
    expect(result.findings).toHaveLength(0);
    expect(result.isEmpty).toBe(true);
  });

  it('detects prohibited absolute claims (BG-001)', () => {
    const copy = 'Try our plan for guaranteed results!';
    const result = evaluateCopy(copy, initialBrandRules);

    const bg001 = result.findings.find(f => f.ruleId === 'BG-001');
    expect(bg001).toBeDefined();
    expect(bg001?.severity).toBe('high');
    expect(bg001?.flaggedExcerpt.toLowerCase()).toBe('guaranteed results');
    expect(bg001?.suggestedCorrection).toBe('sustainable progress');
    expect(bg001?.explanation).toContain('scientific integrity');
    // High severity must block publishing
    expect(result.status).toBe('Blocked');
    expect(result.healthScore).toBeLessThanOrEqual(70);
  });

  it('detects universal overpromises (BG-002)', () => {
    const copy = 'This daily workout works for everyone.';
    const result = evaluateCopy(copy, initialBrandRules);

    const bg002 = result.findings.find(f => f.ruleId === 'BG-002');
    expect(bg002).toBeDefined();
    expect(bg002?.severity).toBe('medium');
    expect(bg002?.flaggedExcerpt.toLowerCase()).toBe('works for everyone');
    expect(bg002?.suggestedCorrection).toBe('adaptable for all fitness journeys');
  });

  it('detects omission of mandatory regulatory disclaimer (BG-003)', () => {
    // Mentions timeline "in 7 days" but omits "Results vary by individual."
    const copy = 'Experience real transformation in 7 days.';
    const result = evaluateCopy(copy, initialBrandRules);

    const bg003 = result.findings.find(f => f.ruleId === 'BG-003');
    expect(bg003).toBeDefined();
    expect(bg003?.isMandatoryDisclaimer).toBe(true);
    expect(bg003?.suggestedCorrection).toBe('Results vary by individual.');
  });

  it('does NOT flag BG-003 when mandatory disclaimer is present', () => {
    const copy = 'Experience real transformation in 7 days. Results vary by individual.';
    const result = evaluateCopy(copy, initialBrandRules);

    const bg003 = result.findings.find(f => f.ruleId === 'BG-003');
    expect(bg003).toBeUndefined();
  });

  it('detects trademark brand mark violations (BG-005)', () => {
    const copyWithSpace = 'Welcome to Nova Fit coaching.';
    const resultWithSpace = evaluateCopy(copyWithSpace, initialBrandRules);
    const bg005Space = resultWithSpace.findings.find(f => f.ruleId === 'BG-005');
    expect(bg005Space).toBeDefined();
    expect(bg005Space?.suggestedCorrection).toBe('NovaFit');

    const copyLowercase = 'Visit novafit today for workouts.';
    const resultLowercase = evaluateCopy(copyLowercase, initialBrandRules);
    const bg005Lower = resultLowercase.findings.find(f => f.ruleId === 'BG-005');
    expect(bg005Lower).toBeDefined();
  });

  it('evaluates Scenario A with accurate score and multiple violations', () => {
    const scenarioACopy = 'Get guaranteed results in 7 days! This plan works for everyone.';
    const result = evaluateCopy(scenarioACopy, initialBrandRules);

    // Should flag BG-001 ("guaranteed results"), BG-002 ("works for everyone"), and BG-003 (missing disclaimer)
    expect(result.findings.some(f => f.ruleId === 'BG-001')).toBe(true);
    expect(result.findings.some(f => f.ruleId === 'BG-002')).toBe(true);
    expect(result.findings.some(f => f.ruleId === 'BG-003')).toBe(true);

    // High severity must block publishing
    expect(result.status).toBe('Blocked');
    // Score calculation: 100 - 28 (BG-001) - 15 (BG-002) - 15 (BG-003) = 42
    expect(result.healthScore).toBe(42);
  });

  it('evaluates compliant Scenario B with high score and zero violations', () => {
    const scenarioBCopy = 'Achieve progressive, sustainable results through consistent training. This program is designed to adapt to your personal pace. Results vary by individual. Regular exercise and balanced nutrition required.';
    const result = evaluateCopy(scenarioBCopy, initialBrandRules);

    expect(result.findings).toHaveLength(0);
    expect(result.healthScore).toBe(100);
    expect(result.status).toBe('Approved');
    expect(result.isClean).toBe(true);
  });

  it('applies suggested corrections correctly to copy text', () => {
    const originalText = 'Get guaranteed results in 7 days!';
    const result = evaluateCopy(originalText, initialBrandRules);
    const bg001 = result.findings.find(f => f.ruleId === 'BG-001')!;

    const remediated = applyRemediation(originalText, bg001);
    expect(remediated).toBe('Get sustainable progress in 7 days!');
    expect(remediated).not.toContain('guaranteed results');
  });

  it('appends mandatory disclaimer with proper punctuation and spacing', () => {
    const originalText = 'Transform your fitness routine';
    const finding = {
      id: 'f-test',
      ruleId: 'BG-003',
      ruleTitle: 'Disclaimer',
      category: 'Required Disclaimers' as const,
      severity: 'medium' as const,
      flaggedExcerpt: 'routine',
      explanation: 'Missing disclaimer',
      rationale: 'Missing disclaimer',
      suggestedCorrection: 'Results vary by individual.',
      aiSuggestedFix: 'Results vary by individual.',
      suggestedLabel: 'Insert Disclaimer',
      citation: { docName: 'Manual', text: 'Rule', ragCosine: 0.9 },
      isMandatoryDisclaimer: true
    };

    const updated = applyRemediation(originalText, finding);
    expect(updated).toBe('Transform your fitness routine. Results vary by individual.');
  });

  it('does not duplicate disclaimer if already present', () => {
    const textWithDisclaimer = 'Our routine works well. Results vary by individual.';
    const finding = {
      id: 'f-test',
      ruleId: 'BG-003',
      ruleTitle: 'Disclaimer',
      category: 'Required Disclaimers' as const,
      severity: 'medium' as const,
      flaggedExcerpt: 'routine',
      explanation: 'Missing disclaimer',
      rationale: 'Missing disclaimer',
      suggestedCorrection: 'Results vary by individual.',
      aiSuggestedFix: 'Results vary by individual.',
      suggestedLabel: 'Insert Disclaimer',
      citation: { docName: 'Manual', text: 'Rule', ragCosine: 0.9 },
      isMandatoryDisclaimer: true
    };

    const result = applyRemediation(textWithDisclaimer, finding);
    expect(result).toBe(textWithDisclaimer);
  });

  it('respects inactive rules when toggled off', () => {
    // Disable BG-001
    const modifiedRules: BrandRule[] = initialBrandRules.map(r => 
      r.id === 'BG-001' ? { ...r, isActive: false } : r
    );

    const copy = 'We promise guaranteed results in your training.';
    const result = evaluateCopy(copy, modifiedRules);

    // BG-001 should NOT be flagged
    expect(result.findings.some(f => f.ruleId === 'BG-001')).toBe(false);
  });

  it('handles malformed regex without crashing the audit engine', () => {
    const ruleWithBadRegex: BrandRule = {
      id: 'BG-BAD',
      title: 'Bad Regex Rule',
      category: 'Marketing Claims',
      severity: 'medium',
      isActive: true,
      statement: 'Test',
      source: { docName: 'Test', type: 'manual' },
      prohibitedPatterns: [],
      approvedSubstitutions: [],
      enforcedChannels: ['Social Media'],
      regexPattern: '[(+*?invalid regex'
    };

    const copy = 'Normal marketing text';
    expect(() => evaluateCopy(copy, [ruleWithBadRegex])).not.toThrow();
  });
});
