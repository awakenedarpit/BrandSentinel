import React, { useState } from 'react';
import { BrandSentinelLogo } from './BrandSentinelLogo';

interface HeaderProps {
  onNewAuditClick: () => void;
  onSearchFocus: () => void;
  onBrandSwitch?: () => void;
  brandName?: string;
  dbStatus?: { connected: boolean; message: string; needsMigration?: boolean };
}

export const Header: React.FC<HeaderProps> = ({
  onNewAuditClick,
  onSearchFocus,
  onBrandSwitch,
  brandName = "NovaFit (Fitness & Wellness)",
  dbStatus
}) => {
  const [notificationCount, setNotificationCount] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(16,26,53,0.04)] z-40 flex items-center justify-between px-space-lg border-b border-outline-variant/20">
      {/* Left Segment */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-2">
          <BrandSentinelLogo shieldOnly className="h-7 w-auto" />
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight hidden lg:inline">
            BrandSentinel
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-code text-label-code uppercase tracking-wider font-semibold">
          Demo Workspace
        </span>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-space-md">
        {/* Brand Switcher Pill */}
        <button
          onClick={onBrandSwitch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
          title="Current Governed Brand Profile"
        >
          <span className="material-symbols-outlined text-secondary text-[18px]">
            local_fire_department
          </span>
          <span className="font-body-sm text-body-sm font-semibold truncate max-w-[200px] sm:max-w-none">
            {brandName}
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
            arrow_drop_down
          </span>
        </button>

        {/* Global Search Bar */}
        <div 
          onClick={onSearchFocus}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span className="font-body-sm text-body-sm">Search or audit...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-label-code text-label-code text-on-surface-variant font-medium">
            ⌘K
          </kbd>
        </div>

        {/* Live Vector Telemetry Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="font-label-meta text-label-meta text-on-surface font-medium">
            Vector Index Synced
          </span>
        </div>

        {/* Database Status Pill */}
        <div 
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-meta text-label-meta font-medium border ${
            dbStatus?.connected 
              ? 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]/30' 
              : dbStatus?.needsMigration
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
          }`}
          title={dbStatus?.message || 'Database status'}
        >
          <span className={`w-2 h-2 rounded-full ${
            dbStatus?.connected ? 'bg-[#10b981]' : dbStatus?.needsMigration ? 'bg-amber-500' : 'bg-secondary'
          }`}></span>
          <span>
            {dbStatus?.connected 
              ? 'Supabase Connected' 
              : dbStatus?.needsMigration 
              ? 'Supabase: Migration Needed' 
              : 'Local Mode (RLS Ready)'}
          </span>
        </div>



        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="System Telemetry & Alerts"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-container-lowest shadow-2xl border border-outline-variant/30 p-space-md z-50">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2">
                <span className="font-headline-sm text-[14px] text-on-surface font-semibold">Governance Alerts</span>
                <button 
                  onClick={() => setNotificationCount(0)}
                  className="font-label-meta text-[10px] text-primary uppercase font-bold hover:underline"
                >
                  Mark read
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-2 rounded-lg bg-error-container/30 text-on-error-container text-body-sm">
                  <p className="font-semibold text-[12px]">Critical Violation in #AUD-2025-0894</p>
                  <p className="text-[11px] text-on-surface-variant">Rule BG-001 flagged "guaranteed results" in Meta Ad copy.</p>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm">
                  <p className="font-semibold text-[12px]">Vector Chunks Synced</p>
                  <p className="text-[11px] text-on-surface-variant">NovaFit_Compliance_Manual_2025.pdf updated with 8 rules.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary New Audit CTA */}
        <button
          onClick={onNewAuditClick}
          className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-[0_1px_2px_rgba(16,26,53,0.1)] hover:bg-secondary-container transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Audit</span>
        </button>

        {/* User Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-semibold text-on-primary text-[12px] shadow-sm select-none"
          title="Elena Vance (VP Brand Governance)"
        >
          EV
        </div>
      </div>
    </header>
  );
};
