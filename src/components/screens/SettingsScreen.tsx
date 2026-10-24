import React, { useState } from 'react';
import { novaFitBrandProfile } from '../../modules/rules/rulesData';

export const SettingsScreen: React.FC = () => {
  const [brandName, setBrandName] = useState(novaFitBrandProfile.name);
  const [industry, setIndustry] = useState(novaFitBrandProfile.industry);
  const [voiceTags, setVoiceTags] = useState(novaFitBrandProfile.voicePersona.join(', '));
  const [threshold, setThreshold] = useState(80);
  const [aiModel, setAiModel] = useState<'gemini-1.5-pro' | 'gemini-1.5-flash' | 'local-deterministic'>('local-deterministic');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('Settings saved successfully. Policy guardrails and thresholds updated.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header */}
      <div className="flex flex-col mb-space-lg">
        <div className="flex items-center gap-space-xs mb-1">
          <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-semibold">
            Governance Configuration
          </span>
          <span className="text-outline-variant">•</span>
          <span className="font-label-code text-label-code text-on-surface-variant font-medium">
            Brand Workspace
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          System & Brand Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Configure entity metadata, compliance thresholds, AI engine parameters, and team reviewers.
        </p>
      </div>

      {saveNotice && (
        <div className="mb-space-md p-3.5 rounded-xl bg-[#ecfdf5] text-[#10b981] font-semibold text-body-sm flex items-center justify-between border border-[#10b981]/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{saveNotice}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-space-lg">
        {/* Section 1: Brand Profile */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Target Brand Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md font-body-sm text-body-sm">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface">Brand Legal Entity Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface">Industry Classification</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface">Voice & Persona Directives (comma-separated)</label>
              <input
                type="text"
                value={voiceTags}
                onChange={(e) => setVoiceTags(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <p className="font-label-meta text-xs text-on-surface-variant">
                Defines the tone baseline for AI rewrites and empathetic language evaluations.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Governance Engine & AI Parameters */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">AI & Policy Engine Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md font-body-sm text-body-sm">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface">Evaluation Engine</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface outline-none cursor-pointer"
              >
                <option value="local-deterministic">Local Deterministic Engine (Offline / Zero-cost)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (via Secure Backend API)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Low-latency Realtime)</option>
              </select>
              <p className="font-label-meta text-xs text-on-surface-variant">
                To connect a real Gemini backend in Phase 4, route requests through your secure server endpoint. API keys are never exposed in frontend code.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-on-surface">Publishing Pass Threshold</label>
                <span className="font-label-code font-bold text-primary">{threshold} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full accent-primary mt-2"
              />
              <p className="font-label-meta text-xs text-on-surface-variant">
                Copy scoring below this threshold is blocked from automatic scheduling.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Governance Team & Sign-Off */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Governance Reviewers & Sign-off</h2>
          </div>

          <div className="flex flex-col gap-3 font-body-sm text-body-sm">
            <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-[12px]">
                  EV
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Elena Vance (VP Brand Governance)</p>
                  <p className="font-label-code text-xs text-on-surface-variant">elena.vance@novafit.internal • Primary Sign-off</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-meta text-[10px] font-bold">
                ADMIN
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold flex items-center justify-center text-[12px]">
                  MC
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Marcus Chen (Marketing Lead)</p>
                  <p className="font-label-code text-xs text-on-surface-variant">marcus.chen@novafit.internal • Campaign Submitter</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-meta text-[10px] font-bold">
                SUBMITTER
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-semibold shadow-md hover:bg-primary-container transition-all"
          >
            Save All Configurations
          </button>
        </div>
      </form>
    </div>
  );
};
