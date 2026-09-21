import React, { useState } from 'react';
import { User, UserRole, VernacularLang } from '../types';
import { api } from '../api/client';
import {
  ShieldCheck, Smartphone, Lock, AlertCircle, ArrowRight, CheckCircle2,
  Building2, ShieldAlert, KeyRound, RefreshCw, Sparkles, Check, Globe
} from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
  lang?: VernacularLang;
  onLangChange?: (lang: VernacularLang) => void;
}

const AUTH_TEXTS: Record<VernacularLang, {
  title: string;
  tagline: string;
  subtagline: string;
  otpTab: string;
  passwordTab: string;
  instantDemos: string;
  preverified: string;
  scrapperRole: string;
  recyclerRole: string;
  adminRole: string;
  enterMobile: string;
  sendOtp: string;
  resendOtp: string;
  mobileSubtext: string;
  smsReceived: string;
  yourOtpIs: string;
  autoFill: string;
  enterOtp: string;
  otpExpiry: string;
  verifying: string;
  verifyAndEnter: string;
  phoneVerified: string;
  completeProfileSubtext: string;
  fullName: string;
  operationalYard: string;
  aadhaarLast4: string;
  aadhaarVerified: string;
  back: string;
  completeRegBtn: string;
  signInTab: string;
  registerTab: string;
  roleAuthority: string;
  scrapperOption: string;
  recyclerOption: string;
  adminOption: string;
  usernameLabel: string;
  passwordLabel: string;
  fullLegalName: string;
  cpcbNumberLabel: string;
  authenticating: string;
  registerAndEnter: string;
  signInToWorkspace: string;
  persistenceNotice: string;
  logoutNotice: string;
}> = {
  en: {
    title: 'Kabadiwala Connect',
    tagline: 'National E-Waste Circular Traceability & Formalization Grid',
    subtagline: 'Empowering Informal Scrap Collectors with Transparent Pricing & Certified Recycler Linkages',
    otpTab: 'Mobile OTP Login (Kabadiwala)',
    passwordTab: 'Password Login (Recycler / Admin)',
    instantDemos: 'Instant 1-Click Demo Accounts',
    preverified: 'Pre-verified',
    scrapperRole: 'Scrapper (Kabadiwala)',
    recyclerRole: 'Authorized Recycler',
    adminRole: 'Central Admin',
    enterMobile: 'Enter 10-Digit Mobile Number',
    sendOtp: 'Send OTP',
    resendOtp: 'Resend OTP',
    mobileSubtext: 'Standard SMS verification for informal collectors, waste aggregators, and kabadiwalas.',
    smsReceived: 'SMS received on +91',
    yourOtpIs: 'Your verification OTP is:',
    autoFill: 'Click to Auto-fill',
    enterOtp: 'Enter 6-Digit Verification Code',
    otpExpiry: 'Code expires in 10 minutes. Enter the code sent to your phone.',
    verifying: 'Verifying Security Token...',
    verifyAndEnter: 'Verify OTP & Enter Scrapper Portal',
    phoneVerified: 'Phone Verified!',
    completeProfileSubtext: 'Please enter your collector details to complete your CPCB authorized profile.',
    fullName: 'Full Legal Name',
    operationalYard: 'Primary Yard / Collection Hub Location',
    aadhaarLast4: 'Aadhaar Number (Last 4 Digits)',
    aadhaarVerified: 'Aadhaar e-KYC Verified',
    back: 'Back',
    completeRegBtn: 'Complete Registration & Enter Grid',
    signInTab: 'Sign In with Password',
    registerTab: 'Register Entity Account',
    roleAuthority: 'Designated Role Authority',
    scrapperOption: 'Scrapper / Collector (Field Collection)',
    recyclerOption: 'Recycler / Aggregator (Authorized Facility)',
    adminOption: 'Admin / Auditor (Regulatory Compliance)',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    fullLegalName: 'Full Legal Name / Entity Name',
    cpcbNumberLabel: 'CPCB / SPCB Authorization Number',
    authenticating: 'Authenticating...',
    registerAndEnter: 'Register & Enter Workspace',
    signInToWorkspace: 'Sign In to Workspace',
    persistenceNotice: 'Persistent Login Guarantee: You will remain securely logged into this session across reloads.',
    logoutNotice: 'Logout'
  },
  hi: {
    title: 'कबाड़ीवाला कनेक्ट',
    tagline: 'राष्ट्रीय ई-अपशिष्ट चक्रीय ट्रैसेबिलिटी एवं औपचारिकीकरण ग्रिड',
    subtagline: 'अनौपचारिक कचरा बीनने वालों को पारदर्शी मूल्य निर्धारण व प्रमाणित रिसाइकलरों से जोड़ना',
    otpTab: 'मोबाइल OTP लॉगिन (कबाड़ीवाला)',
    passwordTab: 'पासवर्ड लॉगिन (रिसाइकलर / प्रशासक)',
    instantDemos: 'त्वरित 1-क्लिक डेमो खाते',
    preverified: 'पूर्व-सत्यापित',
    scrapperRole: 'कबाड़ीवाला (संग्रहकर्ता)',
    recyclerRole: 'प्रमाणित रिसाइकलर',
    adminRole: 'केंद्रीय CPCB प्रशासक',
    enterMobile: '10 अंकों का मोबाइल नंबर दर्ज करें',
    sendOtp: 'OTP भेजें',
    resendOtp: 'OTP पुनः भेजें',
    mobileSubtext: 'कचरा बीनने वालों और कबाड़ीवालों के लिए मानक SMS सत्यापन।',
    smsReceived: 'SMS प्राप्त हुआ +91',
    yourOtpIs: 'आपका सत्यापन OTP है:',
    autoFill: 'स्वतः भरें',
    enterOtp: '6 अंकों का सत्यापन कोड दर्ज करें',
    otpExpiry: 'कोड 10 मिनट में समाप्त होता है। अपने फोन पर भेजा गया कोड दर्ज करें।',
    verifying: 'सुरक्षा टोकन सत्यापित किया जा रहा है...',
    verifyAndEnter: 'OTP सत्यापित करें और कबाड़ीवाला पोर्टल में प्रवेश करें',
    phoneVerified: 'फोन नंबर सत्यापित हुआ!',
    completeProfileSubtext: 'CPCB अधिकृत प्रोफाइल पूर्ण करने के लिए अपना विवरण दर्ज करें।',
    fullName: 'पूरा कानूनी नाम',
    operationalYard: 'प्राथमिक यार्ड / संग्रह केंद्र का पता',
    aadhaarLast4: 'आधार संख्या (अंतिम 4 अंक)',
    aadhaarVerified: 'आधार e-KYC सत्यापित',
    back: 'वापस',
    completeRegBtn: 'पंजीकरण पूर्ण करें और पोर्टल में प्रवेश करें',
    signInTab: 'पासवर्ड से साइन इन करें',
    registerTab: 'नई इकाई का पंजीकरण करें',
    roleAuthority: 'नामित भूमिका प्राधिकार',
    scrapperOption: 'कबाड़ीवाला / कचरा बीनने वाला (फील्ड संग्रह)',
    recyclerOption: 'रिसाइकलर / एग्रीगेटर (अधिकृत प्लांट)',
    adminOption: 'प्रशासक / लेखा परीक्षक (नियामक अनुपालन)',
    usernameLabel: 'उपयोगकर्ता नाम',
    passwordLabel: 'पासवर्ड',
    fullLegalName: 'पूरा कानूनी नाम / संस्था का नाम',
    cpcbNumberLabel: 'CPCB / SPCB प्राधिकरण संख्या',
    authenticating: 'प्रमाणीकरण हो रहा है...',
    registerAndEnter: 'पंजीकरण करें और प्रवेश करें',
    signInToWorkspace: 'कार्यक्षेत्र में साइन इन करें',
    persistenceNotice: 'सुरक्षित सत्र गारंटी: पेज रीलोड के बाद भी आपका लॉगिन सुरक्षित बना रहेगा।',
    logoutNotice: 'लॉगआउट'
  },
  mr: {
    title: 'कबाडीवाला कनेक्ट',
    tagline: 'राष्ट्रीय ई-कचरा चक्रीय ट्रॅसेबिलिटी आणि औपचारिकीकरण ग्रिड',
    subtagline: 'कचरा संकलकांना पारदर्शक खरेदी दर आणि अधिकृत रिसायकलर्सशी थेट जोडणे',
    otpTab: 'मोबाईल OTP लॉगिन (कबाडीवाला)',
    passwordTab: 'पासवर्ड लॉगिन (रिसायकलर / ॲडमिन)',
    instantDemos: 'त्वरित १-क्लिक डेमो खाती',
    preverified: 'पूर्व-सत्यापित',
    scrapperRole: 'स्क्रॅपर (कबाडीवाला)',
    recyclerRole: 'अधिकृत रिसायकलर',
    adminRole: 'केंद्रीय CPCB ॲडमिन',
    enterMobile: '१० अंकी मोबाईल क्रमांक प्रविष्ट करा',
    sendOtp: 'OTP पाठवा',
    resendOtp: 'OTP पुन्हा पाठवा',
    mobileSubtext: 'कचरा संकलक आणि कबाडीवाल्यांसाठी सुरक्षित SMS पडताळणी.',
    smsReceived: 'SMS प्राप्त झाला +91',
    yourOtpIs: 'तुमचा पडताळणी OTP आहे:',
    autoFill: 'स्वतः भरा',
    enterOtp: '६ अंकी पडताळणी कोड प्रविष्ट करा',
    otpExpiry: 'कोड १० मिनिटांत कालबाह्य होईल. फोनवर आलेला कोड प्रविष्ट करा.',
    verifying: 'सुरक्षा टोकन पडताळत आहे...',
    verifyAndEnter: 'OTP तपासा आणि पोर्टलमध्ये प्रवेश करा',
    phoneVerified: 'फोन नंबर सत्यापित झाला!',
    completeProfileSubtext: 'CPCB अधिकृत प्रोफाइल पूर्ण करण्यासाठी आपले तपशील प्रविष्ट करा.',
    fullName: 'पूर्ण कायदेशीर नाव',
    operationalYard: 'प्राथमिक यार्ड / संकलन केंद्र पत्ता',
    aadhaarLast4: 'आधार क्रमांक (शेवटचे ४ अंक)',
    aadhaarVerified: 'आधार e-KYC सत्यापित',
    back: 'मागे',
    completeRegBtn: 'नोंदणी पूर्ण करा आणि ग्रिडमध्ये प्रवेश करा',
    signInTab: 'पासवर्डने साइन इन करा',
    registerTab: 'नवीन युनिट खाते नोंदणी',
    roleAuthority: 'नियुक्त भूमिका अधिकार',
    scrapperOption: 'स्क्रॅपर / संकलक (फील्ड संकलन)',
    recyclerOption: 'रिसायकलर / ॲग्रिगेटर (अधिकृत प्लांट)',
    adminOption: 'ॲडमिन / ऑडिटर (नियामक अनुपालन)',
    usernameLabel: 'वापरकर्तानाव',
    passwordLabel: 'पासवर्ड',
    fullLegalName: 'पूर्ण कायदेशीर नाव / कंपनीचे नाव',
    cpcbNumberLabel: 'CPCB / SPCB प्राधिकरण क्रमांक',
    authenticating: 'प्रमाणीकरण करत आहे...',
    registerAndEnter: 'नोंदणी करा आणि प्रवेश करा',
    signInToWorkspace: 'कार्यक्षेत्रात साइन इन करा',
    persistenceNotice: 'सुरक्षित लॉगिन हमी: रीलोडनंतरही तुमचे लॉगिन सुरक्षित राहील.',
    logoutNotice: 'लॉगआउट'
  },
  ta: {
    title: 'கபாடிவாலா கனெக்ட்',
    tagline: 'தேசிய மின்-கழிவு மறுசுழற்சி தடமறிதல் மற்றும் முறைப்படுத்தல் வலைப்பின்னல்',
    subtagline: 'முறையற்ற கழிவு சேகரிப்பாளர்களுக்கு வெளிப்படையான விலை மற்றும் சான்றளிக்கப்பட்ட மறுசுழற்சி இணைப்பு',
    otpTab: 'மொபைல் OTP உள்நுழைவு (கபாடிவாலா)',
    passwordTab: 'கடவுச்சொல் உள்நுழைவு (மறுசுழற்சியாளர் / நிர்வாகி)',
    instantDemos: 'உடனடி 1-கிளிக் மாதிரி கணக்குகள்',
    preverified: 'சரிபார்க்கப்பட்டது',
    scrapperRole: 'கழிவு சேகரிப்பாளர் (கபாடிவாலா)',
    recyclerRole: 'அங்கீகரிக்கப்பட்ட மறுசுழற்சி ஆலை',
    adminRole: 'மத்திய CPCB நிர்வாகி',
    enterMobile: '10-இலக்க கைபேசி எண்ணை உள்ளிடவும்',
    sendOtp: 'OTP அனுப்பு',
    resendOtp: 'மீண்டும் OTP அனுப்பு',
    mobileSubtext: 'கழிவு சேகரிப்பாளர்கள் மற்றும் கபாடிவாலாக்களுக்கான எளிய SMS சரிபார்ப்பு.',
    smsReceived: 'SMS பெறப்பட்டது +91',
    yourOtpIs: 'உங்கள் சரிபார்ப்பு OTP:',
    autoFill: 'தானாக நிரப்பு',
    enterOtp: '6-இலக்க சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்',
    otpExpiry: 'குறியீடு 10 நிமிடங்களில் காலாவதியாகும். கைபேசிக்கு வந்த குறியீட்டை உள்ளிடவும்.',
    verifying: 'பாதுகாப்பு குறியீடு சரிபார்க்கப்படுகிறது...',
    verifyAndEnter: 'OTP சரிபார்த்து போர்ட்டலுக்குள் நுழையவும்',
    phoneVerified: 'கைபேசி எண் சரிபார்க்கப்பட்டது!',
    completeProfileSubtext: 'CPCB அங்கீகரிக்கப்பட்ட சுயவிவரத்தை முடிக்க விவரங்களை உள்ளிடவும்.',
    fullName: 'முழு சட்டபூர்வ பெயர்',
    operationalYard: 'முக்கிய சேகரிப்பு முனையம் / முகவரி',
    aadhaarLast4: 'ஆதார் எண் (கடைசி 4 இலக்கங்கள்)',
    aadhaarVerified: 'ஆதார் e-KYC சரிபார்க்கப்பட்டது',
    back: 'பின்செல்',
    completeRegBtn: 'பதிவை முடித்து வலைப்பின்னலில் இணையவும்',
    signInTab: 'கடவுச்சொல் மூலம் உள்நுழையவும்',
    registerTab: 'புதிய ஆலை கணக்கை பதிவு செய்யவும்',
    roleAuthority: 'நியமிக்கப்பட்ட பங்கு அதிகாரம்',
    scrapperOption: 'சேகரிப்பாளர் (களச் சேகரிப்பு)',
    recyclerOption: 'மறுசுழற்சியாளர் (அங்கீகரிக்கப்பட்ட ஆலை)',
    adminOption: 'நிர்வாகி / தணிக்கையாளர் (ஒழுங்குமுறை இணக்கம்)',
    usernameLabel: 'பயனர் பெயர்',
    passwordLabel: 'கடவுச்சொல்',
    fullLegalName: 'முழு சட்டபூர்வ பெயர் / நிறுவனத்தின் பெயர்',
    cpcbNumberLabel: 'CPCB / SPCB அங்கீகார எண்',
    authenticating: 'உள்நுழைகிறது...',
    registerAndEnter: 'பதிவு செய்து உள்நுழையவும்',
    signInToWorkspace: 'பணியிடத்தில் உள்நுழையவும்',
    persistenceNotice: 'பாதுகாப்பான உள்நுழைவு உத்தரவாதம்: மறுஏற்றத்திற்குப் பிறகும் உங்கள் உள்நுழைவு நீடிக்கும்.',
    logoutNotice: 'வெளியேறு'
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, lang = 'en', onLangChange }) => {
  const at = AUTH_TEXTS[lang] || AUTH_TEXTS.en;
  // Primary auth mode: 'otp' for mobile scrappers, 'password' for recyclers/admins
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  // Mobile OTP State
  const [mobilePhone, setMobilePhone] = useState('9845012345');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedSms, setSimulatedSms] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [regName, setRegName] = useState('');
  const [regLocation, setRegLocation] = useState('Peenya Industrial Area, Bengaluru, Karnataka');
  const [regAadhaar, setRegAadhaar] = useState('8821');

  // Password Login State
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('ramesh');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('scrapper');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Peenya Industrial Area, Bengaluru');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [cpcbNumber, setCpcbNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Quick select pre-seeded demo user
  const handleSelectQuickSeed = (u: string, p: string, r: UserRole, phoneNum?: string) => {
    setUsername(u);
    setPassword(p);
    setRole(r);
    setError(null);
    if (phoneNum) {
      setMobilePhone(phoneNum);
    }
  };

  // Mobile OTP Send Handler
  const handleSendOtp = async () => {
    setError(null);
    setSuccessInfo(null);
    setIsOtpLoading(true);

    try {
      const res = await api.sendOtp(mobilePhone);
      setOtpSent(true);
      setSimulatedSms(res.otp);
      setOtpCode(res.otp); // Pre-fill for instantaneous testing
      setSuccessInfo(res.user_exists
        ? `Welcome back ${res.existing_user_name || ''}! OTP sent to +91 ${res.phone}.`
        : `New collector detected. Verification OTP sent to +91 ${res.phone}.`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Mobile OTP Verify Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setError(null);
    setIsOtpLoading(true);

    try {
      const res = await api.verifyOtp(mobilePhone, otpCode, 'scrapper');
      if (res.user_exists && res.user) {
        // User exists, login directly!
        onLoginSuccess(res.user);
      } else {
        // User needs registration
        setRequiresRegistration(true);
        setSuccessInfo('Mobile verified successfully! Please complete your collector registration.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please check and re-enter.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Mobile User Complete Registration
  const handleCompleteMobileRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Please enter your full legal name');
      return;
    }

    setError(null);
    setIsOtpLoading(true);

    try {
      const res = await api.registerMobile({
        phone: mobilePhone,
        name: regName.trim(),
        location: regLocation.trim(),
        aadhaar_last4: regAadhaar.trim() || '8821'
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Password Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ username, password, role });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Password Register Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.register({
        username,
        password,
        name: name || username,
        role,
        location,
        phone,
        aadhaar_last4: '8821',
        cpcb_number: cpcbNumber,
        verified: true
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden text-slate-900 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 text-center px-4">
        {/* Language Switcher Bar on Login Page */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <div className="bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
            {(['en', 'hi', 'mr', 'ta'] as VernacularLang[]).map((l) => (
              <button
                key={l}
                type="button"
                id={`auth-lang-${l}`}
                onClick={() => onLangChange?.(l)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === l
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : l === 'mr' ? 'मराठी' : 'தமிழ்'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white text-2xl shadow-md border-2 border-white">
            KC
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          {at.title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base font-semibold text-emerald-800">
          {at.tagline}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-lg mx-auto">
          {at.subtagline}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-slate-200">
          
          {/* Top Primary Auth Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              type="button"
              id="auth-mode-otp"
              onClick={() => {
                setAuthMode('otp');
                setError(null);
                setSuccessInfo(null);
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'otp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{at.otpTab}</span>
            </button>
            <button
              type="button"
              id="auth-mode-password"
              onClick={() => {
                setAuthMode('password');
                setError(null);
                setSuccessInfo(null);
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>{at.passwordTab}</span>
            </button>
          </div>

          {/* Quick Demo Accounts Banner */}
          <div className="mb-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {at.instantDemos}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">{at.preverified}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                id="quick-scrapper-btn"
                onClick={() => {
                  if (authMode === 'otp') {
                    setMobilePhone('9845012345');
                    setOtpSent(true);
                    setOtpCode('749201');
                    setSimulatedSms('749201');
                    setRequiresRegistration(false);
                    setError(null);
                    setSuccessInfo('Autofilled Ramesh Kumar (Collector: 98450 12345).');
                  } else {
                    handleSelectQuickSeed('ramesh', 'password123', 'scrapper', '9845012345');
                  }
                }}
                className={`flex flex-col items-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                  mobilePhone === '9845012345' || (username === 'ramesh' && role === 'scrapper')
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-sm text-slate-900">Ramesh</span>
                <span className="text-xs text-emerald-700 font-semibold text-center">{at.scrapperRole}</span>
              </button>

              <button
                type="button"
                id="quick-recycler-btn"
                onClick={() => {
                  setAuthMode('password');
                  handleSelectQuickSeed('ecorecycle', 'password123', 'recycler');
                }}
                className={`flex flex-col items-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                  username === 'ecorecycle' && role === 'recycler'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-sm text-slate-900">EcoRecycle</span>
                <span className="text-xs text-blue-700 font-semibold text-center">{at.recyclerRole}</span>
              </button>

              <button
                type="button"
                id="quick-admin-btn"
                onClick={() => {
                  setAuthMode('password');
                  handleSelectQuickSeed('admin', 'admin123', 'admin');
                }}
                className={`flex flex-col items-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                  username === 'admin' && role === 'admin'
                    ? 'bg-slate-900 border-slate-900 text-white ring-2 ring-slate-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-sm text-slate-900">Dr. Ananya</span>
                <span className="text-xs text-purple-700 font-semibold text-center">{at.adminRole}</span>
              </button>
            </div>
          </div>

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

          {/* MODE 1: MOBILE OTP AUTHENTICATION */}
          {authMode === 'otp' && (
            <div className="space-y-5">
              {!requiresRegistration ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      {at.enterMobile} <span className="text-emerald-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-700">
                        +91
                      </div>
                      <input
                        id="mobile-phone-input"
                        type="tel"
                        maxLength={10}
                        required
                        value={mobilePhone}
                        onChange={(e) => {
                          const clean = (e.target.value || '').replace(/\D/g, '');
                          setMobilePhone(clean);
                          setOtpSent(false);
                          setSimulatedSms(null);
                        }}
                        placeholder="98450 12345"
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        id="send-otp-btn"
                        onClick={handleSendOtp}
                        disabled={isOtpLoading || mobilePhone.length < 10}
                        className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isOtpLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Smartphone className="w-4 h-4" />
                        )}
                        <span>{otpSent ? at.resendOtp : at.sendOtp}</span>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {at.mobileSubtext}
                    </p>
                  </div>

                  {/* Simulated SMS Notification Banner */}
                  {simulatedSms && (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📩</span>
                        <div>
                          <p className="text-xs font-bold text-amber-900">
                            {at.smsReceived} {mobilePhone}:
                          </p>
                          <p className="text-sm font-extrabold text-amber-950 font-mono">
                            {at.yourOtpIs} <span className="bg-amber-200 px-2 py-0.5 rounded text-amber-900">{simulatedSms}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(simulatedSms)}
                        className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {at.autoFill}
                      </button>
                    </div>
                  )}

                  {/* 6-Digit OTP Field */}
                  {otpSent && (
                    <div className="space-y-2 pt-2 animate-in fade-in">
                      <label className="block text-sm font-bold text-slate-800">
                        {at.enterOtp} <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        id="otp-code-input"
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode((e.target.value || '').replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full bg-slate-50 border-2 border-emerald-400 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-emerald-800 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <p className="text-xs text-slate-500 text-center">
                        {at.otpExpiry}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    id="verify-otp-btn"
                    disabled={isOtpLoading || otpCode.length < 6}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isOtpLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{at.verifying}</span>
                      </>
                    ) : (
                      <>
                        <span>{at.verifyAndEnter}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Registration Screen for New Mobile Number */
                <form onSubmit={handleCompleteMobileRegistration} className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {at.phoneVerified} (+91 {mobilePhone})
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {at.completeProfileSubtext}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      {at.fullName} <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      {at.operationalYard}
                    </label>
                    <input
                      type="text"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      {at.aadhaarLast4}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-sm tracking-widest">XXXX-XXXX-</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={regAadhaar}
                        onChange={(e) => setRegAadhaar((e.target.value || '').replace(/\D/g, ''))}
                        className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {at.aadhaarVerified}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRequiresRegistration(false)}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                    >
                      {at.back}
                    </button>
                    <button
                      type="submit"
                      disabled={isOtpLoading}
                      className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isOtpLoading ? at.authenticating : at.completeRegBtn}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: PASSWORD AUTHENTICATION (RECYCLERS & ADMINS) */}
          {authMode === 'password' && (
            <div>
              {/* Tab: Sign In vs Register */}
              <div className="flex rounded-xl bg-slate-100 p-0.5 mb-5 border border-slate-200">
                <button
                  type="button"
                  id="tab-login"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    !isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {at.signInTab}
                </button>
                <button
                  type="button"
                  id="tab-register"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {at.registerTab}
                </button>
              </div>

              <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
                {/* Role Selection Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {at.roleAuthority} <span className="text-emerald-600">*</span>
                  </label>
                  <select
                    id="auth-role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="scrapper">{at.scrapperOption}</option>
                    <option value="recycler">{at.recyclerOption}</option>
                    <option value="admin">{at.adminOption}</option>
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {at.usernameLabel} <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    id="auth-username-input"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ramesh, ecorecycle, or admin"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {at.passwordLabel} <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Extra fields if register */}
                {isRegister && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1">
                        {at.fullLegalName}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={role === 'recycler' ? 'e.g. EcoRecycle Solutions Pvt Ltd' : 'e.g. Ramesh Kumar'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {role === 'recycler' && (
                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">
                          {at.cpcbNumberLabel}
                        </label>
                        <input
                          type="text"
                          value={cpcbNumber}
                          onChange={(e) => setCpcbNumber(e.target.value)}
                          placeholder="e.g. CPCB/EW/2026/7742"
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  id="auth-submit-btn"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>{at.authenticating}</span>
                  ) : (
                    <>
                      <span>{isRegister ? at.registerAndEnter : at.signInToWorkspace}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Persistence Guarantee Notice */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
            🔒 <strong>{at.persistenceNotice}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
