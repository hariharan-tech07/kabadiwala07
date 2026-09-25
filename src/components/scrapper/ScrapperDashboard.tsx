import React, { useState, useEffect, useRef } from 'react';
import { User, Material, RecyclerFacility, Transaction, VernacularLang, AIPredictionResult, Complaint } from '../../types';
import { translations } from '../../translations';
import { api } from '../../api/client';
import { calculateHaversineDistance, detectBrowserLocation, PRESET_HUBS } from '../../utils/geo';
import { OpenStreetMap } from '../common/OpenStreetMap';
import { DigitalReceiptModal } from '../common/DigitalReceiptModal';
import { AadhaarKYCModal } from '../common/AadhaarKYCModal';
import { ComplaintModal } from '../common/ComplaintModal';
import { SafetyGuidanceModal } from '../common/SafetyGuidanceModal';
import { notifyUser } from '../common/NotificationToast';
import { generateScrapperMonthlyStatement } from '../../utils/pdfGenerator';
import { offlineQueue, QueuedLot } from '../../utils/offlineQueue';
import {
  Camera, Upload, Sparkles, Scale, IndianRupee, MapPin, CheckCircle2,
  Phone, MessageSquare, Volume2, VolumeX, ShieldAlert, ArrowRight,
  TrendingUp, RefreshCw, AlertTriangle, FileCheck, Compass, Map,
  Loader2, Headphones, Radio, Search, FileText, QrCode, ExternalLink,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowUpRight, WifiOff, Download, ShieldCheck, Split,
  Check, X, Smartphone
} from 'lucide-react';
import { AndroidAppModal } from '../common/AndroidAppModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { vernacularAudio } from '../../utils/audioPlayer';
import { SafetyGuidanceModule } from './SafetyGuidanceModule';
import { ImageCaptureWeightModule } from './ImageCaptureWeightModule';
import { MapModule } from './MapModule';
import { ScrapperChatModule } from './ScrapperChatModule';
import { BroadcastedLotsModule } from './BroadcastedLotsModule';
import { BenchmarkRatesModule } from './BenchmarkRatesModule';
import { ScrapperComplaintsModule } from './ScrapperComplaintsModule';
import pcbImg from '../../assets/images/pcb_scrap_batch_1789436553690.jpg';

export type ScrapperMenuTab = 
  | 'safety'
  | 'capture'
  | 'map'
  | 'chat'
  | 'lots'
  | 'rates'
  | 'complaints';

interface ScrapperDashboardProps {
  user: User;
  lang: VernacularLang;
  onOpenChat: (recycler: { id: string; name: string; role: string; phone?: string }, lot?: Transaction) => void;
  activeMenuTab?: ScrapperMenuTab;
  onSelectMenuTab?: (tab: ScrapperMenuTab) => void;
}

export const ScrapperDashboard: React.FC<ScrapperDashboardProps> = ({
  user,
  lang,
  onOpenChat,
  activeMenuTab: controlledMenuTab,
  onSelectMenuTab
}) => {
  const t = translations[lang] || translations.en;

  // Active Menu Bar Tab (supports controlled or local fallback)
  const [internalMenuTab, setInternalMenuTab] = useState<ScrapperMenuTab>('safety');
  const activeMenuTab = controlledMenuTab ?? internalMenuTab;
  const setActiveMenuTab = (tab: ScrapperMenuTab) => {
    setInternalMenuTab(tab);
    onSelectMenuTab?.(tab);
  };
  const [chatTargetRecycler, setChatTargetRecycler] = useState<{ id: string; name: string; role: string; phone?: string } | null>(null);
  const [chatLot, setChatLot] = useState<Transaction | null>(null);

  // Materials & Base Rates
  const [materials, setMaterials] = useState<Material[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('PCB (Printed Circuit Boards)');
  const [weightKg, setWeightKg] = useState<string>('25');

  // Rate Board Filters
  const [rateSearchQuery, setRateSearchQuery] = useState<string>('');
  const [rateCategoryFilter, setRateCategoryFilter] = useState<string>('ALL');

  // Digital Handover / Gate Pass Voucher Modal
  const [receiptLot, setReceiptLot] = useState<Transaction | null>(null);

  // Image & AI Prediction state
  const [imagePreview, setImagePreview] = useState<string>(pcbImg);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIPredictionResult | null>({
    category: 'PCB (Printed Circuit Boards)',
    confidence: 96.4,
    estimated_rate_per_kg_min: 323,
    estimated_rate_per_kg_max: 380,
    total_min_price: 8075,
    total_max_price: 9500,
    recommended_safety_protocol: 'Prohibit open acid leaching for precious metal extraction.',
    subcategories_detected: ['Multilayer Telecom Motherboards', 'Gold Plated Edge Pins', 'IC Chips'],
    source: 'yolo_mock_pipeline',
    detected_boxes: [
      { x: 20, y: 25, width: 40, height: 35, label: 'BGA_CHIP_ARRAY', confidence: 96.4 },
      { x: 50, y: 40, width: 35, height: 30, label: 'GOLD_FINGERS', confidence: 94.1 }
    ]
  });

  // Geolocation & Recyclers
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number; label: string }>({
    latitude: 13.0310,
    longitude: 77.5205,
    label: 'Peenya Hub, Bengaluru'
  });
  const [isLocating, setIsLocating] = useState(false);
  const [recyclers, setRecyclers] = useState<RecyclerFacility[]>([]);
  const [myLots, setMyLots] = useState<Transaction[]>([]);
  const [activeCreatedLot, setActiveCreatedLot] = useState<Transaction | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [recyclerDisplayMode, setRecyclerDisplayMode] = useState<'map' | 'cards' | 'both'>('both');

  // Android PWA installation state
  const { isInstalled, isInstallable, install } = usePWAInstall();

  // Audio Speech state with high-fidelity vernacular stream
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

  // New Modals & Offline Queue state
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintTargetLot, setComplaintTargetLot] = useState<Transaction | null>(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [safetyCategory, setSafetyCategory] = useState<string>('PCB (Printed Circuit Boards)');
  const [queuedLots, setQueuedLots] = useState<QueuedLot[]>([]);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);

  useEffect(() => {
    loadData();
    refreshLocation();
    setQueuedLots(offlineQueue.getQueue());

    // Offline queue event listener
    const handleOnline = async () => {
      if (offlineQueue.getQueue().length > 0) {
        setIsSyncingQueue(true);
        const res = await offlineQueue.syncAll();
        setIsSyncingQueue(false);
        setQueuedLots(offlineQueue.getQueue());
        if (res.synced > 0) {
          setSuccessToast(`Online restored: Synced ${res.synced} offline scrap lots to CPCB network!`);
          loadData();
        }
      }
    };
    window.addEventListener('online', handleOnline);

    // Subscribe to vernacular audio controller updates
    const unsubscribe = vernacularAudio.subscribe((id, isPlaying, isLoading) => {
      setPlayingAudioId(id);
      setIsAudioLoading(isLoading);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      unsubscribe();
      vernacularAudio.stop();
    };
  }, []);

  const loadData = async () => {
    try {
      const [mats, recs, txs, cmps] = await Promise.all([
        api.getMaterials(),
        api.getRecyclers(),
        api.getTransactions({ scrapper_id: user.id }),
        api.getComplaints()
      ]);
      setMaterials(mats);
      setRecyclers(recs);
      setMyLots(txs);
      setComplaints(cmps || []);
    } catch (err) {
      console.error('Error loading scrapper dashboard data:', err);
    }
  };

  const refreshLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await detectBrowserLocation();
      setCurrentCoords({
        latitude: loc.latitude,
        longitude: loc.longitude,
        label: loc.source === 'gps' ? 'Live Browser GPS' : 'Peenya Industrial Zone'
      });
    } finally {
      setIsLocating(false);
    }
  };

  // Image Upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      runAiPipeline(base64, file.name, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSample = (categoryName: string, sampleUrl: string) => {
    setSelectedCategory(categoryName);
    setImagePreview(sampleUrl);
    runAiPipeline(sampleUrl, categoryName, 'image/jpeg');
  };

  const runAiPipeline = async (
    imageBase64: string,
    fileName: string,
    mimeType: string,
    categoryHint?: string
  ) => {
    setIsAnalyzing(true);
    setSuccessToast(null);

    const weightVal = parseFloat(weightKg) || 10;
    try {
      const result = await api.predictMaterial({
        imageBase64,
        imageMimeType: mimeType,
        fileName,
        weightKg: weightVal,
        categoryHint
      });
      setAiResult(result);
      const predictedCategory = result.category || selectedCategory;
      if (result.category) {
        setSelectedCategory(result.category);
      }

      // Mandatory user requirement: Immediately pop up safety guidance with voice assist tailored specifically to the predicted category
      setSafetyCategory(predictedCategory);
      setIsSafetyModalOpen(true);
    } catch (err) {
      console.warn('AI pipeline error, calculating via local base rates:', err);
      // Heuristic fallback
      const matched = materials.find(m => m.category === selectedCategory) || materials[0];
      const rate = matched?.base_rate_per_kg || 300;
      const predictedCategory = matched?.category || selectedCategory;
      setAiResult({
        category: predictedCategory,
        confidence: 94.5,
        estimated_rate_per_kg_min: Math.round(rate * 0.95),
        estimated_rate_per_kg_max: Math.round(rate * 1.12),
        total_min_price: Math.round(weightVal * rate * 0.95),
        total_max_price: Math.round(weightVal * rate * 1.12),
        recommended_safety_protocol: 'Wear safety gloves and avoid open flame burning.',
        subcategories_detected: ['Standard Electronic Scrap Lot'],
        source: 'yolo_mock_pipeline'
      });
      setSafetyCategory(predictedCategory);
      setIsSafetyModalOpen(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecalculate = () => {
    const weightVal = parseFloat(weightKg) || 1;
    const currentMat = materials.find(m => m.category === selectedCategory);
    const baseRate = currentMat?.base_rate_per_kg || 320;
    const minRate = Math.round(baseRate * 0.95);
    const maxRate = Math.round(baseRate * 1.12);

    setAiResult(prev => ({
      category: selectedCategory,
      confidence: prev?.confidence || 95.0,
      estimated_rate_per_kg_min: minRate,
      estimated_rate_per_kg_max: maxRate,
      total_min_price: Math.round(weightVal * minRate),
      total_max_price: Math.round(weightVal * maxRate),
      recommended_safety_protocol: currentMat?.description || 'Follow standard e-waste handling protocol.',
      subcategories_detected: prev?.subcategories_detected || [currentMat?.subcategory || 'Verified E-Waste'],
      source: prev?.source || 'yolo_mock_pipeline'
    }));
  };

  const handleBroadcastLot = async (confirmedWeight?: number) => {
    setIsBroadcasting(true);
    const weightVal = confirmedWeight !== undefined ? confirmedWeight : (parseFloat(weightKg) || 15);
    const currentMat = materials.find(m => m.category === selectedCategory);
    const baseRate = currentMat?.base_rate_per_kg || 320;

    // Check if offline - store in local offline queue
    if (!navigator.onLine) {
      const queued = offlineQueue.enqueueLot({
        scrapper_id: user.id,
        scrapper_name: user.name,
        recycler_id: 'rec-1',
        recycler_name: 'EcoRecycle Solutions Pvt Ltd',
        category: selectedCategory,
        estimated_weight: weightVal,
        declared_weight: weightVal,
        offered_rate_per_kg: baseRate,
        collection_gps: {
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
          address: `${user.location} (${currentCoords.label})`
        },
        payment_mode: 'UPI_DIGITAL',
        image_url: imagePreview,
        notes: `Offline Created: Fair estimate ₹${aiResult?.total_min_price} - ₹${aiResult?.total_max_price}`
      });
      setQueuedLots(offlineQueue.getQueue());
      setSuccessToast(`Stored offline (${queued.client_reference_id}). Will auto-sync when network returns!`);
      setIsBroadcasting(false);
      return;
    }

    try {
      const newTx = await api.createTransaction({
        scrapper_id: user.id,
        scrapper_name: user.name,
        recycler_id: 'rec-1',
        recycler_name: 'EcoRecycle Solutions Pvt Ltd',
        category: selectedCategory,
        estimated_weight: weightVal,
        declared_weight: weightVal,
        weight_confirmed_by_scrapper: true,
        offered_rate_per_kg: baseRate,
        collection_gps: {
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
          address: `${user.location} (${currentCoords.label})`
        },
        payment_mode: 'UPI_DIGITAL',
        image_url: imagePreview,
        notes: `AI Classified with ${(aiResult?.confidence || 95)}% confidence. Certified weighment locked at ${weightVal} kg.`
      });

      setActiveCreatedLot(newTx);
      setMyLots(prev => [newTx, ...prev]);
      setSuccessToast(`Lot ${newTx.lot_reference_id} broadcasted with confirmed weight ${weightVal} kg!`);
      setTimeout(() => setSuccessToast(null), 8000);

      notifyUser({
        title: lang === 'hi' ? 'लॉट सफलतापूर्वक प्रसारित' : lang === 'mr' ? 'लॉट यशस्वीरित्या प्रसारित' : lang === 'ta' ? 'லாட் ஒளிபரப்பப்பட்டது' : 'Lot Successfully Broadcasted',
        message: lang === 'hi' 
          ? `लॉट ${newTx.lot_reference_id} (${weightVal} किग्रा) पास के प्रमाणित रिसाइकलरों को भेजा गया।`
          : lang === 'mr'
          ? `लॉट ${newTx.lot_reference_id} (${weightVal} किलो) परिसरातील अधिकृत रिसायकलरांना पाठवला गेला आहे.`
          : lang === 'ta'
          ? `லாட் ${newTx.lot_reference_id} (${weightVal} கிலோ) அருகிலுள்ள அங்கீகரிக்கப்பட்ட மறுசுழற்சி மையங்களுக்கு ஒளிபரப்பப்பட்டது.`
          : `Lot ${newTx.lot_reference_id} (${weightVal} kg) broadcasted to nearby CPCB-authorized recyclers.`,
        type: 'status',
        lotId: newTx.id,
        lotReferenceId: newTx.lot_reference_id
      });
    } catch (err) {
      console.error('Failed to broadcast lot:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleNavigateToChat = (
    target?: { id: string; name: string; role: string; phone?: string },
    lot?: Transaction
  ) => {
    if (target) setChatTargetRecycler(target);
    if (lot) setChatLot(lot);
    setActiveMenuTab('chat');
  };

  const handleSyncOfflineQueue = async () => {
    setIsSyncingQueue(true);
    try {
      const res = await offlineQueue.syncAll();
      setQueuedLots(offlineQueue.getQueue());
      if (res.synced > 0) {
        setSuccessToast(`Synced ${res.synced} offline scrap lots to CPCB network!`);
        await loadData();
      } else {
        setSuccessToast(`All lots are currently synced.`);
      }
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
    } finally {
      setIsSyncingQueue(false);
    }
  };

  const handleAcceptScaleWeight = async (lot: Transaction) => {
    try {
      const updated = await api.confirmLotWeight(lot.id, true);
      setMyLots(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      setReceiptLot(updated);
      setSuccessToast(`Weight accepted! Lot ${updated.lot_reference_id} finalized with payout ₹${updated.final_payout}. Gate Pass generated.`);
      setTimeout(() => setSuccessToast(null), 7000);

      notifyUser({
        title: lang === 'hi' ? 'काटा वजन स्वीकृत व भुगतान संपन्न' : lang === 'mr' ? 'वजन मंजूर आणि व्यवहार पूर्ण' : lang === 'ta' ? 'எடை ஏற்றுக்கொள்ளப்பட்டது மற்றும் தீர்க்கப்பட்டது' : 'Weighment Approved & Settled',
        message: lang === 'hi'
          ? `लॉट ${updated.lot_reference_id} का अंतिम भुगतान ₹${updated.final_payout?.toLocaleString('en-IN')} स्वीकृत हुआ। डिजिटल गेट पास तैयार है।`
          : lang === 'mr'
          ? `लॉट ${updated.lot_reference_id} साठी ₹${updated.final_payout?.toLocaleString('en-IN')} ची रक्कम निश्चित झाली. गेट पास तयार आहे.`
          : lang === 'ta'
          ? `லாட் ${updated.lot_reference_id}-க்கு ₹${updated.final_payout?.toLocaleString('en-IN')} தொகை இறுதி செய்யப்பட்டு டிஜிட்டல் கேட் பாஸ் தயாரானது.`
          : `Lot ${updated.lot_reference_id} confirmed. Final payout of ₹${updated.final_payout?.toLocaleString('en-IN')} logged to ledger. Digital Gate Pass generated.`,
        type: 'payment',
        lotId: updated.id,
        lotReferenceId: updated.lot_reference_id
      });
    } catch (err) {
      console.error('Failed to confirm scale weight:', err);
    }
  };

  const handleDisputeScaleWeight = (lot: Transaction) => {
    setComplaintTargetLot(lot);
    setIsComplaintModalOpen(true);
  };

  const handleDownloadMonthlyPdf = () => {
    generateScrapperMonthlyStatement(user, myLots, 'March 2026');
  };

  const handleSplitGroupToLot = async (group: { category: string; estimated_weight_kg: number; subcategory?: string; estimated_rate_per_kg: number }) => {
    try {
      const newTx = await api.createTransaction({
        scrapper_id: user.id,
        scrapper_name: user.name,
        recycler_id: 'rec-1',
        recycler_name: 'EcoRecycle Solutions Pvt Ltd',
        category: group.category,
        estimated_weight: group.estimated_weight_kg,
        offered_rate_per_kg: group.estimated_rate_per_kg,
        collection_gps: {
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
          address: `${user.location} (${currentCoords.label})`
        },
        payment_mode: 'UPI_DIGITAL',
        image_url: imagePreview,
        notes: `Split group lot: ${group.subcategory || group.category}`
      });
      setMyLots(prev => [newTx, ...prev]);
      setSuccessToast(`Created separate digital lot ${newTx.lot_reference_id} for ${group.category} (${group.estimated_weight_kg} kg)!`);
    } catch (err) {
      console.error('Failed to create split group lot:', err);
    }
  };

  // Audio Safety Guidance Voice Narration (Authentic Vernacular TTS)
  const handleToggleAudio = (cardId: string, scriptText: string) => {
    if (playingAudioId === cardId) {
      vernacularAudio.stop();
    } else {
      vernacularAudio.play(cardId, scriptText, lang);
    }
  };

  // Sorted nearby recyclers by Haversine distance
  const sortedRecyclers = [...recyclers]
    .map(rec => {
      const dist = calculateHaversineDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        rec.latitude,
        rec.longitude
      );
      const categoryRate = rec.offered_rates_json?.[selectedCategory] || 0;
      return {
        ...rec,
        distanceKm: dist,
        offeredRate: categoryRate
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Filter materials for the benchmark daily rates board
  const filteredMaterials = materials.filter(m => {
    if (rateCategoryFilter !== 'ALL' && !m.category.toLowerCase().includes(rateCategoryFilter.toLowerCase())) {
      return false;
    }
    if (rateSearchQuery.trim()) {
      const q = rateSearchQuery.toLowerCase();
      return m.category.toLowerCase().includes(q) || (m.subcategory && m.subcategory.toLowerCase().includes(q));
    }
    return true;
  });

  const handleAnnounceRates = () => {
    const text = lang === 'ta'
      ? 'இன்றைய அதிகாரப்பூர்வ மறுசுழற்சி விலைகள்: மதர்போர்டு கிலோவுக்கு 340 ரூபாய், தாமிரக் கம்பி 620 ரூபாய், மடிக்கணினி பேட்டரி 180 ரூபாய், மின்சார மோட்டார்கள் 210 ரூபாய்.'
      : lang === 'hi'
      ? 'आज के सीपीसीबी अधिकृत ई-कचरा मूल्य: मदरबोर्ड 340 रुपये प्रति किलो, तांबा तार 620 रुपये प्रति किलो, बैटरी 180 रुपये प्रति किलो, मोटर 210 रुपये प्रति किलो।'
      : lang === 'mr'
      ? 'आजचे सीपीसीबी अधिकृत ई-कचरा भाव: मदरबोर्ड ₹३४० प्रति किलो, तांब्याची तार ₹६२० प्रति किलो, बॅटरी ₹१८० प्रति किलो, इलेक्ट्रिक मोटर ₹२१० प्रति किलो.'
      : 'Current CPCB benchmark recycling prices: Printed Circuit Boards 340 rupees per kg, Copper Wires 620 rupees per kg, Lithium Batteries 180 rupees per kg, Electric Motors 210 rupees per kg.';
    vernacularAudio.play('rates_audio', text, lang);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Android Application Master Identity Ribbon */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-emerald-700/60 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-emerald-300">
              <img src="/icon.svg" alt="App Icon" className="w-9 h-9 rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight">
                  Kabadiwala Connect — Android App
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 shadow-xs flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  <span>Android Edition (v1.2.0 WebAPK)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-100 mt-1 flex-wrap font-medium">
                <span className="inline-flex items-center gap-1 bg-emerald-800/80 px-2 py-0.5 rounded-md border border-emerald-600/40">
                  <Camera className="w-3 h-3 text-emerald-300" />
                  <span>Android Camera AI Scale</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-800/80 px-2 py-0.5 rounded-md border border-emerald-600/40">
                  <WifiOff className="w-3 h-3 text-amber-300" />
                  <span>Offline Local Queue</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-800/80 px-2 py-0.5 rounded-md border border-emerald-600/40">
                  <MapPin className="w-3 h-3 text-blue-300" />
                  <span>GPS Geolocation Radar</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-800/80 px-2 py-0.5 rounded-md border border-emerald-600/40">
                  <Volume2 className="w-3 h-3 text-teal-300" />
                  <span>Vernacular Audio TTS</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstalled ? (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-700/80 text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-500 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Running in Android App</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAndroidModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 active:scale-95 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Add shortcut to Android home screen or install APK"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Install to Home Screen / APK</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Banner & Vernacular Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t.appTitle}
              </h1>
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer"
                title="View Government of India Aadhaar & CPCB Registration ID"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aadhaar Identity Card</span>
              </button>

              <button
                type="button"
                id="scrapper-open-complaints-btn"
                onClick={() => {
                  setActiveMenuTab('complaints');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                title="File formal complaint or view grievance status"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{t.grievanceDesk}</span>
                {complaints.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800">
                    {complaints.length}
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {t.appSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-700">
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                Collector: {user.name}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{user.location}</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Aadhaar-Linked: {user.phone}</span>
              </span>
            </div>
          </div>

          {/* Quick Hub Presets for testing */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> GPS Pin:
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentCoords(PRESET_HUBS.bengaluru);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                currentCoords.latitude === PRESET_HUBS.bengaluru.latitude
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Bengaluru
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentCoords(PRESET_HUBS.delhi);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                currentCoords.latitude === PRESET_HUBS.delhi.latitude
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Delhi NCR
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentCoords(PRESET_HUBS.chennai);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                currentCoords.latitude === PRESET_HUBS.chennai.latitude
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Chennai
            </button>
            <button
              type="button"
              onClick={refreshLocation}
              disabled={isLocating}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Refresh GPS location"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Offline Queue Notice Banner */}
      {queuedLots.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 text-amber-900 rounded-lg shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                {queuedLots.length} Scrap Lots Stored in Offline Cache
              </h4>
              <p className="text-[11px] text-amber-800">
                Created during disconnected field collection. Stored securely and ready for sync.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSyncOfflineQueue}
            disabled={isSyncingQueue}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isSyncingQueue ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing to Recyclers...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Sync {queuedLots.length} Offline Lots Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ACTIVE MODULE CONTAINER */}
      <div className="mt-4">
        {activeMenuTab === "safety" && (
          <SafetyGuidanceModule lang={lang} />
        )}

        {activeMenuTab === "capture" && (
          <ImageCaptureWeightModule
            materials={materials}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            weightKg={weightKg}
            onChangeWeight={(w) => setWeightKg(w)}
            imagePreview={imagePreview}
            onChangeImage={(base64, fileName, mimeType) => {
              setImagePreview(base64);
              runAiPipeline(base64, fileName, mimeType);
            }}
            onSelectPreset={(catName, sampleUrl) => handlePresetSample(catName, sampleUrl)}
            onReanalyze={() => {
              runAiPipeline(imagePreview, selectedCategory, 'image/jpeg');
            }}
            isAnalyzing={isAnalyzing}
            aiResult={aiResult}
            onBroadcastLot={async (confirmedWeight) => {
              await handleBroadcastLot(confirmedWeight);
            }}
            isBroadcasting={isBroadcasting}
            onNavigateToLots={() => setActiveMenuTab("lots")}
            onNavigateToChat={() => setActiveMenuTab("chat")}
            onOpenSafetyGuidance={() => {
              setSafetyCategory(aiResult?.category || selectedCategory);
              setIsSafetyModalOpen(true);
            }}
            lang={lang}
          />
        )}

        {activeMenuTab === "map" && (
          <MapModule
            user={user}
            currentCoords={currentCoords}
            isLocating={isLocating}
            onRefreshLocation={refreshLocation}
            recyclers={recyclers}
            selectedCategory={selectedCategory}
            onOpenChat={(rec) => handleNavigateToChat(rec)}
            lang={lang}
          />
        )}

        {activeMenuTab === "chat" && (
          <ScrapperChatModule
            currentUser={user}
            user={user}
            recyclers={recyclers}
            myLots={myLots}
            latestLot={chatLot || (myLots.length > 0 ? myLots[0] : null)}
            initialTargetRecycler={chatTargetRecycler}
            initialLot={chatLot}
            currentCoords={currentCoords}
            lang={lang}
          />
        )}

        {activeMenuTab === "lots" && (
          <BroadcastedLotsModule
            lots={myLots}
            user={user}
            lang={lang}
            onAcceptWeight={handleAcceptScaleWeight}
            onDisputeWeight={handleDisputeScaleWeight}
            onViewReceipt={(lot) => setReceiptLot(lot)}
            onOpenGatePass={(lot) => setReceiptLot(lot)}
            onOpenChat={(rec, lot) => handleNavigateToChat(rec, lot)}
            onDownloadMonthlyStatement={handleDownloadMonthlyPdf}
            onNavigateToCapture={() => setActiveMenuTab("capture")}
          />
        )}

        {activeMenuTab === "rates" && (
          <BenchmarkRatesModule
            materials={materials}
            lang={lang}
            onSelectCategoryForLot={(cat) => {
              setSelectedCategory(cat);
              setActiveMenuTab("capture");
            }}
          />
        )}

        {activeMenuTab === "complaints" && (
          <ScrapperComplaintsModule
            user={user}
            lang={lang}
            complaints={complaints}
            myLots={myLots}
            onOpenNewComplaintModal={(lot) => {
              setComplaintTargetLot(lot || null);
              setIsComplaintModalOpen(true);
            }}
            onViewLotReceipt={(lot) => setReceiptLot(lot)}
            onOpenChatWithRecycler={(rec) => {
              setChatTargetRecycler({ id: rec.id, name: rec.name, role: rec.role });
              setActiveMenuTab("chat");
            }}
          />
        )}
      </div>

      {/* Digital Handover Voucher / Gate Pass Modal */}
      <DigitalReceiptModal
        lot={receiptLot}
        lang={lang}
        onClose={() => setReceiptLot(null)}
      />

      {/* Aadhaar Identity KYC Modal */}
      <AadhaarKYCModal
        isOpen={isAadhaarModalOpen}
        lang={lang}
        onClose={() => setIsAadhaarModalOpen(false)}
        user={user}
      />

      {/* Grievance & Dispute Filing Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        lang={lang}
        onClose={() => {
          setIsComplaintModalOpen(false);
          setComplaintTargetLot(null);
        }}
        currentUser={user}
        lot={complaintTargetLot}
        onComplaintSubmitted={(newCmp) => {
          setComplaints(prev => [newCmp, ...prev]);
          setSuccessToast(lang === 'mr' ? 'तक्रार CPCB केंद्रीय नोंदवहीमध्ये नोंदवली गेली.' : 'Grievance registered with CPCB Central Docket.');
          setActiveMenuTab('complaints');
        }}
      />

      {/* Statutory Hazardous Material Safety Guidance Modal */}
      <SafetyGuidanceModal
        isOpen={isSafetyModalOpen}
        category={safetyCategory}
        lang={lang}
        onAcknowledge={() => setIsSafetyModalOpen(false)}
      />

      {/* Android Installation Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
};
