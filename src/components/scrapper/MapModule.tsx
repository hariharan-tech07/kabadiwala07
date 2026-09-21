import React, { useState } from 'react';
import { RecyclerFacility, VernacularLang, User } from '../../types';
import { OpenStreetMap } from '../common/OpenStreetMap';
import { calculateHaversineDistance } from '../../utils/geo';
import {
  MapPin, Compass, Navigation, Building2, Phone, MessageSquare,
  CheckCircle2, RefreshCw, ShieldCheck, Sparkles, ExternalLink, ArrowRight
} from 'lucide-react';

interface MapModuleProps {
  user: User;
  currentCoords: { latitude: number; longitude: number; label: string };
  isLocating: boolean;
  onRefreshLocation: () => void;
  recyclers: RecyclerFacility[];
  selectedCategory: string;
  onOpenChat: (recycler: { id: string; name: string; role: string; phone?: string }) => void;
  lang?: VernacularLang;
}

const MAP_MODULE_TEXTS: Record<VernacularLang, {
  tag: string;
  moduleStep: string;
  title: string;
  desc: string;
  locating: string;
  recenter: string;
  liveGeo: string;
  facilitiesActive: (count: number) => string;
  closestFacilities: string;
  rateFor: (cat: string) => string;
  cpcbVerified: string;
  away: string;
  offeredRate: string;
  chatPickup: string;
  collectorYard: (name: string) => string;
}> = {
  en: {
    tag: 'GIS Geolocation & Logistics',
    moduleStep: 'Module 3 of 7',
    title: 'Interactive Recycler Facility Radar & Route Map',
    desc: 'Locate authorized CPCB processing plants, calculate shortest transit distance, and negotiate direct doorstep scrap collection.',
    locating: 'Detecting GPS...',
    recenter: 'Re-center My GPS Location',
    liveGeo: 'Live Geolocation:',
    facilitiesActive: (c) => `${c} Certified Facilities Active`,
    closestFacilities: 'Closest Processing Facilities',
    rateFor: (cat) => `Rate for: ${cat}`,
    cpcbVerified: 'CPCB Verified',
    away: 'Away',
    offeredRate: 'Offered Rate:',
    chatPickup: 'Chat / Pickup',
    collectorYard: (name) => `Collector Yard (${name})`
  },
  hi: {
    tag: 'जीआईएस जियोलोकेशन एवं लॉजिस्टिक्स',
    moduleStep: 'मॉड्यूल 3 / 7',
    title: 'इंटरएक्टिव रीसायकलर सुविधा रडार और रूट मैप',
    desc: 'अधिकृत CPCB प्रसंस्करण संयंत्र खोजें, न्यूनतम पारगमन दूरी देखें और सीधे घर से संग्रह हेतु बात करें।',
    locating: 'जीपीएस खोज रहे हैं...',
    recenter: 'मेरा जीपीएस स्थान री-सेंटर करें',
    liveGeo: 'लाइव जीपीएस स्थिति:',
    facilitiesActive: (c) => `${c} प्रमाणित केंद्र सक्रिय`,
    closestFacilities: 'निकटतम प्रसंस्करण संयंत्र',
    rateFor: (cat) => `दर: ${cat}`,
    cpcbVerified: 'CPCB सत्यापित',
    away: 'दूरी पर',
    offeredRate: 'प्रस्तावित दर:',
    chatPickup: 'चैट / पिकअप',
    collectorYard: (name) => `कलेक्टर यार्ड (${name})`
  },
  mr: {
    tag: 'GIS जिओलोकेशन व वाहतूक व्यवस्था',
    moduleStep: 'मॉड्यूल ३ / ७',
    title: 'थेट रिसायकलर सुविधा रडार व नकाशा मार्ग',
    desc: 'अधिकृत CPCB प्रक्रिया केंद्रे शोधा, सर्वात जवळचा मार्ग तपासा आणि थेट घरपोच संकलन ठरवा.',
    locating: 'GPS शोधत आहे...',
    recenter: 'माझे GPS स्थान पुन्हा निश्चित करा',
    liveGeo: 'थेट GPS स्थान:',
    facilitiesActive: (c) => `${c} प्रमाणित केंद्रे सक्रिय`,
    closestFacilities: 'सर्वात जवळची प्रक्रिया केंद्रे',
    rateFor: (cat) => `दर: ${cat}`,
    cpcbVerified: 'CPCB प्रमाणित',
    away: 'अंतरावर',
    offeredRate: 'प्रस्तावित दर:',
    chatPickup: 'चर्चा / गाडी ठरवा',
    collectorYard: (name) => `संकलन केंद्र (${name})`
  },
  ta: {
    tag: 'ஜிஐஎஸ் புவிஇருப்பிடம் & சரக்கு போக்குவரத்து',
    moduleStep: 'தொகுதி 3 / 7',
    title: 'மறுசுழற்சியாளர் வசதி ரேடார் & வழித்தட வரைபடம்',
    desc: 'அங்கீகரிக்கப்பட்ட CPCB ஆலைகளைக் கண்டறிந்து, மிகக் குறுகிய தூரத்தைக் கணக்கிட்டு, நேரடியாக கழிவு சேகரிப்புக்கு பேச்சுவார்த்தை நடத்துங்கள்.',
    locating: 'ஜிபிஎஸ் கண்டறிகிறது...',
    recenter: 'எனது ஜிபிஎஸ் இருப்பிடத்தை மீண்டும் மையப்படுத்து',
    liveGeo: 'நேரடி புவிஇருப்பிடம்:',
    facilitiesActive: (c) => `${c} அங்கீகரிக்கப்பட்ட மையங்கள் செயல்படுகின்றன`,
    closestFacilities: 'மிக அருகிலுள்ள செயலாக்க மையங்கள்',
    rateFor: (cat) => `விலை: ${cat}`,
    cpcbVerified: 'CPCB சரிபார்க்கப்பட்டது',
    away: 'தொலைவில்',
    offeredRate: 'வழங்கப்படும் விலை:',
    chatPickup: 'அரட்டை / பிக்கப்',
    collectorYard: (name) => `சேகரிப்பாளர் மையம் (${name})`
  }
};

export const MapModule: React.FC<MapModuleProps> = ({
  user,
  currentCoords,
  isLocating,
  onRefreshLocation,
  recyclers,
  selectedCategory,
  onOpenChat,
  lang = 'en'
}) => {
  const tMap = MAP_MODULE_TEXTS[lang] || MAP_MODULE_TEXTS.en;
  const [selectedFacility, setSelectedFacility] = useState<RecyclerFacility | null>(recyclers[0] || null);

  // Compute distances & sort
  const sortedRecyclers = [...recyclers]
    .map((rec) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Module Header */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 uppercase tracking-wider">
              {tMap.tag}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{tMap.moduleStep}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {tMap.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            {tMap.desc}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs sm:text-sm border border-blue-200 transition-colors cursor-pointer shrink-0"
        >
          <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? tMap.locating : tMap.recenter}</span>
        </button>
      </div>

      {/* Map Container + Recycler List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map View (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs flex flex-col min-h-[480px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-800">
                {tMap.liveGeo} {currentCoords.label} ({currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)})
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {tMap.facilitiesActive(sortedRecyclers.length)}
            </span>
          </div>

          <div className="flex-1 w-full min-h-[480px] relative">
            <OpenStreetMap
              currentUser={user}
              mode="scrapper_view"
              initialCenter={[currentCoords.latitude, currentCoords.longitude]}
              initialZoom={13}
              height="480px"
              userLocation={{
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
                label: tMap.collectorYard(user.name)
              }}
              onSelectRecycler={(rec) => setSelectedFacility(rec)}
              onOpenChat={onOpenChat}
            />
          </div>
        </div>

        {/* Right Recycler Directory Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {tMap.closestFacilities}
            </span>
            <span className="text-xs text-emerald-700 font-bold">
              {tMap.rateFor(selectedCategory.split(' ')[0])}
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {sortedRecyclers.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedFacility(rec)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedFacility?.id === rec.id
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {rec.facility_name}
                      </h4>
                      {rec.is_authorized && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {tMap.cpcbVerified}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{rec.address}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-blue-900 font-mono">
                      {rec.distanceKm} km
                    </span>
                    <span className="block text-[10px] text-slate-500 font-semibold">{tMap.away}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-700">
                    <span>{tMap.offeredRate} </span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      ₹{rec.offeredRate || '340'}/kg
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat({
                          id: rec.id,
                          name: rec.facility_name,
                          role: 'recycler',
                          phone: rec.contact_phone
                        });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{tMap.chatPickup}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
