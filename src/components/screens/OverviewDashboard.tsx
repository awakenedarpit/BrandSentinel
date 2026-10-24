import React from 'react';
import { ScreenId } from '../layout/Sidebar';

interface OverviewDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenImportModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, onOpenImportModal }) => (
  <div className="flex w-full flex-col gap-6 pb-16">
    <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm">
      <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold uppercase tracking-wider text-on-primary-fixed">Private brand workspace</span>
      <h1 className="mt-4 text-3xl font-bold text-on-surface">Welcome to BrandSentinel AI</h1>
      <p className="mt-3 max-w-2xl text-on-surface-variant">Your workspace starts with your documents and your rules. Upload your brand book or regulations PDF to build a knowledge base before running an audit. No demo reports or sample policies are mixed into your account.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onOpenImportModal} className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary">Upload brand guidelines</button>
        <button onClick={() => onNavigate('brand-guidelines')} className="rounded-xl border border-outline-variant px-5 py-3 font-semibold text-on-surface">Manage brand rules</button>
        <button onClick={() => onNavigate('content-auditor')} className="rounded-xl border border-outline-variant px-5 py-3 font-semibold text-on-surface">Open content auditor</button>
      </div>
    </section>
    <section className="grid gap-4 md:grid-cols-3">
      <button onClick={() => onNavigate('knowledge-base')} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-left hover:border-primary">
        <span className="material-symbols-outlined text-primary">library_books</span>
        <h2 className="mt-3 font-semibold text-on-surface">Knowledge Base</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Upload and review documents belonging to your account.</p>
      </button>
      <button onClick={() => onNavigate('brand-guidelines')} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-left hover:border-primary">
        <span className="material-symbols-outlined text-primary">rule</span>
        <h2 className="mt-3 font-semibold text-on-surface">Brand Guidelines</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Review extracted rules and add account-specific policies.</p>
      </button>
      <button onClick={() => onNavigate('audit-history')} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-left hover:border-primary">
        <span className="material-symbols-outlined text-primary">history</span>
        <h2 className="mt-3 font-semibold text-on-surface">Audit History</h2>
        <p className="mt-1 text-sm text-on-surface-variant">See audits saved under your signed-in account.</p>
      </button>
    </section>
  </div>
);
