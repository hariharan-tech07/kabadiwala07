import React, { useRef, useEffect } from 'react';
import { User, VernacularLang } from '../../types';
import { translations } from '../../translations';
import {
  Headphones, Camera, MapPin, MessageSquare, FileText,
  TrendingUp, ShieldAlert, Sliders, Scale, ShieldCheck,
  FileSpreadsheet, Users, Gavel, Clock, Sparkles, Layers
} from 'lucide-react';

export interface DashboardNavModule {
  id: string;
  num: string;
  shortTitle: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  desc?: string;
}

interface DashboardNavigationBarProps {
  role: 'scrapper' | 'recycler' | 'admin';
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  lang: VernacularLang;
  adminOverrideMode?: 'admin_oversight' | 'control_scrapper' | 'control_recycler';
  badgeCounts?: {
    complaints?: number;
    lots?: number;
    unreadChat?: number;
  };
}

export const DashboardNavigationBar: React.FC<DashboardNavigationBarProps> = ({
  role,
  activeTab,
  onSelectTab,
  lang,
  adminOverrideMode = 'admin_oversight',
  badgeCounts
}) => {
  const t = translations[lang] || translations.en;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Define module sets for each role
  const getModulesForRole = (): DashboardNavModule[] => {
    // When Admin is controlling Scrapper
    if (role === 'admin' && adminOverrideMode === 'control_scrapper') {
      return getScrapperModules();
    }
    // When Admin is controlling Recycler
    if (role === 'admin' && adminOverrideMode === 'control_recycler') {
      return getRecyclerModules();
    }

    if (role === 'scrapper') {
      return getScrapperModules();
    }
    if (role === 'recycler') {
      return getRecyclerModules();
    }
    return getAdminModules();
  };

  const getScrapperModules = (): DashboardNavModule[] => [
    {
      id: 'safety',
      num: '1',
      shortTitle: t.modSafety?.label || 'Safety Voice',
      label: t.modSafety?.title || 'Safety Guidance (Voice)',
      icon: Headphones,
      badge: lang === 'hi' ? 'ऑडियो' : lang === 'mr' ? 'ऑडिओ' : lang === 'ta' ? 'ஆடியோ' : 'Audio',
      desc: t.modSafety?.desc || 'Vernacular audio advisory'
    },
    {
      id: 'capture',
      num: '2',
      shortTitle: t.modCapture?.label || 'Capture & Scale',
      label: t.modCapture?.title || 'Camera, AI & Scale Lock',
      icon: Camera,
      badge: 'AI Lock',
      desc: t.modCapture?.desc || 'AI material detection & scale'
    },
    {
      id: 'map',
      num: '3',
      shortTitle: t.modMap?.label || 'Map Radar',
      label: t.modMap?.title || 'Map Radar & Recyclers',
      icon: MapPin,
      badge: 'GPS',
      desc: t.modMap?.desc || 'Nearby recycling hubs'
    },
    {
      id: 'chat',
      num: '4',
      shortTitle: t.modChat?.label || 'Recycler Chat',
      label: t.modChat?.title || 'Recycler Negotiation Chat',
      icon: MessageSquare,
      badge: badgeCounts?.unreadChat ? `${badgeCounts.unreadChat}` : undefined,
      desc: t.modChat?.desc || 'Direct facility discussions'
    },
    {
      id: 'lots',
      num: '5',
      shortTitle: t.modLots?.label || 'My Lots',
      label: t.modLots?.title || 'Broadcasted Lots & Gate Pass',
      icon: FileText,
      badge: badgeCounts?.lots ? `${badgeCounts.lots}` : undefined,
      desc: t.modLots?.desc || 'Lot history & traceability'
    },
    {
      id: 'rates',
      num: '6',
      shortTitle: t.modRates?.label || 'Benchmark Rates',
      label: t.modRates?.title || 'CPCB Benchmark Rates',
      icon: TrendingUp,
      badge: 'CPCB',
      desc: t.modRates?.desc || 'Statutory minimum pricing'
    },
    {
      id: 'complaints',
      num: '7',
      shortTitle: t.modScrapComplaints?.label || 'Grievance Desk',
      label: t.modScrapComplaints?.title || 'Grievance & Dispute Desk',
      icon: ShieldAlert,
      badge: badgeCounts?.complaints ? `${badgeCounts.complaints}` : undefined,
      desc: t.modScrapComplaints?.desc || 'Tribunal dispute filing'
    }
  ];

  const getRecyclerModules = (): DashboardNavModule[] => [
    {
      id: 'lots',
      num: '1',
      shortTitle: t.modRecLots?.label || 'Inward Lots',
      label: t.modRecLots?.title || 'Inward Lots & Inspection',
      icon: FileText,
      badge: badgeCounts?.lots ? `${badgeCounts.lots}` : undefined,
      desc: t.modRecLots?.desc || 'Incoming scrap manifest'
    },
    {
      id: 'rates',
      num: '2',
      shortTitle: t.modRecRates?.label || 'Rate Board',
      label: t.modRecRates?.title || 'Purchase Rate Board',
      icon: Sliders,
      badge: 'Live',
      desc: t.modRecRates?.desc || 'Configure buying rates'
    },
    {
      id: 'weighment',
      num: '3',
      shortTitle: t.modRecWeigh?.label || 'Weighment Scale',
      label: t.modRecWeigh?.title || 'Certified Weighment Scale',
      icon: Scale,
      badge: 'Scale',
      desc: t.modRecWeigh?.desc || 'Digital weighment bridge'
    },
    {
      id: 'map',
      num: '4',
      shortTitle: t.modRecMap?.label || 'Geo Radar',
      label: t.modRecMap?.title || 'Geospatial Collection Radar',
      icon: MapPin,
      badge: 'Radar',
      desc: t.modRecMap?.desc || 'Field scrapper tracking'
    },
    {
      id: 'chat',
      num: '5',
      shortTitle: t.modRecChat?.label || 'Scrapper Desk',
      label: t.modRecChat?.title || 'Scrapper Negotiation Desk',
      icon: MessageSquare,
      badge: badgeCounts?.unreadChat ? `${badgeCounts.unreadChat}` : undefined,
      desc: t.modRecChat?.desc || 'Deal negotiations & payouts'
    },
    {
      id: 'compliance',
      num: '6',
      shortTitle: t.modRecCompliance?.label || 'EPR Compliance',
      label: t.modRecCompliance?.title || 'EPR & CPCB Compliance Records',
      icon: ShieldCheck,
      badge: 'CPCB EPR',
      desc: t.modRecCompliance?.desc || 'Audit manifests & certificates'
    }
  ];

  const getAdminModules = (): DashboardNavModule[] => [
    {
      id: 'transactions',
      num: '1',
      shortTitle: t.modAdmTx?.label || 'National Ledger',
      label: t.modAdmTx?.title || 'National Transaction Ledger',
      icon: FileSpreadsheet,
      badge: 'Ledger',
      desc: t.modAdmTx?.desc || 'End-to-end e-waste transactions'
    },
    {
      id: 'users',
      num: '2',
      shortTitle: t.modAdmUsers?.label || 'Stakeholders',
      label: t.modAdmUsers?.title || 'Stakeholder KYC Directory',
      icon: Users,
      badge: 'KYC',
      desc: t.modAdmUsers?.desc || 'Verified collectors & plants'
    },
    {
      id: 'rates',
      num: '3',
      shortTitle: t.modAdmRates?.label || 'Price Control',
      label: t.modAdmRates?.title || 'CPCB Statutory Price Control',
      icon: TrendingUp,
      badge: 'Statutory',
      desc: t.modAdmRates?.desc || 'National fair pricing indices'
    },
    {
      id: 'complaints',
      num: '4',
      shortTitle: t.modAdmComplaints?.label || 'Grievance Redressal',
      label: t.modAdmComplaints?.title || 'Grievance Redressal Tribunal',
      icon: ShieldAlert,
      badge: badgeCounts?.complaints ? `${badgeCounts.complaints}` : undefined,
      desc: t.modAdmComplaints?.desc || 'Dispute arbitration'
    },
    {
      id: 'legal',
      num: '5',
      shortTitle: t.modAdmLegal?.label || 'Legal Enforcement',
      label: t.modAdmLegal?.title || 'Legal Enforcement & Show-Cause',
      icon: Gavel,
      badge: 'Enforce',
      desc: t.modAdmLegal?.desc || 'Regulatory notices & penalties'
    },
    {
      id: 'audit',
      num: '6',
      shortTitle: t.modAdmAudit?.label || 'Audit Trail',
      label: t.modAdmAudit?.title || 'Statutory Audit Trail',
      icon: Clock,
      badge: 'Audit',
      desc: t.modAdmAudit?.desc || 'Immutable logs & PostgreSQL DDL'
    }
  ];

  const modules = getModulesForRole();
  const activeModule = modules.find(m => m.id === activeTab) || modules[0];

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  // Role-specific theme styling
  const getTheme = () => {
    const effectiveRole = (role === 'admin' && adminOverrideMode === 'control_scrapper')
      ? 'scrapper'
      : (role === 'admin' && adminOverrideMode === 'control_recycler')
      ? 'recycler'
      : role;

    switch (effectiveRole) {
      case 'scrapper':
        return {
          activeTabClass: 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-1 ring-emerald-600',
          activeBadgeClass: 'bg-emerald-800 text-emerald-100',
          activeNumberClass: 'bg-emerald-500 text-slate-950 font-black',
          inactiveHover: 'hover:bg-emerald-50/80 hover:text-emerald-950',
          iconColor: 'text-emerald-700',
          barBorder: 'border-emerald-200/80',
          roleBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          roleTitle: 'Scrap Collector Portal'
        };
      case 'recycler':
        return {
          activeTabClass: 'bg-blue-700 text-white shadow-md shadow-blue-700/25 ring-1 ring-blue-600',
          activeBadgeClass: 'bg-blue-800 text-blue-100',
          activeNumberClass: 'bg-blue-400 text-slate-950 font-black',
          inactiveHover: 'hover:bg-blue-50/80 hover:text-blue-950',
          iconColor: 'text-blue-700',
          barBorder: 'border-blue-200/80',
          roleBadge: 'bg-blue-100 text-blue-800 border-blue-300',
          roleTitle: 'Recycling Facility Portal'
        };
      case 'admin':
      default:
        return {
          activeTabClass: 'bg-slate-900 text-white shadow-md shadow-slate-900/30 ring-1 ring-slate-800',
          activeBadgeClass: 'bg-amber-400 text-slate-950 font-bold',
          activeNumberClass: 'bg-amber-400 text-slate-950 font-black',
          inactiveHover: 'hover:bg-amber-50/80 hover:text-amber-950',
          iconColor: 'text-amber-600',
          barBorder: 'border-amber-200/80',
          roleBadge: 'bg-amber-100 text-amber-900 border-amber-300',
          roleTitle: 'CPCB Central Administration'
        };
    }
  };

  const theme = getTheme();

  return (
    <nav
      aria-label="Dashboard Workflow Navigation"
      className="w-full mb-4 sm:mb-6 select-none"
    >
      {/* Container with backdrop blur & subtle border */}
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl border ${theme.barBorder} shadow-xs p-1.5 sm:p-2 transition-all`}>
        
        {/* Horizontal Navigation Ribbon */}
        <div
          ref={scrollContainerRef}
          role="tablist"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {modules.map((mod) => {
            const isActive = mod.id === activeTab;
            const Icon = mod.icon;

            return (
              <button
                key={mod.id}
                role="tab"
                id={`dash-tab-${mod.id}`}
                aria-selected={isActive}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => onSelectTab(mod.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer min-h-[44px] ${
                  isActive
                    ? theme.activeTabClass
                    : `bg-slate-50/90 text-slate-700 border border-slate-200/80 ${theme.inactiveHover}`
                }`}
              >
                {/* Step Number Tag */}
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                    isActive
                      ? theme.activeNumberClass
                      : 'bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  {mod.num}
                </span>

                {/* Module Icon */}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white scale-105' : theme.iconColor
                  }`}
                />

                {/* Module Label */}
                <span className="whitespace-nowrap tracking-tight">
                  {mod.shortTitle}
                </span>

                {/* Optional Status Badge or Count */}
                {mod.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 transition-colors ${
                      isActive
                        ? theme.activeBadgeClass
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Section Info Strip */}
        <div className="flex items-center justify-between px-2 pt-2 mt-1.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden xs:inline">
              Active Module:
            </span>
            <span className="font-bold text-slate-900 truncate flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{activeModule?.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {modules.findIndex(m => m.id === activeTab) + 1} of {modules.length}
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${theme.roleBadge}`}>
              {theme.roleTitle}
            </span>
          </div>
        </div>

      </div>
    </nav>
  );
};
