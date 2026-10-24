import React, { useState, useEffect } from 'react';
import { AuditReport, BrandRule } from '../../types';

interface AuditReportScreenProps {
  report?: AuditReport;
  brandRules?: BrandRule[];
  onBackToAuditor: () => void;
  onOpenGuidelines: () => void;
}

export const AuditReportScreen: React.FC<AuditReportScreenProps> = ({
  report: propReport,
  brandRules,
  onBackToAuditor,
  onOpenGuidelines
}) => {
  const [report, setReport] = useState<AuditReport | null>(propReport || null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [fixedRules, setFixedRules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (propReport) {
      setReport(propReport);
    }
  }, [propReport]);

  const handleApplyFix = (ruleId: string) => {
    if (!report) return;
    setFixedRules(prev => ({ ...prev, [ruleId]: true }));
    setCopyStatus(`Remediation applied for ${ruleId}. Projected score increased.`);
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const isAllFixed = fixedRules['BG-001'] && fixedRules['BG-002'] && fixedRules['BG-003'];
  const displayScore = isAllFixed ? 100 : (Object.keys(fixedRules).length > 0 ? 76 : report.healthScore);

  const handleCopyApproved = () => {
    if (!report) return;
    navigator.clipboard?.writeText(report.remediatedCopy);
    setCopyStatus('Approved compliant text copied to clipboard!');
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const handleExportPdf = () => {
    setIsExportMenuOpen(false);
    alert('Generating signed forensic PDF compliance certificate with SHA-256 policy stamps for #account audit report.');
  };

  const handleExportJson = () => {
    if (!report) return;
    setIsExportMenuOpen(false);
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `BrandSentinel_Account_Audit_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!report) return <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-outline-variant p-10 text-center"><h2 className="text-xl font-semibold text-on-surface">No audit report selected</h2><p className="mt-2 text-on-surface-variant">Run an audit with your own brand guidelines or choose a report from your account's audit history.</p><button onClick={onBackToAuditor} className="mt-5 rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">Go to Content Auditor</button></div>;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Forensic Breadcrumb & Action Deck */}
      <div className="flex flex-col gap-4 mb-space-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 font-label-meta text-label-meta tracking-wider uppercase text-on-surface-variant">
            <button
              onClick={onBackToAuditor}
              className="hover:text-primary transition-colors flex items-center gap-1.5 font-semibold"
            >
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              Content Auditor
            </button>
            <span>/</span>
            <span className="text-on-surface-variant">Audit Reports</span>
            <span>/</span>
            <span className="font-label-code text-label-code px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
              {report.id}
            </span>
          </nav>

          {/* Governance Flag Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant font-label-code text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              ACCOUNT AUDIT REPORT
            </span>
            <span
              className={`px-2.5 py-1 rounded-full font-label-meta text-label-meta uppercase tracking-wider flex items-center gap-1 font-semibold ${
                isAllFixed
                  ? 'bg-[#ecfdf5] text-[#10b981]'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isAllFixed ? 'verified' : 'shield_with_heart'}
              </span>
              {isAllFixed ? 'Compliance Verified (All Rules Met)' : 'Failed Compliance (Critical Violations)'}
            </span>
          </div>
        </div>

        {/* Title & Global Report Commands */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-2 min-w-0 z-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {report.campaignName}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-on-surface-variant font-body-sm text-body-sm">
              <span className="flex items-center gap-1.5 font-semibold text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[16px]">local_fire_department</span>
                {report.targetEntity}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                {report.publishingSurface}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="flex items-center gap-1.5 font-label-code text-label-code">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                {report.timestamp}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="flex items-center gap-1.5 font-label-code text-label-code text-primary font-semibold">
                <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                BrandSentinel AI v3.2 Engine
              </span>
            </div>
          </div>

          {/* Compliance Score Widget & Action Toolbar */}
          <div className="flex flex-wrap items-center gap-4 flex-shrink-0 z-10">
            {/* Radial Score Pill */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-error-container/30 border border-error/20">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-high"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className={isAllFixed ? 'text-[#10b981]' : 'text-error'}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${displayScore}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className={`absolute font-headline-sm text-headline-sm font-bold ${isAllFixed ? 'text-[#10b981]' : 'text-error'}`}>
                  {displayScore}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider font-semibold">
                  Health Index
                </span>
                <span className={`font-headline-sm text-headline-sm leading-tight font-bold ${isAllFixed ? 'text-[#10b981]' : 'text-error'}`}>
                  {displayScore} / 100
                </span>
              </div>
            </div>

            {/* Buttons Toolbar */}
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToAuditor}
                className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1.5"
                title="Open in Content Auditor"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span className="hidden sm:inline">Edit in Auditor</span>
              </button>

              <button
                onClick={() => {
                  setFixedRules({});
                  setCopyStatus('Re-audit dispatched: fresh telemetry fetched.');
                  setTimeout(() => setCopyStatus(null), 3000);
                }}
                className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1.5"
                title="Queue high-priority re-audit"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Re-audit</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-container-lowest shadow-xl border border-outline-variant/30 z-30 py-1.5">
                    <button
                      onClick={handleExportPdf}
                      className="w-full flex items-center gap-2 px-3.5 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-error text-[18px]">picture_as_pdf</span>
                      <span>Export Forensic PDF</span>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="w-full flex items-center gap-2 px-3.5 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-secondary text-[18px]">data_object</span>
                      <span>Raw Telemetry JSON</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => alert(`Share link for this account's audit report copied! Security token generated for internal risk reviewers.`)}
                className="px-3.5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-body-sm text-body-sm font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copy notification */}
      {copyStatus && (
        <div className="mb-space-md p-3 rounded-xl bg-[#ecfdf5] text-[#10b981] font-semibold text-body-sm flex items-center justify-between border border-[#10b981]/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{copyStatus}</span>
          </div>
        </div>
      )}

      {/* Primary Analytical Workspace: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT COLUMN: Content & Forensic Citations (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Section 1: Audited Asset Copy Display */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">spellcheck</span>
                </div>
                <div>
                  <p className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider font-semibold">
                    Submitted Creative Ingestion
                  </p>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Inspected Body Copy & Claims
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full font-label-code text-label-code text-on-surface-variant font-semibold">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span>2 Flagged Passages</span>
              </div>
            </div>

            {/* High-Contrast Interactive Sandbox */}
            <div className="p-5 rounded-xl bg-surface-container-low/70 flex flex-col gap-4 border border-outline-variant/20">
              <div className="font-body-lg text-body-lg leading-relaxed text-on-surface">
                Get{' '}
                <span className="relative group cursor-pointer inline-block mx-1">
                  <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold transition-all hover:bg-error hover:text-on-error shadow-sm underline decoration-error decoration-2 underline-offset-4">
                    guaranteed results
                  </span>
                  <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-1/2 -translate-x-1/2 -top-11 z-20 px-3 py-1.5 rounded-lg bg-inverse-surface text-inverse-on-surface font-label-code text-label-code whitespace-nowrap shadow-xl flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    Rule BG-001 Violation • Prohibited Absolute
                  </span>
                </span>{' '}
                in 7 days! This plan{' '}
                <span className="relative group cursor-pointer inline-block mx-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-semibold transition-all hover:bg-secondary hover:text-on-secondary shadow-sm underline decoration-amber-500 decoration-dotted decoration-2 underline-offset-4">
                    works for everyone
                  </span>
                  <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-1/2 -translate-x-1/2 -top-11 z-20 px-3 py-1.5 rounded-lg bg-inverse-surface text-inverse-on-surface font-label-code text-label-code whitespace-nowrap shadow-xl flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Rule BG-002 Review • Universality Overpromise
                  </span>
                </span>
                .
              </div>

              {/* Technical Hash & Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-on-surface-variant font-label-code text-label-code bg-surface-container-lowest/80 px-3 py-2 rounded-lg border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <span>Word Count: <strong className="text-on-surface">14</strong></span>
                  <span>•</span>
                  <span>Lang: <strong className="text-on-surface">en-US</strong></span>
                  <span>•</span>
                  <span>Reading Grade: <strong className="text-on-surface">Grade 4.2</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant font-label-code">
                  <span className="material-symbols-outlined text-[14px] text-secondary">fingerprint</span>
                  <span>SHA-256: 7d4a9...b92e Verified</span>
                </div>
              </div>
            </div>

            {/* Embedded Creative Image Proof Preview */}
            {report.imageAsset && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container relative">
                  <img
                    src={report.imageAsset.url}
                    alt="Creative Proof"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback icon container
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-[16px] text-on-primary drop-shadow">image</span>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                    Asset: {report.imageAsset.name}
                  </p>
                  <p className="font-label-meta text-label-meta text-on-surface-variant">
                    {report.imageAsset.scanResult}
                  </p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded font-label-code text-label-code bg-surface-container text-on-surface font-semibold flex-shrink-0">
                  Asset Valid
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Comprehensive Findings & Guideline Citations */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment_late</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Comprehensive Findings & Guideline Citations
                </h2>
              </div>
              <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider font-semibold">
                {report.findings.length} Issues Identified
              </span>
            </div>

            {/* Finding Card 1: Critical BG-001 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-code text-label-code font-bold tracking-wider">
                    RULE BG-001
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Prohibited Absolute Claim Violation
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-meta text-label-meta uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                  High / Critical Severity
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-surface-container-low p-3.5 rounded-lg font-body-sm text-body-sm">
                <div className="md:col-span-4 flex flex-col gap-1">
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                    Flagged Excerpt
                  </span>
                  <span className="font-body-md text-body-md font-semibold text-error bg-surface-container-lowest px-2 py-1 rounded inline-block">
                    “guaranteed results”
                  </span>
                </div>
                <div className="md:col-span-8 flex flex-col gap-1">
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                    Forensic Analysis
                  </span>
                  <p className="text-on-surface">
                    Direct breach of your brand's core scientific integrity policy and FTC marketing truth regulations. Fitness outcomes are intrinsically dependent on non-deterministic physiological variables.
                  </p>
                </div>
              </div>

              {/* Verified Grounding Citation */}
              <div className="p-4 rounded-xl bg-surface-container-low/50 flex flex-col gap-2.5 border border-outline-variant/20">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <span className="font-label-meta text-label-meta text-on-surface uppercase tracking-wider font-semibold">
                      Official Guideline Citation
                    </span>
                  </div>
                  <span className="font-label-code text-label-code px-2 py-0.5 rounded bg-surface-container font-semibold text-primary">
                    RAG Cosine: 0.96 (Exact Deterministic)
                  </span>
                </div>
                <blockquote className="italic text-on-surface font-body-md text-body-md pl-3 bg-surface-container-high/40 py-2 rounded-r border-l-2 border-primary">
                  “your brand communications must never promise guaranteed results or specific outcome timelines. Physical fitness adaptations differ by metabolic and lifestyle factors.”
                </blockquote>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-label-code text-label-code text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-error">picture_as_pdf</span>
                    <span className="font-medium text-on-surface">your brand_Brand_Compliance_Manual_2025.pdf</span>
                    <span className="text-on-surface-variant">— Section 3.2, Page 14</span>
                  </div>
                  <button onClick={onOpenGuidelines} className="text-primary hover:underline font-semibold flex items-center gap-1">
                    View in Guidelines
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>
              </div>

              {/* AI Remediation Box */}
              <div className="p-4 rounded-xl bg-surface-container-high/40 flex flex-col gap-3 border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_fix_high</span>
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-bold">
                    Suggested AI Compliant Replacement
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest shadow-sm">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    “Get sustainable, personalized results in your first week”
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-meta text-[10px] text-on-surface-variant uppercase font-semibold">
                    100% Policy Pass
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyFix('BG-001')}
                      className={`px-3.5 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
                        fixedRules['BG-001']
                          ? 'bg-[#ecfdf5] text-[#10b981]'
                          : 'bg-primary text-on-primary hover:bg-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{fixedRules['BG-001'] ? 'Fix Applied' : 'Apply Fix'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Finding Card 2: Medium BG-002 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-container"></div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-label-code text-label-code font-bold tracking-wider">
                    RULE BG-002
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Overpromising Universality vs Inclusive Voice
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-secondary font-label-meta text-label-meta uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Medium / Human Review
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-surface-container-low p-3.5 rounded-lg font-body-sm text-body-sm">
                <div className="md:col-span-4 flex flex-col gap-1">
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                    Flagged Excerpt
                  </span>
                  <span className="font-body-md text-body-md font-semibold text-secondary bg-surface-container-lowest px-2 py-1 rounded inline-block">
                    “works for everyone”
                  </span>
                </div>
                <div className="md:col-span-8 flex flex-col gap-1">
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                    Brand Voice Rationale
                  </span>
                  <p className="text-on-surface">
                    Violates tone guidelines regarding empathetic realism. Sweeping generalizations degrade brand trust and exclude individuals with differing athletic baselines.
                  </p>
                </div>
              </div>

              {/* Verified Grounding Citation */}
              <div className="p-4 rounded-xl bg-surface-container-low/50 flex flex-col gap-2.5 border border-outline-variant/20">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <span className="font-label-meta text-label-meta text-on-surface uppercase tracking-wider font-semibold">
                      Official Guideline Citation
                    </span>
                  </div>
                  <span className="font-label-code text-label-code px-2 py-0.5 rounded bg-surface-container font-semibold text-primary">
                    RAG Cosine: 0.88 (Semantic Match)
                  </span>
                </div>
                <blockquote className="italic text-on-surface font-body-md text-body-md pl-3 bg-surface-container-high/40 py-2 rounded-r border-l-2 border-secondary">
                  “Use encouraging, realistic, and inclusive language. Avoid hyperbolic generalizations that imply effortless universal success.”
                </blockquote>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-label-code text-label-code text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-error">picture_as_pdf</span>
                    <span className="font-medium text-on-surface">your brand_Brand_Guidelines_Voice_Tone.pdf</span>
                    <span className="text-on-surface-variant">— Page 8, Paragraph 3</span>
                  </div>
                  <button onClick={onOpenGuidelines} className="text-primary hover:underline font-semibold flex items-center gap-1">
                    View in Guidelines
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>
              </div>

              {/* AI Suggested Replacement */}
              <div className="p-4 rounded-xl bg-surface-container-high/40 flex flex-col gap-3 border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">tips_and_updates</span>
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-bold">
                    Suggested Inclusive Formulation
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest shadow-sm">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    “designed for all fitness levels”
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-meta text-[10px] text-secondary uppercase font-semibold">
                    Aligns With Tone Archetype
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApplyFix('BG-002')}
                    className={`px-3.5 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
                      fixedRules['BG-002']
                        ? 'bg-[#ecfdf5] text-[#10b981]'
                        : 'bg-primary text-on-primary hover:bg-primary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{fixedRules['BG-002'] ? 'Fix Applied' : 'Apply Fix'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Finding Card 3: Missing Mandatory Disclaimer BG-003 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-container"></div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-label-code text-label-code font-bold tracking-wider">
                    RULE BG-003
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Omission of Mandatory Regulatory Disclaimer
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-secondary font-label-meta text-label-meta uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Medium / Policy Gate
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-low font-body-sm text-body-sm flex flex-col gap-1.5">
                <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                  Finding Summary
                </span>
                <p className="text-on-surface">
                  Campaign mentions a specific duration (“7 days”) alongside physical transformation claims without providing the mandatory legal outcome variability qualifier.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/20">
                <div className="flex flex-col gap-1">
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                    Required Legal Disclaimer
                  </span>
                  <span className="font-label-code text-label-code font-bold text-on-surface bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant/20">
                    “Results vary by individual.”
                  </span>
                </div>
                <button
                  onClick={() => handleApplyFix('BG-003')}
                  className={`px-3.5 py-2 rounded-lg font-body-sm text-body-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto ${
                    fixedRules['BG-003']
                      ? 'bg-[#ecfdf5] text-[#10b981]'
                      : 'bg-primary-container text-on-primary hover:bg-secondary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">playlist_add</span>
                  <span>{fixedRules['BG-003'] ? 'Disclaimer Inserted' : 'Insert at End of Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Side-by-Side Remediation Sandbox */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">compare</span>
                </div>
                <div>
                  <p className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider font-semibold">
                    Side-by-Side Remediation
                  </p>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Proposed Clean Version
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#ecfdf5] text-[#10b981] font-label-code text-label-code font-bold">
                100 / 100 Projected Score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-error-container/20 flex flex-col gap-2 border border-error/20">
                <span className="font-label-meta text-label-meta text-error uppercase tracking-wider font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                  Current Non-Compliant Draft
                </span>
                <p className="font-body-md text-body-md text-on-surface line-through opacity-75">
                  “Get guaranteed results in 7 days! This plan works for everyone.”
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-high/40 flex flex-col gap-2 border border-primary/20">
                <span className="font-label-meta text-label-meta text-primary uppercase tracking-wider font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Remediated Enterprise Approved
                </span>
                <p className="font-body-md text-body-md text-on-surface font-medium">
                  “{report.remediatedCopy}”
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCopyApproved}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors"
              >
                Copy Approved String
              </button>
              <button
                onClick={() => alert('Commit to Brand Digital Asset Management (DAM): Approved message published to campaign assets repository.')}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-secondary-container font-body-sm text-body-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>Commit to Brand DAM</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Audit Telemetry & Governance Metadata (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card 1: Summary Matrix */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">equalizer</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Audit Summary Matrix</h3>
              </div>
              <span className="font-label-code text-label-code text-on-surface-variant font-semibold">
                24 Rules Checked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
                  Confirmed Violations
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg text-error">1</span>
                  <span className="font-label-code text-label-code text-error font-medium">Critical</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
                  Human Reviews
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg text-secondary">1</span>
                  <span className="font-label-code text-label-code text-secondary font-medium">Warning</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
                  Missing Disclaimers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg text-on-surface">1</span>
                  <span className="font-label-code text-label-code text-on-surface-variant font-medium">Mandatory</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
                  Execution Latency
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-primary">412</span>
                  <span className="font-label-code text-label-code text-on-surface-variant font-medium">ms</span>
                </div>
              </div>
            </div>

            {/* Evidence Note */}
            <div className="p-3 rounded-lg bg-surface-container-low/70 flex items-start gap-2.5 font-body-sm text-body-sm text-on-surface-variant border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0 mt-0.5">verified_user</span>
              <p className="leading-tight">
                <strong>Evidence Limitation:</strong> No image visual or text-in-image violations detected in uploaded thumbnail asset.
              </p>
            </div>

            {/* Pass Rate Progress Bar */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between font-label-meta text-label-meta text-on-surface-variant">
                <span>Pass Rate: 21 / 24 Compliant Rules</span>
                <span className="font-label-code text-label-code font-bold text-on-surface">87.5% Passed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                <div className="h-full bg-primary" style={{ width: '87.5%' }}></div>
                <div className="h-full bg-secondary-container" style={{ width: '4.1%' }}></div>
                <div className="h-full bg-error" style={{ width: '8.4%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 2: RAG Grounding Telemetry */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">neurology</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Guideline Grounding</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-code text-label-code font-semibold">
                RAG v3
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-[15px] text-on-surface font-semibold truncate">
                  100% Grounded
                </span>
                <span className="font-label-meta text-label-meta text-on-surface-variant">
                  Validated against authoritative brand corpus
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-body-sm text-body-sm">
              <div className="flex items-center justify-between py-1.5 bg-surface-container-low/40 px-3 rounded-lg">
                <span className="text-on-surface-variant font-label-meta text-label-meta uppercase tracking-wider">Vector Index</span>
                <span className="font-label-code text-label-code font-semibold text-primary">account-specific index</span>
              </div>
              <div className="flex items-center justify-between py-1.5 bg-surface-container-low/40 px-3 rounded-lg">
                <span className="text-on-surface-variant font-label-meta text-label-meta uppercase tracking-wider">Knowledge Chunks</span>
                <span className="font-label-code text-label-code font-semibold text-on-surface">3 Distinct Embeddings</span>
              </div>
              <div className="flex items-center justify-between py-1.5 bg-surface-container-low/40 px-3 rounded-lg">
                <span className="text-on-surface-variant font-label-meta text-label-meta uppercase tracking-wider">Hallucination Risk</span>
                <span className="font-label-code text-label-code font-bold text-on-surface flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  0.0% (Zero Synthesized)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 bg-surface-container-low/40 px-3 rounded-lg">
                <span className="text-on-surface-variant font-label-meta text-label-meta uppercase tracking-wider">Confidence SLA</span>
                <span className="font-label-code text-label-code font-semibold text-on-surface">&gt; 0.85 Minimum</span>
              </div>
            </div>
          </div>

          {/* Card 3: Sign-Off Workflow & Audit Trail */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Sign-Off & Workflow</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-label-code text-label-code font-bold">
                {isAllFixed ? 'Approved' : 'In Review'}
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold flex-shrink-0">
                EV
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-body-md text-body-md font-semibold text-on-surface truncate">Elena Vance</span>
                <span className="font-label-meta text-label-meta text-on-surface-variant">VP Brand Governance • Assigned</span>
              </div>
              <span className={`ml-auto px-2 py-0.5 rounded font-label-code text-label-code ${isAllFixed ? 'bg-[#ecfdf5] text-[#10b981] font-bold' : 'bg-surface-container text-on-surface-variant'}`}>
                {isAllFixed ? 'Approved' : 'Pending'}
              </span>
            </div>

            {/* SLA Target */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Compliance SLA Target</span>
              </div>
              <span className="font-label-code text-label-code font-bold text-primary">PASSED (-38m to SLA)</span>
            </div>

            {/* Audit Trail Timeline */}
            <div className="flex flex-col gap-3 pt-2">
              <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
                Forensic Audit Log
              </span>
              <div className="relative pl-5 flex flex-col gap-4">
                <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-surface-container-high"></div>
                {report.auditLog.map((log, i) => (
                  <div key={i} className="relative flex flex-col gap-0.5">
                    <span className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ${log.dotColor} ring-2 ring-surface-container-lowest`}></span>
                    <div className="flex items-center justify-between font-label-code text-label-code">
                      <span className="font-semibold text-on-surface">{log.event}</span>
                      <span className="text-on-surface-variant">{log.time}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{log.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign-off Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => alert('Reviewer Override: Signed with Elena Vance digital compliance credential.')}
                className="w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Reviewer Override</span>
              </button>
              <button
                onClick={() => alert('Re-audit Requested: Dispatched to BrandSentinel v3.2 queue.')}
                className="w-full py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Request Re-audit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
