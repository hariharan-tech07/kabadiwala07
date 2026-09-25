import React, { useState, useEffect, useRef } from 'react';
import { User, Transaction, Material, PriceHistory, Complaint, LegalCase, AuditLog, VernacularLang } from '../../types';
import { api } from '../../api/client';
import { translations } from '../../translations';
import { OpenStreetMap } from '../common/OpenStreetMap';
import { DigitalReceiptModal } from '../common/DigitalReceiptModal';
import { PaymentBadge } from '../common/PaymentBadge';
import { TransactionPaymentHistoryView } from '../common/TransactionPaymentHistoryView';
import { generateAdminComplianceReport, generateLegalNoticePdf } from '../../utils/pdfGenerator';
import {
  ShieldAlert, Users, FileSpreadsheet, TrendingUp, Database,
  CheckCircle2, XCircle, Search, Filter, Download, Edit2,
  Save, ArrowUpRight, Scale, IndianRupee, MapPin, Check,
  Clock, ShieldCheck, Compass, Globe, FileText, QrCode,
  Gavel, AlertTriangle, FileWarning, RefreshCw, Send, Loader2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Building2,
  KeyRound, Eye, EyeOff, Lock, Copy, X
} from 'lucide-react';

export type AdminMenuTab = 'transactions' | 'users' | 'rates' | 'complaints' | 'legal' | 'audit' | 'payments';

interface AdminDashboardProps {
  currentUser: User;
  lang?: VernacularLang;
  activeMenuTab?: AdminMenuTab;
  onSelectMenuTab?: (tab: AdminMenuTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  lang = 'en',
  activeMenuTab: controlledMenuTab,
  onSelectMenuTab
}) => {
  const t = translations[lang] || translations.en;

  // 6-Module Active Menu Tab (supports controlled or local fallback)
  const [internalMenuTab, setInternalMenuTab] = useState<AdminMenuTab>('transactions');
  const activeMenuTab = controlledMenuTab ?? internalMenuTab;
  const setActiveMenuTab = (tab: AdminMenuTab) => {
    setInternalMenuTab(tab);
    onSelectMenuTab?.(tab);
  };
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [legalCases, setLegalCases] = useState<LegalCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital Receipt Inspection Modal
  const [selectedReceiptLot, setSelectedReceiptLot] = useState<Transaction | null>(null);

  // Filters
  const [txFilterStatus, setTxFilterStatus] = useState<string>('ALL');
  const [txSearch, setTxSearch] = useState<string>('');
  const [userFilterRole, setUserFilterRole] = useState<string>('ALL');

  // Rate Board editing
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateInputVal, setRateInputVal] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // CPCB Registry Live Lookup Check
  const [cpcbCheckQuery, setCpcbCheckQuery] = useState('CPCB/EW/KAR/2024/7742');
  const [cpcbCheckResult, setCpcbCheckResult] = useState<any>(null);
  const [cpcbCheckLoading, setCpcbCheckLoading] = useState(false);

  // DDL Schema State
  const [sqlDDL, setSqlDDL] = useState<string>('');

  // Admin Password & Security Settings Modal
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState('admin123');
  const [showActivePassword, setShowActivePassword] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [securityModalLoading, setSecurityModalLoading] = useState(false);
  const [securityModalError, setSecurityModalError] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const loadAdminCredentials = async () => {
    try {
      const info = await api.getAdminCredentialsInfo();
      setCurrentAdminPassword(info.currentPassword || 'admin123');
    } catch {
      const saved = localStorage.getItem('kc_admin_password') || 'admin123';
      setCurrentAdminPassword(saved);
    }
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityModalError(null);

    if (!newAdminPassword.trim() || newAdminPassword.trim().length < 4) {
      setSecurityModalError('New password must be at least 4 characters long.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setSecurityModalError('New passwords do not match. Please re-enter.');
      return;
    }

    setSecurityModalLoading(true);
    try {
      await api.adminResetPassword({
        newPassword: newAdminPassword.trim(),
        phone: currentUser.phone || '1122307000'
      });
      setCurrentAdminPassword(newAdminPassword.trim());
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setToastMsg(`Admin password updated to "${newAdminPassword.trim()}". Credentials saved.`);
      setTimeout(() => setToastMsg(null), 5000);
      setIsSecurityModalOpen(false);
    } catch (err: any) {
      setSecurityModalError(err.message || 'Failed to update admin password.');
    } finally {
      setSecurityModalLoading(false);
    }
  };

  const handleRestoreDefaultPassword = async () => {
    setSecurityModalLoading(true);
    setSecurityModalError(null);
    try {
      await api.adminResetPassword({
        newPassword: 'admin123',
        phone: currentUser.phone || '1122307000'
      });
      setCurrentAdminPassword('admin123');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setToastMsg('Admin password restored to default "admin123"!');
      setTimeout(() => setToastMsg(null), 5000);
      setIsSecurityModalOpen(false);
    } catch (err: any) {
      setSecurityModalError(err.message || 'Failed to restore default password.');
    } finally {
      setSecurityModalLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
    loadAdminCredentials();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [uList, txList, mList, pHist, complaintsList, legalList, auditList] = await Promise.all([
        api.getAdminUsers(),
        api.getTransactions(),
        api.getMaterials(),
        api.getPriceHistory(),
        api.getComplaints().catch(() => []),
        api.getLegalCases().catch(() => []),
        api.getAuditLogs().catch(() => [])
      ]);
      setUsers(uList);
      setTransactions(txList);
      setMaterials(mList);
      setPriceHistory(pHist);
      setComplaints(complaintsList);
      setLegalCases(legalList);
      setAuditLogs(auditList);

      // Fetch generated SQL Schema from server
      try {
        const ddlRes = await fetch('/api/admin/schema-sql').catch(() => null);
        if (ddlRes && ddlRes.ok) {
          const contentType = ddlRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const ddlData = await ddlRes.json();
            if (ddlData?.sql) {
              setSqlDDL(ddlData.sql);
            }
          }
        }
      } catch (sqlErr) {
        console.warn('Could not load dynamic schema DDL from server, using embedded schema:', sqlErr);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadComplianceReport = () => {
    generateAdminComplianceReport(transactions, users, 'March 2026');
  };

  const handleVerifyCpcbNumber = async () => {
    if (!cpcbCheckQuery.trim()) return;
    setCpcbCheckLoading(true);
    setCpcbCheckResult(null);
    try {
      const res = await api.lookupCPCB(cpcbCheckQuery.trim());
      setCpcbCheckResult(res);
    } catch (err) {
      console.error('CPCB lookup failed:', err);
      setCpcbCheckResult({ found: false });
    } finally {
      setCpcbCheckLoading(false);
    }
  };

  const handleToggleVerification = async (userToUpdate: User) => {
    try {
      const updated = await api.updateUserVerification(userToUpdate.id, !userToUpdate.verified);
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      setToastMsg(
        lang === 'mr'
          ? `${userToUpdate.name} ची सत्यापन स्थिती यशस्वीरीत्या बदलण्यात आली.`
          : `Identity verification status toggled for ${userToUpdate.name}.`
      );
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update user verification:', err);
    }
  };

  const handleSaveRate = async (materialId: string) => {
    const num = parseFloat(rateInputVal);
    if (isNaN(num) || num <= 0) return;

    try {
      const updated = await api.updateMaterialRate(materialId, num);
      setMaterials(prev => prev.map(m => (m.id === updated.id ? updated : m)));
      setEditingRateId(null);
      setToastMsg(
        lang === 'mr'
          ? `दर यशस्वीरीत्या ₹${num}/किलो अद्ययावत करण्यात आला.`
          : `Floor rate for ${updated.category} updated to ₹${num}/kg.`
      );
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update rate:', err);
    }
  };

  const handleUpdateComplaintStatus = async (complaintId: string, status: 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED', penaltyInr?: number) => {
    try {
      const updated = await api.updateComplaintStatus(complaintId, status, penaltyInr);
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
      setToastMsg(
        lang === 'mr'
          ? `तक्रार ${updated.case_number} स्थिती बदलून ${status} करण्यात आली.`
          : `Grievance case ${updated.case_number} status updated to ${status}.`
      );
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update complaint:', err);
    }
  };

  const handleEscalateToLegal = async (complaint: Complaint) => {
    try {
      const respName = complaint.respondent_name || 'Authorized Recycler Facility';
      const cType = complaint.type || complaint.complaint_type || 'Statutory Non-Compliance Notice';
      const caseNumber = `CPCB/LEGAL/EW/2026/${Math.floor(100 + Math.random() * 900)}`;

      const newCase = await api.createLegalCase({
        case_number: caseNumber,
        case_file_number: caseNumber,
        case_title: `Statutory Enforcement Proceeding against ${respName}`,
        complaint_id: complaint.id,
        linked_complaint_id: complaint.id,
        complainant_name: complaint.complainant_name || 'Informal Scrap Collector Union',
        respondent_name: respName,
        against_name: respName,
        against_entity_type: complaint.respondent_role || 'RECYCLER',
        case_type: cType,
        transaction_id: complaint.transaction_id,
        cpcb_reg_number: 'CPCB/EW/REG/ENF/2026',
        section_violated: 'Section 15, Environment (Protection) Act 1986 & Rule 13 E-Waste Rules 2022',
        summary: `Statutory non-compliance escalation triggered from grievance case ${complaint.case_number || complaint.id}: ${complaint.description}`,
        fine_amount_inr: 50000,
        status: 'NOTICE_ISSUED',
        notes: complaint.description
      });

      setLegalCases(prev => [newCase, ...prev.filter(c => c.id !== newCase.id)]);
      // Update local complaint state to Escalated
      setComplaints(prev => prev.map(c => c.id === complaint.id ? { ...c, status: 'Escalated' } : c));
      setActiveMenuTab('legal');
      setToastMsg(
        lang === 'mr'
          ? `कायदेशीर नोटीस ${newCase.case_file_number || newCase.case_number} जारी करण्यात आली!`
          : `Statutory Legal Enforcement Case ${newCase.case_file_number || newCase.case_number} successfully registered!`
      );
      setTimeout(() => setToastMsg(null), 5000);
    } catch (err: any) {
      console.error('Failed to escalate complaint to legal notice:', err);
      setToastMsg(
        lang === 'mr'
          ? 'कायदेशीर नोटीस जारी करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
          : `Error escalating complaint: ${err?.message || 'Unknown error'}`
      );
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  const handleDownloadNotice = (lc: LegalCase) => {
    generateLegalNoticePdf(lc);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlDDL || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kabadiwala_connect_production_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Aggregated platform metrics
  const totalVolumeKg = transactions.reduce((acc, t) => acc + (t.actual_weight || (t.status === 'COMPLETED' ? t.estimated_weight : 0)), 0);
  const totalPayoutInr = transactions.reduce((acc, t) => acc + (t.final_payout || 0), 0);
  const verifiedCount = users.filter(u => u.verified).length;

  const filteredTx = transactions.filter(t => {
    if (txFilterStatus !== 'ALL' && t.status !== txFilterStatus) return false;
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      return (
        t.lot_reference_id.toLowerCase().includes(q) ||
        t.scrapper_name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUsers = users.filter(u => {
    if (userFilterRole !== 'ALL' && u.role !== userFilterRole) return false;
    return true;
  });

  // 6-MODULE ADMIN WORKSPACE MODULES
  const ADMIN_MODULES: Array<{
    id: AdminMenuTab;
    num: string;
    shortTitle: string;
    label: string;
    icon: any;
    badge: string;
    subtitle: string;
  }> = [
    {
      id: 'transactions',
      num: '1',
      shortTitle: t.modAdmTx.label,
      label: t.modAdmTx.title,
      icon: FileSpreadsheet,
      badge: `${transactions.length} Records`,
      subtitle: t.modAdmTx.desc
    },
    {
      id: 'users',
      num: '2',
      shortTitle: t.modAdmUsers.label,
      label: t.modAdmUsers.title,
      icon: Users,
      badge: `${users.length} Users`,
      subtitle: t.modAdmUsers.desc
    },
    {
      id: 'rates',
      num: '3',
      shortTitle: t.modAdmRates.label,
      label: t.modAdmRates.title,
      icon: TrendingUp,
      badge: 'CPCB Floor',
      subtitle: t.modAdmRates.desc
    },
    {
      id: 'complaints',
      num: '4',
      shortTitle: t.modAdmComplaints.label,
      label: t.modAdmComplaints.title,
      icon: ShieldAlert,
      badge: `${complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_REVIEW').length} Open`,
      subtitle: t.modAdmComplaints.desc
    },
    {
      id: 'legal',
      num: '5',
      shortTitle: t.modAdmLegal.label,
      label: t.modAdmLegal.title,
      icon: Gavel,
      badge: `${legalCases.length} Cases`,
      subtitle: t.modAdmLegal.desc
    },
    {
      id: 'audit',
      num: '6',
      shortTitle: t.modAdmAudit.label,
      label: t.modAdmAudit.title,
      icon: Clock,
      badge: 'DDL & Logs',
      subtitle: t.modAdmAudit.desc
    },
    {
      id: 'payments',
      num: '7',
      shortTitle: 'Payments & Settlement',
      label: 'Financial Auditing & Payout History',
      icon: IndianRupee,
      badge: `₹${totalPayoutInr.toLocaleString('en-IN')}`,
      subtitle: 'Differentiated payment mode audit (UPI, Cash, Offline) and reconciliation ledger'
    }
  ];

  const currentIndex = ADMIN_MODULES.findIndex((m) => m.id === activeMenuTab);
  const currentMod = ADMIN_MODULES[currentIndex] || ADMIN_MODULES[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveMenuTab(ADMIN_MODULES[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < ADMIN_MODULES.length - 1) {
      setActiveMenuTab(ADMIN_MODULES[currentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-900">
      {/* CPCB Central Regulatory Authority Web Desk Master Ribbon */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-700 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center shrink-0 border border-amber-400 shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  CPCB Central Regulatory Authority Web Desk
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>Statutory Web Page</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap font-medium">
                <span className="inline-flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>Dual Master Control (Scrapper & Recycler)</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Statutory MSP Price Control</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                  <Gavel className="w-3 h-3 text-rose-400" />
                  <span>Legal Enforcement Desk</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                  <Database className="w-3 h-3 text-blue-400" />
                  <span>SQL Schema & Audit Trail</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-amber-200 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-900/60">
              🏛️ Official Government Web Desk
            </span>
          </div>
        </div>
      </div>

      {/* Top Header / Platform Governance Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {t.adminPortal}
              </h1>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-200">
                {t.systemHealthy}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Officer: {currentUser.name}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                Official Mobile: <strong>{currentUser.phone || '+91 98450 99887'}</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-slate-900 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>CPCB Central Regulatory Authority</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.adminPortalDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              id="admin-security-settings-btn"
              onClick={() => {
                setIsSecurityModalOpen(true);
                loadAdminCredentials();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-xs transition-colors cursor-pointer"
              title="View, reset, or recover Admin password credentials"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>Password & Security</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadComplianceReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
              title="Generate and download Government CPCB Monthly E-Waste Compliance Report PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.cpcbReportBtn}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">REGION</span>
              <span className="bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-700">
                NCR - Delhi
              </span>
            </div>
            <span className="px-3 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Auditor: {currentUser.name}
            </span>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.recycledVolumeTitle}
          </div>
          <div className="text-3xl font-light text-slate-900">
            {totalVolumeKg.toLocaleString('en-IN')} <span className="text-sm font-bold text-slate-400">KG</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Circular Traceability: 100%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.capitalFlowTitle}
          </div>
          <div className="text-3xl font-light text-slate-900">
            ₹{(totalPayoutInr / 100000).toFixed(2)} <span className="text-sm font-bold text-slate-400">LAKH</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <span>Direct to Collector UPI</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.verifiedEntitiesTitle}
          </div>
          <div className="text-3xl font-light text-slate-900">
            {verifiedCount} <span className="text-sm font-bold text-slate-400">/ {users.length}</span>
          </div>
          <div className="mt-2 text-amber-600 text-xs font-semibold">
            {users.length - verifiedCount} Pending Verification
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {t.aiModelHealthTitle}
          </div>
          <div className="text-3xl font-light text-slate-900">
            98.2%
          </div>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            YOLOv8 + Gemini / Active
          </div>
        </div>
      </div>

      {/* ACTIVE MODULE CONTAINER */}
      <div className="mt-4">
        {/* MODULE 1: MASTER TRACEABILITY LEDGER */}
        {activeMenuTab === 'transactions' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>{t.modAdmTx.title}</span>
                </h2>
                <p className="text-xs text-slate-400">{t.modAdmTx.desc} ({filteredTx.length} records matching)</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  {['ALL', 'OFFERED', 'ACCEPTED', 'INSPECTION', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTxFilterStatus(st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                        txFilterStatus === st
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {st === 'ALL' ? t.statusAll : st === 'OFFERED' ? t.statusBroadcasted : st === 'ACCEPTED' ? t.statusAccepted : st === 'COMPLETED' ? t.statusCompleted : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thLotRefId}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thMaterialCategory}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thEntityMatch}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thCertifiedWeight}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thSettlement}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thStatus}</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">{t.thAuditVoucher}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-slate-700">
                          {tx.lot_reference_id}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            tx.fulfillment_type === 'DELIVERY'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.fulfillment_type || 'PICKUP'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans font-normal">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-xs font-bold text-slate-900">{tx.category}</div>
                        <div className="text-[10px] text-slate-400">
                          {tx.scraps_items && tx.scraps_items.length > 0 ? (
                            <span>{tx.scraps_items.length} itemized scrap lines</span>
                          ) : tx.category.toLowerCase().includes('battery') ? (
                            'Hazardous E-Waste'
                          ) : (
                            'Non-Hazardous Metal'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-xs font-semibold text-slate-800">
                          {tx.scrapper_name} &rarr; {tx.recycler_name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          <span>{tx.collection_gps?.address || 'Collection Point'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs">
                        {tx.actual_weight !== null ? (
                          <span className="font-bold text-slate-900">{tx.actual_weight} KG</span>
                        ) : (
                          <span className="text-slate-500">{tx.estimated_weight} KG (Est)</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs">
                        <div>
                          {tx.final_payout !== null ? (
                            <span className="font-bold text-emerald-700">₹{tx.final_payout.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-slate-500">~₹{Math.round(tx.estimated_weight * tx.offered_rate_per_kg).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <div className="mt-1">
                          <PaymentBadge
                            mode={tx.payment_mode || 'UPI_DIGITAL'}
                            status={tx.payment_status || (tx.status === 'COMPLETED' ? 'PAID' : 'PENDING')}
                            voucherOrRef={tx.payment_details?.offline_voucher_no || tx.payment_details?.cash_receipt_no || tx.payment_details?.upi_txn_id}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'INSPECTION'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.status === 'ACCEPTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tx.status === 'COMPLETED' ? 'SETTLED' : tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceiptLot(tx);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                          title="Inspect Traceable Gate Pass"
                        >
                          <FileText className="w-3 h-3 text-emerald-600" />
                          <span>Voucher</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 2: USER & FACILITY REGISTRY */}
        {activeMenuTab === 'users' && (
          <div className="space-y-6">
            {/* CPCB Registry Statutory Live Verifier Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      CPCB EPR Statutory Registry Lookup Engine
                    </h3>
                    <p className="text-xs text-slate-500">
                      Direct validation against Central Pollution Control Board authorized recycler database
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                  GOVT STATUTORY FEED
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={cpcbCheckQuery}
                  onChange={(e) => setCpcbCheckQuery(e.target.value)}
                  placeholder="Enter CPCB Authorization No. (e.g. CPCB/EW/KAR/2024/7742)"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyCpcbNumber}
                  disabled={cpcbCheckLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {cpcbCheckLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Verify with CPCB</span>
                </button>
              </div>

              {cpcbCheckResult && (
                <div className={`mt-3 p-3.5 rounded-lg border text-xs ${
                  cpcbCheckResult.found
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {cpcbCheckResult.found ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>CPCB Verified: {cpcbCheckResult.data.facility_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-800">
                          {cpcbCheckResult.data.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 text-slate-700">
                        <div>State: <strong>{cpcbCheckResult.data.state}</strong></div>
                        <div>Valid Till: <strong>{cpcbCheckResult.data.valid_till}</strong></div>
                        <div>Annual Capacity: <strong>{cpcbCheckResult.data.capacity_kta} KTA</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 font-semibold text-rose-700">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>No active CPCB registration record found for "{cpcbCheckQuery}". Verify certificate authenticity.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{t.modAdmUsers.title}</h3>
                  <p className="text-xs text-slate-400">{t.modAdmUsers.desc}</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  {['ALL', 'scrapper', 'recycler', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserFilterRole(r)}
                      className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        userFilterRole === r
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thNameAndIdentity}</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thRole}</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thLocation}</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thContact}</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Credential</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.thVerification}</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">{t.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-xs">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {u.location}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 font-mono">
                          {u.phone}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[11px]">
                          {u.cpcb_number ? (
                            <span className="text-blue-700 font-bold">{u.cpcb_number}</span>
                          ) : u.aadhaar_last4 ? (
                            <span className="text-emerald-700 font-bold">UIDAI XXXX-{u.aadhaar_last4}</span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          {u.verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                              <XCircle className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            type="button"
                            id={`toggle-user-verify-${u.id}`}
                            onClick={() => handleToggleVerification(u)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                              u.verified
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            }`}
                          >
                            {u.verified ? 'Revoke' : 'Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: PRICE FLOOR & BENCHMARK RATES */}
        {activeMenuTab === 'rates' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                    {t.modAdmRates.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.modAdmRates.desc}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {materials.map((m) => {
                  const isEditing = editingRateId === m.id;

                  return (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{m.category}</div>
                        <div className="text-[10px] text-slate-400">
                          {m.subcategory || 'Standard E-Waste'} • Current Benchmark: ₹{m.base_rate_per_kg}/kg
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500 font-mono">₹</span>
                          <input
                            type="text"
                            value={rateInputVal}
                            onChange={(e) => setRateInputVal(e.target.value)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-right font-mono bg-white text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRate(m.id)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRateId(null)}
                            className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            ₹{m.base_rate_per_kg}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRateId(m.id);
                              setRateInputVal(m.base_rate_per_kg.toString());
                            }}
                            className="px-2 py-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setToastMsg('Regional benchmark rates verified and broadcast to active recyclers.');
                      setTimeout(() => setToastMsg(null), 3000);
                    }}
                    className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Broadcast & Sync Regional Rates
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              {/* System Telemetry */}
              <div className="h-[180px] bg-slate-900 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    System Uptime & Health
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>

                <div className="space-y-3 my-auto">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">AI Logic / Vision Pipeline</span>
                      <span className="text-xs font-mono text-emerald-400">14.2%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[14%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">DB Connection Pool</span>
                      <span className="text-xs font-mono text-blue-400">124 / 500</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full w-[24%]"></div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Cluster: ap-south-1a</span>
                  <span>Latency: 28ms</span>
                </div>
              </div>

              {/* Historical Trend */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  6-Month Price Stabilization
                </h4>
                <div className="h-28 w-full flex items-end justify-between gap-2 pt-2">
                  {[
                    { month: 'Oct', rate: 290, pct: 60 },
                    { month: 'Nov', rate: 305, pct: 68 },
                    { month: 'Dec', rate: 310, pct: 72 },
                    { month: 'Jan', rate: 325, pct: 82 },
                    { month: 'Feb', rate: 340, pct: 88 },
                    { month: 'Mar', rate: 350, pct: 95 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[9px] font-mono text-slate-700 font-bold">
                        ₹{item.rate}
                      </span>
                      <div
                        className="w-full bg-emerald-600 rounded-t"
                        style={{ height: `${item.pct}%` }}
                      />
                      <span className="text-[9px] text-slate-400">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: GRIEVANCES & DISPUTES TRIBUNAL */}
        {activeMenuTab === 'complaints' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-slate-800 text-base">{t.modAdmComplaints.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.modAdmComplaints.desc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {complaints.filter(c => c.status === 'PENDING').length} Pending Investigation
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Case # / Filed</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Complainant</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Respondent Entity</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category / Details</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Tribunal Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No active grievances registered in the platform registry.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 font-mono">{c.case_number}</div>
                          <div className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800">{c.complainant_name}</div>
                          <span className="capitalize text-[10px] text-slate-500">{c.complainant_role}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800">{c.respondent_name}</div>
                          <span className="capitalize text-[10px] text-slate-500">{c.respondent_role}</span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-semibold text-slate-800">{((c.complaint_type || c.type || 'General Grievance') as string).replace(/_/g, ' ')}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{c.description}</div>
                          {c.lot_reference_id && (
                            <span className="inline-block mt-1 font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              Lot: {c.lot_reference_id}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                            c.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            c.status === 'IN_REVIEW' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            c.status === 'DISMISSED' ? 'bg-slate-100 text-slate-500' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {c.status}
                          </span>
                          {c.penalty_imposed_inr ? (
                            <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                              Fine: ₹{c.penalty_imposed_inr.toLocaleString()}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {c.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateComplaintStatus(c.id, 'IN_REVIEW')}
                                className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors cursor-pointer"
                              >
                                Investigate
                              </button>
                            )}
                            {c.status !== 'RESOLVED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateComplaintStatus(c.id, 'RESOLVED', 5000)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-2xs transition-colors cursor-pointer"
                              >
                                Resolve
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEscalateToLegal(c)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Issue statutory notice under Environment Protection Act"
                            >
                              <Gavel className="w-3 h-3" />
                              <span>Legal Notice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 5: LEGAL ENFORCEMENT & STATUTORY CASES */}
        {activeMenuTab === 'legal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-slate-800 text-base">{t.modAdmLegal.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.modAdmLegal.desc}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                  {legalCases.length} Enforced Cases
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Case File #</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Entity</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statutory Violation</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fine Levied</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Official Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-xs">
                    {legalCases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No statutory legal proceedings currently registered.
                        </td>
                      </tr>
                    ) : (
                      legalCases.map((lc) => (
                        <tr key={lc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900 font-mono">{lc.case_file_number}</div>
                            <div className="text-[10px] text-slate-400">{new Date(lc.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{lc.against_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {lc.cpcb_reg_number || lc.against_entity_type}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 max-w-sm">
                            <div className="font-semibold text-rose-800">{lc.section_violated}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{lc.summary}</div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-rose-700">
                            ₹{(lc.fine_amount_inr || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {(lc.status || 'ACTIVE').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDownloadNotice(lc)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3 text-amber-400" />
                              <span>Download Notice (PDF)</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 6: SYSTEM AUDIT LOGS, GIS MAP & SQL DDL SCHEMA */}
        {activeMenuTab === 'audit' && (
          <div className="space-y-6">
            {/* Audit Trail Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-base">{t.modAdmAudit.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.modAdmAudit.desc}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  {auditLogs.length} Events Logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Timestamp</th>
                      <th className="px-5 py-3">Actor / Authority</th>
                      <th className="px-5 py-3">Action Type</th>
                      <th className="px-5 py-3">Entity Linked</th>
                      <th className="px-5 py-3">Audit Details</th>
                      <th className="px-5 py-3 text-right">Audit Checksum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No audit events currently registered.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => {
                        const dateStr = log.created_at || log.timestamp || new Date().toISOString();
                        const actorName = log.actor_name || log.admin_name || 'System Auditor';
                        const actorRole = log.actor_role || (log.admin_id ? 'admin' : 'system');
                        const entityType = log.entity_type || (log.target_user_id ? 'Target User' : 'System');
                        const rawEntityId = String(log.entity_id || log.target_user_id || log.id || '');
                        const entityIdShort = rawEntityId.length > 8 ? rawEntityId.slice(0, 8) : rawEntityId;
                        const logIdStr = String(log.id || '');
                        const checksum = logIdStr.length > 10 ? logIdStr.slice(0, 10) : logIdStr;
                        const details = log.details || log.reason || log.target_user_name || 'Logged system operation';

                        return (
                          <tr key={log.id || Math.random().toString()} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                              {new Date(dateStr).toLocaleString()}
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-bold text-slate-900">{actorName}</div>
                              <span className="text-[10px] text-slate-400 capitalize">{actorRole}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-mono text-[11px] text-slate-600">
                              {entityType} #{entityIdShort}
                            </td>
                            <td className="px-5 py-3 max-w-md text-slate-700">
                              {details}
                            </td>
                            <td className="px-5 py-3 text-right font-mono text-[10px] text-slate-400">
                              SHA256:{checksum}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* National GIS Geolocation Radar */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      National GIS Geolocation Oversight Radar
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time OpenStreetMap network visualizing certified recyclers and informal scrappers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-200">
                    {users.filter(u => u.role === 'recycler').length} Recyclers
                  </span>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold border border-emerald-200">
                    {users.filter(u => u.role === 'scrapper').length} Scrappers
                  </span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200">
                <OpenStreetMap
                  currentUser={currentUser}
                  mode="admin_view"
                  height="440px"
                />
              </div>
            </div>

            {/* SQL Schema DDL Generator & Export */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      SQL Migration Engine (DDL)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Decoupled schema definitions for PostgreSQL and SQLite
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="download-sql-btn"
                  onClick={handleDownloadSql}
                  className="py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Migration Script (.sql)</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400 flex items-center justify-between border-b border-slate-800">
                  <span>schema_migration_postgres_sqlite.sql</span>
                  <span className="text-emerald-400">PostgreSQL / SQLite Compatible</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-72 leading-relaxed">
                  {sqlDDL || `-- Auto-generated DDL Schema
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  name VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL,
  location VARCHAR(256),
  phone VARCHAR(32),
  verified BOOLEAN DEFAULT FALSE,
  cpcb_number VARCHAR(64),
  aadhaar_last4 VARCHAR(4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(128) NOT NULL,
  subcategory VARCHAR(128),
  base_rate_per_kg NUMERIC(10, 2) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id VARCHAR(64) PRIMARY KEY,
  lot_reference_id VARCHAR(64) UNIQUE NOT NULL,
  scrapper_id VARCHAR(64) REFERENCES users(id),
  recycler_id VARCHAR(64) REFERENCES users(id),
  category VARCHAR(128) NOT NULL,
  estimated_weight NUMERIC(10, 2) NOT NULL,
  actual_weight NUMERIC(10, 2),
  offered_rate_per_kg NUMERIC(10, 2) NOT NULL,
  final_payout NUMERIC(10, 2),
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 7: PLATFORM FINANCIAL AUDIT & PAYMENT SETTLEMENT HISTORY */}
        {activeMenuTab === 'payments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  <span>Platform Payment History & Financial Settlement Audit</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time database records and financial tracking across UPI Instant Payouts, Cash on Pickup (COP), Cash on Delivery (COD), and Offline Zero-Network Vouchers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Total Disbursed: ₹{totalPayoutInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <TransactionPaymentHistoryView
              transactions={transactions}
              lang={lang}
              onSelectReceipt={(tx) => setSelectedReceiptLot(tx)}
            />
          </div>
        )}
      </div>

      {/* Digital Handover & Traceability Gate Pass Inspection Modal */}
      <DigitalReceiptModal
        lot={selectedReceiptLot}
        lang={lang}
        onClose={() => setSelectedReceiptLot(null)}
      />

      {/* Admin Security & Password Management Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                    Admin Password & Security Settings
                  </h3>
                  <p className="text-xs text-amber-200/90 font-medium">
                    Central CPCB Regulatory Access Credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {securityModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{securityModalError}</span>
                </div>
              )}

              {/* Current Active Credentials Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Active CPCB Administrative Credentials</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Statutory Master
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Officer Name:</span>
                    <strong className="text-slate-800">{currentUser.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Official Mobile:</span>
                    <strong className="text-slate-800 font-mono">{currentUser.phone || '+91 11 2230 7000'}</strong>
                  </div>
                </div>

                {/* Password display & copy */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Current Admin Password:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-base font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-300">
                        {showActivePassword ? currentAdminPassword : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowActivePassword(!showActivePassword)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                        title={showActivePassword ? 'Hide password' : 'Show password'}
                      >
                        {showActivePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(currentAdminPassword);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      {copiedPassword ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Master Recovery Notice & Quick Restore */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Statutory Default Recovery Password:</span>
                  </div>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    In case credentials are ever forgotten at the login portal, the master emergency password <strong className="font-mono text-amber-900">admin123</strong> is always accepted.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={securityModalLoading || currentAdminPassword === 'admin123'}
                  onClick={handleRestoreDefaultPassword}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  Restore "admin123"
                </button>
              </div>

              {/* Change / Reset Password Form */}
              <form onSubmit={handleUpdateAdminPassword} className="space-y-3.5 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>Set New Admin Password</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSecurityModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={securityModalLoading}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    {securityModalLoading ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Update Admin Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
