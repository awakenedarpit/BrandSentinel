import React from 'react';

interface HelpDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDocumentationModal: React.FC<HelpDocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-surface-container-lowest shadow-2xl p-space-xl flex flex-col gap-space-md border border-outline-variant/30 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                BrandSentinel AI Documentation
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enterprise Brand Governance & Automated Policy Auditing Manual
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 font-body-sm text-body-sm text-on-surface">
          <div>
            <h4 className="font-semibold text-primary uppercase font-label-meta tracking-wider mb-1">
              1. What is BrandSentinel AI?
            </h4>
            <p className="text-on-surface-variant leading-relaxed">
              BrandSentinel AI protects corporate brand reputation, consumer trust, and regulatory compliance by continuously auditing marketing copy, campaign briefs, social media posts, and advertising assets against verified brand manuals and legal policies before publication.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary uppercase font-label-meta tracking-wider mb-1">
              2. Core Workflow & Demo Brand (NovaFit)
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              <li><strong>Brand Guidelines:</strong> Central repository of policy rules (e.g. BG-001 prohibiting "guaranteed results", BG-003 mandating "Results vary by individual.").</li>
              <li><strong>Content Auditor:</strong> Real-time dual-pane workspace where copywriters and marketing teams compose or paste copy and receive instantaneous telemetry and AI-suggested compliant fixes.</li>
              <li><strong>Forensic Audit Report:</strong> Complete evidentiary certificate detailing cosine distance citations to authoritative PDF manuals and a side-by-side remediation comparison.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary uppercase font-label-meta tracking-wider mb-1">
              3. Preparing for Real Backend & Gemini AI
            </h4>
            <p className="text-on-surface-variant leading-relaxed">
              Currently, BrandSentinel AI operates with a high-speed local deterministic compliance engine and labeled local demo datasets. When you are ready to integrate Gemini 1.5 Pro/Flash, vector search, or Cloud Storage:
            </p>
            <div className="p-3 rounded-lg bg-surface-container-low font-label-code text-xs text-on-surface mt-2 border border-outline-variant/20">
              <p className="font-bold text-primary mb-1">Security Best Practice:</p>
              <p>1. Keep Gemini API keys on your backend server (e.g. Express, Fastify, Next.js API, or Cloud Run).</p>
              <p>2. Call your backend endpoint from <code>src/modules/ai/aiService.ts</code>.</p>
              <p>3. Never expose API keys or service credentials in client-side code.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-sm shadow-sm hover:bg-primary-container transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
