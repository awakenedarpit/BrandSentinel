import React from 'react';
import { ScreenId } from '../layout/Sidebar';
import { pastAuditHistory } from '../../modules/data/demoData';

interface OverviewDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenImportModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onOpenImportModal
}) => {
  return (
    <div className="flex flex-col w-full pb-16">
      {/* Welcome & System Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm mb-space-lg p-space-lg border border-outline-variant/30">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary-container/10 via-secondary-container/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-lg">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-code text-label-code tracking-wider uppercase font-semibold">
                Executive Governance Console
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-code text-label-code flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                Active Brand: NovaFit
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              BrandSentinel AI Operations Hub
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Continuous brand integrity monitoring, automated FTC claim validation, and real-time marketing message governance.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => onNavigate('content-auditor')}
              className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-sm hover:bg-secondary-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>Audit Content Now</span>
            </button>
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">upload_file</span>
              <span>Import Style Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigate('brand-guidelines')}
          className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
              Active Policies
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">rule</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-[32px] font-bold text-on-surface">24</span>
              <span className="font-label-code text-label-code text-[#10b981] font-semibold">Live Enforced</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              5 Critical Blocking • 12 Warnings • 7 Guidelines
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigate('detailed-report')}
          className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
              Average Health Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-[32px] font-bold text-on-surface">92.4</span>
              <span className="font-label-code text-label-code text-[#10b981] font-semibold">+4.2% mo/mo</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Top channel: Email (98.6%) • Review: Meta Ads (74.2%)
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigate('audit-history')}
          className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Audits Run
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-[32px] font-bold text-on-surface">1,290</span>
              <span className="font-label-code text-label-code text-primary font-semibold">30d Total</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              94% Automated Pass • 6% Requiring Sign-off
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigate('knowledge-base')}
          className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-semibold">
              RAG Knowledge Assets
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">neurology</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-[32px] font-bold text-on-surface">4</span>
              <span className="font-label-code text-label-code text-[#10b981] font-semibold">Synced Docs</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              458 Chunks Ingested • 0.0% Hallucination SLA
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Recent Audits Ledger (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Recent Brand Compliance Audits
                </h2>
              </div>
              <button
                onClick={() => onNavigate('audit-history')}
                className="font-body-sm text-body-sm text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Audit History</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-body-sm text-body-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-on-surface-variant font-label-meta text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Audit Record</th>
                    <th className="py-2.5 px-3">Channel / Surface</th>
                    <th className="py-2.5 px-3">Health Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {pastAuditHistory.map((audit) => {
                    const isApproved = audit.status === 'Approved';
                    const isBlocked = audit.status === 'Blocked';

                    return (
                      <tr key={audit.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-on-surface truncate max-w-xs">{audit.campaignName}</p>
                          <p className="font-label-code text-[11px] text-on-surface-variant">{audit.id} • {audit.timestamp.split(' at ')[0]}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-meta text-[11px]">
                            {audit.publishingSurface}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span className={isApproved ? 'text-[#10b981]' : isBlocked ? 'text-error' : 'text-secondary'}>
                              {audit.healthScore} / 100
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-label-meta text-[10px] uppercase font-bold inline-flex items-center gap-1 ${
                              isApproved
                                ? 'bg-[#ecfdf5] text-[#10b981]'
                                : isBlocked
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-surface-container-high text-secondary'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-[#10b981]' : isBlocked ? 'bg-error' : 'bg-secondary'}`}></span>
                            {audit.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onNavigate('detailed-report')}
                            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[12px] transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Policy Health & Active Guardrails (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Category Health Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">Category Compliance</span>
              <span className="font-label-code text-label-code text-primary font-semibold">NovaFit v2.8</span>
            </div>

            <div className="flex flex-col gap-3 font-body-sm text-body-sm">
              {[
                { name: 'Marketing Claims', pass: 88, color: 'bg-primary' },
                { name: 'Brand Voice Realism', pass: 92, color: 'bg-secondary-container' },
                { name: 'Mandatory Disclaimers', pass: 79, color: 'bg-[#f59e0b]' },
                { name: 'Terminology (NovaFit)', pass: 99, color: 'bg-[#10b981]' },
                { name: 'Community Slogans', pass: 100, color: 'bg-[#10b981]' }
              ].map((cat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-on-surface">{cat.name}</span>
                    <span className="font-label-code font-bold text-on-surface">{cat.pass}% Compliant</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.pass}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('brand-guidelines')}
              className="mt-2 w-full py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-body-sm transition-colors text-center"
            >
              Configure Policy Ruleset
            </button>
          </div>

          {/* Elena Vance Governance Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-[13px]">
                EV
              </div>
              <div className="flex flex-col">
                <span className="font-body-sm font-semibold text-on-surface">Elena Vance</span>
                <span className="font-label-meta text-label-meta text-on-surface-variant">Assigned Brand Officer</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#10b981] font-label-meta text-[10px] font-bold">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
