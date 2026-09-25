import React from 'react';
import { User, RecyclerFacility, VernacularLang } from '../../types';
import { OpenStreetMap, GeoLotNode, GeoScrapperNode } from './OpenStreetMap';
import { Compass, X, ShieldAlert } from 'lucide-react';

interface GeoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  lang?: VernacularLang;
  onSelectRecycler?: (facility: RecyclerFacility) => void;
  onSelectLot?: (lot: GeoLotNode) => void;
  onSelectScrapper?: (scrapper: GeoScrapperNode) => void;
  onOpenChat?: (target: { id: string; name: string; role: string; phone?: string }, lot?: any) => void;
}

const MODAL_TEXTS: Record<VernacularLang, { title: string; subtitle: string; liveRadar: string }> = {
  en: {
    title: 'Kabadiwala Connect Geolocation Radar',
    subtitle: 'Live GPS spatial tracking: Scrappers ↔ Recyclers ↔ CPCB Directorate',
    liveRadar: 'Live Radar'
  },
  hi: {
    title: 'कबाड़ीवाला कनेक्ट भू-स्थान रडार',
    subtitle: 'लाइव जीपीएस स्थानिक ट्रैकिंग: कबाड़ीवाले ↔ रिसाइकलर ↔ सीपीसीबी निदेशालय',
    liveRadar: 'लाइव रडार'
  },
  mr: {
    title: 'कबाडीवाला कनेक्ट भौगोलिक रडार',
    subtitle: 'थेट जीपीएस ट्रॅकिंग: स्क्रॅपर्स ↔ रिसायकलर्स ↔ सीपीसीबी महासंचालनालय',
    liveRadar: 'थेट रडार'
  },
  ta: {
    title: 'கபாடிவாலா கனெக்ட் புவிஇருப்பிட ரேடார்',
    subtitle: 'நேரலை ஜிபிஎஸ் கண்காணிப்பு: சேகரிப்பாளர்கள் ↔ மறுசுழற்சியாளர்கள் ↔ CPCB இயக்ககம்',
    liveRadar: 'நேரலை ரேடார்'
  }
};

export const GeoMapModal: React.FC<GeoMapModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang = 'en',
  onSelectRecycler,
  onSelectLot,
  onSelectScrapper,
  onOpenChat
}) => {
  if (!isOpen) return null;
  const mt = MODAL_TEXTS[lang] || MODAL_TEXTS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {mt.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 hidden xs:inline-block">
                  {mt.liveRadar}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {mt.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-geo-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Body */}
        <div className="p-2 sm:p-4 overflow-y-auto flex-1 min-h-0">
          <OpenStreetMap
            currentUser={currentUser}
            mode="all"
            height="min(560px, 62vh)"
            onOpenChat={(target, lot) => {
              if (onOpenChat) {
                onClose();
                onOpenChat(target, lot);
              }
            }}
            onSelectRecycler={(rec) => {
              if (onSelectRecycler) onSelectRecycler(rec);
            }}
            onSelectLot={(lot) => {
              if (onSelectLot) onSelectLot(lot);
            }}
            onSelectScrapper={(scrapper) => {
              if (onSelectScrapper) onSelectScrapper(scrapper);
            }}
          />
        </div>
      </div>
    </div>
  );
};
