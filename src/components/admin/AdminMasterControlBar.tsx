import React from 'react';
import { User, VernacularLang } from '../../types';
import {
  ShieldAlert, ShieldCheck, Smartphone, Building2,
  ArrowRight, RefreshCw, CheckCircle2, ChevronRight,
  ExternalLink, UserCheck, AlertTriangle
} from 'lucide-react';

export type AdminActiveMode = 'admin_oversight' | 'control_scrapper' | 'control_recycler';

interface AdminMasterControlBarProps {
  adminUser: User;
  activeMode: AdminActiveMode;
  onSelectMode: (mode: AdminActiveMode) => void;
  controlledScrapper: User | null;
  onSelectScrapper: (scrapper: User) => void;
  availableScrappers: User[];
  controlledRecycler: User | null;
  onSelectRecycler: (recycler: User) => void;
  availableRecyclers: User[];
  lang?: VernacularLang;
}

const BAR_TEXTS: Record<VernacularLang, {
  title: string;
  badge: string;
  desc: string;
  modeOversight: string;
  modeScrapper: string;
  modeRecycler: string;
  scrapperOverrideTitle: string;
  scrapperOverrideDesc: string;
  recyclerOverrideTitle: string;
  recyclerOverrideDesc: string;
  activeCollectorLabel: string;
  activeFacilityLabel: string;
  exitToOversightBtn: string;
  switchToRecyclerBtn: string;
  switchToScrapperBtn: string;
}> = {
  en: {
    title: 'CPCB Central Regulatory Authority • Master Dual Control',
    badge: 'Dual Control Active',
    desc: 'Statutory regulatory authority with complete administrative control over collectors and recycler plants.',
    modeOversight: 'Central CPCB Oversight',
    modeScrapper: 'Control Scrappers',
    modeRecycler: 'Control Recyclers',
    scrapperOverrideTitle: 'Admin Master Override: Controlling Scrapper Operations',
    scrapperOverrideDesc: 'Operating with statutory regulatory privileges on behalf of the selected scrap collector.',
    recyclerOverrideTitle: 'Admin Master Override: Controlling Recycler Facility Operations',
    recyclerOverrideDesc: 'Operating with statutory regulatory privileges on behalf of the selected authorized recycling facility.',
    activeCollectorLabel: 'Active Controlled Scrapper:',
    activeFacilityLabel: 'Active Controlled Facility:',
    exitToOversightBtn: 'Exit to Central CPCB Oversight',
    switchToRecyclerBtn: 'Switch to Recycler Control →',
    switchToScrapperBtn: 'Switch to Scrapper Control →'
  },
  hi: {
    title: 'केंद्रीय CPCB विनियामक प्राधिकरण • मास्टर दोहरा नियंत्रण',
    badge: 'दोहरा नियंत्रण सक्रिय',
    desc: 'कबाड़ीवालों और रिसाइक्लिंग संयंत्रों दोनों पर पूर्ण प्रशासनिक व विनियामक नियंत्रण।',
    modeOversight: 'केंद्रीय CPCB निगरानी',
    modeScrapper: 'कबाड़ीवाला संचालन नियंत्रण',
    modeRecycler: 'रिसाइकलर संयंत्र नियंत्रण',
    scrapperOverrideTitle: 'प्रशासक मास्टर ओवरराइड: कबाड़ीवाला संचालन नियंत्रण',
    scrapperOverrideDesc: 'चयनित कबाड़ संग्रहकर्ता की ओर से पूर्ण विनियामक अधिकारों के साथ संचालन।',
    recyclerOverrideTitle: 'प्रशासक मास्टर ओवरराइड: रिसाइकलर सुविधा नियंत्रण',
    recyclerOverrideDesc: 'चयनित प्रमाणित रिसाइक्लिंग संयंत्र की ओर से पूर्ण विनियामक अधिकारों के साथ संचालन।',
    activeCollectorLabel: 'नियंत्रित कबाड़ीवाला:',
    activeFacilityLabel: 'नियंत्रित रिसाइकलर सुविधा:',
    exitToOversightBtn: 'केंद्रीय CPCB निगरानी पर वापस जाएं',
    switchToRecyclerBtn: 'रिसाइकलर नियंत्रण पर जाएं →',
    switchToScrapperBtn: 'कबाड़ीवाला नियंत्रण पर जाएं →'
  },
  mr: {
    title: 'केंद्रीय CPCB नियामक प्राधिकरण • मास्टर दुहेरी नियंत्रण',
    badge: 'दुहेरी नियंत्रण सक्रिय',
    desc: 'भंगार वेचक आणि रिसायकलिंग प्लांट्स या दोघांवर संपूर्ण प्रशासकीय आणि नियामक नियंत्रण.',
    modeOversight: 'केंद्रीय CPCB देखरेख',
    modeScrapper: 'भंगार वेचक नियंत्रण',
    modeRecycler: 'रिसायकलर केंद्र नियंत्रण',
    scrapperOverrideTitle: 'ॲडमिन मास्टर ओव्हरराइड: भंगार वेचक संचालन नियंत्रण',
    scrapperOverrideDesc: 'निवडलेल्या भंगार संकलकाच्या वतीने संपूर्ण नियामक अधिकारांसह कामकाज.',
    recyclerOverrideTitle: 'ॲडमिन मास्टर ओव्हरराइड: रिसायकलर केंद्र संचालन नियंत्रण',
    recyclerOverrideDesc: 'निवडलेल्या अधिकृत रिसायकलिंग केंद्राच्या वतीने संपूर्ण नियामक अधिकारांसह कामकाज.',
    activeCollectorLabel: 'सक्रिय नियंत्रित वेचक:',
    activeFacilityLabel: 'सक्रिय नियंत्रित केंद्र:',
    exitToOversightBtn: 'केंद्रीय CPCB देखरेखीकडे परत जा',
    switchToRecyclerBtn: 'रिसायकलर नियंत्रणाकडे जा →',
    switchToScrapperBtn: 'भंगार वेचक नियंत्रणाकडे जा →'
  },
  ta: {
    title: 'CPCB மத்திய ஒழுங்குமுறை நிர்வாகம் • முதன்மை இரட்டை கட்டுப்பாடு',
    badge: 'இரட்டை கட்டுப்பாடு செயலில் உள்ளது',
    desc: 'கழிவு சேகரிப்பாளர்கள் மற்றும் மறுசுழற்சி ஆலைகள் இருவர் மீதும் முழு நிர்வாக அதிகாரம்.',
    modeOversight: 'மத்திய CPCB மேற்பார்வை',
    modeScrapper: 'சேகரிப்பாளர் கட்டுப்பாடு',
    modeRecycler: 'மறுசுழற்சி ஆலை கட்டுப்பாடு',
    scrapperOverrideTitle: 'நிர்வாக முதன்மை அதிகாரம்: சேகரிப்பாளர் செயல்பாடுகள்',
    scrapperOverrideDesc: 'தேர்ந்தெடுக்கப்பட்ட கழிவு சேகரிப்பாளரின் சார்பாக முழு ஒழுங்குமுறை அதிகாரத்துடன் செயல்படுகிறது.',
    recyclerOverrideTitle: 'நிர்வாக முதன்மை அதிகாரம்: மறுசுழற்சி ஆலை செயல்பாடுகள்',
    recyclerOverrideDesc: 'தேர்ந்தெடுக்கப்பட்ட அங்கீகரிக்கப்பட்ட மறுசுழற்சி ஆலையின் சார்பாக முழு அதிகாரத்துடன் செயல்படுகிறது.',
    activeCollectorLabel: 'கட்டுப்படுத்தப்படும் சேகரிப்பாளர்:',
    activeFacilityLabel: 'கட்டுப்படுத்தப்படும் ஆலை:',
    exitToOversightBtn: 'மத்திய CPCB மேற்பார்வைக்கு திரும்பு',
    switchToRecyclerBtn: 'மறுசுழற்சி கட்டுப்பாட்டுக்கு மாறு →',
    switchToScrapperBtn: 'சேகரிப்பாளர் கட்டுப்பாட்டுக்கு மாறு →'
  }
};

export const AdminMasterControlBar: React.FC<AdminMasterControlBarProps> = ({
  adminUser,
  activeMode,
  onSelectMode,
  controlledScrapper,
  onSelectScrapper,
  availableScrappers,
  controlledRecycler,
  onSelectRecycler,
  availableRecyclers,
  lang = 'en'
}) => {
  const bt = BAR_TEXTS[lang] || BAR_TEXTS.en;

  return (
    <div className="w-full bg-slate-900 text-white border-b-2 border-amber-500/80 shadow-lg">
      
      {/* Primary Top Bar: Master Mode Switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Administrative Authority Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wide text-white">
                {bt.title}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {bt.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Officer: <strong className="text-slate-200">{adminUser.name}</strong> • CPCB ID: <strong className="text-slate-200">{adminUser.cpcb_number || 'GOV-IN-CPCB-AUDITOR-01'}</strong>
            </p>
          </div>
        </div>

        {/* Right: Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
          
          {/* 1. Central Oversight */}
          <button
            type="button"
            id="admin-mode-oversight-btn"
            onClick={() => onSelectMode('admin_oversight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'admin_oversight'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{bt.modeOversight}</span>
          </button>

          {/* 2. Control Scrappers */}
          <button
            type="button"
            id="admin-mode-scrapper-btn"
            onClick={() => onSelectMode('control_scrapper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'control_scrapper'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{bt.modeScrapper}</span>
          </button>

          {/* 3. Control Recyclers */}
          <button
            type="button"
            id="admin-mode-recycler-btn"
            onClick={() => onSelectMode('control_recycler')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'control_recycler'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{bt.modeRecycler}</span>
          </button>
        </div>
      </div>

      {/* Sub-Bar: Active Target Selector & Override Banner when controlling Scrapper */}
      {activeMode === 'control_scrapper' && (
        <div className="bg-emerald-950/80 border-t border-emerald-700/50 px-3 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Smartphone className="w-4 h-4" />
              </span>
              <div>
                <span className="font-extrabold text-emerald-200">
                  {bt.scrapperOverrideTitle}
                </span>
                <p className="text-[11px] text-emerald-400/90">
                  {bt.scrapperOverrideDesc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="admin-select-scrapper" className="font-bold text-emerald-300">
                {bt.activeCollectorLabel}
              </label>
              <select
                id="admin-select-scrapper"
                value={controlledScrapper?.id || ''}
                onChange={(e) => {
                  const found = availableScrappers.find(s => s.id === e.target.value);
                  if (found) onSelectScrapper(found);
                }}
                className="bg-emerald-900 border border-emerald-600 text-white rounded-lg px-2.5 py-1 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {availableScrappers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location.split(',')[0]} • Aadhaar: {s.aadhaar_last4 || 'Verified'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onSelectMode('admin_oversight')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-[11px] transition-all cursor-pointer ml-1"
              >
                {bt.exitToOversightBtn}
              </button>

              <button
                type="button"
                onClick={() => onSelectMode('control_recycler')}
                className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-[11px] transition-all cursor-pointer"
              >
                {bt.switchToRecyclerBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Bar: Active Target Selector & Override Banner when controlling Recycler */}
      {activeMode === 'control_recycler' && (
        <div className="bg-blue-950/80 border-t border-blue-700/50 px-3 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <span className="font-extrabold text-blue-200">
                  {bt.recyclerOverrideTitle}
                </span>
                <p className="text-[11px] text-blue-400/90">
                  {bt.recyclerOverrideDesc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="admin-select-recycler" className="font-bold text-blue-300">
                {bt.activeFacilityLabel}
              </label>
              <select
                id="admin-select-recycler"
                value={controlledRecycler?.id || ''}
                onChange={(e) => {
                  const found = availableRecyclers.find(r => r.id === e.target.value);
                  if (found) onSelectRecycler(found);
                }}
                className="bg-blue-900 border border-blue-600 text-white rounded-lg px-2.5 py-1 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                {availableRecyclers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.location.split(',')[0]} • CPCB: {r.cpcb_number || 'CPCB/EW/2026'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onSelectMode('admin_oversight')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-[11px] transition-all cursor-pointer ml-1"
              >
                {bt.exitToOversightBtn}
              </button>

              <button
                type="button"
                onClick={() => onSelectMode('control_scrapper')}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] transition-all cursor-pointer"
              >
                {bt.switchToScrapperBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
