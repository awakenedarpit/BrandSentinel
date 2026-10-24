import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BrandRule, BrandProfile } from '../types';
import { Database } from '../types/database';


export function mapRowToBrandRule(row: Database['public']['Tables']['brand_rules']['Row']): BrandRule {
  return {
    id: row.id,
    title: row.title,
    category: row.category as any,
    severity: row.severity,
    isActive: row.is_active,
    statement: row.statement,
    source: {
      docName: row.source_doc_name,
      page: row.source_page ?? undefined,
      paragraph: row.source_paragraph ?? undefined,
      type: row.source_type
    },
    prohibitedPatterns: row.prohibited_patterns || [],
    approvedSubstitutions: row.approved_substitutions || [],
    enforcedChannels: row.enforced_channels || [],
    triggerWords: row.trigger_words ?? undefined,
    mandatoryCopy: row.mandatory_copy ?? undefined,
    regexPattern: row.regex_pattern ?? undefined,
    placementRequirement: row.placement_requirement ?? undefined,
    stats: {
      cleanScans: row.clean_scans,
      softWarns: row.soft_warns,
      autoCorrections: row.auto_corrections
    }
  };
}

export function mapBrandRuleToInsert(rule: BrandRule): Database['public']['Tables']['brand_rules']['Insert'] {
  return {
    id: rule.id,
    title: rule.title,
    category: rule.category,
    severity: rule.severity,
    is_active: rule.isActive,
    statement: rule.statement,
    source_doc_name: rule.source.docName,
    source_page: rule.source.page ?? null,
    source_paragraph: rule.source.paragraph ?? null,
    source_type: rule.source.type,
    prohibited_patterns: rule.prohibitedPatterns,
    approved_substitutions: rule.approvedSubstitutions,
    enforced_channels: rule.enforcedChannels,
    trigger_words: rule.triggerWords ?? null,
    mandatory_copy: rule.mandatoryCopy ?? null,
    regex_pattern: rule.regexPattern ?? null,
    placement_requirement: rule.placementRequirement ?? null,
    clean_scans: rule.stats?.cleanScans ?? 0,
    soft_warns: rule.stats?.softWarns ?? 0,
    auto_corrections: rule.stats?.autoCorrections ?? 0
  };
}

/** Fetch only the signed-in user's rules. Never substitute demo rules. */
export async function fetchBrandRules(): Promise<{ rules: BrandRule[]; source: 'supabase' | 'local'; error?: string }> {
  if (!isSupabaseConfigured()) return { rules: [], source: 'local', error: 'Supabase is not configured.' };

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { rules: [], source: 'local', error: 'Sign in to load brand rules.' };
    const { data, error } = await supabase
      .from('brand_rules')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('id', { ascending: true });

    if (error) {
      console.warn('[BrandSentinel] Failed to fetch brand rules:', error.message);
      return { rules: [], source: 'local', error: error.message };
    }

    if (!data || data.length === 0) {
      return { rules: [], source: 'supabase' };
    }

    return {
      rules: data.map(mapRowToBrandRule),
      source: 'supabase'
    };
  } catch (err: any) {
    console.warn('[BrandSentinel] Error querying Supabase brand rules:', err);
    return { rules: [], source: 'local', error: err.message };
  }
}

/**
 * Toggle a brand rule's active state
 */
export async function toggleBrandRuleInDb(ruleId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { success: false, error: 'Sign in before changing rules.' };
    const { error } = await supabase
      .from('brand_rules')
      .update({ is_active: isActive })
      .eq('id', ruleId)
      .eq('user_id', authData.user.id);

    if (error) {
      console.warn(`[BrandSentinel] Failed to update rule ${ruleId} in Supabase:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Add a new brand rule to Supabase
 */
export async function insertBrandRuleToDb(newRule: BrandRule): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { success: false, error: 'Sign in before adding rules.' };
    const insertPayload = { ...mapBrandRuleToInsert(newRule), user_id: authData.user.id };
    const { error } = await supabase
      .from('brand_rules')
      .insert(insertPayload);

    if (error) {
      console.warn('[BrandSentinel] Failed to insert new rule into Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch Brand Profile
 */
export async function fetchBrandProfile(): Promise<{ profile: BrandProfile; source: 'supabase' | 'local'; error?: string }> {
  if (!isSupabaseConfigured()) return { profile: { name: '', tagline: '', industry: '', voicePersona: [], activeVersion: '', primaryContact: { name: '', title: '', email: '' } }, source: 'local', error: 'Supabase is not configured.' };

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { profile: { name: '', tagline: '', industry: '', voicePersona: [], activeVersion: '', primaryContact: { name: '', title: '', email: '' } }, source: 'local', error: 'Sign in to load your brand profile.' };
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { profile: { name: '', tagline: '', industry: '', voicePersona: [], activeVersion: '', primaryContact: { name: '', title: '', email: '' } }, source: 'supabase', error: error?.message };
    }

    const profile: BrandProfile = {
      name: data.name,
      tagline: data.tagline || '',
      industry: data.industry || '',
      voicePersona: data.voice_persona || [],
      activeVersion: data.active_version || '',
      primaryContact: {
        name: data.primary_contact_name || '',
        title: data.primary_contact_title || '',
        email: data.primary_contact_email || ''
      }
    };

    return { profile, source: 'supabase' };
  } catch (err: any) {
    return { profile: { name: '', tagline: '', industry: '', voicePersona: [], activeVersion: '', primaryContact: { name: '', title: '', email: '' } }, source: 'local', error: err.message };
  }
}
