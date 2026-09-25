import React, { useState, useEffect, useRef } from 'react';
import { User, VernacularLang } from '../types';
import { translations } from '../translations';
import { notifyUser } from './common/NotificationToast';
import {
  playChatMessageSound,
  playTransactionAssignedSound,
  isAudioFeedbackEnabled,
  toggleAudioFeedback,
  subscribeAudioFeedback
} from '../utils/soundEffects';
import {
  ShieldCheck, MapPin, LogOut, Globe, CheckCircle2,
  User as UserIcon, Building2, ShieldAlert, Compass, Bell,
  UserPlus, Scale, Sparkles, X,
  Headphones, Camera, MessageSquare, FileText, TrendingUp,
  Sliders, Clock, Gavel, FileSpreadsheet, Users,
  ChevronDown, Check, Layers, Database, Volume2, VolumeX, Menu, Smartphone
} from 'lucide-react';
import { PWAInstallButton } from './common/PWAInstallButton';

export interface NavModuleItem {
  id: string;
  num: string;
  shortTitle: string;
  label: string;
  icon: any;
  badge?: string;
  subtitle?: string;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  lang: VernacularLang;
  onLangChange: (lang: VernacularLang) => void;
  onOpenMap?: () => void;
  activePath?: string;
  onNavigate?: (path: string) => void;
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  lang,
  onLangChange,
  onOpenMap,
  activePath = '/scrapper',
  onNavigate,
  activeTab,
  onSelectTab
}) => {
  const t = translations[lang] || translations.en;
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCornerMenuOpen, setIsCornerMenuOpen] = useState(false);
  const [audioFeedbackOn, setAudioFeedbackOn] = useState(() => isAudioFeedbackEnabled());

  useEffect(() => {
    return subscribeAudioFeedback((enabled) => setAudioFeedbackOn(enabled));
  }, []);

  const notifMenuRef = useRef<HTMLDivElement>(null);
  const modulesMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const cornerMenuRef = useRef<HTMLDivElement>(null);

  const LANGUAGES: Array<{ code: VernacularLang; label: string; native: string }> = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' }
  ];

  // Build role-specific navigation modules for the Navbar Menubar
  const getModules = (): NavModuleItem[] => {
    if (user.role === 'scrapper') {
      return [
        {
          id: 'safety',
          num: '1',
          shortTitle: t.modSafety?.label || 'Safety Voice',
          label: t.modSafety?.title || 'Safety Guidance (Voice)',
          icon: Headphones,
          badge: lang === 'hi' ? 'ऑडियो' : lang === 'mr' ? 'ऑडिओ' : lang === 'ta' ? 'ஆடியோ' : 'Audio',
          subtitle: t.modSafety?.desc || 'Vernacular narration'
        },
        {
          id: 'capture',
          num: '2',
          shortTitle: t.modCapture?.label || 'Capture & Scale',
          label: t.modCapture?.title || 'Img Capture, Price & Scale Lock',
          icon: Camera,
          badge: lang === 'hi' ? 'लॉक' : lang === 'mr' ? 'लॉक' : lang === 'ta' ? 'பூட்டு' : 'Lock',
          subtitle: t.modCapture?.desc || 'AI recognition & scale'
        },
        {
          id: 'map',
          num: '3',
          shortTitle: t.modMap?.label || 'Map Radar',
          label: t.modMap?.title || 'Map Radar & Recyclers',
          icon: MapPin,
          badge: lang === 'hi' ? 'सक्रिय' : lang === 'mr' ? 'थेट' : lang === 'ta' ? 'நேரலை' : 'Live',
          subtitle: t.modMap?.desc || 'OpenStreetMap radar'
        },
        {
          id: 'chat',
          num: '4',
          shortTitle: t.modChat?.label || 'Recycler Chat',
          label: t.modChat?.title || 'Recycler Chat Section',
          icon: MessageSquare,
          badge: lang === 'hi' ? 'सीधा' : lang === 'mr' ? 'थेट' : lang === 'ta' ? 'நேரடி' : 'Direct',
          subtitle: t.modChat?.desc || 'Doorstep negotiations'
        },
        {
          id: 'lots',
          num: '5',
          shortTitle: t.modLots?.label || 'My Lots',
          label: t.modLots?.title || 'My Broadcasted Lots & Traceability',
          icon: FileText,
          badge: lang === 'hi' ? 'लॉट्स' : lang === 'mr' ? 'लॉट्स' : lang === 'ta' ? 'லாட்கள்' : 'Lots',
          subtitle: t.modLots?.desc || 'Gate Pass & tracking'
        },
        {
          id: 'rates',
          num: '6',
          shortTitle: t.modRates?.label || 'Benchmark Rates',
          label: t.modRates?.title || 'Official CPCB Benchmark Rates',
          icon: TrendingUp,
          badge: 'CPCB',
          subtitle: t.modRates?.desc || 'Statutory fair prices'
        },
        {
          id: 'complaints',
          num: '7',
          shortTitle: t.modScrapComplaints?.label || 'Grievance Desk',
          label: t.modScrapComplaints?.title || 'Statutory Grievance & Dispute Redressal',
          icon: ShieldAlert,
          badge: lang === 'hi' ? 'दर्ज' : lang === 'mr' ? 'नोंदवले' : lang === 'ta' ? 'பதிவு' : 'Filed',
          subtitle: t.modScrapComplaints?.desc || 'Ombudsman tribunal'
        }
      ];
    }

    if (user.role === 'recycler') {
      return [
        {
          id: 'lots',
          num: '1',
          shortTitle: t.modRecLots?.label || 'Inward Lots',
          label: t.modRecLots?.title || 'Inward Lots & Verification',
          icon: FileText,
          badge: 'Lots',
          subtitle: t.modRecLots?.desc || 'Scrap collection logs'
        },
        {
          id: 'rates',
          num: '2',
          shortTitle: t.modRecRates?.label || 'Rate Board',
          label: t.modRecRates?.title || 'Purchase Rate Board',
          icon: Sliders,
          badge: 'Rates',
          subtitle: t.modRecRates?.desc || 'Price configuration'
        },
        {
          id: 'weighment',
          num: '3',
          shortTitle: t.modRecWeigh?.label || 'Weighment',
          label: t.modRecWeigh?.title || 'Certified Scale Weighment',
          icon: Scale,
          badge: 'Scale',
          subtitle: t.modRecWeigh?.desc || 'Bench scale verification'
        },
        {
          id: 'map',
          num: '4',
          shortTitle: t.modRecMap?.label || 'Geo Radar',
          label: t.modRecMap?.title || 'Geospatial Collection Radar',
          icon: MapPin,
          badge: 'Radar',
          subtitle: t.modRecMap?.desc || 'Scrapper field locations'
        },
        {
          id: 'chat',
          num: '5',
          shortTitle: t.modRecChat?.label || 'Scrapper Desk',
          label: t.modRecChat?.title || 'Scrapper Negotiation Desk',
          icon: MessageSquare,
          badge: 'Desk',
          subtitle: t.modRecChat?.desc || 'Price settlements'
        },
        {
          id: 'compliance',
          num: '6',
          shortTitle: t.modRecCompliance?.label || 'Compliance',
          label: t.modRecCompliance?.title || 'EPR & CPCB Compliance Records',
          icon: ShieldCheck,
          badge: 'CPCB EPR',
          subtitle: t.modRecCompliance?.desc || 'Digital audit manifests'
        }
      ];
    }

    // Admin
    return [
      {
        id: 'transactions',
        num: '1',
        shortTitle: t.modAdmTx?.label || 'Tx Ledger',
        label: t.modAdmTx?.title || 'National Transaction Ledger',
        icon: FileSpreadsheet,
        badge: 'Ledger',
        subtitle: t.modAdmTx?.desc || 'End-to-end e-waste trades'
      },
      {
        id: 'users',
        num: '2',
        shortTitle: t.modAdmUsers?.label || 'Stakeholders',
        label: t.modAdmUsers?.title || 'Stakeholder KYC Directory',
        icon: Users,
        badge: 'KYC',
        subtitle: t.modAdmUsers?.desc || 'Registered entities'
      },
      {
        id: 'rates',
        num: '3',
        shortTitle: t.modAdmRates?.label || 'Price Control',
        label: t.modAdmRates?.title || 'CPCB Statutory Price Control',
        icon: TrendingUp,
        badge: 'Control',
        subtitle: t.modAdmRates?.desc || 'Fair pricing index'
      },
      {
        id: 'complaints',
        num: '4',
        shortTitle: t.modAdmComplaints?.label || 'Grievances',
        label: t.modAdmComplaints?.title || 'Grievance Redressal',
        icon: ShieldAlert,
        badge: 'Redressal',
        subtitle: t.modAdmComplaints?.desc || 'Dispute complaints'
      },
      {
        id: 'legal',
        num: '5',
        shortTitle: t.modAdmLegal?.label || 'Enforcement',
        label: t.modAdmLegal?.title || 'Legal Enforcement & Show-Cause',
        icon: Gavel,
        badge: 'Enforce',
        subtitle: t.modAdmLegal?.desc || 'Regulatory cases'
      },
      {
        id: 'audit',
        num: '6',
        shortTitle: t.modAdmAudit?.label || 'Audit Trail',
        label: t.modAdmAudit?.title || 'Statutory Audit Trail',
        icon: Clock,
        badge: 'Audit',
        subtitle: t.modAdmAudit?.desc || 'System logs & DDL schema'
      }
    ];
  };

  const navModules = getModules();
  const currentTab = activeTab || (navModules[0]?.id ?? '');
  const currentIndex = Math.max(0, navModules.findIndex((m) => m.id === currentTab));
  const currentMod = navModules[currentIndex] || navModules[0];

  const handleTabClick = (tabId: string) => {
    onSelectTab?.(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Role themed accent classes
  const getRoleAccent = () => {
    switch (user.role) {
      case 'scrapper':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          iconColor: 'text-emerald-600',
          activeBg: 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold',
          pillBg: 'bg-emerald-600 text-white'
        };
      case 'recycler':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          iconColor: 'text-blue-600',
          activeBg: 'bg-blue-50 text-blue-900 border-blue-400 font-bold',
          pillBg: 'bg-blue-600 text-white'
        };
      case 'admin':
        return {
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          iconColor: 'text-amber-600',
          activeBg: 'bg-amber-50 text-amber-900 border-amber-400 font-bold',
          pillBg: 'bg-amber-600 text-white'
        };
    }
  };

  const accent = getRoleAccent();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setIsNotifMenuOpen(false);
      }
      if (modulesMenuRef.current && !modulesMenuRef.current.contains(target)) {
        setIsModulesMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
      if (cornerMenuRef.current && !cornerMenuRef.current.contains(target)) {
        setIsCornerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerTestConnectionAlert = () => {
    setIsNotifMenuOpen(false);
    const titles = {
      en: 'New Recycler Connection Request',
      hi: 'नया रिसाइकलर कनेक्शन अनुरोध',
      mr: 'नवीन रिसायकलर जोडणी विनंती',
      ta: 'புதிய மறுசுழற்சி இணைப்பு கோரிக்கை'
    };
    const msgs = {
      en: 'EcoRecycle Solutions (Peenya Hub) requested to connect regarding your active e-waste lot.',
      hi: 'पीन्या स्थित ईको-रिसाइकल प्लांट ने आपके सक्रिय ई-कचरा लॉट पर संपर्क स्थापित करने का अनुरोध भेजा है।',
      mr: 'इकोरिसायकल केंद्राने तुमच्या सक्रिय ई-कचरा लॉटसाठी थेट जोडणीची विनंती पाठवली आहे.',
      ta: 'உங்கள் செயலில் உள்ள லாட்டிற்கு சுற்றுச்சூழல் மறுசுழற்சி மையம் இணைப்பு கோரிக்கை விடுத்துள்ளது.'
    };
    notifyUser({
      title: titles[lang] || titles.en,
      message: msgs[lang] || msgs.en,
      type: 'connection',
      actionLabel: lang === 'hi' ? 'चैट खोलें' : lang === 'mr' ? 'चॅट उघडा' : lang === 'ta' ? 'அரட்டையை திற' : 'Open Chat',
      onAction: () => {
        const chatBtn = document.getElementById('quick-chat-nav-btn') || document.querySelector('[data-module-id="chat"]');
        if (chatBtn) (chatBtn as HTMLElement).click();
      }
    });
  };

  const triggerTestStatusAlert = () => {
    setIsNotifMenuOpen(false);
    const titles = {
      en: 'Bench Scale Weight Verified',
      hi: 'काटा वजन सत्यापित हुआ',
      mr: 'काटा वजन पडताळणी पूर्ण',
      ta: 'எடை சரிபார்ப்பு முடிந்தது'
    };
    const msgs = {
      en: 'Lot #LOT-2026-8821 verified at certified bench scale: 148.5 kg. Awaiting your approval.',
      hi: 'लॉट #LOT-2026-8821 का प्रमाणित काटा वजन 148.5 किग्रा दर्ज हुआ। कृपया स्वीकृति दें।',
      mr: 'लॉट #LOT-2026-8821 चे प्रमाणित काटा वजन 148.5 किलो नोंदवले गेले आहे. कृपया तपासा.',
      ta: 'லாட் #LOT-2026-8821-ன் எடை 148.5 கிலோ என சான்றளிக்கப்பட்டு உறுதிசெய்யப்பட்டது.'
    };
    notifyUser({
      title: titles[lang] || titles.en,
      message: msgs[lang] || msgs.en,
      type: 'weight',
      actionLabel: lang === 'hi' ? 'लॉट देखें' : lang === 'mr' ? 'लॉट पहा' : lang === 'ta' ? 'லாட்டை பார்' : 'View Lot',
      onAction: () => {
        const lotsBtn = document.querySelector('[data-module-id="lots"]');
        if (lotsBtn) (lotsBtn as HTMLElement).click();
      }
    });
  };

  const triggerTestChatAudioAlert = () => {
    setIsNotifMenuOpen(false);
    playChatMessageSound();
    notifyUser({
      title: lang === 'hi' ? 'रमेश कुमार से नया चैट संदेश' : lang === 'mr' ? 'रमेश कुमार कडून नवीन चॅट संदेश' : lang === 'ta' ? 'ரமேஷ் குமாரிடமிருந்து புதிய அரட்டை செய்தி' : 'New Message from Ramesh Kumar',
      message: lang === 'hi' 
        ? 'प्रमाणित काटा वजन 48 किग्रा स्वीकृत। क्या आप 30 मिनट में आ सकते हैं?' 
        : lang === 'mr' 
        ? 'काटा वजन 48 किलो मंजूर. तुम्ही 30 मिनिटांत येऊ शकता का?' 
        : lang === 'ta' 
        ? 'எடை 48 கிலோ உறுதிசெய்யப்பட்டது. 30 நிமிடங்களில் வர முடியுமா?' 
        : 'Bench scale weighment 48 kg confirmed. Ready for pickup within 30 minutes?',
      type: 'chat',
      actionLabel: lang === 'hi' ? 'चैट खोलें' : lang === 'mr' ? 'चॅट उघडा' : lang === 'ta' ? 'அரட்டையை திற' : 'Open Chat',
      onAction: () => {
        const chatBtn = document.getElementById('quick-chat-nav-btn') || document.querySelector('[data-module-id="chat"]');
        if (chatBtn) (chatBtn as HTMLElement).click();
      }
    });
  };

  const triggerTestTransactionAssignedAlert = () => {
    setIsNotifMenuOpen(false);
    playTransactionAssignedSound();
    notifyUser({
      title: lang === 'hi' ? 'नया लेनदेन अनुरोध असाइन हुआ' : lang === 'mr' ? 'नवीन व्यवहार विनंती सोपवली' : lang === 'ta' ? 'புதிய பரிவர்த்தனை கோரிக்கை ஒதுக்கப்பட்டது' : 'New Transaction Request Assigned',
      message: lang === 'hi'
        ? 'कबाड़ीवाला ने पीन्या रिसाइकलिंग सुविधा को नया ई-कचरा लॉट (52 किग्रा) असाइन किया।'
        : lang === 'mr'
        ? 'स्क्रॅपरने तुमच्या अधिकृत सुविधेला 52 किलो ई-कचरा लॉट सोपवला आहे.'
        : lang === 'ta'
        ? 'ஸ்கிராப்பர் உங்கள் மறுசுழற்சி ஆலைக்கு புதிய 52 கிலோ மின்-கழிவு லாட்டை ஒதுக்கியுள்ளார்.'
        : 'Ramesh Kumar assigned a new PCB Scrap Lot (52 kg) to your authorized recycling facility.',
      type: 'assignment',
      actionLabel: lang === 'hi' ? 'लॉट देखें' : lang === 'mr' ? 'लॉट पहा' : lang === 'ta' ? 'லாட்டை பார்' : 'Inspect Lot',
      onAction: () => {
        const lotsBtn = document.querySelector('[data-module-id="lots"]');
        if (lotsBtn) (lotsBtn as HTMLElement).click();
      }
    });
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'scrapper':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserIcon className="w-3.5 h-3.5" />
            {t.roleScrapper}
          </span>
        );
      case 'recycler':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3.5 h-3.5" />
            {t.roleRecyclerLabel}
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900 text-white border border-slate-800">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            {t.roleAdminLabel}
          </span>
        );
    }
  };

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 shadow-xs w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4 w-full min-w-0">
          {/* Logo & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-900 font-extrabold text-xs sm:text-sm shadow-xs shrink-0 ${
              user.role === 'scrapper' ? 'bg-emerald-500' : user.role === 'recycler' ? 'bg-blue-500 text-white' : 'bg-amber-500'
            }`}>
              KC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-base md:text-lg text-slate-900 tracking-tight truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none">
                  {t.appName}
                </span>
                {user.role === 'scrapper' ? (
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full border border-emerald-300">
                    <Smartphone className="w-2.5 h-2.5" />
                    <span>Android App</span>
                  </span>
                ) : user.role === 'recycler' ? (
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase rounded-full border border-blue-300">
                    <Globe className="w-2.5 h-2.5" />
                    <span>Web Portal</span>
                  </span>
                ) : (
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-full border border-amber-300">
                    <Building2 className="w-2.5 h-2.5" />
                    <span>Web Desk</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden xl:block">
                {user.role === 'scrapper'
                  ? 'Kabadiwala Collector Android App • Camera AI Scale & Offline Sync'
                  : user.role === 'recycler'
                  ? 'Authorized Recycler Web Portal • Desktop Cloud Workspace'
                  : 'CPCB Central Regulatory Authority Web Portal • Statutory Directorate'}
              </p>
            </div>
          </div>

          {/* OPERATIONS WORKFLOW MENU IN NAV BAR — DESKTOP ONLY */}
          {navModules.length > 0 && (
            <div className="relative hidden md:flex items-center gap-1 shrink min-w-0" ref={modulesMenuRef}>
              <button
                type="button"
                id="navbar-modules-dropdown-btn"
                onClick={() => {
                  setIsModulesMenuOpen(!isModulesMenuOpen);
                  setIsLangMenuOpen(false);
                  setIsNotifMenuOpen(false);
                  setIsCornerMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  isModulesMenuOpen
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 shadow-2xs border border-slate-200'
                }`}
                aria-expanded={isModulesMenuOpen}
                aria-haspopup="true"
                title="View All Operations Modules"
              >
                {currentMod.icon ? (
                  <currentMod.icon className={`w-4 h-4 shrink-0 ${isModulesMenuOpen ? 'text-emerald-400' : accent.iconColor}`} />
                ) : (
                  <Layers className={`w-4 h-4 shrink-0 ${isModulesMenuOpen ? 'text-emerald-400' : 'text-slate-600'}`} />
                )}

                <div className="flex flex-col text-left leading-none min-w-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400">
                    {user.role.toUpperCase()} • {t.operationsMenuBar || 'Workflow'}
                  </span>
                  <span className="font-extrabold text-xs max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] truncate text-slate-900 group-hover:text-black">
                    {currentMod.shortTitle}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isModulesMenuOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Modules Dropdown Menu Card */}
              {isModulesMenuOpen && (
                <div className="fixed inset-x-2 top-14 sm:absolute sm:inset-auto sm:left-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-96 max-h-[82vh] overflow-y-auto rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          {t.operationsMenuBar || 'Operations Workflow'}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {user.role.toUpperCase()} • {navModules.length} Modules Available
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {currentIndex + 1} of {navModules.length}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-[380px] overflow-y-auto pr-0.5">
                    {navModules.map((mod) => {
                      const isActive = currentTab === mod.id;
                      const Icon = mod.icon;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          id={`navbar-dropdown-opt-${mod.id}`}
                          onClick={() => {
                            handleTabClick(mod.id);
                            setIsModulesMenuOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                            isActive
                              ? accent.activeBg
                              : 'bg-white hover:bg-slate-50 border-transparent text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                              isActive
                                ? accent.pillBg
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {mod.num}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-xs font-extrabold flex items-center gap-1.5 truncate text-slate-900">
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? accent.iconColor : 'text-slate-400'}`} />
                                <span className="truncate">{mod.label}</span>
                              </span>
                              {mod.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {mod.badge}
                                </span>
                              )}
                            </div>
                            {mod.subtitle && (
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {mod.subtitle}
                              </p>
                            )}
                          </div>

                          {isActive && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Section: Language Dropdown, Notifications, GPS, Profile & Logout */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* VERNACULAR LANGUAGE SELECTOR AS A DROPDOWN - Desktop View */}
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button
                type="button"
                id="header-lang-dropdown-btn"
                onClick={() => {
                  setIsLangMenuOpen(!isLangMenuOpen);
                  setIsModulesMenuOpen(false);
                  setIsNotifMenuOpen(false);
                  setIsCornerMenuOpen(false);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs min-h-[34px] sm:min-h-[38px] ${
                  isLangMenuOpen
                    ? 'bg-slate-900 text-white border-slate-900 ring-1 ring-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
                aria-expanded={isLangMenuOpen}
                aria-haspopup="true"
                title="Select Language / भाषा चुनें"
              >
                <Globe className={`w-3.5 h-3.5 shrink-0 ${isLangMenuOpen ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className="font-extrabold text-xs hidden xs:inline">
                  {LANGUAGES.find(l => l.code === lang)?.native || 'English'}
                </span>
                <span className="font-extrabold text-[11px] uppercase xs:hidden">
                  {lang}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isLangMenuOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {isLangMenuOpen && (
                <div className="fixed inset-x-2 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Select Language / भाषा
                  </div>
                  {LANGUAGES.map((item) => {
                    const isSelected = lang === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        id={`lang-dropdown-opt-${item.code}`}
                        onClick={() => {
                          onLangChange(item.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                            : 'text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.native}</span>
                          <span className="text-[11px] text-slate-400">({item.label})</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notifications Center Bell */}
            <div className="relative" ref={notifMenuRef}>
              <button
                type="button"
                id="header-notification-bell-btn"
                onClick={() => {
                  setIsNotifMenuOpen(!isNotifMenuOpen);
                  setIsModulesMenuOpen(false);
                  setIsLangMenuOpen(false);
                  setIsCornerMenuOpen(false);
                }}
                className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95 min-h-[34px] sm:min-h-[38px] flex items-center justify-center"
                title="Local Notification Center & Live Alerts"
              >
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                <Bell className="w-4 h-4 text-slate-700" />
              </button>

              {isNotifMenuOpen && (
                <div className="fixed inset-x-2 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-80 max-h-[82vh] overflow-y-auto rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-4 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        {lang === 'hi' ? 'स्थानीय सूचना प्रणाली' : lang === 'mr' ? 'स्थानिक सूचना प्रणाली' : lang === 'ta' ? 'உள்ளூர் அறிவிப்பு மையம்' : 'Local Live Notifications'}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === 'hi'
                      ? 'सक्रिय लेनदेन स्थिति परिवर्तन और नए कनेक्शन अनुरोधों पर शीर्ष पर अलर्ट संदेश दिखाई देंगे।'
                      : lang === 'mr'
                      ? 'व्यवहारातील स्थिती बदल आणि नवीन जोडणी विनंत्या आल्यावर थेट वर सूचना दिसेल.'
                      : lang === 'ta'
                      ? 'செயலில் உள்ள பரிவர்த்தனை மாற்றங்கள் மற்றும் புதிய இணைப்பு கோரிக்கைகளுக்கு மேல் பகுதியில் எச்சரிக்கை தோன்றும்.'
                      : 'Alerts appear automatically at the top of the screen when transactions change status, new chats arrive, or lots are assigned.'}
                  </p>

                  {/* Audio Feedback System Controls */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {audioFeedbackOn ? (
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {lang === 'hi' ? 'ऑडियो फ़ीडबैक' : lang === 'mr' ? 'ऑडिओ अभिप्राय' : lang === 'ta' ? 'ஒலி கருத்து' : 'Audio Feedback'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {audioFeedbackOn
                              ? (lang === 'hi' ? 'सक्रिय (ध्वनि चालू)' : lang === 'mr' ? 'सक्रिय (आवाज सुरू)' : lang === 'ta' ? 'செயலில் உள்ளது' : 'Active (Chimes Enabled)')
                              : (lang === 'hi' ? 'मूक (ध्वनि बंद)' : lang === 'mr' ? 'मूक (आवाज बंद)' : lang === 'ta' ? 'முடக்கப்பட்டது' : 'Muted')}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        id="header-audio-feedback-toggle"
                        onClick={() => {
                          const next = toggleAudioFeedback();
                          setAudioFeedbackOn(next);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          audioFeedbackOn
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {audioFeedbackOn ? 'Mute' : 'Enable'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {lang === 'hi' ? 'ऑडियो एवं लाइव अलर्ट परीक्षण' : lang === 'mr' ? 'ऑडिओ व थेट सूचना चाचणी' : lang === 'ta' ? 'ஒலி மற்றும் எச்சரிக்கை சோதனை' : 'Test Audio Feedback & Alerts'}
                    </span>

                    {/* Chat Audio Alert Test */}
                    <button
                      type="button"
                      id="test-chat-audio-btn"
                      onClick={triggerTestChatAudioAlert}
                      className="w-full px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                      title="Plays the gentle sinusoidal chime for incoming chat messages"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'hi' ? 'चैट संदेश ऑडियो टेस्ट' : lang === 'mr' ? 'चॅट संदेश ऑडिओ चाचणी' : lang === 'ta' ? 'அரட்டை செய்தி ஒலி' : 'Test Chat Message Sound'}</span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    </button>

                    {/* Recycler Transaction Assigned Alert Test */}
                    <button
                      type="button"
                      id="test-tx-assigned-audio-btn"
                      onClick={triggerTestTransactionAssignedAlert}
                      className="w-full px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                      title="Plays the distinctive ascending harmonic chime when a new transaction request is assigned to a recycler"
                    >
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span>{lang === 'hi' ? 'लॉट असाइन ऑडियो टेस्ट' : lang === 'mr' ? 'लॉट वाटप ऑडिओ चाचणी' : lang === 'ta' ? 'லாட் ஒதுக்கீடு ஒலி' : 'Test Transaction Assigned Sound'}</span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    </button>

                    <button
                      type="button"
                      id="test-connection-notif-btn"
                      onClick={triggerTestConnectionAlert}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                        <span>{lang === 'hi' ? 'कनेक्शन अनुरोध अलर्ट' : lang === 'mr' ? 'जोडणी विनंती सूचना' : lang === 'ta' ? 'இணைப்பு கோரிக்கை' : 'Connection Request Alert'}</span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      id="test-status-notif-btn"
                      onClick={triggerTestStatusAlert}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-amber-600" />
                        <span>{lang === 'hi' ? 'काटा वजन स्थिति अलर्ट' : lang === 'mr' ? 'काटा वजन स्थिती बदल' : lang === 'ta' ? 'எடை நிலை மாற்றம்' : 'Scale Status Change Alert'}</span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cloud Firestore Database Indicator */}
            <div
              id="header-cloud-db-badge"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs"
              title="Cloud Database: Google Cloud Firestore (linen-library-fmn89) Connected"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xl:inline text-slate-600 font-medium">Database:</span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Firestore
              </span>
            </div>

            {onOpenMap && (
              <button
                type="button"
                id="header-gps-map-btn"
                onClick={onOpenMap}
                className="hidden md:inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-blue-800 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-300 transition-all cursor-pointer shadow-xs active:scale-95 min-h-[34px] sm:min-h-[38px]"
                title="Open Fullscreen GPS Geolocation Radar"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Compass className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">GPS</span>
              </button>
            )}

            {/* Platform Role Indicator / Android App Install Action (Visible on sm+ screens; on mobile it is conveniently accessible inside the Corner Menu) */}
            {user.role === 'scrapper' ? (
              <div className="hidden sm:block">
                <PWAInstallButton />
              </div>
            ) : user.role === 'recycler' ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs" title="Enterprise Cloud Web Application">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Web Portal</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs" title="Government Regulatory Web Application">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Web Desk</span>
              </span>
            )}

            <div className="hidden lg:block">{getRoleBadge()}</div>

            <button
              type="button"
              id="header-logout-btn"
              onClick={onLogout}
              className="hidden md:inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer shadow-2xs min-h-[34px] sm:min-h-[38px]"
              title="Logout from active session"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>

            {/* MOBILE CORNER MENU DROPDOWN BOX (Placed in the top-right corner of the screen) */}
            <div className="relative md:hidden" ref={cornerMenuRef}>
              <button
                type="button"
                id="header-mobile-corner-menu-btn"
                onClick={() => {
                  setIsCornerMenuOpen(!isCornerMenuOpen);
                  setIsNotifMenuOpen(false);
                  setIsLangMenuOpen(false);
                  setIsModulesMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] shadow-xs active:scale-95 ${
                  isCornerMenuOpen
                    ? 'bg-slate-900 text-white ring-2 ring-emerald-500 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
                aria-expanded={isCornerMenuOpen}
                aria-haspopup="true"
                title="Open Corner Dashboard Menu"
              >
                {isCornerMenuOpen ? (
                  <X className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Menu className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-extrabold tracking-tight">Menu</span>
                <span className={`w-2 h-2 rounded-full ${isCornerMenuOpen ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
              </button>

              {/* The Corner Dropdown Box */}
              {isCornerMenuOpen && (
                <div
                  id="mobile-corner-dropdown-box"
                  className="fixed inset-x-2 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-88 max-h-[85vh] overflow-y-auto rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-3 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Top Profile / Role Strip */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                        KC
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {user.phone || user.id}
                        </div>
                      </div>
                    </div>
                    <div>{getRoleBadge()}</div>
                  </div>

                  {/* OPERATIONS WORKFLOW SECTION */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between px-1 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        {t.operationsMenuBar || 'Workflow Modules'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {currentIndex + 1} of {navModules.length}
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[260px] overflow-y-auto pr-0.5">
                      {navModules.map((mod) => {
                        const isActive = currentTab === mod.id;
                        const Icon = mod.icon;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            id={`corner-opt-mod-${mod.id}`}
                            onClick={() => {
                              handleTabClick(mod.id);
                              setIsCornerMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer border ${
                              isActive
                                ? accent.activeBg
                                : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  isActive ? accent.pillBg : 'bg-slate-100 text-slate-700 font-bold'
                                }`}
                              >
                                {mod.num}
                              </span>
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? accent.iconColor : 'text-slate-400'}`} />
                              <span className="font-extrabold text-xs truncate text-slate-900">
                                {mod.shortTitle}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                              {mod.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  {mod.badge}
                                </span>
                              )}
                              {isActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* VERNACULAR LANGUAGE SELECTOR */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1 mb-2">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      Language / भाषा
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {LANGUAGES.map((l) => {
                        const isSelected = lang === l.code;
                        return (
                          <button
                            key={l.code}
                            type="button"
                            id={`corner-lang-opt-${l.code}`}
                            onClick={() => {
                              onLangChange(l.code);
                            }}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-900 font-bold border-emerald-300 shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                            }`}
                          >
                            <div className="flex flex-col text-left leading-tight">
                              <span className="font-bold text-slate-900">{l.native}</span>
                              <span className="text-[10px] text-slate-400">{l.label}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* QUICK TOOLS (GPS RADAR & AUDIO FEEDBACK) */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {/* Android App Install in Corner Dropdown (Exclusively for Scrapper) */}
                    {user.role === 'scrapper' ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-700" />
                          <div>
                            <div className="text-xs font-bold text-emerald-950">Android App</div>
                            <div className="text-[10px] text-emerald-700">1-Tap Install & WebAPK</div>
                          </div>
                        </div>
                        <PWAInstallButton variant="mobile" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-700" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {user.role === 'recycler' ? 'Recycler Web Portal' : 'CPCB Regulatory Web Desk'}
                            </div>
                            <div className="text-[10px] text-slate-500">Cloud Web Application</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          Web Page
                        </span>
                      </div>
                    )}
                    {onOpenMap && (
                      <button
                        type="button"
                        id="corner-gps-radar-btn"
                        onClick={() => {
                          setIsCornerMenuOpen(false);
                          onOpenMap();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-blue-600" />
                          <span>Open GPS Geolocation Radar</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                      </button>
                    )}

                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        {audioFeedbackOn ? (
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-bold text-slate-700">Audio Chimes</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = toggleAudioFeedback();
                          setAudioFeedbackOn(next);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                          audioFeedbackOn
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {audioFeedbackOn ? 'Active' : 'Muted'}
                      </button>
                    </div>
                  </div>

                  {/* LOGOUT BUTTON */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      id="corner-logout-btn"
                      onClick={() => {
                        setIsCornerMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
