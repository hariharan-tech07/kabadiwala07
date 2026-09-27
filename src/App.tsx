import React, { useState, useEffect } from 'react';
import { User, VernacularLang, Transaction } from './types';
import { api } from './api/client';
import { testConnection } from './firebase';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ScrapperDashboard, ScrapperMenuTab } from './components/scrapper/ScrapperDashboard';
import { RecyclerDashboard, RecyclerMenuTab } from './components/recycler/RecyclerDashboard';
import { HouseholdDashboard } from './components/household/HouseholdDashboard';
import { HouseholdMenuTab } from './types';
import { AdminDashboard, AdminMenuTab } from './components/admin/AdminDashboard';
import { AdminMasterControlBar, AdminActiveMode } from './components/admin/AdminMasterControlBar';
import { ChatDrawer } from './components/ChatDrawer';
import { GeoMapModal } from './components/common/GeoMapModal';
import { NotificationToastContainer } from './components/common/NotificationToast';
import { translations } from './translations';
import {
  WifiOff, Compass, ShieldAlert, Scale, Package, UserCheck,
  IndianRupee, Layers, BarChart3, Building2, AlertCircle,
  Headphones, Camera, MapPin, MessageSquare, FileText, TrendingUp,
  Sliders, ShieldCheck, FileSpreadsheet, Users, Gavel, Clock
} from 'lucide-react';

const DEFAULT_FALLBACK_SCRAPPER: User = {
  id: 'usr-scrapper-1',
  username: 'ramesh',
  name: 'Ramesh Kumar (Peenya Collection Yard)',
  role: 'scrapper',
  location: 'Peenya Industrial Area, Bengaluru, Karnataka',
  phone: '+91 98450 12345',
  verified: true,
  aadhaar_last4: '8821'
};

const DEFAULT_FALLBACK_RECYCLER: User = {
  id: 'usr-recycler-1',
  username: 'ecowaste',
  name: 'Ananya Sharma (EcoWaste Recyclers India)',
  role: 'recycler',
  location: 'Plot 42, Electronic City Phase 2, Bengaluru',
  phone: '+91 99001 22334',
  verified: true,
  cpcb_number: 'CPCB/EW/KAR/2024/7742'
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<VernacularLang>('en');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Chat Drawer state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string; role: string; phone?: string } | null>(null);
  const [chatLot, setChatLot] = useState<Transaction | null>(null);

  // Operations Menu Bar active tabs for each role
  const [scrapperTab, setScrapperTab] = useState<ScrapperMenuTab>('safety');
  const [recyclerTab, setRecyclerTab] = useState<RecyclerMenuTab>('lots');
  const [adminTab, setAdminTab] = useState<AdminMenuTab>('transactions');
  const [householdTab, setHouseholdTab] = useState<HouseholdMenuTab>('pickup');

  // Admin Master Dual-Control State (Admin can control scrapper and recycler)
  const [adminActiveMode, setAdminActiveMode] = useState<AdminActiveMode>('admin_oversight');
  const [controlledScrapper, setControlledScrapper] = useState<User | null>(DEFAULT_FALLBACK_SCRAPPER);
  const [controlledRecycler, setControlledRecycler] = useState<User | null>(DEFAULT_FALLBACK_RECYCLER);
  const [availableScrappers, setAvailableScrappers] = useState<User[]>([DEFAULT_FALLBACK_SCRAPPER]);
  const [availableRecyclers, setAvailableRecyclers] = useState<User[]>([DEFAULT_FALLBACK_RECYCLER]);

  // Load available entities for Admin Master Control
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      api.getUsers().then((allUsers) => {
        const scrappers = allUsers.filter((u) => u.role === 'scrapper');
        const recyclers = allUsers.filter((u) => u.role === 'recycler');
        if (scrappers.length > 0) {
          setAvailableScrappers(scrappers);
          setControlledScrapper(scrappers[0]);
        }
        if (recyclers.length > 0) {
          setAvailableRecyclers(recyclers);
          setControlledRecycler(recyclers[0]);
        }
      }).catch(() => {
        // Use defaults
      });
    }
  }, [currentUser?.role]);

  const activeTab = currentUser?.role === 'scrapper'
    ? scrapperTab
    : currentUser?.role === 'household'
    ? householdTab
    : currentUser?.role === 'recycler'
    ? recyclerTab
    : adminActiveMode === 'control_scrapper'
    ? scrapperTab
    : adminActiveMode === 'control_recycler'
    ? recyclerTab
    : adminTab;

  const handleSelectTab = (tabId: string) => {
    if (currentUser?.role === 'scrapper') {
      setScrapperTab(tabId as ScrapperMenuTab);
    } else if (currentUser?.role === 'household') {
      setHouseholdTab(tabId as HouseholdMenuTab);
    } else if (currentUser?.role === 'recycler') {
      setRecyclerTab(tabId as RecyclerMenuTab);
    } else if (currentUser?.role === 'admin') {
      if (adminActiveMode === 'control_scrapper') {
        setScrapperTab(tabId as ScrapperMenuTab);
      } else if (adminActiveMode === 'control_recycler') {
        setRecyclerTab(tabId as RecyclerMenuTab);
      } else {
        setAdminTab(tabId as AdminMenuTab);
      }
    }
  };

  // Network offline detector
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Check existing session
    const sessionUser = api.getCurrentSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }

    // Load saved lang
    const savedLang = localStorage.getItem('kc_vernacular_lang') as VernacularLang;
    if (savedLang) setLang(savedLang);

    // Test cloud Firestore connection on startup
    testConnection().then((connected) => {
      console.log(`[Firestore] Database connection status: ${connected ? 'ONLINE' : 'CHECK_CONFIG'}`);
    }).catch((err) => {
      console.warn('[Firestore] Startup connection check:', err);
    });

    // Online listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const handleLangChange = (newLang: VernacularLang) => {
    setLang(newLang);
    localStorage.setItem('kc_vernacular_lang', newLang);
  };

  const handleOpenChat = (
    target: { id: string; name: string; role: string; phone?: string },
    lot?: Transaction
  ) => {
    setChatTarget(target);
    setChatLot(lot || null);
    setChatOpen(true);
  };

  // If not logged in, render Auth Modal
  if (!currentUser) {
    return (
      <AuthModal
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        onLangChange={handleLangChange}
      />
    );
  }

  const OFFLINE_NOTICES: Record<VernacularLang, string> = {
    en: 'Offline Simulation Active: Transactions and rates cached in local storage. Auto-sync will resume once connected.',
    hi: 'ऑफ़लाइन सिमुलेशन सक्रिय: लेन-देन और दरें स्थानीय स्टोरेज में सुरक्षित हैं। कनेक्ट होने पर स्वतः सिंक होगा।',
    mr: 'ऑफलाइन मोड सक्रिय: व्यवहार आणि दर स्थानिक संचयनात कॅश केले आहेत. नेटवर्क सुरू झाल्यावर आपोआप सिंक होईल.',
    ta: 'ஆஃப்லைன் முறை செயலில் உள்ளது: பரிவர்த்தனைகள் உள்ளூர் சேமிப்பகத்தில் சேமிக்கப்பட்டுள்ளன. இணைப்பு கிடைத்ததும் ஒத்திசைக்கப்படும்.'
  };

  const FOOTER_TEXTS: Record<VernacularLang, { brand: string; cpcb: string; rules: string; rbac: string }> = {
    en: {
      brand: 'Kabadiwala Connect — National E-Waste Formalization Network',
      cpcb: 'CPCB Circular Traceability Protocol',
      rules: 'E-Waste (Management) Rules 2022',
      rbac: 'Role-Based Access Control (RBAC) Verified'
    },
    hi: {
      brand: 'कबाड़ीवाला कनेक्ट — राष्ट्रीय ई-अपशिष्ट औपचारिकीकरण नेटवर्क',
      cpcb: 'CPCB चक्रीय ट्रैसेबिलिटी प्रोटोकॉल',
      rules: 'ई-अपशिष्ट (प्रबंधन) नियम 2022',
      rbac: 'भूमिका-आधारित अभिगम नियंत्रण (RBAC) सत्यापित'
    },
    mr: {
      brand: 'कबाडीवाला कनेक्ट — राष्ट्रीय ई-कचरा औपचारिकीकरण नेटवर्क',
      cpcb: 'CPCB चक्रीय ट्रॅसेबिलिटी प्रोटोकॉल',
      rules: 'ई-कचरा (व्यवस्थापन) नियम २०२२',
      rbac: 'भूमिका-आधारित प्रवेश नियंत्रण (RBAC) सत्यापित'
    },
    ta: {
      brand: 'கபாடிவாலா கனெக்ட் — தேசிய மின்-கழிவு முறைப்படுத்தல் வலைப்பின்னல்',
      cpcb: 'CPCB சுழற்சி முறை தடமறிதல் நெறிமுறை',
      rules: 'மின்-கழிவு (மேலாண்மை) விதிகள் 2022',
      rbac: 'பங்கு சார்ந்த அணுகல் கட்டுப்பாடு (RBAC) சரிபார்க்கப்பட்டது'
    }
  };

  const foot = FOOTER_TEXTS[lang] || FOOTER_TEXTS.en;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Local Notification System: Top of Screen Toast Banner */}
      <NotificationToastContainer
        currentUser={currentUser}
        lang={lang}
        onOpenChatWithUser={(target) => {
          handleOpenChat(target);
        }}
      />

      {/* Offline sync banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <WifiOff className="w-4 h-4" />
          <span>{OFFLINE_NOTICES[lang] || OFFLINE_NOTICES.en}</span>
        </div>
      )}

      {/* Global Header with Integrated Menubar in Nav Bar */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        lang={lang}
        onLangChange={handleLangChange}
        onOpenMap={() => setIsMapModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content View — Strictly Confined to Authorized Role */}
      {(() => {
        const isScrapperApp =
          currentUser.role === 'scrapper' ||
          (currentUser.role === 'admin' && adminActiveMode === 'control_scrapper');

        return (
          <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 ${isScrapperApp ? 'pb-20 md:pb-6' : 'pb-8'}`}>
            {currentUser.role === 'scrapper' && (
              <ScrapperDashboard
                user={currentUser}
                lang={lang}
                onOpenChat={handleOpenChat}
                activeMenuTab={scrapperTab}
                onSelectMenuTab={setScrapperTab}
              />
            )}

            {currentUser.role === 'household' && (
              <HouseholdDashboard
                user={currentUser}
                lang={lang}
                onOpenChat={handleOpenChat}
                activeMenuTab={householdTab}
                onSelectMenuTab={setHouseholdTab}
              />
            )}

            {currentUser.role === 'recycler' && (
          <RecyclerDashboard
            user={currentUser}
            lang={lang}
            onOpenChat={handleOpenChat}
            activeMenuTab={recyclerTab}
            onSelectMenuTab={setRecyclerTab}
          />
        )}

        {currentUser.role === 'admin' && (
          <div className="space-y-6">
            {/* CPCB Master Dual Control Bar (Admin can switch between central oversight, scrapper control, and recycler control) */}
            <AdminMasterControlBar
              adminUser={currentUser}
              activeMode={adminActiveMode}
              onSelectMode={setAdminActiveMode}
              controlledScrapper={controlledScrapper}
              onSelectScrapper={setControlledScrapper}
              availableScrappers={availableScrappers}
              controlledRecycler={controlledRecycler}
              onSelectRecycler={setControlledRecycler}
              availableRecyclers={availableRecyclers}
              lang={lang}
            />

            {/* Mode 1: Central Regulatory Authority Oversight */}
            {adminActiveMode === 'admin_oversight' && (
              <AdminDashboard
                currentUser={currentUser}
                lang={lang}
                activeMenuTab={adminTab}
                onSelectMenuTab={setAdminTab}
              />
            )}

            {/* Mode 2: Master Control over Scrapper operations */}
            {adminActiveMode === 'control_scrapper' && controlledScrapper && (
              <ScrapperDashboard
                user={controlledScrapper}
                lang={lang}
                onOpenChat={handleOpenChat}
                activeMenuTab={scrapperTab}
                onSelectMenuTab={setScrapperTab}
              />
            )}

            {/* Mode 3: Master Control over Recycler facility operations */}
            {adminActiveMode === 'control_recycler' && controlledRecycler && (
              <RecyclerDashboard
                user={controlledRecycler}
                lang={lang}
                onOpenChat={handleOpenChat}
                activeMenuTab={recyclerTab}
                onSelectMenuTab={setRecyclerTab}
              />
            )}
          </div>
        )}
      </main>
    );
  })()}

      {/* Connected Chat Console Drawer */}
      {chatTarget && (
        <ChatDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUser={currentUser}
          targetUser={chatTarget}
          lot={chatLot}
          lang={lang}
          onSelectTarget={handleOpenChat}
        />
      )}

      {/* Cross-Role Geolocation Radar Modal */}
      <GeoMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        currentUser={currentUser}
        lang={lang}
        onOpenChat={handleOpenChat}
        onSelectRecycler={(rec) => {
          if (currentUser.role === 'household') return;
          setIsMapModalOpen(false);
          setChatTarget({
            id: rec.user_id,
            name: rec.facility_name,
            role: 'recycler',
            phone: rec.contact_phone
          });
          setChatOpen(true);
        }}
        onSelectScrapper={(scrapper) => {
          setIsMapModalOpen(false);
          setChatTarget({
            id: scrapper.id,
            name: scrapper.name,
            role: 'scrapper',
            phone: scrapper.phone
          });
          setChatOpen(true);
        }}
      />

      {/* Android Mobile Navigation Bar (Exclusively for Scrapper Android App) */}
      {(currentUser.role === 'scrapper' || (currentUser.role === 'admin' && adminActiveMode === 'control_scrapper')) && (
        <nav
          aria-label="Android Mobile Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-2xl px-1 py-1 flex items-center justify-around overflow-x-auto no-scrollbar scroll-smooth min-h-[56px]"
        >
          {(() => {
            const t = translations[lang] || translations.en;
            interface BottomNavOption {
              id: string;
              label: string;
              icon: React.ComponentType<{ className?: string }>;
              accentClass: string;
              bgClass: string;
            }

            const options: BottomNavOption[] = [
              {
                id: 'safety',
                label: t.modSafety?.label || 'Safety',
                icon: Headphones,
                accentClass: 'text-amber-600',
                bgClass: 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold shadow-2xs'
              },
              {
                id: 'capture',
                label: t.modCapture?.label || 'AI Scale',
                icon: Camera,
                accentClass: 'text-emerald-600',
                bgClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold shadow-2xs'
              },
              {
                id: 'map',
                label: t.modMap?.label || 'Radar',
                icon: MapPin,
                accentClass: 'text-blue-600',
                bgClass: 'bg-blue-50 text-blue-900 border-blue-300 font-extrabold shadow-2xs'
              },
              {
                id: 'chat',
                label: t.modChat?.label || 'Chat',
                icon: MessageSquare,
                accentClass: 'text-emerald-600',
                bgClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold shadow-2xs'
              },
              {
                id: 'lots',
                label: t.modLots?.label || 'My Lots',
                icon: FileText,
                accentClass: 'text-emerald-600',
                bgClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold shadow-2xs'
              },
              {
                id: 'rates',
                label: t.modRates?.label || 'Rates',
                icon: IndianRupee,
                accentClass: 'text-emerald-600',
                bgClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold shadow-2xs'
              },
              {
                id: 'complaints',
                label: t.modScrapComplaints?.label || 'Grievance',
                icon: ShieldAlert,
                accentClass: 'text-rose-600',
                bgClass: 'bg-rose-50 text-rose-900 border-rose-300 font-extrabold shadow-2xs'
              }
            ];

            return options.map((opt) => {
              const isActive = activeTab === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`mobile-bottom-nav-${opt.id}`}
                  onClick={() => handleSelectTab(opt.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-w-[46px] max-w-[62px] shrink-0 border active:scale-95 ${
                    isActive
                      ? opt.bgClass
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 font-medium'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={opt.label}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className={`w-4 h-4 transition-transform ${isActive ? `${opt.accentClass} scale-110` : 'text-slate-500'}`} />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-tight truncate w-full text-center ${isActive ? 'font-bold' : ''}`}>
                    {opt.label}
                  </span>
                </button>
              );
            });
          })()}
        </nav>
      )}

      {/* Footer */}
      <footer className={`bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 ${
        (currentUser.role === 'scrapper' || (currentUser.role === 'admin' && adminActiveMode === 'control_scrapper'))
          ? 'pb-24 md:pb-6'
          : 'pb-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-slate-700">{foot.brand}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {currentUser.role === 'scrapper' ? '📱 Android Mobile App' : currentUser.role === 'recycler' ? '💻 Web Portal' : '🌐 Regulatory Web Desk'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>{foot.cpcb}</span>
            <span>•</span>
            <span>{foot.rules}</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">{foot.rbac}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
