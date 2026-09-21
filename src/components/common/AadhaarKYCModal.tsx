import React from 'react';
import { User, VernacularLang } from '../../types';
import { ShieldCheck, X, QrCode, CheckCircle2, Award, Building2 } from 'lucide-react';

interface AadhaarKYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang?: VernacularLang;
}

const UI_TEXT: Record<VernacularLang, {
  title: string;
  sub: string;
  govtHeader: string;
  govtSub: string;
  verified: string;
  name: string;
  role: string;
  hub: string;
  phone: string;
  badgeProtection: string;
  badgeProtectionDesc: string;
  badgePayout: string;
  badgePayoutDesc: string;
  close: string;
}> = {
  en: {
    title: 'Statutory KYC Identity Card',
    sub: 'UIDAI / CPCB Formal Informal Sector Registry',
    govtHeader: 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA',
    govtSub: 'Government of India | E-Waste EPR Formalization',
    verified: 'Verified',
    name: 'Full Legal Name',
    role: 'Assigned Role',
    hub: 'Registered District / Hub',
    phone: 'Phone Contact',
    badgeProtection: 'EPR Legal Protection',
    badgeProtectionDesc: 'Legally exempts collector from police harassment and municipal confiscations under CPCB 2022 guidelines.',
    badgePayout: 'Direct Bank Payouts',
    badgePayoutDesc: 'Direct statutory bank/UPI settlements without middleman cuts, tracked on the national electronic ledger.',
    close: 'Close Identity Card'
  },
  hi: {
    title: 'वैधानिक ई-केवाईसी पहचान पत्र',
    sub: 'यूआईडीएआई / सीपीसीबी औपचारिक ई-कचरा रजिस्ट्री',
    govtHeader: 'भारतीय विशिष्ट पहचान प्राधिकरण',
    govtSub: 'भारत सरकार | ई-कचरा ईपीआर औपचारिकीकरण',
    verified: 'सत्यापित',
    name: 'पूर्ण कानूनी नाम',
    role: 'आवंटित भूमिका',
    hub: 'पंजीकृत जिला / केंद्र',
    phone: 'दूरभाष संपर्क',
    badgeProtection: 'ईपीआर कानूनी सुरक्षा',
    badgeProtectionDesc: 'सीपीसीबी 2022 दिशानिर्देशों के तहत पुलिस या प्रशासनिक उत्पीड़न से पूर्ण कानूनी सुरक्षा।',
    badgePayout: 'प्रत्यक्ष बैंक भुगतान',
    badgePayoutDesc: 'बिचौलियों के बिना सीधे बैंक/यूपीआई खाते में पारदर्शी एवं सुरक्षित भुगतान।',
    close: 'पहचान पत्र बंद करें'
  },
  mr: {
    title: 'वैधानिक ई-केवायसी ओळखपत्र',
    sub: 'UIDAI / CPCB अधिकृत ई-कचरा नोंदणी',
    govtHeader: 'भारतीय विशिष्ट ओळख प्राधिकरण',
    govtSub: 'भारत सरकार | ई-कचरा EPR औपचारिकीकरण',
    verified: 'प्रमाणित',
    name: 'पूर्ण नाव',
    role: 'भूमिका',
    hub: 'नोंदणीकृत जिल्हा / केंद्र',
    phone: 'मोबाईल संपर्क',
    badgeProtection: 'EPR कायदेशीर संरक्षण',
    badgeProtectionDesc: 'CPCB २०२२ नियमावलीनुसार कचरा वेचकांना पोलीस त्रास व जप्तीपासून कायदेशीर संरक्षण.',
    badgePayout: 'थेट बँक खात्यात पैसे',
    badgePayoutDesc: 'दलालांशिवाय थेट बँक/UPI द्वारे पारदर्शक व खात्रीशीर मोबदला.',
    close: 'ओळखपत्र बंद करा'
  },
  ta: {
    title: 'சட்டப்பூர்வ KYC அடையாள அட்டை',
    sub: 'UIDAI / CPCB முறையான பதிவு',
    govtHeader: 'இந்திய தனித்துவ அடையாள ஆணையம்',
    govtSub: 'இந்திய அரசு | மின்னணுக் கழிவு முறைப்படுத்தல்',
    verified: 'சரிபார்க்கப்பட்டது',
    name: 'முழு பெயர்',
    role: 'பணி பங்கு',
    hub: 'பதிவுசெய்யப்பட்ட மாவட்டம்',
    phone: 'தொலைபேசி தொடர்பு',
    badgeProtection: 'சட்டப்பூர்வ பாதுகாப்பு',
    badgeProtectionDesc: 'CPCB 2022 வழிகாட்டுதல்களின் கீழ் தேவையற்ற பறிமுதல் மற்றும் தொல்லைகளிலிருந்து சட்ட விலக்கு.',
    badgePayout: 'நேரடி வங்கி பணம்',
    badgePayoutDesc: 'இடைத்தரகர்கள் இல்லாமல் நேரடியாக வங்கி/UPI கணக்கில் பாதுகாப்பான பணம் செலுத்துதல்.',
    close: 'மூடு'
  }
};

export const AadhaarKYCModal: React.FC<AadhaarKYCModalProps> = ({ isOpen, onClose, user, lang = 'en' }) => {
  if (!isOpen) return null;

  const ui = UI_TEXT[lang] || UI_TEXT.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Topbar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight">{ui.title}</h3>
              <p className="text-xs text-slate-400">{ui.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body - Styled like official digital Aadhaar card */}
        <div className="p-6">
          <div className="border-2 border-emerald-500/40 rounded-xl p-5 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 relative overflow-hidden shadow-xs">
            {/* National Emblem & Watermark */}
            <div className="flex items-start justify-between border-b border-slate-200/80 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  UID
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-wider">{ui.govtHeader}</h4>
                  <p className="text-[10px] text-emerald-700 font-semibold">{ui.govtSub}</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {ui.verified}
              </div>
            </div>

            {/* Content Row */}
            <div className="flex gap-4 items-center">
              <div className="w-24 h-28 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shrink-0 flex items-center justify-center relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[8px] text-white text-center font-bold py-0.5">
                  CPCB VERIFIED
                </div>
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{ui.name}</span>
                  <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{ui.role}</span>
                  <p className="font-semibold text-slate-700 capitalize">{user.role} (Formal E-Waste Collector)</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{ui.hub}</span>
                  <p className="font-semibold text-slate-700">{user.location}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{ui.phone}</span>
                  <p className="font-semibold text-slate-700">{user.phone || '+91 98450 12345'}</p>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1">SECURE QR</span>
              </div>
            </div>

            {/* Aadhaar Number Strip */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="font-mono text-base font-black tracking-widest text-slate-800">
                XXXX  XXXX  <span className="text-emerald-600">{user.aadhaar_last4 || '8821'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                CPCB E-Waste Formal Sector ID
              </div>
            </div>
          </div>

          {/* Benefits Info */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                <Award className="w-4 h-4" />
                <span>{ui.badgeProtection}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {ui.badgeProtectionDesc}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                <Building2 className="w-4 h-4" />
                <span>{ui.badgePayout}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {ui.badgePayoutDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            {ui.close}
          </button>
        </div>
      </div>
    </div>
  );
};
