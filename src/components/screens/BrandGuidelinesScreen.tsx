import React, { useState } from 'react';
import { BrandRule, PolicyCategory } from '../../types';

interface BrandGuidelinesScreenProps {
  rules: BrandRule[];
  onToggleRule: (ruleId: string) => void;
  onOpenImportModal: () => void;
  onAddNewRule: (newRule: BrandRule) => void;
}

export const BrandGuidelinesScreen: React.FC<BrandGuidelinesScreenProps> = ({
  rules,
  onToggleRule,
  onOpenImportModal,
  onAddNewRule
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All Rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [originFilter, setOriginFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Draft' | 'Archived'>('Active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  // New Rule Form State
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<PolicyCategory>('Marketing Claims');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'high' | 'medium' | 'low'>('high');
  const [newRuleStatement, setNewRuleStatement] = useState('');
  const [newRuleProhibited, setNewRuleProhibited] = useState('');
  const [newRuleApproved, setNewRuleApproved] = useState('');

  // Category list with counts
  const categories: { label: string; count: number }[] = [
    { label: 'All Rules', count: rules.length },
    { label: 'Brand Voice', count: rules.filter(r => r.category === 'Brand Voice').length },
    { label: 'Marketing Claims', count: rules.filter(r => r.category === 'Marketing Claims').length },
    { label: 'Approved & Prohibited Phrases', count: rules.filter(r => r.category === 'Approved & Prohibited Phrases').length },
    { label: 'Required Disclaimers', count: rules.filter(r => r.category === 'Required Disclaimers').length },
    { label: 'Terminology', count: rules.filter(r => r.category === 'Terminology').length }
  ];

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    // Category filter
    if (activeCategory !== 'All Rules' && rule.category !== activeCategory) {
      return false;
    }
    // Severity filter
    if (severityFilter !== 'All' && rule.severity !== severityFilter.toLowerCase()) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = rule.id.toLowerCase().includes(q);
      const matchTitle = rule.title.toLowerCase().includes(q);
      const matchStatement = rule.statement.toLowerCase().includes(q);
      const matchProhibited = rule.prohibitedPatterns.some((p) => p.toLowerCase().includes(q));
      if (!matchId && !matchTitle && !matchStatement && !matchProhibited) {
        return false;
      }
    }
    return true;
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle || !newRuleStatement) return;

    const nextId = `BG-00${rules.length + 1}`;
    const created: BrandRule = {
      id: nextId,
      title: newRuleTitle,
      category: newRuleCategory,
      severity: newRuleSeverity,
      isActive: true,
      statement: newRuleStatement,
      source: {
        docName: 'Manual_Configuration_Console.md',
        type: 'manual'
      },
      prohibitedPatterns: newRuleProhibited.split(',').map(s => s.trim()).filter(Boolean),
      approvedSubstitutions: newRuleApproved.split(',').map(s => s.trim()).filter(Boolean),
      enforcedChannels: ['Social Media', 'Paid Ads', 'Landing Pages']
    };

    onAddNewRule(created);
    setShowAddRuleModal(false);
    setNewRuleTitle('');
    setNewRuleStatement('');
    setNewRuleProhibited('');
    setNewRuleApproved('');
  };

  const handleExportRuleset = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(rules, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `BrandSentinel_BrandRules.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Meta Scrim & Sub-header */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm mb-space-lg p-space-lg border border-outline-variant/30">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary-container/10 via-secondary-container/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-lg">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-code text-label-code tracking-wider uppercase font-semibold">
                Brand Governance Engine
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-code text-label-code flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                Your workspace policies
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-meta text-label-meta tracking-wider uppercase font-bold">
                Account Configuration
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Brand Guidelines
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Define, configure, and inspect the foundational guardrails that keep your brand consistent, legally compliant, and on-tone across digital touchpoints.
            </p>

            <div className="flex flex-wrap items-center gap-space-md mt-2 pt-2 text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
                <span className="font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Target Entity:</span>{' '}
                  <strong className="text-on-surface font-semibold">Your brand</strong>
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">record_voice_over</span>
                <span className="font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Voice Persona:</span>{' '}
                  <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary font-medium font-body-sm">
                    Encouraging, Realistic, Inclusive
                  </span>
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">history</span>
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
                  Indexed 12 mins ago
                </span>
              </div>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-space-sm self-start xl:self-center">
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">upload_file</span>
              <span>Import PDF / Markdown</span>
            </button>

            <button
              onClick={handleExportRuleset}
              className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">download</span>
              <span>Export Ruleset</span>
            </button>

            <button
              onClick={() => setShowAddRuleModal(true)}
              className="flex items-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-md hover:bg-secondary-container transition-all hover:scale-[1.01]"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add New Rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Automated RAG Rapid Ingestion Drawer Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg mb-space-lg shadow-sm border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 text-primary shadow-sm">
              <span className="material-symbols-outlined text-[26px]">smart_toy</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Automated RAG Guideline Extraction
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-code text-label-code font-semibold">
                  Gemini 1.5 Pro Extractor
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-meta text-[10px] uppercase tracking-wide">
                  OCR Enabled
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                Drop fresh Brand PDF books or style sheets to semantically tokenize prohibited claims, mandatory legal copy, and brand voice guidelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-sm flex-shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface">
              <span className="material-symbols-outlined text-[#10b981] text-[18px]">verified</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium truncate max-w-xs">
                Extracted <span className="text-primary font-semibold">8 rules</span> from <span className="font-label-code text-label-code font-semibold">your brand_Compliance_Manual_2025.pdf</span>
              </span>
            </div>
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Inspect Log</span>
            </button>
          </div>
        </div>

        {/* Quick Dropzone Strip */}
        <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low/70 flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/10">
          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            </div>
            <div>
              <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                Drag & drop brand deck, legal mandate PDF, or markdown repo
              </p>
              <p className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
                Supports PDF, DOCX, MD up to 45MB • Auto-chunks into Vector Embeddings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImportModal}
              className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-body-sm font-semibold transition-colors shadow-sm"
            >
              Browse Files
            </button>
            <span className="font-label-code text-[11px] text-on-surface-variant">or</span>
            <button
              onClick={() => alert('Notion Workspace Integration: Connected to your brand Marketing Hub.')}
              className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-primary text-body-sm font-semibold transition-colors shadow-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
              Connect Notion
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 mb-space-md gap-2 border-b-0">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-container-low">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold transition-all ${
                activeCategory === cat.label
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full font-label-code text-[10px] ${
                  activeCategory === cat.label
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Stats Telemetry Spark */}
        <div className="hidden xl:flex items-center gap-space-md px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
            <span className="font-label-meta text-label-meta text-on-surface-variant">5 Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
            <span className="font-label-meta text-label-meta text-on-surface-variant">12 Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span className="font-label-meta text-label-meta text-on-surface-variant">7 Guideline</span>
          </div>
        </div>
      </div>

      {/* Search & Control Bar */}
      <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm mb-space-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules by keyword, Rule ID (e.g. BG-001), or excerpt..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm font-semibold outline-none hover:bg-surface-container transition-colors cursor-pointer"
            >
              <option value="All">All Severities (Any)</option>
              <option value="High">High Severity (Red)</option>
              <option value="Medium">Medium Severity (Amber)</option>
              <option value="Low">Low / Guideline (Green)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Origin Filter */}
          <div className="relative">
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm font-semibold outline-none hover:bg-surface-container transition-colors cursor-pointer"
            >
              <option value="All">All Sources (Combined)</option>
              <option value="PDF">Extracted via RAG PDF</option>
              <option value="Manual">Manually Configured Policy</option>
              <option value="Template">Synced Legal Template</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Status Toggle Pills */}
          <div className="flex items-center p-1 rounded-xl bg-surface-container-low">
            {(['Active', 'Draft', 'Archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg font-body-sm text-body-sm font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {status} {status === 'Active' ? `(${rules.length})` : status === 'Draft' ? '(2)' : '(0)'}
              </button>
            ))}
          </div>

          {/* Grid / List Layout */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-surface-container-low">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg ${viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Grid Layout"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-lg ${viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Compact List"
            >
              <span className="material-symbols-outlined text-[18px]">view_agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className={`grid gap-space-lg ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
        {filteredRules.map((rule) => {
          const isHigh = rule.severity === 'high';
          const isMedium = rule.severity === 'medium';
          const borderColor = isHigh ? 'bg-error' : isMedium ? 'bg-[#f59e0b]' : 'bg-[#10b981]';
          const badgeClass = isHigh
            ? 'bg-error-container text-on-error-container'
            : isMedium
            ? 'bg-surface-container-high text-[#b45309]'
            : 'bg-surface-container-high text-[#047857]';

          return (
            <div
              key={rule.id}
              className={`relative flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/30 ${
                rule.id === 'BG-005' ? 'xl:col-span-2' : ''
              }`}
            >
              {/* Left Edge Pillar */}
              <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r ${borderColor}`}></div>

              {/* Card Header Strip */}
              <div className="flex items-start justify-between gap-space-md mb-space-md pl-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-label-code text-label-code font-bold bg-surface-container-low text-on-surface tracking-wider">
                    {rule.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-label-meta text-label-meta uppercase tracking-wider font-semibold flex items-center gap-1 ${badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${borderColor}`}></span>
                    {isHigh ? 'High Severity' : isMedium ? 'Medium Severity' : 'Low / Guideline'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-meta text-label-meta uppercase tracking-wider">
                    {rule.category}
                  </span>
                  {rule.regexPattern && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-meta text-[10px] font-semibold uppercase">
                      Regex Active
                    </span>
                  )}
                </div>

                {/* Card Quick Controls */}
                <div className="flex items-center gap-1">
                  <label className="relative inline-flex items-center cursor-pointer mr-1">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={() => onToggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-surface-container-high after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="Edit Rule">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="Duplicate">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Main Rule Statement */}
              <div className="pl-2 mb-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface leading-snug">
                  “{rule.statement}”
                </h2>
                <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-surface-container-low text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary">menu_book</span>
                  <span className="font-body-sm text-body-sm truncate">
                    Extracted from <strong className="text-on-surface font-semibold">{rule.source.docName}</strong>
                    {rule.source.page ? ` (Page ${rule.source.page})` : ''}
                  </span>
                </div>
              </div>

              {/* Prohibited vs Approved Taxonomies */}
              <div className="pl-2 grid grid-cols-1 md:grid-cols-2 gap-3 mb-space-md">
                {rule.prohibitedPatterns.length > 0 && (
                  <div className="p-3 rounded-xl bg-error-container/30 border border-error/20">
                    <div className="flex items-center gap-1.5 text-error font-label-meta text-label-meta uppercase tracking-wider font-semibold mb-2">
                      <span className="material-symbols-outlined text-[15px]">block</span>
                      <span>Prohibited Patterns</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.prohibitedPatterns.map((pat, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-surface-container-lowest text-error font-label-code text-[11px] line-through decoration-error/50 font-medium">
                          "{pat}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rule.approvedSubstitutions.length > 0 && (
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-[#10b981] font-label-meta text-label-meta uppercase tracking-wider font-semibold mb-2">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Approved Alternatives</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.approvedSubstitutions.map((sub, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-code text-[11px] font-medium">
                          "{sub}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mandatory Disclaimer Box if applicable */}
              {rule.mandatoryCopy && (
                <div className="pl-2 mb-space-md">
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/20">
                    <div className="flex items-center justify-between">
                      <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        Mandatory Legal Copy
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest text-on-surface font-label-code text-body-sm border-l-4 border-primary">
                      “{rule.mandatoryCopy}”
                    </div>
                    {rule.placementRequirement && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {rule.placementRequirement}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Active Channels Footer */}
              <div className="mt-auto pl-2 pt-space-sm flex flex-wrap items-center justify-between gap-space-sm border-t border-outline-variant/20">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-label-meta text-[10px] uppercase text-on-surface-variant font-semibold">
                    Enforced In:
                  </span>
                  {rule.enforcedChannels.map((ch, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-meta text-[11px]">
                      {ch}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
                    {rule.stats?.cleanScans || 250} Scans Clean
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest shadow-2xl p-space-lg flex flex-col gap-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add New Brand Rule</h3>
              <button onClick={() => setShowAddRuleModal(false)} className="p-1 rounded text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateRule} className="flex flex-col gap-3 font-body-sm text-body-sm">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface">Rule Title</label>
                <input
                  type="text"
                  required
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  placeholder="e.g. Prohibited Health Outcome Claims"
                  className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface">Category</label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value as PolicyCategory)}
                    className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface outline-none"
                  >
                    <option value="Marketing Claims">Marketing Claims</option>
                    <option value="Brand Voice">Brand Voice</option>
                    <option value="Approved & Prohibited Phrases">Approved & Prohibited Phrases</option>
                    <option value="Required Disclaimers">Required Disclaimers</option>
                    <option value="Terminology">Terminology</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface">Severity</label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as 'high' | 'medium' | 'low')}
                    className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface outline-none"
                  >
                    <option value="high">High (Blocking)</option>
                    <option value="medium">Medium (Warning)</option>
                    <option value="low">Low (Guideline)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface">Rule Statement</label>
                <textarea
                  required
                  rows={3}
                  value={newRuleStatement}
                  onChange={(e) => setNewRuleStatement(e.target.value)}
                  placeholder="State the core directive clearly..."
                  className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface">Prohibited Phrases (comma-separated)</label>
                <input
                  type="text"
                  value={newRuleProhibited}
                  onChange={(e) => setNewRuleProhibited(e.target.value)}
                  placeholder="e.g. lose 10 lbs fast, miracle workout"
                  className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface">Approved Alternatives (comma-separated)</label>
                <input
                  type="text"
                  value={newRuleApproved}
                  onChange={(e) => setNewRuleApproved(e.target.value)}
                  placeholder="e.g. sustainable fitness, daily routine"
                  className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold shadow-sm hover:bg-primary-container"
                >
                  Save Brand Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
