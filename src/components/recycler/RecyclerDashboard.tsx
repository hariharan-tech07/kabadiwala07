import React, { useState, useEffect, useRef } from 'react';
import { User, RecyclerFacility, Transaction, Material, SortingInspection, VernacularLang, PaymentMode } from '../../types';
import { api } from '../../api/client';
import { translations } from '../../translations';
import { OpenStreetMap } from '../common/OpenStreetMap';
import { DigitalReceiptModal } from '../common/DigitalReceiptModal';
import { ComplaintModal } from '../common/ComplaintModal';
import { PaymentSettlementModal } from '../common/PaymentSettlementModal';
import { PaymentBadge } from '../common/PaymentBadge';
import { TransactionPaymentHistoryView } from '../common/TransactionPaymentHistoryView';
import { notifyUser } from '../common/NotificationToast';
import { generateRecyclerEprCertificate } from '../../utils/pdfGenerator';
import {
  playTransactionAssignedSound,
  isAudioFeedbackEnabled,
  toggleAudioFeedback,
  subscribeAudioFeedback
} from '../../utils/soundEffects';
import {
  Building2, Sliders, CheckCircle2, MessageSquare, Scale,
  FileText, ShieldCheck, MapPin, Save, RefreshCw, X, AlertCircle,
  Truck, ArrowUpRight, DollarSign, Filter, Compass, Navigation,
  Users, Phone, Sparkles, ExternalLink, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Search, PlusCircle,
  ShieldAlert, Download, Send, Layers, Check, IndianRupee, QrCode, WifiOff, CreditCard,
  Volume2, VolumeX, Globe
} from 'lucide-react';

export type RecyclerMenuTab = 'lots' | 'rates' | 'weighment' | 'map' | 'chat' | 'compliance' | 'payments';

interface RecyclerDashboardProps {
  user: User;
  lang?: VernacularLang;
  onOpenChat: (scrapper: { id: string; name: string; role: string; phone?: string }, lot?: Transaction) => void;
  activeMenuTab?: RecyclerMenuTab;
  onSelectMenuTab?: (tab: RecyclerMenuTab) => void;
}

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({
  user,
  lang = 'en',
  onOpenChat,
  activeMenuTab: controlledMenuTab,
  onSelectMenuTab
}) => {
  const t = translations[lang] || translations.en;

  const [facility, setFacility] = useState<RecyclerFacility | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scrappers, setScrappers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingFacility, setSavingFacility] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 6-Module Active Menu Tab (supports controlled or local fallback)
  const [internalMenuTab, setInternalMenuTab] = useState<RecyclerMenuTab>('lots');
  const activeMenuTab = controlledMenuTab ?? internalMenuTab;
  const setActiveMenuTab = (tab: RecyclerMenuTab) => {
    setInternalMenuTab(tab);
    onSelectMenuTab?.(tab);
  };

  // Status & Search Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [lotCategoryFilter, setLotCategoryFilter] = useState<string>('ALL');
  const [lotSearchQuery, setLotSearchQuery] = useState<string>('');
  const [lotViewMode, setLotViewMode] = useState<'map' | 'table' | 'both'>('table');

  // Rate Configurator Form
  const [dynamicRates, setDynamicRates] = useState<Record<string, number>>({});
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [facilityLat, setFacilityLat] = useState('13.0285');
  const [facilityLon, setFacilityLon] = useState('77.5192');
  const [serviceRadius, setServiceRadius] = useState('35');

  // Inspection & Handover Protocol Modal
  const [inspectingLot, setInspectingLot] = useState<Transaction | null>(null);
  const [actualWeightInput, setActualWeightInput] = useState('');
  const [requiredWeightInput, setRequiredWeightInput] = useState('');
  const [unrequiredWeightInput, setUnrequiredWeightInput] = useState('0');
  const [contaminationDeduction, setContaminationDeduction] = useState('0');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [paymentModeInput, setPaymentModeInput] = useState<PaymentMode>('UPI_DIGITAL');

  // Payment Settlement Desk Modal
  const [settlingPaymentLot, setSettlingPaymentLot] = useState<Transaction | null>(null);

  // Digital Receipt Modal
  const [receiptLot, setReceiptLot] = useState<Transaction | null>(null);

  // Complaints / Dispute Desk Modal
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintTargetLot, setComplaintTargetLot] = useState<Transaction | null>(null);

  useEffect(() => {
    loadRecyclerData();
  }, [user.id]);

  const loadRecyclerData = async () => {
    setLoading(true);
    try {
      const [allRecs, mats, txs, scrapperUsers] = await Promise.all([
        api.getRecyclers(),
        api.getMaterials(),
        api.getTransactions(),
        api.getUsers('scrapper')
      ]);

      // Match facility by user_id or pick first
      const myFacility = allRecs.find(r => r.user_id === user.id) || allRecs[0];
      if (myFacility) {
        setFacility(myFacility);
        setDynamicRates(myFacility.offered_rates_json || {});
        setPickupAvailable(myFacility.pickup_available);
        setFacilityLat(myFacility.latitude.toString());
        setFacilityLon(myFacility.longitude.toString());
        setServiceRadius(myFacility.service_radius_km?.toString() || '30');
      }

      setMaterials(mats);
      setTransactions(txs);
      setScrappers(scrapperUsers);
    } catch (err) {
      console.error('Failed to load recycler data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFirstChat = () => {
    const recentTx = transactions.find(t => t.scrapper_id);
    if (recentTx) {
      onOpenChat(
        { id: recentTx.scrapper_id, name: recentTx.scrapper_name, role: 'scrapper' },
        recentTx
      );
    } else if (scrappers.length > 0) {
      onOpenChat(
        { id: scrappers[0].id, name: scrappers[0].name, role: 'scrapper', phone: scrappers[0].phone },
        undefined
      );
    } else {
      onOpenChat(
        { id: 'usr-scrapper-1', name: 'Ramesh Kumar', role: 'scrapper', phone: '+91 98451 22341' },
        undefined
      );
    }
  };

  const handleRateChange = (category: string, value: string) => {
    const num = parseFloat(value) || 0;
    setDynamicRates(prev => ({
      ...prev,
      [category]: num
    }));
  };

  const handleSaveFacilityConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;

    setSavingFacility(true);
    try {
      const updated = await api.updateRecycler(facility.id, {
        offered_rates_json: dynamicRates,
        pickup_available: pickupAvailable,
        latitude: parseFloat(facilityLat) || 13.0285,
        longitude: parseFloat(facilityLon) || 77.5192,
        service_radius_km: parseFloat(serviceRadius) || 30
      });
      setFacility(updated);
      setToastMessage(lang === 'mr' ? 'खरेदी दर आणि लॉजिस्टिक्स माहिती जतन करण्यात आली!' : 'Facility dynamic rates and logistics settings published to Scrapper network!');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to update facility config:', err);
    } finally {
      setSavingFacility(false);
    }
  };

  const openInspectionModal = (tx: Transaction) => {
    setInspectingLot(tx);
    const est = tx.declared_weight ?? tx.estimated_weight ?? 10;
    setActualWeightInput(est.toString());
    setRequiredWeightInput(est.toString());
    setUnrequiredWeightInput('0');
    setContaminationDeduction('0');
    setInspectionNotes(
      tx.weight_confirmed_by_scrapper 
        ? `Scale weighment matched scrapper's confirmed certified weight (${est} kg).`
        : 'Material quality verified via certified electronic bench scale.'
    );
    setPaymentModeInput(tx.payment_mode || 'UPI_DIGITAL');
  };

  const handleExecuteHandover = async () => {
    if (!inspectingLot) return;

    const actual = parseFloat(actualWeightInput) || inspectingLot.estimated_weight;
    const reqKg = parseFloat(requiredWeightInput) || actual;
    const unreqKg = parseFloat(unrequiredWeightInput) || 0;
    const deduct = parseFloat(contaminationDeduction) || 0;
    const rate = inspectingLot.offered_rate_per_kg || 350;

    const finalPayout = Math.max(0, Math.round(reqKg * rate - deduct));
    const sortingBreakdown: SortingInspection = {
      required_kg: reqKg,
      unrequired_kg: unreqKg,
      contamination_deduction: deduct,
      notes: inspectionNotes
    };

    try {
      const updatedTx = await api.updateTransaction(inspectingLot.id, {
        actual_weight: actual,
        final_payout: finalPayout,
        sorting_breakdown: sortingBreakdown,
        status: 'COMPLETED',
        payment_mode: paymentModeInput,
        handover_timestamp: new Date().toISOString()
      });

      setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
      setInspectingLot(null);
      setReceiptLot(updatedTx);

      notifyUser({
        title: lang === 'hi' ? 'हैंडओवर व भुगतान संपन्न' : lang === 'mr' ? 'हँडओव्हर आणि पेमेंट पूर्ण' : lang === 'ta' ? 'ஒப்படைப்பு மற்றும் பணம் செலுத்துதல் முடிந்தது' : 'Handover & Settlement Completed',
        message: lang === 'hi' 
          ? `लॉट ${updatedTx.lot_reference_id} का अंतिम भुगतान ₹${finalPayout} स्वीकृत हुआ। CPCB ईपीआर गेट पास तैयार है।`
          : lang === 'mr'
          ? `लॉट ${updatedTx.lot_reference_id} चे अंतिम पेमेंट ₹${finalPayout} पूर्ण झाले. CPCB EPR गेट पास तयार आहे.`
          : lang === 'ta'
          ? `லாட் ${updatedTx.lot_reference_id}-ன் இறுதி கட்டணம் ₹${finalPayout} செலுத்தப்பட்டது. EPR சான்றிதழ் தயாராக உள்ளது.`
          : `Lot ${updatedTx.lot_reference_id} finalized with payout ₹${finalPayout}. EPR Compliance Gate Pass generated.`,
        type: 'payment',
        lotId: updatedTx.id,
        lotReferenceId: updatedTx.lot_reference_id
      });
    } catch (err) {
      console.error('Failed to complete inspection:', err);
    }
  };

  const handleSendWeightVerification = async () => {
    if (!inspectingLot) return;

    const actual = parseFloat(actualWeightInput) || inspectingLot.estimated_weight;
    const reqKg = parseFloat(requiredWeightInput) || actual;
    const unreqKg = parseFloat(unrequiredWeightInput) || 0;
    const deduct = parseFloat(contaminationDeduction) || 0;

    const sortingBreakdown: SortingInspection = {
      required_kg: reqKg,
      unrequired_kg: unreqKg,
      contamination_deduction: deduct,
      notes: inspectionNotes
    };

    try {
      const updatedTx = await api.verifyLotWeight(inspectingLot.id, {
        actual_weight: actual,
        sorting_breakdown: sortingBreakdown
      });
      setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
      setInspectingLot(null);
      setToastMessage(lang === 'mr' ? `काटा वजन (${actual} किलो) नोंदवले आणि स्क्रॅपरकडे मंजुरीसाठी पाठवले!` : `Scale weighment (${actual} kg) logged and sent to ${inspectingLot.scrapper_name} for approval!`);
      setTimeout(() => setToastMessage(null), 6000);

      notifyUser({
        title: lang === 'hi' ? 'काटा वजन दर्ज हुआ' : lang === 'mr' ? 'काटा वजन नोंदवले' : lang === 'ta' ? 'எடை சரிபார்ப்பு பதிவு செய்யப்பட்டது' : 'Bench Scale Weight Verified',
        message: lang === 'hi'
          ? `लॉट ${inspectingLot.lot_reference_id} का वजन ${actual} किग्रा स्क्रैपर स्वीकृति हेतु भेजा गया।`
          : lang === 'mr'
          ? `लॉट ${inspectingLot.lot_reference_id} चे काटा वजन ${actual} किलो स्क्रॅपरच्या मंजुरीसाठी पाठवले.`
          : lang === 'ta'
          ? `லாட் ${inspectingLot.lot_reference_id}-ன் எடை ${actual} கிலோ என பதிவு செய்யப்பட்டு ஸ்கிராப்பர் ஒப்புதலுக்கு அனுப்பப்பட்டது.`
          : `Weighment of ${actual} kg for Lot ${inspectingLot.lot_reference_id} sent to ${inspectingLot.scrapper_name} for approval.`,
        type: 'weight',
        lotId: inspectingLot.id,
        lotReferenceId: inspectingLot.lot_reference_id
      });
    } catch (err) {
      console.error('Failed to submit weight verification:', err);
    }
  };

  const handleDownloadEpr = (tx: Transaction) => {
    generateRecyclerEprCertificate(tx, facility || undefined);
  };

  const handleAcceptLot = async (tx: Transaction) => {
    try {
      const updated = await api.updateTransaction(tx.id, { status: 'ACCEPTED' });
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      setToastMessage(lang === 'mr' ? `लॉट ${tx.lot_reference_id} स्वीकारला! आता वजन व तपासणी करा.` : `Lot ${tx.lot_reference_id} accepted! Ready for weighment.`);
      setTimeout(() => setToastMessage(null), 5000);

      notifyUser({
        title: lang === 'hi' ? 'लॉट स्वीकार किया गया' : lang === 'mr' ? 'लॉट स्वीकारला' : lang === 'ta' ? 'லாட் ஏற்கப்பட்டது' : 'Lot Inward Accepted',
        message: lang === 'hi'
          ? `लॉट ${tx.lot_reference_id} स्वीकार हुआ। अब काटा वजन व सामग्री जांच करें।`
          : lang === 'mr'
          ? `लॉट ${tx.lot_reference_id} स्वीकारला आहे. आता काटा वजन व पडताळणी करा.`
          : lang === 'ta'
          ? `லாட் ${tx.lot_reference_id} ஏற்கப்பட்டது. இப்போது எடை சரிபார்ப்பை மேற்கொள்ளலாம்.`
          : `Lot ${tx.lot_reference_id} accepted from ${tx.scrapper_name}. Scheduled for bench weighment.`,
        type: 'status',
        lotId: tx.id,
        lotReferenceId: tx.lot_reference_id
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateInwardLot = async () => {
    const scrapper = scrappers[0] || { id: 'u_scrapper_1', name: 'Ramesh Kumar', phone: '+91 98450 12345' };
    const sampleCategory = 'PCB (Printed Circuit Boards)';
    const rate = dynamicRates[sampleCategory] || 350;
    try {
      const newTx = await api.createTransaction({
        scrapper_id: scrapper.id,
        scrapper_name: scrapper.name,
        recycler_id: facility?.id || 'rec-1',
        recycler_name: facility?.facility_name || 'EcoRecycle Solutions',
        category: sampleCategory,
        estimated_weight: 48,
        offered_rate_per_kg: rate,
        collection_gps: {
          latitude: 13.0315,
          longitude: 77.5210,
          address: 'Peenya Collection Hub & Aggregation Yard (Plot 14, Main Hub), Bengaluru'
        },
        payment_mode: 'UPI_DIGITAL',
        notes: 'Simulated high-yield lot for platform testing and weighment verification'
      });
      setTransactions(prev => [newTx, ...prev]);
      setToastMessage(lang === 'mr' ? `नवीन लॉट ${newTx.lot_reference_id} मिळाला!` : `Simulated new inward lot ${newTx.lot_reference_id} received from ${scrapper.name}!`);

      playTransactionAssignedSound();
      notifyUser({
        title: lang === 'hi' ? 'नया लॉट कनेक्शन प्राप्त हुआ' : lang === 'mr' ? 'नवीन आवक लॉट प्राप्त झाला' : lang === 'ta' ? 'புதிய உள்வரும் லாட் பெறப்பட்டது' : 'New Inward Lot Connection',
        message: lang === 'hi'
          ? `${scrapper.name} ने लॉट ${newTx.lot_reference_id} (48 किग्रा ${sampleCategory}) भेजा है।`
          : lang === 'mr'
          ? `${scrapper.name} कडून लॉट ${newTx.lot_reference_id} (48 किलो ${sampleCategory}) प्राप्त झाला.`
          : lang === 'ta'
          ? `${scrapper.name} புதிய லாட் ${newTx.lot_reference_id} (48 கிலோ ${sampleCategory}) அனுப்பியுள்ளார்.`
          : `New scrap connection from ${scrapper.name}: Lot ${newTx.lot_reference_id} (48 kg, ${sampleCategory}).`,
        type: 'assignment',
        lotId: newTx.id,
        lotReferenceId: newTx.lot_reference_id
      });
    } catch (err) {
      console.error('Failed to create demo lot:', err);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (lotCategoryFilter !== 'ALL' && !t.category.toLowerCase().includes(lotCategoryFilter.toLowerCase())) return false;
    if (lotSearchQuery.trim()) {
      const q = lotSearchQuery.toLowerCase();
      const ref = t.lot_reference_id?.toLowerCase() || '';
      const scrapper = t.scrapper_name?.toLowerCase() || '';
      const cat = t.category?.toLowerCase() || '';
      if (!ref.includes(q) && !scrapper.includes(q) && !cat.includes(q)) return false;
    }
    return true;
  });

  const totalInwardLots = transactions.length;
  const pendingWeighmentCount = transactions.filter(t => t.status === 'OFFERED' || t.status === 'ACCEPTED' || t.status === 'INSPECTION').length;
  const certifiedMassKg = transactions.reduce((acc, t) => acc + (t.actual_weight || (t.status === 'COMPLETED' ? t.estimated_weight : 0)), 0);
  const totalSettledPayout = transactions.reduce((acc, t) => acc + (t.final_payout || 0), 0);

  // 6-MODULE RECYCLER WORKSPACE MODULES
  const RECYCLER_MODULES: Array<{
    id: RecyclerMenuTab;
    num: string;
    shortTitle: string;
    label: string;
    icon: any;
    badge: string;
    subtitle: string;
  }> = [
    {
      id: 'lots',
      num: '1',
      shortTitle: t.modRecLots.label,
      label: t.modRecLots.title,
      icon: FileText,
      badge: `${transactions.length} Lots`,
      subtitle: t.modRecLots.desc
    },
    {
      id: 'rates',
      num: '2',
      shortTitle: t.modRecRates.label,
      label: t.modRecRates.title,
      icon: Sliders,
      badge: '6 Streams',
      subtitle: t.modRecRates.desc
    },
    {
      id: 'weighment',
      num: '3',
      shortTitle: t.modRecWeigh.label,
      label: t.modRecWeigh.title,
      icon: Scale,
      badge: `${pendingWeighmentCount} Pending`,
      subtitle: t.modRecWeigh.desc
    },
    {
      id: 'map',
      num: '4',
      shortTitle: t.modRecMap.label,
      label: t.modRecMap.title,
      icon: MapPin,
      badge: 'Radar Map',
      subtitle: t.modRecMap.desc
    },
    {
      id: 'chat',
      num: '5',
      shortTitle: t.modRecChat.label,
      label: t.modRecChat.title,
      icon: MessageSquare,
      badge: `${scrappers.length} Active`,
      subtitle: t.modRecChat.desc
    },
    {
      id: 'compliance',
      num: '6',
      shortTitle: t.modRecCompliance.label,
      label: t.modRecCompliance.title,
      icon: ShieldCheck,
      badge: 'CPCB EPR',
      subtitle: t.modRecCompliance.desc
    },
    {
      id: 'payments',
      num: '7',
      shortTitle: 'Payments & History',
      label: 'Payments & Settlement Desk',
      icon: IndianRupee,
      badge: `${transactions.filter(t => t.payment_status === 'PAID' || t.status === 'PAID' || t.status === 'COMPLETED').length} Paid`,
      subtitle: 'UPI, Cash on Pickup/Delivery & Offline Settlement History'
    }
  ];

  const currentIndex = RECYCLER_MODULES.findIndex((m) => m.id === activeMenuTab);
  const currentMod = RECYCLER_MODULES[currentIndex] || RECYCLER_MODULES[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveMenuTab(RECYCLER_MODULES[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < RECYCLER_MODULES.length - 1) {
      setActiveMenuTab(RECYCLER_MODULES[currentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Authorized Recycler Web Portal Master Ribbon */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-400 shadow-md">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight">
                  Authorized Recycler Web Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-300 text-blue-950 shadow-xs flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Enterprise Web Page</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-100 mt-1 flex-wrap font-medium">
                <span className="inline-flex items-center gap-1 bg-blue-900/80 px-2 py-0.5 rounded-md border border-blue-700/60">
                  <Scale className="w-3 h-3 text-blue-300" />
                  <span>Bench Weighbridge Terminal</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-900/80 px-2 py-0.5 rounded-md border border-blue-700/60">
                  <FileText className="w-3 h-3 text-blue-300" />
                  <span>CPCB EPR Circular Credits</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-900/80 px-2 py-0.5 rounded-md border border-blue-700/60">
                  <CreditCard className="w-3 h-3 text-blue-300" />
                  <span>Formal Bank/UPI Payouts</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-900/80 px-2 py-0.5 rounded-md border border-blue-700/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>CPCB Reg: {facility?.cpcb_auth_number || user.cpcb_number || 'CPCB/EW/2026/VALID'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-blue-200 bg-blue-950/70 px-3 py-1.5 rounded-xl border border-blue-800">
              💻 Desktop Cloud Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Top Banner & Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t.recyclerPortal}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-3.5 h-3.5" />
                {facility?.facility_name || user.entity_name || 'Authorized Aggregation Center'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Rep: {user.name}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{facility?.address || user.location}</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>CPCB Auth: {facility?.cpcb_auth_number || user.cpcb_number || 'CPCB/EW/2026/VALID'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.recyclerPortalDesc}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              id="recycler-header-open-chat-btn"
              onClick={handleOpenFirstChat}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
            >
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-emerald-100" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              </div>
              <span>{t.directChat}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-800 text-emerald-100">
                {scrappers.length > 0 ? `${scrappers.length} Active` : 'Online'}
              </span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {t.cpcbCompliant}
            </span>

            <button
              type="button"
              onClick={() => {
                setComplaintTargetLot(null);
                setIsComplaintModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              title="File official complaint or dispute"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>{t.grievanceDesk}</span>
            </button>

            <button
              type="button"
              id="recycler-test-inward-lot-btn"
              onClick={handleSimulateInwardLot}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
              title="Simulate incoming scrap lot for instant testing"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Test Inward Lot</span>
            </button>

            <button
              type="button"
              id="recycler-test-audio-chime-btn"
              onClick={() => {
                playTransactionAssignedSound();
                notifyUser({
                  title: lang === 'hi' ? 'लेनदेन असाइन ऑडियो टेस्ट' : lang === 'mr' ? 'व्यवहार वाटप ऑडिओ चाचणी' : lang === 'ta' ? 'ஒதுக்கீடு ஒலி சோதனை' : 'Transaction Assigned Sound Test',
                  message: lang === 'hi' ? 'सौम्य आरोही हार्मोनिक ऑडियो चाइम्स' : lang === 'mr' ? 'नवीन व्यवहारासाठी सौम्य ध्वनी संकेत' : lang === 'ta' ? 'புதிய ஒதுக்கீட்டிற்கான ஒலி சோதனை' : 'Acoustic feedback: Soft ascending harmonic chime for new transaction assignment.',
                  type: 'assignment'
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
              title="Test the subtle transaction assigned audio feedback chime"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audio Chime Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.inwardLotsTitle}
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {totalInwardLots}
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{transactions.filter(t => t.status === 'COMPLETED').length} Handover Certified</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.verifiedVolumeTitle}
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {certifiedMassKg.toLocaleString('en-IN')} <span className="text-sm font-bold text-slate-400">KG</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-600">
            CPCB Scale Weighment Grade
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.pendingWeighmentTitle}
          </div>
          <div className="text-3xl font-bold text-amber-700">
            {pendingWeighmentCount}
          </div>
          <div className="mt-2 text-xs font-semibold text-amber-700">
            Action required at bench scale
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.totalPayout}
          </div>
          <div className="text-3xl font-bold text-emerald-700">
            ₹{totalSettledPayout.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">
            Direct Scrapper UPI / Bank
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ACTIVE MODULE CONTAINER */}
      <div className="mt-4">
        {/* MODULE 1: BROADCASTED SCRAP LOTS & INWARD STREAM */}
        {activeMenuTab === 'lots' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>{t.modRecLots.title}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t.modRecLots.desc}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setLotViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    lotViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.tableView}
                </button>
                <button
                  type="button"
                  onClick={() => setLotViewMode('map')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    lotViewMode === 'map'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.mapView}
                </button>
                <button
                  type="button"
                  onClick={() => setLotViewMode('both')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    lotViewMode === 'both'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.bothView}
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={lotSearchQuery}
                  onChange={(e) => setLotSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {['ALL', 'OFFERED', 'ACCEPTED', 'WEIGHT_VERIFIED', 'COMPLETED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? t.statusAll : st === 'OFFERED' ? t.statusBroadcasted : st === 'ACCEPTED' ? t.statusAccepted : st === 'WEIGHT_VERIFIED' ? t.statusWeightConfirmed : t.statusCompleted}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Map Preview in Lots View */}
            {(lotViewMode === 'map' || lotViewMode === 'both') && (
              <div className="mt-2">
                <OpenStreetMap
                  currentUser={user}
                  mode="recycler_view"
                  height="360px"
                  hideFitAll={true}
                  onOpenChat={onOpenChat}
                  onSelectLot={(lot) => {
                    const foundTx = transactions.find(t => t.id === lot.id);
                    if (foundTx) openInspectionModal(foundTx);
                  }}
                />
              </div>
            )}

            {/* Table View */}
            {(lotViewMode === 'table' || lotViewMode === 'both') && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">{t.thLotRefId}</th>
                      <th className="py-2.5 px-3">{t.thNameAndIdentity}</th>
                      <th className="py-2.5 px-3">{t.thMaterialCategory}</th>
                      <th className="py-2.5 px-3">{t.thCertifiedWeight}</th>
                      <th className="py-2.5 px-3">{t.perKgRate}</th>
                      <th className="py-2.5 px-3">{t.thSettlement}</th>
                      <th className="py-2.5 px-3">{t.thStatus}</th>
                      <th className="py-2.5 px-3 text-right">{t.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No transactions matching filter &apos;{statusFilter}&apos;.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isCompleted = tx.status === 'COMPLETED';

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="font-mono font-bold text-slate-900">
                                {tx.lot_reference_id}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  tx.fulfillment_type === 'DELIVERY'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {tx.fulfillment_type || 'PICKUP'}
                                </span>
                                {tx.scraps_items && tx.scraps_items.length > 0 && (
                                  <span className="text-[10px] text-slate-500 font-medium" title={`${tx.scraps_items.length} itemized scrap lines`}>
                                    ({tx.scraps_items.length} scraps)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-900">{tx.scrapper_name}</div>
                              <div className="text-[11px] text-slate-600 truncate max-w-[170px]" title={tx.collection_gps?.address || 'Scrapper Main Hub'}>
                                {tx.collection_gps?.address ? tx.collection_gps.address.split('(')[0].trim() : 'Peenya Main Hub'}
                              </div>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                                📍 Main Hub (Not Live GPS)
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-900 block">{tx.category}</span>
                              {tx.scraps_items && tx.scraps_items.length > 1 && (
                                <span className="text-[10px] text-slate-400">
                                  +{tx.scraps_items.length - 1} sub-fractions
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono">
                              <div>Est: {tx.estimated_weight} kg</div>
                              {tx.actual_weight !== null ? (
                                <div className="text-emerald-700 font-bold">Act: {tx.actual_weight} kg</div>
                              ) : (
                                <div className="text-slate-400">Pending scale</div>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-800">
                              ₹{tx.offered_rate_per_kg}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-mono">
                                {tx.final_payout !== null ? (
                                  <span className="font-bold text-emerald-700">
                                    ₹{tx.final_payout.toLocaleString('en-IN')}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">
                                    ~₹{Math.round(tx.estimated_weight * tx.offered_rate_per_kg).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1">
                                <PaymentBadge
                                  mode={tx.payment_mode || 'UPI_DIGITAL'}
                                  status={tx.payment_status || (tx.status === 'COMPLETED' ? 'PAID' : 'PENDING')}
                                  voucherOrRef={tx.payment_details?.offline_voucher_no || tx.payment_details?.cash_receipt_no || tx.payment_details?.upi_txn_id}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  tx.status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : tx.status === 'WEIGHT_VERIFIED'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : tx.status === 'ACCEPTED'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Chat Button */}
                                <button
                                  type="button"
                                  id={`recycler-chat-btn-${tx.id}`}
                                  onClick={() => onOpenChat(
                                    { id: tx.scrapper_id, name: tx.scrapper_name, role: 'scrapper' },
                                    tx
                                  )}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                                  title={`Chat with ${tx.scrapper_name}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{t.chat}</span>
                                </button>

                                {/* Accept Lot if OFFERED */}
                                {tx.status === 'OFFERED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptLot(tx)}
                                    className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{t.acceptLot}</span>
                                  </button>
                                )}

                                {/* Settle / Disburse Payout Button */}
                                {(tx.status === 'WEIGHT_VERIFIED' || tx.status === 'ACCEPTED' || (tx.actual_weight !== null && tx.payment_status !== 'PAID')) && (
                                  <button
                                    type="button"
                                    onClick={() => setSettlingPaymentLot(tx)}
                                    className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                    title="Disburse payment via UPI, Cash, or Offline Voucher"
                                  >
                                    <IndianRupee className="w-3 h-3" />
                                    <span>Pay</span>
                                  </button>
                                )}

                                {/* Inspection & Weighment Handover Button */}
                                {!isCompleted && tx.status !== 'OFFERED' && (
                                  <button
                                    type="button"
                                    id={`inspect-btn-${tx.id}`}
                                    onClick={() => openInspectionModal(tx)}
                                    className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Scale className="w-3 h-3 text-emerald-400" />
                                    <span>{t.inspectWeigh}</span>
                                  </button>
                                )}

                                {isCompleted && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setReceiptLot(tx)}
                                      className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 text-emerald-700 font-semibold text-xs flex items-center gap-1 border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
                                      title="View Gate Pass Voucher"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>Receipt</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadEpr(tx)}
                                      className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1 border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                                      title="Download CPCB EPR Credit Certificate PDF"
                                    >
                                      <Download className="w-3 h-3 text-emerald-700" />
                                      <span>EPR Cert</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODULE 2: BUYING RATES & LOGISTICS CONFIGURATOR */}
        {activeMenuTab === 'rates' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <span>{t.modRecRates.title}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t.modRecRates.desc}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-200">
                Facility ID: {facility?.id || 'rec-1'}
              </span>
            </div>

            <form onSubmit={handleSaveFacilityConfig} className="space-y-6">
              {/* Dynamic Rates Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  {t.buyingRates}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {materials.map((mat) => {
                    const currentRate = dynamicRates[mat.category] ?? mat.base_rate_per_kg;
                    return (
                      <div
                        key={mat.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all shadow-2xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {mat.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            CPCB Base: ₹{mat.base_rate_per_kg}
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                          <input
                            type="number"
                            min="10"
                            max="2500"
                            value={currentRate}
                            onChange={(e) => handleRateChange(mat.category, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-md pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logistics & Pickup Radius */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Logistics & Collection Geo-Radius
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.facilityLatitude}
                    </label>
                    <input
                      type="text"
                      value={facilityLat}
                      onChange={(e) => setFacilityLat(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.facilityLongitude}
                    </label>
                    <input
                      type="text"
                      value={facilityLon}
                      onChange={(e) => setFacilityLon(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.serviceRadiusKm}
                    </label>
                    <input
                      type="number"
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pickup-avail"
                    checked={pickupAvailable}
                    onChange={(e) => setPickupAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="pickup-avail" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    {t.doorstepPickup}
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingFacility}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingFacility ? 'Publishing...' : t.saveChanges}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODULE 3: CERTIFIED WEIGHMENT & HANDOVER PROTOCOL */}
        {activeMenuTab === 'weighment' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <span>{t.modRecWeigh.title}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t.modRecWeigh.desc}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Scale Calibration: Active (IS:9281)
              </span>
            </div>

            {/* List of Lots Pending Scale Weighment */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lots Pending Electronic Scale Weighment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(transactions || [])
                  .filter(tx => tx && (tx.status === 'ACCEPTED' || tx.status === 'WEIGHT_VERIFIED' || tx.status === 'OFFERED'))
                  .slice(0, 6)
                  .map(tx => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {tx.lot_reference_id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {tx.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 font-semibold">{tx.category}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Scrapper: <strong className="text-slate-700">{tx.scrapper_name}</strong>
                        </div>
                        <div className="text-xs font-mono mt-2 flex items-center gap-3 text-slate-600">
                          <span>Declared: <strong className="text-slate-900">{tx.declared_weight || tx.estimated_weight} kg</strong></span>
                          <span>•</span>
                          <span>Offered: <strong className="text-emerald-700">₹{tx.offered_rate_per_kg}/kg</strong></span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          ~₹{Math.round((tx.declared_weight || tx.estimated_weight) * tx.offered_rate_per_kg)}
                        </span>
                        <button
                          type="button"
                          onClick={() => openInspectionModal(tx)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Scale className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t.inspectWeigh}</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: LOGISTICS & COLLECTION RADAR MAP */}
        {activeMenuTab === 'map' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{t.modRecMap.title}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t.modRecMap.desc}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Service Radius: {serviceRadius} km
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200">
              <OpenStreetMap
                currentUser={user}
                mode="recycler_view"
                height="540px"
                onOpenChat={onOpenChat}
                onSelectLot={(lot) => {
                  const foundTx = transactions.find(t => t.id === lot.id);
                  if (foundTx) openInspectionModal(foundTx);
                }}
              />
            </div>
          </div>
        )}

        {/* MODULE 5: SCRAPPER COMMUNICATIONS DESK */}
        {activeMenuTab === 'chat' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>{t.modRecChat.title}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t.modRecChat.desc}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {scrappers.length} Scrappers in Coverage Area
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {scrappers.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-sm">{sc.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sc.location || 'Peenya Industrial Hub'}</span>
                    </div>
                    {sc.phone && (
                      <div className="text-xs font-mono text-slate-700 mt-1">
                        {sc.phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Doorstep Pickup Ready</span>
                    <button
                      type="button"
                      onClick={() => onOpenChat(sc, undefined)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.chat}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 6: CPCB EPR COMPLIANCE LEDGER & GRIEVANCES */}
        {activeMenuTab === 'compliance' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{t.modRecCompliance.title}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t.modRecCompliance.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setComplaintTargetLot(null);
                  setIsComplaintModalOpen(true);
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>File Grievance / Dispute</span>
              </button>
            </div>

            {/* Completed Transactions with EPR Certificates */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                CPCB Validated Handover Certificates
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {transactions.filter(t => t.status === 'COMPLETED').map((tx) => (
                  <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">{tx.lot_reference_id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          EPR CERTIFIED
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 mt-1">
                        Material: <strong className="text-slate-900">{tx.category}</strong> • Weight: <strong className="text-emerald-700 font-mono">{tx.actual_weight || tx.estimated_weight} kg</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Scrapper: {tx.scrapper_name} • Settled: ₹{tx.final_payout?.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReceiptLot(tx)}
                        className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer shadow-2xs"
                      >
                        {t.downloadVoucher}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadEpr(tx)}
                        className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.downloadEpr}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 7: TRANSACTION PAYMENT HISTORY & SETTLEMENT DESK */}
        {activeMenuTab === 'payments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  <span>Transaction Payment History & Settlement Desk</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time database tracking of UPI Payouts, Cash on Pickup (COP), Cash on Delivery (COD), and Offline Zero-Network Vouchers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  CPCB Rule 13 Compliant
                </span>
              </div>
            </div>

            <TransactionPaymentHistoryView
              transactions={transactions}
              lang={lang}
              onSelectReceipt={(tx) => setReceiptLot(tx)}
              onOpenPaymentModal={(tx) => setSettlingPaymentLot(tx)}
            />
          </div>
        )}
      </div>

      {/* MODAL: MATERIAL INSPECTION & TRACEABLE HANDOVER PROTOCOL */}
      {inspectingLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t.scaleVerification}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lot: <strong className="text-slate-800 font-mono">{inspectingLot.lot_reference_id}</strong> • Scrapper: {inspectingLot.scrapper_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLot(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrap Sorting Checklist: Required vs Unrequired */}
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">{t.declaredWeight}:</span>
                    <span className="ml-1 text-emerald-800">
                      <strong className="font-mono text-emerald-900 text-sm">{inspectingLot.declared_weight ?? inspectingLot.estimated_weight} kg</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const w = (inspectingLot.declared_weight ?? inspectingLot.estimated_weight).toString();
                    setActualWeightInput(w);
                    setRequiredWeightInput(w);
                    setUnrequiredWeightInput('0');
                  }}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                >
                  Match Scale ({inspectingLot.declared_weight ?? inspectingLot.estimated_weight} kg)
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. Scrap Sorting Checklist & Weighment Scale
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-700 mb-1">
                      {t.requiredWeight}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={requiredWeightInput}
                      onChange={(e) => {
                        setRequiredWeightInput(e.target.value);
                        setActualWeightInput((parseFloat(e.target.value) || 0) + (parseFloat(unrequiredWeightInput) || 0) + '');
                      }}
                      className="w-full bg-white border border-emerald-300 rounded-md px-3 py-1.5 text-sm font-mono text-slate-900 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-700 mb-1">
                      {t.unrequiredWeight}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={unrequiredWeightInput}
                      onChange={(e) => {
                        setUnrequiredWeightInput(e.target.value);
                        setActualWeightInput((parseFloat(requiredWeightInput) || 0) + (parseFloat(e.target.value) || 0) + '');
                      }}
                      className="w-full bg-white border border-rose-300 rounded-md px-3 py-1.5 text-sm font-mono text-slate-900 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.actualWeight}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={actualWeightInput}
                      onChange={(e) => setActualWeightInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-mono text-emerald-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.contaminationDeduction}
                    </label>
                    <input
                      type="number"
                      value={contaminationDeduction}
                      onChange={(e) => setContaminationDeduction(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-mono text-rose-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Payout Calculation & Payment Mode */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  2. Settlement & Traceable Payout Record
                </span>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Buying Rate:</span>
                  <span className="font-mono font-bold text-slate-900">₹{inspectingLot.offered_rate_per_kg}/kg</span>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Net Settled Payout:</span>
                  <span className="font-mono text-xl font-black text-emerald-700">
                    ₹{Math.max(
                      0,
                      Math.round(
                        (parseFloat(requiredWeightInput) || 0) * (inspectingLot.offered_rate_per_kg || 0) -
                        (parseFloat(contaminationDeduction) || 0)
                      )
                    ).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.paymentMode}
                  </label>
                  <select
                    value={paymentModeInput}
                    onChange={(e) => setPaymentModeInput(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900"
                  >
                    <option value="UPI_DIGITAL">UPI Instant Digital Payout (VPA / PhonePe / GPay)</option>
                    <option value="CASH_ON_PICKUP">Cash on Pickup (COP - Logistics Driver)</option>
                    <option value="CASH_ON_DELIVERY">Cash on Delivery (COD - Yard Gate Counter)</option>
                    <option value="OFFLINE_PAYMENT">Offline Zero-Network Voucher (Traceable Slip)</option>
                    <option value="BANK_TRANSFER">NEFT / RTGS Direct Bank Deposit</option>
                    <option value="CASH">Cash Over Counter (Spot Physical Cash)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.notes}
                  </label>
                  <textarea
                    rows={2}
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInspectingLot(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer order-last sm:order-first"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                id="send-weight-verify-btn"
                onClick={handleSendWeightVerification}
                className="px-3 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Send verified weight to scrapper's app for approval before payout settlement"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Scale Weighment to Scrapper</span>
              </button>
              <button
                type="button"
                id="confirm-handover-btn"
                onClick={handleExecuteHandover}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.confirmAndGenerate}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL TRACEABLE HANDOVER RECEIPT / GATE PASS VOUCHER MODAL */}
      <DigitalReceiptModal
        lot={receiptLot}
        lang={lang}
        onClose={() => setReceiptLot(null)}
      />

      {/* GRIEVANCE & DISPUTE RESOLUTION MODAL */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        lang={lang}
        onClose={() => {
          setIsComplaintModalOpen(false);
          setComplaintTargetLot(null);
        }}
        currentUser={user}
        lot={complaintTargetLot}
      />

      {/* DISBURSEMENT / PAYMENT SETTLEMENT MODAL */}
      {settlingPaymentLot && (
        <PaymentSettlementModal
          lot={settlingPaymentLot}
          lang={lang}
          onClose={() => setSettlingPaymentLot(null)}
          onPaymentComplete={(updated) => {
            setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
            setReceiptLot(updated);
          }}
        />
      )}
    </div>
  );
};
