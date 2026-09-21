import React, { useState, useEffect } from 'react';
import { Material, VernacularLang } from '../../types';
import { vernacularAudio } from '../../utils/audioPlayer';
import {
  TrendingUp, Search, Volume2, VolumeX, Sparkles, AlertTriangle,
  CheckCircle2, ArrowUpRight, ShieldCheck, Filter, Layers
} from 'lucide-react';

interface BenchmarkRatesModuleProps {
  materials: Material[];
  lang: VernacularLang;
}

const UI_TEXT: Record<VernacularLang, {
  badge: string;
  moduleCounter: string;
  title: string;
  subtitle: string;
  announceBtn: string;
  stopVoiceBtn: string;
  card1Title: string;
  card1Desc: string;
  card2Title: string;
  card2Desc: string;
  card3Title: string;
  card3Desc: string;
  searchPlaceholder: string;
  filterAll: string;
  thMaterial: string;
  thSubcategory: string;
  thHazard: string;
  thBenchmarkRate: string;
  thTrend: string;
  perKg: string;
  stableTrend: string;
  voiceScript: string;
}> = {
  en: {
    badge: 'Market Intelligence & Pricing',
    moduleCounter: 'Module 6 of 7',
    title: 'Official CPCB Benchmark Scrap Rates & Material Intelligence',
    subtitle: 'Statutory daily baseline purchase rates formulated under Ministry of Environment Guidelines to protect informal collectors from predatory middlemen.',
    announceBtn: "Announce Today's Benchmark Rates",
    stopVoiceBtn: 'Stop Voice Broadcast',
    card1Title: 'Precious Metal Yield Intelligence',
    card1Desc: 'Telecom and server grade motherboards contain up to 250 grams of 24K gold per metric ton. Never accept generic mixed-metal pricing for telecom PCBs.',
    card2Title: 'High-Demand Copper Surge',
    card2Desc: 'Clean stripped copper commands ₹680/kg. Mechanical wire stripping yields a 45% premium over unstripped automotive wiring harnesses.',
    card3Title: 'Traceability Guarantee',
    card3Desc: 'Certified transactions generate legal CPCB EPR credits, entitling formal collectors to a 4% statutory formalization incentive bonus.',
    searchPlaceholder: 'Search category, motherboard, copper, battery...',
    filterAll: 'All Materials',
    thMaterial: 'Material / Grade',
    thSubcategory: 'Subcategory',
    thHazard: 'Hazard Level',
    thBenchmarkRate: 'Official Benchmark Rate',
    thTrend: 'Market Trend',
    perKg: '/ kg',
    stableTrend: 'Stable +3.4%',
    voiceScript: 'Current CPCB benchmark recycling prices: Printed Circuit Boards 340 rupees per kg, Copper Wires 620 rupees per kg, Lithium Batteries 180 rupees per kg, Electric Motors 210 rupees per kg.'
  },
  hi: {
    badge: 'बाजार भाव एवं मूल्य निर्धारण',
    moduleCounter: 'मॉड्यूल 6 में से 7',
    title: 'सीपीसीबी आधिकारिक बेंचमार्क स्क्रैप दरें एवं धातु मूल्य',
    subtitle: 'अनौपचारिक संग्राहकों को बिचौलियों के शोषण से बचाने हेतु पर्यावरण मंत्रालय के तहत निर्धारित दैनिक आधारभूत खरीद मूल्य।',
    announceBtn: 'आज की अधिकृत दरें सुनें',
    stopVoiceBtn: 'ऑडियो रोकें',
    card1Title: 'बहुमूल्य धातु पुनर्प्राप्ति',
    card1Desc: 'टेलीकॉम और सर्वर ग्रेड मदरबोर्ड में प्रति मीट्रिक टन 250 ग्राम तक 24K सोना होता है। टेलीकॉम पीसीबी को कभी सामान्य मिश्रित धातु दर पर न बेचें।',
    card2Title: 'तांबे की मजबूत मांग',
    card2Desc: 'छिला हुआ शुद्ध तांबा ₹680/किलो तक बिकता है। बिना छिले ऑटोमोटिव तारों की तुलना में मैकेनिकल स्ट्रिपिंग से 45% अधिक मूल्य मिलता है।',
    card3Title: 'ईपीआर क्रेडिट एवं प्रोत्साहन',
    card3Desc: 'प्रमाणित ई-कचरा हस्तांतरण से सीपीसीबी ईपीआर क्रेडिट बनते हैं, जिससे संग्राहकों को 4% वैधानिक औपचारिकता बोनस मिलता है।',
    searchPlaceholder: 'मदरबोर्ड, तांबा, बैटरी खोजें...',
    filterAll: 'सभी धातु/सामग्री',
    thMaterial: 'सामग्री / ग्रेड',
    thSubcategory: 'उप-श्रेणी',
    thHazard: 'खतरे का स्तर',
    thBenchmarkRate: 'आधिकारिक बेंचमार्क दर',
    thTrend: 'बाजार रुझान',
    perKg: '/ किलो',
    stableTrend: 'स्थिर +3.4%',
    voiceScript: 'आज के सीपीसीबी अधिकृत ई-कचरा मूल्य: मदरबोर्ड 340 रुपये प्रति किलो, तांबा तार 620 रुपये प्रति किलो, लिथियम बैटरी 180 रुपये प्रति किलो, इलेक्ट्रिक मोटर 210 रुपये प्रति किलो।'
  },
  mr: {
    badge: 'बाजारभाव व किंमत बुद्धिमत्ता',
    moduleCounter: 'मॉड्यूल ६ पैकी ७',
    title: 'अधिकृत CPCB बेंचमार्क स्क्रॅप दर व सामग्री माहिती',
    subtitle: 'कचरा वेचणाऱ्यांची दलालांकडून होणारी पिळवणूक रोखण्यासाठी पर्यावरण मंत्रालयाने ठरवलेले अधिकृत किमान खरेदी दर.',
    announceBtn: 'आजचे अधिकृत दर आवाजात ऐका',
    stopVoiceBtn: 'आवाज थांबवा',
    card1Title: 'मौल्यवान धातू प्रमाण माहिती',
    card1Desc: 'टेलिकॉम आणि सर्व्हर मदरबोर्डमध्ये प्रति टन २५० ग्रॅमपर्यंत २४ कॅरेट सोने असते. टेलिकॉम पीसीबीला कधीही कमी दरात देऊ नका.',
    card2Title: 'तांब्याची वाढती मागणी',
    card2Desc: 'स्वच्छ तांब्याला ₹६८०/किलो भाव मिळतो. न सोललेल्या वायरपेक्षा मेकॅनिकल पद्धतीने सोललेल्या तारांवर ४५% जास्त नफा मिळतो.',
    card3Title: 'CPCB कायदेशीर सुरक्षितता',
    card3Desc: 'प्रमाणित व्यवहारांवर CPCB चे अधिकृत EPR क्रेडिट्स मिळतात, ज्यामुळे वेचकांना ४% अतिरिक्त कायदेशीर प्रोत्साहन भत्ता मिळतो.',
    searchPlaceholder: 'मदरबोर्ड, तांबे, बॅटरी, केबल शोधा...',
    filterAll: 'सर्व सामग्री',
    thMaterial: 'सामग्री / प्रकार',
    thSubcategory: 'उपप्रकार',
    thHazard: 'धोका पातळी',
    thBenchmarkRate: 'किमान अधिकृत आधारभूत दर',
    thTrend: 'बाजार कल',
    perKg: '/ किलो',
    stableTrend: 'स्थिर +३.४%',
    voiceScript: 'आजचे अधिकृत ई-कचरा दर: मदरबोर्ड 340 रुपये प्रति किलो, तांब्याची वायर 620 रुपये प्रति किलो, बॅटरी 180 रुपये प्रति किलो, इलेक्ट्रिक मोटर 210 रुपये प्रति किलो.'
  },
  ta: {
    badge: 'சந்தை நுண்ணறிவு மற்றும் விலை நிர்ணயம்',
    moduleCounter: 'பிரிவு 6 / 7',
    title: 'அதிகாரப்பூர்வ CPCB மறுசுழற்சி விலைகள் மற்றும் மூலப்பொருள் தகவல்',
    subtitle: 'சுற்றுச்சூழல் அமைச்சக வழிகாட்டுதலின் கீழ் இடைத்தரகர்களின் சுரண்டலைத் தடுக்க நிர்ணயிக்கப்பட்ட தினசரி அடிப்படை கொள்முதல் விலைகள்.',
    announceBtn: 'இன்றைய அதிகாரப்பூர்வ விலைகளைக் கேட்க',
    stopVoiceBtn: 'குரலை நிறுத்து',
    card1Title: 'விலைமதிப்பற்ற உலோக மகசூல்',
    card1Desc: 'சர்வர் மற்றும் டெலிகாம் மதர்போர்டுகளில் ஒரு டன்னுக்கு 250 கிராம் வரை தங்கம் உள்ளது. குறைந்த விலையில் விற்காதீர்கள்.',
    card2Title: 'தாமிரத்திற்கான அதிக தேவை',
    card2Desc: 'சுத்தமாக உரிக்கப்பட்ட தாமிரத்திற்கு கிலோவுக்கு ₹680 கிடைக்கிறது. இயந்திர முறையில் உரிப்பதால் 45% கூடுதல் விலை கிடைக்கிறது.',
    card3Title: 'சுவடு கண்டறிதல் உத்தரவாதம்',
    card3Desc: 'சான்றளிக்கப்பட்ட பரிவர்த்தனைகள் CPCB EPR வரவுகளை உருவாக்குகின்றன, இது 4% கூடுதல் சட்டப்பூர்வ போனஸை வழங்குகிறது.',
    searchPlaceholder: 'மதர்போர்டு, தாமிரம், பேட்டரி தேடுங்கள்...',
    filterAll: 'அனைத்து பொருட்கள்',
    thMaterial: 'பொருள் / தரம்',
    thSubcategory: 'துணைப்பிரிவு',
    thHazard: 'அபாய அளவு',
    thBenchmarkRate: 'அதிகாரப்பூர்வ அடிப்படை விலை',
    thTrend: 'சந்தை போக்கு',
    perKg: '/ கிலோ',
    stableTrend: 'நிலையானது +3.4%',
    voiceScript: 'இன்றைய அதிகாரப்பூர்வ மறுசுழற்சி விலைகள்: மதர்போர்டு கிலோவுக்கு 340 ரூபாய், தாமிரக் கம்பி 620 ரூபாய், மடிக்கணினி பேட்டரி 180 ரூபாய், மின்சார மோட்டார்கள் 210 ரூபாய்.'
  }
};

export const BenchmarkRatesModule: React.FC<BenchmarkRatesModuleProps> = ({
  materials,
  lang
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const ui = UI_TEXT[lang] || UI_TEXT.en;

  useEffect(() => {
    const unsub = vernacularAudio.subscribe((activeId, playing) => {
      if (activeId === 'benchmark-rates-voice') {
        setIsPlayingAudio(playing);
      } else {
        setIsPlayingAudio(false);
      }
    });

    return () => {
      unsub();
      vernacularAudio.stop();
    };
  }, []);

  const filteredMaterials = materials.filter((m) => {
    if (categoryFilter !== 'ALL' && !m.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.category.toLowerCase().includes(q) ||
        (m.subcategory && m.subcategory.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAnnounceRates = () => {
    if (isPlayingAudio) {
      vernacularAudio.stop();
      return;
    }

    vernacularAudio.play('benchmark-rates-voice', ui.voiceScript, lang);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {ui.badge}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{ui.moduleCounter}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {ui.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            {ui.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnnounceRates}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer shrink-0 ${
            isPlayingAudio
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isPlayingAudio ? ui.stopVoiceBtn : ui.announceBtn}</span>
        </button>
      </div>

      {/* Material Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{ui.card1Title}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
            {ui.card1Desc}
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>{ui.card2Title}</span>
          </div>
          <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
            {ui.card2Desc}
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>{ui.card3Title}</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            {ui.card3Desc}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ui.searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'PCB', 'Copper', 'Battery', 'Glass'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCategoryFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  categoryFilter === filter
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filter === 'ALL' ? ui.filterAll : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Rates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">{ui.thMaterial}</th>
                <th className="py-3 px-4">{ui.thSubcategory}</th>
                <th className="py-3 px-4">{ui.thHazard}</th>
                <th className="py-3 px-4 text-right">{ui.thBenchmarkRate}</th>
                <th className="py-3 px-4 text-right">{ui.thTrend}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMaterials.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {mat.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium text-xs sm:text-sm">
                    {mat.subcategory}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        mat.danger_level === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : mat.danger_level === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {mat.danger_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-base font-black text-emerald-800 font-mono">
                      ₹{mat.base_rate_per_kg}
                    </span>
                    <span className="text-xs text-slate-500 font-normal"> {ui.perKg}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <ArrowUpRight className="w-3 h-3" />
                      {ui.stableTrend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
