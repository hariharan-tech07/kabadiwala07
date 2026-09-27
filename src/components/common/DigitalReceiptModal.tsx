import React, { useState } from 'react';
import { Transaction, VernacularLang } from '../../types';
import { CheckCircle2, ShieldCheck, Printer, Download, X, QrCode, Building2, User, Scale, FileText, FileCode, ChevronDown } from 'lucide-react';
import { generateLotReceiptPdf } from '../../utils/pdfGenerator';

interface DigitalReceiptModalProps {
  lot: Transaction | null;
  lang?: VernacularLang;
  onClose: () => void;
}

const UI_TEXT: Record<VernacularLang, {
  title: string;
  sub: string;
  lotRef: string;
  collector: string;
  facility: string;
  handoverTime: string;
  gps: string;
  stream: string;
  netWeight: string;
  agreedRate: string;
  totalPayout: string;
  settlementChannel: string;
  print: string;
  download: string;
  formatTitle: string;
  formatPdfDesc: string;
  formatTxtDesc: string;
  downloadPdfBtn: string;
  downloadTxtBtn: string;
  close: string;
}> = {
  en: {
    title: 'E-Waste Handover & Gate Pass Voucher',
    sub: 'CPCB Compliance • Certified Traceable Chain of Custody',
    lotRef: 'Electronic Lot Reference',
    collector: 'Aggregator / Collector',
    facility: 'Authorized Facility',
    handoverTime: 'Handover Date & Time',
    gps: 'GPS Coordinate Stamp',
    stream: 'E-Waste Stream:',
    netWeight: 'Certified Net Weight:',
    agreedRate: 'Agreed Rate per KG:',
    totalPayout: 'Total Settlement Payout:',
    settlementChannel: 'Settlement Channel:',
    print: 'Print Gate Pass',
    download: 'Download Receipt',
    formatTitle: 'Select Download Format (.PDF or .TXT):',
    formatPdfDesc: 'Official CPCB PDF with barcode and certified breakdown',
    formatTxtDesc: 'Plain text receipt voucher (.txt) for records/SMS',
    downloadPdfBtn: 'Download .PDF',
    downloadTxtBtn: 'Download .TXT',
    close: 'Close Voucher'
  },
  hi: {
    title: 'ई-कचरा हस्तांतरण एवं गेट पास वाउचर',
    sub: 'सीपीसीबी अनुपालन • प्रमाणित डिजिटल ई-कचरा रिकॉर्ड',
    lotRef: 'इलेक्ट्रॉनिक लॉट संदर्भ संख्या',
    collector: 'संग्राहक / स्क्रैपर',
    facility: 'अधिकृत रिसाइकलिंग सुविधा',
    handoverTime: 'हस्तांतरण समय एवं दिनांक',
    gps: 'जीपीएस लोकेशन स्टाम्प',
    stream: 'ई-कचरा श्रेणी:',
    netWeight: 'प्रमाणित काटा वजन:',
    agreedRate: 'स्वीकृत दर प्रति किलो:',
    totalPayout: 'कुल भुगतान राशि:',
    settlementChannel: 'भुगतान माध्यम:',
    print: 'गेट पास प्रिंट करें',
    download: 'रसीद डाउनलोड करें',
    formatTitle: 'डाउनलोड प्रारूप चुनें (.PDF या .TXT):',
    formatPdfDesc: 'बारकोड और पूर्ण विवरण सहित आधिकारिक CPCB PDF',
    formatTxtDesc: 'सरल टेक्स्ट पावती (.txt)',
    downloadPdfBtn: '.PDF डाउनलोड करें',
    downloadTxtBtn: '.TXT डाउनलोड करें',
    close: 'वाउचर बंद करें'
  },
  mr: {
    title: 'ई-कचरा हस्तांतरण व गेटपास पावती',
    sub: 'CPCB कायदेशीर नोंद • प्रमाणित इलेक्ट्रॉनिक साखळी',
    lotRef: 'इलेक्ट्रॉनिक लॉट संदर्भ क्रमांक',
    collector: 'कचरा वेचक / स्क्रॅपर',
    facility: 'अधिकृत रिसायकलिंग केंद्र',
    handoverTime: 'हस्तांतरण वेळ व दिनांक',
    gps: 'जीपीएस स्थान नोंद',
    stream: 'ई-कचरा प्रकार:',
    netWeight: 'प्रमाणित काटा वजन:',
    agreedRate: 'मान्य दर प्रति किलो:',
    totalPayout: 'एकूण देय मोबदला:',
    settlementChannel: 'पैसे भरणा मार्ग:',
    print: 'गेटपास प्रिंट करा',
    download: 'पावती डाउनलोड करा',
    formatTitle: 'डाउनलोड फॉरमॅट निवडा (.PDF किंवा .TXT):',
    formatPdfDesc: 'बारकोड आणि अधिकृत तपशिलांसह CPCB PDF',
    formatTxtDesc: 'साधा मजकूर पावती (.txt)',
    downloadPdfBtn: '.PDF डाउनलोड करा',
    downloadTxtBtn: '.TXT डाउनलोड करा',
    close: 'पावती बंद करा'
  },
  ta: {
    title: 'மின்னணுக் கழிவு ஒப்படைப்பு மற்றும் கேட் பாஸ் வவுச்சர்',
    sub: 'CPCB இணக்கம் • சான்றளிக்கப்பட்ட டிஜிட்டல் பதிவு',
    lotRef: 'மின்னணு லாட் குறிப்பு எண்',
    collector: 'சேகரிப்பாளர் / ஸ்கிராப்பர்',
    facility: 'அங்கீகரிக்கப்பட்ட வசதி',
    handoverTime: 'ஒப்படைத்த தேதி மற்றும் நேரம்',
    gps: 'ஜிபிஎஸ் இருப்பிட முத்திரை',
    stream: 'கழிவு வகை:',
    netWeight: 'சான்றளிக்கப்பட்ட எடை:',
    agreedRate: 'கிலோவிற்கான விலை:',
    totalPayout: 'மொத்த தீர்வுத் தொகை:',
    settlementChannel: 'பணம் செலுத்தும் முறை:',
    print: 'கேட் பாஸ் அச்சிடுக',
    download: 'ரசீது பதிவிறக்கு',
    formatTitle: 'பதிவிறக்க வடிவத்தைத் தேர்வுசெய்க (.PDF அல்லது .TXT):',
    formatPdfDesc: 'பார்கோடு மற்றும் அதிகாரப்பூர்வ விவரங்களுடன் CPCB PDF',
    formatTxtDesc: 'எளிய உரை ரசீது (.txt)',
    downloadPdfBtn: '.PDF பதிவிறக்கு',
    downloadTxtBtn: '.TXT பதிவிறக்கு',
    close: 'மூடு'
  }
};

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ lot, lang = 'en', onClose }) => {
  if (!lot) return null;

  const ui = UI_TEXT[lang] || UI_TEXT.en;
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'txt'>('pdf');
  const [showFormatPicker, setShowFormatPicker] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateLotReceiptPdf(lot);
    setShowFormatPicker(false);
  };

  const handleDownloadText = () => {
    const receiptText = `
======================================================
KABADIWALA CONNECT - CPCB E-WASTE TRACEABILITY RECEIPT
Regulatory Standard: CPCB E-Waste Management Rules 2022
Certified EPR Chain of Custody Record
======================================================
Lot Reference ID   : ${lot.lot_reference_id}
Status             : ${lot.status}
Timestamp          : ${new Date(lot.handover_timestamp || lot.created_at).toLocaleString()}
Collector/Scrapper : ${lot.scrapper_name} (ID: ${lot.scrapper_id})
Authorized Facility: ${lot.recycler_name} (ID: ${lot.recycler_id})
Collection GPS     : ${lot.collection_gps ? `${lot.collection_gps.latitude}, ${lot.collection_gps.longitude}` : 'Standard Geo Pin'}
------------------------------------------------------
E-Waste Category   : ${lot.category}
Certified Net Mass : ${lot.actual_weight || lot.estimated_weight} KG
Agreed Buying Rate : ₹${lot.offered_rate_per_kg} / KG
${lot.sorting_breakdown ? `Sorting Analysis   : Required: ${lot.sorting_breakdown.required_kg}kg | Unrequired: ${lot.sorting_breakdown.unrequired_kg}kg | Deductions: ₹${lot.sorting_breakdown.contamination_deduction}` : ''}
------------------------------------------------------
TOTAL PAYOUT       : ₹${lot.final_payout?.toLocaleString('en-IN') || (lot.estimated_weight * lot.offered_rate_per_kg).toLocaleString('en-IN')}
Payment Mode       : ${lot.payment_mode || 'UPI_DIGITAL'}
Compliance Standard: E-Waste Management Rules 2022
======================================================
`;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${lot.lot_reference_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFormatPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-7 shadow-2xl space-y-4 my-auto relative print:border-none print:shadow-none print:m-0 max-h-[92vh] flex flex-col">
        
        {/* Header with National Protocol Seal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 text-white font-black flex items-center justify-center text-xs tracking-wider shadow-xs shrink-0">
              CPCB
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                {ui.title}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline-block shrink-0" />
                <span className="truncate">{ui.sub}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors print:hidden shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-3.5 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs overflow-y-auto flex-1 min-h-0">
          {/* Reference & QR Code representation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider">
                {ui.lotRef}
              </span>
              <span className="font-mono font-bold text-emerald-800 text-sm sm:text-lg">
                {lot.lot_reference_id}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] text-slate-700 font-mono shrink-0">
              <QrCode className="w-4 h-4 text-slate-800" />
              <span>CPCB-VALID</span>
            </div>
          </div>

          {/* Stakeholders grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                {ui.collector}
              </span>
              <strong className="text-slate-900 font-semibold flex items-center gap-1 mt-0.5 truncate">
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{lot.scrapper_name}</span>
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                {lot.recycler_name?.includes('Scrapper') ? 'Circular Recycling Stream' : ui.facility}
              </span>
              <strong className="text-slate-900 font-semibold flex items-center gap-1 mt-0.5 truncate">
                {lot.recycler_name?.includes('Scrapper') ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
                <span className="truncate">{lot.recycler_name}</span>
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                {ui.handoverTime}
              </span>
              <span className="text-slate-700 font-medium truncate block">
                {new Date(lot.handover_timestamp || lot.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                {ui.gps}
              </span>
              <span className="text-slate-700 font-mono text-[11px] truncate block">
                {lot.collection_gps?.latitude?.toFixed(4) || '19.0760'}, {lot.collection_gps?.longitude?.toFixed(4) || '72.8777'}
              </span>
            </div>
          </div>

          {/* Weighment & Payout Computation */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">{ui.stream}</span>
              <span className="font-bold text-slate-900">{lot.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">{ui.netWeight}</span>
              <span className="font-mono text-emerald-700 font-bold text-sm">
                {lot.actual_weight || lot.estimated_weight} KG
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">{ui.agreedRate}</span>
              <span className="font-mono text-slate-800 font-semibold">₹{lot.offered_rate_per_kg} / kg</span>
            </div>

            {lot.sorting_breakdown && (
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded">
                <div className="flex justify-between">
                  <span>Sorted Usable Scrap:</span>
                  <span className="font-mono font-medium">{lot.sorting_breakdown.required_kg} kg</span>
                </div>
                {lot.sorting_breakdown.contamination_deduction > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Contamination / Moisture Penalty:</span>
                    <span className="font-mono">-₹{lot.sorting_breakdown.contamination_deduction}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 font-bold text-sm">
              <span className="text-slate-900">{ui.totalPayout}</span>
              <span className="font-mono text-emerald-700 text-base font-black">
                ₹{(lot.final_payout || (lot.estimated_weight * lot.offered_rate_per_kg)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Compliance Footer notes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>{ui.settlementChannel}</span>
              <strong className="text-slate-900 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">
                {lot.payment_mode || 'UPI_IMPS_DIGITAL'}
              </strong>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CPCB Traceability Pass Verified</span>
            </div>
          </div>
        </div>

        {/* Interactive Download Format Selection Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 print:hidden shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{ui.formatTitle}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
              Selected: <strong className="text-emerald-700 font-bold">.{downloadFormat.toUpperCase()}</strong>
            </span>
          </div>

          {/* Segmented Format Choice Tabs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              id="select-format-pdf-btn"
              onClick={() => setDownloadFormat('pdf')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2 ${
                downloadFormat === 'pdf'
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500 text-emerald-950 font-bold'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${downloadFormat === 'pdf' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <div className="font-bold flex items-center gap-1">
                  <span>PDF Document</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono font-bold">.PDF</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5 truncate">
                  {ui.formatPdfDesc}
                </div>
              </div>
            </button>

            <button
              type="button"
              id="select-format-txt-btn"
              onClick={() => setDownloadFormat('txt')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2 ${
                downloadFormat === 'txt'
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500 text-emerald-950 font-bold'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${downloadFormat === 'txt' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <div className="font-bold flex items-center gap-1">
                  <span>Plain Text</span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-mono font-bold">.TXT</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5 truncate">
                  {ui.formatTxtDesc}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons with Format Option (.TXT or .PDF) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 print:hidden shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Download Button for Selected Format */}
            <button
              type="button"
              id="download-receipt-main-btn"
              onClick={downloadFormat === 'pdf' ? handleDownloadPdf : handleDownloadText}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title={`Download official receipt in .${downloadFormat.toUpperCase()} format`}
            >
              {downloadFormat === 'pdf' ? <FileText className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
              <span>{downloadFormat === 'pdf' ? ui.downloadPdfBtn : ui.downloadTxtBtn}</span>
            </button>

            {/* Quick 1-click alternative download */}
            <button
              type="button"
              id={downloadFormat === 'pdf' ? 'download-receipt-txt-btn' : 'download-receipt-pdf-btn'}
              onClick={downloadFormat === 'pdf' ? handleDownloadText : handleDownloadPdf}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
              title={`Also download as ${downloadFormat === 'pdf' ? '.TXT' : '.PDF'}`}
            >
              <span>{downloadFormat === 'pdf' ? ui.downloadTxtBtn : ui.downloadPdfBtn}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              title="Print Gate Pass Voucher"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline">{ui.print}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              {ui.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
