import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, Transaction, VernacularLang } from '../types';
import { api } from '../api/client';
import {
  playChatMessageSound,
  isAudioFeedbackEnabled,
  toggleAudioFeedback,
  subscribeAudioFeedback
} from '../utils/soundEffects';
import {
  X, Send, MapPin, DollarSign, Package, Clock, ShieldCheck,
  Minimize2, Maximize2, Square, ChevronDown, Users, Check,
  Sparkles, Phone, RefreshCw, MessageSquare, Volume2, VolumeX
} from 'lucide-react';

export interface ChatTarget {
  id: string;
  name: string;
  role: string;
  phone?: string;
  facilityName?: string;
  location?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  targetUser: ChatTarget;
  lot?: Transaction | null;
  lang?: VernacularLang;
  onSelectTarget?: (target: ChatTarget, lot?: Transaction | null) => void;
}

type WindowMode = 'drawer' | 'floating' | 'fullscreen' | 'minimized';

const CHAT_TEXTS: Record<VernacularLang, {
  switchContact: string;
  directory: string;
  clickToSwitch: string;
  minimize: string;
  floating: string;
  drawer: string;
  fullscreen: string;
  close: string;
  proposeRate: string;
  proposePerKgRate: string;
  sendOffer: string;
  shareGps: string;
  quickReplies: string;
  industryTemplatesTitle: string;
  templates: string[];
  channelTitle: string;
  channelDesc: string;
  sayHello: string;
  inputPlaceholder: string;
  send: string;
  newMessages: string;
  attachedLot: string;
  weight: string;
  benchmarkRate: string;
  realtimeComm: string;
  gpsSharedMsg: string;
  counterOfferPrefix: string;
}> = {
  en: {
    switchContact: 'Switch Contact',
    directory: 'Directory',
    clickToSwitch: 'Click to switch',
    minimize: 'Minimize to floating pill',
    floating: 'Dock as compact floating window',
    drawer: 'Open as side drawer',
    fullscreen: 'Expand to full screen',
    close: 'Close chat window',
    proposeRate: 'Propose Rate',
    proposePerKgRate: 'Propose Per-Kg Rate:',
    sendOffer: 'Send Offer',
    shareGps: 'Share Live GPS',
    quickReplies: 'Quick Replies',
    industryTemplatesTitle: 'One-Click Industry Templates',
    templates: [
      'We can accept this lot at current offered rate.',
      'Please deliver to weighing bench by 3 PM.',
      'Doorstep collection vehicle has been dispatched.',
      'Weighment verified. Initiating instant UPI transfer.',
      'Please upload a clear photograph of the PCB boards.',
      'Can you aggregate at least 50 kg for better rate?'
    ],
    channelTitle: 'Encrypted Traceable Channel',
    channelDesc: 'Direct peer-to-peer communication between Recycler Facility and Field Collector. Negotiate per-kg rates, share collection locations, and confirm digital weighment receipts.',
    sayHello: '👋 Say Hello',
    inputPlaceholder: 'Type message, negotiate rate, or confirm pickup...',
    send: 'Send message',
    newMessages: 'New messages ↓',
    attachedLot: 'Attached Lot',
    weight: 'Weight',
    benchmarkRate: 'Rate',
    realtimeComm: 'Real-time communication',
    gpsSharedMsg: 'Shared current collection GPS coordinates',
    counterOfferPrefix: '💰 Proposed counter-offer rate:'
  },
  hi: {
    switchContact: 'संपर्क बदलें',
    directory: 'संपर्क सूची',
    clickToSwitch: 'बदलने के लिए क्लिक करें',
    minimize: 'फ्लोटिंग बटन में छोटा करें',
    floating: 'कॉम्पैक्ट विंडो के रूप में रखें',
    drawer: 'साइड ड्रॉअर के रूप में खोलें',
    fullscreen: 'पूरी स्क्रीन में खोलें',
    close: 'चैट विंडो बंद करें',
    proposeRate: 'दर प्रस्तावित करें',
    proposePerKgRate: 'प्रति किलो दर प्रस्तावित करें:',
    sendOffer: 'ऑफर भेजें',
    shareGps: 'लाइव जीपीएस साझा करें',
    quickReplies: 'त्वरित उत्तर',
    industryTemplatesTitle: 'त्वरित उपयोगी संदेश',
    templates: [
      'हम इस लॉट को वर्तमान दर पर स्वीकार कर सकते हैं।',
      'कृपया दोपहर 3 बजे तक वजन कांटे पर पहुंचाएं।',
      'घर से उठाने के लिए वाहन भेज दिया गया है।',
      'वजन सत्यापित हो गया। यूपीआई भुगतान शुरू किया जा रहा है।',
      'कृपया पीसीबी बोर्ड की स्पष्ट तस्वीर अपलोड करें।',
      'क्या आप बेहतर दर के लिए कम से कम 50 किग्रा एकत्र कर सकते हैं?'
    ],
    channelTitle: 'सुरक्षित एवं प्रमाणित संचार',
    channelDesc: 'रिसाइक्लर और ई-कचरा संग्रहकर्ता के बीच सीधा संपर्क। दर तय करें, स्थान साझा करें और डिजिटल रसीद प्राप्त करें।',
    sayHello: '👋 नमस्ते कहें',
    inputPlaceholder: 'संदेश लिखें, दर तय करें या पिकअप की पुष्टि करें...',
    send: 'संदेश भेजें',
    newMessages: 'नए संदेश ↓',
    attachedLot: 'संलग्न लॉट',
    weight: 'वजन',
    benchmarkRate: 'दर',
    realtimeComm: 'सजीव संवाद',
    gpsSharedMsg: 'वर्तमान संग्रह जीपीएस स्थान साझा किया गया',
    counterOfferPrefix: '💰 प्रस्तावित दर:'
  },
  mr: {
    switchContact: 'संपर्क बदला',
    directory: 'संपर्क यादी',
    clickToSwitch: 'बदलण्यासाठी क्लिक करा',
    minimize: 'फ्लोटिंग बटण स्वरूपात लहान करा',
    floating: 'फ्लोटिंग विंडो करा',
    drawer: 'बाजूच्या ड्रॉवरमध्ये उघडा',
    fullscreen: 'पूर्ण स्क्रीनमध्ये उघडा',
    close: 'चॅट विंडो बंद करा',
    proposeRate: 'दर सुचवा',
    proposePerKgRate: 'प्रति किलो दर सुचवा:',
    sendOffer: 'दर पाठवा',
    shareGps: 'थेट GPS पाठवा',
    quickReplies: 'जलद उत्तरे',
    industryTemplatesTitle: 'एक-क्लिक उपयुक्त संदेश',
    templates: [
      'आम्ही हा लॉट सध्याच्या दराने स्वीकारू शकतो.',
      'कृपया दुपारी ३ वाजेपर्यंत वजन काट्यावर आणा.',
      'संकलनासाठी वाहन पाठवले गेले आहे.',
      'वजन पडताळणी पूर्ण झाली. थेट UPI पेमेंट सुरू करत आहोत.',
      'कृपया PCB बोर्डचा स्वच्छ फोटो पाठवा.',
      'चांगल्या दरासाठी किमान ५० किलो गोळा करू शकता का?'
    ],
    channelTitle: 'सुरक्षित व कायदेशीर चॅनेल',
    channelDesc: 'रिसायकलिंग केंद्र आणि संकलनकर्ता यांच्यातील थेट संवाद. दर वाटाघाटी करा, स्थान शेअर करा आणि डिजिटल वजन पावती मिळवा.',
    sayHello: '👋 नमस्कार पाठवा',
    inputPlaceholder: 'संदेश लिहा, दर सुचवा किंवा पिकअप निश्चित करा...',
    send: 'संदेश पाठवा',
    newMessages: 'नवीन संदेश ↓',
    attachedLot: 'जोडलेला लॉट',
    weight: 'वजन',
    benchmarkRate: 'दर',
    realtimeComm: 'थेट संपर्क',
    gpsSharedMsg: 'सध्याचे संकलन GPS स्थान शेअर केले',
    counterOfferPrefix: '💰 सुचवलेला प्रति किलो दर:'
  },
  ta: {
    switchContact: 'தொடர்பை மாற்றவும்',
    directory: 'முகவரிப் புத்தகம்',
    clickToSwitch: 'மாற்ற கிளிக் செய்க',
    minimize: 'மிதக்கும் பொத்தானாக சுருக்குக',
    floating: 'மிதக்கும் சாளரமாக மாற்று',
    drawer: 'பக்கவாட்டு இழுப்பறையாக திற',
    fullscreen: 'முழுத்திரையாக விரிவாக்கு',
    close: 'சாளரத்தை மூடு',
    proposeRate: 'விலையை முன்மொழியுங்கள்',
    proposePerKgRate: 'கிலோவிற்கான விலையை முன்மொழியுங்கள்:',
    sendOffer: 'சலுகையை அனுப்பு',
    shareGps: 'ஜிபிஎஸ் இருப்பிடத்தைப் பகிரவும்',
    quickReplies: 'விரைவான பதில்கள்',
    industryTemplatesTitle: 'ஒரு-கிளிக் தொழில்துறை வார்ப்புருக்கள்',
    templates: [
      'தற்போதைய விலையில் இந்த பொருளை நாங்கள் ஏற்றுக்கொள்கிறோம்.',
      'தயவுசெய்து மதியம் 3 மணிக்குள் எடை மேடைக்கு கொண்டு வாருங்கள்.',
      'சேகரிப்பு வாகனம் அனுப்பப்பட்டுள்ளது.',
      'எடை சரிபார்க்கப்பட்டது. உடனடி யுபிஐ பரிமாற்றம் தொடங்கப்படுகிறது.',
      'தயவுசெய்து சர்க்யூட் பலகைகளின் தெளிவான புகைப்படத்தைப் பதிவேற்றவும்.',
      'சிறந்த விலைக்கு குறைந்தது 50 கிலோவை திரட்ட முடியுமா?'
    ],
    channelTitle: 'பாதுகாப்பான மற்றும் சான்றளிக்கப்பட்ட தகவல் தொடர்பு',
    channelDesc: 'மறுசுழற்சியாளர் மற்றும் சேகரிப்பாளருக்கு இடையே நேரடி தொடர்பு. விலை நிர்ணயம் செய்யவும், இருப்பிடத்தைப் பகிரவும் மற்றும் ரசீதுகளை உறுதிப்படுத்தவும்.',
    sayHello: '👋 வணக்கம் சொல்லுங்கள்',
    inputPlaceholder: 'செய்தியை உள்ளிடவும், விலை நிர்ணயிக்கவும் அல்லது பிக்கப்பை உறுதிப்படுத்தவும்...',
    send: 'செய்தி அனுப்புக',
    newMessages: 'புதிய செய்திகள் ↓',
    attachedLot: 'இணைக்கப்பட்ட பொருள்',
    weight: 'எடை',
    benchmarkRate: 'விலை',
    realtimeComm: 'நிகழ்நேர தொடர்பு',
    gpsSharedMsg: 'தற்போதைய ஜிபிஎஸ் இருப்பிடம் பகிரப்பட்டது',
    counterOfferPrefix: '💰 முன்மொழியப்பட்ட விலை:'
  }
};

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUser,
  lot,
  lang = 'en',
  onSelectTarget
}) => {
  const tChat = CHAT_TEXTS[lang] || CHAT_TEXTS.en;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [offerRateInput, setOfferRateInput] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [windowMode, setWindowMode] = useState<WindowMode>(() => {
    return (localStorage.getItem('kc_chat_window_mode') as WindowMode) || 'drawer';
  });
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<ChatTarget[]>([]);
  const [allLots, setAllLots] = useState<Transaction[]>([]);
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false);
  const [soundActive, setSoundActive] = useState(() => isAudioFeedbackEnabled());

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);
  const isNearBottomRef = useRef(true);
  const justSentRef = useRef(false);

  const lotRefId = lot?.lot_reference_id;

  const isHouseholdChat = currentUser.role === 'household' || targetUser.role === 'household';

  const householdTemplates: string[] = [
    'Hello! I have household electronic scrap (old appliances, phones, cables) ready for doorstep pickup.',
    'Can you come today with a calibrated digital weighing scale?',
    'What is your offered per-kg rate for mixed electronic and appliance scrap?',
    'I have confirmed my doorstep address. Please let me know when you arrive.',
    'Will you provide instant digital UPI or cash payment upon weighment?'
  ];

  const activeTemplates = isHouseholdChat ? householdTemplates : tChat.templates;

  const dynamicChannelTitle = isHouseholdChat
    ? (lang === 'hi' ? 'घरेलू नागरिक एवं कबाड़ीवाला चैट' : lang === 'mr' ? 'घरगुती नागरिक व कबाडीवाला थेट चर्चा' : lang === 'ta' ? 'குடியிருப்பு & கபாடிவாலா நேரடி அரட்டை' : 'Household Citizen ↔ Kabadiwala Direct Chat')
    : tChat.channelTitle;

  const dynamicChannelDesc = isHouseholdChat
    ? (lang === 'hi' ? 'घर बैठे कबाड़ उठाने, भाव तय करने और समय तय करने हेतु सीधा संपर्क।' : lang === 'mr' ? 'घरपोच भंगार पिकअप, दर वाटाघाटी व थेट संवादासाठी सुरक्षित चॅनेल.' : lang === 'ta' ? 'வீட்டு வாசலில் கழிவு சேகரிக்க, விலை பேச மற்றும் நேரம் உறுதி செய்ய நேரடி தொடர்பு.' : 'Direct doorstep communication between Citizen and Verified Scrap Collector (Kabadiwala). Ask scrap rates, schedule doorstep pickup, and confirm payment.')
    : tChat.channelDesc;

  // Sync with global audio feedback state
  useEffect(() => {
    return subscribeAudioFeedback((enabled) => setSoundActive(enabled));
  }, []);

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

  // Persist window mode preference
  const updateWindowMode = (mode: WindowMode) => {
    setWindowMode(mode);
    localStorage.setItem('kc_chat_window_mode', mode);
  };

  // Fetch available contacts (scrappers, recyclers) and lots
  useEffect(() => {
    if (!isOpen) return;

    const fetchContacts = async () => {
      try {
        const [users, txs] = await Promise.all([
          api.getUsers(),
          api.getTransactions()
        ]);

        setAllLots(txs);

        // Filter contacts based on user role
        const filtered = users
          .filter(u => {
            if (u.id === currentUser.id) return false;
            if (currentUser.role === 'household') {
              // Household only connects to scrappers
              return u.role === 'scrapper';
            }
            if (currentUser.role === 'scrapper') {
              // Scrapper connects to recyclers and households
              return u.role === 'recycler' || u.role === 'household';
            }
            return true;
          })
          .map(u => ({
            id: u.id,
            name: u.name,
            role: u.role,
            phone: u.phone,
            location: u.location
          }));

        setAvailableContacts(filtered);
      } catch (err) {
        console.warn('Failed to fetch contact directory:', err);
      }
    };

    fetchContacts();
  }, [isOpen, currentUser.id]);

  const loadMessages = async () => {
    try {
      const data = await api.getChats({
        lot_reference_id: lotRefId || undefined,
        user_id: currentUser.id,
        other_user_id: targetUser.id
      });

      setMessages((prev) => {
        if (
          prev.length === data.length &&
          prev.length > 0 &&
          prev[prev.length - 1]?.id === data[data.length - 1]?.id
        ) {
          return prev;
        }

        if (prev.length > 0 && data.length > prev.length) {
          // Play subtle audio ping if incoming message is from the other party
          const incomingNew = data.slice(prev.length).some(m => m.sender_id !== currentUser.id);
          if (incomingNew) {
            playChatMessageSound();
          }

          if (!isNearBottomRef.current) {
            setHasUnreadBelow(true);
          }
        }

        return data;
      });
    } catch (err) {
      console.warn('Failed to load chats:', err);
    }
  };

  // Helper for quick testing of the audio feedback & live reply flow
  const handleSimulatePartnerMessage = async () => {
    try {
      const sampleReplies = isHouseholdChat
        ? [
            'Namaste! I am in your neighborhood and can arrive at your doorstep in 30 minutes with a calibrated digital scale.',
            'Confirmed! I collect old home appliances, broken computers, wires, and scrap. Instant UPI payment on-site.',
            'I have noted your doorstep address. Dispatched our electric collection cart.',
            'Weighment verified. Thank you for responsibly giving your e-waste for circular recycling!',
            'Fair CPCB rate locked. We are on our way to your location.'
          ]
        : [
            'Confirmed, certified weighment scale is active at our gate.',
            'We can offer doorstep pickup in 45 minutes with verified electronic scales.',
            'Please bring the lot manifest for instant EPR green token crediting.',
            'Benchmark market rate accepted! Dispatched collection truck.',
            'Lot weight verified on our platform. Preparing digital escrow payout.'
          ];
      const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

      await api.sendChatMessage({
        lot_reference_id: lotRefId,
        sender_id: targetUser.id,
        sender_name: targetUser.name,
        sender_role: targetUser.role,
        receiver_id: currentUser.id,
        message: randomReply
      });

      await loadMessages();
    } catch (err) {
      console.warn('Failed to simulate partner reply:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, lotRefId, targetUser.id]);

  useEffect(() => {
    if (isOpen && windowMode !== 'minimized') {
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
    }
  }, [messages, windowMode, isOpen]);

  useEffect(() => {
    isFirstLoadRef.current = true;
    setHasUnreadBelow(false);
  }, [targetUser.id, lotRefId]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string, metadata?: any) => {
    const text = customText || inputText;
    if (!text.trim()) return;

    setLoading(true);
    justSentRef.current = true;
    try {
      const newMsg = await api.sendChatMessage({
        lot_reference_id: lotRefId,
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        sender_role: currentUser.role,
        receiver_id: targetUser.id,
        message: text,
        metadata
      });
      setMessages(prev => [...prev, newMsg]);
      if (!customText) setInputText('');
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendLotRef = () => {
    if (!lot) return;
    handleSend(
      `[Digital Lot Attached] Lot ${lot.lot_reference_id}: ${lot.category}, ${lot.estimated_weight} kg. Base requested rate: ₹${lot.offered_rate_per_kg}/kg.`,
      {
        type: 'lot_ref',
        data: {
          lot_id: lot.lot_reference_id,
          category: lot.category,
          weight: lot.estimated_weight,
          rate: lot.offered_rate_per_kg
        }
      }
    );
  };

  const handleSendCoords = () => {
    const lat = lot?.collection_gps?.latitude || 13.0310;
    const lon = lot?.collection_gps?.longitude || 77.5205;
    const addr = lot?.collection_gps?.address || 'Collection Point, Verified Hub';
    handleSend(`[GPS Coordinates] Live Location shared: ${addr} (${lat.toFixed(4)}, ${lon.toFixed(4)})`, {
      type: 'gps_coords',
      data: { latitude: lat, longitude: lon, address: addr }
    });
  };

  const handleSendPickupTime = (timeSlot: string) => {
    handleSend(`[Collection Schedule] Requesting doorstep collection window: ${timeSlot}`, {
      type: 'pickup_time',
      data: { slot: timeSlot }
    });
  };

  const handleSendCounterOffer = () => {
    if (!offerRateInput) return;
    handleSend(`[Price Negotiation] Counter-offering revised rate: ₹${offerRateInput} per kg.`, {
      type: 'rate_offer',
      data: { proposed_rate: Number(offerRateInput) }
    });
    setOfferRateInput('');
    setShowOfferModal(false);
  };

  // Switch to another contact
  const handleSwitchContact = (newTarget: ChatTarget) => {
    if (onSelectTarget) {
      // Check if there's a lot with this target
      const targetLot = allLots.find(t => t.scrapper_id === newTarget.id || t.recycler_id === newTarget.id);
      onSelectTarget(newTarget, targetLot || null);
    }
    setShowContactPicker(false);
  };

  // MINIMIZED MODE: Persistent Floating Dock Pill
  if (windowMode === 'minimized') {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <button
          type="button"
          id="chat-minimized-pill"
          onClick={() => updateWindowMode('floating')}
          className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 text-white rounded-full shadow-2xl border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border border-white/20">
              {targetUser.name.charAt(0)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100">{targetUser.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                {targetUser.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {messages.length > 0 ? `${messages.length} messages • Click to expand` : 'Direct Channel Active'}
            </p>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors ml-1"
              title="Close chat"
            >
              ✕
            </span>
          </div>
        </button>
      </div>
    );
  }

  // CONTAINER STYLES ACCORDING TO WINDOW MODE
  const containerClasses =
    windowMode === 'fullscreen'
      ? 'fixed inset-4 sm:inset-8 z-50 bg-white rounded-2xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200'
      : windowMode === 'floating'
      ? 'fixed bottom-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl flex flex-col shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200'
      : /* drawer mode */
        'fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200';

  const backdrop = windowMode === 'drawer' || windowMode === 'fullscreen';

  return (
    <>
      {/* Dimmed backdrop only for drawer or fullscreen */}
      {backdrop && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in"
        />
      )}

      <div className={containerClasses}>
        {/* HEADER BAR */}
        <div className="p-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          {/* Target Profile with Contact Switcher */}
          <div className="relative flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white/20">
                {targetUser.name.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">{targetUser.name}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                  {targetUser.role}
                </span>
              </div>

              {/* Contact Switcher Dropdown Toggle */}
              {availableContacts.length > 0 && onSelectTarget ? (
                <button
                  type="button"
                  id="chat-switch-contact-btn"
                  onClick={() => setShowContactPicker(!showContactPicker)}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer"
                >
                  <Users className="w-3 h-3" />
                  <span>{tChat.switchContact} ({availableContacts.length})</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showContactPicker ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <p className="text-[11px] text-slate-400 truncate">
                  {lot ? `${tChat.attachedLot} ${lot.lot_reference_id} • ₹${lot.offered_rate_per_kg}/kg` : tChat.realtimeComm}
                </p>
              )}
            </div>

            {/* Contact Switcher Popover */}
            {showContactPicker && (
              <div className="absolute top-12 left-0 z-50 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 space-y-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>{tChat.directory} ({availableContacts.length})</span>
                  <span className="text-emerald-600">{tChat.clickToSwitch}</span>
                </div>
                {availableContacts.map(c => {
                  const isCurrent = c.id === targetUser.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSwitchContact(c)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-500 capitalize">{c.role} {c.location ? `• ${c.location}` : ''}</div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Window Mode Controls & Audio Feedback (Flexibility Features) */}
          <div className="flex items-center gap-1 text-slate-300">
            {/* Audio Feedback Toggle */}
            <button
              type="button"
              id="chat-sound-toggle-btn"
              onClick={() => {
                const next = toggleAudioFeedback();
                setSoundActive(next);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                soundActive ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
              }`}
              title={soundActive ? 'Audio Feedback Active (Click to mute)' : 'Audio Feedback Muted (Click to unmute)'}
            >
              {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Minimize to Floating Dock */}
            <button
              type="button"
              id="chat-mode-minimize"
              onClick={() => updateWindowMode('minimized')}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title={tChat.minimize}
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Floating Compact Window */}
            {windowMode !== 'floating' && (
              <button
                type="button"
                id="chat-mode-floating"
                onClick={() => updateWindowMode('floating')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title={tChat.floating}
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Side Drawer */}
            {windowMode !== 'drawer' && (
              <button
                type="button"
                id="chat-mode-drawer"
                onClick={() => updateWindowMode('drawer')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title={tChat.drawer}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Fullscreen */}
            {windowMode !== 'fullscreen' && (
              <button
                type="button"
                id="chat-mode-fullscreen"
                onClick={() => updateWindowMode('fullscreen')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title={tChat.fullscreen}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              id="chat-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-red-900/40 hover:text-red-300 transition-colors cursor-pointer ml-1"
              title={tChat.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LOT QUICK CONTEXT BANNER */}
        {lot && (
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">{lot.category}</span>
                <span className="text-slate-600 ml-1.5 font-mono">({lot.estimated_weight} kg)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-700 font-extrabold">₹{lot.offered_rate_per_kg}/kg</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-800 border border-amber-300">
                {lot.status}
              </span>
            </div>
          </div>
        )}

        {/* QUICK ACTION NEGOTIATION CHIPS */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {lot && (
            <button
              type="button"
              onClick={handleSendLotRef}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Package className="w-3 h-3 text-emerald-600" />
              <span>{tChat.attachedLot} #{lot.lot_reference_id}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowOfferModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <DollarSign className="w-3 h-3 text-emerald-600" />
            <span>{tChat.proposeRate}</span>
          </button>

          <button
            type="button"
            onClick={handleSendCoords}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>{tChat.shareGps}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuickTemplates(!showQuickTemplates)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{tChat.quickReplies}</span>
          </button>
        </div>

        {/* QUICK REPLY TEMPLATES ACCORDION */}
        {showQuickTemplates && (
          <div className="p-3 bg-emerald-50/70 border-b border-emerald-200 text-xs space-y-1.5 animate-in fade-in duration-150 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
              {tChat.industryTemplatesTitle}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {tChat.templates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSend(template);
                    setShowQuickTemplates(false);
                  }}
                  className="text-left px-2.5 py-1.5 rounded bg-white hover:bg-emerald-100 border border-emerald-200 text-[11px] text-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* COUNTER OFFER MODAL */}
        {showOfferModal && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs flex items-center justify-between gap-2 shrink-0">
            <span className="text-emerald-900 font-bold">{tChat.proposePerKgRate}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-bold">₹</span>
              <input
                type="number"
                placeholder="360"
                value={offerRateInput}
                onChange={(e) => setOfferRateInput(e.target.value)}
                className="w-24 bg-white border border-emerald-300 rounded px-2.5 py-1 text-slate-900 font-mono text-xs font-bold focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSendCounterOffer}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs cursor-pointer"
              >
                {tChat.sendOffer}
              </button>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-slate-700 px-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES LIST */}
        <div
          ref={messagesContainerRef}
          onScroll={handleContainerScroll}
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50 relative"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mb-2" />
              <p className="text-sm font-bold text-slate-800">{tChat.channelTitle}</p>
              <p className="text-xs mt-1 max-w-xs text-slate-500 leading-relaxed">
                {tChat.channelDesc}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => handleSend(lang === 'hi' ? 'नमस्ते! हम आपके लॉट की समीक्षा कर रहे हैं।' : lang === 'mr' ? 'नमस्कार! आम्ही तुमच्या ई-कचरा लॉटची पाहणी करत आहोत.' : lang === 'ta' ? 'வணக்கம்! உங்கள் பொருளை நாங்கள் மதிப்பாய்வு செய்கிறோம்.' : 'Hello! We are reviewing your collection lot.')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  {tChat.sayHello}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(true)}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  💰 {tChat.proposeRate}
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;
              const hasLotMeta = msg.metadata?.type === 'lot_ref';
              const hasGpsMeta = msg.metadata?.type === 'gps_coords';
              const hasOfferMeta = msg.metadata?.type === 'rate_offer';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                    <span className="font-semibold text-slate-600">{msg.sender_name}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                      isMine
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200'
                    }`}
                  >
                    {/* Metadata Card Visual Styling */}
                    {hasLotMeta && (
                      <div className={`mb-1.5 p-2 rounded-lg border text-[11px] ${isMine ? 'bg-white/10 border-white/20 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'}`}>
                        <span className="font-bold flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-emerald-500" /> Lot Reference Attached
                        </span>
                      </div>
                    )}
                    {hasGpsMeta && (
                      <div className={`mb-1.5 p-2 rounded-lg border text-[11px] ${isMine ? 'bg-white/10 border-white/20 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900 font-medium'}`}>
                        <span className="font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" /> GPS Location Pinned
                        </span>
                      </div>
                    )}
                    {hasOfferMeta && (
                      <div className={`mb-1.5 p-2 rounded-lg border text-[11px] ${isMine ? 'bg-white/10 border-white/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900 font-bold'}`}>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Negotiated Price Proposal: ₹{msg.metadata.data?.proposed_rate}/kg
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Scroll-to-Bottom / New Messages Pill */}
        {hasUnreadBelow && (
          <div className="absolute bottom-20 right-6 z-20 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => scrollToBottom('smooth')}
              className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span>{tChat.newMessages}</span>
            </button>
          </div>
        )}

        {/* INPUT BAR */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                id="chat-test-audio-ping-btn"
                onClick={handleSimulatePartnerMessage}
                className="text-[10px] text-slate-600 hover:text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 font-medium cursor-pointer shrink-0"
                title="Simulates an incoming message from the other party to test the soft audio notification chime"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Simulate Incoming Message</span>
              </button>
              <button
                type="button"
                onClick={() => playChatMessageSound()}
                className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 font-medium cursor-pointer shrink-0"
                title="Play chat message notification sound"
              >
                <Volume2 className="w-3 h-3 text-slate-500" />
                <span>Test Sound</span>
              </button>
            </div>
            {lot && (
              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                className="text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full transition-colors font-bold cursor-pointer shrink-0"
              >
                💰 Propose Rate
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="chat-message-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={tChat.inputPlaceholder}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              id="chat-send-btn"
              disabled={loading || !inputText.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all cursor-pointer disabled:opacity-40 shadow-xs active:scale-95 shrink-0"
              title={tChat.send}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
