import React, { useState, useEffect } from 'react';
import { VernacularLang } from '../../types';
import { translations } from '../../translations';
import { vernacularAudio } from '../../utils/audioPlayer';
import {
  ShieldAlert, Volume2, VolumeX, AlertTriangle, Flame, Droplets,
  BatteryCharging, Sparkles, CheckCircle2, PhoneCall, ShieldCheck, HeartPulse
} from 'lucide-react';

interface SafetyGuidanceModuleProps {
  lang: VernacularLang;
}

interface SafetyItem {
  id: string;
  categoryName: string;
  dangerLevel: string;
  prohibitedPractice: string;
  correctProtocol: string;
  ppeRequired: string[];
  audioScript: Record<VernacularLang, string>;
}

const SAFETY_DATA_LOCALIZED: Record<VernacularLang, SafetyItem[]> = {
  en: [
    {
      id: 'pcb',
      categoryName: 'PCB (Printed Circuit Boards & Motherboards)',
      dangerLevel: 'Critical Hazard',
      prohibitedPractice: 'NEVER boil in open acid (aqua regia/cyanide) or burn on charcoal stoves to extract gold. Releases lethal cyanide gas and nitrogen dioxide.',
      correctProtocol: 'Sell intact, unbroken motherboards directly to CPCB authorized pyrometallurgical recovery plants with scrubber systems.',
      ppeRequired: ['Cut-resistant nitrile gloves', 'N95 dust particulate mask', 'Safety goggles'],
      audioScript: {
        en: 'Warning on Circuit Boards: Never use acid leaching or cyanide boiling on computer motherboards. Open burning releases lethal nitrogen dioxide gas. Always sell intact boards to authorized refiners.',
        hi: 'सर्किट बोर्ड सुरक्षा चेतावनी: मदरबोर्ड पर कभी भी तेजाब या साइनाइड न डालें और न ही आग में जलाएं। यह जानलेवा धुआं पैदा करता है। इसे सीधे सीपीसीबी अधिकृत रिसाइकलर को बेचें।',
        ta: 'சுற்றுப்பலகை பாதுகாப்பு எச்சரிக்கை: கம்ப்யூட்டர் மதர்போர்டுகளை அமிலத்திலோ அல்லது தீயிலோ எரிக்க வேண்டாம். இது விஷ வாயுவை வெளியிடும். அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளரிடம் அப்படியே ஒப்படைக்கவும்.',
        mr: 'सर्किट बोर्ड सुरक्षा सूचना: कॉम्प्युटर मदरबोर्डवर कधीही ऍसिड टाकू नका किंवा जाळू नका. यातून विषारी वायू बाहेर पडतो. अधिकृत रिसायकलर्सना थेट विका.'
      }
    },
    {
      id: 'battery',
      categoryName: 'Lithium-Ion & Lead Acid Batteries',
      dangerLevel: 'Critical Hazard',
      prohibitedPractice: 'NEVER puncture, crush, or disassemble batteries with hammers or chisels. Explodes on contact with atmospheric moisture and causes toxic lead poisoning.',
      correctProtocol: 'Tape battery terminal contacts with insulating PVC tape. Store upright in a dry plastic tub away from flammable materials.',
      ppeRequired: ['Heavy-duty rubber gloves', 'Full face safety shield', 'Fire-retardant apron'],
      audioScript: {
        en: 'Warning on Batteries: Never puncture or break lithium-ion or lead-acid batteries. Risk of chemical explosion and acid burns. Store upright in dry sand.',
        hi: 'बैटरी सुरक्षा चेतावनी: लिथियम या लेड एसिड बैटरी को कभी न तोड़ें या हथौड़े से न मारें। यह फट सकती है और गंभीर एसिड बर्न कर सकती है। इसे सूखी जगह पर सीधा रखें।',
        ta: 'பேட்டரி பாதுகாப்பு எச்சரிக்கை: லித்தியம் அல்லது லெட் ஆசிட் பேட்டரிகளை உடைக்கவோ அல்லது தட்டவோ வேண்டாம். வெடிக்கும் அபாயம் உள்ளது. எப்போதும் நேராக நிமிர்த்தி வைக்கவும்.',
        mr: 'बॅटरी सुरक्षा चेतावणी: बॅटरी कधीही फोडू नका. स्फोट आणि ऍसिड जळण्याचा मोठा धोका असतो. कोरड्या जागी सुरक्षित ठेवा.'
      }
    },
    {
      id: 'copper_wire',
      categoryName: 'Insulated Copper Wires & Power Cables',
      dangerLevel: 'High Hazard',
      prohibitedPractice: 'NEVER burn insulated cables in open pits or tires. Open burning of PVC releases cancer-causing dioxins, furans, and black toxic soot.',
      correctProtocol: 'Use mechanical wire stripping hand-tools or deliver insulated cables directly to authorized recyclers with granulation shredders.',
      ppeRequired: ['Puncture-resistant work gloves', 'Safety boots', 'Dust mask'],
      audioScript: {
        en: 'Warning on Copper Cables: Do not burn wires in open air to extract copper. Open burning releases cancer-causing dioxins. Sell insulated cables directly for mechanical stripping.',
        hi: 'तांबे के तार की चेतावनी: तांबा निकालने के लिए कभी भी तारों को आग में न जलाएं। इससे फेफड़ों का कैंसर पैदा करने वाला जहरीला धुआं निकलता है। मैकेनिकल स्ट्रिपिंग का उपयोग करें।',
        ta: 'தாமிர கம்பி பாதுகாப்பு: தாமிரத்தை எடுக்க வயர்களை ஒருபோதும் எரிக்க வேண்டாம். பிளாஸ்டிக் எரிவது கொடிய புற்றுநோய் புகையை உண்டாக்கும். இயந்திர முறையில் உரிக்கவும்.',
        mr: 'तांब्याची वायर चेतावणी: तांबे काढण्यासाठी वायर्स जाळू नका. यातून कर्करोग निर्माण करणारा धूर येतो. मेकॅनिकल पद्धत वापरा.'
      }
    },
    {
      id: 'crt',
      categoryName: 'CRT Monitors & Glass Television Scrap',
      dangerLevel: 'High Hazard',
      prohibitedPractice: 'NEVER smash CRT funnel glass with stones. Funnel glass contains up to 2 kg of hazardous toxic lead and implosion shrapnel.',
      correctProtocol: 'Keep glass vacuum intact. Handle using two hands, wrap in corrugated cardboard, and transport carefully to authorized glass recyclers.',
      ppeRequired: ['Safety goggles', 'Heavy leather gloves', 'Protective arm sleeves'],
      audioScript: {
        en: 'Warning on CRT Monitors: Never smash old TV or computer monitor tubes. CRT glass contains dangerous toxic lead powder and can implode violently.',
        hi: 'सीआरटी मॉनिटर चेतावनी: पुराने टीवी स्क्रीन या मॉनिटर को कभी पत्थर से न फोड़ें। इसके शीशे में 2 किलो जहरीला सीसा (लेड) होता है।',
        ta: 'சிஆர்டி மானிட்டர் எச்சரிக்கை: பழைய டிவி கண்ணாடியை உடைக்காதீர்கள். இதில் கொடிய நச்சு ஈயம் உள்ளது. கவனமாக எடுத்துச் செல்லுங்கள்.',
        mr: 'सीआरटी मॉनिटर चेतावणी: टीव्ही काच फोडू नका. यात विषारी शिसे असते जे आरोग्यासाठी अत्यंत घातक आहे.'
      }
    }
  ],
  hi: [
    {
      id: 'pcb',
      categoryName: 'पीसीबी (प्रिंटेड सर्किट बोर्ड एवं मदरबोर्ड)',
      dangerLevel: 'गंभीर खतरा',
      prohibitedPractice: 'सोना निकालने के लिए मदरबोर्ड को कभी भी खुले एसिड (एक्वा रेजिया/साइनाइड) में न उबालें और न ही कोयले पर जलाएं। इससे घातक साइनाइड और नाइट्रोजन डाइऑक्साइड गैस निकलती है।',
      correctProtocol: 'अखंड, बिना टूटे मदरबोर्ड को सीधे सीपीसीबी अधिकृत पायरोमेटलर्जिकल रिकवरी प्लांट में बेचें।',
      ppeRequired: ['कट-प्रतिरोधी नाइट्राइल दस्ताने', 'N95 धूल मास्क', 'सुरक्षा चश्मा'],
      audioScript: {
        en: 'Warning on Circuit Boards: Never use acid leaching or cyanide boiling on computer motherboards. Open burning releases lethal nitrogen dioxide gas. Always sell intact boards to authorized refiners.',
        hi: 'सर्किट बोर्ड सुरक्षा चेतावनी: मदरबोर्ड पर कभी भी तेजाब या साइनाइड न डालें और न ही आग में जलाएं। यह जानलेवा धुआं पैदा करता है। इसे सीधे सीपीसीबी अधिकृत रिसाइकलर को बेचें।',
        ta: 'சுற்றுப்பலகை பாதுகாப்பு எச்சரிக்கை: கம்ப்யூட்டர் மதர்போர்டுகளை அமிலத்திலோ அல்லது தீயிலோ எரிக்க வேண்டாம். இது விஷ வாயுவை வெளியிடும். அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளரிடம் அப்படியே ஒப்படைக்கவும்.',
        mr: 'सर्किट बोर्ड सुरक्षा सूचना: कॉम्प्युटर मदरबोर्डवर कधीही ऍसिड टाकू नका किंवा जाळू नका. यातून विषारी वायू बाहेर पडतो. अधिकृत रिसायकलर्सना थेट विका.'
      }
    },
    {
      id: 'battery',
      categoryName: 'लिथियम-आयन एवं लेड एसिड बैटरी',
      dangerLevel: 'गंभीर खतरा',
      prohibitedPractice: 'बैटरी को हथौड़े या छेनी से कभी न तोड़ें या अलग न करें। नमी के संपर्क में आते ही इसमें विस्फोट हो सकता है और जहरीले लेड का रिसाव होता है।',
      correctProtocol: 'बैटरी टर्मिनलों को इंसुलेटिंग पीवीसी टेप से कवर करें। ज्वलनशील पदार्थों से दूर सूखी प्लास्टिक की बाल्टी में सीधा रखें।',
      ppeRequired: ['मजबूत रबर दस्ताने', 'फुल फेस सेफ्टी शील्ड', 'अग्निरोधी एप्रन'],
      audioScript: {
        en: 'Warning on Batteries: Never puncture or break lithium-ion or lead-acid batteries. Risk of chemical explosion and acid burns. Store upright in dry sand.',
        hi: 'बैटरी सुरक्षा चेतावनी: लिथियम या लेड एसिड बैटरी को कभी न तोड़ें या हथौड़े से न मारें। यह फट सकती है और गंभीर एसिड बर्न कर सकती है। इसे सूखी जगह पर सीधा रखें।',
        ta: 'பேட்டரி பாதுகாப்பு எச்சரிக்கை: லித்தியம் அல்லது லெட் ஆசிட் பேட்டரிகளை உடைக்கவோ அல்லது தட்டவோ வேண்டாம். வெடிக்கும் அபாயம் உள்ளது. எப்போதும் நேராக நிமிர்த்தி வைக்கவும்.',
        mr: 'बॅटरी सुरक्षा चेतावणी: बॅटरी कधीही फोडू नका. स्फोट आणि ऍसिड जळण्याचा मोठा धोका असतो. कोरड्या जागी सुरक्षित ठेवा.'
      }
    },
    {
      id: 'copper_wire',
      categoryName: 'इन्सुलेटेड तांबे के तार एवं पावर केबल्स',
      dangerLevel: 'उच्च खतरा',
      prohibitedPractice: 'तांबा निकालने के लिए केबल्स को कभी भी आग या टायरों में न जलाएं। पीवीसी के जलने से कैंसरकारी डाइऑक्सिन और घातक काला धुआं निकलता है।',
      correctProtocol: 'मैकेनिकल वायर स्ट्रिपिंग टूल्स का उपयोग करें या सीधे अधिकृत रिसाइकलर को पूरी केबल बेचें।',
      ppeRequired: ['पंचर-प्रतिरोधी दस्ताने', 'सुरक्षा जूते', 'डस्ट मास्क'],
      audioScript: {
        en: 'Warning on Copper Cables: Do not burn wires in open air to extract copper. Open burning releases cancer-causing dioxins. Sell insulated cables directly for mechanical stripping.',
        hi: 'तांबे के तार की चेतावनी: तांबा निकालने के लिए कभी भी तारों को आग में न जलाएं। इससे फेफड़ों का कैंसर पैदा करने वाला जहरीला धुआं निकलता है। मैकेनिकल स्ट्रिपिंग का उपयोग करें।',
        ta: 'தாமிர கம்பி பாதுகாப்பு: தாமிரத்தை எடுக்க வயர்களை ஒருபோதும் எரிக்க வேண்டாம். பிளாஸ்டிக் எரிவது கொடிய புற்றுநோய் புகையை உண்டாக்கும். இயந்திர முறையில் உரிக்கவும்.',
        mr: 'तांब्याची वायर चेतावणी: तांबे काढण्यासाठी वायर्स जाळू नका. यातून कर्करोग निर्माण करणारा धूर येतो. मेकॅनिकल पद्धत वापरा.'
      }
    },
    {
      id: 'crt',
      categoryName: 'सीआरटी मॉनिटर और पुराना टीवी ग्लास',
      dangerLevel: 'उच्च खतरा',
      prohibitedPractice: 'सीआरटी फनल ग्लास को कभी पत्थर या हथौड़े से न फोड़ें। इसमें 2 किलो तक जहरीला सीसा और विस्फोट से उड़ने वाले कांच के टुकड़े होते हैं।',
      correctProtocol: 'ग्लास वैक्यूम को बिना तोड़े दोनों हाथों से संभालें, कार्डबोर्ड में लपेटें और सीधे अधिकृत ग्लास रिसाइकलर को पहुंचाएं।',
      ppeRequired: ['सुरक्षा चश्मा', 'मोटे चमड़े के दस्ताने', 'हाथ सुरक्षा स्लीव्स'],
      audioScript: {
        en: 'Warning on CRT Monitors: Never smash old TV or computer monitor tubes. CRT glass contains dangerous toxic lead powder and can implode violently.',
        hi: 'सीआरटी मॉनिटर चेतावनी: पुराने टीवी स्क्रीन या मॉनिटर को कभी पत्थर से न फोड़ें। इसके शीशे में 2 किलो जहरीला सीसा (लेड) होता है।',
        ta: 'சிஆர்டி மானிட்டர் எச்சரிக்கை: பழைய டிவி கண்ணாடியை உடைக்காதீர்கள். இதில் கொடிய நச்சு ஈயம் உள்ளது. கவனமாக எடுத்துச் செல்லுங்கள்.',
        mr: 'सीआरटी मॉनिटर चेतावणी: टीव्ही काच फोडू नका. यात विषारी शिसे असते जे आरोग्यासाठी अत्यंत घातक आहे.'
      }
    }
  ],
  mr: [
    {
      id: 'pcb',
      categoryName: 'पीसीबी (प्रिंटेड सर्किट बोर्ड आणि मदरबोर्ड)',
      dangerLevel: 'अति-धोकादायक',
      prohibitedPractice: 'सोने काढण्यासाठी मदरबोर्ड कधीही उघड्या ॲसिडमध्ये (नायट्रिक/सायनाइड) उकळू नका किंवा कोळशावर जाळू नका. यातून प्राणघातक सायनाइड आणि नायट्रोजन डायऑक्साइड वायू बाहेर पडतो.',
      correctProtocol: 'अखंड, न मोडलेले मदरबोर्ड थेट CPCB अधिकृत रिसायकलिंग केंद्रांना विका.',
      ppeRequired: ['कट-प्रतिरोधक नायट्रिल हातमोजे', 'N95 डस्ट मास्क', 'सुरक्षा गॉगल'],
      audioScript: {
        en: 'Warning on Circuit Boards: Never use acid leaching or cyanide boiling on computer motherboards. Open burning releases lethal nitrogen dioxide gas. Always sell intact boards to authorized refiners.',
        hi: 'सर्किट बोर्ड सुरक्षा चेतावनी: मदरबोर्ड पर कभी भी तेजाब या साइनाइड न डालें और न ही आग में जलाएं। यह जानलेवा धुआं पैदा करता है। इसे सीधे सीपीसीबी अधिकृत रिसाइकलर को बेचें।',
        ta: 'சுற்றுப்பலகை பாதுகாப்பு எச்சரிக்கை: கம்ப்யூட்டர் மதர்போர்டுகளை அமிலத்திலோ அல்லது தீயிலோ எரிக்க வேண்டாம். இது விஷ வாயுவை வெளியிடும். அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளரிடம் அப்படியே ஒப்படைக்கவும்.',
        mr: 'सर्किट बोर्ड सुरक्षा सूचना: कॉम्प्युटर मदरबोर्डवर कधीही ऍसिड टाकू नका किंवा जाळू नका. यातून विषारी वायू बाहेर पडतो. अधिकृत रिसायकलर्सना थेट विका.'
      }
    },
    {
      id: 'battery',
      categoryName: 'लिथियम-आयन आणि लेड ॲसिड बॅटऱ्या',
      dangerLevel: 'अति-धोकादायक',
      prohibitedPractice: 'हातोड्याने बॅटऱ्या कधीही फोडू नका किंवा उघडू नका. हवेतील ओलाव्यामुळे भीषण स्फोट आणि आग लागून विषारी ॲसिड बाहेर पडते.',
      correctProtocol: 'बॅटरीच्या टर्मिनल्सवर इन्सुलेशन पीव्हीसी टेप लावा. ज्वलनशील वस्तूंपासून दूर कोरड्या वाळूच्या पात्रात सरळ ठेवा.',
      ppeRequired: ['जाड रबर हातमोजे', 'चेहऱ्यासाठी सुरक्षा शील्ड', 'अग्निरोधक ऍप्रन'],
      audioScript: {
        en: 'Warning on Batteries: Never puncture or break lithium-ion or lead-acid batteries. Risk of chemical explosion and acid burns. Store upright in dry sand.',
        hi: 'बैटरी सुरक्षा चेतावनी: लिथियम या लेड एसिड बैटरी को कभी न तोड़ें या हथौड़े से न मारें। यह फट सकती है और गंभीर एसिड बर्न कर सकती है। इसे सूखी जगह पर सीधा रखें।',
        ta: 'பேட்டரி பாதுகாப்பு எச்சரிக்கை: லித்தியம் அல்லது லெட் ஆசிட் பேட்டரிகளை உடைக்கவோ அல்லது தட்டவோ வேண்டாம். வெடிக்கும் அபாயம் உள்ளது. எப்போதும் நேராக நிமிர்த்தி வைக்கவும்.',
        mr: 'बॅटरी सुरक्षा चेतावणी: बॅटरी कधीही फोडू नका. स्फोट आणि ऍसिड जळण्याचा मोठा धोका असतो. कोरड्या जागी सुरक्षित ठेवा.'
      }
    },
    {
      id: 'copper_wire',
      categoryName: 'इन्सुलेटेड तांब्याच्या तारा आणि केबल्स',
      dangerLevel: 'उच्च धोका',
      prohibitedPractice: 'तांबे काढण्यासाठी केबल्स उघड्या खड्ड्यांत किंवा टायरवर जाळू नका. प्लास्टिक जाळल्याने कर्करोग निर्माण करणारे विषारी डायऑक्सिन वायू बाहेर पडतात.',
      correctProtocol: 'मॅन्युअल वायर स्ट्रिपिंग कटर वापरा किंवा संपूर्ण इन्सुलेटेड तारा अधिकृत रिसायकलर्सना थेट जमा करा.',
      ppeRequired: ['पंचर-प्रतिरोधक हातमोजे', 'सुरक्षा बूट', 'डस्ट मास्क'],
      audioScript: {
        en: 'Warning on Copper Cables: Do not burn wires in open air to extract copper. Open burning releases cancer-causing dioxins. Sell insulated cables directly for mechanical stripping.',
        hi: 'तांबे के तार की चेतावनी: तांबा निकालने के लिए कभी भी तारों को आग में न जलाएं। इससे फेफड़ों का कैंसर पैदा करने वाला जहरीला धुआं निकलता है। मैकेनिकल स्ट्रिपिंग का उपयोग करें।',
        ta: 'தாமிர கம்பி பாதுகாப்பு: தாமிரத்தை எடுக்க வயர்களை ஒருபோதும் எரிக்க வேண்டாம். பிளாஸ்டிக் எரிவது கொடிய புற்றுநோய் புகையை உண்டாக்கும். இயந்திர முறையில் உரிக்கவும்.',
        mr: 'तांब्याची वायर चेतावणी: तांबे काढण्यासाठी वायर्स जाळू नका. यातून कर्करोग निर्माण करणारा धूर येतो. मेकॅनिकल पद्धत वापरा.'
      }
    },
    {
      id: 'crt',
      categoryName: 'CRT मॉनिटर्स आणि जुनी टीव्ही काच',
      dangerLevel: 'उच्च धोका',
      prohibitedPractice: 'टीव्हीची काच दगडाने किंवा हातोड्याने फोडू नका. या काचेमध्ये २ किलोपर्यंत विषारी शिसे (Lead) आणि स्फोटक काचेचे तुकडे असतात.',
      correctProtocol: 'काचेची ट्यूब न फोडता दोन्ही हातांनी सुरक्षित उचला, जाड पुठ्ठ्यात गुंडाळा आणि अधिकृत काच रिसायकलरकडे सोपवा.',
      ppeRequired: ['सुरक्षा गॉगल', 'जाड लेदरचे हातमोजे', 'हात संरक्षण स्लीव्ह्ज'],
      audioScript: {
        en: 'Warning on CRT Monitors: Never smash old TV or computer monitor tubes. CRT glass contains dangerous toxic lead powder and can implode violently.',
        hi: 'सीआरटी मॉनिटर चेतावनी: पुराने टीवी स्क्रीन या मॉनिटर को कभी पत्थर से न फोड़ें। इसके शीशे में 2 किलो जहरीला सीसा (लेड) होता है।',
        ta: 'சிஆர்டி மானிட்டர் எச்சரிக்கை: பழைய டிவி கண்ணாடியை உடைக்காதீர்கள். இதில் கொடிய நச்சு ஈயம் உள்ளது. கவனமாக எடுத்துச் செல்லுங்கள்.',
        mr: 'सीआरटी मॉनिटर चेतावणी: टीव्ही काच फोडू नका. यात विषारी शिसे असते जे आरोग्यासाठी अत्यंत घातक आहे.'
      }
    }
  ],
  ta: [
    {
      id: 'pcb',
      categoryName: 'பிசிபி (மின்சுற்று பலகைகள் மற்றும் மதர்போர்டுகள்)',
      dangerLevel: 'முக்கிய அபாயம்',
      prohibitedPractice: 'தங்கம் எடுக்க மதர்போர்டுகளை அமிலத்திலோ அல்லது அடுப்பிலோ எரிக்க வேண்டாம். இது கொடிய சயனைடு மற்றும் நைட்ரஜன் டை ஆக்சைடு வாயுவை வெளியிடும்.',
      correctProtocol: 'முழுமையான மதர்போர்டுகளை நேரடியாக CPCB அங்கீகரிக்கப்பட்ட மறுசுழற்சி ஆலைகளுக்கு விற்கவும்.',
      ppeRequired: ['கையுறைகள்', 'N95 தூசி முகக்கவசம்', 'பாதுகாப்பு கண்ணாடிகள்'],
      audioScript: {
        en: 'Warning on Circuit Boards: Never use acid leaching or cyanide boiling on computer motherboards. Open burning releases lethal nitrogen dioxide gas. Always sell intact boards to authorized refiners.',
        hi: 'सर्किट बोर्ड सुरक्षा चेतावनी: मदरबोर्ड पर कभी भी तेजाब या साइनाइड न डालें और न ही आग में जलाएं। यह जानलेवा धुआं पैदा करता है। इसे सीधे सीपीसीबी अधिकृत रिसाइकलर को बेचें।',
        ta: 'சுற்றுப்பலகை பாதுகாப்பு எச்சரிக்கை: கம்ப்யூட்டர் மதர்போர்டுகளை அமிலத்திலோ அல்லது தீயிலோ எரிக்க வேண்டாம். இது விஷ வாயுவை வெளியிடும். அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளரிடம் அப்படியே ஒப்படைக்கவும்.',
        mr: 'सर्किट बोर्ड सुरक्षा सूचना: कॉम्प्युटर मदरबोर्डवर कधीही ऍसिड टाकू नका किंवा जाळू नका. यातून विषारी वायू बाहेर पडतो. अधिकृत रिसायकलर्सना थेट विका.'
      }
    },
    {
      id: 'battery',
      categoryName: 'லித்தியம்-அயன் மற்றும் லெட் ஆசிட் பேட்டரிகள்',
      dangerLevel: 'முக்கிய அபாயம்',
      prohibitedPractice: 'பேட்டரிகளை சுத்தியலால் உடைக்கவோ அல்லது துளையிடவோ வேண்டாம். ஈரப்பதத்தில் வெடித்து சிதறும் மற்றும் நச்சு ஈய விஷத்தை ஏற்படுத்தும்.',
      correctProtocol: 'பேட்டரி முனைகளை இன்சுலேடிங் டேப்பால் மூடவும். எரியக்கூடிய பொருட்களிலிருந்து விலகி உலர்ந்த மணலில் வைக்கவும்.',
      ppeRequired: ['கனரக ரப்பர் கையுறைகள்', 'முக பாதுகாப்பு கவசம்', 'தீத்தடுப்பு அங்கி'],
      audioScript: {
        en: 'Warning on Batteries: Never puncture or break lithium-ion or lead-acid batteries. Risk of chemical explosion and acid burns. Store upright in dry sand.',
        hi: 'बैटरी सुरक्षा चेतावनी: लिथियम या लेड एसिड बैटरी को कभी न तोड़ें या हथौड़े से न मारें। यह फट सकती है और गंभीर एसिड बर्न कर सकती है। इसे सूखी जगह पर सीधा रखें।',
        ta: 'பேட்டரி பாதுகாப்பு எச்சரிக்கை: லித்தியம் அல்லது லெட் ஆசிட் பேட்டரிகளை உடைக்கவோ அல்லது தட்டவோ வேண்டாம். வெடிக்கும் அபாயம் உள்ளது. எப்போதும் நேராக நிமிர்த்தி வைக்கவும்.',
        mr: 'बॅटरी सुरक्षा चेतावणी: बॅटरी कधीही फोडू नका. स्फोट आणि ऍसिड जळण्याचा मोठा धोका असतो. कोरड्या जागी सुरक्षित ठेवा.'
      }
    },
    {
      id: 'copper_wire',
      categoryName: 'காப்பிடப்பட்ட தாமிர கம்பிகள் மற்றும் கேபிள்கள்',
      dangerLevel: 'அதிக அபாயம்',
      prohibitedPractice: 'தாமிரத்தை எடுக்க வயர்களை ஒருபோதும் தீயிலோ அல்லது டயரிலோ எரிக்க வேண்டாம். பிளாஸ்டிக் எரிவது புற்றுநோய் நச்சுப் புகையை உண்டாக்கும்.',
      correctProtocol: 'இயந்திர கம்பி உரிக்கிகளைப் பயன்படுத்தவும் அல்லது அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்களிடம் நேரடியாக வழங்கவும்.',
      ppeRequired: ['பாதுகாப்பு கையுறைகள்', 'பாதுகாப்பு காலணிகள்', 'தூசி முகமூடி'],
      audioScript: {
        en: 'Warning on Copper Cables: Do not burn wires in open air to extract copper. Open burning releases cancer-causing dioxins. Sell insulated cables directly for mechanical stripping.',
        hi: 'तांबे के तार की चेतावनी: तांबा निकालने के लिए कभी भी तारों को आग में न जलाएं। इससे फेफड़ों का कैंसर पैदा करने वाला जहरीला धुआं निकलता है। मैकेनिकल स्ट्रिपिंग का उपयोग करें।',
        ta: 'தாமிர கம்பி பாதுகாப்பு: தாமிரத்தை எடுக்க வயர்களை ஒருபோதும் எரிக்க வேண்டாம். பிளாஸ்டிக் எரிவது கொடிய புற்றுநோய் புகையை உண்டாக்கும். இயந்திர முறையில் உரிக்கவும்.',
        mr: 'तांब्याची वायर चेतावणी: तांबे काढण्यासाठी वायर्स जाळू नका. यातून कर्करोग निर्माण करणारा धूर येतो. मेकॅनिकल पद्धत वापरा.'
      }
    },
    {
      id: 'crt',
      categoryName: 'CRT மானிட்டர்கள் மற்றும் தொலைக்காட்சி கண்ணாடி',
      dangerLevel: 'அதிக அபாயம்',
      prohibitedPractice: 'டிவி கண்ணாடி திரைகளை கல்லால் உடைக்காதீர்கள். இதில் 2 கிலோ வரை நச்சு ஈயம் மற்றும் வெடிக்கும் கண்ணாடி துண்டுகள் உள்ளன.',
      correctProtocol: 'கண்ணாடியை உடைக்காமல் பாதுகாக்கவும். இரு கைகளால் கவனமாக தூக்கி அட்டைப்பெட்டியில் சுற்றி பாதுகாப்பாக ஒப்படைக்கவும்.',
      ppeRequired: ['பாதுகாப்பு கண்ணாடி', 'தோல் கையுறைகள்', 'கை பாதுகாப்பு கவசங்கள்'],
      audioScript: {
        en: 'Warning on CRT Monitors: Never smash old TV or computer monitor tubes. CRT glass contains dangerous toxic lead powder and can implode violently.',
        hi: 'सीआरटी मॉनिटर चेतावनी: पुराने टीवी स्क्रीन या मॉनिटर को कभी पत्थर से न फोड़ें। इसके शीशे में 2 किलो जहरीला सीसा (लेड) होता है।',
        ta: 'சிஆர்டி மானிட்டர் எச்சரிக்கை: பழைய டிவி கண்ணாடியை உடைக்காதீர்கள். இதில் கொடிய நச்சு ஈயம் உள்ளது. கவனமாக எடுத்துச் செல்லுங்கள்.',
        mr: 'सीआरटी मॉनिटर चेतावणी: टीव्ही काच फोडू नका. यात विषारी शिसे असते जे आरोग्यासाठी अत्यंत घातक आहे.'
      }
    }
  ]
};

const UI_TEXT = {
  en: {
    statutoryProtocol: 'CPCB Statutory Protocol',
    moduleCounter: 'Module 1 of 7',
    title: 'Safety Guidance with Vernacular Voice Narration',
    subtitle: 'Strict occupational health rules prohibiting dangerous informal dismantling, chemical acid boiling, and open wire burning.',
    pauseVoice: 'Pause Voice Guidance',
    loadingVoice: 'Loading Voice...',
    listenVoice: 'Listen Voice Instructions',
    selectedProtocol: 'Selected Material Protocol',
    readAloudIn: 'Read Aloud in',
    prohibitedTitle: 'PROHIBITED INFORMAL PRACTICES',
    strictPenalties: '⚠️ Strict Penalties: Informal burning or acid leaching violates CPCB E-Waste Management Rules 2022.',
    approvedTitle: 'APPROVED CPCB HANDLING PROTOCOL',
    guaranteedSafety: '✓ Guaranteed Safety: Receive higher valuation & digital gate pass from authorized recyclers.',
    mandatoryPpe: 'Mandatory Personal Protective Equipment (PPE)',
    exposureHelp: 'Accidental Chemical Exposure / Burns',
    poisonHelpline: 'National Toxic & Poison Control 24/7 Helpline:',
    firstAidNote: 'Wash affected skin with abundant cold clean water for 15 minutes immediately.'
  },
  hi: {
    statutoryProtocol: 'सीपीसीबी वैधानिक नियम',
    moduleCounter: 'मॉड्यूल 1 में से 7',
    title: 'स्थानीय आवाज के साथ ई-कचरा सुरक्षा मार्गदर्शन',
    subtitle: 'अनौपचारिक रूप से तोड़फोड़, एसिड में उबालने और खुले में तार जलाने पर पूर्ण प्रतिबंध एवं स्वास्थ्य सुरक्षा नियम।',
    pauseVoice: 'ऑडियो रोकें',
    loadingVoice: 'आवाज लोड हो रही है...',
    listenVoice: 'आवाज में निर्देश सुनें',
    selectedProtocol: 'चयनित सामग्री हेतु सुरक्षा नियम',
    readAloudIn: 'इस भाषा में सुनें:',
    prohibitedTitle: 'प्रतिबंधित अनौपचारिक प्रथाएं',
    strictPenalties: '⚠️ सख्त दंड: खुले में जलाना या एसिड लीचिंग सीपीसीबी ई-कचरा प्रबंधन नियम 2022 का गंभीर उल्लंघन है।',
    approvedTitle: 'स्वीकृत सीपीसीबी प्रबंधन प्रक्रिया',
    guaranteedSafety: '✓ सुनिश्चित सुरक्षा: अधिकृत रिसाइकलर से उचित मूल्य और डिजिटल गेट पास प्राप्त करें।',
    mandatoryPpe: 'अनिवार्य व्यक्तिगत सुरक्षा उपकरण (PPE)',
    exposureHelp: 'रासायनिक संपर्क अथवा जलने पर आपातकालीन सहायता',
    poisonHelpline: 'राष्ट्रीय विष नियंत्रण 24/7 हेल्पलाइन:',
    firstAidNote: 'प्रभावित त्वचा को तुरंत 15 मिनट तक ठंडे और साफ पानी से अच्छी तरह धोएं।'
  },
  mr: {
    statutoryProtocol: 'CPCB वैधानिक नियमावली',
    moduleCounter: 'मॉड्यूल १ पैकी ७',
    title: 'स्थानिक आवाजी सूचनांसह ई-कचरा सुरक्षा मार्गदर्शन',
    subtitle: 'घातक अनधिकृत तोडफोड, ऍसिड उकळणे आणि उघड्यावर तारा जाळण्यास सक्त मनाई व आरोग्य सुरक्षा नियम.',
    pauseVoice: 'आवाज थांबवा',
    loadingVoice: 'आवाज लोड होत आहे...',
    listenVoice: 'आवाजी सूचना ऐका',
    selectedProtocol: 'निवडलेल्या सामग्रीसाठी सुरक्षा नियम',
    readAloudIn: 'मराठीत ऐका',
    prohibitedTitle: 'निषिद्ध अनधिकृत पद्धती',
    strictPenalties: '⚠️ कडक कायदेशीर कारवाई: उघड्यावर जाळणे किंवा ॲसिड वापरणे हे CPCB ई-कचरा नियम २०२२ चे उल्लंघन आहे.',
    approvedTitle: 'मान्यताप्राप्त CPCB हाताळणी नियमावली',
    guaranteedSafety: '✓ खात्रीशीर सुरक्षितता: अधिकृत रिसायकलरकडून योग्य भाव आणि डिजिटल गेटपास मिळवा.',
    mandatoryPpe: 'अनिवार्य वैयक्तिक सुरक्षा उपकरणे (PPE)',
    exposureHelp: 'रासायनिक विषबाधा किंवा ऍसिडने भाजल्यास मदत',
    poisonHelpline: 'राष्ट्रीय विष नियंत्रण २४/७ हेल्पलाइन:',
    firstAidNote: 'बाधित त्वचेवर ताबडतोब १५ मिनिटे भरपूर थंड व स्वच्छ पाणी ओता.'
  },
  ta: {
    statutoryProtocol: 'CPCB சட்டப்பூர்வ நெறிமுறை',
    moduleCounter: 'பிரிவு 1 / 7',
    title: 'குரல் வழிகாட்டுதலுடன் கூடிய மின்னணுக் கழிவு பாதுகாப்பு',
    subtitle: 'ஆபத்தான கைமுறை உடைப்பு, அமிலத்தில் வேகவைத்தல் மற்றும் கம்பிகளை எரிப்பதை தடை செய்யும் தொழில் சுகாதார விதிகள்.',
    pauseVoice: 'குரலை இடைநிறுத்து',
    loadingVoice: 'குரல் ஏற்றுகிறது...',
    listenVoice: 'குரல் வழிமுறைகளைக் கேளுங்கள்',
    selectedProtocol: 'தேர்ந்தெடுக்கப்பட்ட பொருள் நெறிமுறை',
    readAloudIn: 'தமிழில் கேட்க',
    prohibitedTitle: 'தடைசெய்யப்பட்ட ஆபத்தான நடைமுறைகள்',
    strictPenalties: '⚠️ கடுமையான தண்டனை: திறந்த வெளியில் எரிப்பது CPCB விதிகள் 2022-ன் கீழ் தண்டனைக்குரியது.',
    approvedTitle: 'அங்கீகரிக்கப்பட்ட CPCB கையாளும் நெறிமுறை',
    guaranteedSafety: '✓ உறுதிசெய்யப்பட்ட பாதுகாப்பு: அதிக மதிப்பிடல் மற்றும் டிஜிட்டல் கேட் பாஸ் பெறுங்கள்.',
    mandatoryPpe: 'கட்டாய தனிநபர் பாதுகாப்பு உபகரணங்கள் (PPE)',
    exposureHelp: 'ரசாயன வெளிப்பாடு / தீக்காய அவசர உதவி',
    poisonHelpline: 'தேசிய நச்சுக் கட்டுப்பாட்டு 24/7 உதவி எண்:',
    firstAidNote: 'பாதிக்கப்பட்ட பகுதியை உடனடியாக 15 நிமிடங்களுக்கு குளிர்ந்த நீரால் கழுவவும்.'
  }
};

export const SafetyGuidanceModule: React.FC<SafetyGuidanceModuleProps> = ({ lang }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('pcb');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const ui = UI_TEXT[lang] || UI_TEXT.en;
  const currentDataset = SAFETY_DATA_LOCALIZED[lang] || SAFETY_DATA_LOCALIZED.en;
  const selectedItem = currentDataset.find(item => item.id === selectedItemId) || currentDataset[0];

  useEffect(() => {
    const unsub = vernacularAudio.subscribe((activeId, playing, loading) => {
      if (activeId && activeId.startsWith('safety-')) {
        setIsPlaying(playing);
        setLoadingAudio(loading);
      } else {
        setIsPlaying(false);
        setLoadingAudio(false);
      }
    });

    return () => {
      unsub();
      vernacularAudio.stop();
    };
  }, []);

  const handlePlayVoice = (item: SafetyItem) => {
    if (isPlaying) {
      vernacularAudio.stop();
      return;
    }

    const textToSpeak = item.audioScript[lang] || item.audioScript.en;
    vernacularAudio.play(`safety-${item.id}`, textToSpeak, lang);
  };

  const handleSelectItem = (item: SafetyItem) => {
    if (isPlaying) {
      vernacularAudio.stop();
    }
    setSelectedItemId(item.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Voice Playback */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-5 sm:p-7 rounded-2xl shadow-md border-2 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-white/15 rounded-xl backdrop-blur-xs border border-white/20 shrink-0">
            <ShieldAlert className="w-8 h-8 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 uppercase tracking-wider">
                {ui.statutoryProtocol}
              </span>
              <span className="text-xs text-amber-200 font-semibold">{ui.moduleCounter}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              {ui.title}
            </h2>
            <p className="text-sm text-amber-100 mt-1 max-w-2xl">
              {ui.subtitle}
            </p>
          </div>
        </div>

        {/* Global Voice Broadcast Button */}
        <button
          type="button"
          id="play-safety-voice-btn"
          onClick={() => handlePlayVoice(selectedItem)}
          className={`px-5 py-3.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer shrink-0 ${
            isPlaying
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-white text-amber-950 hover:bg-amber-100 hover:scale-102 active:scale-98'
          }`}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-5 h-5" />
              <span>{ui.pauseVoice}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-amber-700" />
              <span>{loadingAudio ? ui.loadingVoice : ui.listenVoice}</span>
            </>
          )}
        </button>
      </div>

      {/* Category Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {currentDataset.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectItem(item)}
            className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedItem.id === item.id
                ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                item.id === 'pcb' || item.id === 'battery' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.dangerLevel}
              </span>
              {selectedItem.id === item.id && (
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <span className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
              {item.categoryName}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Material Detailed Protocol Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {ui.selectedProtocol}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {selectedItem.categoryName}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handlePlayVoice(selectedItem)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm transition-colors cursor-pointer w-fit"
          >
            <Volume2 className="w-4 h-4" />
            <span>
              {ui.readAloudIn} {lang === 'ta' ? 'தமிழ்' : lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : 'English'}
            </span>
          </button>
        </div>

        {/* Prohibited vs Correct Protocol Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Prohibited */}
          <div className="p-5 rounded-xl bg-rose-50 border-2 border-rose-200 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-900 font-black text-sm sm:text-base">
              <Flame className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{ui.prohibitedTitle}</span>
            </div>
            <p className="text-sm sm:text-base text-rose-950 font-semibold leading-relaxed">
              {selectedItem.prohibitedPractice}
            </p>
            <div className="pt-2 text-xs font-bold text-rose-700">
              {ui.strictPenalties}
            </div>
          </div>

          {/* Correct Protocol */}
          <div className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{ui.approvedTitle}</span>
            </div>
            <p className="text-sm sm:text-base text-emerald-950 font-semibold leading-relaxed">
              {selectedItem.correctProtocol}
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-700">
              {ui.guaranteedSafety}
            </div>
          </div>
        </div>

        {/* Personal Protective Equipment (PPE) Required */}
        <div className="pt-2">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{ui.mandatoryPpe}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedItem.ppeRequired.map((ppe, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-slate-800 font-semibold text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <span>{ppe}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency First Aid & Poison Helpline */}
        <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <HeartPulse className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {ui.exposureHelp}
              </span>
              <p className="text-sm font-bold text-slate-900">
                {ui.poisonHelpline} <span className="font-mono text-emerald-800 text-base">1800-116-117</span>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600 font-medium">
            {ui.firstAidNote}
          </div>
        </div>
      </div>
    </div>
  );
};
