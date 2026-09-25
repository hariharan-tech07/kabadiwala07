import React, { useState } from 'react';
import { User, RecyclerFacility, Transaction, VernacularLang } from '../../types';
import { api } from '../../api/client';
import { ShieldAlert, X, Upload, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  lot?: Transaction | null;
  targetRecycler?: RecyclerFacility | null;
  lang?: VernacularLang;
  onComplaintSubmitted?: (complaint: any) => void;
}

const UI_TEXT: Record<VernacularLang, {
  title: string;
  sub: string;
  successTitle: string;
  successDesc: string;
  relatedLot: string;
  typeLabel: string;
  respondentLabel: string;
  descLabel: string;
  descPlaceholder: string;
  cancel: string;
  submit: string;
  submitting: string;
}> = {
  en: {
    title: 'Statutory Grievance Redressal Desk',
    sub: 'File an official complaint with CPCB Ombudsman',
    successTitle: 'Complaint Registered Successfully',
    successDesc: 'Your grievance has been assigned a formal tracking ticket and forwarded to the CPCB Directorate for inquiry.',
    relatedLot: 'Related Lot:',
    typeLabel: 'Dispute Category',
    respondentLabel: 'Respondent Facility',
    descLabel: 'Detailed Description of Violation / Discrepancy',
    descPlaceholder: 'Provide specific details regarding scale weight difference, rate discrepancy, or safety breach...',
    cancel: 'Cancel',
    submit: 'File Official CPCB Complaint',
    submitting: 'Registering...'
  },
  hi: {
    title: 'वैधानिक शिकायत निवारण पटल',
    sub: 'सीपीसीबी लोकपाल के समक्ष आधिकारिक शिकायत दर्ज करें',
    successTitle: 'शिकायत सफलतापूर्वक दर्ज की गई',
    successDesc: 'आपकी शिकायत को आधिकारिक ट्रैकिंग टिकट संख्या आवंटित कर सीपीसीबी जांच हेतु भेज दिया गया है।',
    relatedLot: 'संबंधित लॉट:',
    typeLabel: 'विवाद श्रेणी',
    respondentLabel: 'प्रतिवादी रिसाइकलिंग सुविधा',
    descLabel: 'उल्लंघन अथवा विसंगति का विस्तृत विवरण',
    descPlaceholder: 'काटा वजन में अंतर, दर कटौती अथवा सुरक्षा उल्लंघन का विवरण लिखें...',
    cancel: 'रद्द करें',
    submit: 'सीपीसीबी शिकायत दर्ज करें',
    submitting: 'दर्ज हो रहा है...'
  },
  mr: {
    title: 'CPCB कायदेशीर तक्रार निवारण कक्ष',
    sub: 'CPCB लोकपालकडे अधिकृत तक्रार नोंदवा',
    successTitle: 'तक्रार यशस्वीरित्या नोंदवली गेली',
    successDesc: 'तुमच्या तक्रारीला अधिकृत तिकीट क्रमांक देण्यात आला असून CPCB कडे चौकशीसाठी पाठवण्यात आली आहे.',
    relatedLot: 'संबंधित लॉट:',
    typeLabel: 'तक्रारीचा प्रकार',
    respondentLabel: 'संबंधित रिसायकलर',
    descLabel: 'तक्रारीचे सविस्तर वर्णन',
    descPlaceholder: 'काटा वजनातील तफावत, ठरलेल्या दरापेक्षा कमी भाव किंवा इतर समस्येचे तपशील लिहा...',
    cancel: 'रद्द करा',
    submit: 'अधिकृत तक्रार दाखल करा',
    submitting: 'नोंदवत आहे...'
  },
  ta: {
    title: 'சட்டப்பூர்வ குறைதீர்ப்பு மையம்',
    sub: 'CPCB குறைதீர்ப்பாளரிடம் அதிகாரப்பூர்வ புகார் பதிவு செய்யவும்',
    successTitle: 'புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது',
    successDesc: 'உங்கள் புகாருக்கு டிக்கெட் எண் ஒதுக்கப்பட்டு CPCB விசாரணைக்கு அனுப்பப்பட்டுள்ளது.',
    relatedLot: 'தொடர்புடைய லாட்:',
    typeLabel: 'புகார் வகை',
    respondentLabel: 'எதிர்மனுதாரர் மறுசுழற்சி ஆலை',
    descLabel: 'மீறல் பற்றிய விரிவான விளக்கம்',
    descPlaceholder: 'எடை முரண்பாடு அல்லது விலை குறைப்பு பற்றிய விவரங்களை உள்ளிடவும்...',
    cancel: 'ரத்து செய்',
    submit: 'புகாரை தாக்கல் செய்',
    submitting: 'பதிவு செய்கிறது...'
  }
};

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lot,
  targetRecycler,
  lang = 'en',
  onComplaintSubmitted
}) => {
  const ui = UI_TEXT[lang] || UI_TEXT.en;
  const [complaintType, setComplaintType] = useState<'Under-weighing' | 'Price manipulation' | 'Delayed payment' | 'Unsafe handling' | 'Harassment' | 'Other'>('Under-weighing');
  const [description, setDescription] = useState(
    lot?.weight_disputed
      ? `Weight dispute on ${lot.lot_reference_id}: Declared weight was ${lot.estimated_weight} kg but verified scale weight reported was ${lot.actual_weight} kg.`
      : ''
  );
  const [respondentName, setRespondentName] = useState(
    targetRecycler?.facility_name || lot?.recycler_name || 'EcoRecycle Solutions Pvt Ltd'
  );
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the issue in detail.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const complaint = await api.createComplaint({
        complainant_id: currentUser?.id || 'usr-scrapper-1',
        complainant_name: currentUser?.name || 'Authorized Field User',
        complainant_role: currentUser?.role || 'scrapper',
        respondent_id: targetRecycler?.id || lot?.recycler_id || 'usr-recycler-1',
        respondent_name: respondentName,
        respondent_role: 'recycler',
        transaction_id: lot?.id,
        lot_reference_id: lot?.lot_reference_id,
        type: complaintType,
        description: description.trim(),
        evidence_url: evidenceUrl || undefined
      });

      setSubmittedSuccess(true);
      if (onComplaintSubmitted) onComplaintSubmitted(complaint);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to file grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col my-auto">
        {/* Modal Topbar */}
        <div className="bg-rose-950 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-rose-900 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-rose-800 text-rose-200 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold tracking-tight truncate">{ui.title}</h3>
              <p className="text-xs text-rose-300 truncate">{ui.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">{ui.successTitle}</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              {ui.successDesc}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 min-h-0">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {lot && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-1.5">
                <span className="font-semibold text-slate-500">{ui.relatedLot}</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 truncate max-w-full">
                  {lot.lot_reference_id} ({lot.category})
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {ui.typeLabel}
              </label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Under-weighing">Under-weighing / Scale Tampering</option>
                <option value="Price manipulation">Price Manipulation / Deductions</option>
                <option value="Delayed payment">Delayed Payout / Non-settlement</option>
                <option value="Unsafe handling">Unsafe Dismantling / Environmental Risk</option>
                <option value="Harassment">Unfair Harassment / Gate Entry Rejection</option>
                <option value="Other">Other Statutory Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {ui.respondentLabel}
              </label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {ui.descLabel}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={ui.descPlaceholder}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full xs:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                {ui.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full xs:w-auto px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{ui.submitting}</span>
                  </>
                ) : (
                  <span>{ui.submit}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
