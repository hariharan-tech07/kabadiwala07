import React, { useState, useEffect } from 'react';
import { User, VernacularLang } from '../../types';
import { api } from '../../api/client';
import { notifyUser } from './NotificationToast';
import {
  ShieldAlert, ShieldCheck, Clock, CheckCircle2, RefreshCw,
  LogOut, ArrowRight, Building2, UserCheck, AlertCircle, Sparkles,
  FileCheck, Phone, MapPin, ExternalLink
} from 'lucide-react';

interface WaitingVerificationDashboardProps {
  user: User;
  lang: VernacularLang;
  onApproved: (approvedUser: User) => void;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
}

export const WaitingVerificationDashboard: React.FC<WaitingVerificationDashboardProps> = ({
  user,
  lang,
  onApproved,
  onLogout,
  onSwitchToAdmin
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isApprovingDemo, setIsApprovingDemo] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  const docketId = user.application_docket || `CPCB-REG-2026-${user.id.slice(-6).toUpperCase()}`;

  // Poll server for admin approval every 3.5 seconds
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const allUsers = await api.getUsers();
        const found = allUsers.find(u => u.id === user.id || u.username === user.username);
        if (found && found.verified && found.status !== 'Pending Verification') {
          if (isMounted) {
            setApprovedSuccess(true);
            notifyUser({
              title: 'CPCB License Approved & Activated!',
              message: `Your registration for ${found.name} has been approved by the Central Regulatory Directorate. Redirecting to your dashboard...`,
              type: 'status'
            });
            setTimeout(() => {
              if (isMounted) onApproved(found);
            }, 1800);
          }
        }
      } catch (err) {
        // Silent poll error
      }
    };

    const interval = setInterval(checkStatus, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user.id, user.username, onApproved]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const allUsers = await api.getUsers();
      const found = allUsers.find(u => u.id === user.id || u.username === user.username);
      if (found && found.verified && found.status !== 'Pending Verification') {
        setApprovedSuccess(true);
        setTimeout(() => onApproved(found), 1200);
      } else {
        notifyUser({
          title: 'Verification In Progress',
          message: `Application ${docketId} is currently under review by CPCB Regulatory Directorate officers.`,
          type: 'status'
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleQuickApproveDemo = async () => {
    setIsApprovingDemo(true);
    try {
      const updated = await api.updateUser(user.id, {
        verified: true,
        status: 'Active'
      });
      setApprovedSuccess(true);
      notifyUser({
        title: 'License Activated by CPCB',
        message: `Account for ${user.name} verified and granted access. Redirecting...`,
        type: 'status'
      });
      setTimeout(() => onApproved(updated), 1500);
    } catch (err) {
      // Fallback
      const fallback: User = { ...user, verified: true, status: 'Active' };
      setApprovedSuccess(true);
      setTimeout(() => onApproved(fallback), 1500);
    } finally {
      setIsApprovingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Directorate Ribbon */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
            CPCB
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Central Pollution Control Board • Directorate of E-Waste Compliance
            </div>
            <div className="text-sm font-extrabold text-white">
              Kabadiwala Connect — National Regulatory Formalization Network
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit / Log Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {approvedSuccess ? (
          <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Application Approved & License Activated!
            </h2>
            <p className="text-emerald-200 text-sm max-w-md mx-auto">
              CPCB Regulatory Directorate has verified your KYC credentials. Unlocking your operational dashboard now...
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Redirecting to {user.role === 'scrapper' ? 'Scrapper Android App' : 'Recycler Portal'}...</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        CPCB KYC Docket Under Review
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      Registration Pending Central Admin Verification
                    </h1>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Application Docket ID</span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 inline-block mt-0.5">
                    {docketId}
                  </span>
                </div>
              </div>

              {/* Regulatory Notice Banner */}
              <div className="my-5 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Statutory Notice under E-Waste (Management) Rules 2022:</strong>{' '}
                  All newly onboarded {user.role === 'scrapper' ? 'scrap collection yards and field collectors' : 'e-waste processing and dismantling facilities'}{' '}
                  must undergo first-time authorization review by the CPCB Regulatory Directorate. You are in the official verification queue. Once verified by the Admin, you will be automatically redirected to your full operations console.
                </div>
              </div>

              {/* Applicant Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-1">Registered Entity / Name</span>
                  <span className="font-bold text-white block truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-1">Applicant Role</span>
                  <span className="font-bold text-emerald-400 block capitalize">
                    {user.role === 'scrapper' ? 'Field Scrap Collector' : 'Authorized Recycler'}
                  </span>
                  <span className="text-[10px] text-slate-500">Tier-1 Formalization Track</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-1">Main Licensed Hub</span>
                  <span className="font-bold text-white block truncate" title={user.location}>
                    {user.location.split(',')[0]}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {user.location.split(',').slice(1).join(', ') || 'Bengaluru, India'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-1">Statutory Credential</span>
                  {user.cpcb_number ? (
                    <span className="font-mono font-bold text-blue-400 block truncate">{user.cpcb_number}</span>
                  ) : user.aadhaar_last4 ? (
                    <span className="font-mono font-bold text-emerald-400 block">UIDAI XXXX-{user.aadhaar_last4}</span>
                  ) : (
                    <span className="font-bold text-amber-400 block">Under Review</span>
                  )}
                  <span className="text-[10px] text-slate-500">Official Gov Document</span>
                </div>
              </div>

              {/* 3-Stage Progress Timeline */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Verification Lifecycle Status
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-emerald-300 block">Stage 1: Lodged</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Application and credentials successfully captured on blockchain ledger.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 relative">
                    <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-amber-300 block flex items-center gap-1.5">
                        <span>Stage 2: Directorate Review</span>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Central CPCB Officer verifying facility address and legal records.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 opacity-60">
                    <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-slate-400 font-bold">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-400 block">Stage 3: Dashboard Access</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Instant activation upon Admin authorization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Verification Controls */}
              <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualCheck}
                    disabled={isChecking}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? 'Checking with Directorate...' : 'Check Verification Status'}</span>
                  </button>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Auto-polling live</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onSwitchToAdmin && (
                    <button
                      type="button"
                      onClick={onSwitchToAdmin}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors cursor-pointer border border-amber-500/30 flex items-center gap-1.5"
                      title="Switch to CPCB Directorate Admin to approve this application"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Switch to CPCB Admin to Approve</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleQuickApproveDemo}
                    disabled={isApprovingDemo}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    title="Simulate immediate CPCB officer approval for testing"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isApprovingDemo ? 'Activating License...' : 'Instant Approve (Test Mode)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
