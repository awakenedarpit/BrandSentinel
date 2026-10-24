import React, { useState, useEffect } from 'react';
import { Sidebar, ScreenId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/screens/OverviewDashboard';
import { ContentAuditor } from './components/screens/ContentAuditor';
import { AuditReportScreen } from './components/screens/AuditReportScreen';
import { BrandGuidelinesScreen } from './components/screens/BrandGuidelinesScreen';
import { KnowledgeBaseScreen } from './components/screens/KnowledgeBaseScreen';
import { AuditHistoryScreen } from './components/screens/AuditHistoryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ImportModal } from './components/modals/ImportModal';
import { HelpDocumentationModal } from './components/modals/HelpDocumentationModal';
import { BrandRule, AuditReport } from './types';
import { checkSupabaseConnection } from './lib/supabase';
import { fetchBrandRules, toggleBrandRuleInDb, insertBrandRuleToDb } from './services/brandService';
import { saveAuditReportToDb } from './services/auditService';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('content-auditor');
  const [brandRules, setBrandRules] = useState<BrandRule[]>([]);
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking database connection...'
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load: check Supabase connection and fetch persisted rules
  useEffect(() => {
    async function initDatabase() {
      const status = await checkSupabaseConnection();
      setDbStatus(status);

      const rulesRes = await fetchBrandRules();
      setBrandRules(rulesRes.rules || []);
    }
    initDatabase();
  }, []);

  // Toggle active/inactive state of a brand rule
  const handleToggleRule = async (ruleId: string) => {
    let nextState = false;
    setBrandRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        nextState = !r.isActive;
        return { ...r, isActive: nextState };
      }
      return r;
    }));

    setNotificationBanner(`Rule ${ruleId} is now ${nextState ? 'Active' : 'Disabled'}.`);
    setTimeout(() => setNotificationBanner(null), 3000);

    // Persist to Supabase if configured
    await toggleBrandRuleInDb(ruleId, nextState);
  };

  // Add a newly defined brand rule
  const handleAddNewRule = async (newRule: BrandRule) => {
    const { data: authData } = await (await import('./lib/supabase')).supabase.auth.getUser();
    if (!authData.user) { setNotificationBanner('Sign in before adding a rule.'); return; }
    const accountRule = { ...newRule, id: `${authData.user.id.slice(0, 8)}-${newRule.id}` };
    setBrandRules(prev => [accountRule, ...prev]);
    setNotificationBanner(`New brand policy ${accountRule.id} ("${accountRule.title}") created.`);
    setTimeout(() => setNotificationBanner(null), 3500);

    // Persist to Supabase if configured
    await insertBrandRuleToDb(accountRule);
  };

  // Handle RAG extraction completion
  const handleExtractionComplete = async (docName: string, count: number) => {
    setNotificationBanner(`RAG ingestion complete: Indexed vector chunks & extracted ${count} guardrails from ${docName}.`);
    setTimeout(() => setNotificationBanner(null), 4000);

    // Refresh brand rules so newly extracted rules immediately appear in the auditor
    const rulesRes = await fetchBrandRules();
    setBrandRules(rulesRes.rules || []);
  };


  // Listen for Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchActive(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchScreens = [
    { id: 'overview' as ScreenId, title: 'Overview Dashboard', desc: 'Compliance health index, active metrics, telemetry' },
    { id: 'content-auditor' as ScreenId, title: 'Content Auditor', desc: 'Live workspace, Scenario A & B, real-time token highlights' },
    { id: 'detailed-report' as ScreenId, title: 'Detailed Audit Report', desc: 'Your account-specific audit report and citations' },
    { id: 'brand-guidelines' as ScreenId, title: 'Brand Guidelines', desc: 'Your account-specific brand policies and rules' },
    { id: 'knowledge-base' as ScreenId, title: 'Knowledge Base', desc: 'Brand PDFs, vector embeddings, chunk explorer' },
    { id: 'audit-history' as ScreenId, title: 'Audit History', desc: 'Full permanent ledger of past campaign audits' },
    { id: 'settings' as ScreenId, title: 'Settings', desc: 'Brand identity parameters, AI model selection, reviewers' }
  ];

  const filteredScreens = searchScreens.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Workspace Frame (offset by 260px for sidebar) */}
      <div className="pl-[260px] flex-1 flex flex-col min-h-screen">
        {/* Fixed Top Bar */}
        <Header
          onNewAuditClick={() => {
            setCurrentScreen('content-auditor');
            setNotificationBanner('Switched to Content Auditor. Ready to audit fresh copy.');
            setTimeout(() => setNotificationBanner(null), 3000);
          }}
          onSearchFocus={() => setIsSearchActive(true)}
          onBrandSwitch={() => setCurrentScreen('settings')}
          brandName="Your Brand Workspace"
          dbStatus={dbStatus}
        />

        {/* Global Notification Banner */}
        {notificationBanner && (
          <div className="fixed top-20 right-6 z-50 p-3.5 rounded-xl bg-surface-container-lowest border border-primary/30 text-on-surface shadow-xl flex items-center gap-3 animate-fade-in max-w-md">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p className="font-body-sm text-body-sm font-semibold">{notificationBanner}</p>
            <button
              onClick={() => setNotificationBanner(null)}
              className="ml-auto text-on-surface-variant hover:text-on-surface p-1 rounded"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Screen Rendering Area */}
        <main className="w-full pt-20 px-space-lg flex-1">
          {currentScreen === 'overview' && (
            <OverviewDashboard
              onNavigate={(screen) => setCurrentScreen(screen)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {currentScreen === 'content-auditor' && (
            <ContentAuditor
              brandRules={brandRules}
              onOpenReport={(rep) => {
                if (rep) {
                  setActiveReport(rep);
                  saveAuditReportToDb(rep).catch(console.warn);
                }
                setCurrentScreen('detailed-report');
              }}
            />
          )}


          {currentScreen === 'detailed-report' && (
            <AuditReportScreen
              report={activeReport || undefined}
              brandRules={brandRules}
              onBackToAuditor={() => setCurrentScreen('content-auditor')}
              onOpenGuidelines={() => setCurrentScreen('brand-guidelines')}
            />
          )}

          {currentScreen === 'brand-guidelines' && (
            <BrandGuidelinesScreen
              rules={brandRules}
              onToggleRule={handleToggleRule}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onAddNewRule={handleAddNewRule}
            />
          )}

          {currentScreen === 'knowledge-base' && (
            <KnowledgeBaseScreen
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {currentScreen === 'audit-history' && (
            <AuditHistoryScreen
              onOpenReport={(report) => { setActiveReport(report); setCurrentScreen('detailed-report'); }}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen />
          )}
        </main>
      </div>

      {/* Global Quick Search (⌘K) Modal */}
      {isSearchActive && (
        <div 
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-start justify-center pt-24 p-4"
          onClick={() => setIsSearchActive(false)}
        >
          <div 
            className="w-full max-w-xl rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-surface-container-low flex items-center gap-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[20px]">search</span>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to screen, rule, or audit report... (ESC to close)"
                className="w-full bg-transparent text-on-surface font-body-md text-body-md outline-none placeholder:text-on-surface-variant"
              />
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-code text-[11px]">
                ESC
              </span>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto flex flex-col gap-1">
              {filteredScreens.map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => {
                    setCurrentScreen(screen.id);
                    setIsSearchActive(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors text-left"
                >
                  <div>
                    <p className="font-semibold text-on-surface text-body-sm">{screen.title}</p>
                    <p className="font-label-meta text-[11px] text-on-surface-variant">{screen.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RAG PDF Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onExtractionComplete={handleExtractionComplete}
      />

      {/* Help & Documentation Modal */}
      <HelpDocumentationModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
