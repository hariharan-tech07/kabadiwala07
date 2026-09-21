import React, { useState } from 'react';
import { Complaint, Transaction, User, VernacularLang } from '../../types';
import { translations } from '../../translations';
import {
  ShieldAlert,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  FileText,
  Search,
  Building2,
  Download,
  ExternalLink,
  Info,
  Scale,
  DollarSign,
  PhoneCall
} from 'lucide-react';
import { generateLegalNoticePdf } from '../../utils/pdfGenerator';

interface ScrapperComplaintsModuleProps {
  user: User;
  lang: VernacularLang;
  complaints: Complaint[];
  myLots: Transaction[];
  onOpenNewComplaintModal: (lot?: Transaction | null) => void;
  onViewLotReceipt?: (lot: Transaction) => void;
  onOpenChatWithRecycler?: (recycler: { id: string; name: string; role: string }) => void;
}

const SCRAPPER_COMPLAINT_TEXTS: Record<VernacularLang, {
  title: string;
  rule13: string;
  desc: string;
  fileNew: string;
  totalGrievances: string;
  underInvestigation: string;
  actionTaken: string;
  escalatedLegal: string;
  spcbActive: string;
  payoutCredited: string;
  section15Notice: string;
  searchPlaceholder: string;
  tabs: { ALL: string; PENDING: string; IN_REVIEW: string; RESOLVED: string; ESCALATED: string };
  noGrievances: string;
  noGrievancesDesc: string;
  fileGrievanceBtn: string;
  respondent: string;
  filed: string;
  complainant: string;
  incidentReport: string;
  ombudsmanRedressal: string;
  viewVoucher: string;
  chatFacility: string;
  downloadNotice: string;
  statutoryRights: string;
  right1Title: string;
  right1Desc: string;
  right2Title: string;
  right2Desc: string;
}> = {
  en: {
    title: 'Statutory Grievance & Dispute Redressal Desk',
    rule13: 'Rule 13 Protected',
    desc: 'Statutory protections under E-Waste Rules 2022. Direct ombudsman tribunal for unfair scale deductions, price slashing, or delayed payments.',
    fileNew: '+ File New Grievance',
    totalGrievances: 'Total Grievances',
    underInvestigation: 'Under Investigation',
    actionTaken: 'Action Taken / Reconciled',
    escalatedLegal: 'Escalated to Legal',
    spcbActive: 'SPCB Field Inspector active',
    payoutCredited: 'Goodwill payout credited',
    section15Notice: 'Section 15 notice issued',
    searchPlaceholder: 'Search by docket ID, recycler, or lot...',
    tabs: { ALL: 'All', PENDING: 'Pending', IN_REVIEW: 'In Review', RESOLVED: 'Resolved', ESCALATED: 'Escalated' },
    noGrievances: 'No Open Grievances Found',
    noGrievancesDesc: 'All your verified transactions have proceeded smoothly without recorded disputes. File a grievance anytime you encounter underweighting or unfair trade.',
    fileGrievanceBtn: 'File a New Grievance',
    respondent: 'Respondent:',
    filed: 'Filed:',
    complainant: 'Complainant:',
    incidentReport: 'Collector Incident Report:',
    ombudsmanRedressal: 'CPCB Ombudsman & Regulatory Redressal:',
    viewVoucher: 'View Linked Lot Voucher',
    chatFacility: 'Chat with Facility',
    downloadNotice: 'Download Grievance Notice (PDF)',
    statutoryRights: 'Statutory Rights of Waste Collectors (E-Waste Rules 2022)',
    right1Title: '1. Certified Benchmark Weighment',
    right1Desc: 'Facilities must display mechanical tare calibration before lot loading. Arbitrary deductions without inspection are illegal.',
    right2Title: '2. Direct Digital UPI Settlement',
    right2Desc: 'Upon weighment sign-off, statutory fair floor rate must be credited to your verified UPI handle within 15 minutes.'
  },
  hi: {
    title: 'वैधानिक शिकायत एवं विवाद निवारण डेस्क',
    rule13: 'नियम 13 द्वारा संरक्षित',
    desc: 'ई-कचरा नियम 2022 के तहत वैधानिक सुरक्षा। वजन कटौती, मनमानी दर या देर से भुगतान के खिलाफ सीधा लोकपाल ट्रिब्यूनल।',
    fileNew: '+ नई शिकायत दर्ज करें',
    totalGrievances: 'कुल दर्ज शिकायतें',
    underInvestigation: 'जांच जारी (In Review)',
    actionTaken: 'निस्तारित / मुआवजा स्वीकृत',
    escalatedLegal: 'कानूनी कार्रवाई (Escalated)',
    spcbActive: 'SPCB फील्ड निरीक्षक सक्रिय',
    payoutCredited: 'मुआवजा राशि जमा',
    section15Notice: 'धारा 15 नोटिस जारी',
    searchPlaceholder: 'डॉकैट आईडी, रीसायकलर या लॉट खोजें...',
    tabs: { ALL: 'सभी', PENDING: 'दर्ज', IN_REVIEW: 'जांच जारी', RESOLVED: 'निस्तारित', ESCALATED: 'कानूनी कार्रवाई' },
    noGrievances: 'कोई लंबित शिकायत नहीं मिली',
    noGrievancesDesc: 'आपके सभी सत्यापित लेनदेन बिना किसी विवाद के सुचारू रूप से पूरे हुए हैं। वजन में हेराफेरी या धोखाधड़ी होने पर तुरंत शिकायत दर्ज करें।',
    fileGrievanceBtn: 'शिकायत दर्ज करें',
    respondent: 'प्रतिवादी (रीसायकलर):',
    filed: 'दर्ज तिथि:',
    complainant: 'शिकायतकर्ता:',
    incidentReport: 'घटना विवरण / शिकायत विवरण:',
    ombudsmanRedressal: 'CPCB लोकपाल एवं विनियामक निर्णय:',
    viewVoucher: 'संबद्ध लॉट रसीद देखें',
    chatFacility: 'रीसायकलर से बात करें',
    downloadNotice: 'वैधानिक नोटिस (PDF) डाउनलोड करें',
    statutoryRights: 'कचरा संग्राहकों के वैधानिक अधिकार (ई-कचरा नियम 2022)',
    right1Title: '1. प्रमाणित कांटे पर सटीक वजन का अधिकार',
    right1Desc: 'तौलने से पहले कांटे का डिजिटल शून्य (Tare) दिखाना अनिवार्य है। बिना सत्यापन मनमानी कटौती अवैध है।',
    right2Title: '2. 15 मिनट में डिजिटल यूपीआई भुगतान',
    right2Desc: 'वजन सत्यापन के 15 मिनट के भीतर आधार-लिंक्ड यूपीआई पर न्यूनतम आधार मूल्य का भुगतान अनिवार्य है।'
  },
  mr: {
    title: 'तक्रार व मध्यस्थी कक्ष (CPCB Grievance Desk)',
    rule13: 'नियम १३ नुसार संरक्षित',
    desc: 'ई-कचरा नियम २०२२ अंतर्गत वैधानिक संरक्षण. अनधिकृत खरेदीदार, वजन कपात किंवा पेमेंट उशिराविरुद्ध थेट लोकपाल मध्यस्थी.',
    fileNew: '+ नवीन तक्रार नोंदवा',
    totalGrievances: 'एकूण नोंदवलेल्या तक्रारी',
    underInvestigation: 'चौकशी सुरू (In Review)',
    actionTaken: 'निकाली / मोबदला मंजूर',
    escalatedLegal: 'कायदेशीर कारवाई (Escalated)',
    spcbActive: 'SPCB क्षेत्र निरीक्षक सक्रिय',
    payoutCredited: 'मोबदला खात्यात जमा',
    section15Notice: 'कलम १५ नुसार नोटीस जारी',
    searchPlaceholder: 'तक्रार, लॉट किंवा रिसायकलर शोधा...',
    tabs: { ALL: 'सर्व', PENDING: 'नोंदवलेली', IN_REVIEW: 'तपासणी सुरू', RESOLVED: 'निकाली', ESCALATED: 'कायदेशीर कारवाई' },
    noGrievances: 'कोणतीही प्रलंबित तक्रार नाही',
    noGrievancesDesc: 'आपल्या लॉट व्यवहारांमध्ये कोणतीही फसवणूक किंवा वजन कपात झाल्यास आपण इथे तक्रार दाखल करू शकता.',
    fileGrievanceBtn: 'तक्रार दाखल करा',
    respondent: 'प्रतिवादी (रिसायकलर):',
    filed: 'नोंदणी तारीख:',
    complainant: 'तक्रारदार:',
    incidentReport: 'तक्रारीचा सविस्तर तपशील:',
    ombudsmanRedressal: 'CPCB लोकपाल व प्रशासकीय निर्णय:',
    viewVoucher: 'लॉट पावती पहा',
    chatFacility: 'रिसायकलरशी चर्चा',
    downloadNotice: 'अधिकृत नोटीस (PDF)',
    statutoryRights: 'कचरा वेचकांचे वैधानिक हक्क (E-Waste Rules 2022)',
    right1Title: '१. प्रमाणित काट्यावरच वजन करण्याचा हक्क',
    right1Desc: 'रिसायकलरने वजन करण्यापूर्वी काट्याचा डिजिटल झीरो (Tare) दाखवणे बंधनकारक आहे.',
    right2Title: '२. थेट डिजिटल UPI मोबदला',
    right2Desc: 'लॉट स्वीकारल्यानंतर १५ मिनिटांत आधार-संलग्न UPI वर मोबदला जमा होणे कायद्याने अनिवार्य आहे.'
  },
  ta: {
    title: 'சட்டரீதியான குறைதீர்ப்பு & மத்தியஸ்த மேடை',
    rule13: 'விதி 13 மூலம் பாதுகாக்கப்பட்டது',
    desc: 'மின்னணுக் கழிவு விதிகள் 2022 இன் கீழ் சட்டப் பாதுகாப்பு. எடை குறைப்பு, விலை குறைப்பு அல்லது தாமதமான பணப்பட்டுவாடாவுக்கு நேரடி தீர்வு.',
    fileNew: '+ புதிய குறைபாடு பதிவு செய்',
    totalGrievances: 'மொத்த புகார்கள்',
    underInvestigation: 'விசாரணையில் உள்ளது',
    actionTaken: 'நடவடிக்கை எடுக்கப்பட்டது',
    escalatedLegal: 'சட்டரீதியான நடவடிக்கை',
    spcbActive: 'SPCB கள ஆய்வாளர் பணியில்',
    payoutCredited: 'இழப்பீடு வழங்கப்பட்டது',
    section15Notice: 'பிரிவு 15 நோட்டீஸ் வழங்கப்பட்டது',
    searchPlaceholder: 'எண், மறுசுழற்சியாளர் அல்லது லாட் தேடுங்கள்...',
    tabs: { ALL: 'அனைத்தும்', PENDING: 'நிலுவையில்', IN_REVIEW: 'விசாரணையில்', RESOLVED: 'தீர்க்கப்பட்டது', ESCALATED: 'சட்ட நடவடிக்கை' },
    noGrievances: 'நிலுவையில் உள்ள புகார்கள் இல்லை',
    noGrievancesDesc: 'உங்கள் அனைத்து பரிவர்த்தனைகளும் சுமுகமாக முடிந்துள்ளன. எடை ஏமாற்றுதல் அல்லது அநீதி ஏற்படும் போது உடனடியாக புகார் அளிக்கலாம்.',
    fileGrievanceBtn: 'புகார் பதிவு செய்க',
    respondent: 'எதிர்மனுதாரர்:',
    filed: 'பதிவு தேதி:',
    complainant: 'புகார்தாரர்:',
    incidentReport: 'சம்பவ அறிக்கை / விவரம்:',
    ombudsmanRedressal: 'CPCB மத்தியஸ்தர் மற்றும் ஒழுங்குமுறை முடிவு:',
    viewVoucher: 'லாட் ரசீதைப் பார்க்கவும்',
    chatFacility: 'மையத்துடன் அரட்டையடிக்கவும்',
    downloadNotice: 'சட்ட நோட்டீஸ் (PDF) பதிவிறக்கு',
    statutoryRights: 'கழிவு சேகரிப்பாளர்களின் சட்ட உரிமைகள் (E-Waste Rules 2022)',
    right1Title: '1. துல்லியமான எடை போடும் உரிமை',
    right1Desc: 'எடை போடுவதற்கு முன் டிஜிட்டல் பூஜ்ஜியத்தைக் (Tare) காட்டுவது கட்டாயமாகும்.',
    right2Title: '2. நேரடி டிஜிட்டல் UPI பணம் செலுத்துதல்',
    right2Desc: 'எடை சரிபார்க்கப்பட்ட 15 நிமிடங்களுக்குள் அங்கீகரிக்கப்பட்ட UPI மூலம் பணம் வழங்கப்பட வேண்டும்.'
  }
};

export const ScrapperComplaintsModule: React.FC<ScrapperComplaintsModuleProps> = ({
  user,
  lang,
  complaints,
  myLots,
  onOpenNewComplaintModal,
  onViewLotReceipt,
  onOpenChatWithRecycler
}) => {
  const t = translations[lang] || translations.en;
  const tCmp = SCRAPPER_COMPLAINT_TEXTS[lang] || SCRAPPER_COMPLAINT_TEXTS.en;
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Filter complaints for this scrapper (or show initial mock complaints for Ramesh Kumar demo)
  const userComplaints = complaints.filter(c => {
    if (!c) return false;
    const matchesUser =
      c.complainant_id === user.id ||
      c.complainant_name?.toLowerCase() === user.name?.toLowerCase() ||
      user.role === 'scrapper'; // Allow seeing field ombudsman cases for transparent demo
    return matchesUser;
  });

  const filtered = userComplaints.filter(c => {
    const rawStatus = (c.status || '').toUpperCase();
    if (filterStatus === 'PENDING') {
      if (rawStatus !== 'SUBMITTED' && rawStatus !== 'PENDING') return false;
    } else if (filterStatus === 'IN_REVIEW') {
      if (!rawStatus.includes('REVIEW') && !rawStatus.includes('INVESTIGAT')) return false;
    } else if (filterStatus === 'RESOLVED') {
      if (!rawStatus.includes('RESOLVED') && !rawStatus.includes('ACTION') && !rawStatus.includes('CLOSED')) return false;
    } else if (filterStatus === 'ESCALATED') {
      if (!rawStatus.includes('ESCALAT') && !rawStatus.includes('LEGAL')) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${c.id} ${c.type || ''} ${c.complaint_type || ''} ${c.respondent_name || ''} ${c.description || ''} ${c.lot_reference_id || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const totalOpen = userComplaints.filter(c => {
    const s = (c.status || '').toUpperCase();
    return s.includes('REVIEW') || s === 'SUBMITTED' || s === 'PENDING';
  }).length;

  const totalResolved = userComplaints.filter(c => {
    const s = (c.status || '').toUpperCase();
    return s.includes('RESOLVED') || s.includes('ACTION') || s.includes('CLOSED');
  }).length;

  const totalEscalated = userComplaints.filter(c => {
    const s = (c.status || '').toUpperCase();
    return s.includes('ESCALAT') || s.includes('LEGAL');
  }).length;

  const handleExportNotice = (c: Complaint) => {
    generateLegalNoticePdf({
      case_file_number: c.case_number || c.id,
      case_number: c.case_number || c.id,
      case_title: `Statutory Grievance: ${c.type || c.complaint_type || 'Dispute'} against ${c.respondent_name}`,
      respondent_name: c.respondent_name,
      respondent_type: c.respondent_role || 'RECYCLER',
      allegation_type: c.type || c.complaint_type || 'Unfair Deduction',
      summary: c.description,
      fine_amount_inr: c.penalty_imposed_inr || 15000,
      status: c.status,
      created_at: c.created_at,
      filing_date: c.created_at
    });
  };

  return (
    <div className="space-y-6">
      {/* Statutory Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {tCmp.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {tCmp.rule13}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tCmp.desc}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              id="scrapper-file-complaint-btn"
              onClick={() => onOpenNewComplaintModal(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{tCmp.fileNew}</span>
            </button>

            <a
              href="tel:1800118005"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              title="CPCB National E-Waste Helpline (Toll-Free)"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
              <span>1800-11-8005</span>
            </a>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {tCmp.totalGrievances}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {userComplaints.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              CPCB Central Docket
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              {tCmp.underInvestigation}
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {totalOpen}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{tCmp.spcbActive}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              {tCmp.actionTaken}
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {totalResolved}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{tCmp.payoutCredited}</span>
            </div>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              {tCmp.escalatedLegal}
            </div>
            <div className="text-2xl font-bold text-rose-900 mt-1">
              {totalEscalated}
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5 flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              <span>{tCmp.section15Notice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={tCmp.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {[
            { id: 'ALL', label: tCmp.tabs.ALL },
            { id: 'PENDING', label: tCmp.tabs.PENDING },
            { id: 'IN_REVIEW', label: tCmp.tabs.IN_REVIEW },
            { id: 'RESOLVED', label: tCmp.tabs.RESOLVED },
            { id: 'ESCALATED', label: tCmp.tabs.ESCALATED }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {tCmp.noGrievances}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {tCmp.noGrievancesDesc}
          </p>
          <button
            type="button"
            onClick={() => onOpenNewComplaintModal(null)}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{tCmp.fileGrievanceBtn}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => {
            const statusUpper = (c.status || '').toUpperCase();
            const isResolved = statusUpper.includes('RESOLVED') || statusUpper.includes('ACTION') || statusUpper.includes('CLOSED');
            const isEscalated = statusUpper.includes('ESCALAT') || statusUpper.includes('LEGAL');
            const isInReview = statusUpper.includes('REVIEW') || statusUpper.includes('INVESTIGAT');

            const linkedLot = myLots.find(l => l.id === c.transaction_id || l.lot_reference_id === c.lot_reference_id);

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.case_number || c.id}
                      </span>
                      <span className="font-bold text-sm sm:text-base text-slate-900">
                        {c.type || c.complaint_type || 'Statutory Dispute'}
                      </span>
                      {c.lot_reference_id && (
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Lot: {c.lot_reference_id}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {tCmp.respondent} <strong>{c.respondent_name}</strong>
                      </span>
                      <span>•</span>
                      <span>{tCmp.filed} {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">{tCmp.complainant} {c.complainant_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isEscalated
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isInReview
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isResolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {isEscalated && <Gavel className="w-3.5 h-3.5 text-rose-600" />}
                      {isInReview && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{c.status}</span>
                    </span>
                  </div>
                </div>

                {/* Complaint Narrative */}
                <div className="mt-4 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>{tCmp.incidentReport}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{c.description}</p>
                </div>

                {/* Ombudsman Resolution Notes */}
                {(c.admin_notes || c.resolution_summary || c.resolution_notes) && (
                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {tCmp.ombudsmanRedressal}
                      </span>
                      {c.penalty_imposed_inr && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                          Goodwill/Fine: ₹{c.penalty_imposed_inr.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      {c.resolution_summary || c.admin_notes || c.resolution_notes}
                    </p>
                  </div>
                )}

                {/* Action Bar for Scrapper */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {linkedLot && onViewLotReceipt && (
                      <button
                        type="button"
                        onClick={() => onViewLotReceipt(linkedLot)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>{tCmp.viewVoucher}</span>
                      </button>
                    )}

                    {onOpenChatWithRecycler && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenChatWithRecycler({
                            id: c.respondent_id,
                            name: c.respondent_name,
                            role: c.respondent_role || 'recycler'
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{tCmp.chatFacility}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportNotice(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                    title="Download Official Legal Notice Slip PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-600" />
                    <span>{tCmp.downloadNotice}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statutory Rights Card */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-white text-sm sm:text-base">
            {tCmp.statutoryRights}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <strong className="text-white block mb-0.5">
              {tCmp.right1Title}
            </strong>
            {tCmp.right1Desc}
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <strong className="text-white block mb-0.5">
              {tCmp.right2Title}
            </strong>
            {tCmp.right2Desc}
          </div>
        </div>
      </div>
    </div>
  );
};
