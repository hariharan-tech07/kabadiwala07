import React, { useState, useEffect, useRef } from 'react';
import { VernacularLang } from '../../types';
import {
  AlertTriangle, ShieldAlert, Volume2, VolumeX, CheckCircle2,
  Flame, Droplets, BatteryCharging, Sparkles, ShieldCheck,
  HeartPulse, X, Wrench, Package, Radio, Info, Layers
} from 'lucide-react';
import { vernacularAudio } from '../../utils/audioPlayer';

interface SafetyGuidanceModalProps {
  isOpen: boolean;
  category: string;
  lang: VernacularLang;
  onAcknowledge: () => void;
}

interface CategorySafetyProfile {
  id: string;
  categoryTitle: string;
  dangerLevel: string;
  dangerLevelColor: 'critical' | 'high' | 'medium';
  iconType: 'pcb' | 'battery' | 'wire' | 'crt' | 'motor' | 'plastic' | 'general';
  prohibitedTitle: string;
  prohibitedPractice: string;
  protocolTitle: string;
  correctProtocol: string;
  ppeRequired: string[];
  audioScript: string;
  statutoryRule: string;
}

export function detectSafetyCategoryKey(category: string): 'pcb' | 'battery' | 'wire' | 'crt' | 'motor' | 'plastic' | 'general' {
  const c = (category || '').toLowerCase();
  if (c.includes('pcb') || c.includes('circuit') || c.includes('motherboard') || c.includes('ic') || c.includes('board')) {
    return 'pcb';
  }
  if (c.includes('battery') || c.includes('lithium') || c.includes('lead-acid') || c.includes('cell') || c.includes('18650')) {
    return 'battery';
  }
  if (c.includes('wire') || c.includes('copper') || c.includes('cable')) {
    return 'wire';
  }
  if (c.includes('crt') || c.includes('monitor') || c.includes('glass') || c.includes('tv') || c.includes('tube') || c.includes('display')) {
    return 'crt';
  }
  if (c.includes('motor') || c.includes('transformer') || c.includes('stator') || c.includes('coil') || c.includes('alternator')) {
    return 'motor';
  }
  if (c.includes('plastic') || c.includes('abs') || c.includes('hips') || c.includes('polymer') || c.includes('housing')) {
    return 'plastic';
  }
  return 'general';
}

const CATEGORY_SAFETY_MAP: Record<VernacularLang, Record<string, CategorySafetyProfile>> = {
  en: {
    pcb: {
      id: 'pcb',
      categoryTitle: 'Printed Circuit Boards & Motherboards (PCB)',
      dangerLevel: 'Critical Chemical Hazard',
      dangerLevelColor: 'critical',
      iconType: 'pcb',
      prohibitedTitle: 'STRICTLY FORBIDDEN: ACID LEACHING & OPEN BURNING',
      prohibitedPractice: 'NEVER boil motherboards in aqua regia, nitric acid, or cyanide in open tubs or backyard stoves to extract gold/silver. Fumes contain lethal nitrogen dioxide and cyanide gas that cause permanent respiratory necrosis.',
      protocolTitle: 'MANDATORY CPCB HANDLING PROTOCOL',
      correctProtocol: 'Keep circuit boards intact without breaking. Store on dry pallets away from moisture. Deliver unbroken boards directly to CPCB-authorized pyrometallurgical or hydrometallurgical recovery plants equipped with wet scrubbers.',
      ppeRequired: ['Cut-resistant nitrile gloves', 'N95 particulate respirator mask', 'Chemical splash safety goggles'],
      statutoryRule: 'CPCB E-Waste Rules 2022 Schedule II: Acid boiling in unauthorized premises attracts criminal penalty under EPA Section 15.',
      audioScript: 'Safety Alert for Circuit Boards: Never boil computer motherboards in open acid or burn them over stoves to extract gold. Acid leaching releases lethal cyanide and nitrogen dioxide gas. Always sell intact circuit boards directly to authorized CPCB recovery plants.'
    },
    battery: {
      id: 'battery',
      categoryTitle: 'Lithium-Ion & Lead Acid Batteries',
      dangerLevel: 'Critical Explosion & Acid Hazard',
      dangerLevelColor: 'critical',
      iconType: 'battery',
      prohibitedTitle: 'STRICTLY FORBIDDEN: HAMMERING, DISMANTLING & SHORTING',
      prohibitedPractice: 'NEVER strike batteries with hammers or pry open battery casings with chisels. Lithium reacts violently with atmospheric moisture, causing uncontrollable thermal runaway fires up to 1,000°C and dangerous toxic lead exposure.',
      protocolTitle: 'MANDATORY CPCB HANDLING PROTOCOL',
      correctProtocol: 'Immediately wrap terminal contact points with non-conductive PVC electrical tape. Store batteries standing upright inside a dry, non-conductive plastic container surrounded by dry sand, away from flammable materials.',
      ppeRequired: ['Heavy-duty chemical-resistant rubber gloves', 'Full-face safety shield', 'Fire-retardant safety apron'],
      statutoryRule: 'Battery Waste Management Rules 2022: Puncturing batteries or draining electrolyte is strictly prohibited.',
      audioScript: 'Safety Alert for Batteries: Never puncture, crush, or hammer lithium-ion or lead-acid batteries. Risk of chemical explosions, violent fires, and toxic acid burns. Insulate terminal contacts with tape and store upright in dry sand.'
    },
    wire: {
      id: 'wire',
      categoryTitle: 'Insulated Copper Wires & Power Cables',
      dangerLevel: 'High Toxic Carcinogen Fume Hazard',
      dangerLevelColor: 'high',
      iconType: 'wire',
      prohibitedTitle: 'STRICTLY FORBIDDEN: OPEN PIT OR TYRE BURNING',
      prohibitedPractice: 'NEVER burn plastic-insulated cables in open pits, barrels, or tyre fires to extract copper wire. Burning PVC sheathing releases carcinogenic dioxins, furans, and heavy chlorinated soot that cause severe lung cancer and contaminate local soil.',
      protocolTitle: 'MANDATORY CPCB HANDLING PROTOCOL',
      correctProtocol: 'Strip copper wire mechanically using hand-cranked or motorized mechanical stripping machines. Alternatively, sell intact, unstripped insulated cables directly to authorized recyclers equipped with dry granulation shredders.',
      ppeRequired: ['Puncture-resistant work gloves', 'Steel-toed safety boots', 'N95 particulate dust mask'],
      statutoryRule: 'National Green Tribunal Mandate: Open cable burning is a non-bailable environmental offence under the Air Act.',
      audioScript: 'Safety Alert for Copper Cables: Do not burn wires or cables in open air to extract copper. Open burning of plastic produces cancer-causing dioxins and poisonous smoke. Use mechanical wire strippers or sell intact insulated cables.'
    },
    crt: {
      id: 'crt',
      categoryTitle: 'CRT Monitors & Television Funnel Glass',
      dangerLevel: 'High Implosion & Toxic Lead Dust Hazard',
      dangerLevelColor: 'high',
      iconType: 'crt',
      prohibitedTitle: 'STRICTLY FORBIDDEN: SMASHING GLASS WITH STONES OR HAMMERS',
      prohibitedPractice: 'NEVER smash CRT glass envelopes to salvage the copper deflection yoke. CRT funnel glass contains up to 2 kg of hazardous toxic lead powder. Smashing creates high-velocity implosion glass shrapnel and inhalable lead dust.',
      protocolTitle: 'MANDATORY CPCB HANDLING PROTOCOL',
      correctProtocol: 'Keep the vacuum envelope intact. Handle gently using two hands with protective arm sleeves, cushion inside corrugated cardboard, and transport securely to authorized lead-glass smelters.',
      ppeRequired: ['Heavy-duty split leather gloves', 'Polycarbonate impact safety goggles', 'Protective canvas arm sleeves'],
      statutoryRule: 'CPCB E-Waste Rules 2022: Lead glass must be processed under closed negative-pressure furnace conditions.',
      audioScript: 'Safety Alert for CRT Monitors: Never smash old TV screens or computer monitor tubes. CRT glass contains up to two kilograms of dangerous toxic lead powder and can violently implode. Transport intact with protective padding.'
    },
    motor: {
      id: 'motor',
      categoryTitle: 'Electric Motors & Copper Transformers',
      dangerLevel: 'Physical Crush & Electrical Discharge Hazard',
      dangerLevelColor: 'high',
      iconType: 'motor',
      prohibitedTitle: 'STRICTLY FORBIDDEN: BURNING STATORS & IGNORING CAPACITORS',
      prohibitedPractice: 'NEVER use open flame blowtorches to melt varnish or epoxy resin from copper coils. Beware of stored high-voltage electrical charges in start/run capacitors, and toxic dielectric polychlorinated biphenyls (PCBs) in old transformer oils.',
      protocolTitle: 'MANDATORY CPCB HANDLING PROTOCOL',
      correctProtocol: 'Discharge all starter capacitors using an insulated grounding probe before touching terminals. Dismantle motor housings mechanically with socket wrenches. Supply intact copper stator cores to certified recyclers.',
      ppeRequired: ['Steel-toed boots', 'Cut-resistant mechanical work gloves', 'Impact face shield'],
      statutoryRule: 'Central Electricity Authority Safety Regulations: Always discharge inductive/capacitive equipment before dismantling.',
      audioScript: 'Safety Alert for Electric Motors: Never burn motor coils to melt varnish or copper insulation. Ensure capacitors are discharged safely before handling, and dismantle motor casings mechanically using wrenches.'
    },
    plastic: {
      id: 'plastic',
      categoryTitle: 'E-Waste Rigid Plastics (ABS / HIPS)',
      dangerLevel: 'Toxic Polymer & Halogen Gas Hazard',
      dangerLevelColor: 'medium',
      iconType: 'plastic',
      prohibitedTitle: 'STRICTLY FORBIDDEN: OPEN MELTING & CRUDE YARD BURNING',
      prohibitedPractice: 'NEVER burn or melt plastic printer or monitor casings in open drums to reduce scrap volume. Brominated flame retardants present in electronic plastics release toxic halogenated dioxins when exposed to heat.',
      protocolTitle: 'MANDATORY CPCB HANDLING PROTOCOL',
      correctProtocol: 'Segregate clean rigid casings by polymer code (ABS/HIPS). Store indoors in shaded racks to prevent brittle UV degradation. Deliver clean whole casings to licensed plastic pelletizing facilities.',
      ppeRequired: ['Particulate dust respirator mask', 'Puncture-resistant work gloves', 'Safety goggles'],
      statutoryRule: 'Plastic Waste Management Rules: Open burning of electronic grade plastics is strictly prohibited.',
      audioScript: 'Safety Alert for E-Waste Plastics: Never burn or melt computer plastic casings in open air. Heated flame retardant plastics emit carcinogenic chemical fumes. Segregate clean plastic housings without burning.'
    },
    general: {
      id: 'general',
      categoryTitle: 'Electronic Waste Scrap Batch',
      dangerLevel: 'Moderate E-Waste Hazard',
      dangerLevelColor: 'medium',
      iconType: 'general',
      prohibitedTitle: 'STRICTLY FORBIDDEN: UNREGULATED BREAKAGE & YARD BURNING',
      prohibitedPractice: 'NEVER break open sealed electronic housings or burn mixed scrap piles in unventilated yards. Informal dismantling releases hazardous heavy metals including lead, cadmium, and arsenic.',
      protocolTitle: 'MANDATORY CPCB HANDLING PROTOCOL',
      correctProtocol: 'Keep electronic appliances assembled. Store in a dry, ventilated shed on elevated wooden pallets. Hand over intact lots directly to CPCB-registered collection centers.',
      ppeRequired: ['Heavy-duty work gloves', 'Dust particulate mask', 'Protective safety goggles'],
      statutoryRule: 'CPCB E-Waste Rules 2022: Formal handover to authorized recyclers ensures EPR credit and environmental safety.',
      audioScript: 'Safety Alert for Electronic Scrap: Handle all electronic scrap with protective gloves. Never burn or crush sealed electronic components in open air. Deliver intact lots directly to authorized CPCB recyclers.'
    }
  },
  hi: {
    pcb: {
      id: 'pcb',
      categoryTitle: 'प्रिंटेड सर्किट बोर्ड एवं मदरबोर्ड (PCB)',
      dangerLevel: 'गंभीर रासायनिक खतरा',
      dangerLevelColor: 'critical',
      iconType: 'pcb',
      prohibitedTitle: 'सख्त मना: तेजाब में उबालना एवं आग में जलाना',
      prohibitedPractice: 'सोना या चांदी निकालने के लिए मदरबोर्ड को कभी भी खुले तेजाब (एक्वा रेजिया/साइनाइड) में न उबालें और न ही कोयले पर जलाएं। इससे अत्यधिक घातक साइनाइड और नाइट्रोजन डाइऑक्साइड गैस निकलती है, जिससे फेफड़े हमेशा के लिए खराब हो जाते हैं।',
      protocolTitle: 'अनिवार्य सीपीसीबी सुरक्षित संचालन नियम',
      correctProtocol: 'मदरबोर्ड को तोड़े बिना साबुत रखें। सीलन से दूर सूखी जगह पर रखें और सीधे सीपीसीबी अधिकृत आधुनिक रिसाइक्लिंग प्लांट को बेचें जहां गैस साफ करने वाले स्क्रबर लगे हों।',
      ppeRequired: ['कट-प्रतिरोधी नाइट्राइल दस्ताने', 'N95 डस्ट रेस्पिरेटर मास्क', 'रासायनिक सुरक्षा चश्मा'],
      statutoryRule: 'सीपीसीबी ई-कचरा नियम 2022: अनधिकृत स्थानों पर तेजाब का उपयोग पर्यावरण संरक्षण अधिनियम की धारा 15 के तहत दंडनीय अपराध है।',
      audioScript: 'सर्किट बोर्ड सुरक्षा चेतावनी: मदरबोर्ड पर कभी भी तेजाब या साइनाइड न डालें और न ही आग में जलाएं। यह जानलेवा धुआं पैदा करता है। इसे बिना तोड़े सीधे सीपीसीबी अधिकृत रिसाइकलर को बेचें।'
    },
    battery: {
      id: 'battery',
      categoryTitle: 'लिथियम-आयन एवं लेड एसिड बैटरी',
      dangerLevel: 'गंभीर विस्फोट एवं एसिड खतरा',
      dangerLevelColor: 'critical',
      iconType: 'battery',
      prohibitedTitle: 'सख्त मना: हथौड़े से तोड़ना, खोलना एवं शॉर्ट करना',
      prohibitedPractice: 'बैटरी को हथौड़े या छेनी से कभी न तोड़ें और न ही दबाएं। हवा और नमी के संपर्क में आते ही लिथियम में 1000 डिग्री तक भीषण रासायनिक आग लग जाती है और जहरीला लेड रिसने से त्वचा जल जाती है।',
      protocolTitle: 'अनिवार्य सीपीसीबी सुरक्षित संचालन नियम',
      correctProtocol: 'बैटरी के दोनों टर्मिनलों पर तुरंत पीवीसी इंसुलेशन टेप लगाएं। ज्वलनशील पदार्थों से दूर सूखी रेत से भरी प्लास्टिक की बाल्टी में बैटरी को हमेशा सीधा रखें।',
      ppeRequired: ['मजबूत एसिड-रोधी रबर दस्ताने', 'फुल फेस सेफ्टी शील्ड', 'अग्निरोधी एप्रन'],
      statutoryRule: 'बैटरी अपशिष्ट प्रबंधन नियम 2022: बैटरियों को तोड़ना या एसिड बहाना पूर्णतः गैर-कानूनी है।',
      audioScript: 'बैटरी सुरक्षा चेतावनी: लिथियम या लेड एसिड बैटरी को कभी न तोड़ें या हथौड़े से न मारें। यह फट सकती है और गंभीर एसिड बर्न कर सकती है। टर्मिनलों पर टेप लगाएं और सूखी रेत में सीधा रखें।'
    },
    wire: {
      id: 'wire',
      categoryTitle: 'इन्सुलेटेड तांबे के तार एवं पावर केबल्स',
      dangerLevel: 'उच्च विषैला धुआं एवं कैंसर खतरा',
      dangerLevelColor: 'high',
      iconType: 'wire',
      prohibitedTitle: 'सख्त मना: टायर या खुले गड्ढों में तार जलाना',
      prohibitedPractice: 'तांबा निकालने के लिए केबल्स को कभी भी आग या टायरों में न जलाएं। पीवीसी के जलने से कैंसरकारी डाइऑक्सिन और घातक काला धुआं निकलता है जो फेफड़ों का कैंसर पैदा करता है और मिट्टी को जहरीला बना देता है।',
      protocolTitle: 'अनिवार्य सीपीसीबी सुरक्षित संचालन नियम',
      correctProtocol: 'हाथ से चलने वाले या मोटर वाले वायर स्ट्रिपिंग टूल से प्लास्टिक हटाएं, अथवा बिना छीली हुई पूरी केबल सीधे अधिकृत रिसाइकलर को बेचें जिनके पास आधुनिक कटर-श्रेडर हों।',
      ppeRequired: ['पंचर-रोधी चमड़े के दस्ताने', 'स्टील-टो सुरक्षा जूते', 'N95 डस्ट मास्क'],
      statutoryRule: 'एनजीटी आदेश: खुले में तार जलाना वायु प्रदूषण नियंत्रण अधिनियम के तहत गैर-जमानती अपराध है।',
      audioScript: 'तांबे के तार की सुरक्षा चेतावनी: तांबा निकालने के लिए तारों को कभी भी आग में न जलाएं। इससे फेफड़ों का कैंसर पैदा करने वाला जहरीला धुआं निकलता है। मैकेनिकल स्ट्रिपिंग टूल्स का उपयोग करें।'
    },
    crt: {
      id: 'crt',
      categoryTitle: 'सीआरटी मॉनिटर और पुराना टीवी ग्लास',
      dangerLevel: 'उच्च विस्फोट एवं जहरीला सीसा (लेड) खतरा',
      dangerLevelColor: 'high',
      iconType: 'crt',
      prohibitedTitle: 'सख्त मना: कांच को पत्थर या हथौड़े से फोड़ना',
      prohibitedPractice: 'कॉपर योक निकालने के लिए सीआरटी मॉनिटर ट्यूब को कभी न फोड़ें। सीआरटी ग्लास में 2 किलो तक जहरीला सीसा (लेड) होता है। फोड़ने से कांच विस्फोटक गति से उड़ता है और लेड की धूल सांस में जाती है।',
      protocolTitle: 'अनिवार्य सीपीसीबी सुरक्षित संचालन नियम',
      correctProtocol: 'ग्लास वैक्यूम को बिना तोड़े दोनों हाथों से सावधानी से उठाएं, कार्डबोर्ड में लपेटें और सीधे अधिकृत ग्लास स्मेल्टर रिसाइकलर को पहुंचाएं।',
      ppeRequired: ['सुरक्षा चश्मा', 'मोटे चमड़े के दस्ताने', 'हाथ सुरक्षा स्लीव्स'],
      statutoryRule: 'सीपीसीबी ई-कचरा नियम: सीआरटी ग्लास को केवल विशेष बंद भट्टी में ही प्रोसेस किया जा सकता है।',
      audioScript: 'सीआरटी मॉनिटर चेतावनी: पुराने टीवी स्क्रीन या मॉनिटर को कभी पत्थर से न फोड़ें। इसके शीशे में 2 किलो जहरीला सीसा होता है और यह विस्फोटक रूप से टूट सकता है। इसे बिना तोड़े सावधानी से ले जाएं।'
    },
    motor: {
      id: 'motor',
      categoryTitle: 'इलेक्ट्रिक मोटर्स एवं कॉपर ट्रांसफॉर्मर',
      dangerLevel: 'शारीरिक चोट एवं कैपेसिटर करंट खतरा',
      dangerLevelColor: 'high',
      iconType: 'motor',
      prohibitedTitle: 'सख्त मना: मोटर कॉइल जलाना एवं करंट अनदेखा करना',
      prohibitedPractice: 'कॉपर वाइंडिंग से वार्निश हटाने के लिए कभी आग या ब्लोटॉर्च का उपयोग न करें। स्टार्टर कैपेसिटर में घातक बिजली का करंट जमा रहता है और पुराने ट्रांसफॉर्मर के तेल में कैंसरकारी पीसीबी रसायन होता है।',
      protocolTitle: 'अनिवार्य सीपीसीबी सुरक्षित संचालन नियम',
      correctProtocol: 'मोटर खोलने से पहले अर्थिंग टूल से कैपेसिटर को डिस्चार्ज करें। रिंच से नट-बोल्ट खोलकर मोटर अलग करें और कॉपर स्टेटर सीधे अधिकृत प्लांट को दें।',
      ppeRequired: ['स्टील-टो सुरक्षा जूते', 'मजबूत यांत्रिक दस्ताने', 'सुरक्षा फेस शील्ड'],
      statutoryRule: 'केंद्रीय विद्युत प्राधिकरण सुरक्षा नियम: मोटर खोलने से पहले कैपेसिटर डिस्चार्ज करना अनिवार्य है।',
      audioScript: 'इलेक्ट्रिक मोटर सुरक्षा चेतावनी: मोटर कॉइल से वार्निश हटाने के लिए कभी आग न लगाएं। मोटर खोलने से पहले कैपेसिटर को सुरक्षित रूप से डिस्चार्ज करें और रिंच का उपयोग करें।'
    },
    plastic: {
      id: 'plastic',
      categoryTitle: 'ई-कचरा कठोर प्लास्टिक (ABS / HIPS)',
      dangerLevel: 'विषैला प्लास्टिक धुआं एवं माइक्रो-डस्ट खतरा',
      dangerLevelColor: 'medium',
      iconType: 'plastic',
      prohibitedTitle: 'सख्त मना: प्लास्टिक पिघलाना या खुले में जलाना',
      prohibitedPractice: 'प्लास्टिक कैबिनेट को जगह घटाने के लिए कभी आग में न पिघलाएं और न ही जलाएं। इलेक्ट्रॉनिक प्लास्टिक में मौजूद ब्रोमीन रसायन जलने पर अत्यंत विषैली गैस छोड़ता है।',
      protocolTitle: 'अनिवार्य सीपीसीबी सुरक्षित संचालन नियम',
      correctProtocol: 'साफ प्लास्टिक के हिस्सों को अलग रखें, धूप और बारिश से बचाएं और सीधे अधिकृत प्लास्टिक पेलेटाइज़र प्लांट को सौंपें।',
      ppeRequired: ['N95 रेस्पिरेटर मास्क', 'पंचर-रोधी दस्ताने', 'सुरक्षा चश्मा'],
      statutoryRule: 'प्लास्टिक अपशिष्ट नियम: ई-कचरे के प्लास्टिक को खुले में जलाना गैर-कानूनी है।',
      audioScript: 'ई-कचरा प्लास्टिक सुरक्षा चेतावनी: कंप्यूटर कैबिनेट या प्लास्टिक केसिंग को कभी भी आग में न पिघलाएं या जलाएं। इसका धुआं बेहद जहरीला होता है। इसे साफ और सुरक्षित रूप से रिसाइकलर को दें।'
    },
    general: {
      id: 'general',
      categoryTitle: 'सामान्य इलेक्ट्रॉनिक कचरा स्क्रैप लॉट',
      dangerLevel: 'मध्यम ई-कचरा जोखिम',
      dangerLevelColor: 'medium',
      iconType: 'general',
      prohibitedTitle: 'सख्त मना: खुले में तोड़फोड़ एवं आग लगाना',
      prohibitedPractice: 'सीलबंद इलेक्ट्रॉनिक कंपोनेंट्स को हथौड़े से कभी न फोड़ें और न ही कचरे के ढेर में आग लगाएं। इससे लेड और कैडमियम का विषैला फैलाव होता है।',
      protocolTitle: 'अनिवार्य सीपीसीबी सुरक्षित संचालन नियम',
      correctProtocol: 'उपकरणों को साबुत रखें। सूखी और छायादार जगह पर लकड़ी के तख्तों पर रखें और सीधे सीपीसीबी अधिकृत केंद्र को बेचें।',
      ppeRequired: ['मजबूत दस्ताने', 'डस्ट मास्क', 'सुरक्षा चश्मा'],
      statutoryRule: 'सीपीसीबी नियम 2022: अधिकृत रिसाइकलर को देने पर ही उचित दर व सुरक्षा प्राप्त होती है।',
      audioScript: 'इलेक्ट्रॉनिक स्क्रैप सुरक्षा चेतावनी: इलेक्ट्रॉनिक कचरे को हमेशा सुरक्षा दस्ताने पहनकर संभालें। इसे खुले में न जलाएं और न ही तोड़ें। बिना तोड़े सीधे अधिकृत रिसाइकलर को दें।'
    }
  },
  mr: {
    pcb: {
      id: 'pcb',
      categoryTitle: 'प्रिंटेड सर्किट बोर्ड व मदरबोर्ड (PCB)',
      dangerLevel: 'गंभीर रासायनिक धोका',
      dangerLevelColor: 'critical',
      iconType: 'pcb',
      prohibitedTitle: 'सक्त मनाई: ॲसिडमध्ये उकळणे आणि जाळणे',
      prohibitedPractice: 'सोने किंवा चांदी काढण्यासाठी कॉम्प्युटर मदरबोर्ड उघड्यावर ॲसिडमध्ये उकळू नका किंवा जाळू नका. यातून जीवघेणा सायनाइड वायू आणि विषारी नायट्रोजन डायऑक्साइड बाहेर पडतो, ज्यामुळे फुफ्फुसांचे कायमचे नुकसान होते.',
      protocolTitle: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
      correctProtocol: 'मदरबोर्ड न तोडता अखंड ठेवा. ओलाव्यापासून दूर कोरड्या जागी साठवा आणि थेट CPCB अधिकृत रिसायकलिंग केंद्राकडे सुपूर्द करा.',
      ppeRequired: ['कट-रेझिस्टंट नायट्रिल हातमोजे', 'N95 डस्ट मास्क', 'रासायनिक गॉगल'],
      statutoryRule: 'CPCB ई-कचरा नियम २०२२: विनापरवाना ॲसिड वापरणे हा फौजदारी गुन्हा आहे.',
      audioScript: 'सर्किट बोर्ड सुरक्षा सूचना: कॉम्प्युटर मदरबोर्डवर कधीही ॲसिड टाकू नका किंवा जाळू नका. यातून विषारी वायू बाहेर पडतो. अखंड बोर्ड थेट CPCB अधिकृत रिसायकलर्सना विका.'
    },
    battery: {
      id: 'battery',
      categoryTitle: 'लिथियम-आयन व लेड ॲसिड बॅटऱ्या',
      dangerLevel: 'स्फोट व ॲसिडचा गंभीर धोका',
      dangerLevelColor: 'critical',
      iconType: 'battery',
      prohibitedTitle: 'सक्त मनाई: हातोड्याने फोडणे व छेडछाड करणे',
      prohibitedPractice: 'बॅटऱ्यांना हातोड्याने किंवा छिन्न्यांनी फोडू नका. वातावरणातील ओलाव्यामुळे लिथियम बॅटरीमध्ये १००० अंशांपर्यंत तीव्र आग लागते आणि विषारी लेड व ॲसिडमुळे त्वचा जळते.',
      protocolTitle: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
      correctProtocol: 'बॅटरीच्या दोन्ही टर्मिनल्सवर ताबडतोब इन्सुलेटिंग टेप लावा. ज्वलनशील वस्तूंपासून लांब कोरड्या वाळूत बॅटरी उभ्या स्थितीत सुरक्षित ठेवा.',
      ppeRequired: ['हेवी-ड्युटी रबर हातमोजे', 'फुल-फेस शील्ड', 'फायर-रेझिस्टंट ॲप्रन'],
      statutoryRule: 'बॅटरी कचरा व्यवस्थापन नियम २०२२: बॅटरी फोडणे किंवा ॲसिड सांडणे कायद्याने निषिद्ध आहे.',
      audioScript: 'बॅटरी सुरक्षा चेतावणी: बॅटरी कधीही फोडू नका किंवा हातोड्याने मारू नका. स्फोट आणि ॲसिड जळण्याचा मोठा धोका असतो. टर्मिनल्सना टेप लावा आणि कोरड्या वाळूत सुरक्षित ठेवा.'
    },
    wire: {
      id: 'wire',
      categoryTitle: 'इन्सुलेटेड तांब्याच्या वायर्स व केबल्स',
      dangerLevel: 'अत्यंत विषारी धूर व कर्करोगाचा धोका',
      dangerLevelColor: 'high',
      iconType: 'wire',
      prohibitedTitle: 'सक्त मनाई: उघड्यावर किंवा टायरवर केबल्स जाळणे',
      prohibitedPractice: 'तांबे काढण्यासाठी केबल्स टायरवर किंवा खड्ड्यात जाळू नका. प्लास्टिक जळाल्यामुळे डायऑक्सिनसारखा अत्यंत घातक कर्करोगजन्य धूर तयार होतो, ज्यामुळे फुफ्फुसांचा कर्करोग होतो.',
      protocolTitle: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
      correctProtocol: 'मेकॅनिकल वायर स्ट्रिपिंग टूलने प्लास्टिक काढा किंवा संपूर्ण अखंड केबल्स थेट ग्रॅन्युलेटर असलेल्या अधिकृत रिसायकलरला विका.',
      ppeRequired: ['कट-रेझिस्टंट हातमोजे', 'सेफ्टी बूट', 'N95 डस्ट मास्क'],
      statutoryRule: 'NGT आदेश: उघड्यावर वायर्स जाळणे हा अजामीनपात्र गुन्हा आहे.',
      audioScript: 'तांब्याची वायर चेतावणी: तांबे काढण्यासाठी वायर्स उघड्यावर जाळू नका. यातून कर्करोग निर्माण करणारा धूर येतो. मेकॅनिकल पद्धत वापरा किंवा थेट रिसायकलरला विका.'
    },
    crt: {
      id: 'crt',
      categoryTitle: 'सीआरटी मॉनिटर व टीव्ही ग्लास',
      dangerLevel: 'काचेचा स्फोट व विषारी शिसे (Lead) धोका',
      dangerLevelColor: 'high',
      iconType: 'crt',
      prohibitedTitle: 'सक्त मनाई: काच दगडाने किंवा हातोड्याने फोडणे',
      prohibitedPractice: 'सीआरटी टीव्ही काच कधीही दगडाने फोडू नका. या काचेमध्ये २ किलोपर्यंत विषारी शिसे असते, जे शरीरासाठी अत्यंत घातक आहे आणि काचेचे तुकडे उडून गंभीर इजा होते.',
      protocolTitle: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
      correctProtocol: 'व्हॅक्यूम न फोडता दोन्ही हातांनी सावकाश हाताळा, कार्डबोर्डमध्ये गुंडाळा आणि अधिकृत रिसायकलरकडे जमा करा.',
      ppeRequired: ['सेफ्टी गॉगल', 'जाड चामड्याचे हातमोजे', 'आर्म स्लीव्हज'],
      statutoryRule: 'CPCB नियम: सीआरटी ग्लास फक्त बंदिस्त भट्टीतच प्रक्रिया करता येतो.',
      audioScript: 'सीआरटी मॉनिटर चेतावणी: टीव्ही काच फोडू नका. यात विषारी शिसे असते जे आरोग्यासाठी अत्यंत घातक आहे. कार्डबोर्डमध्ये गुंडाळून सुरक्षित वाहतूक करा.'
    },
    motor: {
      id: 'motor',
      categoryTitle: 'इलेक्ट्रिक मोटर्स व ट्रान्सफॉर्मर्स',
      dangerLevel: 'शारीरिक दुखापत व विजेचा धक्का धोका',
      dangerLevelColor: 'high',
      iconType: 'motor',
      prohibitedTitle: 'सक्त मनाई: मोटर वाइंडिंग जाळणे व करंटकडे दुर्लक्ष',
      prohibitedPractice: 'कॉपर वायरवरील वार्निश काढण्यासाठी मोटर जाळू नका. कपॅसिटरमधील साठवलेल्या विजेचा तीव्र धक्का बसू शकतो आणि जुन्या तेलात विषारी पीसीबी रसायने असतात.',
      protocolTitle: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
      correctProtocol: 'काम सुरू करण्यापूर्वी कपॅसिटर डिस्चार्ज करा. योग्य टूल्स वापरून मोटर नट-बोल्ट उघडा आणि कॉपर कोर सुरक्षित रिसायकलरला द्या.',
      ppeRequired: ['सेफ्टी शूज', 'मेकॅनिकल हातमोजे', 'सेफ्टी गॉगल'],
      statutoryRule: 'विद्युत सुरक्षा नियम: मोटर उघडण्यापूर्वी कपॅसिटर डिस्चार्ज करणे बंधनकारक आहे.',
      audioScript: 'इलेक्ट्रिक मोटर सुरक्षा चेतावणी: कॉइलवरील वार्निश काढण्यासाठी मोटर कधीही जाळू नका. आधी कपॅसिटर डिस्चार्ज करा आणि योग्य साधनांचा वापर करा.'
    },
    plastic: {
      id: 'plastic',
      categoryTitle: 'ई-कचरा कडक प्लॅस्टिक (ABS / HIPS)',
      dangerLevel: 'विषारी गॅस व मायक्रो-डस्ट धोका',
      dangerLevelColor: 'medium',
      iconType: 'plastic',
      prohibitedTitle: 'सक्त मनाई: प्लॅस्टिक वितळवणे किंवा जाळणे',
      prohibitedPractice: 'प्लॅस्टिक कॅबिनेट किंवा कव्हर उघड्यावर वितळवू नका किंवा जाळू नका. ज्वालाग्राही-रोधी प्लॅस्टिक जळल्यास अत्यंत घातक वायू तयार होतो.',
      protocolTitle: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
      correctProtocol: 'मॉनिटर आणि प्रिंटरचे प्लॅस्टिक कव्हर स्वच्छ ठेवा, उन्हापासून वाचवा आणि अधिकृत प्लॅस्टिक प्रक्रिया केंद्राला सोपवा.',
      ppeRequired: ['N95 डस्ट मास्क', 'कडक हातमोजे', 'डोळ्यांसाठी गॉगल'],
      statutoryRule: 'प्लॅस्टिक नियम: ई-कचऱ्याचे प्लॅस्टिक उघड्यावर जाळणे कायद्याने निषिद्ध आहे.',
      audioScript: 'प्लॅस्टिक सुरक्षा चेतावणी: कॉम्प्युटर कॅबिनेट किंवा प्लॅस्टिकचे सुटे भाग कधीही जाळू नका. याचा धूर फुफ्फुसांसाठी विषारी असतो. स्वच्छ प्लॅस्टिक थेट रिसायकलरला द्या.'
    },
    general: {
      id: 'general',
      categoryTitle: 'सर्वसाधारण इलेक्ट्रॉनिक कचरा (E-Waste)',
      dangerLevel: 'मध्यम ई-कचरा धोका',
      dangerLevelColor: 'medium',
      iconType: 'general',
      prohibitedTitle: 'सक्त मनाई: उघड्यावर तोडफोड व जाळपोळ',
      prohibitedPractice: 'सील केलेले पार्ट किंवा पॉवर सप्लाय हातोड्याने फोडू नका आणि स्क्रॅपला आग लावू नका. यामुळे लेड आणि कॅडमियमचा धोका उद्भवतो.',
      protocolTitle: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
      correctProtocol: 'उपकरणे अखंड ठेवा, कोरड्या जागेत साठवा आणि थेट CPCB नोंदणीकृत रिसायकलरकडे जमा करा.',
      ppeRequired: ['मजबूत हातमोजे', 'डस्ट मास्क', 'सेफ्टी गॉगल'],
      statutoryRule: 'CPCB नियम २०२२: अधिकृत रिसायकलरला दिल्यास हमीभाव व पर्यावरण सुरक्षा मिळते.',
      audioScript: 'इलेक्ट्रॉनिक कचरा सुरक्षा चेतावणी: सर्व ई-कचरा हातमोजे घालून हाताळा. उघड्यावर जाळू नका किंवा फोडू नका. थेट CPCB अधिकृत रिसायकलरला सुरक्षितपणे विका.'
    }
  },
  ta: {
    pcb: {
      id: 'pcb',
      categoryTitle: 'அச்சிடப்பட்ட சுற்றுப்பலகைகள் & மதர்போர்டுகள் (PCB)',
      dangerLevel: 'தீவிர ரசாயன ஆபத்து',
      dangerLevelColor: 'critical',
      iconType: 'pcb',
      prohibitedTitle: 'முற்றிலும் தடை: அமிலத்தில் வேகவைத்தல் & தீயில் எரித்தல்',
      prohibitedPractice: 'தங்கம் அல்லது வெள்ளி எடுக்க மதர்போர்டுகளை அமிலத்திலோ அல்லது தீயிலோ எரிக்க வேண்டாம். இது கொடிய சயனைடு மற்றும் நைட்ரஜன் டை ஆக்சைடு நச்சு வாயுவை வெளியிடும்.',
      protocolTitle: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
      correctProtocol: 'பலகைகளை உடைக்காமல் அப்படியே முழுமையாக வைக்கவும். CPCB அங்கீகரிக்கப்பட்ட மறுசுழற்சி ஆலைகளிடம் நேரில் ஒப்படைக்கவும்.',
      ppeRequired: ['நைட்ரைல் கையுறைகள்', 'N95 முகக்கவசம்', 'பாதுகாப்பு கண்ணாடிகள்'],
      statutoryRule: 'CPCB விதிகள் 2022: அமிலத்தைப் பயன்படுத்துவது சுற்றுச்சூழல் பாதுகாப்பு சட்டத்தின் கீழ் தண்டனைக்குரியது.',
      audioScript: 'சுற்றுப்பலகை பாதுகாப்பு எச்சரிக்கை: கம்ப்யூட்டர் மதர்போர்டுகளை அமிலத்திலோ அல்லது தீயிலோ எரிக்க வேண்டாம். இது விஷ வாயுவை வெளியிடும். அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளரிடம் அப்படியே ஒப்படைக்கவும்.'
    },
    battery: {
      id: 'battery',
      categoryTitle: 'லித்தியம்-அயன் மற்றும் லெட் ஆசிட் பேட்டரிகள்',
      dangerLevel: 'தீவிர வெடிப்பு & அமில ஆபத்து',
      dangerLevelColor: 'critical',
      iconType: 'battery',
      prohibitedTitle: 'முற்றிலும் தடை: உடைத்தல், சுத்தியலால் அடித்தல் & ஷார்ட் செய்தல்',
      prohibitedPractice: 'பேட்டரிகளை ஒருபோதும் உடைக்கவோ அல்லது சுத்தியலால் தட்டவோ கூடாது. இது உடனடியாக 1000 டிகிரி வரை வெடித்து கடுமையான ரசாயன தீ மற்றும் அமில தீக்காயங்களை ஏற்படுத்தும்.',
      protocolTitle: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
      correctProtocol: 'பேட்டரி முனைகளை பிவிசி டேப் கொண்டு ஒட்டவும். தீப்பிடிக்காதவாறு உலர்ந்த மணல் நிரப்பப்பட்ட பெட்டியில் நேராக வைக்கவும்.',
      ppeRequired: ['ரப்பர் கையுறைகள்', 'முழு முக கவசம்', 'தீ தடுப்பு ஆடை'],
      statutoryRule: 'பேட்டரி கழிவு விதிகள் 2022: பேட்டரியை உடைப்பது அல்லது அமிலத்தை ஊற்றுவது முற்றிலும் தடைசெய்யப்பட்டுள்ளது.',
      audioScript: 'பேட்டரி பாதுகாப்பு எச்சரிக்கை: லித்தியம் அல்லது லெட் ஆசிட் பேட்டரிகளை உடைக்கவோ அல்லது தட்டவோ வேண்டாம். வெடிக்கும் அபாயம் உள்ளது. முனைகளில் டேப் ஒட்டி, உலர்ந்த மணலில் நிமிர்த்தி வைக்கவும்.'
    },
    wire: {
      id: 'wire',
      categoryTitle: 'காப்பிடப்பட்ட தாமிர கம்பிகள் & கேபிள்கள்',
      dangerLevel: 'அதிக நச்சுப் புகை & புற்றுநோய் ஆபத்து',
      dangerLevelColor: 'high',
      iconType: 'wire',
      prohibitedTitle: 'முற்றிலும் தடை: திறந்த வெளியில் அல்லது டயர்களில் எரிப்பது',
      prohibitedPractice: 'தாமிரத்தை எடுக்க வயர்களை ஒருபோதும் தீயிலோ அல்லது டயர்களிலோ எரிக்க வேண்டாம். பிளாஸ்டிக் எரிவது கொடிய புற்றுநோய் உண்டாக்கும் டையாக்சின் புகையை உருவாக்கும்.',
      protocolTitle: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
      correctProtocol: 'கம்பி உரிக்கும் இயந்திரக் கருவிகளைப் பயன்படுத்தவும் அல்லது முழு கேபிள்களை மறுசுழற்சி ஆலைக்கு நேரடியாக விற்கவும்.',
      ppeRequired: ['பாதுகாப்பு கையுறைகள்', 'பாதுகாப்பு காலணிகள்', 'N95 முகக்கவசம்'],
      statutoryRule: 'தேசிய பசுமை தீர்ப்பாயம்: வயர்களை எரிப்பது காற்று மாசு சட்டத்தின் கீழ் பிணையில் வர முடியாத குற்றமாகும்.',
      audioScript: 'தாமிர கம்பி பாதுகாப்பு: தாமிரத்தை எடுக்க வயர்களை ஒருபோதும் எரிக்க வேண்டாம். பிளாஸ்டிக் எரிவது கொடிய புற்றுநோய் புகையை உண்டாக்கும். இயந்திர முறையில் உரிக்கவும்.'
    },
    crt: {
      id: 'crt',
      categoryTitle: 'சிஆர்டி மானிட்டர்கள் & தொலைக்காட்சி கண்ணாடி',
      dangerLevel: 'கண்ணாடி வெடிப்பு & நச்சு ஈய ஆபத்து',
      dangerLevelColor: 'high',
      iconType: 'crt',
      prohibitedTitle: 'முற்றிலும் தடை: கண்ணாடியை சுத்தியலால் உடைப்பது',
      prohibitedPractice: 'பழைய டிவி மானிட்டர் குழாய்களை சுத்தியலால் உடைக்காதீர்கள். இதில் 2 கிலோ வரை நச்சுத்தன்மை வாய்ந்த ஈயப் பொடி உள்ளது, மேலும் இது வெடித்து கடுமையான காயங்களை ஏற்படுத்தும்.',
      protocolTitle: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
      correctProtocol: 'கண்ணாடியை உடைக்காமல் இரு கைகளாலும் கவனமாக எடுத்துச் செல்லுங்கள், அட்டைப்பெட்டியில் சுற்றி பாதுகாப்பாக மறுசுழற்சியாளரிடம் வழங்கவும்.',
      ppeRequired: ['கண் கண்ணாடி', 'தோல் கையுறைகள்', 'கை உறைகள்'],
      statutoryRule: 'CPCB விதிகள்: சிஆர்டி கண்ணாடியை மூடிய உலையில் மட்டுமே உருக வைக்க முடியும்.',
      audioScript: 'சிஆர்டி மானிட்டர் எச்சரிக்கை: பழைய டிவி கண்ணாடியை உடைக்காதீர்கள். இதில் கொடிய நச்சு ஈயம் உள்ளது மற்றும் வெடிக்கும் அபாயம் உண்டு. கவனமாக எடுத்துச் செல்லுங்கள்.'
    },
    motor: {
      id: 'motor',
      categoryTitle: 'மின் மோட்டார்கள் & டிரான்ஸ்பார்மர்கள்',
      dangerLevel: 'கடுமையான காயம் & மின்சார அதிர்ச்சி ஆபத்து',
      dangerLevelColor: 'high',
      iconType: 'motor',
      prohibitedTitle: 'முற்றிலும் தடை: மோட்டார் காயிலை எரிப்பது & மின்சார ஆபத்து',
      prohibitedPractice: 'தாமிர கம்பியிலிருந்து வார்னிஷை உருக வைக்க தீயைப் பயன்படுத்த வேண்டாம். கெபாசிட்டர்களில் தேங்கியுள்ள உயர் மின்சார அதிர்ச்சி குறித்து எச்சரிக்கையாக இருங்கள்.',
      protocolTitle: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
      correctProtocol: 'பிரிப்பதற்கு முன் கெபாசிட்டரை பாதுகாப்பாக டிஸ்சார்ஜ் செய்யவும். ரெஞ்ச் மூலம் திருகுகளைப் பிரித்து தாமிரத்தை பாதுகாப்பாக வழங்கவும்.',
      ppeRequired: ['பாதுகாப்பு காலணிகள்', 'கனரக கையுறைகள்', 'முக கவசம்'],
      statutoryRule: 'மத்திய மின்சார ஆணைய விதிகள்: மோட்டாரைப் பிரிப்பதற்கு முன் கெபாசிட்டரை டிஸ்சார்ஜ் செய்வது கட்டாயமாகும்.',
      audioScript: 'மின் மோட்டார் பாதுகாப்பு எச்சரிக்கை: தாமிரத்தை எடுக்க மோட்டார் காயில்களை எரிக்க வேண்டாம். கெபாசிட்டர்களை பாதுகாப்பாக டிஸ்சார்ஜ் செய்துவிட்டு மெக்கானிக்கல் முறையில் பிரிக்கவும்.'
    },
    plastic: {
      id: 'plastic',
      categoryTitle: 'மின்-கழிவு கடின பிளாஸ்டிக் (ABS / HIPS)',
      dangerLevel: 'நச்சு பாலிமர் புகை & மைக்ரோ-தூசி ஆபத்து',
      dangerLevelColor: 'medium',
      iconType: 'plastic',
      prohibitedTitle: 'முற்றிலும் தடை: பிளாஸ்டிக்கை உருக்குவது அல்லது எரிப்பது',
      prohibitedPractice: 'பிளாஸ்டிக் உறைகளை திறந்த வெளியில் எரிக்கவோ அல்லது உருக்கவோ வேண்டாம். தீ-தடுப்பு பிளாஸ்டிக் எரியும் போது கொடிய நச்சு வாயுக்களை வெளியிடும்.',
      protocolTitle: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
      correctProtocol: 'கணினி மற்றும் அச்சுப்பொறி பிளாஸ்டிக் உறைகளை சுத்தமாகப் பிரித்து, நிழலான இடத்தில் வைத்து, அங்கீகரிக்கப்பட்ட ஆலைகளிடம் ஒப்படைக்கவும்.',
      ppeRequired: ['N95 தூசி முகக்கவசம்', 'பாதுகாப்பு கையுறைகள்', 'கண் கண்ணாடி'],
      statutoryRule: 'பிளாஸ்டிக் விதிகள்: மின்-கழிவு பிளாஸ்டிக்கை எரிப்பது சட்டவிரோதமானது.',
      audioScript: 'மின் கழிவு பிளாஸ்டிக் பாதுகாப்பு: பிளாஸ்டிக் உறை பாகங்களை ஒருபோதும் தீயில் எரிக்க வேண்டாம். இதன் நச்சுப் புகை உடலுக்கு மிகுந்த தீங்கு விளைவிக்கும். சுத்தமாகப் பிரித்து ஆலைக்கு விற்கவும்.'
    },
    general: {
      id: 'general',
      categoryTitle: 'பொதுவான மின்னணுக் கழிவுத் தொகுதி',
      dangerLevel: 'கலப்பு கன உலோக ஆபத்து',
      dangerLevelColor: 'medium',
      iconType: 'general',
      prohibitedTitle: 'முற்றிலும் தடை: உடைப்பது & தீ வைப்பது',
      prohibitedPractice: 'மூடப்பட்ட பாகங்களை உடைக்கவோ அல்லது கழிவுக் குவியல்களை எரிக்கவோ வேண்டாம். இது ஈயம் மற்றும் காட்மியம் நச்சுப் பரவலை உண்டாக்கும்.',
      protocolTitle: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
      correctProtocol: 'மின்னணு சாதனங்களை அப்படியே முழுமையாக வைத்திருந்து, உலர்ந்த இடத்தில் சேமித்து, பதிவு செய்யப்பட்ட ஆலைகளிடம் ஒப்படைக்கவும்.',
      ppeRequired: ['தடிமனான கையுறைகள்', 'தூசி முகக்கவசம்', 'பாதுகாப்பு கண் கண்ணாடி'],
      statutoryRule: 'CPCB விதிகள் 2022: அங்கீகரிக்கப்பட்ட ஆலைகளிடம் ஒப்படைப்பது பாதுகாப்பு மற்றும் நியாய விலையை உறுதி செய்கிறது.',
      audioScript: 'மின்னணுக் கழிவு பாதுகாப்பு எச்சரிக்கை: மின்னணுக் கழிவுகளை எப்போதும் பாதுகாப்பு கையுறைகளுடன் கையாளவும். எரிக்கவோ அல்லது உடைக்கவோ வேண்டாம். அங்கீகரிக்கப்பட்ட ஆலைகளிடம் ஒப்படைக்கவும்.'
    }
  }
};

const UI_TEXT: Record<VernacularLang, {
  statutoryBanner: string;
  voiceAssistActive: string;
  voiceAssistPlaying: string;
  listenVoiceAssist: string;
  pauseVoice: string;
  loadingVoice: string;
  tailoredNotice: (cat: string) => string;
  prohibitedLabel: string;
  protocolLabel: string;
  ppeLabel: string;
  helplineTitle: string;
  helplineNumber: string;
  firstAidNote: string;
  confirmCheckbox: string;
  proceedBtn: string;
  detectedGrade: string;
}> = {
  en: {
    statutoryBanner: 'STATUTORY SAFETY GUIDANCE — AI PREDICTION DETECTED',
    voiceAssistActive: 'Voice Assist Ready',
    voiceAssistPlaying: 'Voice Assist Speaking...',
    listenVoiceAssist: 'Listen Voice Assist',
    pauseVoice: 'Pause Voice',
    loadingVoice: 'Loading Voice...',
    tailoredNotice: (cat) => `Safety guidance tailored specifically for your predicted scrap: ${cat}`,
    prohibitedLabel: 'STRICTLY PROHIBITED INFORMAL PRACTICE',
    protocolLabel: 'MANDATORY CPCB SAFE HANDLING PROTOCOL',
    ppeLabel: 'MANDATORY PROTECTIVE EQUIPMENT (PPE)',
    helplineTitle: 'Emergency 24/7 Chemical Exposure & Poison Helpline',
    helplineNumber: '1800-116-117 (Toll-Free CPCB & AIIMS Toxicology)',
    firstAidNote: 'First Aid: Flush contaminated skin/eyes with clean cold water for 15 minutes immediately. Do not induce vomiting if fumes are inhaled.',
    confirmCheckbox: 'I have listened to and understood these specific safety instructions and confirm I will handle this material safely without burning or acid leaching.',
    proceedBtn: 'Acknowledge & Proceed to Weighment',
    detectedGrade: 'AI Predicted Scrap Category'
  },
  hi: {
    statutoryBanner: 'वैधानिक सुरक्षा मार्गदर्शन — एआई भविष्यवाणी पहचानी गई',
    voiceAssistActive: 'आवाज़ सहायता तैयार',
    voiceAssistPlaying: 'आवाज़ में सुरक्षा निर्देश जारी...',
    listenVoiceAssist: 'आवाज़ सहायता सुनें',
    pauseVoice: 'आवाज़ रोकें',
    loadingVoice: 'आवाज़ लोड हो रही है...',
    tailoredNotice: (cat) => `पहचाने गए स्क्रैप हेतु विशेष सुरक्षा निर्देश: ${cat}`,
    prohibitedLabel: 'सख्त निषिद्ध अनधिकृत गतिविधियां',
    protocolLabel: 'अनिवार्य सीपीसीबी सुरक्षित निपटान प्रोटोकॉल',
    ppeLabel: 'अनिवार्य व्यक्तिगत सुरक्षा उपकरण (PPE)',
    helplineTitle: 'आपातकालीन 24/7 रासायनिक विष नियंत्रण हेल्पलाइन',
    helplineNumber: '1800-116-117 (टोल-फ्री सीपीसीबी एवं एम्स टॉक्सिकोलॉजी)',
    firstAidNote: 'प्राथमिक उपचार: त्वचा या आंख में रसायन जाने पर तुरंत 15 मिनट तक ठंडे स्वच्छ पानी से धोएं। धुआं जाने पर तुरंत खुली ताजी हवा में जाएं।',
    confirmCheckbox: 'मैंने इन विशिष्ट सुरक्षा निर्देशों को सुन व समझ लिया है और पुष्टि करता हूँ कि मैं इस सामग्री को बिना जलाए व बिना तेजाब डाले सुरक्षित रूप से संभालूँगा।',
    proceedBtn: 'स्वीकार करें और वजन व मूल्य पर आगे बढ़ें',
    detectedGrade: 'एआई द्वारा पहचानी गई ई-कचरा श्रेणी'
  },
  mr: {
    statutoryBanner: 'कायदेशीर सुरक्षा मार्गदर्शन — AI द्वारे ओळखलेला प्रवर्ग',
    voiceAssistActive: 'आवाज सहाय्य सज्ज',
    voiceAssistPlaying: 'आवाज मार्गदर्शन सुरू आहे...',
    listenVoiceAssist: 'आवाजात ऐका',
    pauseVoice: 'आवाज थांबवा',
    loadingVoice: 'आवाज लोड होत आहे...',
    tailoredNotice: (cat) => `ओळखलेल्या स्क्रॅपसाठी विशेष सुरक्षा नियम: ${cat}`,
    prohibitedLabel: 'सक्त मनाई असलेल्या अनधिकृत पद्धती',
    protocolLabel: 'अनिवार्य CPCB सुरक्षित हाताळणी नियमावली',
    ppeLabel: 'अनिवार्य वैयक्तिक सुरक्षा उपकरणे (PPE)',
    helplineTitle: 'तातडीची २४/७ विषबाधा व रासायनिक नियंत्रण हेल्पलाइन',
    helplineNumber: '१८००-११६-११७ (टोल-फ्री CPCB व एम्स विष नियंत्रण कक्ष)',
    firstAidNote: 'प्रथमोपचार: बाधित त्वचेवर ताबडतोब १५ मिनिटे स्वच्छ थंड पाणी ओता. धूर गेल्यास ताबडतोब मोकळ्या हवेत जा.',
    confirmCheckbox: 'मी या विशिष्ट सुरक्षा सूचना ऐकल्या आणि समजून घेतल्या आहेत आणि ही सामग्री न जाळता व ॲसिड न वापरता सुरक्षितपणे हाताळण्याची खात्री देतो.',
    proceedBtn: 'मान्य करा आणि वजन व दराकडे पुढे चला',
    detectedGrade: 'AI द्वारे तपासलेला ई-कचरा प्रकार'
  },
  ta: {
    statutoryBanner: 'சட்டப்பூர்வ பாதுகாப்பு வழிகாட்டுதல் — ஏஐ வகை கண்டறியப்பட்டது',
    voiceAssistActive: 'குரல் உதவி தயார்',
    voiceAssistPlaying: 'குரல் பாதுகாப்பு வழிகாட்டுகிறது...',
    listenVoiceAssist: 'குரல் வழிகாட்டலைக் கேட்க',
    pauseVoice: 'குரலை நிறுத்து',
    loadingVoice: 'குரல் ஏற்றுகிறது...',
    tailoredNotice: (cat) => `கண்டறியப்பட்ட கழிவுக்கான பிரத்யேக பாதுகாப்பு வழிகாட்டுதல்: ${cat}`,
    prohibitedLabel: 'கடுமையாக தடைசெய்யப்பட்ட முறைசாரா நடைமுறைகள்',
    protocolLabel: 'கட்டாய CPCB பாதுகாப்பான கையாளும் நெறிமுறை',
    ppeLabel: 'கட்டாய தனிநபர் பாதுகாப்பு உபகரணங்கள் (PPE)',
    helplineTitle: 'அவசர 24/7 ரசாயன நச்சுக்கட்டுப்பாட்டு உதவி எண்',
    helplineNumber: '1800-116-117 (கட்டணமில்லா CPCB & எய்ம்ஸ் நச்சு மையம்)',
    firstAidNote: 'முதலுதவி: பாதிக்கப்பட்ட தோல் அல்லது கண்களை உடனடியாக 15 நிமிடங்களுக்கு குளிர்ந்த நீரால் கழுவவும். புகை சுவாசித்தால் திறந்த காற்றுக்கு செல்லவும்.',
    confirmCheckbox: 'இந்த குறிப்பிட்ட பாதுகாப்பு வழிமுறைகளை நான் கேட்டுப் புரிந்து கொண்டேன், மேலும் இந்த பொருளை எரிக்காமலும் அமிலத்தில் போடாமலும் பாதுகாப்பாக கையாளுவேன் என உறுதி செய்கிறேன்.',
    proceedBtn: 'ஏற்றுக்கொண்டு எடை மற்றும் விலைக்கு தொடரவும்',
    detectedGrade: 'ஏஐ மூலம் கண்டறியப்பட்ட மின்-கழிவு வகை'
  }
};

export const SafetyGuidanceModal: React.FC<SafetyGuidanceModalProps> = ({
  isOpen,
  category,
  lang,
  onAcknowledge
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const ui = UI_TEXT[lang] || UI_TEXT.en;
  const categoryKey = detectSafetyCategoryKey(category);
  const dataset = CATEGORY_SAFETY_MAP[lang] || CATEGORY_SAFETY_MAP.en;
  const profile = dataset[categoryKey] || dataset.general;

  // Auto-play Voice Assist when modal opens for the predicted category
  useEffect(() => {
    let timer: any = null;
    if (isOpen) {
      setAgreed(false);

      // Auto-trigger voice narration after modal entry animation
      timer = setTimeout(() => {
        vernacularAudio.play('safety-modal', profile.audioScript, lang).catch((err) => {
          console.warn('Voice assist autoplay blocked or interrupted:', err);
        });
      }, 400);
    } else {
      vernacularAudio.stop();
    }

    return () => {
      if (timer) clearTimeout(timer);
      vernacularAudio.stop();
    };
  }, [isOpen, categoryKey, lang, profile.audioScript]);

  // Track audio playback state
  useEffect(() => {
    const unsub = vernacularAudio.subscribe((activeId, playing, loading) => {
      if (activeId === 'safety-modal') {
        setIsPlayingAudio(playing);
        setIsAudioLoading(loading);
      } else {
        setIsPlayingAudio(false);
        setIsAudioLoading(false);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      vernacularAudio.stop();
    } else {
      vernacularAudio.play('safety-modal', profile.audioScript, lang);
    }
  };

  const handleConfirm = () => {
    vernacularAudio.stop();
    onAcknowledge();
  };

  const getCategoryIcon = () => {
    switch (profile.iconType) {
      case 'pcb':
        return <Layers className="w-6 h-6 text-amber-300" />;
      case 'battery':
        return <BatteryCharging className="w-6 h-6 text-rose-300" />;
      case 'wire':
        return <Flame className="w-6 h-6 text-orange-300" />;
      case 'crt':
        return <AlertTriangle className="w-6 h-6 text-yellow-300" />;
      case 'motor':
        return <Wrench className="w-6 h-6 text-emerald-300" />;
      case 'plastic':
        return <Package className="w-6 h-6 text-cyan-300" />;
      default:
        return <ShieldAlert className="w-6 h-6 text-amber-300" />;
    }
  };

  const getDangerBadgeClass = () => {
    switch (profile.dangerLevelColor) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-1 ring-blue-500/30';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-amber-500/80 flex flex-col max-h-[92vh]">
        {/* Top Statutory Warning Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-slate-950 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-950/90 block truncate">
                {ui.statutoryBanner}
              </span>
              <h3 className="text-sm sm:text-base font-black tracking-tight truncate">
                {profile.categoryTitle}
              </h3>
            </div>
          </div>

          {/* Voice Assist Button with Animated Soundwave Indicator */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0 ${
              isPlayingAudio
                ? 'bg-rose-600 text-white ring-2 ring-rose-300 animate-pulse'
                : 'bg-slate-950 text-amber-300 hover:bg-slate-900 active:scale-95'
            }`}
            title="Toggle vernacluar voice narration"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden xs:inline">{ui.pauseVoice}</span>
                {/* Visual Equalizer Bars */}
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-2 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{isAudioLoading ? ui.loadingVoice : ui.listenVoiceAssist}</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Target Scrap Category Header Pill */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 shrink-0">
                {getCategoryIcon()}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {ui.detectedGrade}
                </span>
                <span className="text-sm font-black text-white">
                  {profile.categoryTitle}
                </span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border tracking-wider self-start sm:self-center ${getDangerBadgeClass()}`}>
              {profile.dangerLevel}
            </span>
          </div>

          {/* Voice Assist Playing Banner */}
          <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            isPlayingAudio
              ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
              : 'bg-slate-800/50 border-slate-700/80 text-slate-300'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isPlayingAudio ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-xs font-bold">
                {isPlayingAudio ? ui.voiceAssistPlaying : ui.voiceAssistActive}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {lang === 'hi' ? 'हिंदी आवाज़' : lang === 'mr' ? 'मराठी आवाज' : lang === 'ta' ? 'தமிழ் குரல்' : 'English Voice'}
            </span>
          </div>

          {/* Prohibited Informal Practices — SPECIFIC ONLY TO PREDICTED CATEGORY */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <Flame className="w-5 h-5 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                {profile.prohibitedTitle}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
              {profile.prohibitedPractice}
            </p>
          </div>

          {/* Mandatory CPCB Safe Handling Protocol — SPECIFIC ONLY TO PREDICTED CATEGORY */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                {profile.protocolTitle}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              {profile.correctProtocol}
            </p>
          </div>

          {/* Mandatory Personal Protective Equipment (PPE) */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              {ui.ppeLabel}
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.ppeRequired.map((ppe, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-600 text-xs font-bold text-amber-200 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{ppe}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Statutory Rule Citation */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px] flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{profile.statutoryRule}</span>
          </div>

          {/* 24/7 Emergency Chemical Helpline Card */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>{ui.helplineTitle}</span>
            </div>
            <p className="text-[11px] font-bold text-white">
              {ui.helplineNumber}
            </p>
            <p className="text-[10px] text-amber-100/80">
              {ui.firstAidNote}
            </p>
          </div>

          {/* Statutory Acknowledgement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-200 font-semibold leading-normal select-none">
                {ui.confirmCheckbox}
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer with Confirmation Button */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 font-semibold">
            {profile.dangerLevel} • {lang.toUpperCase()}
          </span>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!agreed}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{ui.proceedBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
