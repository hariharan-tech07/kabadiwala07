import React from 'react';
import { Transaction, User, VernacularLang } from '../../types';
import {
  FileCheck, Scale, IndianRupee, Clock, CheckCircle2, AlertTriangle,
  Download, QrCode, ArrowRight, ShieldCheck, FileText, Check, X
} from 'lucide-react';

interface BroadcastedLotsModuleProps {
  lots: Transaction[];
  user?: User;
  lang?: VernacularLang;
  onAcceptWeight: (lot: Transaction) => void;
  onDisputeWeight: (lot: Transaction) => void;
  onViewReceipt?: (lot: Transaction) => void;
  onOpenGatePass?: (lot: Transaction) => void;
  onOpenChat?: (recycler: { id: string; name: string; role: string; phone?: string }, lot?: Transaction) => void;
  onDownloadMonthlyStatement: () => void;
  onNavigateToCapture: () => void;
  onNavigateToHouseholdLots?: () => void;
  householdLotsCount?: number;
}

const UI_TEXT: Record<VernacularLang, {
  badge: string;
  moduleCounter: string;
  title: string;
  subtitle: string;
  monthlyStatement: string;
  noLotsTitle: string;
  noLotsDesc: string;
  createFirstLot: string;
  yourWeight: string;
  recyclerScale: string;
  awaitingScale: string;
  agreedRate: string;
  totalPayout: string;
  acceptWeight: string;
  dispute: string;
  digitalGatePass: string;
  statusAwaiting: string;
  statusCompleted: string;
  statusDisputed: string;
  statusActive: string;
}> = {
  en: {
    badge: 'Circular Traceability Registry',
    moduleCounter: 'Module 5 of 7',
    title: 'My Broadcasted E-Waste Lots & Traceability Status',
    subtitle: 'Track real-time weighbridge inspection results, verify scale consistency with certified recyclers, and download legally valid digital gate passes.',
    monthlyStatement: 'Monthly Statement (PDF)',
    noLotsTitle: 'No scrap lots broadcasted yet',
    noLotsDesc: 'Capture an image of your e-waste scrap in Module 2, lock your confirmed scale weight, and broadcast it to authorized recyclers.',
    createFirstLot: 'Create & Broadcast First Lot',
    yourWeight: 'Your Confirmed Weight:',
    recyclerScale: 'Recycler Scale:',
    awaitingScale: 'Awaiting Bench Scale',
    agreedRate: 'Agreed Rate:',
    totalPayout: 'Total Payout',
    acceptWeight: 'Accept Recycler Weight',
    dispute: 'Dispute',
    digitalGatePass: 'Digital Gate Pass',
    statusAwaiting: 'Recycler Weighed — Awaiting Your Approval',
    statusCompleted: 'Handover Completed & Paid',
    statusDisputed: 'Disputed Under CPCB Review',
    statusActive: 'Active on Recycler Grid'
  },
  hi: {
    badge: 'चक्रीय अनुरेखणीयता रजिस्ट्री',
    moduleCounter: 'मॉड्यूल 5 में से 7',
    title: 'मेरे प्रसारित ई-कचरा लॉट्स एवं अनुरेखण स्थिति',
    subtitle: 'वास्तविक समय में वजन सत्यापन परिणाम ट्रैक करें, अधिकृत रिसाइकलर के साथ वजन की पुष्टि करें और डिजिटल गेट पास डाउनलोड करें।',
    monthlyStatement: 'मासिक विवरण (PDF)',
    noLotsTitle: 'अभी तक कोई स्क्रैप लॉट प्रसारित नहीं हुआ',
    noLotsDesc: 'मॉड्यूल 2 में अपने ई-कचरे की फोटो लें, अपना काटा वजन लॉक करें और अधिकृत रिसाइकलर को प्रसारित करें।',
    createFirstLot: 'पहला लॉट बनाएं और प्रसारित करें',
    yourWeight: 'आपका पुष्ट वजन:',
    recyclerScale: 'रिसाइकलर काटा:',
    awaitingScale: 'काटा वजन की प्रतीक्षा है',
    agreedRate: 'तय दर:',
    totalPayout: 'कुल भुगतान',
    acceptWeight: 'रिसाइकलर का वजन स्वीकारें',
    dispute: 'विवाद दर्ज करें',
    digitalGatePass: 'डिजिटल गेट पास',
    statusAwaiting: 'रिसाइकलर द्वारा तौला गया — आपकी स्वीकृति प्रतीक्षित',
    statusCompleted: 'हस्तांतरण पूर्ण एवं भुगतान संपन्न',
    statusDisputed: 'सीपीसीबी समीक्षाधीन विवादित',
    statusActive: 'रिसाइकलर ग्रिड पर सक्रिय'
  },
  mr: {
    badge: 'सर्क्युलर ट्रेसिबिलिटी नोंदवही',
    moduleCounter: 'मॉड्यूल ५ पैकी ७',
    title: 'माझे प्रसारित ई-कचरा लॉट्स व स्थिती',
    subtitle: 'रिसायकलर्सकडील काटा वजन पडताळणी निकाल तपासा, काटा सुसंगतता मंजूर करा आणि कायदेशीर डिजिटल गेटपास मिळवा.',
    monthlyStatement: 'मासिक विवरण (PDF)',
    noLotsTitle: 'अद्याप कोणतेही स्क्रॅप लॉट्स पाठवलेले नाहीत',
    noLotsDesc: 'मॉड्यूल २ मध्ये तुमच्या ई-कचऱ्याचा फोटो घ्या, वजन लॉक करा आणि अधिकृत रिसायकलर्सना थेट पाठवा.',
    createFirstLot: 'पहिला लॉट तयार करा आणि पाठवा',
    yourWeight: 'तुमचे नोंदवलेले वजन:',
    recyclerScale: 'रिसायकलर काटा:',
    awaitingScale: 'काटा वजनाची प्रतीक्षा',
    agreedRate: 'ठरलेला दर:',
    totalPayout: 'एकूण मोबदला',
    acceptWeight: 'रिसायकलरचे वजन स्वीकारा',
    dispute: 'तक्रार / आक्षेप घ्या',
    digitalGatePass: 'डिजिटल गेटपास',
    statusAwaiting: 'रिसायकलरने वजन केले — तुमची मंजुरी प्रलंबित',
    statusCompleted: 'हस्तांतरण पूर्ण आणि पैसे जमा',
    statusDisputed: 'CPCB कडे वाद प्रलंबित',
    statusActive: 'रिसायकलर ग्रिडवर सक्रिय'
  },
  ta: {
    badge: 'சுழற்சி சுவடு கண்டறிதல் பதிவு',
    moduleCounter: 'பிரிவு 5 / 7',
    title: 'எனது மின்னணுக் கழிவு லாட்கள் மற்றும் நிலை',
    subtitle: 'மறுசுழற்சியாளர்களின் எடை சரிபார்ப்பு முடிவுகளை கண்காணிக்கவும் மற்றும் டிஜிட்டல் கேட் பாஸ்களை பதிவிறக்கவும்.',
    monthlyStatement: 'மாதாந்திர அறிக்கை (PDF)',
    noLotsTitle: 'இன்னும் எந்த கழிவு லாட்களும் அனுப்பப்படவில்லை',
    noLotsDesc: 'பிரிவு 2-ல் புகைப்படத்தை எடுத்து, உங்கள் எடையை உறுதிசெய்து அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்களுக்கு அனுப்பவும்.',
    createFirstLot: 'முதல் லாட்டை உருவாக்கி ஒளிபரப்பவும்',
    yourWeight: 'உங்கள் உறுதிப்படுத்தப்பட்ட எடை:',
    recyclerScale: 'மறுசுழற்சியாளர் எடை:',
    awaitingScale: 'எடை சரிபார்ப்புக்கு காத்திருக்கிறது',
    agreedRate: 'ஒப்புக்கொண்ட விலை:',
    totalPayout: 'மொத்த தொகை',
    acceptWeight: 'மறுசுழற்சி எடையை ஏற்கவும்',
    dispute: 'முரண்பாட்டை பதிவு செய்',
    digitalGatePass: 'டிஜிட்டல் கேட் பாஸ்',
    statusAwaiting: 'மறுசுழற்சியாளர் எடையிட்டார் — உங்கள் ஒப்புதலுக்கு காத்திருக்கிறது',
    statusCompleted: 'ஒப்படைப்பு முடிந்தது மற்றும் செலுத்தப்பட்டது',
    statusDisputed: 'CPCB மதிப்பாய்வில் முரண்பட்டது',
    statusActive: 'கட்டமைப்பில் செயலில் உள்ளது'
  }
};

export const BroadcastedLotsModule: React.FC<BroadcastedLotsModuleProps> = ({
  lots,
  user,
  lang = 'en',
  onAcceptWeight,
  onDisputeWeight,
  onViewReceipt,
  onOpenGatePass,
  onOpenChat,
  onDownloadMonthlyStatement,
  onNavigateToCapture,
  onNavigateToHouseholdLots,
  householdLotsCount = 0
}) => {
  const ui = UI_TEXT[lang] || UI_TEXT.en;
  const handleOpenReceipt = onViewReceipt || onOpenGatePass || (() => {});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WEIGHT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            {ui.statusAwaiting}
          </span>
        );
      case 'COMPLETED':
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {ui.statusCompleted}
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            {ui.statusDisputed}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {ui.statusActive}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Household Lots Quick Access Banner */}
      {onNavigateToHouseholdLots && (
        <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 p-4 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <span className="text-xl">🏠</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Household Citizen Scrap Lots (Doorstep Pickups)</h4>
                {householdLotsCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-blue-500 text-white">
                    {householdLotsCount} Available
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Nearby citizens have posted discarded copper wires, batteries, motors & electronics for doorstep collection.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="view-household-lots-from-scrapper-banner-btn"
            onClick={onNavigateToHouseholdLots}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View & Claim Household Lots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/90 p-5 sm:p-7 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 uppercase tracking-wider border border-emerald-500/30">
              {ui.badge}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{ui.moduleCounter}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            {ui.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
            {ui.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            id="download-monthly-pdf-btn"
            onClick={onDownloadMonthlyStatement}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer border border-slate-700 shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{ui.monthlyStatement}</span>
          </button>
        </div>
      </div>

      {/* Lots Content List */}
      {lots.length === 0 ? (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-12 text-center space-y-4 shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">{ui.noLotsTitle}</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {ui.noLotsDesc}
          </p>
          <button
            type="button"
            onClick={onNavigateToCapture}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>{ui.createFirstLot}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lots.map((lot) => {
            const confirmedWeight = lot.declared_weight ?? lot.estimated_weight;
            const isAwaitingVerification = lot.status === 'WEIGHT_VERIFIED';

            return (
              <div
                key={lot.id}
                className={`bg-slate-900/90 rounded-2xl border p-4 sm:p-6 shadow-xl transition-all backdrop-blur-md ${
                  isAwaitingVerification
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Lot Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                        Lot #{lot.lot_reference_id}
                      </span>
                      {getStatusBadge(lot.status)}
                      <span className="text-xs text-slate-400">
                        {new Date(lot.created_at).toLocaleDateString([], {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {lot.category}
                    </h4>

                    {/* Weight Comparison Grid */}
                    <div className="flex items-center gap-4 text-xs sm:text-sm pt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-400">{ui.yourWeight}</span>
                        <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {confirmedWeight} kg
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{ui.recyclerScale}</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                          lot.actual_weight
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {lot.actual_weight ? `${lot.actual_weight} kg` : ui.awaitingScale}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{ui.agreedRate}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ₹{lot.offered_rate_per_kg}/kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Payout */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 lg:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">{ui.totalPayout}</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                        ₹{(lot.final_payout || Math.round(confirmedWeight * lot.offered_rate_per_kg)).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isAwaitingVerification && (
                        <>
                          <button
                            type="button"
                            onClick={() => onAcceptWeight(lot)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{ui.acceptWeight}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDisputeWeight(lot)}
                            className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                          >
                            {ui.dispute}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(lot)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>{ui.digitalGatePass}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
