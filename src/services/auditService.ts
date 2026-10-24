import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditReport } from '../types';
import { Database } from '../types/database';


export function mapRowToAuditReport(row: Database['public']['Tables']['audit_reports']['Row']): AuditReport {
  return {
    id: row.id,
    campaignName: row.campaign_name,
    targetEntity: row.target_entity,
    publishingSurface: row.publishing_surface,
    submittedCopy: row.submitted_copy,
    remediatedCopy: row.remediated_copy,
    status: row.status,
    healthScore: row.health_score,
    totalRulesChecked: row.total_rules_checked,
    flaggedCount: row.flagged_count,
    executionLatencyMs: row.execution_latency_ms,
    findings: Array.isArray(row.findings) ? row.findings : [],
    approver: {
      name: row.approver_name || '',
      title: row.approver_title || '',
      avatarInitials: row.approver_avatar_initials || '',
      status: row.approver_status || 'Assigned'
    },
    auditLog: Array.isArray(row.audit_log) ? row.audit_log : [],
    imageAsset: row.image_asset || undefined,
    timestamp: row.created_at
  };
}

export function mapAuditReportToInsert(report: AuditReport): Database['public']['Tables']['audit_reports']['Insert'] {
  return {
    id: report.id,
    campaign_name: report.campaignName,
    target_entity: report.targetEntity,
    publishing_surface: report.publishingSurface,
    submitted_copy: report.submittedCopy,
    remediated_copy: report.remediatedCopy,
    status: report.status,
    health_score: report.healthScore,
    total_rules_checked: report.totalRulesChecked,
    flagged_count: report.flaggedCount,
    execution_latency_ms: report.executionLatencyMs,
    findings: report.findings,
    approver_name: report.approver.name,
    approver_title: report.approver.title,
    approver_avatar_initials: report.approver.avatarInitials,
    approver_status: report.approver.status,
    audit_log: report.auditLog,
    image_asset: report.imageAsset || null
  };
}

/**
 * Fetch only the signed-in user's audit reports.
 */
export async function fetchAuditHistory(): Promise<{
  reports: AuditReport[];
  source: 'supabase' | 'local';
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { reports: [], source: 'local', error: 'Supabase is not configured.' };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { reports: [], source: 'local', error: 'Sign in to load audit history.' };
    const { data, error } = await supabase
      .from('audit_reports')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[BrandSentinel] Failed to fetch audit history:', error.message);
      return { reports: [], source: 'local', error: error.message };
    }

    if (!data || data.length === 0) {
      return { reports: [], source: 'supabase' };
    }

    return {
      reports: data.map(mapRowToAuditReport),
      source: 'supabase'
    };
  } catch (err: any) {
    return { reports: [], source: 'local', error: err.message };
  }
}

/**
 * Persist an audit report to Supabase
 */
export async function saveAuditReportToDb(report: AuditReport): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { success: false, error: 'Sign in before saving audit reports.' };
    const insertPayload = { ...mapAuditReportToInsert(report), user_id: authData.user.id };
    const { error } = await supabase
      .from('audit_reports')
      .upsert(insertPayload, { onConflict: 'id' });

    if (error) {
      console.warn('[BrandSentinel] Failed to save audit report to Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
