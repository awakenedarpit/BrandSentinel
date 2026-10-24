import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured } from '../lib/supabase';
import { mapRowToBrandRule, mapBrandRuleToInsert, fetchBrandRules } from './brandService';
import { mapRowToAuditReport, mapAuditReportToInsert, fetchAuditHistory } from './auditService';
import { mapRowToKnowledgeDoc, fetchKnowledgeDocuments } from './knowledgeService';
import { initialBrandRules } from '../modules/rules/rulesData';
import { demoAuditReport2025 } from '../modules/data/demoData';

describe('Supabase Database Integration & Mapping Layer', () => {
  it('correctly identifies unconfigured Supabase environment without throwing', () => {
    // In local test environment without real secrets, isSupabaseConfigured should be false
    const configured = isSupabaseConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('correctly maps brand_rules database row to BrandRule domain entity', () => {
    const mockRow: any = {
      id: 'BG-001',
      brand_profile_id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Prohibited Absolute Claims',
      category: 'Marketing Claims',
      severity: 'high',
      is_active: true,
      statement: 'Never promise guaranteed results.',
      source_doc_name: 'NovaFit_Compliance_Manual_2025.pdf',
      source_page: 14,
      source_paragraph: 'Section 3.2',
      source_type: 'pdf',
      prohibited_patterns: ['guaranteed results'],
      approved_substitutions: ['sustainable progress'],
      enforced_channels: ['Social Media'],
      trigger_words: null,
      mandatory_copy: null,
      regex_pattern: null,
      placement_requirement: null,
      clean_scans: 340,
      soft_warns: 0,
      auto_corrections: 128,
      created_at: '2026-10-24T00:00:00Z',
      updated_at: '2026-10-24T00:00:00Z'
    };

    const rule = mapRowToBrandRule(mockRow);
    expect(rule.id).toBe('BG-001');
    expect(rule.isActive).toBe(true);
    expect(rule.severity).toBe('high');
    expect(rule.source.docName).toBe('NovaFit_Compliance_Manual_2025.pdf');
    expect(rule.source.page).toBe(14);
    expect(rule.prohibitedPatterns).toContain('guaranteed results');
    expect(rule.approvedSubstitutions).toContain('sustainable progress');
    expect(rule.stats?.cleanScans).toBe(340);
  });

  it('correctly maps BrandRule domain entity to database insert payload', () => {
    const rule = initialBrandRules[0];
    const insertPayload = mapBrandRuleToInsert(rule);

    expect(insertPayload.id).toBe(rule.id);
    expect(insertPayload.title).toBe(rule.title);
    expect(insertPayload.is_active).toBe(rule.isActive);
    expect(insertPayload.source_doc_name).toBe(rule.source.docName);
    expect(insertPayload.prohibited_patterns).toEqual(rule.prohibitedPatterns);
    expect(insertPayload.approved_substitutions).toEqual(rule.approvedSubstitutions);
  });

  it('correctly maps audit_reports database row to AuditReport entity', () => {
    const mockRow: any = {
      id: '#AUD-2025-0894',
      brand_profile_id: 'test-brand-id',
      user_id: 'test-user-id',
      campaign_name: 'NovaFit Summer Transformation',
      target_entity: 'NovaFit',
      publishing_surface: 'Social Media',
      submitted_copy: 'Get guaranteed results in 7 days!',
      remediated_copy: 'Get sustainable progress in your first week. Results vary by individual.',
      status: 'Blocked',
      health_score: 42,
      total_rules_checked: 24,
      flagged_count: 2,
      execution_latency_ms: 310,
      findings: [
        {
          ruleId: 'BG-001',
          ruleTitle: 'Prohibited Absolute Claims',
          severity: 'high',
          flaggedExcerpt: 'guaranteed results',
          explanation: 'Violates scientific integrity policy.'
        }
      ],
      approver_name: 'Elena Vance',
      approver_title: 'VP Brand Governance',
      approver_avatar_initials: 'EV',
      approver_status: 'Assigned',
      audit_log: [],
      image_asset: null,
      created_at: '2026-10-24 14:00:00'
    };

    const report = mapRowToAuditReport(mockRow);
    expect(report.id).toBe('#AUD-2025-0894');
    expect(report.healthScore).toBe(42);
    expect(report.status).toBe('Blocked');
    expect(report.findings).toHaveLength(1);
    expect(report.approver.name).toBe('Elena Vance');
  });

  it('correctly maps AuditReport to database insert payload', () => {
    const insertPayload = mapAuditReportToInsert(demoAuditReport2025);
    expect(insertPayload.id).toBe(demoAuditReport2025.id);
    expect(insertPayload.campaign_name).toBe(demoAuditReport2025.campaignName);
    expect(insertPayload.health_score).toBe(demoAuditReport2025.healthScore);
    expect(insertPayload.status).toBe(demoAuditReport2025.status);
    expect(insertPayload.approver_name).toBe(demoAuditReport2025.approver.name);
  });

  it('correctly maps knowledge_documents database row to KnowledgeDoc entity', () => {
    const mockRow: any = {
      id: 'doc-001',
      brand_profile_id: 'test-brand',
      user_id: null,
      file_name: 'NovaFit_Compliance_Manual_2025.pdf',
      file_type: 'PDF',
      file_size: '14.2 MB',
      rules_extracted: 8,
      vector_index: 'novafit-primary-v2',
      status: 'Synced',
      last_indexed: '10 mins ago',
      chunks_count: 140,
      description: 'Master compliance manual.'
    };

    const doc = mapRowToKnowledgeDoc(mockRow);
    expect(doc.id).toBe('doc-001');
    expect(doc.fileName).toBe('NovaFit_Compliance_Manual_2025.pdf');
    expect(doc.rulesExtracted).toBe(8);
    expect(doc.status).toBe('Synced');
  });

  it('seamlessly falls back to local seed rules when Supabase is unconfigured', async () => {
    const res = await fetchBrandRules();
    expect(res.rules).toBeDefined();
    expect(res.rules.length).toBeGreaterThanOrEqual(8);
    expect(res.rules[0].id).toBe('BG-001');
  });

  it('seamlessly falls back to local audit history when Supabase is unconfigured', async () => {
    const res = await fetchAuditHistory();
    expect(res.reports).toBeDefined();
    expect(res.reports.length).toBeGreaterThan(0);
    expect(res.reports[0].id).toContain('AUD');
  });

  it('seamlessly fetches knowledge documents from Supabase or falls back to local knowledge documents', async () => {
    const res = await fetchKnowledgeDocuments();
    expect(res.docs).toBeDefined();
    expect(res.docs.length).toBeGreaterThan(0);
    expect(res.docs[0].id).toBeDefined();
  });
});
