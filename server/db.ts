import fs from 'fs';
import path from 'path';
import {
  User,
  Material,
  PriceHistory,
  RecyclerFacility,
  Transaction,
  ChatMessage,
  Complaint,
  LegalCase,
  AuditLogEntry,
  SortingInspection,
  ScrapItem,
  PaymentDetails,
  PaymentMode,
  PaymentStatus,
  HouseholdPickupRequest,
  UserRole
} from '../src/types';
import { syncDocToFirestore, removeDocFromFirestore, seedFirestoreIfEmpty } from './firestore';

interface DatabaseData {
  users: (User & { password?: string })[];
  materials: Material[];
  price_history: PriceHistory[];
  recyclers: RecyclerFacility[];
  transactions: Transaction[];
  chats: ChatMessage[];
  complaints: Complaint[];
  legal_cases: LegalCase[];
  audit_logs: AuditLogEntry[];
  household_pickups: HouseholdPickupRequest[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'database.json');

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    category: 'PCB (Printed Circuit Boards)',
    subcategory: 'Server & Telecom Grade Motherboards',
    description: 'Gold-plated connectors, multilayer ceramic capacitors, BGA chips and ICs. High precious metal yield.',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    base_rate_per_kg: 340,
    danger_level: 'High'
  },
  {
    id: 'mat-2',
    category: 'Copper Wires/Cables',
    subcategory: 'Heavy Gauge Power & Telecom Cables',
    description: 'Electrolytic grade 99.9% bare and insulated copper conductors. Essential for industrial smelting.',
    image_url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=400&q=80',
    base_rate_per_kg: 580,
    danger_level: 'Medium'
  },
  {
    id: 'mat-3',
    category: 'Lead/Li-ion Batteries',
    subcategory: 'Telecom Backup & EV Pack Modules',
    description: 'Lithium cobalt oxide (LCO) & lead-acid cells. Highly flammable electrolyte requiring inert packaging.',
    image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
    base_rate_per_kg: 120,
    danger_level: 'Critical'
  },
  {
    id: 'mat-4',
    category: 'CRT Glass & Monitors',
    subcategory: 'Cathode Ray Tube Lead Funnels',
    description: 'Heavy leaded glass frits and neck sections from televisions and monochrome monitors.',
    image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80',
    base_rate_per_kg: 22,
    danger_level: 'High'
  },
  {
    id: 'mat-5',
    category: 'Electric Motors & Transformers',
    subcategory: 'Copper Wound Stators & Rotors',
    description: 'Clean electric induction motors with silicon steel laminations and enameled magnet copper wire.',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    base_rate_per_kg: 260,
    danger_level: 'Low'
  },
  {
    id: 'mat-6',
    category: 'Mixed Rigid Plastics',
    subcategory: 'High Impact Polystyrene (HIPS) & ABS',
    description: 'Computer tower bezels, monitor backs, printer frames and consumer electronic outer casings.',
    image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80',
    base_rate_per_kg: 38,
    danger_level: 'Low'
  }
];

const INITIAL_USERS: (User & { password?: string })[] = [
  {
    id: 'usr-scrapper-1',
    username: 'ramesh',
    password: 'password123',
    name: 'Ramesh Kumar',
    role: 'scrapper',
    location: 'Peenya Industrial Area, Bengaluru, Karnataka',
    phone: '+91 98450 12345',
    verified: true,
    aadhaar_last4: '8821',
    latitude: 13.0315,
    longitude: 77.5210,
    status: 'Active',
    created_at: '2026-06-10T08:00:00Z'
  },
  {
    id: 'usr-scrapper-2',
    username: 'suresh',
    password: 'password123',
    name: 'Suresh Patel',
    role: 'scrapper',
    location: 'Okhla Industrial Area, New Delhi',
    phone: '+91 98110 56789',
    verified: true,
    aadhaar_last4: '4190',
    latitude: 28.5355,
    longitude: 77.2730,
    status: 'Active',
    created_at: '2026-07-15T09:30:00Z'
  },
  {
    id: 'usr-scrapper-3',
    username: 'anand',
    password: 'password123',
    name: 'Anand Gowda',
    role: 'scrapper',
    location: 'Peenya 3rd Phase, Bengaluru, Karnataka',
    phone: '+91 98450 99881',
    verified: true,
    aadhaar_last4: '5512',
    latitude: 13.0240,
    longitude: 77.5140,
    status: 'Active',
    created_at: '2026-08-01T11:20:00Z'
  },
  {
    id: 'usr-scrapper-4',
    username: 'karthik',
    password: 'password123',
    name: 'Karthik R',
    role: 'scrapper',
    location: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    phone: '+91 94440 22334',
    verified: true,
    aadhaar_last4: '7721',
    latitude: 13.0820,
    longitude: 80.1580,
    status: 'Active',
    created_at: '2026-08-12T14:10:00Z'
  },
  {
    id: 'usr-recycler-1',
    username: 'ecorecycle',
    password: 'password123',
    name: 'EcoRecycle Solutions Pvt Ltd',
    role: 'recycler',
    location: 'Plot 42, 4th Cross, Peenya 2nd Phase, Bengaluru',
    phone: '+91 80 2839 4400',
    verified: true,
    cpcb_number: 'CPCB/EW/KAR/2024/7742',
    latitude: 13.0285,
    longitude: 77.5192,
    status: 'Active',
    created_at: '2026-05-18T10:00:00Z'
  },
  {
    id: 'usr-recycler-2',
    username: 'greenmetal',
    password: 'password123',
    name: 'GreenMetals Authorized Recyclers',
    role: 'recycler',
    location: 'Phase-1, Okhla Industrial Area, New Delhi',
    phone: '+91 11 4160 8822',
    verified: true,
    cpcb_number: 'CPCB/EW/DEL/2023/5019',
    latitude: 28.5298,
    longitude: 77.2711,
    status: 'Active',
    created_at: '2026-06-01T11:00:00Z'
  },
  {
    id: 'usr-recycler-3',
    username: 'chennaicircular',
    password: 'password123',
    name: 'Chennai Circular Urban Aggregators',
    role: 'recycler',
    location: 'SIDCO Industrial Estate, Ambattur, Chennai',
    phone: '+91 44 2625 3311',
    verified: true,
    cpcb_number: 'TNPCB/EW/CHN/2025/1108',
    latitude: 13.0878,
    longitude: 80.1636,
    status: 'Active',
    created_at: '2026-07-02T16:00:00Z'
  },
  {
    id: 'usr-recycler-unauth-1',
    username: 'peenyascrap',
    password: 'password123',
    name: 'Peenya Scrap Yard (Informal / Unregistered)',
    role: 'recycler',
    location: 'Shed 9, Near Peenya Slum Cluster, Bengaluru',
    phone: '+91 98459 00112',
    verified: false,
    latitude: 13.0335,
    longitude: 77.5240,
    status: 'Suspended',
    suspension_reason: 'Operating without CPCB/SPCB Consent to Establish (CTE). Non-compliant backyard operation.',
    created_at: '2026-08-20T09:00:00Z'
  },
  {
    id: 'usr-recycler-pending-1',
    username: 'sahyadrirecycling',
    password: 'password123',
    name: 'Sahyadri Circular Refining Facility',
    role: 'recycler',
    location: 'MIDC Bhosari, Pune, Maharashtra',
    phone: '+91 20 2712 8800',
    verified: false,
    cpcb_number: 'MPCB/EW/PUN/2025/9012',
    latitude: 18.6298,
    longitude: 73.7997,
    status: 'Pending Admin Verification',
    created_at: '2026-09-02T15:20:00Z'
  },
  {
    id: 'usr-admin-1',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. Ananya Sharma',
    role: 'admin',
    location: 'CPCB E-Waste Oversight Directorate, New Delhi',
    phone: '+91 11 2230 7000',
    verified: true,
    cpcb_number: 'GOV-IN-CPCB-AUDITOR-01',
    latitude: 28.6139,
    longitude: 77.2090,
    status: 'Active',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-household-1',
    username: 'priya',
    password: 'password123',
    name: 'Priya Sharma (Household)',
    role: 'household',
    location: 'Indiranagar, Bengaluru, Karnataka',
    phone: '+91 98450 77665',
    verified: true,
    latitude: 12.9784,
    longitude: 77.6408,
    status: 'Active',
    created_at: '2026-08-10T10:00:00Z',
    sales_frequency: 'periodical'
  }
];

const INITIAL_HOUSEHOLD_PICKUPS: HouseholdPickupRequest[] = [
  {
    id: 'hh-pickup-101',
    household_id: 'usr-household-1',
    household_name: 'Priya Sharma (Household)',
    household_phone: '+91 98450 77665',
    household_address: 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
    household_gps: { latitude: 12.9784, longitude: 77.6408 },
    scrapper_id: 'usr-scrapper-1',
    scrapper_name: 'Ramesh Kumar',
    scrapper_phone: '+91 98450 12345',
    category: 'Home Appliances & Broken Electronics',
    items_description: '1 Old Microwave Oven, 2 Broken Ceiling Fans, 1 Tablet with swollen battery, bundle of copper cables',
    estimated_weight_kg: 18,
    actual_weight_kg: 19.5,
    offered_rate_per_kg: 48,
    total_payout: 936,
    pickup_date: '2026-09-24',
    preferred_time_slot: 'Morning (10:00 AM - 1:00 PM)',
    status: 'COMPLETED',
    scrapper_resale_status: 'SOLD_TO_CIRCULAR_STREAM',
    payment_mode: 'UPI',
    payment_reference: 'UPI/2026/0924/883921',
    notes: 'Scrapper arrived with certified digital scale, weighed at doorstep, paid via UPI.',
    created_at: '2026-09-24T09:15:00Z',
    completed_at: '2026-09-24T11:45:00Z'
  },
  {
    id: 'hh-pickup-102',
    household_id: 'usr-household-1',
    household_name: 'Priya Sharma (Household)',
    household_phone: '+91 98450 77665',
    household_address: 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
    household_gps: { latitude: 12.9784, longitude: 77.6408 },
    scrapper_id: 'usr-scrapper-1',
    scrapper_name: 'Ramesh Kumar',
    scrapper_phone: '+91 98450 12345',
    category: 'Smartphones & Computer Parts',
    items_description: '2 Dead Android phones, 1 Old Laptop, 3 Charger cords, 1 Desktop CPU cabinet',
    estimated_weight_kg: 12,
    pickup_date: '2026-09-27',
    preferred_time_slot: 'Afternoon (2:00 PM - 5:00 PM)',
    status: 'ACCEPTED',
    scrapper_resale_status: 'COLLECTED_AT_DOORSTEP',
    payment_mode: 'UPI',
    notes: 'Ramesh confirmed pickup for Sunday afternoon.',
    created_at: '2026-09-25T14:30:00Z'
  }
];

const INITIAL_RECYCLERS: RecyclerFacility[] = [
  {
    id: 'rec-1',
    user_id: 'usr-recycler-1',
    facility_name: 'EcoRecycle Solutions Pvt Ltd',
    latitude: 13.0285,
    longitude: 77.5192,
    cpcb_auth_number: 'CPCB/EW/KAR/2024/7742',
    is_authorized: true,
    offered_rates_json: {
      'PCB (Printed Circuit Boards)': 355,
      'Copper Wires/Cables': 595,
      'Lead/Li-ion Batteries': 125,
      'CRT Glass & Monitors': 24,
      'Electric Motors & Transformers': 270,
      'Mixed Rigid Plastics': 40
    },
    pickup_available: true,
    service_radius_km: 35,
    contact_phone: '+91 80 2839 4400',
    address: 'Plot 42, 4th Cross, Peenya 2nd Phase, Bengaluru, Karnataka 560058'
  },
  {
    id: 'rec-2',
    user_id: 'usr-recycler-2',
    facility_name: 'GreenMetals Authorized Recyclers',
    latitude: 28.5298,
    longitude: 77.2711,
    cpcb_auth_number: 'CPCB/EW/DEL/2023/5019',
    is_authorized: true,
    offered_rates_json: {
      'PCB (Printed Circuit Boards)': 345,
      'Copper Wires/Cables': 590,
      'Lead/Li-ion Batteries': 118,
      'CRT Glass & Monitors': 20,
      'Electric Motors & Transformers': 265,
      'Mixed Rigid Plastics': 38
    },
    pickup_available: true,
    service_radius_km: 40,
    contact_phone: '+91 11 4160 8822',
    address: 'Phase-1, Okhla Industrial Area, New Delhi, 110020'
  },
  {
    id: 'rec-3',
    user_id: 'usr-recycler-3',
    facility_name: 'Chennai Circular Urban Aggregators',
    latitude: 13.0878,
    longitude: 80.1636,
    cpcb_auth_number: 'TNPCB/EW/CHN/2025/1108',
    is_authorized: true,
    offered_rates_json: {
      'PCB (Printed Circuit Boards)': 350,
      'Copper Wires/Cables': 585,
      'Lead/Li-ion Batteries': 122,
      'CRT Glass & Monitors': 22,
      'Electric Motors & Transformers': 255,
      'Mixed Rigid Plastics': 42
    },
    pickup_available: false,
    service_radius_km: 25,
    contact_phone: '+91 44 2625 3311',
    address: 'SIDCO Industrial Estate, Ambattur, Chennai, Tamil Nadu 600058'
  },
  {
    id: 'rec-4',
    user_id: 'usr-recycler-4',
    facility_name: 'Maharashtra Green E-Waste Recyclers Pvt Ltd',
    latitude: 19.0402,
    longitude: 72.8566,
    cpcb_auth_number: 'MPCB/EW/MUM/2024/3391',
    is_authorized: true,
    offered_rates_json: {
      'PCB (Printed Circuit Boards)': 360,
      'Copper Wires/Cables': 600,
      'Lead/Li-ion Batteries': 126,
      'CRT Glass & Monitors': 25,
      'Electric Motors & Transformers': 275,
      'Mixed Rigid Plastics': 42
    },
    pickup_available: true,
    service_radius_km: 45,
    contact_phone: '+91 22 2778 5544',
    address: 'Plot 18, Dharavi / Kurla Recycling Cluster, Mumbai, Maharashtra 400017'
  },
  {
    id: 'rec-unauth-1',
    user_id: 'usr-recycler-unauth-1',
    facility_name: 'Peenya Scrap Yard (Informal / Unregistered)',
    latitude: 13.0335,
    longitude: 77.5240,
    cpcb_auth_number: '',
    is_authorized: false,
    offered_rates_json: {
      'PCB (Printed Circuit Boards)': 300,
      'Copper Wires/Cables': 530,
      'Lead/Li-ion Batteries': 95,
      'CRT Glass & Monitors': 15,
      'Electric Motors & Transformers': 230,
      'Mixed Rigid Plastics': 28
    },
    pickup_available: false,
    service_radius_km: 15,
    contact_phone: '+91 98459 00112',
    address: 'Shed 9, Near Peenya Slum Cluster, Bengaluru'
  }
];

const INITIAL_PRICE_HISTORY: PriceHistory[] = [
  {
    id: 'ph-1',
    category: 'PCB (Printed Circuit Boards)',
    location_zone: 'Bengaluru Zone (SPCB)',
    buying_price: 345,
    selling_price: 385,
    date_timestamp: '2026-08-15T10:00:00Z',
    source_type: 'Mandatory SPCB Rate Ledger'
  },
  {
    id: 'ph-2',
    category: 'PCB (Printed Circuit Boards)',
    location_zone: 'Delhi NCR Zone (DPCC)',
    buying_price: 340,
    selling_price: 375,
    date_timestamp: '2026-08-20T10:00:00Z',
    source_type: 'Mandatory SPCB Rate Ledger'
  },
  {
    id: 'ph-3',
    category: 'Copper Wires/Cables',
    location_zone: 'National Benchmark',
    buying_price: 585,
    selling_price: 630,
    date_timestamp: '2026-08-25T14:30:00Z',
    source_type: 'MCX Metal Exchange Feed'
  },
  {
    id: 'ph-4',
    category: 'Lead/Li-ion Batteries',
    location_zone: 'Bengaluru Zone (SPCB)',
    buying_price: 122,
    selling_price: 140,
    date_timestamp: '2026-08-28T09:15:00Z',
    source_type: 'BPR Battery Registry'
  },
  {
    id: 'ph-5',
    category: 'Electric Motors & Transformers',
    location_zone: 'Mumbai Metropolitan (MPCB)',
    buying_price: 265,
    selling_price: 295,
    date_timestamp: '2026-09-01T11:00:00Z',
    source_type: 'Secondary Metal Bulletin'
  },
  {
    id: 'ph-6',
    category: 'PCB (Printed Circuit Boards)',
    location_zone: 'National Benchmark',
    buying_price: 355,
    selling_price: 395,
    date_timestamp: '2026-09-03T10:00:00Z',
    source_type: 'CPCB EPR Portal Benchmark'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    lot_reference_id: '#LOT-2026-1041',
    scrapper_id: 'usr-scrapper-1',
    scrapper_name: 'Ramesh Kumar',
    recycler_id: 'rec-1',
    recycler_name: 'EcoRecycle Solutions Pvt Ltd',
    category: 'PCB (Printed Circuit Boards)',
    fulfillment_type: 'PICKUP',
    scraps_items: [
      {
        id: 'sc-101-1',
        name: 'Multilayer Telecom Motherboards',
        category: 'PCB (Printed Circuit Boards)',
        declared_weight_kg: 30.0,
        verified_weight_kg: 29.5,
        rate_per_kg: 380,
        estimated_amount: 11210,
        hazard_level: 'MEDIUM',
        condition: 'Intact with gold-plated contact fingers'
      },
      {
        id: 'sc-101-2',
        name: 'Standard Motherboard Scrap & BGA Arrays',
        category: 'PCB (Printed Circuit Boards)',
        declared_weight_kg: 18.0,
        verified_weight_kg: 17.3,
        rate_per_kg: 312,
        estimated_amount: 5404,
        hazard_level: 'LOW',
        condition: 'Depopulated boards with chipsets'
      }
    ],
    estimated_weight: 48.0,
    declared_weight: 48.0,
    actual_weight: 46.8,
    verified_weight: 46.8,
    offered_rate_per_kg: 355,
    final_payout: 16614,
    collection_gps: {
      latitude: 13.0322,
      longitude: 77.5218,
      address: 'Near Peenya 2nd Stage Depot, Bengaluru'
    },
    status: 'COMPLETED',
    sorting_breakdown: {
      required_kg: 46.8,
      unrequired_kg: 1.2,
      contamination_deduction: 426,
      notes: '1.2 kg broken resin casings removed. High precious metal yield verified on calibrated scale.'
    },
    payment_mode: 'UPI_DIGITAL',
    payment_status: 'PAID',
    payment_details: {
      payment_mode: 'UPI_DIGITAL',
      amount: 16614,
      status: 'PAID',
      paid_at: '2026-09-01T14:22:00Z',
      upi_id: 'ramesh.kumar@oksbi',
      upi_txn_id: 'UPI-TXN-2026-99381',
      upi_app: 'Google Pay'
    },
    paid_at: '2026-09-01T14:22:00Z',
    handover_timestamp: '2026-09-01T14:22:00Z',
    created_at: '2026-09-01T10:15:00Z',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    notes: 'Certified compliant handover under CPCB EPR rules via UPI Instant Payout.',
    weight_confirmed_by_scrapper: true
  },
  {
    id: 'tx-102',
    lot_reference_id: '#LOT-2026-1042',
    scrapper_id: 'usr-scrapper-1',
    scrapper_name: 'Ramesh Kumar',
    recycler_id: 'rec-1',
    recycler_name: 'EcoRecycle Solutions Pvt Ltd',
    category: 'Copper Wires/Cables',
    fulfillment_type: 'DELIVERY',
    scraps_items: [
      {
        id: 'sc-102-1',
        name: 'Millberry Bright Stripped Copper Wire',
        category: 'Copper Wires/Cables',
        declared_weight_kg: 35.0,
        verified_weight_kg: 34.2,
        rate_per_kg: 595,
        estimated_amount: 20349,
        hazard_level: 'LOW',
        condition: 'Clean stripped conductor wire 99.9% purity'
      }
    ],
    estimated_weight: 35.0,
    declared_weight: 35.0,
    actual_weight: 34.2,
    verified_weight: 34.2,
    offered_rate_per_kg: 595,
    final_payout: 20349,
    collection_gps: {
      latitude: 13.0298,
      longitude: 77.5185,
      address: 'Outer Ring Road, Peenya junction, Bengaluru'
    },
    status: 'PAID',
    sorting_breakdown: {
      required_kg: 34.2,
      unrequired_kg: 0.8,
      contamination_deduction: 476,
      notes: 'Clean stripped cable batch. High density bright copper wire confirmed.'
    },
    payment_mode: 'BANK_TRANSFER',
    payment_status: 'PAID',
    payment_details: {
      payment_mode: 'BANK_TRANSFER',
      amount: 20349,
      status: 'PAID',
      paid_at: '2026-09-02T16:45:00Z',
      bank_account_last4: '9812',
      bank_ref_no: 'NEFT-P26090288129'
    },
    paid_at: '2026-09-02T16:45:00Z',
    handover_timestamp: '2026-09-02T16:45:00Z',
    created_at: '2026-09-02T11:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=400&q=80',
    notes: 'Instant bank transfer executed. Receipt generated.',
    weight_confirmed_by_scrapper: true
  },
  {
    id: 'tx-103',
    lot_reference_id: '#LOT-2026-1043',
    scrapper_id: 'usr-scrapper-2',
    scrapper_name: 'Suresh Patel',
    recycler_id: 'rec-2',
    recycler_name: 'GreenMetals Authorized Recyclers',
    category: 'Lead/Li-ion Batteries',
    fulfillment_type: 'PICKUP',
    scraps_items: [
      {
        id: 'sc-103-1',
        name: 'Automotive Sealed Lead-Acid (SLA) Cells',
        category: 'Lead/Li-ion Batteries',
        declared_weight_kg: 45.0,
        verified_weight_kg: 43.5,
        rate_per_kg: 118,
        estimated_amount: 5133,
        hazard_level: 'HIGH',
        condition: 'Acid-sealed plastic casing intact'
      },
      {
        id: 'sc-103-2',
        name: 'UPS Telecom Lithium & Inverter Modules',
        category: 'Lead/Li-ion Batteries',
        declared_weight_kg: 15.0,
        verified_weight_kg: 14.0,
        rate_per_kg: 118,
        estimated_amount: 1652,
        hazard_level: 'HIGH',
        condition: 'Discharged safely with tape over terminals'
      }
    ],
    estimated_weight: 60.0,
    declared_weight: 60.0,
    actual_weight: 57.5,
    verified_weight: 57.5,
    offered_rate_per_kg: 118,
    final_payout: 6785,
    collection_gps: {
      latitude: 28.5312,
      longitude: 77.2745,
      address: 'Okhla Phase 1 Gate 4, New Delhi'
    },
    status: 'COMPLETED',
    sorting_breakdown: {
      required_kg: 57.5,
      unrequired_kg: 2.5,
      contamination_deduction: 295,
      notes: '2.5kg dry sulfur and cracked casing fragments separated.'
    },
    payment_mode: 'CASH_ON_PICKUP',
    payment_status: 'PAID',
    payment_details: {
      payment_mode: 'CASH_ON_PICKUP',
      amount: 6785,
      status: 'PAID',
      paid_at: '2026-09-03T10:15:00Z',
      cash_collected_by: 'Driver Vikram Singh (Truck DL-1L-8821)',
      cash_receipt_no: 'COP-REC-2026-8841',
      cash_tendered: 6800,
      cash_notes: 'Spot physical cash handed to scrapper upon scale verification at scrap depot yard.'
    },
    paid_at: '2026-09-03T10:15:00Z',
    handover_timestamp: '2026-09-03T10:15:00Z',
    created_at: '2026-09-03T09:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
    notes: 'Cash on pickup settled by logistics team at collection point.',
    weight_confirmed_by_scrapper: true
  },
  {
    id: 'tx-104',
    lot_reference_id: '#LOT-2026-1044',
    scrapper_id: 'usr-scrapper-1',
    scrapper_name: 'Ramesh Kumar',
    recycler_id: 'rec-1',
    recycler_name: 'EcoRecycle Solutions Pvt Ltd',
    category: 'Electric Motors & Transformers',
    fulfillment_type: 'DELIVERY',
    scraps_items: [
      {
        id: 'sc-104-1',
        name: 'Copper Winding Induction Motors',
        category: 'Electric Motors & Transformers',
        declared_weight_kg: 85.0,
        rate_per_kg: 270,
        estimated_amount: 22950,
        hazard_level: 'LOW',
        condition: 'Heavy industrial grade cast iron with copper stators'
      }
    ],
    estimated_weight: 85.0,
    declared_weight: 85.0,
    actual_weight: null,
    verified_weight: null,
    offered_rate_per_kg: 270,
    final_payout: null,
    collection_gps: {
      latitude: 13.0305,
      longitude: 77.5201,
      address: 'Peenya Industrial Estate, Bengaluru'
    },
    status: 'PICKUP_SCHEDULED',
    payment_mode: 'CASH_ON_DELIVERY',
    payment_status: 'PENDING',
    payment_details: {
      payment_mode: 'CASH_ON_DELIVERY',
      amount: 22950,
      status: 'PENDING',
      cash_receipt_no: 'COD-SLIP-7721',
      cash_notes: 'Cash payout queued at recycler gate weighbridge cashier desk.'
    },
    created_at: '2026-09-03T17:10:00Z',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    notes: 'Recycler flatbed truck dispatched for pickup on 2026-09-05 at 11:30 AM.'
  },
  {
    id: 'tx-105',
    lot_reference_id: '#LOT-2026-1045',
    scrapper_id: 'usr-scrapper-3',
    scrapper_name: 'Anand Gowda',
    recycler_id: 'rec-1',
    recycler_name: 'EcoRecycle Solutions Pvt Ltd',
    category: 'PCB (Printed Circuit Boards)',
    fulfillment_type: 'PICKUP',
    scraps_items: [
      {
        id: 'sc-105-1',
        name: 'High Grade Telecom Sever Motherboards',
        category: 'PCB (Printed Circuit Boards)',
        declared_weight_kg: 25.0,
        verified_weight_kg: 25.0,
        rate_per_kg: 355,
        estimated_amount: 8875,
        hazard_level: 'MEDIUM',
        condition: 'Gold finger edge connectors undamaged'
      }
    ],
    estimated_weight: 25.0,
    declared_weight: 25.0,
    actual_weight: 25.0,
    verified_weight: 25.0,
    offered_rate_per_kg: 355,
    final_payout: 8875,
    collection_gps: {
      latitude: 13.0240,
      longitude: 77.5140,
      address: 'Peenya 3rd Phase, Bengaluru'
    },
    status: 'COMPLETED',
    payment_mode: 'OFFLINE_PAYMENT',
    payment_status: 'PAID',
    payment_details: {
      payment_mode: 'OFFLINE_PAYMENT',
      amount: 8875,
      status: 'PAID',
      paid_at: '2026-09-04T08:30:00Z',
      offline_voucher_no: 'OFF-VCHR-2026-4412',
      offline_mode: 'PHYSICAL_SLIP',
      offline_verified_by: 'Inspector Raghavan K. (CPCB ID #REC-BLR-091)',
      offline_witness_contact: 'Peenya Scrappers Association Dispatcher',
      offline_notes: 'Physical triplicate receipt stamped and signed at collection point under zero-network conditions.',
      offline_synced_at: '2026-09-04T09:00:00Z'
    },
    paid_at: '2026-09-04T08:30:00Z',
    handover_timestamp: '2026-09-04T08:30:00Z',
    created_at: '2026-09-04T07:15:00Z',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    notes: 'Offline Payment voucher verified and reconciled into digital database.',
    weight_confirmed_by_scrapper: true
  },
  {
    id: 'tx-106',
    lot_reference_id: '#LOT-2026-1046',
    scrapper_id: 'usr-scrapper-2',
    scrapper_name: 'Suresh Patel',
    recycler_id: 'rec-unauth-1',
    recycler_name: 'Peenya Scrap Yard (Informal / Unregistered)',
    category: 'Mixed Rigid Plastics',
    fulfillment_type: 'DELIVERY',
    scraps_items: [
      {
        id: 'sc-106-1',
        name: 'CRT Monitor Cabinets & Rigid Housings',
        category: 'Mixed Rigid Plastics',
        declared_weight_kg: 120.0,
        verified_weight_kg: 80.0,
        rate_per_kg: 30,
        estimated_amount: 2400,
        hazard_level: 'LOW',
        condition: 'Mixed ABS/HIPS plastics'
      }
    ],
    estimated_weight: 120.0,
    declared_weight: 120.0,
    actual_weight: 80.0,
    verified_weight: 80.0,
    offered_rate_per_kg: 30,
    final_payout: null,
    collection_gps: {
      latitude: 28.5355,
      longitude: 77.2730,
      address: 'Okhla Industrial Area, New Delhi'
    },
    status: 'DISPUTED',
    payment_mode: 'UPI_DIGITAL',
    payment_status: 'DISPUTED',
    created_at: '2026-09-03T11:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80',
    notes: 'Disputed: Informal dealer arbitrarily deducted 40kg without tare calibration.',
    weight_disputed: true,
    dispute_reason: 'Dealer deducted 40kg unilaterally claiming moisture in monitor plastics. Complaint filed with CPCB portal.'
  }
];

const INITIAL_CHATS: ChatMessage[] = [
  {
    id: 'msg-1',
    lot_reference_id: '#LOT-2026-1044',
    sender_id: 'usr-scrapper-1',
    sender_name: 'Ramesh Kumar',
    sender_role: 'scrapper',
    receiver_id: 'usr-recycler-1',
    message: 'Namaste EcoRecycle team. I have 85kg of intact induction motors with copper windings ready in Peenya. Can you send pickup?',
    timestamp: '2026-09-03T17:15:00Z',
    metadata: {
      type: 'lot_ref',
      data: { lot_id: '#LOT-2026-1044', weight: 85, category: 'Electric Motors & Transformers' }
    }
  },
  {
    id: 'msg-2',
    lot_reference_id: '#LOT-2026-1044',
    sender_id: 'usr-recycler-1',
    sender_name: 'EcoRecycle Solutions Pvt Ltd',
    sender_role: 'recycler',
    receiver_id: 'usr-scrapper-1',
    message: 'Hello Ramesh! We reviewed your lot. Our standard rate for copper wound motors is ₹270/kg. We can arrange doorstep vehicle pickup tomorrow morning at 11:30 AM.',
    timestamp: '2026-09-03T17:22:00Z',
    metadata: {
      type: 'rate_offer',
      data: { rate: 270, pickup: true }
    }
  },
  {
    id: 'msg-3',
    lot_reference_id: '#LOT-2026-1044',
    sender_id: 'usr-scrapper-1',
    sender_name: 'Ramesh Kumar',
    sender_role: 'scrapper',
    receiver_id: 'usr-recycler-1',
    message: 'Agreed! Sharing my exact collection coordinates. Please ensure calibrated digital scale is on board.',
    timestamp: '2026-09-03T17:25:00Z',
    metadata: {
      type: 'gps_coords',
      data: { latitude: 13.0305, longitude: 77.5201, address: 'Peenya Industrial Estate' }
    }
  }
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-2026-001',
    complainant_id: 'usr-scrapper-1',
    complainant_name: 'Ramesh Kumar',
    complainant_role: 'scrapper',
    respondent_id: 'rec-1',
    respondent_name: 'EcoRecycle Solutions Pvt Ltd',
    respondent_role: 'recycler',
    transaction_id: 'tx-101',
    lot_reference_id: '#LOT-2026-1041',
    type: 'Under-weighing',
    description: 'Recycler digital scale deducted 1.2kg citing resin casings, but mechanical tare was not calibrated in front of me.',
    status: 'Action Taken',
    created_at: '2026-09-02T10:00:00Z',
    admin_notes: 'Recycler provided XRF calibration certificate. Deduction was justified within 2.5% tolerance. Reconciled with scrapper.',
    resolution_summary: 'XRF calibration verified. Recycler added ₹200 goodwill incentive.'
  },
  {
    id: 'cmp-2026-002',
    complainant_id: 'usr-scrapper-2',
    complainant_name: 'Suresh Patel',
    complainant_role: 'scrapper',
    respondent_id: 'rec-unauth-1',
    respondent_name: 'Peenya Scrap Yard (Informal / Unregistered)',
    respondent_role: 'recycler',
    transaction_id: 'tx-106',
    lot_reference_id: '#LOT-2026-1046',
    type: 'Price manipulation',
    description: 'Informal trader offered ₹340/kg over phone, but on arrival slashed rate to ₹290/kg alleging contamination without inspection.',
    status: 'Escalated',
    created_at: '2026-09-03T15:30:00Z',
    admin_notes: 'Unregistered facility operating without CPCB/SPCB consent to operate. Escalating to SPCB field enforcement squad.',
    resolution_summary: 'Referred to State Pollution Control Board for surprise inspection under Rule 14 of E-Waste 2022.'
  },
  {
    id: 'cmp-2026-003',
    complainant_id: 'usr-recycler-1',
    complainant_name: 'EcoRecycle Solutions Pvt Ltd',
    complainant_role: 'recycler',
    respondent_id: 'usr-scrapper-3',
    respondent_name: 'Anand Gowda',
    respondent_role: 'scrapper',
    type: 'Unsafe conduct',
    description: 'Scrap lot contained burnt lead wire remnants in violation of non-burning protocol. Requires safety re-training.',
    status: 'Under Review',
    created_at: '2026-09-04T08:45:00Z',
    admin_notes: 'Collector flagged for mandatory audio safety refresher course.'
  }
];

const INITIAL_LEGAL_CASES: LegalCase[] = [
  {
    id: 'leg-2026-101',
    case_number: 'CPCB/LEGAL/EW/2026/042',
    complaint_id: 'cmp-2026-002',
    complainant_name: 'Suresh Patel (via CPCB Directorate)',
    respondent_name: 'Peenya Scrap Yard (Informal / Unregistered)',
    case_type: 'unauthorized_processing',
    status: 'Referred to Authority',
    created_at: '2026-09-04T12:00:00Z',
    hearing_date: '2026-09-25',
    notes: 'Illegal secondary smelting and acid immersion operation without CPCB EPR authorization. Notice issued under Section 5 of Environment (Protection) Act 1986.',
    documents: [
      { name: 'SPCB_Inspection_Summons_Order_42.pdf', url: '#', date: '2026-09-04' },
      { name: 'Ground_GPS_Geotagged_Evidence.pdf', url: '#', date: '2026-09-03' }
    ]
  }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    admin_id: 'usr-admin-1',
    admin_name: 'Dr. Ananya Sharma',
    action: 'VERIFIED_RECYCLER_CPCB',
    target_user_id: 'usr-recycler-1',
    target_user_name: 'EcoRecycle Solutions Pvt Ltd',
    reason: 'Verified against CPCB Central Registry: CPCB/EW/KAR/2024/7742. Valid until 2028.',
    timestamp: '2026-08-20T11:00:00Z'
  },
  {
    id: 'aud-002',
    admin_id: 'usr-admin-1',
    admin_name: 'Dr. Ananya Sharma',
    action: 'BROADCAST_BASE_RATES',
    target_user_id: 'ALL_CHANNELS',
    target_user_name: 'National Commodity Board',
    reason: 'Updated Copper Wires base rate to ₹580/kg following London Metal Exchange (LME) rally.',
    timestamp: '2026-08-28T14:30:00Z'
  },
  {
    id: 'aud-003',
    admin_id: 'usr-admin-1',
    admin_name: 'Dr. Ananya Sharma',
    action: 'ESCALATED_LEGAL_CASE',
    target_user_id: 'usr-recycler-unauth-1',
    target_user_name: 'Peenya Scrap Yard (Informal)',
    reason: 'Initiated legal action for non-compliance with E-Waste Management Rules 2022 (Unauthorized backyard recycling).',
    timestamp: '2026-09-04T12:15:00Z'
  }
];

class DatabaseStore {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadFromDisk();
    // Seed and sync Firestore if empty
    seedFirestoreIfEmpty({
      materials: this.data.materials,
      users: this.data.users,
      recyclers: this.data.recyclers,
      transactions: this.data.transactions,
      complaints: this.data.complaints
    }).catch(err => console.warn('[Firestore] Seed init error:', err));
  }

  private loadFromDisk(): DatabaseData {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const users: (User & { password?: string })[] = parsed.users || INITIAL_USERS;

        // Ensure users have latitude & longitude & status populated
        users.forEach(u => {
          if (!u.latitude || !u.longitude) {
            const found = INITIAL_USERS.find(iu => iu.id === u.id || iu.username === u.username);
            if (found && found.latitude && found.longitude) {
              u.latitude = found.latitude;
              u.longitude = found.longitude;
            } else if (u.role === 'scrapper') {
              u.latitude = 13.0315 + (Math.random() - 0.5) * 0.02;
              u.longitude = 77.5210 + (Math.random() - 0.5) * 0.02;
            } else if (u.role === 'recycler') {
              u.latitude = 13.0285 + (Math.random() - 0.5) * 0.02;
              u.longitude = 77.5192 + (Math.random() - 0.5) * 0.02;
            } else {
              u.latitude = 28.6139;
              u.longitude = 77.2090;
            }
          }
          if (!u.status) u.status = 'Active';
        });

        // Ensure additional demo users exist if not present
        INITIAL_USERS.forEach(iu => {
          if (!users.some(u => u.id === iu.id)) {
            users.push({ ...iu });
          }
        });

        const recyclers: RecyclerFacility[] = parsed.recyclers || [];
        INITIAL_RECYCLERS.forEach(ir => {
          if (!recyclers.some(r => r.id === ir.id)) {
            recyclers.push({ ...ir });
          }
        });

        return {
          users,
          materials: parsed.materials || INITIAL_MATERIALS,
          price_history: parsed.price_history || INITIAL_PRICE_HISTORY,
          recyclers,
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          chats: parsed.chats || INITIAL_CHATS,
          complaints: parsed.complaints || INITIAL_COMPLAINTS,
          legal_cases: parsed.legal_cases || INITIAL_LEGAL_CASES,
          audit_logs: parsed.audit_logs || INITIAL_AUDIT_LOGS,
          household_pickups: parsed.household_pickups || INITIAL_HOUSEHOLD_PICKUPS
        };
      }
    } catch (err) {
      console.warn('Could not read existing database.json, initializing defaults.', err);
    }

    const defaultData: DatabaseData = {
      users: INITIAL_USERS,
      materials: INITIAL_MATERIALS,
      price_history: INITIAL_PRICE_HISTORY,
      recyclers: INITIAL_RECYCLERS,
      transactions: INITIAL_TRANSACTIONS,
      chats: INITIAL_CHATS,
      complaints: INITIAL_COMPLAINTS,
      legal_cases: INITIAL_LEGAL_CASES,
      audit_logs: INITIAL_AUDIT_LOGS,
      household_pickups: INITIAL_HOUSEHOLD_PICKUPS
    };
    this.saveToDisk(defaultData);
    return defaultData;
  }

  private saveToDisk(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database.json:', err);
    }
  }

  // Users
  getUsers() {
    return this.data.users.map(({ password, ...u }) => u);
  }

  findUserByUsername(username: string) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  findUserByPhone(phone: string) {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length < 10) return null;
    return this.data.users.find(u => {
      if (!u.phone) return false;
      const uClean = u.phone.replace(/\D/g, '').slice(-10);
      return uClean === clean;
    });
  }

  findUserById(id: string) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  createUser(user: User & { password?: string }) {
    this.data.users.push(user);
    this.saveToDisk();
    const { password, ...safeUser } = user;
    syncDocToFirestore('users', user.id, safeUser);
    return safeUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
      this.saveToDisk();
      const { password, ...safe } = user;
      syncDocToFirestore('users', user.id, safe);
      return safe;
    }
    return null;
  }

  updateUserVerification(userId: string, verified: boolean, cpcbNumber?: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.verified = verified;
      if (cpcbNumber !== undefined) user.cpcb_number = cpcbNumber;
      this.saveToDisk();
      const { password, ...safe } = user;
      syncDocToFirestore('users', user.id, safe);
      return safe;
    }
    return null;
  }

  updateUserStatus(userId: string, status: 'Active' | 'Pending Admin Verification' | 'Suspended', reason?: string, adminUser?: { id: string; name: string }) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      if (reason) user.suspension_reason = reason;
      if (status === 'Active') delete user.suspension_reason;

      // Log in audit trail
      if (adminUser) {
        this.createAuditLog({
          admin_id: adminUser.id,
          admin_name: adminUser.name,
          action: `USER_STATUS_${status.toUpperCase()}`,
          target_user_id: user.id,
          target_user_name: user.name,
          reason: reason || `Updated status to ${status}`
        });
      }

      this.saveToDisk();
      const { password, ...safe } = user;
      syncDocToFirestore('users', user.id, safe);
      return safe;
    }
    return null;
  }

  updateUserLocation(userId: string, latitude: number, longitude: number, locationName?: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.latitude = latitude;
      user.longitude = longitude;
      if (locationName) user.location = locationName;

      // If this user is a recycler, also sync their facility coords
      if (user.role === 'recycler') {
        const facility = this.data.recyclers.find(r => r.user_id === userId);
        if (facility) {
          facility.latitude = latitude;
          facility.longitude = longitude;
          if (locationName) facility.address = locationName;
          syncDocToFirestore('recyclers', facility.id, facility);
        }
      }

      this.saveToDisk();
      const { password, ...safe } = user;
      syncDocToFirestore('users', user.id, safe);
      return safe;
    }
    return null;
  }

  updateUserRole(userId: string, role: UserRole, sales_frequency?: 'regular' | 'periodical') {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      if (sales_frequency) {
        user.sales_frequency = sales_frequency;
      }
      this.saveToDisk();
      const { password, ...safe } = user;
      syncDocToFirestore('users', user.id, safe);
      return safe;
    }
    return null;
  }

  // Household Pickups & Doorstep Requests
  getHouseholdPickups(householdId?: string, scrapperId?: string) {
    if (!this.data.household_pickups) {
      this.data.household_pickups = [...INITIAL_HOUSEHOLD_PICKUPS];
    }
    return this.data.household_pickups.filter(p => {
      if (householdId && p.household_id !== householdId) return false;
      if (scrapperId && p.scrapper_id !== scrapperId) return false;
      return true;
    });
  }

  createHouseholdPickup(pickup: HouseholdPickupRequest) {
    if (!this.data.household_pickups) {
      this.data.household_pickups = [...INITIAL_HOUSEHOLD_PICKUPS];
    }
    this.data.household_pickups.unshift(pickup);
    this.saveToDisk();
    syncDocToFirestore('household_pickups', pickup.id, pickup);
    return pickup;
  }

  updateHouseholdPickup(id: string, updates: Partial<HouseholdPickupRequest>) {
    if (!this.data.household_pickups) {
      this.data.household_pickups = [...INITIAL_HOUSEHOLD_PICKUPS];
    }
    const idx = this.data.household_pickups.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.household_pickups[idx] = { ...this.data.household_pickups[idx], ...updates };
      this.saveToDisk();
      syncDocToFirestore('household_pickups', id, this.data.household_pickups[idx]);
      return this.data.household_pickups[idx];
    }
    return null;
  }

  getScrappersForHousehold() {
    return this.data.users
      .filter(u => u.role === 'scrapper' && u.status === 'Active')
      .map(u => {
        const { password, ...safe } = u;
        return {
          ...safe,
          rating: 4.85,
          pickups_completed: 48,
          vehicle: 'Electric Cargo Loader (Certified)',
          operating_hours: '8:00 AM - 7:30 PM',
          service_radius_km: 8
        };
      });
  }

  deleteUser(userId: string, adminUser?: { id: string; name: string }, reason?: string) {
    const target = this.data.users.find(u => u.id === userId);
    if (target && adminUser) {
      this.createAuditLog({
        admin_id: adminUser.id,
        admin_name: adminUser.name,
        action: 'DELETE_USER',
        target_user_id: target.id,
        target_user_name: target.name,
        reason: reason || 'Account decommissioned by administrator'
      });
    }
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.recyclers = this.data.recyclers.filter(r => r.user_id !== userId);
    this.saveToDisk();
    removeDocFromFirestore('users', userId);
    removeDocFromFirestore('recyclers', userId);
  }

  // Materials
  getMaterials() {
    return this.data.materials;
  }

  updateMaterialRate(id: string, newRate: number) {
    const mat = this.data.materials.find(m => m.id === id);
    if (mat) {
      mat.base_rate_per_kg = newRate;
      // Record in price history table
      this.data.price_history.unshift({
        id: `ph-${Date.now()}`,
        category: mat.category,
        location_zone: 'National Benchmark (Admin Adjusted)',
        buying_price: newRate,
        selling_price: Math.round(newRate * 1.15),
        date_timestamp: new Date().toISOString(),
        source_type: 'Admin Master Rate Board Update'
      });
      this.saveToDisk();
      return mat;
    }
    return null;
  }

  // Price History
  getPriceHistory() {
    return this.data.price_history;
  }

  // Recyclers
  getRecyclers() {
    return this.data.recyclers;
  }

  updateRecyclerFacility(recyclerId: string, updates: Partial<RecyclerFacility>) {
    const rec = this.data.recyclers.find(r => r.id === recyclerId || r.user_id === recyclerId);
    if (rec) {
      Object.assign(rec, updates);
      this.saveToDisk();
      return rec;
    }
    return null;
  }

  // Transactions & Traceability
  getTransactions() {
    return this.data.transactions;
  }

  createTransaction(tx: Omit<Transaction, 'id' | 'created_at'>) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const finalDeclared = tx.declared_weight || tx.estimated_weight || 10;
    const lotRef = tx.lot_reference_id || `#LOT-2026-${randomHex}`;

    // Ensure itemized scraps breakdown is maintained
    const scrapItems: ScrapItem[] = tx.scraps_items && tx.scraps_items.length > 0 ? tx.scraps_items : [
      {
        id: `scrap-${Date.now()}-1`,
        name: tx.category,
        category: tx.category,
        declared_weight_kg: finalDeclared,
        verified_weight_kg: tx.actual_weight ?? undefined,
        rate_per_kg: tx.offered_rate_per_kg,
        estimated_amount: Math.round(finalDeclared * tx.offered_rate_per_kg),
        hazard_level: tx.category.toLowerCase().includes('battery') ? 'HIGH' : tx.category.toLowerCase().includes('pcb') ? 'MEDIUM' : 'LOW',
        condition: 'Primary inspected scrap grade'
      }
    ];

    // Determine initial payment details
    const paymentMode = tx.payment_mode || 'UPI_DIGITAL';
    const paymentStatus = tx.payment_status || (tx.status === 'COMPLETED' || tx.status === 'PAID' ? 'PAID' : 'PENDING');
    const estimatedPayout = tx.final_payout || Math.round(finalDeclared * tx.offered_rate_per_kg);

    const paymentDetails: PaymentDetails = tx.payment_details || {
      payment_mode: paymentMode,
      amount: estimatedPayout,
      status: paymentStatus,
      ...(paymentStatus === 'PAID' ? { paid_at: new Date().toISOString() } : {}),
      ...(paymentMode === 'OFFLINE_PAYMENT' ? {
        offline_voucher_no: `OFF-VCHR-${Date.now().toString().slice(-6)}`,
        offline_mode: 'PHYSICAL_SLIP',
        offline_notes: 'Physical voucher logged for low-connectivity / spot scrap exchange.'
      } : {}),
      ...(paymentMode.includes('CASH') ? {
        cash_receipt_no: `CASH-REC-${Date.now().toString().slice(-6)}`
      } : {}),
      ...(paymentMode.includes('UPI') ? {
        upi_txn_id: `UPI-TXN-${Date.now().toString().slice(-6)}`
      } : {})
    };

    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      lot_reference_id: lotRef,
      scraps_items: scrapItems,
      fulfillment_type: tx.fulfillment_type || 'PICKUP',
      declared_weight: finalDeclared,
      estimated_weight: finalDeclared,
      actual_weight: tx.actual_weight ?? finalDeclared,
      offered_rate_per_kg: tx.offered_rate_per_kg,
      final_payout: tx.final_payout ?? null,
      payment_mode: paymentMode,
      payment_status: paymentStatus,
      payment_details: paymentDetails,
      weight_confirmed_by_scrapper: tx.weight_confirmed_by_scrapper !== undefined ? tx.weight_confirmed_by_scrapper : true,
      created_at: new Date().toISOString()
    };

    this.data.transactions.unshift(newTx);
    this.saveToDisk();
    syncDocToFirestore('transactions', newTx.id, newTx);
    return newTx;
  }

  updateTransaction(id: string, updates: Partial<Transaction>) {
    const tx = this.data.transactions.find(t => t.id === id || t.lot_reference_id === id);
    if (tx) {
      Object.assign(tx, updates);
      this.saveToDisk();
      syncDocToFirestore('transactions', tx.id, tx);
      return tx;
    }
    return null;
  }

  recordTransactionPayment(txId: string, paymentData: {
    payment_mode: PaymentMode;
    amount?: number;
    status?: PaymentStatus;
    upi_id?: string;
    upi_txn_id?: string;
    upi_app?: string;
    cash_collected_by?: string;
    cash_receipt_no?: string;
    cash_tendered?: number;
    cash_notes?: string;
    offline_voucher_no?: string;
    offline_mode?: 'OFFLINE_CASH' | 'PHYSICAL_SLIP' | 'COUNTER_LEDGER';
    offline_verified_by?: string;
    offline_witness_contact?: string;
    offline_notes?: string;
    bank_account_last4?: string;
    bank_ref_no?: string;
  }) {
    const tx = this.data.transactions.find(t => t.id === txId || t.lot_reference_id === txId);
    if (!tx) return null;

    const finalAmount = paymentData.amount || tx.final_payout || Math.round((tx.actual_weight || tx.estimated_weight) * tx.offered_rate_per_kg);
    const nowIso = new Date().toISOString();

    tx.payment_mode = paymentData.payment_mode || tx.payment_mode;
    tx.final_payout = finalAmount;
    tx.payment_status = 'PAID';
    tx.status = 'COMPLETED';
    tx.paid_at = nowIso;
    tx.handover_timestamp = tx.handover_timestamp || nowIso;

    tx.payment_details = {
      payment_mode: paymentData.payment_mode || tx.payment_mode,
      amount: finalAmount,
      status: 'PAID',
      paid_at: nowIso,
      upi_app: paymentData.upi_app || 'UPI Instant Pay',
      cash_collected_by: paymentData.cash_collected_by || 'Authorized Logistics Agent',
      offline_mode: paymentData.offline_mode || 'PHYSICAL_SLIP',
      offline_verified_by: paymentData.offline_verified_by || 'CPCB Field Scale Officer',
      offline_notes: paymentData.offline_notes || 'Handover reconciled under offline ledger standard.',
      offline_synced_at: nowIso,
      ...(paymentData.upi_id || tx.payment_details?.upi_id ? { upi_id: paymentData.upi_id || tx.payment_details?.upi_id } : {}),
      ...(paymentData.upi_txn_id || paymentData.payment_mode.includes('UPI') ? { upi_txn_id: paymentData.upi_txn_id || `UPI-TXN-${Date.now().toString().slice(-6)}` } : {}),
      ...(paymentData.cash_receipt_no || paymentData.payment_mode.includes('CASH') ? { cash_receipt_no: paymentData.cash_receipt_no || `REC-${Date.now().toString().slice(-6)}` } : {}),
      ...(paymentData.cash_tendered !== undefined ? { cash_tendered: paymentData.cash_tendered } : {}),
      ...(paymentData.cash_notes ? { cash_notes: paymentData.cash_notes } : {}),
      ...(paymentData.offline_voucher_no || paymentData.payment_mode === 'OFFLINE_PAYMENT' ? { offline_voucher_no: paymentData.offline_voucher_no || `OFF-VCHR-${Date.now().toString().slice(-6)}` } : {}),
      ...(paymentData.offline_witness_contact ? { offline_witness_contact: paymentData.offline_witness_contact } : {}),
      ...(paymentData.bank_account_last4 ? { bank_account_last4: paymentData.bank_account_last4 } : {}),
      ...(paymentData.bank_ref_no ? { bank_ref_no: paymentData.bank_ref_no } : {})
    };

    this.saveToDisk();
    syncDocToFirestore('transactions', tx.id, tx);
    return tx;
  }

  verifyLotWeight(txId: string, verifiedWeight: number, sortingBreakdown?: SortingInspection) {
    const tx = this.data.transactions.find(t => t.id === txId || t.lot_reference_id === txId);
    if (!tx) return null;

    tx.actual_weight = verifiedWeight;
    tx.verified_weight = verifiedWeight;
    tx.status = 'WEIGHT_VERIFIED';
    if (sortingBreakdown) {
      tx.sorting_breakdown = sortingBreakdown;
    }
    const deduction = sortingBreakdown?.contamination_deduction || 0;
    const finalAmount = Math.max(0, Math.round(verifiedWeight * tx.offered_rate_per_kg - deduction));
    tx.final_payout = finalAmount;
    tx.weight_confirmed_by_scrapper = false;

    this.saveToDisk();
    syncDocToFirestore('transactions', tx.id, tx);
    return tx;
  }

  confirmLotWeight(txId: string, confirmed: boolean, disputeReason?: string) {
    const tx = this.data.transactions.find(t => t.id === txId || t.lot_reference_id === txId);
    if (!tx) return null;

    if (confirmed) {
      tx.weight_confirmed_by_scrapper = true;
      tx.weight_disputed = false;
      tx.status = 'PAID';
      tx.handover_timestamp = new Date().toISOString();
    } else {
      tx.weight_disputed = true;
      tx.status = 'DISPUTED';
      tx.dispute_reason = disputeReason || 'Scrapper disputed scale weight or contamination deduction';
    }

    this.saveToDisk();
    syncDocToFirestore('transactions', tx.id, tx);
    return tx;
  }

  // Chats
  getChats(filter?: { lot_reference_id?: string; user_id?: string; other_user_id?: string }) {
    if (!filter) return this.data.chats;

    // Helper to resolve alias between facility id (e.g. rec-1) and user id (usr-recycler-1)
    const resolveIds = (id: string): string[] => {
      const ids = [id];
      if (id === 'rec-1' || id === 'usr-recycler-1' || id === 'ecorecycle') {
        ids.push('rec-1', 'usr-recycler-1', 'ecorecycle');
      } else if (id === 'rec-2' || id === 'usr-recycler-2' || id === 'greenmetal') {
        ids.push('rec-2', 'usr-recycler-2', 'greenmetal');
      } else if (id === 'rec-3' || id === 'usr-recycler-3' || id === 'chennaicircular') {
        ids.push('rec-3', 'usr-recycler-3', 'chennaicircular');
      }
      return ids;
    };

    return this.data.chats.filter(c => {
      if (filter.lot_reference_id && c.lot_reference_id === filter.lot_reference_id) return true;
      if (filter.user_id && filter.other_user_id) {
        const u1Aliases = resolveIds(filter.user_id);
        const u2Aliases = resolveIds(filter.other_user_id);
        const matchForward = u1Aliases.includes(c.sender_id) && u2Aliases.includes(c.receiver_id);
        const matchBackward = u2Aliases.includes(c.sender_id) && u1Aliases.includes(c.receiver_id);
        return matchForward || matchBackward;
      }
      if (filter.user_id) {
        const uAliases = resolveIds(filter.user_id);
        return uAliases.includes(c.sender_id) || uAliases.includes(c.receiver_id);
      }
      return false;
    });
  }

  createChatMessage(chat: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const newMsg: ChatMessage = {
      ...chat,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.data.chats.push(newMsg);
    this.saveToDisk();
    syncDocToFirestore('chats', newMsg.id, newMsg);
    return newMsg;
  }

  // Complaints
  getComplaints(filter?: { complainant_id?: string; respondent_id?: string; status?: string }) {
    if (!filter) return this.data.complaints;
    return this.data.complaints.filter(c => {
      if (filter.complainant_id && c.complainant_id !== filter.complainant_id) return false;
      if (filter.respondent_id && c.respondent_id !== filter.respondent_id) return false;
      if (filter.status && c.status !== filter.status) return false;
      return true;
    });
  }

  createComplaint(complaint: Omit<Complaint, 'id' | 'created_at'>) {
    const newComplaint: Complaint = {
      ...complaint,
      id: `cmp-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'Submitted'
    };
    this.data.complaints.unshift(newComplaint);
    this.saveToDisk();
    syncDocToFirestore('complaints', newComplaint.id, newComplaint);
    return newComplaint;
  }

  updateComplaint(id: string, updates: Partial<Complaint>) {
    const complaint = this.data.complaints.find(c => c.id === id);
    if (complaint) {
      Object.assign(complaint, updates);
      this.saveToDisk();
      syncDocToFirestore('complaints', complaint.id, complaint);
      return complaint;
    }
    return null;
  }

  // Legal Cases
  getLegalCases() {
    return this.data.legal_cases;
  }

  createLegalCase(legalCase: Omit<LegalCase, 'id' | 'created_at'>) {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const newLegalCase: LegalCase = {
      ...legalCase,
      id: `leg-${Date.now()}`,
      case_number: legalCase.case_number || `CPCB/LEGAL/EW/2026/${randomSeq}`,
      created_at: new Date().toISOString()
    };
    this.data.legal_cases.unshift(newLegalCase);
    this.saveToDisk();
    syncDocToFirestore('legal_cases', newLegalCase.id, newLegalCase);
    return newLegalCase;
  }

  updateLegalCase(id: string, updates: Partial<LegalCase>) {
    const lc = this.data.legal_cases.find(c => c.id === id || c.case_number === id);
    if (lc) {
      Object.assign(lc, updates);
      this.saveToDisk();
      syncDocToFirestore('legal_cases', lc.id, lc);
      return lc;
    }
    return null;
  }

  // Audit Logs
  getAuditLogs() {
    return this.data.audit_logs;
  }

  createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.unshift(newEntry);
    this.saveToDisk();
    return newEntry;
  }

  // CPCB Registry Lookup (Official CPCB Master Mock)
  lookupCPCBRegistry(authNumber: string) {
    const clean = authNumber.trim().toUpperCase();
    const known: Record<string, { facility_name: string; state: string; address: string; materials: string[]; valid_until: string; capacity_kta: number; status: string }> = {
      'CPCB/EW/KAR/2024/7742': {
        facility_name: 'EcoRecycle Solutions Pvt Ltd',
        state: 'Karnataka',
        address: 'Plot 42, 4th Cross, Peenya 2nd Phase, Bengaluru, Karnataka 560058',
        materials: ['PCB (Printed Circuit Boards)', 'Copper Wires/Cables', 'Lead/Li-ion Batteries', 'Electric Motors & Transformers', 'Mixed Rigid Plastics'],
        valid_until: '2028-12-31',
        capacity_kta: 18.5,
        status: 'Active Registered Recycler (EPR Verified)'
      },
      'CPCB/EW/DEL/2023/5019': {
        facility_name: 'GreenMetals Authorized Recyclers',
        state: 'Delhi NCR',
        address: 'Phase-1, Okhla Industrial Area, New Delhi, 110020',
        materials: ['PCB (Printed Circuit Boards)', 'Copper Wires/Cables', 'Lead/Li-ion Batteries', 'CRT Glass & Monitors'],
        valid_until: '2027-09-30',
        capacity_kta: 24.0,
        status: 'Active Registered Recycler (EPR Verified)'
      },
      'TNPCB/EW/CHN/2025/1108': {
        facility_name: 'Chennai Circular Urban Aggregators',
        state: 'Tamil Nadu',
        address: 'SIDCO Industrial Estate, Ambattur, Chennai, Tamil Nadu 600058',
        materials: ['PCB (Printed Circuit Boards)', 'Copper Wires/Cables', 'Lead/Li-ion Batteries', 'Electric Motors & Transformers'],
        valid_until: '2029-05-15',
        capacity_kta: 12.0,
        status: 'Active Registered Recycler (EPR Verified)'
      },
      'MPCB/EW/MUM/2024/3391': {
        facility_name: 'Maharashtra Green E-Waste Recyclers Pvt Ltd',
        state: 'Maharashtra',
        address: 'Plot 18, Dharavi / Kurla Recycling Cluster, Mumbai, Maharashtra 400017',
        materials: ['PCB (Printed Circuit Boards)', 'Copper Wires/Cables', 'Lead/Li-ion Batteries', 'Electric Motors & Transformers', 'Mixed Rigid Plastics'],
        valid_until: '2029-03-31',
        capacity_kta: 32.0,
        status: 'Active Registered Recycler (EPR Verified)'
      },
      'MPCB/EW/PUN/2025/9012': {
        facility_name: 'Sahyadri Circular Refining Facility',
        state: 'Maharashtra',
        address: 'MIDC Bhosari, Pimpri-Chinchwad, Pune, Maharashtra 411026',
        materials: ['PCB (Printed Circuit Boards)', 'Copper Wires/Cables', 'Lead/Li-ion Batteries'],
        valid_until: '2027-11-30',
        capacity_kta: 15.0,
        status: 'Pending State Board Audit Inspection'
      }
    };

    if (known[clean]) {
      return { found: true, data: known[clean] };
    }

    if (clean.includes('/EW/') || clean.startsWith('CPCB') || clean.startsWith('SPCB')) {
      return {
        found: true,
        data: {
          facility_name: 'Authorized Regional Recycling Partner',
          state: 'National Registered',
          address: 'Authorized Industrial Cluster Zone, India',
          materials: ['PCB (Printed Circuit Boards)', 'Copper Wires/Cables', 'Mixed Rigid Plastics'],
          valid_until: '2027-12-31',
          capacity_kta: 10.0,
          status: 'Provisionally Validated (Pending Physical Inspection)'
        }
      };
    }

    return { found: false, error: 'Registration number not found in Central Pollution Control Board Master Registry.' };
  }

  // Aadhaar KYC Verification (UIDAI Sandbox Mock)
  lookupAadhaarKYC(aadhaarNumber: string) {
    const clean = aadhaarNumber.replace(/\D/g, '');
    const last4 = clean.slice(-4);
    const directory: Record<string, { full_name: string; dob_year: number; state: string; district: string; kyc_status: string; photo_url: string }> = {
      '8821': {
        full_name: 'Ramesh Kumar',
        dob_year: 1988,
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        kyc_status: 'UIDAI OTP Verified (Green Tier)',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
      },
      '4190': {
        full_name: 'Suresh Patel',
        dob_year: 1984,
        state: 'Delhi',
        district: 'South East Delhi',
        kyc_status: 'UIDAI OTP Verified (Green Tier)',
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
      },
      '5512': {
        full_name: 'Anand Gowda',
        dob_year: 1993,
        state: 'Karnataka',
        district: 'Bengaluru Rural',
        kyc_status: 'UIDAI OTP Verified (Green Tier)',
        photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80'
      },
      '7721': {
        full_name: 'Karthik R',
        dob_year: 1991,
        state: 'Tamil Nadu',
        district: 'Chennai',
        kyc_status: 'UIDAI OTP Verified (Green Tier)',
        photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
      }
    };

    if (directory[last4]) {
      return { verified: true, data: directory[last4], last4 };
    }

    if (clean.length === 12 || last4.length === 4) {
      return {
        verified: true,
        data: {
          full_name: 'Verified Informal Collector',
          dob_year: 1990,
          state: 'India',
          district: 'Regional Urban Zone',
          kyc_status: 'UIDAI OTP Verified (Sandbox Simulation)',
          photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        },
        last4: last4 || '9999'
      };
    }

    return { verified: false, error: 'Invalid Aadhaar format. Must be 12 digits or 4-digit demo PIN.' };
  }

  // CPCB Periodic Compliance Report Aggregator
  generateCPCBComplianceReport() {
    const txs = this.data.transactions;
    const completed = txs.filter(t => t.status === 'COMPLETED' || t.status === 'PAID');
    const totalVolumeKg = completed.reduce((acc, t) => acc + (t.actual_weight || t.estimated_weight), 0);
    const totalPayoutINR = completed.reduce((acc, t) => acc + (t.final_payout || 0), 0);

    const categoryBreakdown: Record<string, { count: number; volume_kg: number; payout_inr: number }> = {};
    completed.forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { count: 0, volume_kg: 0, payout_inr: 0 };
      }
      categoryBreakdown[t.category].count += 1;
      categoryBreakdown[t.category].volume_kg += (t.actual_weight || t.estimated_weight);
      categoryBreakdown[t.category].payout_inr += (t.final_payout || 0);
    });

    const recyclers = this.data.recyclers;
    const activeFacilities = recyclers.filter(r => r.is_authorized).length;

    return {
      report_id: `CPCB-REP-2026-Q3`,
      period: 'Q3 2026 (Formal Channel)',
      generated_at: new Date().toISOString(),
      statutory_body: 'Central Pollution Control Board (CPCB) E-Waste Directorate',
      regulation: 'E-Waste (Management) Rules, 2022 - Section 14 Formalization Grid',
      summary: {
        total_lots_diverted: completed.length,
        total_volume_diverted_kg: Math.round(totalVolumeKg * 10) / 10,
        total_informal_payout_inr: totalPayoutINR,
        active_authorized_facilities: activeFacilities,
        open_disputes: txs.filter(t => t.status === 'DISPUTED').length,
        active_complaints: this.data.complaints.filter(c => c.status !== 'Closed').length,
        pending_legal_actions: this.data.legal_cases.filter(l => l.status !== 'Closed').length
      },
      category_breakdown: categoryBreakdown,
      recyclers_summary: recyclers.map(r => ({
        name: r.facility_name,
        auth_number: r.cpcb_auth_number,
        authorized: r.is_authorized,
        pickup_radius: r.service_radius_km
      }))
    };
  }

  // Generate Production PostgreSQL / SQLite DDL Schema Migration Engine
  generateSQLDDL(dialect: 'postgres' | 'sqlite' = 'postgres'): string {
    const isPg = dialect === 'postgres';
    const textType = isPg ? 'VARCHAR(255)' : 'TEXT';
    const longTextType = isPg ? 'TEXT' : 'TEXT';
    const numType = isPg ? 'NUMERIC(12, 2)' : 'REAL';
    const boolType = isPg ? 'BOOLEAN' : 'INTEGER';
    const timeType = isPg ? 'TIMESTAMP WITH TIME ZONE' : 'TEXT';
    const defaultNow = isPg ? 'CURRENT_TIMESTAMP' : "datetime('now')";
    const idType = isPg ? 'VARCHAR(64)' : 'TEXT';

    return `-- ====================================================================
-- KABADIWALA CONNECT v2.4.0 STATUTORY DDL MIGRATION SCRIPT
-- Target Engine: ${isPg ? 'PostgreSQL (Cloud SQL / Supabase / Neon)' : 'SQLite 3 (FOSS / Embedded)'}
-- Compliance Standard: CPCB E-Waste Management Rules 2022 / SIH Portal Standard
-- Generated At: ${new Date().toISOString()}
-- ====================================================================

-- 1. USERS & STAKEHOLDERS (Aadhaar KYC, CPCB Auth, GPS Pin)
CREATE TABLE IF NOT EXISTS users (
  id ${idType} PRIMARY KEY,
  username ${idType} UNIQUE NOT NULL,
  name ${textType} NOT NULL,
  role ${textType} NOT NULL ${isPg ? "CHECK (role IN ('scrapper', 'recycler', 'admin'))" : "CHECK (role IN ('scrapper', 'recycler', 'admin'))"},
  location ${textType},
  phone ${isPg ? 'VARCHAR(32)' : 'TEXT'},
  verified ${boolType} DEFAULT ${isPg ? 'FALSE' : '0'},
  cpcb_number ${idType},
  aadhaar_last4 ${isPg ? 'VARCHAR(4)' : 'TEXT'},
  latitude ${isPg ? 'DOUBLE PRECISION' : 'REAL'},
  longitude ${isPg ? 'DOUBLE PRECISION' : 'REAL'},
  status ${isPg ? 'VARCHAR(32)' : 'TEXT'} DEFAULT 'Active',
  created_at ${timeType} DEFAULT ${defaultNow}
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_cpcb ON users(cpcb_number);

-- 2. STATUTORY SCRAP CATEGORIES & CPCB BENCHMARK FLOOR RATES
CREATE TABLE IF NOT EXISTS materials (
  id ${idType} PRIMARY KEY,
  category ${textType} UNIQUE NOT NULL,
  subcategory ${textType},
  base_rate_per_kg ${numType} NOT NULL,
  description ${longTextType},
  safety_protocol ${longTextType},
  updated_at ${timeType} DEFAULT ${defaultNow}
);

-- 3. CPCB AUTHORIZED RECYCLING FACILITIES & CAPACITIES
CREATE TABLE IF NOT EXISTS recycler_facilities (
  id ${idType} PRIMARY KEY,
  user_id ${idType} REFERENCES users(id) ON DELETE CASCADE,
  facility_name ${textType} NOT NULL,
  cpcb_auth_number ${idType} UNIQUE NOT NULL,
  latitude ${isPg ? 'DOUBLE PRECISION' : 'REAL'} NOT NULL,
  longitude ${isPg ? 'DOUBLE PRECISION' : 'REAL'} NOT NULL,
  processing_capacity_mt ${numType} NOT NULL,
  service_radius_km ${isPg ? 'INTEGER' : 'INTEGER'} DEFAULT 25,
  state ${textType} NOT NULL,
  created_at ${timeType} DEFAULT ${defaultNow}
);

CREATE INDEX IF NOT EXISTS idx_recyclers_coords ON recycler_facilities(latitude, longitude);

-- 4. NATIONAL TRACEABILITY LEDGER & WEIGHBRIDGE BATCH TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id ${idType} PRIMARY KEY,
  lot_reference_id ${idType} UNIQUE NOT NULL,
  scrapper_id ${idType} NOT NULL REFERENCES users(id),
  scrapper_name ${textType} NOT NULL,
  recycler_id ${idType} NOT NULL REFERENCES users(id),
  recycler_name ${textType} NOT NULL,
  category ${textType} NOT NULL,
  declared_weight ${numType} NOT NULL,
  actual_weight ${numType},
  verified_weight ${numType},
  offered_rate_per_kg ${numType} NOT NULL,
  final_payout ${numType},
  status ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  payment_mode ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  offline_voucher_no ${idType},
  cash_receipt_no ${idType},
  upi_txn_id ${idType},
  collection_lat ${isPg ? 'DOUBLE PRECISION' : 'REAL'},
  collection_lon ${isPg ? 'DOUBLE PRECISION' : 'REAL'},
  contamination_deduction ${numType} DEFAULT 0,
  created_at ${timeType} DEFAULT ${defaultNow}
);

CREATE INDEX IF NOT EXISTS idx_tx_lot_ref ON transactions(lot_reference_id);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_tx_scrapper ON transactions(scrapper_id);
CREATE INDEX IF NOT EXISTS idx_tx_recycler ON transactions(recycler_id);

-- 5. OMBUDSMAN TRIBUNAL GRIEVANCES & WEIGHT CONFLICTS
CREATE TABLE IF NOT EXISTS complaints (
  id ${idType} PRIMARY KEY,
  case_number ${idType} UNIQUE,
  complainant_id ${idType} NOT NULL REFERENCES users(id),
  complainant_name ${textType} NOT NULL,
  complainant_role ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  respondent_id ${idType} NOT NULL REFERENCES users(id),
  respondent_name ${textType} NOT NULL,
  respondent_role ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  lot_reference_id ${idType},
  type ${textType},
  description ${longTextType} NOT NULL,
  priority ${isPg ? 'VARCHAR(16)' : 'TEXT'} DEFAULT 'MEDIUM',
  status ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  penalty_imposed_inr ${numType} DEFAULT 0,
  created_at ${timeType} DEFAULT ${defaultNow}
);

CREATE INDEX IF NOT EXISTS idx_complaints_case ON complaints(case_number);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

-- 6. STATUTORY SHOW-CAUSE LEGAL NOTICES (CPCB RULE 14 / EP ACT 1986)
CREATE TABLE IF NOT EXISTS legal_cases (
  id ${idType} PRIMARY KEY,
  case_file_number ${idType} UNIQUE NOT NULL,
  against_name ${textType} NOT NULL,
  against_entity_type ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  cpcb_reg_number ${idType},
  section_violated ${textType} NOT NULL,
  fine_amount_inr ${numType} NOT NULL,
  status ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  created_at ${timeType} DEFAULT ${defaultNow}
);

CREATE INDEX IF NOT EXISTS idx_legal_case_num ON legal_cases(case_file_number);

-- 7. IMMUTABLE SHA-256 SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id ${idType} PRIMARY KEY,
  actor_name ${textType} NOT NULL,
  actor_role ${isPg ? 'VARCHAR(32)' : 'TEXT'} NOT NULL,
  action ${textType} NOT NULL,
  entity_type ${textType} NOT NULL,
  entity_id ${idType} NOT NULL,
  details ${longTextType} NOT NULL,
  checksum_sha256 ${isPg ? 'VARCHAR(64)' : 'TEXT'},
  created_at ${timeType} DEFAULT ${defaultNow}
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
`;
  }

  // Generate SQLite / SQL DDL Schema (backward compatibility alias)
  generateSQLiteSchemaDDL(): string {
    return this.generateSQLDDL('sqlite');
  }

  // Export Full Dataset
  exportFullDataset() {
    return {
      metadata: {
        system: "Kabadiwala Connect v2 - Decoupled Traceability Architecture",
        generated_at: new Date().toISOString(),
        tables: ["users", "materials", "price_history", "recyclers", "transactions", "chats", "complaints", "legal_cases", "audit_logs"]
      },
      users: this.getUsers(),
      materials: this.data.materials,
      price_history: this.data.price_history,
      recyclers: this.data.recyclers,
      transactions: this.data.transactions,
      chats: this.data.chats,
      complaints: this.data.complaints,
      legal_cases: this.data.legal_cases,
      audit_logs: this.data.audit_logs
    };
  }
}

export const db = new DatabaseStore();
