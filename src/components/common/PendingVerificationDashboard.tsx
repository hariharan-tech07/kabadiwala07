import React, { useState, useEffect } from 'react';
import { User, VernacularLang } from '../../types';
import { api } from '../../api/client';
import { notifyUser } from './NotificationToast';
import {
  Clock, ShieldAlert, CheckCircle2, RefreshCw, AlertCircle,
  Building2, Truck, Phone, MapPin, FileCheck, ArrowRight,
  Sparkles, ExternalLink, LogOut, Check, ShieldCheck, HelpCircle
} from 'lucide-react';

interface PendingVerificationDashboardProps {
  user: User;
  onUserApproved: (approvedUser: User) => void;
  onLogout: () => void;
  lang?: VernacularLang;
}

export const PendingVerificationDashboard: React.FC<PendingVerificationDashboardProps> = ({
  user,
  onUserApproved,
  onLogout,
  lang = 'en'
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isSimulatingApprove, setIsSimulatingApprove] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string>(new Date().toLocaleTimeString());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto-poll status every 4 seconds to detect when Admin approves
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.checkUserStatus(user.id);
        if (res.is_verified || res.user.verified || res.user.status === 'Active') {
          notifyUser({
            title: '🎉 Application Approved!',
            message: `CPCB Regulatory Directorate has authorized your account. Redirecting to live dashboard...`,
            type: 'status'
          });
          onUserApproved(res.user);
        }
      } catch (err) {
        // Silent poll error catch
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user.id, onUserApproved]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    try {
      const res = await api.checkUserStatus(user.id);
      setLastCheckedAt(new Date().toLocaleTimeString());
      if (res.is_verified || res.user.verified || res.user.status === 'Active') {
        notifyUser({
          title: '🎉 Application Approved!',
          message: `Your account is officially verified. Welcome to Kabadiwala Connect!`,
          type: 'status'
        });
        onUserApproved(res.user);
      } else {
        setStatusMessage('Your application is currently under review by the CPCB Regulatory Directorate. Verification takes typically 10–30 minutes.');
      }
    } catch (err: any) {
      setStatusMessage('Unable to connect to verification server. Please check internet connection.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSimulateInstantApproval = async () => {
    setIsSimulatingApprove(true);
    try {
      const res = await api.approveUser(user.id);
      notifyUser({
        title: 'Instant Approval Verified',
        message: `Admin verification approved. Unlocking dashboard...`,
        type: 'status'
      });
      setTimeout(() => {
        onUserApproved(res.user);
      }, 700);
    } catch (err: any) {
      // Fallback local update
      const localApproved: User = {
        ...user,
        verified: true,
        status: 'Active',
        approval_status: 'approved'
      };
      localStorage.setItem('kc_session_user', JSON.stringify(localApproved));
      onUserApproved(localApproved);
    } finally {
      setIsSimulatingApprove(false);
    }
  };

  const isScrapper = user.role === 'scrapper';
  const roleTitle = isScrapper ? 'Field Scrap Collector (Kabadiwala)' : 'Authorized Recycler Facility';
  const docketNumber = user.application_docket || `CPCB-REG-2026-${user.id.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with CPCB Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4 pb-6 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">Kabadiwala Connect</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Verification Desk
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              National E-Waste Circular Traceability & Formalization Grid
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Waiting Card Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 z-10 space-y-6">
        {/* Status Hero Card */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Subtle accent border line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Application Pending First-Time Admin Approval
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Ref: <strong className="text-slate-200">{docketNumber}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {user.name}
              </h1>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Your registration as an <strong className="text-emerald-400">{roleTitle}</strong> has been successfully submitted. Under CPCB E-Waste (Management) Rules 2022, all commercial scrap operators must be verified once by the Central Regulatory Authority before commercial trading and digital weighment are unlocked.
              </p>
            </div>

            {/* Live radar status indicator */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shrink-0 text-center space-y-3 min-w-[200px]">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
                <div className="absolute inset-1 rounded-full border border-amber-400/40 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Clock className="w-6 h-6 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                </div>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  Status: In Review
                </span>
                <span className="text-[11px] text-slate-400">
                  Last checked: {lastCheckedAt}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Step Verification Timeline */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              CPCB Statutory Verification Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 relative">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                  <span>Step 1: Submitted</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs font-semibold text-slate-200">KYC & Yard Profile</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Application data and contact identity registered.</p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 relative">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                  <span>Step 2: Regulatory Review</span>
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div className="text-xs font-semibold text-slate-200">Statutory Check</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Verification of Aadhaar / CPCB CTE authorization.</p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 relative opacity-80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>Step 3: Admin Approval</span>
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-xs font-semibold text-slate-300">Authority Desk Signoff</div>
                <p className="text-[11px] text-slate-500 mt-0.5">CPCB Desk Officer activates trading credentials.</p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 relative opacity-60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Step 4: Live Access</span>
                  <Sparkles className="w-4 h-4 text-slate-600" />
                </div>
                <div className="text-xs font-semibold text-slate-400">Full Dashboard Active</div>
                <p className="text-[11px] text-slate-500 mt-0.5">AI Scale, household pickups & recycler dispatch.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submitted Registration Particulars */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Submitted Registration Particulars</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Role: <strong className="text-emerald-400 uppercase">{user.role}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Registered Name</span>
              <strong className="text-white text-xs block mt-0.5 truncate">{user.name}</strong>
              <span className="text-[11px] text-slate-400 mt-0.5 block">@{user.username}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Number</span>
              <strong className="text-white text-xs block mt-0.5">{user.phone || '+91 98450 12345'}</strong>
              <span className="text-[11px] text-emerald-400 mt-0.5 block flex items-center gap-1">
                <Check className="w-3 h-3" /> OTP Verified
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                {isScrapper ? 'Aadhaar / ID Last 4' : 'CPCB / CTE Number'}
              </span>
              <strong className="text-white text-xs block mt-0.5 font-mono truncate">
                {isScrapper ? `XXXX-XXXX-${user.aadhaar_last4 || '8821'}` : (user.cpcb_number || 'CPCB/EW/2026/PENDING')}
              </strong>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Statutory ID</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Facility / Hub Location</span>
              <strong className="text-white text-xs block mt-0.5 truncate">{user.location}</strong>
              <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> GPS Tagged
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Demo Simulator */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
              <span>Automatic Background Sync</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <p className="text-[11px] text-slate-400">
              This screen automatically checks every few seconds. Once approved by the Admin, you'll be redirected instantly.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Manual Check Status Button */}
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Check Status Now</span>
            </button>

            {/* Fast-Track Instant Demo Approval Button */}
            <button
              type="button"
              onClick={handleSimulateInstantApproval}
              disabled={isSimulatingApprove}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-md shadow-emerald-950/50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Click to simulate instant Admin approval for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{isSimulatingApprove ? 'Authorizing...' : 'Simulate Admin Approval (Demo)'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Helpline Contact Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            Need expedited verification or physical yard inspection? Contact CPCB Statutory Helpdesk:
          </p>
          <p className="text-slate-400 font-medium">
            📞 <strong>+91 11 2230 7000</strong> &nbsp;|&nbsp; ✉️ <strong>cpcb-desk@kabadiwalaconnect.org</strong> &nbsp;|&nbsp; Office Hours: 9:00 AM – 6:00 PM IST
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600 z-10">
        Kabadiwala Connect Regulatory Directorate • Central Pollution Control Board (CPCB) Verified • Role-Based Access Control
      </footer>
    </div>
  );
};
