import React, { useState, useRef } from 'react';
import { Material, AIPredictionResult, Transaction, VernacularLang } from '../../types';
import {
  Camera, Upload, Sparkles, Scale, IndianRupee, CheckCircle2,
  AlertTriangle, RefreshCw, ArrowRight, Lock, Check, ShieldCheck,
  Eye, Zap, Layers, Info, Volume2
} from 'lucide-react';

import pcbImg from '../../assets/images/pcb_scrap_batch_1789436553690.jpg';
import copperImg from '../../assets/images/copper_wire_scrap_1789436573758.jpg';
import batteryImg from '../../assets/images/battery_scrap_batch_1789436587426.jpg';
import crtImg from '../../assets/images/crt_monitor_scrap_1789436600163.jpg';
import motorImg from '../../assets/images/electric_motor_scrap_1789436614480.jpg';
import plasticImg from '../../assets/images/plastic_scrap_batch_1789436629105.jpg';

interface ImageCaptureWeightModuleProps {
  materials: Material[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  weightKg: string;
  onChangeWeight: (weight: string) => void;
  imagePreview: string;
  onChangeImage: (base64: string, fileName: string, mimeType: string) => void;
  onSelectPreset: (catName: string, url: string) => void;
  isAnalyzing: boolean;
  aiResult: AIPredictionResult | null;
  onBroadcastLot: (confirmedWeight: number) => Promise<void>;
  isBroadcasting: boolean;
  onNavigateToLots: () => void;
  onNavigateToChat: () => void;
  onReanalyze?: () => void;
  onOpenSafetyGuidance?: () => void;
  lang?: VernacularLang;
}

const CAPTURE_TEXTS: Record<VernacularLang, {
  tag: string;
  moduleStep: string;
  title: string;
  desc: string;
  cameraBtn: string;
  uploadBtn: string;
  successTitle: (w: number) => string;
  successDesc: (w: number) => string;
  viewLotsBtn: string;
  chatBtn: string;
  visualInspection: string;
  analyzing: string;
  predictedGrade: string;
  certainty: string;
  identifiedComps: string;
  selectRealBatch: string;
  clickToClassify: string;
  categoryLabel: string;
  autoDetected: string;
  weightLabel: string;
  scaleSubtext: string;
  quickSet: string;
  estimatedTotal: string;
  cpcbFairPayout: string;
  safetyProtocol: string;
  scaleConfirmation: string;
  confirmedWeight: string;
  scaleLocked: string;
  unlockScale: string;
  antiDisputeTitle: string;
  antiDisputeDesc: (w: number) => string;
  broadcasting: string;
  broadcastBtn: (w: number) => string;
  clickOrDrop: string;
  changePhoto: string;
}> = {
  en: {
    tag: 'Gemini Vision & Neural Inspection',
    moduleStep: 'Module 2 of 7',
    title: 'Image Capture, Price Estimation & Certified Weight Confirmation',
    desc: 'Detect e-waste grade via Gemini Vision AI, calculate fair benchmark payout, and lock confirmed scale weighment so the recycler inspects the exact same weight.',
    cameraBtn: 'Take Camera Photo',
    uploadBtn: 'Upload Real Scrap Image',
    successTitle: (w) => `E-Waste Lot Broadcasted with Locked Weight (${w} kg)!`,
    successDesc: (w) => `The certified recycler will see this exact confirmed scale weighment (${w} kg) during inspection and gate pass verification.`,
    viewLotsBtn: 'View in Broadcasted Lots',
    chatBtn: 'Chat with Recycler',
    visualInspection: 'Visual Inspection Feed',
    analyzing: 'Gemini Vision Analyzing...',
    predictedGrade: 'Predicted Grade',
    certainty: 'Certainty',
    identifiedComps: 'Identified Scrap Components',
    selectRealBatch: 'Select Tested Real Scrap Batch:',
    clickToClassify: 'Click to classify',
    categoryLabel: 'E-Waste Scrap Category',
    autoDetected: 'Auto-detected by AI',
    weightLabel: 'Enter Lot Weight (Kilograms)',
    scaleSubtext: 'Certified electronic scale',
    quickSet: 'Quick set:',
    estimatedTotal: 'Estimated Total Benchmark Value',
    cpcbFairPayout: 'CPCB Fair Payout',
    safetyProtocol: 'Statutory Safety Protocol:',
    scaleConfirmation: 'Scale Weight Confirmation',
    confirmedWeight: 'Confirmed Scale Weight:',
    scaleLocked: 'Scale Locked',
    unlockScale: 'Unlock Scale',
    antiDisputeTitle: 'Anti-Dispute Guarantee:',
    antiDisputeDesc: (w) => `When the authorized recycler inspects this lot at the processing plant gate, their digital weighbridge/scale console will automatically initialize with this exact confirmed weighment of ${w} kg, preventing unfair weight deductions.`,
    broadcasting: 'Registering Confirmed Lot on Grid...',
    broadcastBtn: (w) => `Lock Weight (${w} kg) & Broadcast E-Waste Lot`,
    clickOrDrop: 'Click or Drop to Upload Image',
    changePhoto: 'Change photo'
  },
  hi: {
    tag: 'जेमिनी विज़न एवं न्यूरल निरीक्षण',
    moduleStep: 'मॉड्यूल 2 / 7',
    title: 'फोटो कैप्चर, मूल्य अनुमान और प्रमाणित वजन पुष्टि',
    desc: 'जेमिनी विज़न एआई से ई-कचरे की श्रेणी पहचानें, उचित न्यूनतम मूल्य की गणना करें, और प्रमाणित वजन लॉक करें ताकि रिसाइक्लर भी ठीक यही वजन स्वीकार करे।',
    cameraBtn: 'कैमरा से फोटो लें',
    uploadBtn: 'स्क्रैप फोटो अपलोड करें',
    successTitle: (w) => `लॉट सफलतापूर्वक लॉक वजन (${w} किग्रा) के साथ प्रसारित!`,
    successDesc: (w) => `अधिकृत रिसाइक्लर गेट पास और सत्यापन के समय ठीक यही वजन (${w} किग्रा) देखेगा।`,
    viewLotsBtn: 'प्रसारित लॉट देखें',
    chatBtn: 'रिसाइक्लर से चैट करें',
    visualInspection: 'दृश्य निरीक्षण फ़ीड',
    analyzing: 'जेमिनी विज़न विश्लेषण कर रहा है...',
    predictedGrade: 'अनुमानित श्रेणी',
    certainty: 'सटीकता',
    identifiedComps: 'पहचाने गए घटक',
    selectRealBatch: 'परीक्षण हेतु स्क्रैप लॉट चुनें:',
    clickToClassify: 'वर्गीकरण हेतु क्लिक करें',
    categoryLabel: 'ई-कचरा श्रेणी',
    autoDetected: 'एआई द्वारा स्वतः पहचानी गई',
    weightLabel: 'लॉट वजन दर्ज करें (किलोग्राम)',
    scaleSubtext: 'प्रमाणित इलेक्ट्रॉनिक कांटा',
    quickSet: 'त्वरित चयन:',
    estimatedTotal: 'अनुमानित कुल सरकारी मूल्य',
    cpcbFairPayout: 'CPCB उचित मूल्य',
    safetyProtocol: 'वैधानिक सुरक्षा प्रोटोकॉल:',
    scaleConfirmation: 'कांटा वजन पुष्टि',
    confirmedWeight: 'पुष्टीकृत कांटा वजन:',
    scaleLocked: 'कांटा लॉक है',
    unlockScale: 'कांटा अनलॉक करें',
    antiDisputeTitle: 'विवाद-रहित गारंटी:',
    antiDisputeDesc: (w) => `जब अधिकृत रिसाइक्लर प्लांट गेट पर इस लॉट का निरीक्षण करेगा, तो उनका डिजिटल कांटा स्वतः इसी ${w} किग्रा वजन के साथ खुलेगा, जिससे अनुचित वजन कटौती रोकी जा सकेगी।`,
    broadcasting: 'पुष्टीकृत लॉट ग्रिड पर दर्ज हो रहा है...',
    broadcastBtn: (w) => `वजन लॉक करें (${w} किग्रा) और लॉट प्रसारित करें`,
    clickOrDrop: 'फोटो अपलोड करने के लिए क्लिक करें',
    changePhoto: 'फोटो बदलें'
  },
  mr: {
    tag: 'जेमिनी व्हिजन व न्यूरल तपासणी',
    moduleStep: 'मॉड्यूल २ / ७',
    title: 'फोटो संकलन, अंदाजे दर आणि प्रमाणित वजन निश्चिती',
    desc: 'जेमिनी व्हिजन AI द्वारे ई-कचऱ्याचा प्रकार ओळखा, कायदेशीर हमीभावाची गणना करा आणि वजन लॉक करा जेणेकरून रिसायकलर तेच अचूक वजन स्वीकारेल.',
    cameraBtn: 'कॅमेरा फोटो घ्या',
    uploadBtn: 'स्क्रॅप फोटो अपलोड करा',
    successTitle: (w) => `लॉट लॉक वजनासह प्रसारित करण्यात आला (${w} किलो)!`,
    successDesc: (w) => `अधिकृत रिसायकलर गेट पास आणि तपासणी दरम्यान हेच अचूक वजन (${w} किलो) स्वीकारेल.`,
    viewLotsBtn: 'प्रसारित लॉट पहा',
    chatBtn: 'रिसायकलरशी चॅट करा',
    visualInspection: 'दृश्य तपासणी फीड',
    analyzing: 'जेमिनी व्हिजन विश्लेषण करत आहे...',
    predictedGrade: 'ओळखलेला प्रकार',
    certainty: 'अचूकता',
    identifiedComps: 'ओळखलेले सुटे भाग',
    selectRealBatch: 'तपासणीसाठी प्रत्यक्ष स्क्रॅप निवडा:',
    clickToClassify: 'वर्गीकरणासाठी क्लिक करा',
    categoryLabel: 'ई-कचरा प्रवर्ग',
    autoDetected: 'AI द्वारे स्वयंचलित निवड',
    weightLabel: 'लॉटचे वजन नोंदवा (किलो)',
    scaleSubtext: 'प्रमाणित इलेक्ट्रॉनिक वजनकाटा',
    quickSet: 'जलद निवड:',
    estimatedTotal: 'अंदाजे एकूण CPCB मूल्य',
    cpcbFairPayout: 'CPCB कायदेशीर दर',
    safetyProtocol: 'कायदेशीर सुरक्षा नियम:',
    scaleConfirmation: 'वजनकाटा पुष्टीकरण',
    confirmedWeight: 'निश्चित केलेले वजन:',
    scaleLocked: 'काटा लॉक आहे',
    unlockScale: 'काटा अनलॉक करा',
    antiDisputeTitle: 'तक्रार-मुक्त हमी:',
    antiDisputeDesc: (w) => `जेव्हा रिसायकलर प्रक्रिया केंद्राच्या प्रवेशद्वारावर हा लॉट तपासेल, तेव्हा त्यांच्या डिजिटल वजन काट्यावर थेट हेच ${w} किलो वजन येईल, ज्यामुळे कोणतीही फसवणूक होणार नाही.`,
    broadcasting: 'निश्चित केलेला लॉट ग्रिडवर नोंदवला जात आहे...',
    broadcastBtn: (w) => `वजन लॉक करा (${w} किलो) आणि लॉट प्रसारित करा`,
    clickOrDrop: 'फोटो अपलोड करण्यासाठी क्लिक करा',
    changePhoto: 'फोटो बदला'
  },
  ta: {
    tag: 'ஜெமினி விஷன் & நரம்பியல் ஆய்வு',
    moduleStep: 'தொகுதி 2 / 7',
    title: 'புகைப்படம் எடுத்தல், விலை மதிப்பீடு & சான்றளிக்கப்பட்ட எடை உறுதிப்படுத்தல்',
    desc: 'ஜெமினி விஷன் ஏஐ மூலம் மின்-கழிவின் தரத்தைக் கண்டறிந்து, நியாயமான விலையைக் கணக்கிட்டு, சான்றளிக்கப்பட்ட எடையைப் பூட்டுங்கள்.',
    cameraBtn: 'கேமரா புகைப்படம் எடு',
    uploadBtn: 'ஸ்கிராப் படத்தை பதிவேற்று',
    successTitle: (w) => `பூட்டப்பட்ட எடையுடன் பொருள் ஒளிபரப்பப்பட்டது (${w} கிலோ)!`,
    successDesc: (w) => `அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர் பரிசோதனை மற்றும் கேட் பாஸ் சரிபார்ப்பின் போது இந்த சரியான எடையை (${w} கிலோ) காண்பார்.`,
    viewLotsBtn: 'பொருட்களைப் பார்க்கவும்',
    chatBtn: 'மறுசுழற்சியாளருடன் அரட்டையடிக்கவும்',
    visualInspection: 'பார்வை ஆய்வு ஊட்டல்',
    analyzing: 'ஜெமினி விஷன் பகுப்பாய்வு செய்கிறது...',
    predictedGrade: 'கணிக்கப்பட்ட வகை',
    certainty: 'உறுதிப்பாடு',
    identifiedComps: 'கண்டறியப்பட்ட பாகங்கள்',
    selectRealBatch: 'சோதிக்கப்பட்ட தொகுப்பைத் தேர்ந்தெடுக்கவும்:',
    clickToClassify: 'வகைப்படுத்த கிளிக் செய்க',
    categoryLabel: 'மின்-கழிவு வகை',
    autoDetected: 'ஏஐ மூலம் கண்டறியப்பட்டது',
    weightLabel: 'பொருளின் எடையை உள்ளிடவும் (கிலோ)',
    scaleSubtext: 'சான்றளிக்கப்பட்ட மின்னணு தராசு',
    quickSet: 'விரைவு தேர்வு:',
    estimatedTotal: 'மதிப்பிடப்பட்ட மொத்த அரசு மதிப்பு',
    cpcbFairPayout: 'CPCB நியாயமான விலை',
    safetyProtocol: 'பாதுகாப்பு நெறிமுறை:',
    scaleConfirmation: 'தராசு எடை உறுதிப்படுத்தல்',
    confirmedWeight: 'உறுதிப்படுத்தப்பட்ட தராசு எடை:',
    scaleLocked: 'தராசு பூட்டப்பட்டது',
    unlockScale: 'தராசைத் திறக்கவும்',
    antiDisputeTitle: 'சர்ச்சை எதிர்ப்பு உத்தரவாதம்:',
    antiDisputeDesc: (w) => `அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர் ஆலையின் நுழைவாயிலில் இந்த பொருளைப் பரிசோதிக்கும் போது, அவர்களின் டிஜிட்டல் தராசு தானாகவே இந்த ${w} கிலோ எடையுடன் தொடங்கும்.`,
    broadcasting: 'உறுதிப்படுத்தப்பட்ட பொருள் பதிவு செய்யப்படுகிறது...',
    broadcastBtn: (w) => `எடையைப் பூட்டுக (${w} கிலோ) & பொருளை ஒளிபரப்புக`,
    clickOrDrop: 'படத்தைப் பதிவேற்ற கிளிக் செய்யவும்',
    changePhoto: 'படத்தை மாற்றவும்'
  }
};

const SAMPLE_PRESETS = [
  {
    name: 'PCB (Printed Circuit Boards)',
    url: pcbImg,
    desc: 'Telecom & PC Motherboards'
  },
  {
    name: 'Copper Wires/Cables',
    url: copperImg,
    desc: 'Stripped Wire & Industrial Power Cables'
  },
  {
    name: 'Lead/Li-ion Batteries',
    url: batteryImg,
    desc: 'Cylindrical 18650 & Pouch Packs'
  },
  {
    name: 'CRT Glass & Monitors',
    url: crtImg,
    desc: 'Heavy Tube Displays & Funnel Glass'
  },
  {
    name: 'Electric Motors & Transformers',
    url: motorImg,
    desc: 'Copper Stator Coils & Alternators'
  },
  {
    name: 'Mixed Rigid Plastics',
    url: plasticImg,
    desc: 'ABS/HIPS Monitor & Printer Housings'
  }
];

export const ImageCaptureWeightModule: React.FC<ImageCaptureWeightModuleProps> = ({
  materials,
  selectedCategory,
  onSelectCategory,
  weightKg,
  onChangeWeight,
  imagePreview,
  onChangeImage,
  onSelectPreset,
  isAnalyzing,
  aiResult,
  onBroadcastLot,
  isBroadcasting,
  onNavigateToLots,
  onNavigateToChat,
  onReanalyze,
  onOpenSafetyGuidance,
  lang = 'en'
}) => {
  const tCap = CAPTURE_TEXTS[lang] || CAPTURE_TEXTS.en;
  // Weight confirmation state - ensuring recycler scale matches
  const [isWeightConfirmed, setIsWeightConfirmed] = useState(true);
  const [broadcastedSuccess, setBroadcastedSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const numericWeight = parseFloat(weightKg) || 10;
  const currentMaterial = materials.find(m => m.category === selectedCategory);
  const baseRate = currentMaterial?.base_rate_per_kg || 340;
  const estimatedMin = Math.round(numericWeight * (aiResult?.estimated_rate_per_kg_min || baseRate * 0.95));
  const estimatedMax = Math.round(numericWeight * (aiResult?.estimated_rate_per_kg_max || baseRate * 1.12));

  // Clean confidence percentage formatting
  const displayConfidence = aiResult?.confidence
    ? (aiResult.confidence <= 1 ? Math.round(aiResult.confidence * 1000) / 10 : Math.round(aiResult.confidence * 10) / 10)
    : 96.5;

  const handleAdjustWeight = (delta: number) => {
    const current = parseFloat(weightKg) || 0;
    const next = Math.max(1, Math.round((current + delta) * 10) / 10);
    onChangeWeight(next.toString());
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onChangeImage(base64, file.name, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleExecuteBroadcast = async () => {
    await onBroadcastLot(numericWeight);
    setBroadcastedSuccess(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hidden File and Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              {tCap.tag}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{tCap.moduleStep}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {tCap.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            {tCap.desc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>{tCap.cameraBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{tCap.uploadBtn}</span>
          </button>
        </div>
      </div>

      {/* Broadcast Success Notice */}
      {broadcastedSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-emerald-950">
                {tCap.successTitle(numericWeight)}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800">
                {tCap.successDesc(numericWeight)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onNavigateToLots}
              className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {tCap.viewLotsBtn}
            </button>
            <button
              type="button"
              onClick={onNavigateToChat}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {tCap.chatBtn}
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Left Image Capture & AI; Right Weight Entry & Confirmation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Preview & AI Detection (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {tCap.visualInspection}
              </span>
              {isAnalyzing ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {tCap.analyzing}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                    aiResult?.source === 'gemini_vision'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    {aiResult?.source === 'gemini_vision' ? 'Gemini Vision AI' : 'Vision Engine'}
                  </span>
                  {onReanalyze && (
                    <button
                      type="button"
                      onClick={onReanalyze}
                      title="Re-analyze image with Gemini AI"
                      className="text-xs text-slate-500 hover:text-emerald-700 p-1 rounded hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Image Box with Drag & Drop and Click to Upload */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border-2 transition-all cursor-pointer group ${
                isDragging
                  ? 'border-emerald-500 ring-4 ring-emerald-400/20'
                  : 'border-slate-200 hover:border-emerald-400'
              }`}
              title="Click or drag & drop to replace scrap image"
            >
              <img
                src={imagePreview}
                alt="Scrap Lot Sample"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Bounding box overlays */}
              {aiResult?.detected_boxes && aiResult.detected_boxes.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {aiResult.detected_boxes.map((box, idx) => (
                    <div
                      key={idx}
                      className="absolute border-2 border-emerald-400 bg-emerald-500/20 rounded shadow-sm text-[10px] font-black text-white px-1.5 py-0.5"
                      style={{
                        top: `${box.y}%`,
                        left: `${box.x}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`
                      }}
                    >
                      <span className="bg-slate-950/85 px-1 py-0.2 rounded border border-emerald-400/60 inline-block truncate max-w-full">
                        {box.label} ({box.confidence > 1 ? Math.round(box.confidence) : Math.round(box.confidence * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Hint Bar on Hover */}
              <div className="absolute top-2 left-2 right-2 bg-slate-950/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{tCap.clickOrDrop}</span>
                <span className="text-emerald-400 font-bold">{tCap.changePhoto}</span>
              </div>

              {/* Bottom Prediction Bar */}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white p-2.5 rounded-lg flex items-center justify-between text-xs border border-white/10">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    {tCap.predictedGrade}
                  </span>
                  <span className="font-bold truncate block text-emerald-300 text-sm">
                    {aiResult?.category || selectedCategory}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-emerald-400 font-black text-sm">
                    {displayConfidence}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">{tCap.certainty}</span>
                </div>
              </div>
            </div>

            {/* Detected Subcategories & Tags */}
            {aiResult?.subcategories_detected && aiResult.subcategories_detected.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <Layers className="w-3 h-3 text-emerald-600" />
                  {tCap.identifiedComps}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.subcategories_detected.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preset Samples (All 6 Genuine CPCB Categories) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  {tCap.selectRealBatch}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{tCap.clickToClassify}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PRESETS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPreset(sample.name, sample.url);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                      selectedCategory === sample.name
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/50 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200 mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{sample.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{sample.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weight Entering & Weight Confirmation (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            
            {/* Category Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>{tCap.categoryLabel}</span>
                <span className="text-xs text-emerald-700 font-semibold">{tCap.autoDetected}</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.category}>
                    {m.category} (CPCB Benchmark: ₹{m.base_rate_per_kg}/kg)
                  </option>
                ))}
              </select>
            </div>

            {/* Weight Entering with Quick Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>{tCap.weightLabel}</span> <span className="text-emerald-600">*</span>
                </label>
                <span className="text-xs text-slate-500 font-semibold">{tCap.scaleSubtext}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(-5)}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Decrease 5 kg"
                >
                  -5
                </button>

                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => onChangeWeight(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-emerald-500 rounded-xl px-4 py-3.5 text-2xl font-mono font-black text-slate-950 text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-500">
                    KG
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustWeight(5)}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Increase 5 kg"
                >
                  +5
                </button>
              </div>

              {/* Quick weight shortcut pills */}
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-xs font-semibold text-slate-500">{tCap.quickSet}</span>
                {[5, 10, 25, 50, 100].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChangeWeight(w.toString())}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      weightKg === w.toString()
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Fair Price Range Estimation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  {tCap.estimatedTotal}
                </span>
                <span className="text-xs text-slate-500">
                  Based on ₹{aiResult?.estimated_rate_per_kg_min || Math.round(baseRate * 0.95)} - ₹{aiResult?.estimated_rate_per_kg_max || Math.round(baseRate * 1.12)}/kg
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-emerald-800 flex items-center justify-end gap-1">
                  <span>₹{estimatedMin.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm font-normal">–</span>
                  <span>₹{estimatedMax.toLocaleString()}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {tCap.cpcbFairPayout}
                </span>
              </div>
            </div>

            {/* Safety Protocol Note if detected */}
            {aiResult && (
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs leading-relaxed shadow-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">{tCap.safetyProtocol} </strong>
                    <span>{aiResult.recommended_safety_protocol || 'Statutory CPCB handling precautions apply for this scrap category.'}</span>
                  </div>
                </div>
                {onOpenSafetyGuidance && (
                  <button
                    type="button"
                    onClick={onOpenSafetyGuidance}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'सुरक्षा गाइड (आवाज़)' : lang === 'mr' ? 'सुरक्षा नियम (आवाज)' : lang === 'ta' ? 'பாதுகாப்பு வழிகாட்டி (குரல்)' : 'Safety Guidance (Voice)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* WEIGHT CONFIRMATION & SCALE LOCK (USER REQUIREMENT) */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-200 text-amber-900">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                      {tCap.scaleConfirmation}
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      {tCap.confirmedWeight} <span className="text-emerald-800 font-mono text-lg">{numericWeight} kg</span>
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWeightConfirmed(!isWeightConfirmed)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isWeightConfirmed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isWeightConfirmed ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{isWeightConfirmed ? tCap.scaleLocked : tCap.unlockScale}</span>
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200">
                <p className="flex items-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{tCap.antiDisputeTitle}</strong> {tCap.antiDisputeDesc(numericWeight)}
                  </span>
                </p>
              </div>
            </div>

            {/* Final Broadcast Action Button */}
            <button
              type="button"
              id="scrapper-broadcast-lot-btn"
              disabled={isBroadcasting}
              onClick={handleExecuteBroadcast}
              className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isBroadcasting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{tCap.broadcasting}</span>
                </>
              ) : (
                <>
                  <Scale className="w-5 h-5" />
                  <span>{tCap.broadcastBtn(numericWeight)}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
