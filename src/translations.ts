import { VernacularLang } from './types';

export interface ModuleTabTranslation {
  label: string;
  title: string;
  desc: string;
}

export interface TranslationSet {
  // Brand & Nav
  appName: string;
  appTagline: string;
  operationsMenuBar: string;
  activeWorkflowModule: string;
  showMenuBar: string;
  collapseMenuBar: string;
  scrollToTopMenu: string;
  roleScrapperLabel: string;
  roleRecyclerLabel: string;
  roleAdminLabel: string;
  scrapperPortal: string;
  recyclerPortal: string;
  adminPortal: string;
  scrapperPortalDesc: string;
  recyclerPortalDesc: string;
  adminPortalDesc: string;
  liveStatus: string;
  logout: string;
  refreshGps: string;
  gpsActive: string;
  offlineQueueActive: string;
  activeLots: string;
  totalPayout: string;
  cpcbCompliant: string;
  grievanceDesk: string;
  directChat: string;

  // Filters & Actions
  allCategories: string;
  searchPlaceholder: string;
  statusAll: string;
  statusBroadcasted: string;
  statusAccepted: string;
  statusWeightConfirmed: string;
  statusCompleted: string;
  statusCancelled: string;
  tableView: string;
  mapView: string;
  bothView: string;
  acceptLot: string;
  inspectWeigh: string;
  call: string;
  chat: string;
  downloadVoucher: string;
  downloadEpr: string;
  scaleVerification: string;
  actualWeight: string;
  declaredWeight: string;
  requiredWeight: string;
  unrequiredWeight: string;
  contaminationDeduction: string;
  notes: string;
  paymentMode: string;
  confirmAndGenerate: string;
  cancel: string;
  saveChanges: string;
  buyingRates: string;
  facilityLatitude: string;
  facilityLongitude: string;
  serviceRadiusKm: string;
  doorstepPickup: string;
  selfVisitOnly: string;

  // Scrapper Module Tabs
  modSafety: ModuleTabTranslation;
  modCapture: ModuleTabTranslation;
  modMap: ModuleTabTranslation;
  modChat: ModuleTabTranslation;
  modLots: ModuleTabTranslation;
  modRates: ModuleTabTranslation;
  modScrapComplaints: ModuleTabTranslation;

  inwardLotsTitle: string;
  verifiedVolumeTitle: string;
  pendingWeighmentTitle: string;
  recycledVolumeTitle: string;
  capitalFlowTitle: string;
  verifiedEntitiesTitle: string;
  aiModelHealthTitle: string;
  systemHealthy: string;
  cpcbReportBtn: string;
  thLotRefId: string;
  thMaterialCategory: string;
  thEntityMatch: string;
  thCertifiedWeight: string;
  thSettlement: string;
  thStatus: string;
  thAuditVoucher: string;
  thNameAndIdentity: string;
  thRole: string;
  thLocation: string;
  thContact: string;
  thVerification: string;
  thActions: string;

  // Recycler Module Tabs
  modRecLots: ModuleTabTranslation;
  modRecRates: ModuleTabTranslation;
  modRecWeigh: ModuleTabTranslation;
  modRecMap: ModuleTabTranslation;
  modRecChat: ModuleTabTranslation;
  modRecCompliance: ModuleTabTranslation;

  // Admin Module Tabs
  modAdmTx: ModuleTabTranslation;
  modAdmUsers: ModuleTabTranslation;
  modAdmRates: ModuleTabTranslation;
  modAdmComplaints: ModuleTabTranslation;
  modAdmLegal: ModuleTabTranslation;
  modAdmAudit: ModuleTabTranslation;

  // Existing Legacy Keys (Maintained for full backward compatibility)
  appTitle: string;
  appSubtitle: string;
  roleScrapper: string;
  verifiedBadge: string;
  createLot: string;
  lotSubheading: string;
  uploadPrompt: string;
  takePhoto: string;
  browseGallery: string;
  analyzingAI: string;
  aiDetected: string;
  confidence: string;
  manualCategoryFallback: string;
  weightInputLabel: string;
  weightInputPlaceholder: string;
  calculatePrice: string;
  estimatedPriceRange: string;
  perKgRate: string;
  minPrice: string;
  maxPrice: string;
  createLotButton: string;
  lotCreatedSuccess: string;
  findRecyclersTitle: string;
  findRecyclersSubheading: string;
  detectingLocation: string;
  useMyLocation: string;
  myLocation: string;
  distanceKm: string;
  offeredRate: string;
  pickupAvailable: string;
  cpcbAuthorized: string;
  chatAndNegotiate: string;
  directCall: string;
  safetyTitle: string;
  safetySubheading: string;
  playAudio: string;
  stopAudio: string;
  materials: Record<string, string>;
  safetyCards: {
    id: string;
    title: string;
    hazard: string;
    protocol: string;
    audioScript: string;
  }[];
  quickActions: {
    sendLotDetails: string;
    proposePrice: string;
    shareGps: string;
    requestPickup: string;
  };
}

export const translations: Record<VernacularLang, TranslationSet> = {
  en: {
    appName: "Kabadiwala Connect",
    appTagline: "E-Waste Circular Traceability & Formalization Grid",
    operationsMenuBar: "Operations Menu Bar",
    activeWorkflowModule: "Active Workflow Module",
    showMenuBar: "Show Menu Bar",
    collapseMenuBar: "Collapse Menu",
    scrollToTopMenu: "Go to Top Menu",
    roleScrapperLabel: "Scrapper Field Desk",
    roleRecyclerLabel: "Recycler Processing Plant",
    roleAdminLabel: "Central Regulatory Registry",
    scrapperPortal: "Kabadiwala Collector Android App",
    recyclerPortal: "Authorized Recycler Web Portal",
    adminPortal: "CPCB Regulatory Web Desk",
    scrapperPortalDesc: "Android mobile application with camera AI scale lock & direct connection with authorized recyclers",
    recyclerPortalDesc: "Cloud desktop web portal for CPCB authorized intake, weighment verification & EPR certificates",
    adminPortalDesc: "Statutory Web Portal • CPCB Regulatory Supervision • Traceable EPR Audit Ledger • Network Price Stabilization",
    liveStatus: "Live",
    logout: "Logout",
    refreshGps: "Refresh GPS",
    gpsActive: "GPS Active",
    offlineQueueActive: "Offline Queue Active",
    activeLots: "Active Lots",
    totalPayout: "Total Payout",
    cpcbCompliant: "CPCB EPR Compliance Active",
    grievanceDesk: "Grievance Desk",
    directChat: "Direct Chat",

    allCategories: "All Categories",
    searchPlaceholder: "Search lot ref ID, scrapper or material...",
    statusAll: "All Statuses",
    statusBroadcasted: "Broadcasted",
    statusAccepted: "Accepted",
    statusWeightConfirmed: "Weight Confirmed",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    tableView: "Table View",
    mapView: "Map View",
    bothView: "Both Views",
    acceptLot: "Accept Lot",
    inspectWeigh: "Inspect & Weigh",
    call: "Call Facility",
    chat: "Direct Chat",
    downloadVoucher: "Gate Pass / Receipt",
    downloadEpr: "CPCB EPR Certificate (PDF)",
    scaleVerification: "Scale Weighment Verification",
    actualWeight: "Actual Scale Weight (kg)",
    declaredWeight: "Declared Weight (kg)",
    requiredWeight: "Accepted Pure Weight (kg)",
    unrequiredWeight: "Rejected/Dross Weight (kg)",
    contaminationDeduction: "Contamination Deduction (₹)",
    notes: "Inspection Notes",
    paymentMode: "Payment Mode",
    confirmAndGenerate: "Confirm Weight & Generate Voucher",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    buyingRates: "Buying Rates (₹/kg)",
    facilityLatitude: "Facility Latitude (GPS)",
    facilityLongitude: "Facility Longitude (GPS)",
    serviceRadiusKm: "Service Radius (km)",
    doorstepPickup: "Doorstep Pickup Available",
    selfVisitOnly: "Self-Visit Only",

    modSafety: {
      label: "Safety Guidance",
      title: "1. Safety Guidance & Audio Warnings",
      desc: "Prevent toxic exposure with pictorial rules & voice alerts"
    },
    modCapture: {
      label: "Photo & Weighing",
      title: "2. Photo & AI Weight Calculation",
      desc: "Scan scrap image, automated category & fair price calculation"
    },
    modMap: {
      label: "Recycler Map",
      title: "3. Nearby Authorized Recyclers Map",
      desc: "Discover verified recyclers sorted by geographic proximity"
    },
    modChat: {
      label: "Direct Chat",
      title: "4. Direct Recycler Chat & Negotiation",
      desc: "Live messaging, offer rates & schedule doorstep pickup"
    },
    modLots: {
      label: "My Lots",
      title: "5. My Digital E-Waste Lots",
      desc: "Track broadcasted lots, confirm weight & download vouchers"
    },
    modRates: {
      label: "Market Rates",
      title: "6. Benchmark Market Rate Board",
      desc: "Official CPCB floor rates & transparent market pricing"
    },
    modScrapComplaints: {
      label: "Grievance Desk",
      title: "7. Statutory Grievance & Dispute Redressal",
      desc: "Formal CPCB / SPCB dispute filing, underweighting & legal protection"
    },

    inwardLotsTitle: "Total Inward Lots",
    verifiedVolumeTitle: "Verified Volume",
    pendingWeighmentTitle: "Pending Weighment",
    recycledVolumeTitle: "Recycled Volume",
    capitalFlowTitle: "Total Capital Flow",
    verifiedEntitiesTitle: "Verified Entities",
    aiModelHealthTitle: "AI Model Health",
    systemHealthy: "System Healthy",
    cpcbReportBtn: "CPCB Compliance Report (PDF)",
    thLotRefId: "Lot Ref ID",
    thMaterialCategory: "Material Category",
    thEntityMatch: "Entity Match",
    thCertifiedWeight: "Certified Weight",
    thSettlement: "Settlement",
    thStatus: "Status",
    thAuditVoucher: "Audit Voucher",
    thNameAndIdentity: "Name & Identity",
    thRole: "Role",
    thLocation: "Location",
    thContact: "Contact",
    thVerification: "Verification",
    thActions: "Actions",

    modRecLots: {
      label: "Scrap Lots",
      title: "1. Broadcasted Scrap Lots & Inward Stream",
      desc: "Discover live lots broadcasted by nearby verified scrappers"
    },
    modRecRates: {
      label: "Rate Configurator",
      title: "2. Buying Rates & Logistics Configurator",
      desc: "Set competitive per-kg rates and logistics service radius"
    },
    modRecWeigh: {
      label: "Weighment & Vouchers",
      title: "3. Certified Weighment & Handover Protocol",
      desc: "Scale verification, sorting breakdown & digital vouchers"
    },
    modRecMap: {
      label: "Logistics Map",
      title: "4. Logistics & Collection Radar Map",
      desc: "Geospatial view of lots, collection radius and routing"
    },
    modRecChat: {
      label: "Scrapper Chat",
      title: "5. Scrapper Communications Desk",
      desc: "Direct messaging with field scrappers and price negotiation"
    },
    modRecCompliance: {
      label: "EPR Compliance",
      title: "6. CPCB EPR Ledger & Grievances",
      desc: "Traceable recycling ledger and dispute resolution desk"
    },

    modAdmTx: {
      label: "Traceability Ledger",
      title: "1. Master Traceability Ledger",
      desc: "Complete transaction lifecycle and verifiable handover vouchers"
    },
    modAdmUsers: {
      label: "Registry & KYC",
      title: "2. User & Facility Registry",
      desc: "Verify scrappers, recyclers and inspect CPCB authorizations"
    },
    modAdmRates: {
      label: "Price Floor Board",
      title: "3. Price Floor & Benchmark Rates",
      desc: "Manage official benchmark floor rates and price stabilization"
    },
    modAdmComplaints: {
      label: "Grievance Desk",
      title: "4. Grievance & Dispute Redressal",
      desc: "Review reported infractions, impose penalties and arbitration"
    },
    modAdmLegal: {
      label: "Legal Enforcement",
      title: "5. Legal Enforcement & Penalties",
      desc: "Section 15 Environment Protection Act notices & prosecutions"
    },
    modAdmAudit: {
      label: "Audit & SQL Schema",
      title: "6. System Audit Logs & SQL DDL Schema",
      desc: "Immutable compliance audit trails & relational database schema"
    },

    appTitle: "Scrapper Portal",
    appSubtitle: "AI price discovery & direct connection with authorized recyclers",
    roleScrapper: "Verified Scrap Collector",
    verifiedBadge: "Aadhaar / CPCB Verified",
    createLot: "Create Digital Scrap Lot & AI Valuation",
    lotSubheading: "Upload or photograph e-waste for automated classification and fair price range",
    uploadPrompt: "Drop scrap image here, or click to capture",
    takePhoto: "Capture Camera / Upload Photo",
    browseGallery: "Select File",
    analyzingAI: "Scanning material with AI Computer Vision...",
    aiDetected: "AI Material Classification",
    confidence: "Model Confidence",
    manualCategoryFallback: "Or manually select category",
    weightInputLabel: "Total Weight (in kg)",
    weightInputPlaceholder: "Enter scrap weight (e.g. 15.5)",
    calculatePrice: "Compute Fair Price Range",
    estimatedPriceRange: "Estimated Total Payout Range",
    perKgRate: "Base Rate: ₹",
    minPrice: "Minimum Fair Payout",
    maxPrice: "Maximum Market Potential",
    createLotButton: "Create & Broadcast Digital Lot",
    lotCreatedSuccess: "Lot successfully generated! Discover nearby recyclers below.",
    findRecyclersTitle: "Nearby Authorized Recyclers",
    findRecyclersSubheading: "Sorted by geographic proximity via Haversine calculation",
    detectingLocation: "Acquiring GPS coordinates...",
    useMyLocation: "Refresh GPS Location",
    myLocation: "Your GPS Location",
    distanceKm: "km away",
    offeredRate: "Buying at: ₹",
    pickupAvailable: "Doorstep Pickup Available",
    cpcbAuthorized: "CPCB / SPCB Authorized",
    chatAndNegotiate: "Negotiate & Chat",
    directCall: "Call Facility",
    safetyTitle: "Critical E-Waste Health & Safety Guidance",
    safetySubheading: "Pictorial rules & vernacular voice safety warnings to prevent toxic poisoning",
    playAudio: "Listen Voice Warning",
    stopAudio: "Stop Voice Audio",
    materials: {
      "PCB (Printed Circuit Boards)": "PCB (Printed Circuit Boards)",
      "Copper Wires/Cables": "Copper Wires & Stripped Cables",
      "Lead/Li-ion Batteries": "Lead-Acid & Li-ion Batteries",
      "CRT Glass & Monitors": "CRT Glass & Cathode Monitors",
      "Electric Motors & Transformers": "Electric Motors & Transformers",
      "Mixed Rigid Plastics": "Mixed E-Waste Rigid Plastics"
    },
    safetyCards: [
      {
        id: "cable_burning",
        title: "No Open Cable Burning",
        hazard: "Burning PVC cables releases cancer-causing dioxins and destroys valuable copper quality.",
        protocol: "Always use manual mechanical stripping blades or sell unstripped cables directly to recyclers.",
        audioScript: "Warning! Never burn electric cables in the open air. Burning plastics produces deadly toxic smoke that causes cancer and destroys copper yield. Use stripping tools or sell intact."
      },
      {
        id: "acid_leaching",
        title: "Stop Acid Leaching for Gold",
        hazard: "Boiling motherboards in nitric or aqua regia acid causes severe lung burns, blindness, and water poisoning.",
        protocol: "Never dissolve chips in open drums. Authorized facilities process gold recovery in closed vacuum reactors.",
        audioScript: "Crucial health alert! Do not boil circuit boards in nitric acid. Toxic nitrous gas permanently damages human lungs and kidneys. Hand over boards intact to CPCB authorized facilities."
      },
      {
        id: "battery_hazard",
        title: "Battery Explosion & Toxic Acid Risk",
        hazard: "Puncturing lithium-ion batteries causes instant violent fire. Crushing lead-acid batteries spills corrosive sulfuric acid.",
        protocol: "Store batteries upright in dry sand bins. Never puncture, hammer, or melt battery casings.",
        audioScript: "Danger! Do not smash or puncture old batteries. Lithium fires cannot be extinguished with water. Store in dry sand containers and sell intact."
      },
      {
        id: "crt_implosion",
        title: "CRT Glass Phosphor Hazard",
        hazard: "Cathode ray tubes contain vacuum implosion hazard and deadly leaded glass with cadmium phosphor coating.",
        protocol: "Never smash CRT television screens with hammers. Keep glass intact and wear heavy leather gloves.",
        audioScript: "Safety notice! Never break old television glass screens. Glass fragments implode under vacuum and toxic phosphor powder poisons lungs."
      }
    ],
    quickActions: {
      sendLotDetails: "Send lot details",
      proposePrice: "Propose rate (₹/kg)",
      shareGps: "Share GPS location",
      requestPickup: "Request doorstep pickup"
    }
  },

  mr: {
    appName: "कबाडीवाला कनेक्ट",
    appTagline: "ई-कचरा परिपत्र शोध व औपचारिकीकरण नेटवर्क",
    operationsMenuBar: "ऑपरेशन्स मेनू बार",
    activeWorkflowModule: "सक्रिय वर्कफ्लो मॉड्यूल",
    showMenuBar: "मेनू बार दाखवा",
    collapseMenuBar: "मेनू संकुचित करा",
    scrollToTopMenu: "शीर्ष मेनूवर जा",
    roleScrapperLabel: "स्क्रॅपर फील्ड डेस्क",
    roleRecyclerLabel: "रिसायकलर प्रक्रिया केंद्र",
    roleAdminLabel: "केंद्रीय नियामक नोंदणी",
    scrapperPortal: "स्क्रॅपर पोर्टल",
    recyclerPortal: "रिसायकलर सुविधा व संकलन केंद्र",
    adminPortal: "प्लॅटफॉर्म प्रशासन व CPCB अनुपालन",
    scrapperPortalDesc: "AI द्वारे योग्य भाव आणि अधिकृत रिसायकलर्सशी थेट संपर्क",
    recyclerPortalDesc: "CPCB अधिकृत ई-कचरा खरेदी, प्रमाणित वजन व EPR प्रमाणपत्र",
    adminPortalDesc: "CPCB / SPCB नियामक पर्यवेक्षण • EPR ऑडिट लेजर • बाजार भाव स्थिरीकरण",
    liveStatus: "थेट (Live)",
    logout: "लॉगआउट",
    refreshGps: "GPS स्थान रिफ्रेश करा",
    gpsActive: "GPS थेट जोडलेले",
    offlineQueueActive: "ऑफलाइन कतार सक्रिय",
    activeLots: "सक्रिय लॉट्स",
    totalPayout: "एकूण मिळालेला मोबदला",
    cpcbCompliant: "CPCB EPR अनुपालन सक्रिय",
    grievanceDesk: "तक्रार व मध्यस्थी केंद्र",
    directChat: "थेट संवाद (Chat)",

    allCategories: "सर्व श्रेणी",
    searchPlaceholder: "लॉट आयडी, स्क्रॅपर किंवा साहित्य शोधा...",
    statusAll: "सर्व स्थिती",
    statusBroadcasted: "प्रसारित (Broadcasted)",
    statusAccepted: "स्वीकृत (Accepted)",
    statusWeightConfirmed: "वजन निश्चित (Confirmed)",
    statusCompleted: "पूर्ण झाले (Completed)",
    statusCancelled: "रद्द (Cancelled)",
    tableView: "तक्ता दृश्य",
    mapView: "नकाशा दृश्य",
    bothView: "दोन्ही दृश्य",
    acceptLot: "लॉट स्वीकारा",
    inspectWeigh: "वजन पडताळा व पावती द्या",
    call: "थेट कॉल करा",
    chat: "चर्चा करा",
    downloadVoucher: "गेट पास / डिजिटल पावती",
    downloadEpr: "CPCB EPR प्रमाणपत्र (PDF)",
    scaleVerification: "काटा वजन तपासणी",
    actualWeight: "प्रत्यक्ष मोजलेले वजन (किलो)",
    declaredWeight: "घोषित वजन (किलो)",
    requiredWeight: "स्वीकृत शुद्ध वजन (किलो)",
    unrequiredWeight: "अस्वीकृत / कचरा वजन (किलो)",
    contaminationDeduction: "अशुद्धता कपात (₹)",
    notes: "तपासणी टिप्पणी / नोट्स",
    paymentMode: "पेमेंट पद्धत",
    confirmAndGenerate: "वजन निश्चित करा व पावती द्या",
    cancel: "रद्द करा",
    saveChanges: "बदल जतन करा",
    buyingRates: "खरेदी दर (₹/किलो)",
    facilityLatitude: "सुविधा अक्षांश (GPS)",
    facilityLongitude: "सुविधा रेखांश (GPS)",
    serviceRadiusKm: "सेवा क्षेत्र त्रिज्या (किमी)",
    doorstepPickup: "घरपोच गाडी उपलब्ध",
    selfVisitOnly: "स्वतः केंद्रावर येणे आवश्यक",

    modSafety: {
      label: "सुरक्षा सूचना",
      title: "१. सुरक्षा मार्गदर्शन व ऑडिओ चेतावणी",
      desc: "विषारी वायूंपासून संरक्षण व सचित्र नियम"
    },
    modCapture: {
      label: "फोटो व वजन",
      title: "२. फोटो व AI वजन मोजणी",
      desc: "कॅमेरा स्कॅन, स्वयंचलित श्रेणी व दर शोध"
    },
    modMap: {
      label: "रिसायकलर नकाशा",
      title: "३. रिसायकलर नकाशा व अंतर",
      desc: "जवळील अधिकृत संकलन केंद्रे शोधा"
    },
    modChat: {
      label: "थेट संवाद",
      title: "४. थेट चर्चा व वाटाघाटी",
      desc: "रिसायकलर्सशी थेट दर व गाडी ठरवणे"
    },
    modLots: {
      label: "माझे लॉट्स",
      title: "५. माझे डिजिटल ई-कचरा लॉट्स",
      desc: "प्रसारित लॉट्स, वजन पडताळणी व पावत्या"
    },
    modRates: {
      label: "बाजार भाव",
      title: "६. बाजार भाव दरपत्रक",
      desc: "CPCB अधिकृत किमान आधारभूत दर"
    },
    modScrapComplaints: {
      label: "तक्रार निवारण",
      title: "७. वैधानिक तक्रार व मध्यस्थी कक्ष",
      desc: "अनधिकृत खरेदीदार, वजन कपात व फसवणुकीविरुद्ध CPCB / SPCB कडे तक्रार"
    },

    inwardLotsTitle: "एकूण आलेले लॉट्स",
    verifiedVolumeTitle: "प्रमाणित वजन",
    pendingWeighmentTitle: "वजन तपासणी बाकी",
    recycledVolumeTitle: "प्रक्रिया केलेला कचरा",
    capitalFlowTitle: "एकूण मोबदला प्रवाह",
    verifiedEntitiesTitle: "प्रमाणित वापरकर्ते",
    aiModelHealthTitle: "AI मॉडेल कार्यक्षमता",
    systemHealthy: "प्रणाली सुरळीत",
    cpcbReportBtn: "CPCB अनुपालन अहवाल (PDF)",
    thLotRefId: "लॉट संदर्भ क्र.",
    thMaterialCategory: "साहित्य श्रेणी",
    thEntityMatch: "सहभागी संस्था",
    thCertifiedWeight: "प्रमाणित वजन",
    thSettlement: "मोबदला रक्कम",
    thStatus: "स्थिती",
    thAuditVoucher: "तपासणी पावती",
    thNameAndIdentity: "नाव व ओळख",
    thRole: "भूमिका",
    thLocation: "ठिकाण / पत्ता",
    thContact: "संपर्क",
    thVerification: "पडताळणी स्थिती",
    thActions: "कृती",

    modRecLots: {
      label: "उपलब्ध लॉट्स",
      title: "१. ई-कचरा लॉट्स व खरेदी",
      desc: "जवळील स्क्रॅपर्सचे प्रसारित लॉट्स स्वीकारा"
    },
    modRecRates: {
      label: "दर व्यवस्थापन",
      title: "२. खरेदी दर व लॉजिस्टिक्स",
      desc: "६ ई-कचरा श्रेणींचे दर (₹/किलो) व पिकअप त्रिज्या"
    },
    modRecWeigh: {
      label: "वजन व पावत्या",
      title: "३. प्रमाणित वजन व डिजिटल पावती",
      desc: "इलेक्ट्रॉनिक काटा वजन तपासणी व EPR पावती"
    },
    modRecMap: {
      label: "संकलन नकाशा",
      title: "४. संकलन नकाशा व मार्ग नियोजन",
      desc: "थेट नकाशावर स्क्रॅपर लॉट्स व पिकअप क्षेत्र"
    },
    modRecChat: {
      label: "स्क्रॅपर संवाद",
      title: "५. स्क्रॅपर थेट संवाद केंद्र",
      desc: "स्क्रॅपर्सशी दर ठरवणे व गाडी नियोजित करणे"
    },
    modRecCompliance: {
      label: "EPR अनुपालन",
      title: "६. CPCB EPR व तक्रार निवारण",
      desc: "अधिकृत EPR लेजर व तक्रार डेस्क"
    },

    modAdmTx: {
      label: "व्यवहार नोंदवही",
      title: "१. मास्टर ई-कचरा व्यवहार नोंदवही",
      desc: "सर्व लॉट्सची जीवनचक्र पडताळणी व QR कोड"
    },
    modAdmUsers: {
      label: "वापरकर्ते व संस्था",
      title: "२. वापरकर्ते व सुविधा पडताळणी",
      desc: "स्क्रॅपर, रिसायकलर व CPCB नोंदणी तपासणी"
    },
    modAdmRates: {
      label: "किमान आधारभूत भाव",
      title: "३. किमान आधारभूत भाव व दर नियंत्रण",
      desc: "सरकारी किमान दर अंमलबजावणी व भाव स्थिरता"
    },
    modAdmComplaints: {
      label: "तक्रार निवारण",
      title: "४. तक्रार निवारण व मध्यस्थी केंद्र",
      desc: "तक्रारींची चौकशी, दंड व मध्यस्थी आदेश"
    },
    modAdmLegal: {
      label: "कायदेशीर कारवाई",
      title: "५. कायदेशीर कारवाई व पर्यावरण दंड",
      desc: "पर्यावरण संरक्षण कायदा कलम १५ अंतर्गत नोटीस"
    },
    modAdmAudit: {
      label: "सिस्टीम ऑडिट",
      title: "६. सिस्टीम ऑडिट व डेटाबेस क्वेरी",
      desc: "अपरिवर्तनीय ऑडिट लॉग व PostgreSQL DDL स्कीमा"
    },

    appTitle: "स्क्रॅपर पोर्टल",
    appSubtitle: "AI द्वारे योग्य भाव आणि अधिकृत रिसायकलर्सशी थेट संपर्क",
    roleScrapper: "प्रमाणित भंगार संकलक",
    verifiedBadge: "आधार / CPCB सत्यापित",
    createLot: "डिजिटल ई-कचरा लॉट तयार करा आणि AI मूल्यांकन",
    lotSubheading: "स्वयंचलित वर्गीकरण आणि योग्य बाजारभावासाठी ई-कचऱ्याचा फोटो काढा किंवा अपलोड करा",
    uploadPrompt: "येथे भंगाराचा फोटो टाका किंवा कॅमेऱ्याने काढा",
    takePhoto: "कॅमेरा फोटो घ्या / अपलोड करा",
    browseGallery: "फाइल निवडा",
    analyzingAI: "AI कॉम्प्युटर व्हिजनद्वारे सामग्री तपासत आहे...",
    aiDetected: "AI द्वारे ओळखलेली सामग्री",
    confidence: "विश्वासार्हता स्कोअर",
    manualCategoryFallback: "किंवा स्वतः श्रेणी निवडा",
    weightInputLabel: "एकूण वजन (किलोमध्ये)",
    weightInputPlaceholder: "वजन टाका (उदा. 15.5)",
    calculatePrice: "अंदाजे योग्य भाव तपासा",
    estimatedPriceRange: "एकूण मिळणारा अंदाजित मोबदला",
    perKgRate: "मूळ दर: ₹",
    minPrice: "किमान योग्य मोबदला",
    maxPrice: "कमाल संभाव्य मोबदला",
    createLotButton: "डिजिटल लॉट तयार करून पाठवा",
    lotCreatedSuccess: "लॉट यशस्वीरीत्या तयार झाला! खालील रिसायकलर्सशी संपर्क साधा.",
    findRecyclersTitle: "जवळील अधिकृत रिसायकलर्स",
    findRecyclersSubheading: "GPS अंतरानुसार क्रमवारी लावली आहे",
    detectingLocation: "GPS स्थान शोधत आहे...",
    useMyLocation: "स्थान रिफ्रेश करा",
    myLocation: "तुमचे वर्तमान स्थान",
    distanceKm: "किमी अंतरावर",
    offeredRate: "खरेदी दर: ₹",
    pickupAvailable: "घरपोच गाडी उपलब्ध",
    cpcbAuthorized: "CPCB / SPCB अधिकृत",
    chatAndNegotiate: "चर्चा आणि भाव ठरवा (Chat)",
    directCall: "थेट कॉल करा",
    safetyTitle: "ई-कचरा हाताळणी सुरक्षा व आरोग्य सूचना",
    safetySubheading: "विषारी वायूंपासून संरक्षणासाठी सचित्र व ऑडिओ सुरक्षा मार्गदर्शन",
    playAudio: "सुरक्षा सूचना ऐका",
    stopAudio: "ऑडिओ थांबवा",
    materials: {
      "PCB (Printed Circuit Boards)": "इलेक्ट्रॉनिक सर्किट बोर्ड (PCB)",
      "Copper Wires/Cables": "तांब्याच्या तारा व केबल्स",
      "Lead/Li-ion Batteries": "लेड आणि लिथियम बॅटऱ्या",
      "CRT Glass & Monitors": "CRT टीव्ही स्क्रीन काच",
      "Electric Motors & Transformers": "इलेक्ट्रिक मोटर्स व ट्रान्सफॉर्मर्स",
      "Mixed Rigid Plastics": "मिश्रित ई-कचरा प्लास्टिक"
    },
    safetyCards: [
      {
        id: "cable_burning",
        title: "तारा उघड्यावर जाळू नका",
        hazard: "प्लास्टिक जाळल्याने कॅन्सरकारक अत्यंत विषारी डायऑक्सिन धूर हवेत पसरतो.",
        protocol: "तारा सोलण्यासाठी कटर वापरा किंवा अखंड तारा रिसायकलरला विका.",
        audioScript: "सावधान! प्लास्टिकच्या तारा उघड्यावर जाळू नका. याचा धूर फुफ्फुसांना हानी पोहोचवतो आणि तांब्याचा भाव कमी मिळतो."
      },
      {
        id: "acid_leaching",
        title: "सोन्यासाठी ॲसिड वापरू नका",
        hazard: "नायट्रिक ॲसिडमध्ये सर्किट बोर्ड उकळल्याने डोळ्यांची दृष्टी जाऊ शकते आणि फुफ्फुस निकामी होतात.",
        protocol: "ॲसिडने धातू वेगळे करू नका. बोर्ड थेट अधिकृत रिसायकलिंग केंद्रात जमा करा.",
        audioScript: "धोकादायक सूचना! सर्किट बोर्डवर ॲसिडचा वापर करू नका. हा धूर अत्यंत विषारी आहे. अधिकृत केंद्राला विका."
      },
      {
        id: "battery_hazard",
        title: "बॅटऱ्या जपून हाताळा",
        hazard: "लिथियम बॅटऱ्या फुटल्यास अचानक आग लागून स्फोट होऊ शकतो. लेड बॅटरीतून ॲसिड गळते.",
        protocol: "कोरड्या वाळूच्या डब्यात साठवा. हातोड्याने फोडू नका.",
        audioScript: "सुरक्षा सूचना: जुन्या बॅटऱ्यांना हातोड्याने फोडू नका. यामुळे भीषण आग लागू शकते. कोरड्या जागेत स्वतंत्र ठेवा."
      },
      {
        id: "crt_implosion",
        title: "टीव्हीची काच फोडू नका",
        hazard: "CRT स्क्रीन फुटल्यास काचेचे तुकडे उडतात आणि आतील फॉस्फर पावडर विषारी असते.",
        protocol: "टीव्हीची काच दगडाने फोडू नका. कापडात गुंडाळून सुरक्षितपणे वाहनातून न्या.",
        audioScript: "लक्ष द्या: जुन्या टीव्हीची काच फोडू नका. काच उडून जखमा होतात आणि विषारी पावडर शरीरात जाऊ शकते."
      }
    ],
    quickActions: {
      sendLotDetails: "लॉट तपशील पाठवा",
      proposePrice: "दर प्रस्तावित करा (₹/किलो)",
      shareGps: "GPS स्थान शेअर करा",
      requestPickup: "गाडी पाठवण्याची विनंती करा"
    }
  },

  hi: {
    appName: "कबाड़ीवाला कनेक्ट",
    appTagline: "ई-कचरा परिपत्र खोज और औपचारिकीकरण नेटवर्क",
    operationsMenuBar: "ऑपरेशन्स मेन्यू बार",
    activeWorkflowModule: "सक्रिय वर्कफ़्लो मॉड्यूल",
    showMenuBar: "मेन्यू बार दिखाएं",
    collapseMenuBar: "मेन्यू संक्षिप्त करें",
    scrollToTopMenu: "शीर्ष मेन्यू पर जाएं",
    roleScrapperLabel: "स्क्रैपर फील्ड डेस्क",
    roleRecyclerLabel: "रीसायकलर प्रोसेसिंग प्लांट",
    roleAdminLabel: "केंद्रीय नियामक रजिस्ट्री",
    scrapperPortal: "स्क्रैपर पोर्टल",
    recyclerPortal: "रीसायकलर सुविधा एवं संकलन केंद्र",
    adminPortal: "प्लेटफ़ॉर्म प्रशासन और CPCB अनुपालन",
    scrapperPortalDesc: "AI द्वारा उचित मूल्य खोज और अधिकृत रीसायकलर्स से सीधा संपर्क",
    recyclerPortalDesc: "CPCB अधिकृत ई-कचरा खरीद, वजन सत्यापन और EPR प्रमाण पत्र",
    adminPortalDesc: "CPCB / SPCB नियामक पर्यवेक्षण • पारदर्शी EPR ऑडिट लेजर • मूल्य स्थिरीकरण",
    liveStatus: "लाइव",
    logout: "लॉगआउट",
    refreshGps: "GPS रिफ्रेश करें",
    gpsActive: "GPS लाइव",
    offlineQueueActive: "ऑफ़लाइन कतार सक्रिय",
    activeLots: "सक्रिय लॉट्स",
    totalPayout: "कुल भुगतान राशि",
    cpcbCompliant: "CPCB EPR अनुपालन सक्रिय",
    grievanceDesk: "शिकायत एवं मध्यस्थता डेस्क",
    directChat: "सीधी बातचीत (Chat)",

    allCategories: "सभी श्रेणियां",
    searchPlaceholder: "लॉट आईडी, स्क्रैपर या सामग्री खोजें...",
    statusAll: "सभी स्थिति",
    statusBroadcasted: "प्रसारित (Broadcasted)",
    statusAccepted: "स्वीकृत (Accepted)",
    statusWeightConfirmed: "वजन सत्यापित (Confirmed)",
    statusCompleted: "पूर्ण (Completed)",
    statusCancelled: "रद्द (Cancelled)",
    tableView: "तालिका दृश्य",
    mapView: "मानचित्र दृश्य",
    bothView: "दोनों दृश्य",
    acceptLot: "लॉट स्वीकारें",
    inspectWeigh: "वजन जांचें और रसीद दें",
    call: "कॉल करें",
    chat: "बातचीत करें",
    downloadVoucher: "गेट पास / डिजिटल रसीद",
    downloadEpr: "CPCB EPR प्रमाण पत्र (PDF)",
    scaleVerification: "कांटा वजन सत्यापन",
    actualWeight: "वास्तविक वजन (किग्रा)",
    declaredWeight: "घोषित वजन (किग्रा)",
    requiredWeight: "स्वीकृत शुद्ध वजन (किग्रा)",
    unrequiredWeight: "अस्वीकृत कचरा वजन (किग्रा)",
    contaminationDeduction: "अशुद्धता कटौती (₹)",
    notes: "निरीक्षण विवरण",
    paymentMode: "भुगतान माध्यम",
    confirmAndGenerate: "वजन की पुष्टि करें और रसीद दें",
    cancel: "रद्द करें",
    saveChanges: "परिवर्तन सहेजें",
    buyingRates: "खरीद दर (₹/किग्रा)",
    facilityLatitude: "सुविधा अक्षांश (GPS)",
    facilityLongitude: "सुविधा देशांतर (GPS)",
    serviceRadiusKm: "सेवा दायरा (किमी)",
    doorstepPickup: "डोरस्टेप पिकअप उपलब्ध",
    selfVisitOnly: "स्वयं केंद्र पर आएं",

    modSafety: {
      label: "सुरक्षा नियम",
      title: "1. स्वास्थ्य और सुरक्षा मार्गदर्शन",
      desc: "विषाक्त धुएं से बचाव और सचित्र नियम"
    },
    modCapture: {
      label: "फोटो और वजन",
      title: "2. फोटो और AI वजन गणना",
      desc: "कैमरा स्कैन, स्वचालित वर्गीकरण और उचित दर"
    },
    modMap: {
      label: "रीसायकलर नक्शा",
      title: "3. रीसायकलर नक्शा और दूरी",
      desc: "नजदीकी अधिकृत संकलन केंद्र खोजें"
    },
    modChat: {
      label: "सीधी चैट",
      title: "4. सीधी बातचीत और मोलभाव",
      desc: "रीसायकलर से सीधी दर और पिकअप तय करें"
    },
    modLots: {
      label: "मेरे लॉट्स",
      title: "5. मेरे डिजिटल ई-कचरा लॉट्स",
      desc: "प्रसारित लॉट्स, वजन पुष्टि और रसीदें"
    },
    modRates: {
      label: "बाजार भाव",
      title: "6. बाजार भाव दर सूची",
      desc: "CPCB अधिकृत न्यूनतम आधारभूत दरें"
    },
    modScrapComplaints: {
      label: "शिकायत डेस्क",
      title: "७. वैधानिक शिकायत एवं मध्यस्थता कक्ष",
      desc: "वजन कटौती, कम भुगतान या अनधिकृत रिसायकलर्स के खिलाफ CPCB शिकायत"
    },

    inwardLotsTitle: "कुल प्राप्त लॉट्स",
    verifiedVolumeTitle: "प्रमाणित वजन",
    pendingWeighmentTitle: "वजन सत्यापन बाकी",
    recycledVolumeTitle: "पुनर्चक्रित मात्रा",
    capitalFlowTitle: "कुल भुगतान प्रवाह",
    verifiedEntitiesTitle: "सत्यापित इकाइयाँ",
    aiModelHealthTitle: "AI मॉडल स्वास्थ्य",
    systemHealthy: "सिस्टम सुचारू",
    cpcbReportBtn: "CPCB अनुपालन रिपोर्ट (PDF)",
    thLotRefId: "लॉट संदर्भ संख्या",
    thMaterialCategory: "सामग्री श्रेणी",
    thEntityMatch: "संबद्ध इकाइयाँ",
    thCertifiedWeight: "प्रमाणित वजन",
    thSettlement: "भुगतान राशि",
    thStatus: "स्थिति",
    thAuditVoucher: "ऑडिट रसीद",
    thNameAndIdentity: "नाम एवं पहचान",
    thRole: "भूमिका",
    thLocation: "स्थान / पता",
    thContact: "संपर्क",
    thVerification: "सत्यापन स्थिति",
    thActions: "कार्रवाई",

    modRecLots: {
      label: "उपलब्ध लॉट्स",
      title: "1. ई-कचरा लॉट्स और खरीद",
      desc: "नजदीकी स्क्रैपर्स के लाइव लॉट्स स्वीकारें"
    },
    modRecRates: {
      label: "दर विन्यास",
      title: "2. खरीद दर और लॉजिस्टिक्स",
      desc: "6 श्रेणियों की प्रति-किग्रा दर और पिकअप दायरा"
    },
    modRecWeigh: {
      label: "वजन व रसीद",
      title: "3. प्रमाणित वजन और डिजिटल रसीद",
      desc: "इलेक्ट्रॉनिक कांटा वजन सत्यापन और EPR रसीद"
    },
    modRecMap: {
      label: "संकलन नक्शा",
      title: "4. संकलन नक्शा और रूटिंग",
      desc: "नक्शे पर स्क्रैपर लॉट्स और पिकअप दायरा"
    },
    modRecChat: {
      label: "स्क्रैपर चैट",
      title: "5. स्क्रैपर संचार डेस्क",
      desc: "स्क्रैपर्स से सीधी बातचीत और मोलभाव"
    },
    modRecCompliance: {
      label: "EPR अनुपालन",
      title: "6. CPCB EPR और शिकायत डेस्क",
      desc: "प्रमाणित रीसाइक्लिंग लेजर और शिकायत निवारण"
    },

    modAdmTx: {
      label: "लेन-देन लेजर",
      title: "1. मास्टर ई-कचरा ट्रैसबिलिटी लेजर",
      desc: "सभी लॉट्स का सत्यापन और QR कोड वाउचर"
    },
    modAdmUsers: {
      label: "उपयोगकर्ता सत्यापन",
      title: "2. उपयोगकर्ता और सुविधा रजिस्ट्री",
      desc: "स्क्रैपर, रीसायकलर और CPCB लाइसेंस सत्यापन"
    },
    modAdmRates: {
      label: "न्यूनतम आधार दर",
      title: "3. मूल्य स्थिरीकरण और न्यूनतम दर",
      desc: "सरकारी न्यूनतम दरों का प्रबंधन और निगरानी"
    },
    modAdmComplaints: {
      label: "शिकायत निवारण",
      title: "4. शिकायत एवं मध्यस्थता डेस्क",
      desc: "शिकायतों की जांच, जुर्माना और मध्यस्थता आदेश"
    },
    modAdmLegal: {
      label: "कानूनी कार्रवाई",
      title: "5. कानूनी प्रवर्तन और पर्यावरण जुर्माना",
      desc: "पर्यावरण संरक्षण अधिनियम धारा 15 के नोटिस"
    },
    modAdmAudit: {
      label: "सिस्टम ऑडिट",
      title: "6. सिस्टम ऑडिट लॉग और डेटाबेस DDL",
      desc: "अपरिवर्तनीय सुरक्षा ऑडिट और डेटाबेस स्कीमा"
    },

    appTitle: "स्क्रैपर पोर्टल",
    appSubtitle: "AI द्वारा उचित मूल्य खोज और अधिकृत रीसायकलर्स से सीधा संपर्क",
    roleScrapper: "सत्यापित कबाड़ी साथी",
    verifiedBadge: "आधार / CPCB सत्यापित",
    createLot: "डिजिटल ई-कचरा लॉट बनाएं और AI मूल्यांकन",
    lotSubheading: "स्वचालित वर्गीकरण और उचित दर के लिए ई-कचरे की फोटो लें या अपलोड करें",
    uploadPrompt: "कचरे की फोटो यहाँ डालें, या कैमरे से लें",
    takePhoto: "कैमरा फोटो लें / अपलोड करें",
    browseGallery: "फ़ाइल चुनें",
    analyzingAI: "AI कंप्यूटर विज़न से सामग्री की जांच हो रही है...",
    aiDetected: "AI द्वारा पहचानी गई सामग्री",
    confidence: "विश्वास स्कोर",
    manualCategoryFallback: "या स्वयं श्रेणी चुनें",
    weightInputLabel: "कुल वजन (किग्रा में)",
    weightInputPlaceholder: "वजन दर्ज करें (उदा. 15.5)",
    calculatePrice: "उचित मूल्य सीमा की गणना करें",
    estimatedPriceRange: "अनुमानित कुल भुगतान सीमा",
    perKgRate: "आधार दर: ₹",
    minPrice: "न्यूनतम उचित भुगतान",
    maxPrice: "अधिकतम बाजार क्षमता",
    createLotButton: "डिजिटल लॉट बनाएं और भेजें",
    lotCreatedSuccess: "लॉट सफलतापूर्वक तैयार हुआ! नीचे रीसायकलर्स खोजें।",
    findRecyclersTitle: "नजदीकी अधिकृत रीसायकलर्स",
    findRecyclersSubheading: "GPS दूरी के आधार पर क्रमित",
    detectingLocation: "GPS स्थान खोजा जा रहा है...",
    useMyLocation: "स्थान रिफ्रेश करें",
    myLocation: "आपका वर्तमान स्थान",
    distanceKm: "किमी दूर",
    offeredRate: "खरीद दर: ₹",
    pickupAvailable: "डोरस्टेप पिकअप उपलब्ध",
    cpcbAuthorized: "CPCB / SPCB अधिकृत",
    chatAndNegotiate: "बातचीत और मोलभाव (Chat)",
    directCall: "कॉल करें",
    safetyTitle: "ई-कचरा स्वास्थ्य एवं सुरक्षा मार्गदर्शन",
    safetySubheading: "जहरीले धुएं से बचाव के लिए सचित्र नियम और ऑडियो सुरक्षा चेतावनी",
    playAudio: "सुरक्षा चेतावनी सुनें",
    stopAudio: "ऑडियो रोकें",
    materials: {
      "PCB (Printed Circuit Boards)": "इलेक्ट्रॉनिक सर्किट बोर्ड (PCB)",
      "Copper Wires/Cables": "तांबे के तार और केबल्स",
      "Lead/Li-ion Batteries": "लेड और लिथियम बैटरियां",
      "CRT Glass & Monitors": "CRT टीवी स्क्रीन ग्लास",
      "Electric Motors & Transformers": "इलेक्ट्रिक मोटर्स और ट्रांसफार्मर",
      "Mixed Rigid Plastics": "मिश्रित ई-कचरा प्लास्टिक"
    },
    safetyCards: [
      {
        id: "cable_burning",
        title: "तारों को खुले में न जलाएं",
        hazard: "प्लास्टिक जलाने से कैंसर पैदा करने वाला जहरीला डाइऑक्सिन धुआं निकलता है।",
        protocol: "तार छीलने के औजारों का प्रयोग करें या तारों को रीसायकलर को सीधे बेचें।",
        audioScript: "सावधान! बिजली के तारों को खुले में मत जलाइए। इसका धुआं फेफड़ों के लिए जानलेवा है और तांबे की कीमत घटाता है।"
      },
      {
        id: "acid_leaching",
        title: "सोना निकालने के लिए तेजाब न उबालें",
        hazard: "नाइट्रिक एसिड में सर्किट बोर्ड उबालने से आंखों की रोशनी जा सकती है और फेफड़े खराब होते हैं।",
        protocol: "खुले ड्रम में तेजाब का उपयोग न करें। बोर्ड सीधे अधिकृत केंद्रों को सौंपें।",
        audioScript: "खतरे की चेतावनी! सर्किट बोर्ड पर तेजाब मत डालिए। इसका जहरीला धुआं फेफड़ों को नष्ट कर देता है। इसे अधिकृत केंद्र को बेचें।"
      },
      {
        id: "battery_hazard",
        title: "बैटरियों को संभालकर रखें",
        hazard: "लिथियम बैटरी फटने से अचानक भयंकर आग लग सकती है। लेड बैटरी से तेजाब गिरता है।",
        protocol: "सूखी रेत के डिब्बे में अलग रखें। हथौड़े से न तोड़ें।",
        audioScript: "सुरक्षा चेतावनी: पुरानी बैटरियों को हथौड़े से मत तोड़िए। इनमें आग लग सकती है। सूखी जगह पर अलग रखें।"
      },
      {
        id: "crt_implosion",
        title: "टीवी का कांच न फोड़ें",
        hazard: "CRT स्क्रीन फटने से कांच के टुकड़े उड़ते हैं और अंदर की फॉस्फर पाउडर जहरीली होती है।",
        protocol: "टीवी के कांच पर पत्थर न मारें। कपड़े में लपेटकर सुरक्षित ले जाएं।",
        audioScript: "ध्यान दें: पुराने टीवी के कांच को मत तोड़िए। यह फूटने पर चोट लग सकती है और इसका पाउडर बहुत जहरीला होता है।"
      }
    ],
    quickActions: {
      sendLotDetails: "लॉट विवरण भेजें",
      proposePrice: "दर प्रस्तावित करें (₹/किग्रा)",
      shareGps: "GPS स्थान साझा करें",
      requestPickup: "गाड़ी भेजने का अनुरोध करें"
    }
  },

  ta: {
    appName: "கபாடிவாலா கனெக்ட்",
    appTagline: "மின்னணுக் கழிவு கண்காணிப்பு மற்றும் மறுசுழற்சி நெட்வொர்க்",
    operationsMenuBar: "செயல்பாட்டு மெனு பார்",
    activeWorkflowModule: "தற்போதைய செயல்பாட்டு பிரிவு",
    showMenuBar: "மெனு பாரைக் காட்டு",
    collapseMenuBar: "மெனுவை சுருக்கு",
    scrollToTopMenu: "மேல் மெனுவிற்கு செல்",
    roleScrapperLabel: "சேகரிப்பாளர் பணிப்பிரிவு",
    roleRecyclerLabel: "மறுசுழற்சி செயலாக்க ஆலை",
    roleAdminLabel: "மத்திய ஒழுங்குமுறை பதிவகம்",
    scrapperPortal: "சேகரிப்பாளர் தளம்",
    recyclerPortal: "மறுசுழற்சி ஆலை மற்றும் ஒருங்கிணைப்பு மையம்",
    adminPortal: "தள நிர்வாகம் மற்றும் CPCB இணக்கம்",
    scrapperPortalDesc: "AI மூலம் நியாயமான விலை மற்றும் அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்களுடன் நேரடி தொடர்பு",
    recyclerPortalDesc: "CPCB அங்கீகரிக்கப்பட்ட கழிவு கொள்முதல், எடை சரிபார்ப்பு மற்றும் EPR சான்றிதழ்",
    adminPortalDesc: "CPCB / SPCB மேற்பார்வை • EPR தணிக்கை கணக்கு • விலை உறுதிப்பாடு",
    liveStatus: "நேரலை",
    logout: "வெளியேறு",
    refreshGps: "GPS புதுப்பிக்கவும்",
    gpsActive: "GPS இயங்குகிறது",
    offlineQueueActive: "ஆஃப்லைன் வரிசை செயலில் உள்ளது",
    activeLots: "செயலில் உள்ள லாட்கள்",
    totalPayout: "மொத்த கொடுப்பனவு",
    cpcbCompliant: "CPCB EPR இணக்கம் செயலில் உள்ளது",
    grievanceDesk: "குறைதீர்ப்பு மற்றும் மத்தியஸ்த மையம்",
    directChat: "நேரடி உரையாடல் (Chat)",

    allCategories: "அனைத்து பிரிவுகள்",
    searchPlaceholder: "லாட் எண், சேகரிப்பாளர் பெயர் தேடவும்...",
    statusAll: "அனைத்து நிலைகள்",
    statusBroadcasted: "அறிவிக்கப்பட்டது (Broadcasted)",
    statusAccepted: "ஏற்றுக்கொள்ளப்பட்டது (Accepted)",
    statusWeightConfirmed: "எடை உறுதி செய்யப்பட்டது",
    statusCompleted: "நிறைவடைந்தது (Completed)",
    statusCancelled: "ரத்து செய்யப்பட்டது",
    tableView: "அட்டவணை பார்வை",
    mapView: "வரைபட பார்வை",
    bothView: "இரண்டு பார்வைகள்",
    acceptLot: "லாட்டை ஏற்றுக்கொள்",
    inspectWeigh: "எடை சரிபார்த்து ரசீது வழங்குக",
    call: "நேரடி அழைப்பு",
    chat: "உரையாடுக",
    downloadVoucher: "கேட் பாஸ் / டிஜிட்டல் ரசீது",
    downloadEpr: "CPCB EPR சான்றிதழ் (PDF)",
    scaleVerification: "எடை மேடை சரிபார்ப்பு",
    actualWeight: "உண்மையான எடை (கிலோ)",
    declaredWeight: "கூறப்பட்ட எடை (கிலோ)",
    requiredWeight: "ஏற்றுக்கொள்ளப்பட்ட தூய எடை (கிலோ)",
    unrequiredWeight: "நிராகரிக்கப்பட்ட கழிவு எடை (கிலோ)",
    contaminationDeduction: "கலப்படக் கழிவு பிடித்தம் (₹)",
    notes: "ஆய்வுக் குறிப்புகள்",
    paymentMode: "பணம் செலுத்தும் முறை",
    confirmAndGenerate: "எடையை உறுதிசெய்து ரசீது வழங்குக",
    cancel: "ரத்து",
    saveChanges: "மாற்றங்களைச் சேமிக்கவும்",
    buyingRates: "கொள்முதல் விலை (₹/கிலோ)",
    facilityLatitude: "மையத்தின் அட்சரேகை (GPS)",
    facilityLongitude: "மையத்தின் தீர்க்கரேகை (GPS)",
    serviceRadiusKm: "சேவை எல்லை (கி.மீ)",
    doorstepPickup: "நேரடி பிக்-அப் வசதி உண்டு",
    selfVisitOnly: "நேரில் வர வேண்டும்",

    modSafety: {
      label: "பாதுகாப்பு வழிகாட்டல்",
      title: "1. பாதுகாப்பு வழிகாட்டல் மற்றும் குரல் எச்சரிக்கை",
      desc: "நச்சுப் புகையிலிருந்து பாதுகாக்கும் விதிகள் மற்றும் ஆடியோ"
    },
    modCapture: {
      label: "புகைப்படம் & எடை",
      title: "2. புகைப்படம் மற்றும் AI எடை மதிப்பீடு",
      desc: "கேமரா ஸ்கேன், தானியங்கி வகைப்பாடு மற்றும் விலை மதிப்பீடு"
    },
    modMap: {
      label: "மறுசுழற்சியாளர் வரைபடம்",
      title: "3. அருகிலுள்ள மறுசுழற்சியாளர்கள் வரைபடம்",
      desc: "GPS தூரத்தின் அடிப்படையில் மையங்களை எளிதாகக் கண்டறியவும்"
    },
    modChat: {
      label: "நேரடி உரையாடல்",
      title: "4. நேரடி உரையாடல் மற்றும் விலை பேரம்",
      desc: "மறுசுழற்சியாளர்களுடன் பேசி வாகனத்தை வரவழைக்கவும்"
    },
    modLots: {
      label: "எனது லாட்கள்",
      title: "5. எனது டிஜிட்டல் மின்னணுக் கழிவு லாட்கள்",
      desc: "அறிவிக்கப்பட்ட லாட்கள், எடை உறுதிப்படுத்தல் மற்றும் ரசீதுகள்"
    },
    modRates: {
      label: "சந்தை விலை",
      title: "6. சந்தை விலை பட்டியல் பலகை",
      desc: "அரசு அங்கீகரித்த குறைந்தபட்ச ஆதார விலை"
    },
    modScrapComplaints: {
      label: "குறைதீர்ப்பு மேடை",
      title: "7. சட்டரீதியான குறைதீர்ப்பு & மத்தியஸ்தம்",
      desc: "எடை குறைப்பு, விலை ஏமாற்று மற்றும் CPCB முறைப்பாடு"
    },

    inwardLotsTitle: "மொத்த உள்வரும் லாட்கள்",
    verifiedVolumeTitle: "சரிபார்க்கப்பட்ட எடை",
    pendingWeighmentTitle: "எடை சரிபார்ப்பு நிலுவை",
    recycledVolumeTitle: "சுழற்சி செய்யப்பட்ட அளவு",
    capitalFlowTitle: "மொத்த பணப் பரிவர்த்தனை",
    verifiedEntitiesTitle: "சரிபார்க்கப்பட்ட பயனர்கள்",
    aiModelHealthTitle: "AI மாதிரி செயல்திறன்",
    systemHealthy: "கணினி சீராக இயங்குகிறது",
    cpcbReportBtn: "CPCB இணக்க அறிக்கை (PDF)",
    thLotRefId: "லாட் குறிப்பு எண்",
    thMaterialCategory: "பொருள் வகை",
    thEntityMatch: "பங்கேற்பாளர்கள்",
    thCertifiedWeight: "சரிபார்க்கப்பட்ட எடை",
    thSettlement: "செலுத்தப்பட்ட தொகை",
    thStatus: "நிலை",
    thAuditVoucher: "தணிக்கை ரசீது",
    thNameAndIdentity: "பெயர் & அடையாளம்",
    thRole: "பங்கு",
    thLocation: "இடம்",
    thContact: "தொடர்பு",
    thVerification: "சரிபார்ப்பு",
    thActions: "நடவடிக்கைகள்",

    modRecLots: {
      label: "கிடைக்கும் லாட்கள்",
      title: "1. கழிவு லாட்கள் மற்றும் கொள்முதல்",
      desc: "சேகரிப்பாளர்கள் அனுப்பிய நேரடி லாட்களை ஏற்கவும்"
    },
    modRecRates: {
      label: "விலை அமைப்புகள்",
      title: "2. கொள்முதல் விலை மற்றும் எல்லை",
      desc: "6 பிரிவுகளுக்கான விலை (₹/கிலோ) மற்றும் சேவை தூரம்"
    },
    modRecWeigh: {
      label: "எடை & ரசீது",
      title: "3. சான்றளிக்கப்பட்ட எடை மற்றும் ரசீது",
      desc: "மின்னணு எடை மேடை சோதனை மற்றும் EPR சான்றிதழ்"
    },
    modRecMap: {
      label: "சேகரிப்பு வரைபடம்",
      title: "4. சேகரிப்பு வரைபடம் மற்றும் வழிகள்",
      desc: "வரைபடத்தில் கழிவு லாட்கள் மற்றும் சேகரிப்பு பகுதிகள்"
    },
    modRecChat: {
      label: "சேகரிப்பாளர் அரட்டை",
      title: "5. சேகரிப்பாளர் தொடர்பு மையம்",
      desc: "விலை பேசி முடிவெடுக்க நேரடி அரட்டை"
    },
    modRecCompliance: {
      label: "EPR இணக்கம்",
      title: "6. CPCB EPR மற்றும் குறைதீர்ப்பு பலகை",
      desc: "மறுசுழற்சி கணக்கு மற்றும் புகார் மையம்"
    },

    modAdmTx: {
      label: "பரிவர்த்தனை கணக்கு",
      title: "1. முழுமையான பரிவர்த்தனை கணக்கு",
      desc: "அனைத்து லாட்களின் முழு வாழ்க்கைச்சுழற்சி மற்றும் QR குறியீடு"
    },
    modAdmUsers: {
      label: "பயனர் சரிபார்ப்பு",
      title: "2. பயனர்கள் மற்றும் மையங்களின் பதிவேடு",
      desc: "சேகரிப்பாளர், ஆலை மற்றும் CPCB உரிமம் சரிபார்ப்பு"
    },
    modAdmRates: {
      label: "குறைந்தபட்ச விலை பலகை",
      title: "3. குறைந்தபட்ச ஆதார விலை மேலாண்மை",
      desc: "அரசின் குறைந்தபட்ச விலைக் கண்காணிப்பு"
    },
    modAdmComplaints: {
      label: "குறைதீர்ப்பு பலகை",
      title: "4. குறைதீர்ப்பு மற்றும் மத்தியஸ்த மையம்",
      desc: "புகார்களை விசாரித்து அபராதம் மற்றும் உத்தரவு வழங்குதல்"
    },
    modAdmLegal: {
      label: "சட்ட நடவடிக்கை",
      title: "5. சட்ட அமலாக்கம் மற்றும் அபராதங்கள்",
      desc: "சுற்றுச்சூழல் பாதுகாப்பு சட்டம் பிரிவு 15 நோட்டீஸ்கள்"
    },
    modAdmAudit: {
      label: "கணினி தணிக்கை",
      title: "6. தணிக்கை பதிவுகள் மற்றும் SQL திட்டம்",
      desc: "பாதுகாப்பான தணிக்கை மற்றும் தரவுத்தள திட்டம்"
    },

    appTitle: "சேகரிப்பாளர் தளம்",
    appSubtitle: "AI மூலம் நியாயமான விலை மற்றும் அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்களுடன் நேரடி தொடர்பு",
    roleScrapper: "சரிபார்க்கப்பட்ட சேகரிப்பாளர்",
    verifiedBadge: "ஆதார் / CPCB சரிபார்க்கப்பட்டது",
    createLot: "டிஜிட்டல் மின்னணுக் கழிவு லாட் மற்றும் AI விலை மதிப்பீடு",
    lotSubheading: "தானியங்கி வகைப்பாடு மற்றும் நியாயமான விலையைப் பெற புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும்",
    uploadPrompt: "புகைப்படத்தை இங்கே இழுத்து விடவும் அல்லது கேமரா மூலம் எடுக்கவும்",
    takePhoto: "கேமரா புகைப்படம் / பதிவேற்றம்",
    browseGallery: "கோப்பைத் தேர்ந்தெடுக்கவும்",
    analyzingAI: "AI கணினி பார்வை மூலம் ஆய்வு செய்கிறது...",
    aiDetected: "AI கண்டறிந்த கழிவுப் பொருள்",
    confidence: "துல்லியத்தன்மை",
    manualCategoryFallback: "அல்லது கைமுறையாகப் பிரிவைத் தேர்ந்தெடுக்கவும்",
    weightInputLabel: "மொத்த எடை (கிலோவில்)",
    weightInputPlaceholder: "எடையை உள்ளிடவும் (எ.கா. 15.5)",
    calculatePrice: "நியாயமான விலையைக் கணக்கிடுங்கள்",
    estimatedPriceRange: "எதிர்பார்க்கப்படும் மொத்த கொடுப்பனவு",
    perKgRate: "அடிப்படை விலை: ₹",
    minPrice: "குறைந்தபட்ச நியாயமான விலை",
    maxPrice: "அதிகபட்ச சந்தை மதிப்பு",
    createLotButton: "டிஜிட்டல் லாட்டை உருவாக்கி அனுப்பவும்",
    lotCreatedSuccess: "லாட் வெற்றிகரமாக உருவாக்கப்பட்டது! கீழே உள்ள மறுசுழற்சியாளர்களைத் தொடர்பு கொள்ளவும்.",
    findRecyclersTitle: "அருகிலுள்ள அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்கள்",
    findRecyclersSubheading: "GPS தூரத்தின் அடிப்படையில் வரிசைப்படுத்தப்பட்டது",
    detectingLocation: "GPS இருப்பிடத்தைக் கண்டறிகிறது...",
    useMyLocation: "இருப்பிடத்தைப் புதுப்பிக்கவும்",
    myLocation: "உங்கள் தற்போதைய இடம்",
    distanceKm: "கி.மீ தூரத்தில்",
    offeredRate: "வாங்கும் விலை: ₹",
    pickupAvailable: "நேரடி பிக்-அப் வசதி உண்டு",
    cpcbAuthorized: "CPCB / SPCB அங்கீகரிக்கப்பட்டது",
    chatAndNegotiate: "பேசி முடிவு செய்யுங்கள் (Chat)",
    directCall: "நேரடி அழைப்பு",
    safetyTitle: "மின்னணுக் கழிவு பாதுகாப்பு மற்றும் சுகாதார வழிகாட்டுதல்கள்",
    safetySubheading: "நச்சுப் புகையிலிருந்து பாதுகாக்க படங்களுடன் கூடிய குரல் எச்சரிக்கைகள்",
    playAudio: "குரல் வழிகாட்டலைக் கேளுங்கள்",
    stopAudio: "ஆடியோவை நிறுத்துங்கள்",
    materials: {
      "PCB (Printed Circuit Boards)": "மின்னணு சர்க்யூட் போர்டுகள் (PCB)",
      "Copper Wires/Cables": "செப்பு கம்பிகள் மற்றும் கேபிள்கள்",
      "Lead/Li-ion Batteries": "ஈயம் மற்றும் லித்தியம் பேட்டரிகள்",
      "CRT Glass & Monitors": "CRT தொலைக்காட்சி திரை கண்ணாடிகள்",
      "Electric Motors & Transformers": "மின்சார மோட்டார்கள் மற்றும் மின்மாற்றிகள்",
      "Mixed Rigid Plastics": "கலப்பு பிளாஸ்டிக் கழிவுகள்"
    },
    safetyCards: [
      {
        id: "cable_burning",
        title: "கம்பிகளை திறந்தவெளியில் எரிக்காதீர்கள்",
        hazard: "பிளாஸ்டிக் கம்பிகளை எரிப்பதால் புற்றுநோயை உண்டாக்கும் டையாக்சின் நச்சு வாயுக்கள் வெளியேறுகின்றன.",
        protocol: "கம்பி உரிக்கும் எளிய கருவிகளைப் பயன்படுத்துங்கள் அல்லது முழு கம்பியாக மறுசுழற்சியாளரிடம் கொடுங்கள்.",
        audioScript: "எச்சரிக்கை! மின் கம்பிகளை திறந்தவெளியில் எரிக்காதீர்கள். கம்பி எரிக்கும் போது வரும் நச்சுப் புகை நுரையீரலைத் தாக்கும் மற்றும் செம்பின் தரத்தைக் குறைக்கும்."
      },
      {
        id: "acid_leaching",
        title: "தங்கத்திற்காக அமிலத்தில் கழுவ வேண்டாம்",
        hazard: "நைட்ரிக் அமிலத்தில் சர்க்யூட் போர்டுகளை கொதிக்க வைப்பதால் கண் பார்வை பறிபோகும் மற்றும் நுரையீரல் சேதமடையும்.",
        protocol: "திறந்த பாத்திரங்களில் அமிலத்தைப் பயன்படுத்தாதீர்கள். முழு பலகைகளை அங்கீகரிக்கப்பட்ட மையத்தில் ஒப்படைக்கவும்.",
        audioScript: "அபாய எச்சரிக்கை! சர்க்யூட் போர்டுகளை அமிலத்தில் வேக வைக்காதீர்கள். நச்சு வாயு உயிருக்கே ஆபத்தானது. அங்கீகரிக்கப்பட்ட மறுசுழற்சி மையத்திற்கு அனுப்புங்கள்."
      },
      {
        id: "battery_hazard",
        title: "பேட்டரிகளை கவனமாக கையாளுங்கள்",
        hazard: "லித்தியம் பேட்டரிகளில் துளையிட்டால் தீப்பிடித்து வெடிக்கும் ஆபத்து உண்டு. ஈய பேட்டரிகளிலிருந்து அமிலம் கசியும்.",
        protocol: "உலர்ந்த மணல் பெட்டிகளில் சேமிக்கவும். சுத்தியலால் உடைக்காதீர்கள்.",
        audioScript: "பாதுகாப்பு அறிவுரை: பழைய பேட்டரிகளை சுத்தியலால் உடைக்காதீர்கள். தீ விபத்து ஏற்படலாம். உலர்ந்த பெட்டியில் தனியாக வையுங்கள்."
      },
      {
        id: "crt_implosion",
        title: "பழைய டிவி கண்ணாடியை உடைக்காதீர்கள்",
        hazard: "CRT குழாய்கள் உடைந்து வெடிக்கும் தன்மை கொண்டவை மற்றும் நச்சு பாஸ்பரஸ் தூள் உடலுக்கு பெரும் தீங்கு விளைவிக்கும்.",
        protocol: "டிவி கண்ணாடியை கல்லால் உடைக்காதீர்கள். துணியில் போர்த்தி பாதுகாப்பாக எடுத்துச் செல்லுங்கள்.",
        audioScript: "கவனம்: பழைய தொலைக்காட்சி கண்ணாடிகளை உடைக்காதீர்கள். கண்ணாடி சிதறி காயம் ஏற்படும் மற்றும் உள்ளிருக்கும் நச்சு தூள் விஷமானது. பாதுகாப்பாக ஒப்படைக்கவும்."
      }
    ],
    quickActions: {
      sendLotDetails: "லாட் விவரங்களை அனுப்பவும்",
      proposePrice: "விலை முன்மொழியுங்கள் (₹/கிலோ)",
      shareGps: "இருப்பிட GPS பகிரவும்",
      requestPickup: "வீட்டுக்கே வந்து எடுக்க கோருங்கள்"
    }
  }
};
