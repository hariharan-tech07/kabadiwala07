import React, { useState } from 'react';
import { User, UserRole, VernacularLang, CpcbEprCertificateExtraction } from '../types';
import { api } from '../api/client';
import {
  ShieldCheck, Smartphone, Lock, AlertCircle, ArrowRight, CheckCircle2,
  Building2, ShieldAlert, KeyRound, RefreshCw, Check, Globe, MapPin,
  User as UserIcon, Phone, FileCheck, Eye, EyeOff, Truck, ArrowLeft,
  ChevronRight, UserCheck, LogIn, UserPlus, Zap, Download, Laptop, X,
  Sparkles, UploadCloud, FileText, Code, Home, Scale
} from 'lucide-react';
import { AndroidAppModal } from './common/AndroidAppModal';

export type ActivePortal = 'chooser' | 'scrapper' | 'recycler' | 'admin';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
  lang?: VernacularLang;
  onLangChange?: (lang: VernacularLang) => void;
}

const AUTH_TEXTS: Record<VernacularLang, {
  title: string;
  tagline: string;
  subtagline: string;
  scrapperRoleTab: string;
  recyclerRoleTab: string;
  adminRoleTab: string;

  // Portal Selection Gateway
  portalGatewayTitle: string;
  portalGatewaySubtitle: string;
  portalGatewayBadge: string;
  scrapperGatewayCardTitle: string;
  scrapperGatewayCardSubtitle: string;
  scrapperGatewayCardDesc: string;
  recyclerGatewayCardTitle: string;
  recyclerGatewayCardSubtitle: string;
  recyclerGatewayCardDesc: string;
  adminGatewayCardTitle: string;
  adminGatewayCardSubtitle: string;
  adminGatewayCardDesc: string;
  enterPortalBtn: string;
  backToGatewayBtn: string;
  roleIsolationNotice: string;

  // Scrapper
  scrapperHeader: string;
  scrapperNotice: string;
  scrapperUsernameLabel: string;
  scrapperSignInTab: string;
  scrapperRegisterTab: string;
  scrapperRegisterHeader: string;
  scrapperRegisterNotice: string;
  scrapperQuickDemoTitle: string;
  scrapperQuickDemoSubtitle: string;
  scrapperMobileOtpTab: string;
  scrapperPasswordTab: string;
  scrapperAutoFillYardBtn: string;
  scrapperPinOrPasswordLabel: string;
  fullNameLabel: string;
  yardLocationLabel: string;
  aadhaarPhoneLabel: string;
  otpLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  sendOtpBtn: string;
  resendOtpBtn: string;
  otpDispatchedMsg: string;
  aadhaarLinkedBadge: string;
  aadhaarLast4Label: string;
  scrapCategoryLabel: string;
  scrapperSubmitBtn: string;
  scrapperRegisterSubmitBtn: string;

  // Recycler
  recyclerHeader: string;
  recyclerSignInTab: string;
  recyclerRegisterTab: string;
  recyclerLoginNotice: string;
  recyclerRegisterNotice: string;
  repNameLabel: string;
  entityNameLabel: string;
  entityLocationLabel: string;
  cpcbNumberLabel: string;
  cpcbVerifiedBadge: string;
  usernameLabel: string;
  recyclerSignInBtn: string;
  recyclerRegisterBtn: string;

  // Admin
  adminHeader: string;
  adminNotice: string;
  adminNameLabel: string;
  adminPhoneLabel: string;
  adminPasswordLabel: string;
  adminSubmitBtn: string;

  // Verification Question (Regular vs Periodical)
  verifyFrequencyTitle: string;
  verifyFrequencySubtitle: string;
  verifyOtpVerifiedBadge: string;
  regularOptionTitle: string;
  regularOptionSubtitle: string;
  regularOptionDesc: string;
  regularOptionBtn: string;
  periodicalOptionTitle: string;
  periodicalOptionSubtitle: string;
  periodicalOptionDesc: string;
  periodicalOptionBtn: string;

  // Common
  loadingText: string;
  persistenceNotice: string;
}> = {
  en: {
    title: 'Kabadiwala Connect',
    tagline: 'National E-Waste Circular Traceability & Formalization Grid',
    subtagline: 'Empowering Informal Scrap Collectors with Transparent Pricing & Certified Recycler Linkages',
    scrapperRoleTab: 'Scrapper Android App',
    recyclerRoleTab: 'Recycler Web Portal',
    adminRoleTab: 'Central Regulatory Web Desk',

    portalGatewayTitle: 'Select Your Access Portal',
    portalGatewaySubtitle: 'Role-segregated architecture: Dedicated Android App for Scrap Collectors, and Cloud Web Pages for Certified Recyclers & Regulatory Authorities',
    portalGatewayBadge: 'National E-Waste Platform Gateway',
    scrapperGatewayCardTitle: 'Kabadiwala (Scrapper) Android App',
    scrapperGatewayCardSubtitle: '📱 Android Mobile Application (WebAPK & PWA)',
    scrapperGatewayCardDesc: 'Official Android mobile app for informal collectors, yards & aggregators. Features AI hardware camera scale lock, offline SQLite sync, vernacular voice TTS, and 1-tap SMS OTP login.',
    recyclerGatewayCardTitle: 'Authorized Recycler Web Portal',
    recyclerGatewayCardSubtitle: '💻 Enterprise Web Page & Cloud Portal',
    recyclerGatewayCardDesc: 'Cloud-based desktop web page for returning facilities and registered recyclers. Inward lot inspection, weighbridge calibration, digital EPR certificates, and bulk bank/UPI settlements.',
    adminGatewayCardTitle: 'CPCB Regulatory Web Portal',
    adminGatewayCardSubtitle: '🌐 Statutory Authority Web Page & Desk',
    adminGatewayCardDesc: 'Official government regulatory web page. Master dual control over scrappers and recyclers, statutory pricing board, legal enforcement show-cause desk, and national circular audit trails.',
    enterPortalBtn: 'Access Portal →',
    backToGatewayBtn: '← Back to Portal Selection Gateway',
    roleIsolationNotice: 'Architecture Segregation: Scrap Collectors operate via the installable Android Application; Recyclers and CPCB Authorities operate via secure Enterprise Cloud Web Pages.',

    scrapperHeader: 'Scrap Collector Login Portal',
    scrapperNotice: 'Enter your registered Mobile Number or Username to access your collection dashboard.',
    scrapperUsernameLabel: 'Mobile Number or Username',
    scrapperSignInTab: 'Login Portal (Sign In)',
    scrapperRegisterTab: 'Register Yard (New Collector)',
    scrapperRegisterHeader: 'New Scrap Collector Registration Portal',
    scrapperRegisterNotice: 'Register your collection yard with fair MSP floor rates and direct linkages to authorized recyclers.',
    scrapperQuickDemoTitle: '⚡ 1-Tap Quick Collector Login',
    scrapperQuickDemoSubtitle: 'Tap any registered collector to log in immediately with zero typing:',
    scrapperMobileOtpTab: '📱 Mobile SMS OTP',
    scrapperPasswordTab: '🔑 Username / PIN',
    scrapperAutoFillYardBtn: '⚡ Auto-Fill Example Yard',
    scrapperPinOrPasswordLabel: '4-Digit PIN or Password',
    fullNameLabel: 'Full Legal Name',
    yardLocationLabel: 'Primary Yard / Collection Hub Location',
    aadhaarPhoneLabel: '10-Digit Mobile Number',
    otpLabel: '6-Digit SMS Verification OTP',
    passwordLabel: 'Account Password / PIN',
    confirmPasswordLabel: 'Confirm Password',
    sendOtpBtn: 'Send OTP',
    resendOtpBtn: 'Resend OTP',
    otpDispatchedMsg: 'OTP dispatched to +91',
    aadhaarLinkedBadge: 'Aadhaar e-KYC Linked & Verified',
    aadhaarLast4Label: 'Last 4 Digits of Aadhaar (Optional)',
    scrapCategoryLabel: 'Primary Scrap / E-Waste Category',
    scrapperSubmitBtn: 'Sign In to Dashboard',
    scrapperRegisterSubmitBtn: 'Register Yard & Open Dashboard',

    recyclerHeader: 'Authorized Recycler Facility Portal',
    recyclerSignInTab: 'Sign In with Password',
    recyclerRegisterTab: 'Register Recycler Entity',
    recyclerLoginNotice: 'CPCB verified facility credentials. Entity name, location, and CPCB certificate are preserved on file and not required on daily login.',
    recyclerRegisterNotice: 'Entity details and CPCB authorization certificate verification are completed once during facility registration.',
    repNameLabel: 'Authorized Representative Full Name',
    entityNameLabel: 'Full Legal Entity / Facility Name',
    entityLocationLabel: 'Facility / Plant Operational Address',
    cpcbNumberLabel: 'CPCB / SPCB Authorization Certificate Number',
    cpcbVerifiedBadge: 'CPCB/SPCB Consent Validated',
    usernameLabel: 'Facility Username / Login ID',
    recyclerSignInBtn: 'Sign In to Recycler Dashboard',
    recyclerRegisterBtn: 'Verify CPCB & Register Facility Account',

    adminHeader: 'CPCB Central Regulatory Authority Login',
    adminNotice: 'High-security regulatory portal. Name, mobile number, and password must be re-entered whenever the admin logs in.',
    adminNameLabel: 'Regulatory Auditor / Officer Full Name',
    adminPhoneLabel: 'Official Mobile Number',
    adminPasswordLabel: 'Authorized Admin Password',
    adminSubmitBtn: 'Authenticate Admin Session & Open Dashboard',

    verifyFrequencyTitle: 'Verify Scrap Profile & Sales Frequency',
    verifyFrequencySubtitle: 'Before proceeding to your dashboard, please specify whether you sell scrap regularly as a commercial collector or periodically as a household resident:',
    verifyOtpVerifiedBadge: 'Mobile OTP Verified',
    regularOptionTitle: 'Regular Scrap Sales',
    regularOptionSubtitle: 'Scrap Collector (Kabadiwala) / Yard Aggregator',
    regularOptionDesc: 'You operate a collection yard, mobile cart, or scrap business. You aggregate scrap daily and sell bulk lots into the circular economy stream.',
    regularOptionBtn: 'I Sell Regular Scrap → Open Scrapper Dashboard',
    periodicalOptionTitle: 'Periodical Scrap Sales',
    periodicalOptionSubtitle: 'Household Citizen / Occasional Resident',
    periodicalOptionDesc: 'You are a resident or family selling old electronics, appliances, and home scrap periodically. You can contact nearby scrappers for doorstep pickups, and that scrap is subsequently sold by the scrapper into circular recycling.',
    periodicalOptionBtn: 'I Sell Periodical Scrap → Open Household Dashboard',

    loadingText: 'Authenticating...',
    persistenceNotice: 'Secure Session: Your authorized role dashboard remains authenticated across browser sessions.'
  },
  hi: {
    title: 'कबाड़ीवाला कनेक्ट',
    tagline: 'राष्ट्रीय ई-अपशिष्ट चक्रीय ट्रैसेबिलिटी एवं औपचारिकीकरण ग्रिड',
    subtagline: 'अनौपचारिक कचरा बीनने वालों को पारदर्शी मूल्य निर्धारण व प्रमाणित रिसाइकलरों से जोड़ना',
    scrapperRoleTab: 'कबाड़ीवाला एंड्रॉइड ऐप',
    recyclerRoleTab: 'प्रमाणित रिसाइकलर वेब पोर्टल',
    adminRoleTab: 'केंद्रीय CPCB वेब डेस्क',

    portalGatewayTitle: 'अपना एक्सेस पोर्टल चुनें',
    portalGatewaySubtitle: 'अलग-अलग सुरक्षित आर्किटेक्चर: कबाड़ संग्रहकर्ताओं के लिए एंड्रॉइड ऐप, और रिसाइक्लर्स व नियामकों के लिए सुरक्षित वेब पेज',
    portalGatewayBadge: 'राष्ट्रीय ई-कचरा प्लेटफॉर्म गेटवे',
    scrapperGatewayCardTitle: 'कबाड़ीवाला (संग्रहकर्ता) एंड्रॉइड ऐप',
    scrapperGatewayCardSubtitle: '📱 एंड्रॉइड मोबाइल एप्लिकेशन (WebAPK एवं PWA)',
    scrapperGatewayCardDesc: 'अनौपचारिक कचरा संग्रहकर्ताओं और यार्डों के लिए आधिकारिक एंड्रॉइड ऐप। कैमरा काटा वजन लॉक, ऑफलाइन सिंक, ऑडियो वॉइस और 1-टैप SMS OTP लॉगिन।',
    recyclerGatewayCardTitle: 'प्रमाणित रिसाइकलर वेब पोर्टल',
    recyclerGatewayCardSubtitle: '💻 एंटरप्राइज वेब पेज एवं क्लाउड पोर्टल',
    recyclerGatewayCardDesc: 'रिसाइक्लिंग प्लांट्स के लिए क्लाउड-आधारित डेस्कटॉप वेब पेज। आवक लॉट का भौतिक सत्यापन, डिजिटल काटा वजन और त्वरित बैंक/UPI भुगतान।',
    adminGatewayCardTitle: 'केंद्रीय CPCB विनियामक वेब पोर्टल',
    adminGatewayCardSubtitle: '🌐 सांविधिक प्राधिकरण वेब पेज एवं डेस्क',
    adminGatewayCardDesc: 'सरकारी विनियामक वेब पेज। कबाड़ीवालों और रिसाइक्लर्स दोनों पर पूर्ण प्रशासनिक दोहरा नियंत्रण, न्यूनतम मूल्य बोर्ड, कानूनी डेस्क और ऑडिट लॉग।',
    enterPortalBtn: 'पोर्टल में प्रवेश करें →',
    backToGatewayBtn: '← पोर्टल चयन गेटवे पर वापस जाएं',
    roleIsolationNotice: 'आर्किटेक्चर पृथक्करण: कबाड़ीवाला संग्रहकर्ता एंड्रॉइड ऐप के जरिए काम करते हैं; रिसाइकलर और CPCB प्राधिकरण सुरक्षित एंटरप्राइज वेब पेज के जरिए काम करते हैं।',

    scrapperHeader: 'कबाड़ीवाला लॉगिन पोर्टल',
    scrapperNotice: 'अपने संग्रह डैशबोर्ड तक पहुंचने के लिए अपने मोबाइल नंबर या यूजरनेम से लॉगिन करें।',
    scrapperUsernameLabel: 'मोबाइल नंबर या यूजरनेम',
    scrapperSignInTab: 'लॉगिन पोर्टल (लॉगिन करें)',
    scrapperRegisterTab: 'नया यार्ड (पंजीकरण करें)',
    scrapperRegisterHeader: 'नया कबाड़ीवाला पंजीकरण पोर्टल',
    scrapperRegisterNotice: 'अपने संग्रह यार्ड को पंजीकृत करें और प्रमाणित पुनर्चक्रणकर्ताओं से सीधे जुड़ें।',
    scrapperQuickDemoTitle: '⚡ 1-टैप त्वरित कबाड़ीवाला लॉगिन',
    scrapperQuickDemoSubtitle: 'बिना टाइप किए तुरंत डैशबोर्ड खोलने के लिए किसी भी संग्रहकर्ता पर टैप करें:',
    scrapperMobileOtpTab: '📱 मोबाइल SMS OTP',
    scrapperPasswordTab: '🔑 यूजरनेम / पिन',
    scrapperAutoFillYardBtn: '⚡ नमूना यार्ड स्वतः भरें',
    scrapperPinOrPasswordLabel: '4-अंकीय पिन या पासवर्ड',
    fullNameLabel: 'पूरा कानूनी नाम',
    yardLocationLabel: 'कबाड़ यार्ड / प्राथमिक संग्रह केंद्र का स्थान',
    aadhaarPhoneLabel: '10 अंकों का मोबाइल नंबर',
    otpLabel: '6 अंकों का SMS सत्यापन कोड (OTP)',
    passwordLabel: 'खाता पासवर्ड / पिन',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    sendOtpBtn: 'OTP भेजें',
    resendOtpBtn: 'OTP पुनः भेजें',
    otpDispatchedMsg: 'OTP भेजा गया: +91',
    aadhaarLinkedBadge: 'आधार e-KYC सत्यापित एवं लिंक',
    aadhaarLast4Label: 'आधार के अंतिम 4 अंक (वैकल्पिक)',
    scrapCategoryLabel: 'मुख्य ई-कचरा / स्क्रैप श्रेणी',
    scrapperSubmitBtn: 'डैशबोर्ड में लॉगिन करें',
    scrapperRegisterSubmitBtn: 'यार्ड पंजीकृत कर डैशबोर्ड खोलें',

    recyclerHeader: 'प्रमाणित रिसाइकलर पोर्टल',
    recyclerSignInTab: 'पासवर्ड से लॉगिन करें',
    recyclerRegisterTab: 'नई इकाई (संस्थान) पंजीकृत करें',
    recyclerLoginNotice: 'संस्थान का नाम, पता और CPCB प्रमाणपत्र प्रोफ़ाइल में सुरक्षित हैं और दैनिक लॉगिन पर दोबारा नहीं पूछे जाएंगे।',
    recyclerRegisterNotice: 'संस्थान का विवरण और CPCB प्रमाणपत्र सत्यापन केवल पहली बार पंजीकरण के समय आवश्यक है।',
    repNameLabel: 'अधिकृत प्रतिनिधि का पूरा नाम',
    entityNameLabel: 'संस्थान / कंपनी का कानूनी नाम',
    entityLocationLabel: 'संयंत्र / कारखाने का पूरा पता',
    cpcbNumberLabel: 'CPCB / SPCB प्राधिकरण प्रमाणपत्र संख्या',
    cpcbVerifiedBadge: 'CPCB/SPCB मान्यता प्राप्त',
    usernameLabel: 'संस्थान का यूजरनेम',
    recyclerSignInBtn: 'रिसाइकलर डैशबोर्ड में साइन इन करें',
    recyclerRegisterBtn: 'CPCB सत्यापित कर इकाई पंजीकृत करें',

    adminHeader: 'केंद्रीय CPCB नियामक प्राधिकरण लॉगिन',
    adminNotice: 'उच्च-सुरक्षा पोर्टल। प्रशासक का नाम, मोबाइल नंबर और पासवर्ड हर बार लॉगिन करते समय अनिवार्य रूप से पूछे जाएंगे।',
    adminNameLabel: 'नियामक अधिकारी का पूरा नाम',
    adminPhoneLabel: 'आधिकारिक मोबाइल नंबर',
    adminPasswordLabel: 'प्रशासक पासवर्ड',
    adminSubmitBtn: 'सत्र प्रमाणित करें व व्यवस्थापक डैशबोर्ड खोलें',

    verifyFrequencyTitle: 'कबाड़ बिक्री की आवृत्ति सत्यापित करें',
    verifyFrequencySubtitle: 'डैशबोर्ड में जाने से पहले कृपया चुनें कि आप कबाड़ नियमित रूप से संग्रहकर्ता के रूप में बेचते हैं या घरेलू नागरिक के रूप में कभी-कभार:',
    verifyOtpVerifiedBadge: 'मोबाइल OTP सत्यापित',
    regularOptionTitle: 'नियमित कबाड़ बिक्री (रेगुलर)',
    regularOptionSubtitle: 'दैनिक कबाड़ीवाला / स्क्रैप यार्ड संग्रहकर्ता',
    regularOptionDesc: 'आप एक संग्रह यार्ड या कबाड़ व्यवसाय संचालित करते हैं। आप रोजाना कबाड़ इकट्ठा कर रीसाइक्लिंग चेन में बल्क लॉट बेचते हैं।',
    regularOptionBtn: 'नियमित कबाड़ बिक्री → स्क्रैपर डैशबोर्ड खोलें',
    periodicalOptionTitle: 'आवधिक / कभी-कभार कबाड़ बिक्री (पीरियडिकल)',
    periodicalOptionSubtitle: 'घरेलू नागरिक (हाउसहोल्ड सिटिजन)',
    periodicalOptionDesc: 'आप घर का पुराना इलेक्ट्रॉनिक सामान, उपकरण, तार व कबाड़ कभी-कभार बेचते हैं। स्थानीय कबाड़ीवाले से घर बैठे संपर्क करें और कबाड़ीवाला इसे रीसाइक्लिंग चेन में बेचेगा।',
    periodicalOptionBtn: 'आवधिक कबाड़ बिक्री → हाउसहोल्ड डैशबोर्ड खोलें',

    loadingText: 'सत्यापित हो रहा है...',
    persistenceNotice: 'सुरक्षित सत्र: आपका अधिकृत रोल डैशबोर्ड सुरक्षित रूप से सक्रिय रहेगा।'
  },
  mr: {
    title: 'कबाडीवाला कनेक्ट',
    tagline: 'राष्ट्रीय ई-कचरा चक्रीय ट्रैसेबिलिटी आणि औपचारिकीकरण ग्रिड',
    subtagline: 'अनौपचारिक भंगार वेचकांना पारदर्शक दर आणि प्रमाणित रिसायकलर्सशी जोडणे',
    scrapperRoleTab: 'कबाडीवाला ॲन्ड्रॉइड ॲप',
    recyclerRoleTab: 'प्रमाणित रिसायकलर वेब पोर्टल',
    adminRoleTab: 'केंद्रीय CPCB वेब डेस्क',

    portalGatewayTitle: 'तुमचे ॲक्सेस पोर्टल निवडा',
    portalGatewaySubtitle: 'स्वतंत्र प्रणाली: भंगार वेचकांसाठी ॲन्ड्रॉइड ॲप, आणि रिसायकलर्स व नियामक अधिकाऱ्यांसाठी सुरक्षित वेब पेज',
    portalGatewayBadge: 'राष्ट्रीय ई-कचरा प्लॅटफॉर्म गेटवे',
    scrapperGatewayCardTitle: 'कबाडीवाला (भंगार वेचक) ॲन्ड्रॉइड ॲप',
    scrapperGatewayCardSubtitle: '📱 ॲन्ड्रॉइड मोबाईल ॲप्लिकेशन (WebAPK व PWA)',
    scrapperGatewayCardDesc: 'अनौपचारिक संकलक आणि यार्डांसाठी अधिकृत ॲन्ड्रॉइड ॲप. कॅमेरा काटा वजन लॉक, ऑफलाइन सिंक, ऑडिओ व्हॉईस आणि १-टॅप SMS OTP लॉगिन.',
    recyclerGatewayCardTitle: 'प्रमाणित रिसायकलर वेब पोर्टल',
    recyclerGatewayCardSubtitle: '💻 एंटरप्रायझ वेब पेज व क्लाउड पोर्टल',
    recyclerGatewayCardDesc: 'कंपन्यांसाठी क्लाउड-आधारित डेस्कटॉप वेब पेज. येणाऱ्या लॉटची तपासणी, डिजिटल वजन काटा आणि थेट बँक/UPI पेमेंट.',
    adminGatewayCardTitle: 'केंद्रीय CPCB नियामक वेब पोर्टल',
    adminGatewayCardSubtitle: '🌐 वैधानिक प्राधिकरण वेब पेज व डेस्क',
    adminGatewayCardDesc: 'सरकारी नियामक वेब पेज. कबाडीवाला आणि रिसायकलर या दोघांवर संपूर्ण नियंत्रण, सरकारी किमान दर निर्धारण आणि कायदेशीर डेस्क.',
    enterPortalBtn: 'पोर्टल उघडा →',
    backToGatewayBtn: '← मुख्य पोर्टल निवडीकडे परत जा',
    roleIsolationNotice: 'आर्किटेक्चर विभाजन: कबाडीवाला संकलक ॲन्ड्रॉइड ॲपद्वारे काम करतात; रिसायकलर्स आणि CPCB अधिकारी सुरक्षित एंटरप्रायझ वेब पेजद्वारे काम करतात.',

    scrapperHeader: 'कबाडीवाला लॉगिन पोर्टल',
    scrapperNotice: 'आपल्या संकलन डॅशबोर्डवर प्रवेश करण्यासाठी आपले मोबाईल नंबर किंवा युझरनेमने लॉगिन करा.',
    scrapperUsernameLabel: 'मोबाईल नंबर किंवा युझरनेम',
    scrapperSignInTab: 'लॉगिन पोर्टल (लॉगिन करा)',
    scrapperRegisterTab: 'नवीन यार्ड (नोंदणी करा)',
    scrapperRegisterHeader: 'नवीन कबाडीवाला नोंदणी पोर्टल',
    scrapperRegisterNotice: 'आपल्या स्क्रॅप यार्डची नोंदणी करा आणि अधिकृत रिसायकलर्सशी थेट जोडा.',
    scrapperQuickDemoTitle: '⚡ १-टॅप जलद कबाडीवाला लॉगिन',
    scrapperQuickDemoSubtitle: 'काहीही टाईप न करता थेट डॅशबोर्ड उघडण्यासाठी कोणत्याही कबाडीवाल्यावर टॅप करा:',
    scrapperMobileOtpTab: '📱 मोबाईल SMS OTP',
    scrapperPasswordTab: '🔑 युझरनेम / पिन',
    scrapperAutoFillYardBtn: '⚡ नमुना यार्ड ऑटो-भरा',
    scrapperPinOrPasswordLabel: '४-अंकी पिन किंवा पासवर्ड',
    fullNameLabel: 'पूर्ण नाव',
    yardLocationLabel: 'भंगार यार्ड / संकलन केंद्राचे ठिकाण',
    aadhaarPhoneLabel: '१० अंकी मोबाईल नंबर',
    otpLabel: '६ अंकी SMS पडताळणी कोड (OTP)',
    passwordLabel: 'खाता पासवर्ड / पिन',
    confirmPasswordLabel: 'पासवर्डची पुष्टी करा',
    sendOtpBtn: 'OTP पाठवा',
    resendOtpBtn: 'OTP पुन्हा पाठवा',
    otpDispatchedMsg: 'OTP पाठवला: +91',
    aadhaarLinkedBadge: 'आधार e-KYC पडताळणी पूर्ण',
    aadhaarLast4Label: 'आधार क्रमांकाचे शेवटचे ४ अंक (ऐच्छिक)',
    scrapCategoryLabel: 'प्राथमिक ई-कचरा / स्क्रॅप श्रेणी',
    scrapperSubmitBtn: 'डॅशबोर्डमध्ये लॉगिन करा',
    scrapperRegisterSubmitBtn: 'यार्ड नोंदवा व डॅशबोर्ड उघडा',

    recyclerHeader: 'प्रमाणित रिसायकलर पोर्टल',
    recyclerSignInTab: 'पासवर्डने लॉगिन करा',
    recyclerRegisterTab: 'नवीन संस्था नोंदणी करा',
    recyclerLoginNotice: 'कंपनीचे नाव, पत्ता आणि CPCB प्रमाणपत्र आधीच सुरक्षित आहे आणि रोज लॉगिन करताना विचारले जाणार नाही.',
    recyclerRegisterNotice: 'संस्थेचे नाव, पत्ता आणि CPCB प्रमाणपत्र पडताळणी फक्त एकदाच नोंदणी करताना आवश्यक आहे.',
    repNameLabel: 'अधिकृत प्रतिनिधीचे पूर्ण नाव',
    entityNameLabel: 'संस्थेचे / कंपनीचे नाव',
    entityLocationLabel: 'प्रकल्प / कारखान्याचा पत्ता',
    cpcbNumberLabel: 'CPCB / SPCB परवाना प्रमाणपत्र क्रमांक',
    cpcbVerifiedBadge: 'CPCB परवाना वैध',
    usernameLabel: 'युझरनेम',
    recyclerSignInBtn: 'रिसायकलर डॅशबोर्डवर साइन इन करा',
    recyclerRegisterBtn: 'CPCB पडताळून संस्था नोंदणी करा',

    adminHeader: 'CPCB नियामक प्राधिकरण लॉगिन',
    adminNotice: 'उच्च सुरक्षा पोर्टल. नाव, मोबाईल नंबर आणि पासवर्ड प्रत्येक वेळी लॉगिन करताना विचारले जातील.',
    adminNameLabel: 'अधिकाऱ्याचे पूर्ण नाव',
    adminPhoneLabel: 'अधिकृत मोबाईल नंबर',
    adminPasswordLabel: 'ॲडमिन पासवर्ड',
    adminSubmitBtn: 'ॲडमिन सत्र पडताळा व डॅशबोर्ड उघडा',

    verifyFrequencyTitle: 'भंगार विक्रीची वारंवारता सत्यापित करा',
    verifyFrequencySubtitle: 'डॅशबोर्डवर जाण्यापूर्वी कृपया निवडा: आपण व्यावसायिक कबाडीवाला म्हणून नियमित भंगार विकता की घरगुती नागरिक म्हणून अधूनमधून:',
    verifyOtpVerifiedBadge: 'मोबाइल OTP सत्यापित',
    regularOptionTitle: 'नियमित भंगार विक्री (रेग्युलर)',
    regularOptionSubtitle: 'व्यावसायिक कबाडीवाला / स्क्रॅप संकलक',
    regularOptionDesc: 'तुम्ही भंगार संकलन केंद्र चालवता. रोज भंगार गोळा करून पुनर्वापर साखळीत मोठे लॉट्स विकता.',
    regularOptionBtn: 'नियमित विक्री → कबाडीवाला डॅशबोर्ड उघडा',
    periodicalOptionTitle: 'नियतकालिक / अधूनमधून भंगार विक्री (पिरियॉडिकल)',
    periodicalOptionSubtitle: 'घरगुती नागरिक (हाउसहोल्ड)',
    periodicalOptionDesc: 'तुम्ही घरातील जुने इलेक्ट्रॉनिक सामान व भंगार अधूनमधून विकता. थेट स्थानिक कबाडीवाल्यांशी संपर्क करून घरपोच पिकअप मिळवा.',
    periodicalOptionBtn: 'अधूनमधून विक्री → घरगुती डॅशबोर्ड उघडा',

    loadingText: 'पडताळणी सुरू आहे...',
    persistenceNotice: 'सुरक्षित सत्र: अधिकृत डॅशबोर्ड कार्यरत राहील.'
  },
  ta: {
    title: 'கபாடிவாலா கனெக்ட்',
    tagline: 'தேசிய மின்-கழிவு வட்ட சுழற்சி மற்றும் முறைப்படுத்தல் தளம்',
    subtagline: 'முறசாரா கழிவு சேகரிப்பாளர்களுக்கு வெளிப்படையான விலையும் மறுசுழற்சியாளர் இணைப்பும்',
    scrapperRoleTab: 'ஸ்க்ராப்பர் ஆண்ட்ராய்டு ஆப்',
    recyclerRoleTab: 'மறுசுழற்சியாளர் வலைப்பக்கம்',
    adminRoleTab: 'CPCB மத்திய ஒழுங்குமுறை வலை டெஸ்க்',

    portalGatewayTitle: 'உங்கள் அணுகல் தளத்தைத் தேர்ந்தெடுக்கவும்',
    portalGatewaySubtitle: 'பங்கு சார்ந்த கட்டமைப்பு: கழிவு சேகரிப்பாளர்களுக்கு ஆண்ட்ராய்டு ஆப், மற்றும் மறுசுழற்சி ஆலைகளுக்கு கிளவுட் வலைப்பக்கங்கள்',
    portalGatewayBadge: 'தேசிய மின்-கழிவு இயங்குதள நுழைவாயில்',
    scrapperGatewayCardTitle: 'கபாடிவாலா (ஸ்க்ராப்பர்) ஆண்ட்ராய்டு ஆப்',
    scrapperGatewayCardSubtitle: '📱 ஆண்ட்ராய்டு மொபைல் ஆப் (WebAPK & PWA)',
    scrapperGatewayCardDesc: 'முறசாரா சேகரிப்பாளர்கள் & யார்டு உரிமையாளர்களுக்கான பிரத்யேக ஆண்ட்ராய்டு ஆப். கேமரா எடை பூட்டு, ஆஃப்லைன் சேமிப்பு, குரல் வழிகாட்டல் மற்றும் 1-தட்டு SMS OTP.',
    recyclerGatewayCardTitle: 'அங்கீகரிக்கப்பட்ட மறுசுழற்சி வலைப்பக்கம்',
    recyclerGatewayCardSubtitle: '💻 நிறுவன வலைப்பக்கம் (Web Portal)',
    recyclerGatewayCardDesc: 'மறுசுழற்சி ஆலைகளுக்கான கிளவுட் டெஸ்க்டாப் வலைப்பக்கம். உள்வரும் லாட் ஆய்வு, டிஜிட்டல் எடை சரிபார்ப்பு, EPR சான்றிதழ் மற்றும் வங்கி/UPI பரிவர்த்தனை.',
    adminGatewayCardTitle: 'CPCB மத்திய ஒழுங்குமுறை வலைப்பக்கம்',
    adminGatewayCardSubtitle: '🌐 சட்டரீதியான ஒழுங்குமுறை வலை டெஸ்க்',
    adminGatewayCardDesc: 'மத்திய அரசு ஒழுங்குமுறை வலைப்பக்கம். கபாடிவாலா மற்றும் மறுசுழற்சியாளர்கள் இருவர் மீதும் முழு கண்காணிப்பு, விலை நிர்ணயம் மற்றும் தணிக்கை பதிவேடு.',
    enterPortalBtn: 'தளத்திற்குச் செல்லவும் →',
    backToGatewayBtn: '← முதன்மை தளத் தேர்வுக்கு திரும்பவும்',
    roleIsolationNotice: 'கட்டமைப்பு தனிமைப்படுத்தல்: கபாடிவாலா சேகரிப்பாளர்கள் ஆண்ட்ராய்டு ஆப் மூலம் இயங்குவர்; மறுசுழற்சி ஆலைகள் மற்றும் CPCB அதிகாரிகள் கிளவுட் வலைப்பக்கங்கள் மூலம் இயங்குவர்.',

    scrapperHeader: 'ஸ்க்ராப்பர் உள்நுழைவு தளம்',
    scrapperNotice: 'உங்கள் சேகரிப்பு டாஷ்போர்டை அணுக உங்கள் பதிவுசெய்த மொபைல் அல்லது பயனர்பெயர் மூலம் உள்நுழைக.',
    scrapperUsernameLabel: 'மொபைல் எண் அல்லது பயனர்பெயர்',
    scrapperSignInTab: 'உள்நுழைவு தளம் (உள்நுழைக)',
    scrapperRegisterTab: 'புதிய யார்டு (பதிவு செய்க)',
    scrapperRegisterHeader: 'புதிய ஸ்க்ராப்பர் (கபாடிவாலா) பதிவு தளம்',
    scrapperRegisterNotice: 'உங்கள் சேகரிப்பு யார்டை பதிவு செய்து அங்கீகரிக்கப்பட்ட ஆலைகளுடன் இணையுங்கள்.',
    scrapperQuickDemoTitle: '⚡ 1-தட்டு உடனடி சேகரிப்பாளர் உள்நுழைவு',
    scrapperQuickDemoSubtitle: 'எதுவும் தட்டச்சு செய்யாமல் நேரடியாக டாஷ்போர்டை திறக்க தட்டவும்:',
    scrapperMobileOtpTab: '📱 மொபைல் SMS OTP',
    scrapperPasswordTab: '🔑 பயனர்பெயர் / PIN',
    scrapperAutoFillYardBtn: '⚡ மாதிரி யார்டை தானாக நிரப்பு',
    scrapperPinOrPasswordLabel: '4-இலக்க PIN அல்லது கடவுச்சொல்',
    fullNameLabel: 'முழு பெயர்',
    yardLocationLabel: 'சேகரிப்பு மையம் / யார்டு இருப்பிடம்',
    aadhaarPhoneLabel: '10 இலக்க மொபைல் எண்',
    otpLabel: '6 இலக்க SMS சரிபார்ப்பு குறியீடு (OTP)',
    passwordLabel: 'கடவுச்சொல் / PIN',
    confirmPasswordLabel: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    sendOtpBtn: 'OTP அனுப்பு',
    resendOtpBtn: 'OTP மீண்டும் அனுப்பு',
    otpDispatchedMsg: 'OTP அனுப்பப்பட்டது: +91',
    aadhaarLinkedBadge: 'ஆதார் e-KYC சரிபார்க்கப்பட்டது',
    aadhaarLast4Label: 'ஆதார் எண்ணின் கடைசி 4 இலக்கங்கள் (விருப்பமானது)',
    scrapCategoryLabel: 'முதன்மை மின்-கழிவு வகை',
    scrapperSubmitBtn: 'டாஷ்போர்டில் உள்நுழைக',
    scrapperRegisterSubmitBtn: 'யார்டை பதிவு செய்து டாஷ்போர்டைத் திறக்கவும்',

    recyclerHeader: 'மறுசுழற்சியாளர் தளம்',
    recyclerSignInTab: 'கடவுச்சொல் மூலம் உள்நுழைக',
    recyclerRegisterTab: 'புதிய நிறுவனத்தை பதிவு செய்க',
    recyclerLoginNotice: 'நிறுவனத்தின் பெயர், இருப்பிடம் மற்றும் CPCB சான்றிதழ் விவரங்கள் சுயவிவரத்தில் சேமிக்கப்பட்டு தினசரி உள்நுழைவில் மீண்டும் கேட்கப்படாது.',
    recyclerRegisterNotice: 'நிறுவனத்தின் விவரங்கள் மற்றும் CPCB சான்றிதழ் சரிபார்ப்பு பதிவு செய்யும் போது ஒருமுறை மட்டுமே கேட்கப்படும்.',
    repNameLabel: 'அங்கீகரிக்கப்பட்ட பிரதிநிதி பெயர்',
    entityNameLabel: 'நிறுவனத்தின் முழு பெயர்',
    entityLocationLabel: 'தொழிற்சாலை / ஆலை முகவரி',
    cpcbNumberLabel: 'CPCB / SPCB சான்றிதழ் எண்',
    cpcbVerifiedBadge: 'CPCB சான்றிதழ் அங்கீகரிக்கப்பட்டது',
    usernameLabel: 'பயனர் பெயர்',
    recyclerSignInBtn: 'மறுசுழற்சியாளர் டாஷ்போர்டில் உள்நுழைக',
    recyclerRegisterBtn: 'CPCB சரிபார்த்து நிறுவனத்தை பதிவு செய்க',

    adminHeader: 'CPCB மத்திய ஒழுங்குமுறை நிர்வாக உள்நுழைவு',
    adminNotice: 'உயர் பாதுகாப்பு தளம். நிர்வாகி பெயர், மொபைல் எண் மற்றும் கடவுச்சொல் ஒவ்வொரு முறையும் உள்நுழையும் போது கேட்கப்படும்.',
    adminNameLabel: 'அதிகாரியின் முழு பெயர்',
    adminPhoneLabel: 'அதிகாரப்பூர்வ மொபைல் எண்',
    adminPasswordLabel: 'நிர்வாகி கடவுச்சொல்',
    adminSubmitBtn: 'அமர்வை சரிபார்த்து டாஷ்போர்டை திறக்கவும்',

    verifyFrequencyTitle: 'கழிவு விற்பனை முறையை சரிபார்க்கவும்',
    verifyFrequencySubtitle: 'டாஷ்போர்டிற்கு செல்வதற்கு முன், நீங்கள் வணிக ரீதியாக தொடர்ந்து கழிவு விற்பவரா அல்லது குடியிருப்பு பயன்பாட்டாளராக எப்போதாவது விற்பவரா என தேர்வு செய்யவும்:',
    verifyOtpVerifiedBadge: 'மொபைல் OTP சரிபார்க்கப்பட்டது',
    regularOptionTitle: 'வழக்கமான கழிவு விற்பனை (ரெகுலர்)',
    regularOptionSubtitle: 'வணிக சேகரிப்பாளர் / கபாடிவாலா',
    regularOptionDesc: 'நீங்கள் தினசரி கழிவுகளை சேகரித்து மொத்தமாக மறுசுழற்சி சங்கிலிக்கு விற்பனை செய்கிறீர்கள்.',
    regularOptionBtn: 'வழக்கமான விற்பனை → ஸ்கிராப்பர் டாஷ்போர்டு திறக்க',
    periodicalOptionTitle: 'காலமுறை / எப்போதாவது கழிவு விற்பனை (பீரியாடிகல்)',
    periodicalOptionSubtitle: 'குடியிருப்பு பயனர் (ஹவுஸ்ஹோல்ட் சிட்டிசன்)',
    periodicalOptionDesc: 'வீட்டு உபயோக மின்னணுக் கழிவுகளை எப்போதாவது வீட்டு வாசலில் கபாடிவாலாவிடம் கொடுத்து விற்கிறீர்கள். கபாடிவாலா இதனை முறைப்படி விற்பனை செய்வார்.',
    periodicalOptionBtn: 'எப்போதாவது விற்பனை → குடியிருப்பு டாஷ்போர்டு திறக்க',

    loadingText: 'சரிபார்க்கிறது...',
    persistenceNotice: 'பாதுகாப்பான அமர்வு: உங்கள் அங்கீகரிக்கப்பட்ட டாஷ்போர்டு பாதுகாப்பாக இருக்கும்.'
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, lang = 'en', onLangChange }) => {
  const at = AUTH_TEXTS[lang] || AUTH_TEXTS.en;

  // Dedicated Portal Gateway State: 'chooser' | 'scrapper' | 'recycler' | 'admin'
  const [activePortal, setActivePortal] = useState<ActivePortal>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('portal');
      if (p === 'scrapper' || p === 'recycler' || p === 'admin') return p;
    }
    return 'chooser';
  });

  // Selected Role Portal: 'scrapper' | 'recycler' | 'admin'
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('portal');
      if (p === 'recycler' || p === 'admin') return p;
    }
    return 'scrapper';
  });

  const handleSelectPortal = (portal: ActivePortal) => {
    setActivePortal(portal);
    if (portal !== 'chooser') {
      setSelectedRole(portal);
    }
    setError(null);
    setSuccessInfo(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (portal === 'chooser') {
        url.searchParams.delete('portal');
      } else {
        url.searchParams.set('portal', portal);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Post-OTP Scrap Frequency Verification State (Regular Scraps Sales vs Periodical Scraps Sales)
  const [pendingOtpUser, setPendingOtpUser] = useState<User | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // 1. Scrapper Form State
  // Dual-portal toggle: 'login' (Sign In to existing collector account) | 'register' (Register new collection yard)
  const [scrapperMode, setScrapperMode] = useState<'login' | 'register'>('login');

  // Login Method Toggle: 'mobile_otp' | 'password'
  const [scrapperLoginMethod, setScrapperLoginMethod] = useState<'mobile_otp' | 'password'>('mobile_otp');
  const [scrapperMobilePhone, setScrapperMobilePhone] = useState('9845012345');
  const [scrapperMobileOtp, setScrapperMobileOtp] = useState('749201');
  const [scrapperOtpSent, setScrapperOtpSent] = useState(false);
  const [scrapperSimulatedSms, setScrapperSimulatedSms] = useState<string | null>(null);
  const [isScrapperOtpLoading, setIsScrapperOtpLoading] = useState(false);

  // Returning Scrapper Login (Username / Mobile & Password / PIN)
  const [scrapperUsername, setScrapperUsername] = useState('ramesh');
  const [scrapperPassword, setScrapperPassword] = useState('password123');

  // New Scrapper Registration State (Streamlined to 3 core essentials)
  const [scrapperRegName, setScrapperRegName] = useState('');
  const [scrapperRegLocation, setScrapperRegLocation] = useState('Peenya Industrial Area, Bengaluru, Karnataka');
  const [scrapperRegPhone, setScrapperRegPhone] = useState('');
  const [scrapperRegPassword, setScrapperRegPassword] = useState('1234');
  const [scrapperRegAadhaar4, setScrapperRegAadhaar4] = useState('');

  // 2. Recycler Form State
  // Mode: 'login' (Username + Password only; entity & CPCB preserved) vs 'register' (Full onboarding)
  const [recyclerMode, setRecyclerMode] = useState<'login' | 'register'>('login');
  // Returning Recycler Login (Credentials only)
  const [recyclerUsername, setRecyclerUsername] = useState('');
  const [recyclerPassword, setRecyclerPassword] = useState('');
  // New Recycler Registration (Entity details & CPCB certificate - asked once)
  const [recRepName, setRecRepName] = useState('');
  const [recEntityName, setRecEntityName] = useState('');
  const [recLocation, setRecLocation] = useState('');
  const [recCpcbNumber, setRecCpcbNumber] = useState('');
  const [recUsername, setRecUsername] = useState('');
  const [recPassword, setRecPassword] = useState('');

  // Document Verification Assistant state (Recycler Onboarding)
  const [certFile, setCertFile] = useState<{ name: string; size: number } | null>(null);
  const [certVerifying, setCertVerifying] = useState(false);
  const [certExtraction, setCertExtraction] = useState<CpcbEprCertificateExtraction | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleVerifyCertificateFile = async (file: File) => {
    setCertFile({ name: file.name, size: file.size });
    setCertVerifying(true);
    setError(null);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const extraction = await api.verifyCpcbCertificate({
        fileBase64: base64Data,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        fileName: file.name
      });

      setCertExtraction(extraction);

      if (extraction.certificate_number) setRecCpcbNumber(extraction.certificate_number);
      if (extraction.entity_name) setRecEntityName(extraction.entity_name);
      if (extraction.entity_address) setRecLocation(extraction.entity_address);
      if (extraction.authorized_signatory_name && !recRepName) setRecRepName(extraction.authorized_signatory_name);

      setSuccessInfo(`CPCB EPR Certificate verified! Confidence: ${extraction.extraction_confidence.toUpperCase()}. Registered details populated.`);
    } catch (err: any) {
      setError(`Certificate verification notice: ${err?.message || 'Verification could not extract fields'}`);
    } finally {
      setCertVerifying(false);
    }
  };

  const handleLoadSampleCertificate = async () => {
    setCertFile({ name: 'CPCB_EPR_Registration_Certificate_2026.pdf', size: 142850 });
    setCertVerifying(true);
    setError(null);
    try {
      const extraction = await api.verifyCpcbCertificate({
        fileName: 'CPCB_EPR_Registration_Certificate_2026.pdf',
        mimeType: 'application/pdf',
        fileBase64: 'JVBERi0xLjQK'
      });

      setCertExtraction(extraction);

      if (extraction.certificate_number) setRecCpcbNumber(extraction.certificate_number);
      if (extraction.entity_name) setRecEntityName(extraction.entity_name);
      if (extraction.entity_address) setRecLocation(extraction.entity_address);
      if (extraction.authorized_signatory_name) setRecRepName(extraction.authorized_signatory_name);

      setSuccessInfo('Official CPCB EPR Registration Certificate loaded & extracted by AI Assistant!');
    } catch (err: any) {
      setError(`Sample extraction error: ${err.message}`);
    } finally {
      setCertVerifying(false);
    }
  };

  // 3. Admin Form State (Repeatedly asked on every login: Name, Mobile Number, Password)
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Admin Forgot Password / Recovery State
  const [showAdminForgotModal, setShowAdminForgotModal] = useState(false);
  const [adminResetPhone, setAdminResetPhone] = useState('1122307000');
  const [adminResetOtp, setAdminResetOtp] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminResetOtpSent, setAdminResetOtpSent] = useState(false);
  const [adminResetOtpSimulated, setAdminResetOtpSimulated] = useState('');
  const [adminResetLoading, setAdminResetLoading] = useState(false);
  const [adminResetError, setAdminResetError] = useState<string | null>(null);
  const [adminResetSuccess, setAdminResetSuccess] = useState<string | null>(null);
  const [adminRecoveryMode, setAdminRecoveryMode] = useState<'instant' | 'otp_reset'>('instant');

  // Quick 1-tap restore default admin password
  const handleQuickRestoreDefaultAdminPassword = () => {
    setAdminPassword('admin123');
    if (!adminName.trim()) setAdminName('Dr. Ananya Sharma');
    if (!adminPhone.trim()) setAdminPhone('1122307000');
    setShowAdminForgotModal(false);
    setSuccessInfo('Official Admin Default Password "admin123" filled! Click "Enter National CPCB Admin Grid" to access.');
    setError(null);
  };

  // Dispatch OTP for Admin Password Reset
  const handleSendAdminResetOtp = async () => {
    const clean = adminResetPhone.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setAdminResetError('Please enter a valid 10-digit official mobile number.');
      return;
    }
    setAdminResetError(null);
    setAdminResetSuccess(null);
    setAdminResetLoading(true);
    try {
      const res = await api.sendOtp(clean);
      setAdminResetOtpSent(true);
      setAdminResetOtpSimulated(res.otp);
      setAdminResetOtp(res.otp); // Pre-fill for instant seamless test
      setAdminResetSuccess(`Verification OTP dispatched to +91 ${clean}. Code: ${res.otp}`);
    } catch (err: any) {
      setAdminResetError(err.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setAdminResetLoading(false);
    }
  };

  // Submit Admin Password Reset
  const handleAdminResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminResetError(null);
    setAdminResetSuccess(null);

    if (!adminNewPassword.trim() || adminNewPassword.trim().length < 4) {
      setAdminResetError('New password must be at least 4 characters long.');
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setAdminResetError('Passwords do not match. Please re-enter.');
      return;
    }

    const clean = adminResetPhone.replace(/\D/g, '').slice(-10);
    setAdminResetLoading(true);
    try {
      const res = await api.adminResetPassword({
        phone: clean,
        otp: adminResetOtp.trim(),
        newPassword: adminNewPassword.trim()
      });
      setAdminResetSuccess(res.message || 'Admin password reset successfully!');
      setAdminPassword(adminNewPassword.trim());
      if (!adminName.trim()) setAdminName('Dr. Ananya Sharma');
      if (!adminPhone.trim()) setAdminPhone(clean);

      setTimeout(() => {
        setShowAdminForgotModal(false);
        setSuccessInfo(`Admin password updated to "${adminNewPassword.trim()}". You can now login.`);
      }, 1200);
    } catch (err: any) {
      setAdminResetError(err.message || 'Password reset failed. Please verify OTP and try again.');
    } finally {
      setAdminResetLoading(false);
    }
  };

  // Send OTP for Scrapper Mobile Login
  const handleSendScrapperLoginOtp = async () => {
    const clean = scrapperMobilePhone.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setError(null);
    setSuccessInfo(null);
    setIsScrapperOtpLoading(true);

    try {
      const res = await api.sendOtp(clean);
      setScrapperOtpSent(true);
      setScrapperSimulatedSms(res.otp);
      setScrapperMobileOtp(res.otp); // Pre-fill for instant 1-tap testing
      setSuccessInfo(`${at.otpDispatchedMsg} ${clean}. Verification code is active.`);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setIsScrapperOtpLoading(false);
    }
  };

  // Handle verification question answer: Regular Scraps Sales vs Periodical Scraps Sales
  const handleSelectSalesFrequency = async (frequency: 'regular' | 'periodical') => {
    if (!pendingOtpUser) return;
    setIsUpdatingRole(true);
    setError(null);
    try {
      const targetRole: UserRole = frequency === 'regular' ? 'scrapper' : 'household';
      const updatedUser = await api.updateUserRole(pendingOtpUser.id, targetRole, frequency);
      localStorage.setItem('kc_session_user', JSON.stringify(updatedUser));
      setPendingOtpUser(null);
      onLoginSuccess(updatedUser);
    } catch (err: any) {
      // Fallback if offline
      const updatedUser: User = {
        ...pendingOtpUser,
        role: frequency === 'regular' ? 'scrapper' : 'household',
        sales_frequency: frequency
      };
      localStorage.setItem('kc_session_user', JSON.stringify(updatedUser));
      setPendingOtpUser(null);
      onLoginSuccess(updatedUser);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Submit Scrapper Mobile + OTP Login
  const handleScrapperOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const clean = scrapperMobilePhone.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!scrapperMobileOtp.trim()) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.scrapperLogin({
        phone: clean,
        otp: scrapperMobileOtp.trim()
      });
      // After OTP: Prompt user to verify whether they sell scrap regularly or periodically
      setPendingOtpUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please verify and retry.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Scrapper Username / Password Login
  const handleScrapperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!scrapperUsername.trim()) {
      setError('Please enter your Scrapper username or registered mobile.');
      return;
    }
    if (!scrapperPassword.trim()) {
      setError('Password or 4-digit PIN is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.scrapperLogin({
        username: scrapperUsername.trim(),
        password: scrapperPassword.trim()
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Scrap Collector authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ⚡ 1-Tap Auto Fill Example Registration
  const handleAutoFillExampleYard = () => {
    setError(null);
    setScrapperRegName('Ramesh Kumar');
    setScrapperRegPhone('9845012345');
    setScrapperRegLocation('Peenya Industrial Area, Bengaluru, Karnataka');
    setScrapperRegPassword('1234');
    setScrapperRegAadhaar4('8821');
    setSuccessInfo('Example collection yard populated! Tap "Register Yard & Open Dashboard" below.');
  };

  // Submit Simplified Scrapper Registration (Name, Mobile, Yard Location, PIN)
  const handleScrapperRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const clean = scrapperRegPhone.replace(/\D/g, '').slice(-10);
    if (!scrapperRegName.trim()) {
      setError('Full legal name is required.');
      return;
    }
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const effectiveLocation = scrapperRegLocation.trim() || 'Peenya Industrial Area, Bengaluru, Karnataka';
    const effectivePassword = scrapperRegPassword.trim() || '1234';
    const effectiveAadhaar = scrapperRegAadhaar4.trim() || clean.slice(-4);

    setLoading(true);
    try {
      const res = await api.scrapperRegister({
        name: scrapperRegName.trim(),
        location: effectiveLocation,
        phone: clean,
        password: effectivePassword,
        aadhaar_last4: effectiveAadhaar
      });
      // After registration: Prompt user to verify scrap sales frequency (Regular vs Periodical)
      setPendingOtpUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Scrapper registration failed. Please verify information.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Recycler Login (Credentials only; entity details not asked)
  const handleRecyclerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!recyclerUsername.trim() || !recyclerPassword.trim()) {
      setError('Facility Username and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        username: recyclerUsername.trim(),
        password: recyclerPassword.trim(),
        role: 'recycler'
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Recycler sign-in failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Recycler Registration (One-time registration with entity details & CPCB certificate)
  const handleRecyclerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!recRepName.trim()) {
      setError('Representative full name is required.');
      return;
    }
    if (!recEntityName.trim()) {
      setError('Legal Entity / Facility name is required.');
      return;
    }
    if (!recLocation.trim()) {
      setError('Facility operational location is required.');
      return;
    }
    if (!recCpcbNumber.trim()) {
      setError('CPCB / SPCB Authorization Certificate Number is required.');
      return;
    }
    if (!recUsername.trim() || !recPassword.trim()) {
      setError('Username and Password are required to create your facility account.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: recRepName.trim(),
        entity_name: recEntityName.trim(),
        location: recLocation.trim(),
        cpcb_number: recCpcbNumber.trim(),
        username: recUsername.trim(),
        password: recPassword.trim(),
        role: 'recycler',
        phone: '+91 80 2839 4400',
        verified: false
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Recycler entity registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Admin Login (Name, Mobile Number, and Password repeatedly required on every login)
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const clean = adminPhone.replace(/\D/g, '').slice(-10);
    if (!adminName.trim()) {
      setError('Auditor / Officer Name is required.');
      return;
    }
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit official mobile number.');
      return;
    }
    if (!adminPassword.trim()) {
      setError('Authorized Admin Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminLogin({
        name: adminName.trim(),
        phone: clean,
        password: adminPassword.trim()
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Admin authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Language Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-4 flex justify-between items-center px-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CPCB National E-Waste Grid</span>
        </div>

        {onLangChange && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200 shadow-2xs text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['en', 'hi', 'mr', 'ta'] as VernacularLang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onLangChange(l)}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  lang === l
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hero Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-2">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-2xl shadow-md text-white mb-3">
          <Building2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {at.title}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-emerald-800 mt-1 max-w-xl mx-auto">
          {at.tagline}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-lg mx-auto">
          {at.subtagline}
        </p>
      </div>

      {/* PORTAL SELECTION GATEWAY (When no specific portal is active) */}
      {activePortal === 'chooser' ? (
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-4xl z-10 px-2 sm:px-0">
          {/* Isolation Policy Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {at.portalGatewayBadge}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {at.portalGatewayTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                {at.roleIsolationNotice}
              </p>
            </div>
          </div>

          {/* 3 Dedicated Role Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Scrapper (Kabadiwala) Android App Card */}
            <div className="bg-white rounded-2xl border-2 border-emerald-300 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg shadow-xs">
                Android App
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Android Mobile App</span>
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {at.scrapperGatewayCardTitle}
                </h3>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {at.scrapperGatewayCardSubtitle}
                </p>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {at.scrapperGatewayCardDesc}
                </p>

                {/* Android App Capabilities */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>📱 Mobile SMS OTP & Registered PIN Login</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>📷 Android Camera E-Waste Scale Recognition</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>⚡ Offline Local Queue & GPS Navigation Radar</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  id="choose-portal-scrapper"
                  onClick={() => handleSelectPortal('scrapper')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Launch Android App →</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAndroidModalOpen(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Install on Android phone or download APK"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Install App / APK Package</span>
                </button>
              </div>
            </div>

            {/* 2. Authorized Recycler Web Portal Card */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-500 shadow-md hover:shadow-xl transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg shadow-xs">
                Web Page
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Desktop Web Page</span>
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {at.recyclerGatewayCardTitle}
                </h3>
                <p className="text-xs font-bold text-blue-700 mt-0.5">
                  {at.recyclerGatewayCardSubtitle}
                </p>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {at.recyclerGatewayCardDesc}
                </p>

                {/* Web Portal Capabilities */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium text-blue-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>💻 Returning Facility Web Login (User & Pass)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>⚖️ Electronic Weighbridge Calibration Terminal</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>📄 CPCB EPR Circular Credit Certificate PDF Generator</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  id="choose-portal-recycler"
                  onClick={() => handleSelectPortal('recycler')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Open Recycler Web Page →</span>
                </button>
                <div className="py-1.5 text-center text-[11px] text-slate-400 font-medium">
                  🌐 Browser Cloud Application
                </div>
              </div>
            </div>

            {/* 3. Central Admin Regulatory Web Portal Card */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 hover:border-slate-800 shadow-md hover:shadow-xl transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-slate-900 text-amber-400 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg shadow-xs">
                Web Page
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                    <ShieldAlert className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Regulatory Web Desk</span>
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {at.adminGatewayCardTitle}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {at.adminGatewayCardSubtitle}
                </p>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {at.adminGatewayCardDesc}
                </p>

                {/* Regulatory Capabilities */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                    <span>🏛️ Master Dual Control over Scrapper & Recycler</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                    <span>📈 Statutory MSP Fair Price Index Setting</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                    <span>📜 Statutory Prosecution Desk & DDL Schema Export</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  id="choose-portal-admin"
                  onClick={() => handleSelectPortal('admin')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Open Regulatory Web Page →</span>
                </button>
                <div className="py-1.5 text-center text-[11px] text-slate-400 font-medium">
                  🏛️ Official CPCB Government Desk
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            🔒 {at.persistenceNotice}
          </div>
        </div>
      ) : (
        /* ISOLATED SINGLE-ROLE LOGIN PORTAL
           Strict isolation: The selected portal contains ONLY that role's login/registration.
           Scrappers cannot see Recycler or Admin login.
           Recyclers cannot see Scrapper or Admin login.
        */
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl z-10 px-1 sm:px-0">
          <div className="bg-white py-6 px-4 sm:py-8 sm:px-8 shadow-xl rounded-2xl border border-slate-200">
            
            {/* ISOLATED PORTAL HEADER & NAVIGATION */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <button
                type="button"
                id="back-to-gateway-btn"
                onClick={() => handleSelectPortal('chooser')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{at.backToGatewayBtn}</span>
              </button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-slate-800 bg-slate-100 border border-slate-200">
                {activePortal === 'scrapper' && <Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
                {activePortal === 'recycler' && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                {activePortal === 'admin' && <Building2 className="w-3.5 h-3.5 text-amber-600" />}
                <span>
                  {activePortal === 'scrapper' ? '📱 Android App' : activePortal === 'recycler' ? '💻 Web Portal (Web Page)' : '🌐 Web Desk (Web Page)'}
                </span>
              </span>
            </div>

            {/* Architecture Role Indicator Banner */}
            {activePortal === 'scrapper' && (
              <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-emerald-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-emerald-400/40">
                    <Smartphone className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base tracking-tight">Kabadiwala Connect — Android App</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wider">
                        v1.2.0 WebAPK
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-100 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>📷 AI Scale Camera</span>
                      <span>•</span>
                      <span>⚡ Offline Local Queue</span>
                      <span>•</span>
                      <span>📍 GPS Radar</span>
                      <span>•</span>
                      <span>🎙️ Vernacular TTS</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAndroidModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 active:scale-95 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Install Android App</span>
                </button>
              </div>
            )}

            {activePortal === 'recycler' && (
              <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-blue-400/40">
                    <Globe className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base tracking-tight">Authorized Recycler — Desktop Web Portal</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-300 text-blue-950 uppercase tracking-wider">
                        Cloud Web Page
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200 mt-0.5">
                      Enterprise Browser Application for CPCB/SPCB Registered Facilities & Weighbridges
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-blue-200 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-700 shrink-0 hidden sm:inline-block">
                  💻 Desktop Web Workspace
                </span>
              </div>
            )}

            {activePortal === 'admin' && (
              <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-amber-400/40">
                    <Building2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base tracking-tight">CPCB Central Regulatory Authority — Web Desk</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                        Govt Web Page
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Statutory Oversight, Dual Master Control, Fair Pricing MSP & National Audit Ledger
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-amber-200 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-amber-800/40 shrink-0 hidden sm:inline-block">
                  🌐 Statutory Web Desk
                </span>
              </div>
            )}

            {/* Feedback Toasts */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successInfo && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successInfo}</span>
              </div>
            )}

            {/* ===================================================================
                ROLE 1: SCRAPPER (KABADIWALA)
                Simplified authentication:
                1) 1-Tap Quick Collector Logins
                2) Mobile SMS OTP Login or PIN/Password Login
                3) Simplified 3-Field Yard Registration
               =================================================================== */}
            {activePortal === 'scrapper' && (
              <div className="space-y-5">
                
                {/* 2-Portal Switcher Tabs inside Scrap Collector Section */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-4 border border-slate-200">
                  <button
                    type="button"
                    id="scrapper-portal-tab-login"
                    onClick={() => {
                      setScrapperMode('login');
                      setError(null);
                      setSuccessInfo(null);
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      scrapperMode === 'login'
                        ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{at.scrapperSignInTab}</span>
                  </button>
                  <button
                    type="button"
                    id="scrapper-portal-tab-register"
                    onClick={() => {
                      setScrapperMode('register');
                      setError(null);
                      setSuccessInfo(null);
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      scrapperMode === 'register'
                        ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{at.scrapperRegisterTab}</span>
                  </button>
                </div>

                {/* ==========================================
                    PORTAL 1: SCRAPPER LOGIN PORTAL
                   ========================================== */}
                {scrapperMode === 'login' && (
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-bold mb-0.5">
                        <Smartphone className="w-4 h-4 text-emerald-700" />
                        <span>{at.scrapperHeader}</span>
                      </div>
                      <p className="text-emerald-800 text-xs mt-0.5">
                        {at.scrapperNotice}
                      </p>
                    </div>

                    {/* Method Selector Tabs: Mobile SMS OTP vs Username / PIN */}
                    <div>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-3 border border-slate-200">
                        <button
                          type="button"
                          id="scrapper-method-otp"
                          onClick={() => setScrapperLoginMethod('mobile_otp')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            scrapperLoginMethod === 'mobile_otp'
                              ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{at.scrapperMobileOtpTab}</span>
                        </button>
                        <button
                          type="button"
                          id="scrapper-method-password"
                          onClick={() => setScrapperLoginMethod('password')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            scrapperLoginMethod === 'password'
                              ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{at.scrapperPasswordTab}</span>
                        </button>
                      </div>

                      {/* Sub-form 1: Mobile SMS OTP */}
                      {scrapperLoginMethod === 'mobile_otp' && (
                        <form onSubmit={handleScrapperOtpLogin} className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label htmlFor="scrapper-mobile-login-input" className="block text-xs font-bold text-slate-800">
                                {at.aadhaarPhoneLabel} <span className="text-emerald-600">*</span>
                              </label>
                              <span className={`text-[11px] font-semibold ${scrapperMobilePhone.replace(/\D/g, '').length === 10 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {scrapperMobilePhone.replace(/\D/g, '').length}/10 digits
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex items-center justify-center px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 select-none">
                                +91
                              </div>
                              <input
                                id="scrapper-mobile-login-input"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                required
                                value={scrapperMobilePhone}
                                onChange={(e) => setScrapperMobilePhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="98450 12345"
                                className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                id="scrapper-login-send-otp-btn"
                                disabled={isScrapperOtpLoading || scrapperMobilePhone.replace(/\D/g, '').length < 10}
                                onClick={handleSendScrapperLoginOtp}
                                className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                              >
                                {isScrapperOtpLoading ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Smartphone className="w-3.5 h-3.5" />
                                )}
                                <span>{scrapperOtpSent ? at.resendOtpBtn : at.sendOtpBtn}</span>
                              </button>
                            </div>
                          </div>

                          {/* Simulated SMS Toast for demo */}
                          {scrapperSimulatedSms && (
                            <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>SMS OTP: <strong className="font-mono text-sm tracking-widest text-slate-900">{scrapperSimulatedSms}</strong></span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Auto-filled</span>
                            </div>
                          )}

                          <div>
                            <label htmlFor="scrapper-mobile-otp-input" className="block text-xs font-bold text-slate-800 mb-1">
                              {at.otpLabel} <span className="text-emerald-600">*</span>
                            </label>
                            <input
                              id="scrapper-mobile-otp-input"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              required
                              value={scrapperMobileOtp}
                              onChange={(e) => setScrapperMobileOtp(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 749201"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <button
                            type="submit"
                            id="scrapper-otp-submit-btn"
                            disabled={loading || !scrapperMobileOtp.trim()}
                            className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                          >
                            {loading ? (
                              <span>{at.loadingText}</span>
                            ) : (
                              <>
                                <span>{at.scrapperSubmitBtn}</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </form>
                      )}

                      {/* Sub-form 2: Username / PIN Login */}
                      {scrapperLoginMethod === 'password' && (
                        <form onSubmit={handleScrapperSubmit} className="space-y-3">
                          <div>
                            <label htmlFor="scrapper-username-input" className="block text-xs font-bold text-slate-800 mb-1">
                              {at.scrapperUsernameLabel} <span className="text-emerald-600">*</span>
                            </label>
                            <div className="relative">
                              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                              <input
                                id="scrapper-username-input"
                                type="text"
                                required
                                value={scrapperUsername}
                                onChange={(e) => setScrapperUsername(e.target.value)}
                                placeholder="Enter username or mobile (e.g. ramesh)"
                                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label htmlFor="scrapper-password-input" className="block text-xs font-bold text-slate-800">
                                {at.passwordLabel} <span className="text-emerald-600">*</span>
                              </label>
                            </div>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                              <input
                                id="scrapper-password-input"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={scrapperPassword}
                                onChange={(e) => setScrapperPassword(e.target.value)}
                                placeholder="Enter PIN or password (e.g. password123)"
                                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                aria-label="Toggle password visibility"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Quick Auto-Fill Helper */}
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div className="text-slate-600">
                              <span className="font-semibold text-slate-700">Demo Account: </span>
                              <code className="text-emerald-700 font-bold">ramesh</code> / <code className="text-slate-700">password123</code>
                            </div>
                            <button
                              type="button"
                              id="scrapper-demo-fill-btn"
                              onClick={() => {
                                setScrapperUsername('ramesh');
                                setScrapperPassword('password123');
                              }}
                              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                            >
                              Auto Fill
                            </button>
                          </div>

                          <button
                            type="submit"
                            id="scrapper-submit-btn"
                            disabled={loading}
                            className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                          >
                            {loading ? (
                              <span>{at.loadingText}</span>
                            ) : (
                              <>
                                <span>{at.scrapperSubmitBtn}</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Portal Switch Link */}
                    <div className="text-center pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        id="switch-to-scrapper-register-btn"
                        onClick={() => {
                          setScrapperMode('register');
                          setError(null);
                          setSuccessInfo(null);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>New scrap collector or yard aggregator? Register New Yard →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ==========================================
                    PORTAL 2: SCRAPPER NEW REGISTER PORTAL
                   ========================================== */}
                {scrapperMode === 'register' && (
                  <div className="space-y-4">
                    {/* Header Banner with Auto-fill helper */}
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 font-bold">
                          <UserPlus className="w-4 h-4 text-emerald-700" />
                          <span>{at.scrapperRegisterHeader}</span>
                        </div>
                        <p className="text-emerald-800 text-xs mt-0.5">
                          {at.scrapperRegisterNotice}
                        </p>
                      </div>
                      <button
                        type="button"
                        id="auto-fill-example-yard-btn"
                        onClick={handleAutoFillExampleYard}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{at.scrapperAutoFillYardBtn}</span>
                      </button>
                    </div>

                    <form onSubmit={handleScrapperRegisterSubmit} className="space-y-4">
                      
                      {/* 1. Full Legal Name */}
                      <div>
                        <label htmlFor="scrapper-reg-name-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                          {at.fullNameLabel} <span className="text-emerald-600">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            id="scrapper-reg-name-input"
                            type="text"
                            required
                            value={scrapperRegName}
                            onChange={(e) => setScrapperRegName(e.target.value)}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* 2. 10-Digit Mobile Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="scrapper-reg-phone-input" className="block text-xs sm:text-sm font-bold text-slate-800">
                            {at.aadhaarPhoneLabel} <span className="text-emerald-600">*</span>
                          </label>
                          <span className={`text-xs font-semibold ${scrapperRegPhone.replace(/\D/g, '').length === 10 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {scrapperRegPhone.replace(/\D/g, '').length}/10 digits
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex items-center justify-center px-3.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 shrink-0 select-none">
                            +91
                          </div>
                          <input
                            id="scrapper-reg-phone-input"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            value={scrapperRegPhone}
                            onChange={(e) => setScrapperRegPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98450 12345"
                            className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-base font-bold text-slate-800 tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* 3. Yard Location with quick-select chips */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="scrapper-reg-location-input" className="block text-xs sm:text-sm font-bold text-slate-800">
                            {at.yardLocationLabel} <span className="text-emerald-600">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400">Tap city below to fill</span>
                        </div>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            id="scrapper-reg-location-input"
                            type="text"
                            required
                            value={scrapperRegLocation}
                            onChange={(e) => setScrapperRegLocation(e.target.value)}
                            placeholder="e.g. Peenya Industrial Area, Bengaluru, Karnataka"
                            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        {/* Quick-select chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            'Peenya Industrial Area, Bengaluru',
                            'Okhla Industrial Area, New Delhi',
                            'Dharavi Compound, Mumbai'
                          ].map((hub) => (
                            <button
                              key={hub}
                              type="button"
                              onClick={() => setScrapperRegLocation(hub)}
                              className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer border border-slate-200"
                            >
                              📍 {hub}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. PIN or Password & Optional Aadhaar Last 4 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                        <div>
                          <label htmlFor="scrapper-reg-pin-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                            {at.scrapperPinOrPasswordLabel}
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              id="scrapper-reg-pin-input"
                              type={showPassword ? 'text' : 'password'}
                              value={scrapperRegPassword}
                              onChange={(e) => setScrapperRegPassword(e.target.value)}
                              placeholder="Default: 1234"
                              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Easy 4-digit PIN for daily login</span>
                        </div>

                        {/* Optional Aadhaar Last 4 */}
                        <div>
                          <label htmlFor="scrapper-reg-aadhaar-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                            {at.aadhaarLast4Label}
                          </label>
                          <div className="relative">
                            <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              id="scrapper-reg-aadhaar-input"
                              type="text"
                              inputMode="numeric"
                              maxLength={4}
                              value={scrapperRegAadhaar4}
                              onChange={(e) => setScrapperRegAadhaar4(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 8821 (optional)"
                              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{at.aadhaarLinkedBadge}</span>
                          </div>
                        </div>
                      </div>

                      {/* Submit Scrapper Registration */}
                      <button
                        type="submit"
                        id="scrapper-reg-submit-btn"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-4"
                      >
                        {loading ? (
                          <span>{at.loadingText}</span>
                        ) : (
                          <>
                            <UserCheck className="w-5 h-5" />
                            <span>{at.scrapperRegisterSubmitBtn}</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      {/* Switch to Login Portal */}
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          id="switch-to-scrapper-login-btn"
                          onClick={() => {
                            setScrapperMode('login');
                            setError(null);
                            setSuccessInfo(null);
                          }}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Already registered your yard? Open Login Portal →</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            )}

          {/* ===================================================================
              ROLE 2: AUTHORIZED RECYCLER
              Requirements:
              - Returning logins: only asks Username & Password.
                Entity Name, Location, and CPCB Certificate are NOT asked each time of login!
              - Register Entity: asks Full Name, Entity Name, Location of Entity, CPCB Certificate number.
              Strictly isolated: No scrapper or admin tabs.
             =================================================================== */}
          {activePortal === 'recycler' && (
            <div className="space-y-5">
              
              {/* Recycler Sub-Mode Toggle */}
              <div className="flex rounded-xl bg-slate-100 p-0.5 mb-3 border border-slate-200">
                <button
                  type="button"
                  id="recycler-submode-login"
                  onClick={() => {
                    setRecyclerMode('login');
                    setError(null);
                    setSuccessInfo(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    recyclerMode === 'login'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {at.recyclerSignInTab}
                </button>
                <button
                  type="button"
                  id="recycler-submode-register"
                  onClick={() => {
                    setRecyclerMode('register');
                    setError(null);
                    setSuccessInfo(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    recyclerMode === 'register'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {at.recyclerRegisterTab}
                </button>
              </div>

              {/* Mode A: Returning Recycler Login (Credentials only; entity details not re-asked) */}
              {recyclerMode === 'login' && (
                <form onSubmit={handleRecyclerLoginSubmit} className="space-y-4">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-bold mb-0.5">
                      <FileCheck className="w-4 h-4 text-blue-700" />
                      <span>{at.recyclerHeader}</span>
                    </div>
                    <p className="text-blue-800 text-xs mt-0.5">
                      {at.recyclerLoginNotice}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="rec-login-username" className="block text-sm font-bold text-slate-800 mb-1">
                      {at.usernameLabel} <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="rec-login-username"
                        type="text"
                        required
                        value={recyclerUsername}
                        onChange={(e) => setRecyclerUsername(e.target.value)}
                        placeholder="e.g. ecorecycle or facility_id"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="rec-login-password" className="block text-sm font-bold text-slate-800">
                        {at.passwordLabel} <span className="text-blue-600">*</span>
                      </label>
                      <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                        Default Password: <strong className="font-mono font-bold text-blue-900">password123</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="rec-login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={recyclerPassword}
                        onChange={(e) => setRecyclerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 1-Tap Quick Fill Demo Recycler Accounts */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Forgot Password? 1-Tap Demo Facilities:</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">PIN: password123</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setRecyclerUsername('ecorecycle');
                          setRecyclerPassword('password123');
                          setSuccessInfo('Auto-filled EcoRecycle Solutions credentials! Click Sign In.');
                          setError(null);
                        }}
                        className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-all cursor-pointer group"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-blue-700 truncate">EcoRecycle</div>
                        <div className="text-[10px] text-slate-500 font-mono">ecorecycle</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRecyclerUsername('greenmetal');
                          setRecyclerPassword('password123');
                          setSuccessInfo('Auto-filled GreenMetals credentials! Click Sign In.');
                          setError(null);
                        }}
                        className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-all cursor-pointer group"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-blue-700 truncate">GreenMetals</div>
                        <div className="text-[10px] text-slate-500 font-mono">greenmetal</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRecyclerUsername('chennaicircular');
                          setRecyclerPassword('password123');
                          setSuccessInfo('Auto-filled Chennai Circular credentials! Click Sign In.');
                          setError(null);
                        }}
                        className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-all cursor-pointer group"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-blue-700 truncate">Chennai Circular</div>
                        <div className="text-[10px] text-slate-500 font-mono">chennaicircular</div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="rec-login-submit-btn"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <span>{at.loadingText}</span>
                    ) : (
                      <>
                        <span>{at.recyclerSignInBtn}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Mode B: Register Recycler Entity (First-time onboarding with Entity Name, Location, and CPCB Certificate) */}
              {recyclerMode === 'register' && (
                <form onSubmit={handleRecyclerRegisterSubmit} className="space-y-3.5">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-bold mb-0.5">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span>{at.recyclerRegisterTab}</span>
                    </div>
                    <p className="text-blue-800 text-xs mt-0.5">
                      {at.recyclerRegisterNotice}
                    </p>
                  </div>

                  {/* AI Document-Verification Assistant for Recycler Onboarding */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 border border-blue-800/60 rounded-2xl text-white space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <span>CPCB Document-Verification Assistant</span>
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
                              EPR Parser
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Upload CPCB EPR Registration Certificate (PDF or Image) to extract information automatically.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {/* File Input */}
                      <label className="flex items-center justify-center gap-2 p-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl cursor-pointer text-xs font-semibold transition-all group text-center">
                        <UploadCloud className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="truncate">
                          {certFile ? certFile.name : 'Upload EPR Certificate (PDF / Image)'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVerifyCertificateFile(file);
                          }}
                        />
                      </label>

                      {/* 1-Click Demo Sample */}
                      <button
                        type="button"
                        onClick={handleLoadSampleCertificate}
                        disabled={certVerifying}
                        className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Load Demo CPCB Certificate</span>
                      </button>
                    </div>

                    {/* Verifying Spinner */}
                    {certVerifying && (
                      <div className="p-3 bg-blue-950/80 border border-blue-500/40 rounded-xl flex items-center gap-2 text-xs text-blue-200">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                        <span>AI Assistant extracting CPCB EPR certificate fields...</span>
                      </div>
                    )}

                    {/* Extracted Certificate Card */}
                    {certExtraction && (
                      <div className="p-3.5 bg-slate-900/90 border border-blue-700/50 rounded-xl space-y-2.5 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white">Extracted EPR Certificate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              certExtraction.extraction_confidence === 'high'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : certExtraction.extraction_confidence === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              Confidence: {certExtraction.extraction_confidence}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowRawJson(!showRawJson)}
                              className="text-[10px] text-blue-300 hover:text-white underline font-mono cursor-pointer"
                            >
                              {showRawJson ? 'Hide JSON' : 'View JSON'}
                            </button>
                          </div>
                        </div>

                        {/* Grid of Extracted Attributes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400">Certificate No:</span>{' '}
                            <strong className="text-white font-mono">{certExtraction.certificate_number || 'N/A'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Issue Date:</span>{' '}
                            <strong className="text-white font-mono">{certExtraction.issue_date || 'N/A'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Entity Category:</span>{' '}
                            <strong className="text-blue-300">{certExtraction.entity_category || 'N/A'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Waste Stream:</span>{' '}
                            <strong className="text-emerald-300">{certExtraction.waste_stream || 'N/A'}</strong>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400">Entity Name:</span>{' '}
                            <strong className="text-white">{certExtraction.entity_name || 'N/A'}</strong>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400">Address:</span>{' '}
                            <span className="text-slate-200">{certExtraction.entity_address || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Signatory:</span>{' '}
                            <span className="text-white">{certExtraction.authorized_signatory_name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Designation:</span>{' '}
                            <span className="text-slate-300">{certExtraction.authorized_signatory_designation || 'N/A'}</span>
                          </div>
                          {certExtraction.validity_period_years !== null && (
                            <div>
                              <span className="text-slate-400">Validity:</span>{' '}
                              <span className="text-emerald-300 font-bold">{certExtraction.validity_period_years} Years</span>
                            </div>
                          )}
                          {certExtraction.eee_or_item_codes?.length > 0 && (
                            <div className="sm:col-span-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-400">Item Codes:</span>
                              {certExtraction.eee_or_item_codes.map((code) => (
                                <span key={code} className="px-1.5 py-0.2 bg-blue-900/60 border border-blue-500/40 rounded text-[10px] font-mono text-blue-200">
                                  {code}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {certExtraction.notes && (
                          <div className="p-2 bg-black/40 border border-slate-700/60 rounded text-[11px] text-slate-300">
                            <span className="text-slate-400 font-bold">Notes:</span> {certExtraction.notes}
                          </div>
                        )}

                        {/* Raw JSON View */}
                        {showRawJson && (
                          <pre className="p-2.5 bg-black/70 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                            {JSON.stringify(certExtraction, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Representative Name */}
                  <div>
                    <label htmlFor="rec-reg-rep-name" className="block text-xs font-bold text-slate-800 mb-1">
                      {at.repNameLabel} <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="rec-reg-rep-name"
                      type="text"
                      required
                      value={recRepName}
                      onChange={(e) => setRecRepName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Entity Name */}
                  <div>
                    <label htmlFor="rec-reg-entity-name" className="block text-xs font-bold text-slate-800 mb-1">
                      {at.entityNameLabel} <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="rec-reg-entity-name"
                      type="text"
                      required
                      value={recEntityName}
                      onChange={(e) => setRecEntityName(e.target.value)}
                      placeholder="e.g. EcoRecycle Solutions Pvt Ltd"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location of Entity */}
                  <div>
                    <label htmlFor="rec-reg-location" className="block text-xs font-bold text-slate-800 mb-1">
                      {at.entityLocationLabel} <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="rec-reg-location"
                      type="text"
                      required
                      value={recLocation}
                      onChange={(e) => setRecLocation(e.target.value)}
                      placeholder="e.g. Plot 42, Peenya 2nd Phase, Bengaluru, Karnataka"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* CPCB Certificate Number Verification */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="rec-reg-cpcb" className="block text-xs font-bold text-slate-800">
                        {at.cpcbNumberLabel} <span className="text-blue-600">*</span>
                      </label>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-700" />
                        {at.cpcbVerifiedBadge}
                      </span>
                    </div>
                    <input
                      id="rec-reg-cpcb"
                      type="text"
                      required
                      value={recCpcbNumber}
                      onChange={(e) => setRecCpcbNumber(e.target.value)}
                      placeholder="e.g. CPCB/EW/KAR/2026/7742"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  {/* Username & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                    <div>
                      <label htmlFor="rec-reg-username" className="block text-xs font-bold text-slate-800 mb-1">
                        {at.usernameLabel} <span className="text-blue-600">*</span>
                      </label>
                      <input
                        id="rec-reg-username"
                        type="text"
                        required
                        value={recUsername}
                        onChange={(e) => setRecUsername(e.target.value)}
                        placeholder="e.g. ecorecycle"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="rec-reg-password" className="block text-xs font-bold text-slate-800 mb-1">
                        {at.passwordLabel} <span className="text-blue-600">*</span>
                      </label>
                      <input
                        id="rec-reg-password"
                        type="password"
                        required
                        value={recPassword}
                        onChange={(e) => setRecPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="rec-register-submit-btn"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <span>{at.loadingText}</span>
                    ) : (
                      <>
                        <span>{at.recyclerRegisterBtn}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================
              ROLE 3: CENTRAL ADMIN
              Requirements: Name, Mobile Number, and Password repeatedly asked on every login
              Strictly isolated: Dedicated regulatory login portal with master dual control.
             =================================================================== */}
          {activePortal === 'admin' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold mb-0.5 text-emerald-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{at.adminHeader}</span>
                </div>
                <p className="text-slate-300 text-xs mt-0.5">
                  {at.adminNotice}
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                
                {/* 1. Admin Officer Full Name */}
                <div>
                  <label htmlFor="admin-name-input" className="block text-sm font-bold text-slate-800 mb-1">
                    {at.adminNameLabel} <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="admin-name-input"
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Dr. Ananya Sharma"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* 2. Official Mobile Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="admin-phone-input" className="block text-sm font-bold text-slate-800">
                      {at.adminPhoneLabel} <span className="text-rose-600">*</span>
                    </label>
                    <span className={`text-xs font-semibold ${adminPhone.replace(/\D/g, '').length === 10 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {adminPhone.replace(/\D/g, '').length}/10 digits
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center px-3.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 shrink-0 select-none">
                      +91
                    </div>
                    <input
                      id="admin-phone-input"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98450 99887"
                      className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-base font-bold text-slate-800 tracking-wider focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* 3. Admin Password */}
                <div>
                  <label htmlFor="admin-password-input" className="block text-sm font-bold text-slate-800 mb-1">
                    {at.adminPasswordLabel} <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="admin-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter authorized regulatory access password"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Forgot Password Link & Quick Credential Hint */}
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>Default password:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminPassword('admin123');
                          if (!adminName.trim()) setAdminName('Dr. Ananya Sharma');
                          if (!adminPhone.trim()) setAdminPhone('1122307000');
                        }}
                        className="font-mono font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-1.5 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                        title="Click to auto-fill default password"
                      >
                        admin123
                      </button>
                    </span>
                    <button
                      type="button"
                      id="admin-forgot-password-btn"
                      onClick={() => {
                        setShowAdminForgotModal(true);
                        setAdminResetPhone(adminPhone || '1122307000');
                        setAdminResetError(null);
                        setAdminResetSuccess(null);
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Forgot Password?</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="admin-submit-btn"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <span>{at.loadingText}</span>
                  ) : (
                    <>
                      <span>{at.adminSubmitBtn}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

            {/* Persistence Guarantee Notice & Back to Gateway */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => handleSelectPortal('chooser')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{at.backToGatewayBtn}</span>
              </button>
              <span>🔒 <strong>{at.persistenceNotice}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Recovery & Reset Modal */}
      {showAdminForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                    Admin Password Recovery
                  </h3>
                  <p className="text-xs text-amber-200/90 font-medium">
                    Central CPCB Regulatory Authority Desk
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminForgotModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tab Selector: 1-Tap Reveal vs Mobile OTP Reset */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAdminRecoveryMode('instant');
                    setAdminResetError(null);
                    setAdminResetSuccess(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adminRecoveryMode === 'instant'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Instant Default Access
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminRecoveryMode('otp_reset');
                    setAdminResetError(null);
                    setAdminResetSuccess(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adminRecoveryMode === 'otp_reset'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📱 Reset via Mobile OTP
                </button>
              </div>

              {adminRecoveryMode === 'instant' ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Statutory Master Credentials</span>
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      For CPCB regulatory oversight, the platform has a pre-configured authorized master password. If you forgot the password, you can populate it immediately with 1 tap.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Designated Officer:</span>
                      <span className="font-bold text-slate-800">Dr. Ananya Sharma</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Official Mobile:</span>
                      <span className="font-mono font-bold text-slate-800">+91 11 2230 7000 / 98450 99887</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Default Password:</span>
                      <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                        admin123
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickRestoreDefaultAdminPassword}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Auto-Fill "admin123" & Login Now</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdminResetPasswordSubmit} className="space-y-3.5">
                  {adminResetError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{adminResetError}</span>
                    </div>
                  )}

                  {adminResetSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>{adminResetSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Official Registered Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 select-none">
                        +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={adminResetPhone}
                        onChange={(e) => setAdminResetPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98450 99887"
                        className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <button
                        type="button"
                        disabled={adminResetLoading}
                        onClick={handleSendAdminResetOtp}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
                      >
                        {adminResetOtpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {adminResetOtpSent && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                      <span>📱 Simulated SMS OTP: <strong className="font-mono text-sm">{adminResetOtpSimulated}</strong></span>
                      <button
                        type="button"
                        onClick={() => setAdminResetOtp(adminResetOtpSimulated)}
                        className="text-[11px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded hover:bg-amber-300 cursor-pointer"
                      >
                        1-Tap Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={adminResetOtp}
                      onChange={(e) => setAdminResetOtp(e.target.value.trim())}
                      placeholder="Enter 6-digit code (e.g. 749201)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        New Admin Password
                      </label>
                      <input
                        type="password"
                        required
                        value={adminNewPassword}
                        onChange={(e) => setAdminNewPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={adminConfirmPassword}
                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminResetLoading}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all mt-2 active:scale-98"
                  >
                    {adminResetLoading ? (
                      <span>Updating password...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Save New Password & Continue</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST-OTP PROFILE & SALES FREQUENCY VERIFICATION MODAL */}
      {pendingOtpUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 sm:p-8 space-y-6 relative overflow-hidden my-auto max-h-[95vh] overflow-y-auto">
            {/* Header Badge & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{at.verifyOtpVerifiedBadge}: +91 {(pendingOtpUser.phone || '').replace(/\D/g, '').slice(-10) || '9845012345'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {at.verifyFrequencyTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                {at.verifyFrequencySubtitle}
              </p>
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Two Question Options: Regular Scraps Sales vs Periodical Scraps Sales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Option 1: Regular Scrap Sales (Scrap Collector / Kabadiwala) */}
              <div
                id="select-regular-scraps-card"
                onClick={() => !isUpdatingRole && handleSelectSalesFrequency('regular')}
                className="group relative bg-white hover:bg-emerald-50/50 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white text-emerald-800 flex items-center justify-center transition-colors shadow-xs">
                      <Truck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Scrapper App
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                      <span>{at.regularOptionTitle}</span>
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                      {at.regularOptionSubtitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {at.regularOptionDesc}
                  </p>

                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Daily commercial collection & aggregation yard</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Hardware scale camera lock & fair MSP rates</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Sell bulk lots into circular recycling grid</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="confirm-regular-scrapper-btn"
                  disabled={isUpdatingRole}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSalesFrequency('regular');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingRole ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>{at.regularOptionBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Periodical Scrap Sales (Household Resident) */}
              <div
                id="select-periodical-household-card"
                onClick={() => !isUpdatingRole && handleSelectSalesFrequency('periodical')}
                className="group relative bg-white hover:bg-blue-50/50 rounded-2xl border-2 border-slate-200 hover:border-blue-500 p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-800 flex items-center justify-center transition-colors shadow-xs">
                      <Home className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Household Portal
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 flex items-center gap-1.5">
                      <span>{at.periodicalOptionTitle}</span>
                    </h3>
                    <span className="text-xs font-semibold text-blue-700 block mt-0.5">
                      {at.periodicalOptionSubtitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {at.periodicalOptionDesc}
                  </p>

                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Book doorstep pickup with neighborhood scrapper</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Contact & chat with nearby verified Kabadiwalas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Scrap is collected & sold by scrapper into circular stream</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Direct scrapper linkages • Zero recycler clutter</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="confirm-periodical-household-btn"
                  disabled={isUpdatingRole}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSalesFrequency('periodical');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingRole ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>{at.periodicalOptionBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Persistence & Role Isolation Note */}
            <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-100">
              {at.persistenceNotice}
            </p>
          </div>
        </div>
      )}

      {/* Android Installation Modal */}
      <AndroidAppModal isOpen={isAndroidModalOpen} onClose={() => setIsAndroidModalOpen(false)} />
    </div>
  );
};
