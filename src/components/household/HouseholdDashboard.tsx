import React, { useState, useEffect, useRef } from 'react';
import { User, VernacularLang, HouseholdPickupRequest, HouseholdMenuTab, ChatMessage } from '../../types';
import { api } from '../../api/client';
import {
  Home, Truck, Phone, MessageSquare, Calendar, Clock, Scale,
  IndianRupee, ShieldCheck, CheckCircle2, MapPin, Sparkles, Plus,
  Download, FileText, AlertCircle, ArrowRight, Search, Filter,
  Check, ExternalLink, RefreshCw, X, ChevronRight, HelpCircle,
  Award, Shield, FileCheck, Info, Send
} from 'lucide-react';
import { DigitalReceiptModal } from '../common/DigitalReceiptModal';
import { OpenStreetMap } from '../common/OpenStreetMap';

interface HouseholdDashboardProps {
  user: User;
  lang?: VernacularLang;
  activeMenuTab?: HouseholdMenuTab;
  onSelectMenuTab?: (tab: HouseholdMenuTab) => void;
  onOpenChat?: (target: { id: string; name: string; role: string; phone?: string }, lot?: any) => void;
}

const HOUSEHOLD_TEXTS = {
  en: {
    welcome: 'Welcome, Household Citizen',
    subtitle: 'Sell your household e-waste and scrap directly to verified neighborhood Kabadiwalas with fair digital pricing and doorstep pickup.',
    requestPickupBtn: '+ Book Doorstep Scrap Pickup',
    activeTabPickup: 'Doorstep Pickups',
    activeTabScrappers: 'Nearby Scrappers (Kabadiwalas)',
    activeTabChat: 'Chat with Scrapper',
    activeTabCalculator: 'Rate Calculator',
    activeTabTracking: 'Supply Chain Tracking',
    activeTabImpact: 'Green Citizen Impact',
    statTotalScrap: 'Scrap Given (KG)',
    statEarnings: 'Total Payout Earned',
    statActivePickups: 'Active Pickups',
    statCo2Saved: 'CO₂ Emissions Prevented',
    noPickupsNotice: 'No scrap pickups scheduled yet. Book your first doorstep collection below!',
    findScrappersTitle: 'Verified Neighborhood Scrappers (Kabadiwalas)',
    findScrappersDesc: 'Connect directly with local certified collectors for doorstep pickup. Rate is guaranteed as per official CPCB fair benchmark.',
    callScrapper: 'Call Scrapper',
    chatScrapper: 'Chat / Negotiate',
    bookWithScrapper: 'Book Doorstep Pickup',
    estimatedValue: 'Estimated Scrap Value:',
    doorstepWeighing: 'Certified Digital Scale Doorstep Weighing',
    resaleTitle: 'Sold by Scrapper into Circular Stream',
    resaleDesc: 'Once collected from your doorstep, your local scrapper consolidates and sells this scrap into the official CPCB circular economy stream.',
    receiptBtn: 'View Receipt (.PDF / .TXT)',
    greenCertTitle: 'CPCB Green Household Citizen Certificate'
  },
  hi: {
    welcome: 'स्वागत है, नागरिक (घरेलू उपयोगकर्ता)',
    subtitle: 'अपने घर का पुराना इलेक्ट्रॉनिक कचरा व कबाड़ सीधे प्रमाणित कबाड़ीवालों को निष्पक्ष डिजिटल दरों पर घर बैठे बेचें।',
    requestPickupBtn: '+ डोरस्टेप स्क्रैप पिकअप बुक करें',
    activeTabPickup: 'डोरस्टेप पिकअप',
    activeTabScrappers: 'नजदीकी कबाड़ीवाले (स्क्रैपर)',
    activeTabChat: 'कबाड़ीवाला चैट',
    activeTabCalculator: 'दर कैलकुलेटर',
    activeTabTracking: 'सप्लाई चेन ट्रैकिंग',
    activeTabImpact: 'पर्यावरण प्रभाव',
    statTotalScrap: 'कुल दिया गया स्क्रैप (किग्रा)',
    statEarnings: 'प्राप्त कुल भुगतान',
    statActivePickups: 'सक्रिय पिकअप',
    statCo2Saved: 'CO₂ उत्सर्जन रोकथाम',
    noPickupsNotice: 'अभी कोई पिकअप शेड्यूल नहीं है। नीचे से अपना पहला डोरस्टेप पिकअप बुक करें!',
    findScrappersTitle: 'प्रमाणित स्थानीय कबाड़ीवाले (स्क्रैपर्स)',
    findScrappersDesc: 'घर से कबाड़ उठवाने हेतु सीधे सत्यापित कबाड़ीवालों से संपर्क करें। सरकारी मानक दरों पर सही तौल सुनिश्चित।',
    callScrapper: 'कॉल करें',
    chatScrapper: 'चैट करें',
    bookWithScrapper: 'पिकअप बुक करें',
    estimatedValue: 'अनुमानित कबाड़ मूल्य:',
    doorstepWeighing: 'डिजिटल कांटे से घर पर प्रमाणित तौल',
    resaleTitle: 'कबाड़ीवाले द्वारा रीसाइक्लिंग चेन में बिक्री',
    resaleDesc: 'आपके घर से लेने के बाद, कबाड़ीवाला इस कबाड़ को आधिकारिक CPCB प्रमाणित सर्कुलर चेन में बेचता है।',
    receiptBtn: 'डिजिटल रसीद (.PDF / .TXT)',
    greenCertTitle: 'CPCB हरित नागरिक प्रमाणपत्र'
  },
  mr: {
    welcome: 'स्वागत आहे, घरगुती वापरकर्ता',
    subtitle: 'तुमच्या घरातील जुना ई-कचरा व भंगार थेट प्रमाणित कबाडीवाल्यांना योग्य दरात घरबसल्या विका.',
    requestPickupBtn: '+ घरपोच स्क्रॅप पिकअप बुक करा',
    activeTabPickup: 'घरपोच पिकअप',
    activeTabScrappers: 'जवळचे कबाडीवाले',
    activeTabChat: 'कबाडीवाला चॅट',
    activeTabCalculator: 'दर कॅल्क्युलेटर',
    activeTabTracking: 'सप्लाय चेन ट्रॅकिंग',
    activeTabImpact: 'पर्यावरणीय योगदान',
    statTotalScrap: 'दिलेले भंगार (किग्रा)',
    statEarnings: 'एकूण मिळालेले पैसे',
    statActivePickups: 'सक्रिय पिकअप',
    statCo2Saved: 'CO₂ बचत',
    noPickupsNotice: 'अद्याप कोणतेही पिकअप नाही. खालील बटण वापरून पहिले पिकअप बुक करा!',
    findScrappersTitle: 'प्रमाणित स्थानिक कबाडीवाले',
    findScrappersDesc: 'घरी येऊन योग्य काट्यावर भंगार घेण्यासाठी स्थानिक कबाडीवाल्यांशी संपर्क साधा.',
    callScrapper: 'कॉल करा',
    chatScrapper: 'चर्चा करा',
    bookWithScrapper: 'पिकअप बुक करा',
    estimatedValue: 'अंदाजे मूल्य:',
    doorstepWeighing: 'घरी थेट अचूक डिजिटल वजन',
    resaleTitle: 'कबाडीवाल्याद्वारे पुनर्वापर साखळीत विक्री',
    resaleDesc: 'घरातून गोळा केलेले भंगार कबाडीवाला अधिकृत CPCB रिसायकलिंग साखळीत विकतो.',
    receiptBtn: 'पावती पहा (.PDF / .TXT)',
    greenCertTitle: 'CPCB हरित नागरिक प्रमाणपत्र'
  },
  ta: {
    welcome: 'வணக்கம், குடியிருப்பு பயனர்',
    subtitle: 'உங்கள் வீட்டு மின்னணுக் கழிவுகளை அருகிலுள்ள சரிபார்க்கப்பட்ட கபாடிவாலாக்களிடம் நியாயமான விலையில் வீட்டில் இருந்தபடியே விற்கவும்.',
    requestPickupBtn: '+ வீட்டிற்கே கழிவு சேகரிப்பு கோரிக்கை',
    activeTabPickup: 'வீட்டு வாசலில் சேகரிப்பு',
    activeTabScrappers: 'அருகிலுள்ள சேகரிப்பாளர்கள்',
    activeTabChat: 'கபாடிவாலா அரட்டை',
    activeTabCalculator: 'விலை கணக்கீடு',
    activeTabTracking: 'விநியோக சங்கிலி கண்காணிப்பு',
    activeTabImpact: 'சுற்றுச்சூழல் தாக்கம்',
    statTotalScrap: 'வழங்கப்பட்ட கழிவு (கிலோ)',
    statEarnings: 'மொத்த வருமானம்',
    statActivePickups: 'செயலில் உள்ள சேகரிப்புகள்',
    statCo2Saved: 'CO₂ சேமிப்பு',
    noPickupsNotice: 'இதுவரை சேகரிப்பு திட்டமிடப்படவில்லை. உங்கள் முதல் சேகரிப்பை பதிவு செய்க!',
    findScrappersTitle: 'சரிபார்க்கப்பட்ட உள்ளூர் சேகரிப்பாளர்கள்',
    findScrappersDesc: 'வீட்டு வாசலில் நியாயமான எடையுடன் கழிவுகளை வழங்க உள்ளூர் கபாடிவாலாக்களை தொடர்பு கொள்ளவும்.',
    callScrapper: 'அழைக்கவும்',
    chatScrapper: 'செய்தி அனுப்பவும்',
    bookWithScrapper: 'பதிவு செய்க',
    estimatedValue: 'மதிப்பிடப்பட்ட விலை:',
    doorstepWeighing: 'வீட்டு வாசலில் டிஜிட்டல் எடை சோதனை',
    resaleTitle: 'சேகரிப்பாளர் மூலம் மறுசுழற்சிக்கு விற்பனை',
    resaleDesc: 'வீட்டில் பெற்ற பிறகு, சேகரிப்பாளர் இந்த கழிவை CPCB அங்கீகரிக்கப்பட்ட சுழற்சி சங்கிலியில் விற்கிறார்.',
    receiptBtn: 'ரசீது (.PDF / .TXT)',
    greenCertTitle: 'CPCB பசுமை குடிமக்கள் சான்றிதழ்'
  }
};

// Household Fair Price Rate Card Benchmark
const HOUSEHOLD_RATES: Array<{
  category: string;
  unit: string;
  rate: number;
  popularItems: string;
  icon: string;
}> = [
  {
    category: 'Old Smartphones & Tablets',
    unit: 'Per Piece',
    rate: 450,
    popularItems: 'Dead Android/iPhones, shattered screens, feature phones',
    icon: '📱'
  },
  {
    category: 'Laptops & Computer Cabinets',
    unit: 'Per Piece',
    rate: 850,
    popularItems: 'Old laptops, desktop CPU towers, motherboards, RAM',
    icon: '💻'
  },
  {
    category: 'Copper Wiring & Power Cables',
    unit: 'Per KG',
    rate: 420,
    popularItems: 'Extension cords, adapter cables, home appliance wires',
    icon: '🔌'
  },
  {
    category: 'Heavy Home Appliances',
    unit: 'Per KG',
    rate: 38,
    popularItems: 'Broken washing machines, refrigerators, microwaves, iron fans',
    icon: '🧊'
  },
  {
    category: 'Inverter & Car Batteries (Lead-Acid)',
    unit: 'Per KG',
    rate: 95,
    popularItems: 'UPS inverter batteries, automotive 12V cells, telecom packs',
    icon: '🔋'
  },
  {
    category: 'Mixed Electronics & Small Gadgets',
    unit: 'Per KG',
    rate: 65,
    popularItems: 'Keyboards, mice, routers, set-top boxes, chargers, remote controls',
    icon: '🖲️'
  }
];

export const HouseholdDashboard: React.FC<HouseholdDashboardProps> = ({
  user,
  lang = 'en',
  activeMenuTab: controlledTab,
  onSelectMenuTab,
  onOpenChat
}) => {
  const t = HOUSEHOLD_TEXTS[lang] || HOUSEHOLD_TEXTS.en;

  // Tab State
  const [internalTab, setInternalTab] = useState<HouseholdMenuTab>('pickup');
  const currentTab = controlledTab ?? internalTab;
  const setTab = (tab: HouseholdMenuTab) => {
    if (onSelectMenuTab) onSelectMenuTab(tab);
    setInternalTab(tab);
  };

  // Pickups & Scrappers Data
  const [pickups, setPickups] = useState<HouseholdPickupRequest[]>([]);
  const [scrappers, setScrappers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Pickup Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedScrapperForBooking, setSelectedScrapperForBooking] = useState<any | null>(null);
  const [pickupForm, setPickupForm] = useState({
    category: 'Home Appliances & Broken Electronics',
    items_description: '',
    estimated_weight_kg: 10,
    pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferred_time_slot: 'Morning (9:00 AM - 12:00 PM)',
    address: user.location || 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
    notes: ''
  });

  // Rate Estimator State
  const [calculatorCategory, setCalculatorCategory] = useState(HOUSEHOLD_RATES[0].category);
  const [calculatorQty, setCalculatorQty] = useState<number>(3);

  // Digital Receipt Modal
  const [receiptLot, setReceiptLot] = useState<any | null>(null);

  // Scrapper Filter & View Mode
  const [scrapperSearch, setScrapperSearch] = useState('');
  const [scrapperViewMode, setScrapperViewMode] = useState<'cards' | 'map'>('cards');

  // Direct Scrapper Chat State for Tab 3
  const [activeChatScrapperId, setActiveChatScrapperId] = useState<string>('usr-scrapper-1');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [hasChatUnreadBelow, setHasChatUnreadBelow] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isChatNearBottomRef = useRef<boolean>(true);
  const isChatFirstLoadRef = useRef<boolean>(true);
  const justSentMessageRef = useRef<boolean>(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [pickupData, scrapperData] = await Promise.all([
        api.getHouseholdPickups({ household_id: user.id }).catch(() => []),
        api.getHouseholdScrappers().catch(() => [])
      ]);
      setPickups(pickupData);
      setScrappers(scrapperData);
    } catch (err) {
      console.warn('Failed to load household data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Sync activeChatScrapperId when scrappers load
  useEffect(() => {
    if (scrappers.length > 0 && !scrappers.some(s => s.id === activeChatScrapperId)) {
      setActiveChatScrapperId(scrappers[0].id);
    }
  }, [scrappers]);

  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceToBottom < 100;
    isChatNearBottomRef.current = isNearBottom;
    if (isNearBottom) {
      setHasChatUnreadBelow(false);
    }
  };

  const scrollToChatBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior
    });
    setHasChatUnreadBelow(false);
  };

  // Fetch chat messages when activeChatScrapperId changes or tab is chat
  const fetchHouseholdChats = async () => {
    if (!activeChatScrapperId) return;
    try {
      const msgs = await api.getChats({
        user_id: user.id,
        other_user_id: activeChatScrapperId
      });
      setChatMessages((prev) => {
        if (
          prev.length === msgs.length &&
          prev.length > 0 &&
          prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id
        ) {
          return prev;
        }
        if (prev.length > 0 && msgs.length > prev.length) {
          if (!isChatNearBottomRef.current) {
            setHasChatUnreadBelow(true);
          }
        }
        return msgs;
      });
    } catch (err) {
      console.warn('Failed to load household chats:', err);
    }
  };

  useEffect(() => {
    if (currentTab === 'chat' || activeChatScrapperId) {
      fetchHouseholdChats();
      const interval = setInterval(fetchHouseholdChats, 2500);
      return () => clearInterval(interval);
    }
  }, [currentTab, activeChatScrapperId, user.id]);

  useEffect(() => {
    if (currentTab === 'chat') {
      if (isChatFirstLoadRef.current) {
        if (chatMessages.length > 0) {
          scrollToChatBottom('auto');
          isChatFirstLoadRef.current = false;
        }
      } else if (justSentMessageRef.current) {
        scrollToChatBottom('smooth');
        justSentMessageRef.current = false;
      } else if (isChatNearBottomRef.current) {
        scrollToChatBottom('smooth');
      }
    }
  }, [chatMessages, currentTab]);

  useEffect(() => {
    isChatFirstLoadRef.current = true;
    setHasChatUnreadBelow(false);
  }, [activeChatScrapperId]);

  const handleSendHouseholdMessage = async (textToSend?: string) => {
    const text = textToSend || chatInputText;
    if (!text.trim() || !activeChatScrapperId || chatSending) return;
    setChatSending(true);
    justSentMessageRef.current = true;
    try {
      const activeScrapper = scrappers.find(s => s.id === activeChatScrapperId);
      const receiverName = activeScrapper?.name || 'Verified Kabadiwala';
      await api.sendChatMessage({
        sender_id: user.id,
        sender_name: user.name,
        sender_role: 'household',
        receiver_id: activeChatScrapperId,
        receiver_name: receiverName,
        message: text.trim()
      });
      if (!textToSend) setChatInputText('');
      fetchHouseholdChats();
      setTimeout(() => scrollToChatBottom('smooth'), 50);
    } catch (err) {
      console.warn('Failed to send chat message:', err);
      showToast('Could not send message. Please retry.');
    } finally {
      setChatSending(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Handle Create Pickup
  const handleCreatePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupForm.items_description.trim()) {
      showToast('Please specify the scrap items to collect.');
      return;
    }

    try {
      const newPickup = await api.createHouseholdPickup({
        household_id: user.id,
        household_name: user.name,
        household_phone: user.phone || '+91 98450 77665',
        household_address: pickupForm.address,
        household_gps: user.latitude && user.longitude ? { latitude: user.latitude, longitude: user.longitude } : undefined,
        scrapper_id: selectedScrapperForBooking?.id || undefined,
        scrapper_name: selectedScrapperForBooking?.name || 'Ramesh Kumar (Assigned Nearby)',
        scrapper_phone: selectedScrapperForBooking?.phone || '+91 98450 12345',
        category: pickupForm.category,
        items_description: pickupForm.items_description,
        estimated_weight_kg: Number(pickupForm.estimated_weight_kg) || 5,
        pickup_date: pickupForm.pickup_date,
        preferred_time_slot: pickupForm.preferred_time_slot,
        notes: pickupForm.notes
      });

      setPickups([newPickup, ...pickups]);
      setIsBookingModalOpen(false);
      setSelectedScrapperForBooking(null);
      setPickupForm({
        category: 'Home Appliances & Broken Electronics',
        items_description: '',
        estimated_weight_kg: 10,
        pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        preferred_time_slot: 'Morning (9:00 AM - 12:00 PM)',
        address: user.location || 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
        notes: ''
      });
      showToast('🎉 Doorstep scrap pickup requested! Nearby scrapper has been notified.');
    } catch (err: any) {
      showToast('Failed to schedule pickup: ' + err.message);
    }
  };

  // Computed Metrics
  const totalScrapKg = pickups
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.actual_weight_kg || p.estimated_weight_kg), 0);

  const totalEarningsInr = pickups
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.total_payout || 0), 0);

  const activePickupsCount = pickups.filter(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;
  const co2PreventedKg = Math.round(totalScrapKg * 1.8);

  // Filtered Scrappers
  const filteredScrappers = scrappers.filter(s =>
    s.name.toLowerCase().includes(scrapperSearch.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(scrapperSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Household Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold">
                <Home className="w-3.5 h-3.5" />
                <span>Household Citizen Portal</span>
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{user.location || 'Bengaluru, Karnataka'}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.welcome}, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="book-doorstep-pickup-hero-btn"
              onClick={() => {
                setSelectedScrapperForBooking(null);
                setIsBookingModalOpen(true);
              }}
              className="py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>{t.requestPickupBtn}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.statTotalScrap}</span>
            <span className="text-xl font-black text-white mt-0.5 block">{totalScrapKg} kg</span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Diverted from Landfills</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.statEarnings}</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">₹{totalEarningsInr.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-300 font-semibold">Direct UPI / Cash Settlement</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.statActivePickups}</span>
            <span className="text-xl font-black text-blue-300 mt-0.5 block">{activePickupsCount}</span>
            <span className="text-[10px] text-blue-400 font-semibold">In Progress or Scheduled</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.statCo2Saved}</span>
            <span className="text-xl font-black text-emerald-300 mt-0.5 block">{co2PreventedKg} kg CO₂e</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Green Citizen Contribution</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'pickup', label: t.activeTabPickup, icon: Truck },
          { id: 'scrappers', label: t.activeTabScrappers, icon: Phone },
          { id: 'chat', label: t.activeTabChat, icon: MessageSquare },
          { id: 'calculator', label: t.activeTabCalculator, icon: Scale },
          { id: 'tracking', label: t.activeTabTracking, icon: Clock },
          { id: 'impact', label: t.activeTabImpact, icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id as HouseholdMenuTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DOORSTEP PICKUPS & ACTIVE BOOKINGS */}
      {currentTab === 'pickup' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Your Scheduled & Past Doorstep Pickups
              </h2>
              <p className="text-xs text-slate-500">
                Track pickups requested from local verified Kabadiwalas with scale weights and instant receipts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedScrapperForBooking(null);
                setIsBookingModalOpen(true);
              }}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Doorstep Pickup</span>
            </button>
          </div>

          {pickups.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.noPickupsNotice}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No need to carry heavy appliances or search for roadside scrap buyers. A verified Kabadiwala will arrive with a digital scale at your doorstep!
              </p>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="mt-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Book Doorstep Pickup Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickups.map((p) => {
                const isCompleted = p.status === 'COMPLETED';
                const isPending = p.status === 'PENDING';
                const isAccepted = p.status === 'ACCEPTED';

                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">{p.id}</span>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5">{p.category}</h3>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isAccepted
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      {/* Items Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.items_description}
                      </p>

                      {/* Key Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Est. Weight</span>
                          <span className="font-bold text-slate-800">{p.actual_weight_kg || p.estimated_weight_kg} KG</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Pickup Date & Time</span>
                          <span className="font-bold text-slate-800">{p.pickup_date} ({p.preferred_time_slot.split(' ')[0]})</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Assigned Scrapper:</span>
                          <span className="font-bold text-slate-800">{p.scrapper_name || 'Ramesh Kumar (Pending assignment)'}</span>
                        </div>
                      </div>

                      {/* Circular Supply Chain Journey Indicator */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] space-y-1.5">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Circular Journey: Sold by Scrapper</span>
                        </div>
                        <p className="text-[10px] text-emerald-800 leading-snug">
                          {isCompleted
                            ? '✓ Scrap collected at your doorstep, sorted in scrapper yard, and sold into the certified CPCB circular stream.'
                            : 'Scrapper will inspect and weigh at your doorstep. Upon collection, scrap will be consolidated and channeled to certified recycling.'}
                        </p>
                      </div>

                      {/* Payout & Settlement Info (if completed) */}
                      {isCompleted && (
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-slate-500 font-medium">Total Payout Received:</span>
                          <span className="font-mono text-base font-black text-emerald-700">
                            ₹{p.total_payout?.toLocaleString('en-IN') || 0}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {p.scrapper_phone && (
                          <a
                            href={`tel:${p.scrapper_phone}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title={`Call scrapper: ${p.scrapper_name}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          </a>
                        )}
                        {onOpenChat && p.scrapper_id && (
                          <button
                            type="button"
                            onClick={() => onOpenChat({
                              id: p.scrapper_id || 'usr-scrapper-1',
                              name: p.scrapper_name || 'Ramesh Kumar',
                              role: 'scrapper',
                              phone: p.scrapper_phone
                            })}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Chat with scrapper"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                        )}
                      </div>

                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={() => setReceiptLot({
                            lot_reference_id: p.id,
                            status: 'PAID',
                            handover_timestamp: p.completed_at || p.created_at,
                            created_at: p.created_at,
                            scrapper_name: p.scrapper_name || 'Ramesh Kumar',
                            scrapper_id: p.scrapper_id || 'usr-scrapper-1',
                            recycler_name: 'Certified Circular Stream (Sold by Scrapper)',
                            recycler_id: 'cpcb-circular-stream',
                            category: p.category,
                            actual_weight: p.actual_weight_kg || p.estimated_weight_kg,
                            estimated_weight: p.estimated_weight_kg,
                            offered_rate_per_kg: p.offered_rate_per_kg || 48,
                            final_payout: p.total_payout || 936,
                            payment_mode: p.payment_mode || 'UPI_DIGITAL'
                          })}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.receiptBtn}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {isAccepted ? 'Scrapper arriving soon' : 'Awaiting confirmation'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NEARBY VERIFIED SCRAPPERS (KABADIWALAS) - ZERO RECYCLERS */}
      {currentTab === 'scrappers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.findScrappersTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.findScrappersDesc}
              </p>
            </div>

            {/* Controls: Search and View Mode Switcher */}
            <div className="flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={scrapperSearch}
                  onChange={(e) => setScrapperSearch(e.target.value)}
                  placeholder="Search scrapper by name or locality..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setScrapperViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    scrapperViewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setScrapperViewMode('map')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    scrapperViewMode === 'map'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Map Radar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conditional View: Live Map Radar vs Scrappers Grid */}
          {scrapperViewMode === 'map' ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Neighborhood Kabadiwala Map Radar (Strictly Verified Scrappers Only)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Zero Recycler Clutter
                </span>
              </div>
              <OpenStreetMap
                currentUser={user}
                mode="all"
                height="450px"
                hideFitAll={true}
                onOpenChat={onOpenChat}
                onSelectScrapper={(scrapper) => {
                  if (onOpenChat) {
                    onOpenChat({
                      id: scrapper.id,
                      name: scrapper.name,
                      role: 'scrapper',
                      phone: scrapper.phone
                    });
                  }
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScrappers.map((scrapper) => (
              <div key={scrapper.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Scrapper Profile Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      {scrapper.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{scrapper.name}</h3>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          <Check className="w-3 h-3" />
                          <span>KYC Verified</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{scrapper.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vehicle</span>
                      <span className="font-semibold text-slate-800 truncate block">{scrapper.vehicle || 'Electric Loader'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pickups Done</span>
                      <span className="font-bold text-emerald-700">{scrapper.pickups_completed || 48}+ Verified</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Service Radius</span>
                      <span className="font-semibold text-slate-800">{scrapper.service_radius_km || 8} km radius</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Digital Weighing</span>
                      <span className="font-semibold text-emerald-600">✓ Scale on-site</span>
                    </div>
                  </div>
                </div>

                {/* Direct Connect Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${scrapper.phone || '+919845012345'}`}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.callScrapper}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenChat && onOpenChat({
                        id: scrapper.id,
                        name: scrapper.name,
                        role: 'scrapper',
                        phone: scrapper.phone
                      })}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.chatScrapper}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScrapperForBooking(scrapper);
                      setIsBookingModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t.bookWithScrapper}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* TAB: DIRECT CHAT BETWEEN HOUSEHOLD AND NEIGHBORHOOD SCRAPPER */}
      {currentTab === 'chat' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Kabadiwala Negotiation Chat & Doorstep Coordination
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Direct live conversation with certified neighborhood scrappers. Negotiate per-kg rates, request digital scale weighing, and confirm instant doorstep collection.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchHouseholdChats()}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Chat Split Layout: Left Scrappers Roster, Right Live Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Scrapper Directory List */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Verified Scrappers ({scrappers.length})
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Online
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {scrappers.map((scrapper) => {
                  const isSelected = activeChatScrapperId === scrapper.id;
                  return (
                    <button
                      key={scrapper.id}
                      type="button"
                      onClick={() => setActiveChatScrapperId(scrapper.id)}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                          : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {scrapper.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-xs text-slate-900 leading-tight">
                                {scrapper.name}
                              </h4>
                              {scrapper.verified && (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 rounded">
                                  ✓ KYC
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate max-w-[170px] mt-0.5">
                              {scrapper.location}
                            </p>
                          </div>
                        </div>
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${isSelected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{scrapper.vehicle || 'Electric Loader'}</span>
                        <span className="font-semibold text-emerald-700">{scrapper.pickups_completed || 48}+ Pickups</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Thread Console */}
            <div className="lg:col-span-8 flex flex-col h-[520px] bg-white">
              {/* Active Scrapper Header */}
              {(() => {
                const currentScrapper = scrappers.find(s => s.id === activeChatScrapperId) || scrappers[0];
                return (
                  <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {currentScrapper ? currentScrapper.name.slice(0, 2).toUpperCase() : 'SC'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-sm text-slate-900 truncate">
                            {currentScrapper ? currentScrapper.name : 'Ramesh Kumar (Kabadiwala)'}
                          </h3>
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full border border-emerald-300">
                            Aadhaar KYC
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentScrapper ? currentScrapper.location : 'Indiranagar & Peenya Zone'} • Calibrated Digital Scale Equipped
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {currentScrapper?.phone && (
                        <a
                          href={`tel:${currentScrapper.phone}`}
                          className="py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                          title="Call scrapper directly"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScrapperForBooking(currentScrapper);
                          setIsBookingModalOpen(true);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Book Pickup</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Message Feed */}
              <div
                ref={chatContainerRef}
                onScroll={handleChatScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 relative"
              >
                {/* Floating jump to bottom chip if user scrolled up and new message arrives */}
                {hasChatUnreadBelow && (
                  <button
                    type="button"
                    onClick={() => scrollToChatBottom('smooth')}
                    className="sticky bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer animate-bounce"
                  >
                    <span>New messages below</span>
                    <span>↓</span>
                  </button>
                )}
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="font-bold text-sm text-slate-800">Start chat with your neighborhood Kabadiwala</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Ask about per-kg scrap rates, check arrival times, or share your doorstep address to confirm a pickup.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      {[
                        'Namaste! I have old appliances ready for doorstep collection.',
                        'What is your rate per kg for mixed electronics?',
                        'Can you come today with a certified digital weighing scale?'
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendHouseholdMessage(preset)}
                          className="text-[11px] font-semibold bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs transition-all text-left cursor-pointer"
                        >
                          "{preset}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isSelf = msg.sender_id === user.id || msg.sender_role === 'household';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-1 ${
                            isSelf
                              ? 'bg-slate-900 text-white rounded-br-xs'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                            <span className="font-bold">{isSelf ? 'You (Household)' : msg.sender_name || 'Kabadiwala'}</span>
                            <span className="font-mono">
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Quick Template Buttons */}
              <div className="px-3.5 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-500 font-bold shrink-0 text-[10px] uppercase">Quick:</span>
                <button
                  type="button"
                  onClick={() => handleSendHouseholdMessage(`[Doorstep Address] Please collect scrap from: ${user.location || 'Flat 402, Indiranagar, Bengaluru'}`)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs"
                >
                  📍 Share Address
                </button>
                <button
                  type="button"
                  onClick={() => handleSendHouseholdMessage('Please bring calibrated digital scale for accurate doorstep weighing.')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs"
                >
                  ⚖️ Digital Scale Request
                </button>
                <button
                  type="button"
                  onClick={() => handleSendHouseholdMessage('Will you provide instant UPI transfer upon weighment?')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs"
                >
                  💳 UPI Payout Confirmation
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendHouseholdMessage();
                    }
                  }}
                  placeholder="Type a message to scrapper (negotiate rates, confirm doorstep arrival)..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleSendHouseholdMessage()}
                  disabled={chatSending || !chatInputText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {chatSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentTab === 'calculator' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Household Scrap Rate Card & Fair Price Estimator
            </h2>
            <p className="text-xs text-slate-500">
              Official CPCB floor prices for household electronics. Check what your old appliances are worth before handing over to the scrapper.
            </p>
          </div>

          {/* Interactive Calculator Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Instant Doorstep Value Estimator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Item Category:
                </label>
                <select
                  value={calculatorCategory}
                  onChange={(e) => setCalculatorCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                >
                  {HOUSEHOLD_RATES.map((r) => (
                    <option key={r.category} value={r.category} className="bg-slate-900 text-white">
                      {r.icon} {r.category} (₹{r.rate} {r.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Quantity / Weight ({HOUSEHOLD_RATES.find(r => r.category === calculatorCategory)?.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={calculatorQty}
                  onChange={(e) => setCalculatorQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* Calculated Output */}
            {(() => {
              const matched = HOUSEHOLD_RATES.find(r => r.category === calculatorCategory) || HOUSEHOLD_RATES[0];
              const totalEst = matched.rate * calculatorQty;

              return (
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-300 block">
                      Estimated Doorstep Payout for {calculatorQty} {matched.unit.toLowerCase()}:
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                      ₹{totalEst.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPickupForm(prev => ({
                        ...prev,
                        category: matched.category,
                        estimated_weight_kg: calculatorQty,
                        items_description: `${calculatorQty} ${matched.unit} of ${matched.category}`
                      }));
                      setIsBookingModalOpen(true);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>Book Pickup for this Scrap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Reference Rate Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Official Benchmark Household Scrap Rates
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Updated Daily</span>
            </div>

            <div className="divide-y divide-slate-100">
              {HOUSEHOLD_RATES.map((r) => (
                <div key={r.category} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{r.category}</h4>
                      <p className="text-[11px] text-slate-500">{r.popularItems}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-sm text-emerald-700 block">₹{r.rate}</span>
                    <span className="text-[10px] text-slate-400 block">{r.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPLY CHAIN TRACKING (SCRAP SOLD BY SCRAPPER) */}
      {currentTab === 'tracking' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.resaleTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {t.resaleDesc}
            </p>
          </div>

          {/* Circular Chain Flow Visualization */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Step 1: Doorstep Handover</span>
                <h4 className="text-xs font-bold text-slate-900">Household Doorstep</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  You give scrap to verified neighborhood scrapper (Ramesh). Digital scale verifies weight. Instant UPI payout received.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Step 2: Scrapper Yard Aggregation</span>
                <h4 className="text-xs font-bold text-slate-900">Aggregated by Scrapper</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Scrapper stores and sorts scrap into certified categories (copper, circuits, plastics) at their local collection hub.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Step 3: Sold into Circular Stream</span>
                <h4 className="text-xs font-bold text-slate-900">Sold by Scrapper</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Scrapper broadcasts verified lot into the formal CPCB supply chain. 100% recycled without toxic open dumping!
                </p>
              </div>
            </div>

            {/* Past Sold Items Table */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800">Your Scrap Resale Tracking Log</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {pickups.map((p) => (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.category}</span>
                        <span className="text-[10px] font-mono text-slate-400">({p.id})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Collected by {p.scrapper_name || 'Ramesh Kumar'} on {p.pickup_date} • {p.actual_weight_kg || p.estimated_weight_kg} KG
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {p.status === 'COMPLETED' ? '✓ Sold by Scrapper to Circular Stream' : 'In Collection Pipeline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GREEN CITIZEN IMPACT & CERTIFICATE */}
      {currentTab === 'impact' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.greenCertTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Your personal environmental contribution towards Swachh Bharat and zero-waste landfills.
            </p>
          </div>

          {/* Certificate Card */}
          <div className="bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl border-2 border-emerald-500 p-6 sm:p-9 shadow-xl space-y-6 max-w-2xl mx-auto text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                National E-Waste Circular Economy Protocol
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Certificate of Responsible E-Waste Citizen
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Presented to <strong className="text-slate-900">{user.name}</strong> for diverting <strong className="text-emerald-700">{totalScrapKg} KG</strong> of hazardous electronic scrap from toxic dumping, preventing heavy metal contamination.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-white p-4 rounded-2xl border border-emerald-200">
              <div>
                <span className="text-[10px] text-slate-400 block">Scrap Recycled</span>
                <span className="text-base font-bold text-slate-800 font-mono">{totalScrapKg} KG</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">CO₂ Abated</span>
                <span className="text-base font-bold text-emerald-700 font-mono">{co2PreventedKg} KG</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Lead Diverted</span>
                <span className="text-base font-bold text-blue-700 font-mono">{Math.round(totalScrapKg * 0.12)} KG</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BOOK NEW DOORSTEP SCRAP PICKUP */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-7 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {selectedScrapperForBooking ? `Book Pickup with ${selectedScrapperForBooking.name}` : 'Book Doorstep Scrap Pickup'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePickup} className="space-y-4 text-xs">
              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scrap Category:</label>
                <select
                  value={pickupForm.category}
                  onChange={(e) => setPickupForm({ ...pickupForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {HOUSEHOLD_RATES.map((r) => (
                    <option key={r.category} value={r.category}>{r.icon} {r.category}</option>
                  ))}
                  <option value="Mixed Household Electronics">Mixed Household Electronics</option>
                </select>
              </div>

              {/* Items Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Items Description (What are you giving?):</label>
                <textarea
                  required
                  rows={2}
                  value={pickupForm.items_description}
                  onChange={(e) => setPickupForm({ ...pickupForm, items_description: e.target.value })}
                  placeholder="e.g. 1 Broken microwave, 2 old keypad phones, 1 laptop charger cord..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Estimated Weight & Date Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Est. Total Weight (KG):</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={pickupForm.estimated_weight_kg}
                    onChange={(e) => setPickupForm({ ...pickupForm, estimated_weight_kg: Number(e.target.value) || 5 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Pickup Date:</label>
                  <input
                    type="date"
                    required
                    value={pickupForm.pickup_date}
                    onChange={(e) => setPickupForm({ ...pickupForm, pickup_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Time Slot */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Time Slot:</label>
                <select
                  value={pickupForm.preferred_time_slot}
                  onChange={(e) => setPickupForm({ ...pickupForm, preferred_time_slot: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                  <option value="Weekend (Sunday Anytime)">Weekend (Sunday Anytime)</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Doorstep Address:</label>
                <input
                  type="text"
                  required
                  value={pickupForm.address}
                  onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Selected Scrapper Hint */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center justify-between">
                <span>Assigned Collector:</span>
                <strong className="font-bold">{selectedScrapperForBooking?.name || 'Nearest Available Verified Kabadiwala'}</strong>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Confirm Doorstep Pickup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal (Voucher in .PDF or .TXT) */}
      {receiptLot && (
        <DigitalReceiptModal
          lot={receiptLot}
          lang={lang}
          onClose={() => setReceiptLot(null)}
        />
      )}
    </div>
  );
};
