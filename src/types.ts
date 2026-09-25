export type UserRole = 'scrapper' | 'recycler' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  location: string;
  phone?: string;
  verified: boolean;
  cpcb_number?: string;
  aadhaar_last4?: string;
  token?: string;
  latitude?: number;
  longitude?: number;
  status?: 'Active' | 'Pending Admin Verification' | 'Suspended';
  suspension_reason?: string;
  created_at?: string;
  entity_name?: string;
}

export interface Material {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  image_url: string;
  base_rate_per_kg: number;
  danger_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface PriceHistory {
  id: string;
  category: string;
  location_zone: string;
  buying_price: number;
  selling_price: number;
  date_timestamp: string;
  source_type: string;
}

export interface RecyclerFacility {
  id: string;
  user_id: string;
  facility_name: string;
  latitude: number;
  longitude: number;
  cpcb_auth_number: string;
  is_authorized: boolean;
  offered_rates_json: Record<string, number>;
  pickup_available: boolean;
  service_radius_km: number;
  contact_phone: string;
  address: string;
}

export type TransactionStatus =
  | 'CREATED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'PICKUP_SCHEDULED'
  | 'WEIGHT_VERIFIED'
  | 'PAID'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REJECTED';

export interface SortingInspection {
  required_kg: number;
  unrequired_kg: number;
  contamination_deduction: number;
  notes: string;
}

export type PaymentMode =
  | 'UPI'
  | 'UPI_DIGITAL'
  | 'CASH_ON_PICKUP'
  | 'CASH_ON_DELIVERY'
  | 'OFFLINE_PAYMENT'
  | 'CASH'
  | 'BANK_TRANSFER';

export type FulfillmentType = 'PICKUP' | 'DELIVERY';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'DISPUTED' | 'FAILED';

export interface ScrapItem {
  id: string;
  name: string;
  category: string;
  declared_weight_kg: number;
  verified_weight_kg?: number;
  rate_per_kg: number;
  estimated_amount: number;
  hazard_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  condition?: string;
}

export interface PaymentDetails {
  payment_mode: PaymentMode;
  amount: number;
  status: PaymentStatus;
  paid_at?: string;
  // UPI details
  upi_id?: string;
  upi_txn_id?: string;
  upi_app?: string;
  // Cash on Pickup / Delivery details
  cash_collected_by?: string;
  cash_receipt_no?: string;
  cash_tendered?: number;
  cash_notes?: string;
  // Offline Payment details
  offline_voucher_no?: string;
  offline_mode?: 'OFFLINE_CASH' | 'PHYSICAL_SLIP' | 'COUNTER_LEDGER';
  offline_verified_by?: string;
  offline_witness_contact?: string;
  offline_notes?: string;
  offline_synced_at?: string;
  // Bank transfer details
  bank_account_last4?: string;
  bank_ref_no?: string;
}

export interface Transaction {
  id: string;
  lot_reference_id: string;
  scrapper_id: string;
  scrapper_name: string;
  recycler_id: string;
  recycler_name: string;
  category: string;
  scraps_items?: ScrapItem[];
  fulfillment_type?: FulfillmentType;
  estimated_weight: number; // Also acts as declared_weight
  declared_weight?: number;
  actual_weight: number | null; // Also acts as verified_weight
  verified_weight?: number | null;
  offered_rate_per_kg: number;
  final_payout: number | null;
  collection_gps: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: TransactionStatus;
  sorting_breakdown?: SortingInspection;
  payment_mode: PaymentMode;
  payment_status?: PaymentStatus;
  payment_details?: PaymentDetails;
  paid_at?: string;
  handover_timestamp?: string;
  created_at: string;
  image_url?: string;
  notes?: string;
  weight_confirmed_by_scrapper?: boolean;
  weight_disputed?: boolean;
  dispute_reason?: string;
}

export interface ChatMessage {
  id: string;
  lot_reference_id?: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  receiver_id: string;
  message: string;
  timestamp: string;
  metadata?: {
    type?: 'lot_ref' | 'rate_offer' | 'gps_coords' | 'pickup_time' | 'system_status';
    data?: any;
  };
}

export interface DetectedMaterialGroup {
  id: string;
  category: string;
  confidence: number;
  subcategories: string[];
  safety_warning: string;
  estimated_rate_per_kg_min: number;
  estimated_rate_per_kg_max: number;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AIPredictionResult {
  category: string;
  confidence: number;
  estimated_rate_per_kg_min: number;
  estimated_rate_per_kg_max: number;
  recommended_safety_protocol: string;
  subcategories_detected: string[];
  total_min_price?: number;
  total_max_price?: number;
  source: 'gemini_vision' | 'yolo_mock_pipeline';
  detected_boxes?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }[];
  detected_groups?: DetectedMaterialGroup[];
}

export interface Complaint {
  id: string;
  case_number?: string;
  complainant_id: string;
  complainant_name: string;
  complainant_role: UserRole;
  respondent_id: string;
  respondent_name: string;
  respondent_role: UserRole;
  transaction_id?: string;
  lot_reference_id?: string;
  type?: string;
  complaint_type?: string;
  description: string;
  evidence_url?: string;
  status: string;
  priority?: string;
  created_at: string;
  admin_notes?: string;
  resolution_notes?: string;
  resolution_summary?: string;
  penalty_imposed_inr?: number;
}

export interface LegalCase {
  id: string;
  case_number?: string;
  case_file_number?: string;
  case_title?: string;
  complaint_id?: string;
  linked_complaint_id?: string;
  complainant_name?: string;
  respondent_name?: string;
  against_name?: string;
  against_entity_type?: string;
  cpcb_reg_number?: string;
  section_violated?: string;
  fine_amount_inr?: number;
  transaction_id?: string;
  case_type?: string;
  status: string;
  created_at: string;
  hearing_date?: string;
  notes?: string;
  summary?: string;
  documents?: { name: string; url: string; date: string }[];
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
  timestamp?: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_user_id?: string;
  target_user_name?: string;
  reason: string;
  timestamp: string;
}

export interface CPCBComplianceReport {
  generated_at: string;
  reporting_period: string;
  total_volume_diverted_kg?: number;
  total_financial_value_inr?: number;
  active_registered_scrappers?: number;
  active_authorized_recyclers?: number;
  summary?: {
    total_diverted_weight_kg: number;
    total_value_disbursed_inr: number;
    active_scrappers_formalized: number;
    total_lots_processed: number;
    authorized_recyclers_registered: number;
    open_complaints: number;
    active_legal_cases: number;
  };
  category_breakdown: {
    category: string;
    weight_kg: number;
    value_inr: number;
  }[];
}

export type VernacularLang = 'en' | 'hi' | 'ta' | 'mr';
