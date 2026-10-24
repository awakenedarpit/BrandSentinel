import React from 'react';
import { BrandSentinelLogo } from './BrandSentinelLogo';

export type ScreenId = 
  | 'overview'
  | 'content-auditor'
  | 'detailed-report'
  | 'brand-guidelines'
  | 'knowledge-base'
  | 'audit-history'
  | 'settings';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenHelp
}) => {
  const navItems = [
    {
      id: 'overview' as ScreenId,
      label: 'Overview',
      icon: 'grid_view'
    },
    {
      id: 'content-auditor' as ScreenId,
      label: 'Content Auditor',
      icon: 'fact_check',
      badge: 'Core'
    },
    {
      id: 'detailed-report' as ScreenId,
      label: 'Detailed Report',
      icon: 'analytics'
    },
    {
      id: 'brand-guidelines' as ScreenId,
      label: 'Brand Guidelines',
      icon: 'rule'
    },
    {
      id: 'knowledge-base' as ScreenId,
      label: 'Knowledge Base',
      icon: 'menu_book'
    },
    {
      id: 'audit-history' as ScreenId,
      label: 'Audit History',
      icon: 'history'
    },
    {
      id: 'settings' as ScreenId,
      label: 'Settings',
      icon: 'settings'
    }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[0_1px_8px_rgba(16,26,53,0.04)] z-50 flex flex-col justify-between border-r border-outline-variant/30 select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div 
          className="h-16 px-space-md flex items-center cursor-pointer bg-surface-container-lowest hover:opacity-95 transition-opacity"
          onClick={() => onNavigate('overview')}
        >
          <BrandSentinelLogo />
        </div>

        {/* Protection Motto */}
        <div className="px-space-md py-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
            <span className="truncate font-label-meta text-label-meta uppercase tracking-wider font-semibold">
              Protect What Matters
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1 px-space-sm mt-space-md">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left w-full ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-on-primary-container' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-body-md text-body-md">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full font-label-meta text-[10px] tracking-wide uppercase font-semibold ${
                      isActive
                        ? 'bg-white/20 text-on-primary-container'
                        : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Workspace */}
      <div className="flex flex-col gap-space-xs p-space-sm bg-surface-container-lowest border-t border-outline-variant/20">
        <button 
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary text-[18px]">domain</span>
            <div className="truncate">
              <p className="font-label-meta text-[10px] text-on-surface-variant uppercase tracking-wider leading-none">
                Workspace
              </p>
              <p className="font-body-sm text-body-sm font-semibold truncate text-on-surface">
                Enterprise Brand Ops
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">unfold_more</span>
        </button>

        <button 
          onClick={onOpenHelp}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-left w-full"
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
          <span className="font-body-sm text-body-sm">Help & Documentation</span>
        </button>

        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-semibold text-on-primary text-[13px]">
                EV
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10b981] ring-2 ring-surface-container-lowest"></span>
            </div>
            <div className="truncate">
              <p className="font-body-sm text-body-sm font-semibold leading-tight text-on-surface truncate">
                Elena Vance
              </p>
              <p className="font-label-meta text-[10px] text-on-surface-variant truncate">
                VP Brand Governance
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('settings')}
            className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant"
            title="Account Settings"
          >
            <span className="material-symbols-outlined text-[16px]">more_vert</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
