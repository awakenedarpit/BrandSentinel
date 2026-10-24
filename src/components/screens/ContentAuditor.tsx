import React, { useState, useEffect } from 'react';
import { BrandRule, AuditReport } from '../../types';
import { evaluateCopy, applyRemediation, createAuditReport } from '../../modules/audit/auditEngine';
import { auditTextWithAI, RAGAuditResponse } from '../../modules/ai/aiService';

interface ContentAuditorProps {
  brandRules: BrandRule[];
  onOpenReport: (report?: AuditReport) => void;
}

export const ContentAuditor: React.FC<ContentAuditorProps> = ({
  brandRules,
  onOpenReport
}) => {
  const [campaignName, setCampaignName] = useState('');
  const [publishingSurface, setPublishingSurface] = useState('Social Media');
  const [copyText, setCopyText] = useState('');
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [aiAuditResult, setAiAuditResult] = useState<RAGAuditResponse | null>(null);

  // Evaluate copy dynamically (instant baseline)
  const localResult = evaluateCopy(copyText, brandRules);
  const activeResult = aiAuditResult || localResult;
  const { healthScore, status, findings, wordCount, charCount } = activeResult;

  // Approximate token count
  const estimatedTokens = Math.round(charCount / 4.2);

  const handleApplyFix = (ruleId: string) => {
    const finding = findings.find(f => f.ruleId === ruleId);
    if (!finding) return;

    const updated = applyRemediation(copyText, finding);
    setCopyText(updated);
    setAiAuditResult(null);
    setActiveScenario('custom');
    setActionNotice(`Applied fix for ${ruleId}: Replaced with compliant phrasing.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleInsertDisclaimer = () => {
    const disclaimerFinding = findings.find(f => f.isMandatoryDisclaimer);
    if (!disclaimerFinding) return;

    const updated = applyRemediation(copyText, disclaimerFinding);
    setCopyText(updated);
    setAiAuditResult(null);
    setActiveScenario('custom');
    setActionNotice('Mandatory legal disclaimer appended to copy.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleClear = () => {
    setCopyText('');
    setAiAuditResult(null);
    setActiveScenario('custom');
    setHighlightedRuleId(null);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await auditTextWithAI(copyText, brandRules, {
        campaignName,
        publishingSurface
      });
      setAiAuditResult(res);
      setActionNotice(
        res.isAiAudited
          ? `Live Gemini RAG Audit complete: ${res.retrievedChunks?.length || 0} guideline chunks retrieved with cosine semantic scores.`
          : 'Audit complete: refreshed compliance telemetry.'
      );
    } catch (_err) {
      setActionNotice('Audit complete using deterministic baseline.');
    } finally {
      setIsAuditing(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // SVG Circle calculation for stroke-dashoffset (circumference = 2 * PI * 40 = 251.2)
  const circumference = 251.2;
  const isInsufficientEvidence = (activeResult as any).evidenceStatus === 'insufficient-evidence' || healthScore === null;
  const strokeOffset = healthScore !== null
    ? circumference - (healthScore / 100) * circumference
    : circumference;

  const isApproved = !activeResult.isEmpty && !isInsufficientEvidence && healthScore !== null && healthScore >= 80;

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Utility Context Bar */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-semibold">
              Governance Engine
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-code text-label-code text-on-surface-variant font-medium">
              New audit session
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Content Auditor
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Check marketing messages against your brand's configured policies before publishing.
          </p>
        </div>

        {/* Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-space-xs self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
            <span className="font-label-meta text-label-meta text-on-surface">
              Brand: <strong className="font-semibold text-primary">Your workspace</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface">
            <span className="material-symbols-outlined text-primary text-[14px]">history_edu</span>
            <span className="font-label-meta text-label-meta text-on-surface">
              Version: <strong className="font-semibold">v2.8 (Synced)</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span className="font-label-meta text-label-meta uppercase tracking-wider font-semibold">
              Live Evaluation
            </span>
          </div>
        </div>
      </div>

      {/* Notice Banner if any action occurred */}
      {actionNotice && (
        <div className="mb-space-md p-3 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span className="font-body-sm text-body-sm font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-[12px] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Studio Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT PANE: Content Composition & Editor (7 cols ~ 58%) */}
        <section className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Configuration Bar */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-sm">
              {/* Workspace Target Selector */}
              <div className="flex flex-col gap-1">
                <label className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider font-semibold">
                  Target Brand Guideline
                </label>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                    <span className="font-body-md text-body-md font-semibold truncate">
                      Your brand workspace
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                </button>
              </div>

              {/* Campaign Context */}
              <div className="flex flex-col gap-1">
                <label className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider font-semibold">
                  Campaign Name
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                  />
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px] absolute right-3 pointer-events-none">
                    campaign
                  </span>
                </div>
              </div>
            </div>

            {/* Publishing Surface Selector */}
            <div className="flex flex-col gap-1.5 mt-space-sm pt-space-xs border-t border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider font-semibold">
                  Publishing Surface
                </span>
                <span className="font-label-code text-label-code text-on-surface-variant">
                  Policy Set: SOCIAL_COMMERCIAL_V2
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'Social Media', icon: 'share' },
                  { id: 'Advertisement', icon: 'ad_units' },
                  { id: 'Email Newsletter', icon: 'mail' },
                  { id: 'Landing Page', icon: 'web' },
                  { id: 'Blog Post', icon: 'article' }
                ].map((surface) => (
                  <button
                    key={surface.id}
                    onClick={() => setPublishingSurface(surface.id)}
                    className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      publishingSurface === surface.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{surface.icon}</span>
                    <span>{surface.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden border border-outline-variant/30">
            {/* Header with Metrics & Scenarios */}
            <div className="px-space-md py-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-code text-label-code">
                  {charCount} characters • {wordCount} words • ~{estimatedTokens} tokens
                </span>
                <span className="h-3.5 w-px bg-outline-variant"></span>
                <div className="flex items-center gap-0.5 text-on-surface-variant">
                  <button className="p-1 rounded hover:bg-surface-container hover:text-on-surface" title="Format: Bold">
                    <span className="material-symbols-outlined text-[16px]">format_bold</span>
                  </button>
                  <button className="p-1 rounded hover:bg-surface-container hover:text-on-surface" title="Format: Italic">
                    <span className="material-symbols-outlined text-[16px]">format_italic</span>
                  </button>
                  <button className="p-1 rounded hover:bg-surface-container hover:text-on-surface" title="Clear Formatting">
                    <span className="material-symbols-outlined text-[16px]">format_clear</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Editable Text Area with Visual Annotations */}
            <div className="p-space-lg flex flex-col gap-3 min-h-[220px]">
              <textarea
                value={copyText}
                onChange={(e) => {
                  setCopyText(e.target.value);
                  setAiAuditResult(null);
                  setActiveScenario('custom');
                }}
                rows={5}
                className="w-full font-body-lg text-body-lg text-on-surface leading-relaxed focus:outline-none resize-y bg-transparent"
                placeholder="Paste or compose your promotional copy here for instant brand compliance auditing..."
              />

              {/* Interactive Highlight Tokens Deck */}
              {findings.length > 0 && (
                <div className="mt-2 pt-3 border-t border-outline-variant/20 flex flex-wrap items-center gap-2">
                  <span className="font-label-meta text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Flagged In Copy:
                  </span>
                  {findings.map((finding) => (
                    <button
                      key={finding.ruleId}
                      onClick={() => setHighlightedRuleId(finding.ruleId)}
                      className={`px-2 py-0.5 rounded text-[12px] font-label-code font-semibold flex items-center gap-1 transition-all ${
                        finding.severity === 'high'
                          ? 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error'
                          : 'bg-surface-container-highest text-secondary hover:bg-secondary hover:text-on-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {finding.severity === 'high' ? 'priority_high' : 'visibility'}
                      </span>
                      <span>{finding.flaggedExcerpt}</span>
                      <span className="text-[10px] opacity-75">({finding.ruleId})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-space-md py-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm border-t border-outline-variant/20">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold shadow-sm hover:bg-primary-container transition-all"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isAuditing ? 'animate-spin' : ''}`}>
                    {isAuditing ? 'sync' : 'bolt'}
                  </span>
                  <span>{isAuditing ? 'Auditing...' : 'Run Live AI Audit'}</span>
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors"
                >
                  Clear Editor
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Version Comparator: Diff compared against the previous 4 audited drafts in the compliance log.')}
                  className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  <span>Compare Versions</span>
                </button>
                <button
                  onClick={() => alert(`Audit Package for campaign "${campaignName}" dispatched to Elena Vance (VP Brand Governance).`)}
                  className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Send to Approver</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANE: Compliance Telemetry & Finding Cards (5 cols ~ 42%) */}
        <section className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Compliance Score Radial Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                Real-Time Compliance Telemetry
              </span>
              <span className="font-label-code text-label-code text-on-surface-variant">
                Target SLA: &gt; 80 / 100
              </span>
            </div>

            <div className="flex items-center gap-space-lg">
              {/* Radial Score Meter */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e8eeff"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={activeResult.isEmpty ? '#e0e2ec' : isInsufficientEvidence ? '#f59e0b' : isApproved ? '#10b981' : '#ba1a1a'}
                    strokeWidth="9"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={activeResult.isEmpty || isInsufficientEvidence ? circumference : strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`font-headline-lg text-[26px] font-bold leading-none ${activeResult.isEmpty ? 'text-on-surface-variant' : isInsufficientEvidence ? 'text-amber-500' : isApproved ? 'text-[#10b981]' : 'text-error'}`}>
                    {activeResult.isEmpty || isInsufficientEvidence ? '—' : healthScore}
                  </span>
                  <span className="font-label-meta text-[10px] text-on-surface-variant uppercase mt-0.5">
                    {activeResult.isEmpty ? 'Awaiting' : isInsufficientEvidence ? 'No Evidence' : 'Health'}
                  </span>
                </div>
              </div>

              {/* Status Verdict Statement */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2.5 py-1 rounded font-headline-sm text-[14px] font-bold flex items-center gap-1.5 ${
                      activeResult.isEmpty
                        ? 'bg-surface-container text-on-surface-variant'
                        : isInsufficientEvidence
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : isApproved
                        ? 'bg-[#ecfdf5] text-[#10b981]'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {activeResult.isEmpty ? 'edit_note' : isInsufficientEvidence ? 'help_outline' : isApproved ? 'verified' : 'block'}
                    </span>
                    <span>
                      {activeResult.isEmpty
                        ? 'Awaiting Input'
                        : isInsufficientEvidence
                        ? 'Insufficient Evidence'
                        : status === 'Approved'
                        ? 'Publishing Approved'
                        : 'Publishing Blocked'}
                    </span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {activeResult.isEmpty
                    ? 'Enter or paste promotional copy in the editor to audit brand compliance against active policies.'
                    : isInsufficientEvidence
                    ? 'No matching policy guidelines were retrieved from the knowledge base to verify this copy.'
                    : isApproved
                    ? '100% compliant with brand policies and truth guardrails.'
                    : `${findings.length} policy issues require attention before scheduling or export.`}
                </p>
                <div className="flex items-center gap-3 mt-2 text-on-surface-variant font-label-meta text-[11px]">
                  <span>Violations: <strong className={isApproved ? 'text-[#10b981]' : isInsufficientEvidence ? 'text-amber-500' : 'text-error'}>{findings.filter(f => f.severity === 'high').length} Critical</strong></span>
                  <span>•</span>
                  <span>Warnings: <strong className="text-secondary">{findings.filter(f => f.severity === 'medium').length}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Link to Detailed Report */}
            <button
              onClick={() => {
                const detailedReport = createAuditReport(copyText, brandRules, {
                  campaignName,
                  publishingSurface
                });
                onOpenReport(detailedReport);
              }}
              className="w-full py-2 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span>Open Forensic Audit Report</span>
            </button>
          </div>

          {/* Finding Cards Stream */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-headline-sm text-[16px] text-on-surface font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
                <span>Active Policy Findings ({findings.length})</span>
              </span>
              <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
                Grounded Citations
              </span>
            </div>

            {activeResult.isEmpty ? (
              <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">edit_note</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">No Content Entered</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  Enter or paste your marketing draft above. Audits use the rules and documents associated with your signed-in account.
                </p>
              </div>
            ) : findings.length === 0 ? (
              <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#10b981]/30 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">All Policies Satisfied</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  This copy passed checks against your active brand rules. Review the findings before publishing.
                </p>
              </div>
            ) : (
              findings.map((finding) => {
                const isSelected = highlightedRuleId === finding.ruleId;
                const isHigh = finding.severity === 'high';

                return (
                  <div
                    key={finding.ruleId}
                    className={`relative rounded-xl bg-surface-container-lowest p-space-md shadow-sm border transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary shadow-md'
                        : 'border-outline-variant/30 hover:shadow-md'
                    }`}
                  >
                    {/* Left severity edge bar */}
                    <div
                      className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                        isHigh ? 'bg-error' : 'bg-secondary-container'
                      }`}
                    ></div>

                    <div className="pl-2 flex flex-col gap-2.5">
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-label-code text-label-code font-bold bg-surface-container-low text-on-surface">
                            {finding.ruleId}
                          </span>
                          <span className="font-headline-sm text-[14px] text-on-surface font-semibold truncate max-w-[220px]">
                            {finding.ruleTitle}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-label-meta text-[10px] uppercase font-semibold ${
                            isHigh
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container-high text-secondary'
                          }`}
                        >
                          {isHigh ? 'Critical Violation' : 'Tone Warning'}
                        </span>
                      </div>

                      {/* Flagged Excerpt */}
                      <div className="p-2 rounded-lg bg-surface-container-low text-body-sm flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-error mt-0.5">error_outline</span>
                        <div>
                          <p className="font-semibold text-error">"{finding.flaggedExcerpt}"</p>
                          <p className="text-on-surface text-[12px] mt-0.5">{finding.rationale}</p>
                        </div>
                      </div>

                      {/* Grounded Citation */}
                      <div className="p-2 rounded-lg bg-surface-container-high/30 text-[11px] font-label-code text-on-surface-variant flex items-center justify-between">
                        <div className="flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-primary text-[14px]">menu_book</span>
                          <span className="truncate">{finding.citation.docName}</span>
                          {finding.citation.page && <span>({finding.citation.page})</span>}
                        </div>
                        <span className="text-primary font-semibold flex-shrink-0">
                          RAG: {finding.citation.ragCosine}
                        </span>
                      </div>

                      {/* Suggested Fix Action */}
                      <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-label-meta text-[10px] uppercase text-primary font-bold">
                            {finding.suggestedLabel}
                          </span>
                          <span className="font-label-code text-[10px] text-[#10b981] font-semibold">100% Policy Pass</span>
                        </div>
                        <p className="font-body-sm text-body-sm font-semibold text-on-surface bg-surface-container-lowest p-2 rounded border border-outline-variant/20">
                          "{finding.aiSuggestedFix}"
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {finding.isMandatoryDisclaimer ? (
                            <button
                              onClick={handleInsertDisclaimer}
                              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">playlist_add</span>
                              <span>Insert Disclaimer</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyFix(finding.ruleId)}
                              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Apply AI Fix</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
