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
import { offlinePhotoDb, OfflinePhotoRecord } from '../../utils/offlinePhotoDb';
import {
  Camera, Upload, Sparkles, Scale, IndianRupee, MapPin, CheckCircle2,
  Phone, MessageSquare, Volume2, VolumeX, ShieldAlert, ArrowRight,
  TrendingUp, RefreshCw, AlertTriangle, FileCheck, Compass, Map,
  Loader2, Headphones, Radio, Search, FileText, QrCode, ExternalLink,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowUpRight, WifiOff, Download, ShieldCheck, Split,
  Check, X, Smartphone, Database, Wifi, Home, Truck
} from 'lucide-react';
import { AndroidAppModal } from '../common/AndroidAppModal';
import { OfflinePhotoVaultModal } from './OfflinePhotoVaultModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { vernacularAudio } from '../../utils/audioPlayer';
import { SafetyGuidanceModule } from './SafetyGuidanceModule';
import { ImageCaptureWeightModule } from './ImageCaptureWeightModule';
import { MapModule } from './MapModule';
import { ScrapperChatModule } from './ScrapperChatModule';
import { BroadcastedLotsModule } from './BroadcastedLotsModule';
import { BenchmarkRatesModule } from './BenchmarkRatesModule';
import { ScrapperComplaintsModule } from './ScrapperComplaintsModule';
import { HouseholdPickupsModule } from './HouseholdPickupsModule';
import { HouseholdPickupRequest } from '../../types';
import pcbImg from '../../assets/images/pcb_scrap_batch_1789436553690.jpg';

export type ScrapperMenuTab = 
  | 'safety'
  | 'capture'
  | 'map'
  | 'chat'
  | 'lots'
  | 'household_lots'
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
  const [householdPickups, setHouseholdPickups] = useState<HouseholdPickupRequest[]>([]);
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

  // Offline Photo Database & No-Network Handling state
  const [offlinePhotos, setOfflinePhotos] = useState<OfflinePhotoRecord[]>([]);
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);
  const [isOfflineVaultModalOpen, setIsOfflineVaultModalOpen] = useState(false);
  const [simulateNoNetwork, setSimulateNoNetwork] = useState(false);

  // CRITICAL REQUIREMENT: Recycler pickup trucks dispatch to the Main Hub of the scrapper, NOT their live roving GPS!
  const scrapperMainHub = {
    latitude: user.latitude || 13.0315,
    longitude: user.longitude || 77.5210,
    address: user.location?.includes('Hub') || user.location?.includes('Yard')
      ? user.location
      : `${user.location} — Peenya Aggregation Yard (Main Licensed Hub)`,
    hub_name: `${user.name.split('(')[0].trim()}'s Registered Main Hub`,
    is_main_hub: true
  };

  useEffect(() => {
    loadData();
    refreshLocation();
    setQueuedLots(offlineQueue.getQueue());

    // Load offline photos from separate database
    offlinePhotoDb.getAllPhotos().then(setOfflinePhotos).catch(console.warn);

    // Auto-predict offline photos & sync lots as soon as network is restored
    const handleOnline = async () => {
      // 1. Process pending offline photos: Run Gemini AI prediction & convert to lots
      try {
        const pendingPhotos = await offlinePhotoDb.getPendingPhotos();
        if (pendingPhotos.length > 0) {
          setIsSyncingPhotos(true);
          const res = await offlinePhotoDb.syncAndPredictPending();
          setIsSyncingPhotos(false);
          const updatedPhotos = await offlinePhotoDb.getAllPhotos();
          setOfflinePhotos(updatedPhotos);

          if (res.predicted > 0) {
            setSuccessToast(`🌐 Network Available: Predicted ${res.predicted} offline photo(s) via Gemini AI & converted into verified lots!`);
            await loadData();
            notifyUser({
              title: lang === 'hi' ? 'ऑफ़लाइन फोटो एआई द्वारा प्रेडिक्ट हुए' : 'Offline Photos AI-Predicted & Synced',
              message: `${res.predicted} photo(s) taken in offline yard were analyzed by Gemini AI and converted into official lots targeting your Main Hub.`,
              type: 'status'
            });
          }
        }
      } catch (err) {
        console.error('Failed to sync offline photos on reconnect:', err);
      }

      // 2. Sync queued lots
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
      const [mats, recs, txs, cmps, pickups] = await Promise.all([
        api.getMaterials(),
        api.getRecyclers(),
        api.getTransactions({ scrapper_id: user.id }),
        api.getComplaints(),
        api.getHouseholdPickups({ scrapper_id: user.id })
      ]);
      setMaterials(mats);
      setRecyclers(recs);
      setMyLots(txs);
      setComplaints(cmps || []);
      setHouseholdPickups(pickups || []);
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
    const isOffline = !navigator.onLine || simulateNoNetwork;

    // IF AT NO NETWORK AREA: store photos in separate offline database!
    if (isOffline) {
      try {
        const saved = await offlinePhotoDb.savePhoto({
          scrapper_id: user.id,
          scrapper_name: user.name,
          photo_data_url: imageBase64,
          file_name: fileName || `offline_capture_${Date.now()}.jpg`,
          mime_type: mimeType || 'image/jpeg',
          estimated_weight_kg: weightVal,
          category_hint: categoryHint || selectedCategory,
          notes: 'Captured in offline area. Stored in separate offline database.',
          main_hub_address: scrapperMainHub.address,
          main_hub_coords: { latitude: scrapperMainHub.latitude, longitude: scrapperMainHub.longitude }
        });
        const currentList = await offlinePhotoDb.getAllPhotos();
        setOfflinePhotos(currentList);
        setSuccessToast(`📵 Remote Yard (No Network): Photo stored in Separate Offline Photo Database (#${saved.id.slice(-6)}). As soon as network is available, it will be automatically analyzed by Gemini AI and converted into an official lot!`);
      } catch (e) {
        console.error('Failed to store offline photo:', e);
      }
      setIsAnalyzing(false);
      return;
    }

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
      console.warn('AI pipeline error or offline area, preserving photo in offline database:', err);
      // Fallback: save to separate offline database so it's not lost
      try {
        await offlinePhotoDb.savePhoto({
          scrapper_id: user.id,
          scrapper_name: user.name,
          photo_data_url: imageBase64,
          file_name: fileName,
          mime_type: mimeType,
          estimated_weight_kg: weightVal,
          category_hint: categoryHint || selectedCategory,
          notes: 'Network interrupted during analysis. Stored in separate offline database.',
          main_hub_address: scrapperMainHub.address,
          main_hub_coords: { latitude: scrapperMainHub.latitude, longitude: scrapperMainHub.longitude }
        });
        const currentList = await offlinePhotoDb.getAllPhotos();
        setOfflinePhotos(currentList);
        setSuccessToast(`📵 Connection Interrupted: Photo safely saved to Offline Photo Database. Will auto-predict once network returns.`);
      } catch (saveErr) {
        console.error('Failed to store offline photo:', saveErr);
      }

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
    if (!navigator.onLine || simulateNoNetwork) {
      const queued = offlineQueue.enqueueLot({
        scrapper_id: user.id,
        scrapper_name: user.name,
        recycler_id: 'rec-1',
        recycler_name: 'EcoRecycle Solutions Pvt Ltd',
        category: selectedCategory,
        estimated_weight: weightVal,
        declared_weight: weightVal,
        offered_rate_per_kg: baseRate,
        // CRITICAL REQUIREMENT: Recycler pickup trucks dispatch to the Main Hub of the scrapper, NOT their roving live location!
        collection_gps: {
          latitude: scrapperMainHub.latitude,
          longitude: scrapperMainHub.longitude,
          address: scrapperMainHub.address,
          hub_name: scrapperMainHub.hub_name,
          is_main_hub: true
        },
        payment_mode: 'UPI_DIGITAL',
        image_url: imagePreview,
        notes: `Offline Created: Fair estimate ₹${aiResult?.total_min_price} - ₹${aiResult?.total_max_price}. Pickup Location: Scrapper Main Hub.`
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
        // CRITICAL REQUIREMENT: Recycler pickup trucks dispatch to the Main Hub of the scrapper, NOT their roving live location!
        collection_gps: {
          latitude: scrapperMainHub.latitude,
          longitude: scrapperMainHub.longitude,
          address: scrapperMainHub.address,
          hub_name: scrapperMainHub.hub_name,
          is_main_hub: true
        },
        payment_mode: 'UPI_DIGITAL',
        image_url: imagePreview,
        notes: `AI Classified with ${(aiResult?.confidence || 95)}% confidence. Certified weighment locked at ${weightVal} kg. Pickup Target: Scrapper Main Aggregation Hub.`
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

  const handleSyncOfflinePhotos = async () => {
    setIsSyncingPhotos(true);
    try {
      const res = await offlinePhotoDb.syncAndPredictPending((idx, total, photo) => {
        setSuccessToast(`Analyzing offline photo ${idx}/${total} with Gemini AI...`);
      });
      const updatedPhotos = await offlinePhotoDb.getAllPhotos();
      setOfflinePhotos(updatedPhotos);

      if (res.predicted > 0) {
        setSuccessToast(`🌐 Network Restored: Predicted ${res.predicted} offline photo(s) using Gemini AI & added to your verified lots!`);
        await loadData();
        notifyUser({
          title: lang === 'hi' ? 'ऑफ़लाइन फोटो एआई द्वारा प्रेडिक्ट हुए' : 'Offline Photos AI-Predicted & Synced',
          message: `${res.predicted} photo(s) analyzed by Gemini AI and added to your verified lots targeting your Main Hub.`,
          type: 'status'
        });
      } else if (res.failed > 0) {
        setSuccessToast(`AI analysis completed with ${res.failed} error(s). Please try again.`);
      } else {
        setSuccessToast(`All offline photos have already been analyzed and converted.`);
      }
    } catch (err) {
      console.error('Failed to sync offline photos:', err);
    } finally {
      setIsSyncingPhotos(false);
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
          latitude: scrapperMainHub.latitude,
          longitude: scrapperMainHub.longitude,
          address: scrapperMainHub.address,
          hub_name: scrapperMainHub.hub_name,
          is_main_hub: true
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

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Direct Scrapper Android APK Download Link */}
            <a
              href="/downloads/KabadiwalaConnect-Scrapper-v2.4.1.apk"
              download="KabadiwalaConnect-Scrapper-v2.4.1.apk"
              id="scrapper-download-apk-btn"
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 active:scale-95 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-emerald-300"
              title="Download Android APK Installer (.apk) directly to your phone"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Download Scrapper App (APK)</span>
            </a>

            {/* Offline Photo Database Vault Button */}
            <button
              type="button"
              id="scrapper-open-vault-btn"
              onClick={() => setIsOfflineVaultModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-amber-500"
              title="Open photos stored in separate offline database"
            >
              <Database className="w-4 h-4 text-slate-900" />
              <span>Offline Vault ({offlinePhotos.filter(p => p.status === 'pending_prediction').length})</span>
            </button>

            {isInstalled ? (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-700/80 text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-500 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Running in Android App</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAndroidModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-900/60 text-white hover:bg-emerald-900 active:scale-95 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-emerald-600/60"
                title="PWA installation guide and APK package instructions"
              >
                <Smartphone className="w-4 h-4 text-emerald-300" />
                <span>Install Guide</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Banner & Vernacular Header */}
      <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-5 sm:p-6 rounded-2xl border border-emerald-500/25 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t.appTitle}
              </h1>
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
                title="View Government of India Aadhaar & CPCB Registration ID"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aadhaar Identity Card</span>
              </button>

              <button
                type="button"
                id="scrapper-open-household-lots-btn"
                onClick={() => {
                  setActiveMenuTab('household_lots');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeMenuTab === 'household_lots'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30'
                }`}
                title="View doorstep scrap requests from household citizens"
              >
                <Home className="w-3.5 h-3.5 text-blue-400" />
                <span>Household Scrap Lots</span>
                {householdPickups.filter(p => p.status === 'PENDING' || p.status === 'SCHEDULED').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-500 text-white">
                    {householdPickups.filter(p => p.status === 'PENDING' || p.status === 'SCHEDULED').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="scrapper-open-complaints-btn"
                onClick={() => {
                  setActiveMenuTab('complaints');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                title="File formal complaint or view grievance status"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.grievanceDesk}</span>
                {complaints.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300">
                    {complaints.length}
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {t.appSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
                Collector: {user.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{user.location}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Aadhaar-Linked: {user.phone}</span>
              </span>
            </div>
          </div>

          {/* Quick Hub Presets for testing */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> GPS Pin:
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentCoords(PRESET_HUBS.bengaluru);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                currentCoords.latitude === PRESET_HUBS.bengaluru.latitude
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
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
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
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
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              Chennai
            </button>
            <button
              type="button"
              onClick={refreshLocation}
              disabled={isLocating}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
            offlinePhotosCount={offlinePhotos.filter(p => p.status === 'pending_prediction').length}
            onOpenOfflineVault={() => setIsOfflineVaultModalOpen(true)}
            isOfflineActive={!navigator.onLine || simulateNoNetwork}
            onSyncOfflinePhotos={handleSyncOfflinePhotos}
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
            onNavigateToHouseholdLots={() => setActiveMenuTab("household_lots")}
            householdLotsCount={householdPickups.filter(p => p.status === 'PENDING' || p.status === 'SCHEDULED').length}
          />
        )}

        {activeMenuTab === "household_lots" && (
          <HouseholdPickupsModule
            pickups={householdPickups}
            scrapperUser={user}
            onRefresh={loadData}
            onOpenChat={(household) => {
              onOpenChat(household);
            }}
            onNavigateToCapture={() => setActiveMenuTab("capture")}
            lang={lang}
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

      {/* Offline Photo Vault Modal */}
      <OfflinePhotoVaultModal
        isOpen={isOfflineVaultModalOpen}
        onClose={() => setIsOfflineVaultModalOpen(false)}
        photos={offlinePhotos}
        onRefresh={async () => {
          const list = await offlinePhotoDb.getAllPhotos();
          setOfflinePhotos(list);
        }}
        onSyncAll={handleSyncOfflinePhotos}
        isSyncing={isSyncingPhotos}
        lang={lang}
        simulateNoNetwork={simulateNoNetwork}
        onToggleSimulateNoNetwork={() => setSimulateNoNetwork(prev => !prev)}
        onViewLot={(lotRefId) => {
          setActiveMenuTab('lots');
        }}
      />
    </div>
  );
};
