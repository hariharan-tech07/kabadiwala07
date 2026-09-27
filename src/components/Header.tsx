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
  UserPlus, Scale, Sparkles, X, Home, Truck, Phone,
  Headphones, Camera, MessageSquare, FileText, TrendingUp,
  Sliders, Clock, Gavel, FileSpreadsheet, Users, IndianRupee,
  ChevronDown, ChevronLeft, ChevronRight, Check, Layers, Database, Volume2, VolumeX, Menu, Smartphone
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
  onSwitchApp?: (appRole: 'household' | 'scrapper' | 'recycler' | 'admin') => void;
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
  onSelectTab,
  onSwitchApp
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
          shortTitle: t.modSafety?.label || 'Safety Guide',
          label: t.modSafety?.title || 'Hazardous Safety Guidance (Voice)',
          icon: Headphones,
          badge: 'Safety First',
          subtitle: t.modSafety?.desc || 'Vernacular audio & hazard protocols'
        },
        {
          id: 'capture',
          num: '2',
          shortTitle: t.modCapture?.label || 'Camera & Scale',
          label: t.modCapture?.title || 'Camera AI Scale & Weight',
          icon: Camera,
          badge: 'AI Scale',
          subtitle: t.modCapture?.desc || 'AI material recognition'
        },
        {
          id: 'map',
          num: '3',
          shortTitle: t.modMap?.label || 'Map Radar',
          label: t.modMap?.title || 'OpenStreetMap Collection Radar',
          icon: MapPin,
          badge: 'Live',
          subtitle: t.modMap?.desc || 'Geo collection map'
        },
        {
          id: 'chat',
          num: '4',
          shortTitle: 'Chat Desk',
          label: 'Household & Recycler Chat Desk',
          icon: MessageSquare,
          badge: 'Live Chat',
          subtitle: 'Direct chat with households and recyclers'
        },
        {
          id: 'lots',
          num: '5',
          shortTitle: t.modLots?.label || 'My Lots',
          label: t.modLots?.title || 'My Lots & Handover Receipts',
          icon: FileText,
          badge: 'Lots',
          subtitle: t.modLots?.desc || 'Gate pass and receipts'
        },
        {
          id: 'household_lots',
          num: '6',
          shortTitle: 'Household Lots',
          label: 'Citizen Doorstep Scrap Lots & Pickups',
          icon: Home,
          badge: 'Households',
          subtitle: 'Live scrap pickup requests from household citizens'
        },
        {
          id: 'rates',
          num: '7',
          shortTitle: t.modRates?.label || 'CPCB Rates',
          label: t.modRates?.title || 'Statutory Fair Benchmark Rates',
          icon: TrendingUp,
          badge: 'Rates',
          subtitle: t.modRates?.desc || 'Official scrap prices'
        },
        {
          id: 'complaints',
          num: '8',
          shortTitle: t.modScrapComplaints?.label || 'Grievance Desk',
          label: t.modScrapComplaints?.title || 'Statutory Grievance & Dispute Redressal Desk',
          icon: ShieldAlert,
          badge: 'Grievance',
          subtitle: 'Dispute filing, underweighting claims & CPCB docket'
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

    if (user.role === 'household') {
      return [
        {
          id: 'pickup',
          num: '1',
          shortTitle: 'Book Pickup',
          label: 'Doorstep Scrap Pickups',
          icon: Truck,
          badge: 'Doorstep',
          subtitle: 'Active & scheduled doorstep pickups'
        },
        {
          id: 'scrappers',
          num: '2',
          shortTitle: 'Find Scrappers',
          label: 'Nearby Verified Scrappers',
          icon: Phone,
          badge: 'Kabadiwalas',
          subtitle: 'Direct connect with neighborhood collectors'
        },
        {
          id: 'chat',
          num: '3',
          shortTitle: 'Scrapper Chat',
          label: 'Kabadiwala Negotiation Chat',
          icon: MessageSquare,
          badge: 'Direct Chat',
          subtitle: 'Live doorstep chat with neighborhood scrapper'
        },
        {
          id: 'calculator',
          num: '4',
          shortTitle: 'Rate Estimator',
          label: 'Household Scrap Rate Calculator',
          icon: Scale,
          badge: 'Fair Rates',
          subtitle: 'Official CPCB benchmark rates'
        }
      ];
    }

    // Admin
    return [
      {
        id: 'transactions',
        num: '1',
        shortTitle: t.modAdmTx?.label || 'Transactions',
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
        id: 'audit',
        num: '5',
        shortTitle: t.modAdmAudit?.label || 'Audit Trail',
        label: t.modAdmAudit?.title || 'Statutory Audit Trail',
        icon: Clock,
        badge: 'Audit',
        subtitle: t.modAdmAudit?.desc || 'System logs & security records'
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
      case 'household':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          iconColor: 'text-blue-600',
          activeBg: 'bg-blue-50 text-blue-900 border-blue-400 font-bold',
          pillBg: 'bg-blue-600 text-white'
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
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          iconColor: 'text-slate-600',
          activeBg: 'bg-slate-50 text-slate-900 border-slate-400 font-bold',
          pillBg: 'bg-slate-900 text-white'
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
      case 'household':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Home className="w-3.5 h-3.5" />
            {lang === 'hi' ? 'घरेलू नागरिक' : lang === 'mr' ? 'घरगुती नागरिक' : lang === 'ta' ? 'குடியிருப்பு பயனர்' : 'Household Citizen'}
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
    <header className="bg-[#0A101D]/95 text-slate-100 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md shadow-lg shadow-black/40 w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4 w-full min-w-0">
          {/* Logo & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-xs shrink-0 ${
              user.role === 'scrapper' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black' : user.role === 'household' ? 'bg-blue-500 text-white' : user.role === 'recycler' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-amber-500 text-slate-950 font-black'
            }`}>
              KC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-base md:text-lg text-white tracking-tight truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none">
                  {t.appName}
                </span>
                {user.role === 'scrapper' ? (
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase rounded-full border border-emerald-500/40">
                    <Smartphone className="w-2.5 h-2.5" />
                    <span>Android App</span>
                  </span>
                ) : user.role === 'household' ? (
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-full border border-blue-500/40">
                    <Home className="w-2.5 h-2.5" />
                    <span>Household Portal</span>
                  </span>
                ) : user.role === 'recycler' ? (
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase rounded-full border border-cyan-500/40">
                    <Globe className="w-2.5 h-2.5" />
                    <span>Web Portal</span>
                  </span>
                ) : (
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase rounded-full border border-amber-500/40">
                    <Building2 className="w-2.5 h-2.5" />
                    <span>Web Desk</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden xl:block">
                {user.role === 'scrapper'
                  ? 'Kabadiwala Collector Android App • Camera AI Scale & Offline Sync'
                  : user.role === 'household'
                  ? 'Household Citizen Portal • Doorstep Scrap Pickup & Neighborhood Kabadiwala Connect'
                  : user.role === 'recycler'
                  ? 'Authorized Recycler Web Portal • Desktop Cloud Workspace'
                  : 'CPCB Central Regulatory Authority Web Portal • Statutory Directorate'}
              </p>
            </div>
          </div>

          {/* 3-APP SEPARATE DASHBOARDS SWITCHER WITH SMOOTH LIVE CONNECTION */}
          {onSwitchApp && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                id="app-switch-household-btn"
                onClick={() => onSwitchApp('household')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  user.role === 'household'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Household Citizen App: Doorstep Pickups & Scrap Rates"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Household App</span>
              </button>

              <button
                type="button"
                id="app-switch-scrapper-btn"
                onClick={() => onSwitchApp('scrapper')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  user.role === 'scrapper'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Kabadiwala Collector Android App: Camera AI Scale & Offline Sync"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Scrapper App</span>
              </button>

              <button
                type="button"
                id="app-switch-recycler-btn"
                onClick={() => onSwitchApp('recycler')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  user.role === 'recycler'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Authorized Recycler Web Desk: B2B Procurement & CPCB Traceability"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Recycler Desk</span>
              </button>

              <button
                type="button"
                id="app-switch-admin-btn"
                onClick={() => onSwitchApp('admin')}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  user.role === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="CPCB Central Regulatory Directorate"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CPCB</span>
              </button>
            </div>
          )}

          {/* COMPACT OPERATIONS MENU BAR DROPDOWN IN HEADER — PREVENTS OVERFLOW */}
          {navModules.length > 0 && (
            <div className="relative hidden md:block" ref={modulesMenuRef}>
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-lg">
                {/* Prev Module Button */}
                <button
                  type="button"
                  id="navbar-prev-module-btn"
                  onClick={() => {
                    const prevIndex = (currentIndex - 1 + navModules.length) % navModules.length;
                    handleTabClick(navModules[prevIndex].id);
                  }}
                  disabled={navModules.length <= 1}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Previous Module"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown Toggle Button */}
                <button
                  type="button"
                  id="header-modules-dropdown-btn"
                  onClick={() => {
                    setIsModulesMenuOpen(!isModulesMenuOpen);
                    setIsLangMenuOpen(false);
                    setIsNotifMenuOpen(false);
                    setIsCornerMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isModulesMenuOpen
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                  aria-expanded={isModulesMenuOpen}
                  aria-haspopup="true"
                  title="Click to select operational module"
                >
                  {currentMod && (
                    <currentMod.icon className={`w-3.5 h-3.5 shrink-0 ${isModulesMenuOpen ? 'text-emerald-300' : 'text-emerald-400'}`} />
                  )}
                  <span className="truncate max-w-[130px] lg:max-w-[170px]">
                    {currentMod?.shortTitle || 'Menu'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isModulesMenuOpen ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {currentIndex + 1}/{navModules.length}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    isModulesMenuOpen ? 'rotate-180 text-white' : 'text-slate-400'
                  }`} />
                </button>

                {/* Next Module Button */}
                <button
                  type="button"
                  id="navbar-next-module-btn"
                  onClick={() => {
                    const nextIndex = (currentIndex + 1) % navModules.length;
                    handleTabClick(navModules[nextIndex].id);
                  }}
                  disabled={navModules.length <= 1}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Next Module"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Module Dropdown Popover */}
              {isModulesMenuOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-[#0E1626] rounded-2xl shadow-2xl border border-slate-800 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Operations & Workflows</span>
                      <p className="text-xs font-bold text-white">
                        {user.role === 'scrapper'
                          ? 'Kabadiwala Collector App'
                          : user.role === 'household'
                          ? 'Household Citizen App'
                          : user.role === 'recycler'
                          ? 'Authorized Recycler Web Desk'
                          : 'Central Authority Directorate'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                      {navModules.length} Modules
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1 py-1">
                    {navModules.map((mod, idx) => {
                      const isActive = currentTab === mod.id;
                      const ModIcon = mod.icon;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          id={`dropdown-module-${mod.id}`}
                          onClick={() => {
                            handleTabClick(mod.id);
                            setIsModulesMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-white font-bold'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <ModIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate">{mod.label}</span>
                              {mod.badge && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 shrink-0 border border-slate-700">
                                  {mod.badge}
                                </span>
                              )}
                            </div>
                            {mod.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate">{mod.subtitle}</p>
                            )}
                          </div>
                          {isActive && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
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
                        {lang === 'hi' ? 'सूचना केंद्र' : lang === 'mr' ? 'सूचना केंद्र' : lang === 'ta' ? 'அறிவிப்பு மையம்' : 'Notification Center'}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Live
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === 'hi'
                      ? 'नए चैट संदेश, पिकअप अनुरोध और लेन-देन की स्थिति अपडेट यहां वास्तविक समय में दिखाई देंगे।'
                      : lang === 'mr'
                      ? 'नवीन चॅट संदेश, पिकअप विनंत्या व व्यवहारातील अपडेट्स येथे दिसतील.'
                      : lang === 'ta'
                      ? 'புதிய அரட்டை செய்திகள் மற்றும் பிக்கப் புதுப்பிப்புகள் இங்கு தோன்றும்.'
                      : 'Live alerts appear automatically when new chats arrive, pickups are scheduled, or payments are processed.'}
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
