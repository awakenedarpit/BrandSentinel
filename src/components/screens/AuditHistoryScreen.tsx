import React, { useState, useEffect } from 'react';
import { AuditReport } from '../../types';
import { fetchAuditHistory } from '../../services/auditService';

interface AuditHistoryScreenProps {
  onOpenReport: (report: AuditReport) => void;
}

export const AuditHistoryScreen: React.FC<AuditHistoryScreenProps> = ({
  onOpenReport
}) => {
  const [history, setHistory] = useState<AuditReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local'>('local');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [surfaceFilter, setSurfaceFilter] = useState('All');

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAuditHistory();
      setHistory(res.reports);
      setSource(res.source);
      if (res.error) {
        console.warn('[AuditHistory] Fallback note:', res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (surfaceFilter !== 'All' && !item.publishingSurface.toLowerCase().includes(surfaceFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchName = item.campaignName.toLowerCase().includes(q);
      const matchCopy = item.submittedCopy.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchCopy) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-space-xs mb-1">
            <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-semibold">
              Compliance Ledger
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-code text-label-code text-on-surface-variant font-medium">
              Permanent Audit Trail
            </span>
            <span className="text-outline-variant">•</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-label-code font-bold uppercase ${
              source === 'supabase' ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {source === 'supabase' ? 'Supabase Live Ledger' : 'Local Demo Archive'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Audit History & Records
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Forensic archive of marketing assets audited against your brand brand safety policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-colors"
            title="Refresh audit history"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => alert('Exporting full audit archive CSV with cryptographic timestamps.')}
            className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-all shadow-sm self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Archive (CSV)</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-space-md p-3.5 rounded-xl bg-error-container text-on-error-container flex items-center justify-between">
          <div className="flex items-center gap-2 font-body-sm">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
          <button onClick={loadHistory} className="font-semibold text-xs underline">
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm mb-space-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="relative flex-1 min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audits by campaign, ID (e.g. account audit report), or copy..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm font-semibold outline-none hover:bg-surface-container transition-colors cursor-pointer"
            >
              <option value="All">All Verdicts</option>
              <option value="Approved">Approved</option>
              <option value="Blocked">Blocked</option>
              <option value="Review Required">Review Required</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Surface Filter */}
          <div className="relative">
            <select
              value={surfaceFilter}
              onChange={(e) => setSurfaceFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm font-semibold outline-none hover:bg-surface-container transition-colors cursor-pointer"
            >
              <option value="All">All Channels</option>
              <option value="Social">Social Media</option>
              <option value="Email">Email</option>
              <option value="Landing">Landing Page</option>
              <option value="Influencer">Influencer</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">sync</span>
            <p className="font-body-md text-body-md font-semibold">Loading compliance records from ledger...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/50">inbox</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No Audit Records Found</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              {searchQuery || statusFilter !== 'All' || surfaceFilter !== 'All'
                ? 'Try broadening your search query or reset your filter criteria.'
                : 'No audits have been executed yet. Run an audit in Content Auditor to populate your ledger.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/20 text-on-surface-variant font-label-meta text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Audit ID</th>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Surface / Channel</th>
                  <th className="py-3 px-4">Health Index</th>
                  <th className="py-3 px-4">Verdict Status</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredHistory.map((item) => {
                  const isApproved = item.status === 'Approved';
                  const isBlocked = item.status === 'Blocked';

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 font-label-code text-primary font-bold">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-on-surface truncate max-w-sm">{item.campaignName}</p>
                        <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1 italic mt-0.5">
                          "{item.submittedCopy}"
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-meta text-[11px]">
                          {item.publishingSurface}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-headline-sm text-[15px] font-bold ${
                          isApproved ? 'text-[#10b981]' : isBlocked ? 'text-error' : 'text-secondary'
                        }`}>
                          {item.healthScore} / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-label-meta text-[10px] uppercase font-bold inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-[#ecfdf5] text-[#10b981]'
                              : isBlocked
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container-high text-secondary'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isApproved ? 'bg-[#10b981]' : isBlocked ? 'bg-error' : 'bg-secondary'
                          }`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                            {item.approver.avatarInitials}
                          </div>
                          <span className="text-on-surface font-medium">{item.approver.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenReport(item)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-body-sm transition-colors"
                        >
                          Inspect Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
