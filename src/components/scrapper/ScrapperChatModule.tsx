import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, Transaction, RecyclerFacility, VernacularLang } from '../../types';
import { api } from '../../api/client';
import {
  MessageSquare, Send, Paperclip, MapPin, DollarSign, Clock,
  CheckCircle2, Building2, User as UserIcon, RefreshCw, Sparkles, Phone, Home, Truck
} from 'lucide-react';

interface ScrapperChatModuleProps {
  currentUser?: User;
  user?: User;
  recyclers?: RecyclerFacility[];
  latestLot?: Transaction | null;
  initialLot?: Transaction | null;
  myLots?: Transaction[];
  initialTargetRecycler?: { id: string; name: string; role: string; phone?: string } | null;
  currentCoords?: { latitude: number; longitude: number; label: string };
  lang?: VernacularLang;
}

const SCRAPPER_CHAT_TEXTS: Record<VernacularLang, {
  tag: string;
  step: string;
  title: string;
  desc: string;
  refreshChat: string;
  authorizedPlants: string;
  online: string;
  cpcbAuthorized: string;
  attachLot: (refId: string) => string;
  proposeRateBtn: string;
  proposeRateLabel: string;
  sendOffer: string;
  cancel: string;
  noChatHistory: string;
  noChatHistoryDesc: string;
  newMessages: string;
  quickActions: string;
  shareMyGps: string;
  reqDoorstepVehicle: string;
  askUpiPayout: string;
  placeholder: (name: string) => string;
  send: string;
  attachedLotPrompt: (refId: string, cat: string, weight: number, rate: number) => string;
  gpsPrompt: (addr: string, lat: number, lng: number) => string;
  counterOfferPrompt: (rate: string) => string;
  quickVehicleMsg: string;
  quickUpiMsg: string;
}> = {
  en: {
    tag: 'Direct Recycler Communication',
    step: 'Module 4 of 7',
    title: 'Certified Recycler Negotiation & Logistics Chat',
    desc: 'Communicate directly with licensed processing plants, negotiate material price per kg, attach confirmed lots, and schedule doorstep collection.',
    refreshChat: 'Refresh Chat',
    authorizedPlants: 'Authorized Processing Plants',
    online: 'Online',
    cpcbAuthorized: 'CPCB Authorized Recycler',
    attachLot: (id) => `Attach Lot #${id}`,
    proposeRateBtn: '₹ Propose Rate',
    proposeRateLabel: 'Propose Rate (₹/kg):',
    sendOffer: 'Send Offer',
    cancel: 'Cancel',
    noChatHistory: 'No chat history yet',
    noChatHistoryDesc: 'Start the conversation! Attach your confirmed lot or share your collection location to get an instant pickup quote.',
    newMessages: 'New messages ↓',
    quickActions: 'Quick Actions:',
    shareMyGps: 'Share My GPS',
    reqDoorstepVehicle: 'Request Doorstep Vehicle',
    askUpiPayout: 'Ask UPI Digital Payout',
    placeholder: (name) => `Message ${name}...`,
    send: 'Send',
    attachedLotPrompt: (id, cat, weight, rate) => `[Attached Lot #${id}] Category: ${cat}, Confirmed Scale Weight: ${weight} kg. Requested rate: ₹${rate}/kg.`,
    gpsPrompt: (addr, lat, lng) => `[GPS Coordinates] Live Collection Point: ${addr} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    counterOfferPrompt: (rate) => `[Price Negotiation] Counter-offering revised rate: ₹${rate} per kg.`,
    quickVehicleMsg: 'Can you provide doorstep pickup vehicle today?',
    quickUpiMsg: 'Can you pay immediately via digital UPI upon weighment?'
  },
  hi: {
    tag: 'सीधा रीसायकलर संवाद',
    step: 'मॉड्यूल 4 / 7',
    title: 'प्रमाणित रीसायकलर बातचीत एवं लॉजिस्टिक्स चैट',
    desc: 'लाइसेंस प्राप्त संयंत्रों से सीधे बात करें, प्रति किलो भाव तय करें, लॉट जोड़ें और घर से गाड़ी मंगाएं।',
    refreshChat: 'चैट रीफ्रेश करें',
    authorizedPlants: 'अधिकृत प्रसंस्करण संयंत्र',
    online: 'ऑनलाइन',
    cpcbAuthorized: 'CPCB अधिकृत रीसायकलर',
    attachLot: (id) => `लॉट #${id} जोड़ें`,
    proposeRateBtn: '₹ भाव प्रस्तावित करें',
    proposeRateLabel: 'प्रस्तावित दर (₹/किग्रा):',
    sendOffer: 'प्रस्ताव भेजें',
    cancel: 'रद्द करें',
    noChatHistory: 'अभी कोई चैट इतिहास नहीं है',
    noChatHistoryDesc: 'बातचीत शुरू करें! अपना लॉट जोड़ें या जीपीएस स्थान साझा करके तुरंत पिकअप तय करें।',
    newMessages: 'नए संदेश ↓',
    quickActions: 'त्वरित कार्रवाई:',
    shareMyGps: 'मेरा जीपीएस भेजें',
    reqDoorstepVehicle: 'डोरस्टेप गाड़ी का अनुरोध',
    askUpiPayout: 'तुरंत यूपीआई भुगतान पूछें',
    placeholder: (name) => `${name} को संदेश भेजें...`,
    send: 'भेजें',
    attachedLotPrompt: (id, cat, weight, rate) => `[संलग्न लॉट #${id}] श्रेणी: ${cat}, प्रमाणित वजन: ${weight} किग्रा, मांगी गई दर: ₹${rate}/किग्रा।`,
    gpsPrompt: (addr, lat, lng) => `[जीपीएस स्थिति] संग्रहण बिंदु: ${addr} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    counterOfferPrompt: (rate) => `[दर मोलभाव] संशोधित दर का प्रस्ताव: ₹${rate} प्रति किग्रा।`,
    quickVehicleMsg: 'क्या आप आज माल उठाने के लिए डोरस्टेप गाड़ी भेज सकते हैं?',
    quickUpiMsg: 'क्या आप वजन होते ही तुरंत डिजिटल यूपीआई से भुगतान करेंगे?'
  },
  mr: {
    tag: 'थेट रिसायकलर संवाद',
    step: 'मॉड्यूल ४ / ७',
    title: 'प्रमाणित रिसायकलर वाटाघाटी व थेट चर्चा',
    desc: 'अधिकृत प्रक्रिया केंद्रांशी थेट चर्चा करा, दर ठरवा, प्रमाणित लॉट जोडा आणि घरपोच गाडी ठरवा.',
    refreshChat: 'चर्चा ताजी करा',
    authorizedPlants: 'अधिकृत प्रक्रिया केंद्रे',
    online: 'सक्रिय',
    cpcbAuthorized: 'CPCB अधिकृत रिसायकलर',
    attachLot: (id) => `लॉट #${id} जोडा`,
    proposeRateBtn: '₹ दर प्रस्तावित करा',
    proposeRateLabel: 'प्रस्तावित दर (₹/किलो):',
    sendOffer: 'प्रस्ताव पाठवा',
    cancel: 'रद्द करा',
    noChatHistory: 'अजून संभाषण सुरू नाही',
    noChatHistoryDesc: 'चर्चा सुरू करा! आपला लॉट जोडा किंवा GPS स्थान पाठवून थेट गाडी ठरवा.',
    newMessages: 'नवीन संदेश ↓',
    quickActions: 'झटपट कृती:',
    shareMyGps: 'माझे GPS पाठवा',
    reqDoorstepVehicle: 'घरपोच गाडीची विनंती',
    askUpiPayout: 'थेट UPI पेमेंट विचारा',
    placeholder: (name) => `${name} यांना संदेश पाठवा...`,
    send: 'पाठवा',
    attachedLotPrompt: (id, cat, weight, rate) => `[संलग्न लॉट #${id}] श्रेणी: ${cat}, प्रमाणित वजन: ${weight} किलो, मागणी केलेला दर: ₹${rate}/किलो.`,
    gpsPrompt: (addr, lat, lng) => `[GPS स्थान] संकलन केंद्र: ${addr} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    counterOfferPrompt: (rate) => `[किंमत वाटाघाटी] सुधारित दर प्रस्ताव: ₹${rate} प्रति किलो.`,
    quickVehicleMsg: 'तुम्ही आज माल घेण्यासाठी घरपोच गाडी पाठवू शकता का?',
    quickUpiMsg: 'वजन झाल्यावर लगेच डिजिटल UPI ने पैसे जमा करणार का?'
  },
  ta: {
    tag: 'நேரடி மறுசுழற்சியாளர் உரையாடல்',
    step: 'தொகுதி 4 / 7',
    title: 'அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர் பேச்சுவார்த்தை அரட்டை',
    desc: 'அங்கீகரிக்கப்பட்ட ஆலைகளுடன் நேரடியாகப் பேசுங்கள், விலை பேரம் பேசுங்கள், லாட்களை இணைத்து பிக்கப் ஏற்பாடு செய்யுங்கள்.',
    refreshChat: 'அரட்டையைப் புதுப்பி',
    authorizedPlants: 'அங்கீகரிக்கப்பட்ட செயலாக்க ஆலைகள்',
    online: 'செயலில்',
    cpcbAuthorized: 'CPCB அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்',
    attachLot: (id) => `லாட் #${id} இணைக்கவும்`,
    proposeRateBtn: '₹ விலையை முன்மொழியவும்',
    proposeRateLabel: 'முன்மொழியப்பட்ட விலை (₹/கிலோ):',
    sendOffer: 'சலுகையை அனுப்பு',
    cancel: 'ரத்து செய்',
    noChatHistory: 'இதுவரை அரட்டை வரலாறு இல்லை',
    noChatHistoryDesc: 'உரையாடலைத் தொடங்குங்கள்! உங்கள் லாட்டை இணைக்கவும் அல்லது பிக்கப் பெற இருப்பிடத்தைப் பகிரவும்.',
    newMessages: 'புதிய செய்திகள் ↓',
    quickActions: 'விரைவு நடவடிக்கைகள்:',
    shareMyGps: 'எனது ஜிபிஎஸ் இருப்பிடத்தை அனுப்பு',
    reqDoorstepVehicle: 'வாகனம் கோரிக்கை',
    askUpiPayout: 'உடனடி UPI பணப்பரிவர்த்தனை',
    placeholder: (name) => `${name} க்கு செய்தி அனுப்பவும்...`,
    send: 'அனுப்பு',
    attachedLotPrompt: (id, cat, weight, rate) => `[இணைக்கப்பட்ட லாட் #${id}] வகை: ${cat}, உறுதிசெய்யப்பட்ட எடை: ${weight} கிலோ, கோரப்பட்ட விலை: ₹${rate}/கிலோ.`,
    gpsPrompt: (addr, lat, lng) => `[ஜிபிஎஸ் இருப்பிடம்] சேகரிப்பு மையம்: ${addr} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    counterOfferPrompt: (rate) => `[விலை பேச்சுவார்த்தை] திருத்தப்பட்ட விலை சலுகை: ₹${rate} / கிலோ.`,
    quickVehicleMsg: 'இன்று கழிவுகளை சேகரிக்க வாகனம் அனுப்ப முடியுமா?',
    quickUpiMsg: 'எடை போட்டவுடன் உடனடியாக டிஜிட்டல் UPI மூலம் பணம் செலுத்த முடியுமா?'
  }
};

export const ScrapperChatModule: React.FC<ScrapperChatModuleProps> = ({
  currentUser: propCurrentUser,
  user: propUser,
  recyclers = [],
  latestLot,
  initialLot,
  myLots = [],
  initialTargetRecycler,
  currentCoords = {
    latitude: 13.0315,
    longitude: 77.5210,
    label: 'Peenya Industrial Area, Bengaluru'
  },
  lang = 'en'
}) => {
  const tChat = SCRAPPER_CHAT_TEXTS[lang] || SCRAPPER_CHAT_TEXTS.en;
  const safeUser: User = propCurrentUser || propUser || {
    id: 'usr-scrapper-1',
    name: 'Ramu K (Informal Collector)',
    username: 'ramu_scrap',
    role: 'scrapper',
    location: currentCoords.label || 'Peenya Industrial Area, Bengaluru',
    phone: '+91 98451 22334',
    verified: true,
    latitude: currentCoords.latitude || 13.0315,
    longitude: currentCoords.longitude || 77.5210
  };

  const attachedLot = initialLot || latestLot || (myLots.length > 0 ? myLots[0] : null);

  // Channel Toggle: 'recyclers' (formal buyers) vs 'households' (doorstep pickup requests)
  const [chatChannel, setChatChannel] = useState<'households' | 'recyclers'>('households');
  const [activeHouseholdId, setActiveHouseholdId] = useState<string>('usr-household-1');
  const [householdsList, setHouseholdsList] = useState<Array<{ id: string; name: string; location: string; phone: string; pendingItems?: string }>>([
    {
      id: 'usr-household-1',
      name: 'Priya Sharma (Household)',
      location: 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
      phone: '+91 98451 12345',
      pendingItems: 'Old TV, microwave & mobile phones'
    },
    {
      id: 'usr-household-2',
      name: 'Amit Patel (Household)',
      location: '12th Cross, Peenya 1st Stage, Bengaluru',
      phone: '+91 98452 33445',
      pendingItems: '2 Washing machine motors & computer cables'
    }
  ]);

  const [activeRecyclerId, setActiveRecyclerId] = useState<string>(
    initialTargetRecycler?.id || recyclers[0]?.id || 'rec-1'
  );

  useEffect(() => {
    if (initialTargetRecycler?.id) {
      if (initialTargetRecycler.role === 'household') {
        setChatChannel('households');
        setActiveHouseholdId(initialTargetRecycler.id);
      } else {
        setChatChannel('recyclers');
        setActiveRecyclerId(initialTargetRecycler.id);
      }
    }
  }, [initialTargetRecycler?.id]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [offerRate, setOfferRate] = useState('');
  const [showRateModal, setShowRateModal] = useState(false);
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);
  const isNearBottomRef = useRef(true);

  const activeRecycler =
    recyclers.find((r) => r.id === activeRecyclerId) ||
    (initialTargetRecycler
      ? {
          id: initialTargetRecycler.id,
          user_id: initialTargetRecycler.id,
          facility_name: initialTargetRecycler.name,
          cpcb_auth_number: 'CPCB/EW/2026/AUTH',
          address: 'Licensed E-Waste Plant',
          contact_phone: initialTargetRecycler.phone || '+91 98450 00000',
          latitude: 13.0315,
          longitude: 77.5210,
          is_authorized: true,
          offered_rates_json: {},
          pickup_available: true,
          service_radius_km: 30
        }
      : null) ||
    recyclers[0] || {
      id: 'rec-1',
      user_id: 'rec-1',
      facility_name: 'EcoRecycle Solutions Pvt Ltd',
      cpcb_auth_number: 'CPCB/EW/2026/KA-091',
      address: 'Peenya 2nd Stage, Bengaluru',
      contact_phone: '+91 98450 99882',
      latitude: 13.0315,
      longitude: 77.5210,
      is_authorized: true,
      offered_rates_json: {},
      pickup_available: true,
      service_radius_km: 30
    };

  const activeHousehold = householdsList.find(h => h.id === activeHouseholdId) || householdsList[0];
  const targetId = chatChannel === 'households' ? activeHousehold.id : activeRecycler.id;

  const justSentRef = useRef(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior
    });
    setHasUnreadBelow(false);
  };

  const handleContainerScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceToBottom < 100;
    isNearBottomRef.current = nearBottom;
    if (nearBottom) {
      setHasUnreadBelow(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await api.getChats({
        user_id: safeUser.id,
        other_user_id: targetId
      });
      
      setMessages((prev) => {
        // Prevent state update and re-render if data is identical
        if (
          prev.length === data.length &&
          prev.length > 0 &&
          prev[prev.length - 1]?.id === data[data.length - 1]?.id
        ) {
          return prev;
        }

        // Check if there are new messages while scrolled up
        if (prev.length > 0 && data.length > prev.length) {
          if (!isNearBottomRef.current) {
            setHasUnreadBelow(true);
          }
        }

        return data;
      });
    } catch (err) {
      console.warn('Failed to load chats in chat module:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [safeUser.id, targetId]);

  useEffect(() => {
    if (isFirstLoadRef.current) {
      if (messages.length > 0) {
        scrollToBottom('auto');
        isFirstLoadRef.current = false;
      }
    } else if (justSentRef.current) {
      scrollToBottom('smooth');
      justSentRef.current = false;
    } else if (isNearBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  useEffect(() => {
    isFirstLoadRef.current = true;
    setHasUnreadBelow(false);
  }, [targetId]);

  const handleSendMessage = async (customText?: string, metadata?: any) => {
    const text = customText || inputText;
    if (!text.trim()) return;

    setLoading(true);
    justSentRef.current = true;
    try {
      const receiverName = chatChannel === 'households' ? activeHousehold.name : activeRecycler.facility_name;
      const newMsg = await api.sendChatMessage({
        lot_reference_id: chatChannel === 'recyclers' ? attachedLot?.lot_reference_id : undefined,
        sender_id: safeUser.id,
        sender_name: safeUser.name,
        sender_role: safeUser.role,
        receiver_id: targetId,
        receiver_name: receiverName,
        message: text.trim(),
        metadata
      });
      setMessages((prev) => [...prev, newMsg]);
      if (!customText) setInputText('');
      // Always scroll to bottom when user sends a message
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendLotAttachment = () => {
    if (!attachedLot) return;
    const weight = attachedLot.declared_weight ?? attachedLot.estimated_weight;
    handleSendMessage(
      tChat.attachedLotPrompt(attachedLot.lot_reference_id, attachedLot.category, weight, attachedLot.offered_rate_per_kg),
      {
        type: 'lot_ref',
        data: {
          lot_id: attachedLot.lot_reference_id,
          category: attachedLot.category,
          weight: weight,
          rate: attachedLot.offered_rate_per_kg
        }
      }
    );
  };

  const handleSendGps = () => {
    handleSendMessage(
      tChat.gpsPrompt(currentCoords.label, currentCoords.latitude, currentCoords.longitude),
      {
        type: 'gps_coords',
        data: {
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
          address: currentCoords.label
        }
      }
    );
  };

  const handleSendCounterOffer = () => {
    if (!offerRate) return;
    handleSendMessage(tChat.counterOfferPrompt(offerRate), {
      type: 'rate_offer',
      data: { proposed_rate: Number(offerRate) }
    });
    setOfferRate('');
    setShowRateModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 uppercase tracking-wider">
              {tChat.tag}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{tChat.step}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {tChat.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            {tChat.desc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMessages}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{tChat.refreshChat}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Console Grid: Left Recycler/Household Directory (4 Cols); Right Chat Stream (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
        
        {/* Contact Directory Sidebar */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 space-y-3 bg-slate-50">
          {/* Channel Selector: Households vs Recyclers */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setChatChannel('households')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatChannel === 'households'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>Households</span>
            </button>
            <button
              type="button"
              onClick={() => setChatChannel('recyclers')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatChannel === 'recyclers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Recyclers</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              {chatChannel === 'households' ? 'Household Pickups' : tChat.authorizedPlants}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">{tChat.online}</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
            {chatChannel === 'households' ? (
              householdsList.map((hh) => {
                const isSelected = activeHouseholdId === hh.id;
                return (
                  <button
                    key={hh.id}
                    type="button"
                    onClick={() => setActiveHouseholdId(hh.id)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {hh.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{hh.location}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                    </div>
                    {hh.pendingItems && (
                      <div className="mt-2 text-[10px] bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-200 font-semibold truncate">
                        📦 {hh.pendingItems}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              recyclers.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setActiveRecyclerId(rec.id)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    activeRecyclerId === rec.id
                      ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                      : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {rec.facility_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{rec.address}</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-500">
                    {rec.cpcb_auth_number}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="lg:col-span-8 flex flex-col h-[560px] min-h-0 relative">
          {/* Active Contact Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {chatChannel === 'households' ? <Home className="w-5 h-5 text-emerald-600" /> : <Building2 className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {chatChannel === 'households' ? activeHousehold.name : activeRecycler.facility_name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-emerald-700 font-bold">
                    {chatChannel === 'households' ? 'Household Citizen • Doorstep Pickup' : tChat.cpcbAuthorized}
                  </span>
                  <span>•</span>
                  <span>{chatChannel === 'households' ? activeHousehold.phone : activeRecycler.contact_phone}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {chatChannel === 'recyclers' && attachedLot && (
                <button
                  type="button"
                  onClick={handleSendLotAttachment}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Attach latest broadcasted scrap lot"
                >
                  {tChat.attachLot(attachedLot.lot_reference_id)}
                </button>
              )}
              {chatChannel === 'recyclers' && (
                <button
                  type="button"
                  onClick={() => setShowRateModal(!showRateModal)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  {tChat.proposeRateBtn}
                </button>
              )}
              {chatChannel === 'households' && (
                <a
                  href={`tel:${activeHousehold.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Household</span>
                </a>
              )}
            </div>
          </div>

          {/* Rate negotiation sub-modal */}
          {showRateModal && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center gap-3 animate-in fade-in">
              <span className="text-xs font-bold text-amber-900">{tChat.proposeRateLabel}</span>
              <input
                type="number"
                value={offerRate}
                onChange={(e) => setOfferRate(e.target.value)}
                placeholder="e.g. 360"
                className="w-28 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleSendCounterOffer}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                {tChat.sendOffer}
              </button>
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {tChat.cancel}
              </button>
            </div>
          )}

          {/* Message List */}
          <div
            ref={messagesContainerRef}
            onScroll={handleContainerScroll}
            className="flex-1 min-h-0 p-5 overflow-y-auto space-y-3.5 bg-slate-50/50"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 p-8">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="font-bold text-sm text-slate-600">{tChat.noChatHistory}</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  {tChat.noChatHistoryDesc}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === safeUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                      <span className="font-semibold text-slate-600">{msg.sender_name}</span>
                      <span>•</span>
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                      }`}
                    >
                      <p>{msg.message}</p>

                      {/* Structured Metadata Bubble */}
                      {msg.metadata?.type === 'lot_ref' && (
                        <div className="mt-2.5 p-2.5 bg-black/20 rounded-xl text-xs font-mono space-y-1">
                          <div className="text-emerald-400 font-bold">
                            📦 Lot Reference: {msg.metadata.data.lot_id}
                          </div>
                          <div>Category: {msg.metadata.data.category}</div>
                          <div>Confirmed Weight: {msg.metadata.data.weight} kg</div>
                          <div>Proposed Rate: ₹{msg.metadata.data.rate}/kg</div>
                        </div>
                      )}

                      {msg.metadata?.type === 'gps_coords' && (
                        <div className="mt-2.5 p-2.5 bg-black/20 rounded-xl text-xs space-y-1">
                          <div className="flex items-center gap-1 text-emerald-400 font-bold">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>GPS Location Shared</span>
                          </div>
                          <div>{msg.metadata.data.address}</div>
                        </div>
                      )}

                      {msg.metadata?.type === 'rate_offer' && (
                        <div className="mt-2.5 p-2.5 bg-amber-500/20 rounded-xl text-xs font-bold text-amber-300">
                          💰 Proposed Counter Rate: ₹{msg.metadata.data.proposed_rate} per kg
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating Scroll-to-Bottom / New Messages Pill */}
          {hasUnreadBelow && (
            <div className="absolute bottom-24 right-6 z-20 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => scrollToBottom('smooth')}
                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <span>{tChat.newMessages}</span>
              </button>
            </div>
          )}

          {/* Quick Action Footer Pills */}
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">{tChat.quickActions}</span>
            {chatChannel === 'households' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Namaste! I am nearby in your locality with an e-rickshaw and calibrated digital scale. Can I visit your doorstep now?')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0"
                >
                  <Truck className="w-3 h-3 text-emerald-600" />
                  <span>Arriving Soon</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('I offer official CPCB guaranteed fair rates for all electronic scrap with instant UPI transfer.')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0"
                >
                  <span>Fair Rates Guarantee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Please share your flat number or landmark to reach your building gate quickly.')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0"
                >
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>Ask Gate / Landmark</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSendGps}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{tChat.shareMyGps}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(tChat.quickVehicleMsg)}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0"
                >
                  {tChat.reqDoorstepVehicle}
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(tChat.quickUpiMsg)}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0"
                >
                  {tChat.askUpiPayout}
                </button>
              </>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={tChat.placeholder(activeRecycler.facility_name)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">{tChat.send}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
