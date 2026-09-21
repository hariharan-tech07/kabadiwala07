import React, { useState, useEffect } from 'react';
import { User, VernacularLang, Transaction } from './types';
import { api } from './api/client';
import { testConnection } from './firebase';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ScrapperDashboard, ScrapperMenuTab } from './components/scrapper/ScrapperDashboard';
import { RecyclerDashboard, RecyclerMenuTab } from './components/recycler/RecyclerDashboard';
import { AdminDashboard, AdminMenuTab } from './components/admin/AdminDashboard';
import { ChatDrawer } from './components/ChatDrawer';
import { GeoMapModal } from './components/common/GeoMapModal';
import { NotificationToastContainer } from './components/common/NotificationToast';
import { WifiOff } from 'lucide-react';

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

  const activeTab = currentUser?.role === 'scrapper'
    ? scrapperTab
    : currentUser?.role === 'recycler'
    ? recyclerTab
    : adminTab;

  const handleSelectTab = (tabId: string) => {
    if (currentUser?.role === 'scrapper') {
      setScrapperTab(tabId as ScrapperMenuTab);
    } else if (currentUser?.role === 'recycler') {
      setRecyclerTab(tabId as RecyclerMenuTab);
    } else if (currentUser?.role === 'admin') {
      setAdminTab(tabId as AdminMenuTab);
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'scrapper' && (
          <ScrapperDashboard
            user={currentUser}
            lang={lang}
            onOpenChat={handleOpenChat}
            activeMenuTab={scrapperTab}
            onSelectMenuTab={setScrapperTab}
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
          <AdminDashboard
            currentUser={currentUser}
            lang={lang}
            activeMenuTab={adminTab}
            onSelectMenuTab={setAdminTab}
          />
        )}
      </main>

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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700">{foot.brand}</span>
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
