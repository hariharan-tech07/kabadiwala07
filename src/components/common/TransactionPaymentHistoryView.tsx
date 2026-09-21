import React, { useState, useMemo } from 'react';
import { Transaction, PaymentMode, PaymentStatus, VernacularLang } from '../../types';
import { PaymentBadge } from './PaymentBadge';
import {
  Search, Filter, IndianRupee, QrCode, Truck, Building2,
  WifiOff, Landmark, ArrowUpDown, FileText, CheckCircle2,
  Clock, AlertTriangle, Layers, Download, Eye, Sparkles
} from 'lucide-react';

interface TransactionPaymentHistoryViewProps {
  transactions: Transaction[];
  lang?: VernacularLang;
  onSelectReceipt?: (tx: Transaction) => void;
  onOpenPaymentModal?: (tx: Transaction) => void;
}

export const TransactionPaymentHistoryView: React.FC<TransactionPaymentHistoryViewProps> = ({
  transactions,
  lang = 'en',
  onSelectReceipt,
  onOpenPaymentModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedFulfillmentFilter, setSelectedFulfillmentFilter] = useState<string>('ALL');
  const [expandedLotId, setExpandedLotId] = useState<string | null>(null);

  // Metrics calculation
  const stats = useMemo(() => {
    let totalValue = 0;
    let upiCount = 0;
    let upiValue = 0;
    let cashPickupCount = 0;
    let cashPickupValue = 0;
    let cashDeliveryCount = 0;
    let cashDeliveryValue = 0;
    let offlineCount = 0;
    let offlineValue = 0;
    let totalMassKg = 0;

    transactions.forEach(tx => {
      const payout = tx.final_payout || Math.round((tx.actual_weight || tx.estimated_weight) * tx.offered_rate_per_kg);
      const mass = tx.actual_weight || tx.estimated_weight || 0;
      totalMassKg += mass;

      if (tx.status === 'PAID' || tx.status === 'COMPLETED' || tx.payment_status === 'PAID') {
        totalValue += payout;
      }

      const mode = tx.payment_mode || 'UPI_DIGITAL';
      if (mode === 'UPI' || mode === 'UPI_DIGITAL') {
        upiCount++;
        upiValue += payout;
      } else if (mode === 'CASH_ON_PICKUP') {
        cashPickupCount++;
        cashPickupValue += payout;
      } else if (mode === 'CASH_ON_DELIVERY') {
        cashDeliveryCount++;
        cashDeliveryValue += payout;
      } else if (mode === 'OFFLINE_PAYMENT') {
        offlineCount++;
        offlineValue += payout;
      }
    });

    return {
      totalValue,
      upiCount,
      upiValue,
      cashPickupCount,
      cashPickupValue,
      cashDeliveryCount,
      cashDeliveryValue,
      offlineCount,
      offlineValue,
      totalMassKg,
      totalTransactions: transactions.length
    };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Mode filter
      if (selectedModeFilter !== 'ALL') {
        if (selectedModeFilter === 'UPI') {
          if (tx.payment_mode !== 'UPI' && tx.payment_mode !== 'UPI_DIGITAL') return false;
        } else if (tx.payment_mode !== selectedModeFilter) {
          return false;
        }
      }

      // Status filter
      if (selectedStatusFilter !== 'ALL') {
        const isPaid = tx.status === 'PAID' || tx.status === 'COMPLETED' || tx.payment_status === 'PAID';
        if (selectedStatusFilter === 'PAID' && !isPaid) return false;
        if (selectedStatusFilter === 'PENDING' && isPaid) return false;
        if (selectedStatusFilter === 'DISPUTED' && tx.status !== 'DISPUTED' && tx.payment_status !== 'DISPUTED') return false;
      }

      // Fulfillment filter
      if (selectedFulfillmentFilter !== 'ALL') {
        if (tx.fulfillment_type !== selectedFulfillmentFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const lotMatch = tx.lot_reference_id?.toLowerCase().includes(q);
        const nameMatch = tx.scrapper_name?.toLowerCase().includes(q) || tx.recycler_name?.toLowerCase().includes(q);
        const catMatch = tx.category?.toLowerCase().includes(q);
        const vchrMatch = tx.payment_details?.offline_voucher_no?.toLowerCase().includes(q)
          || tx.payment_details?.cash_receipt_no?.toLowerCase().includes(q)
          || tx.payment_details?.upi_txn_id?.toLowerCase().includes(q)
          || tx.payment_details?.bank_ref_no?.toLowerCase().includes(q);
        const scrapsMatch = tx.scraps_items?.some(sc => sc.name.toLowerCase().includes(q));

        if (!lotMatch && !nameMatch && !catMatch && !vchrMatch && !scrapsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedModeFilter, selectedStatusFilter, selectedFulfillmentFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        {/* Total Settled Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Settled Value
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              ₹
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-2">
            ₹{stats.totalValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>{stats.totalTransactions} total lots</span>
            <span>•</span>
            <span>{stats.totalMassKg.toFixed(1)} kg scraps</span>
          </div>
        </div>

        {/* UPI Payments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              UPI Instant Payouts
            </span>
            <QrCode className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950 font-mono mt-2">
            ₹{stats.upiValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-indigo-600 mt-1 font-bold">
            {stats.upiCount} transactions settled
          </div>
        </div>

        {/* Cash on Pickup / Delivery */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Cash on Pickup & Delivery
            </span>
            <Truck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-950 font-mono mt-2">
            ₹{(stats.cashPickupValue + stats.cashDeliveryValue).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-teal-600 mt-1 font-bold">
            {stats.cashPickupCount} pickup • {stats.cashDeliveryCount} delivery
          </div>
        </div>

        {/* Offline Payment Vouchers */}
        <div className="bg-white border border-amber-200 bg-amber-50/40 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Offline Vouchers
            </span>
            <WifiOff className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono mt-2">
            ₹{stats.offlineValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-800 mt-1 font-bold">
            {stats.offlineCount} zero-network slips
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Lot ID (#LOT-2026-...), Scrapper, Voucher/Receipt #, or Scrap name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment Mode Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Modes' },
              { id: 'UPI', label: 'UPI Payout' },
              { id: 'CASH_ON_PICKUP', label: 'Cash on Pickup' },
              { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery' },
              { id: 'OFFLINE_PAYMENT', label: 'Offline Voucher' },
              { id: 'BANK_TRANSFER', label: 'Bank UTR' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedModeFilter(mode.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedModeFilter === mode.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

        </div>

        {/* Secondary Filters (Status & Fulfillment) */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Status:</span>
            {['ALL', 'PAID', 'PENDING', 'DISPUTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedStatusFilter === st
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Fulfillment:</span>
            {['ALL', 'PICKUP', 'DELIVERY'].map((ful) => (
              <button
                key={ful}
                type="button"
                onClick={() => setSelectedFulfillmentFilter(ful)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFulfillmentFilter === ful
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ful}
              </button>
            ))}
          </div>

          <div className="text-slate-400 font-medium">
            Showing {filteredTransactions.length} of {transactions.length} records
          </div>
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm">No transaction records match the selected filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing the search or switching payment mode tab.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isPaid = tx.status === 'PAID' || tx.status === 'COMPLETED' || tx.payment_status === 'PAID';
              const mass = tx.actual_weight || tx.estimated_weight;
              const payout = tx.final_payout || Math.round(mass * tx.offered_rate_per_kg);
              const isExpanded = expandedLotId === tx.id;

              // Ref or voucher identifier
              const identifier = tx.payment_details?.offline_voucher_no
                || tx.payment_details?.cash_receipt_no
                || tx.payment_details?.upi_txn_id
                || tx.payment_details?.bank_ref_no;

              return (
                <div key={tx.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Left: Lot ID, Scrapper, Category & Date */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {tx.lot_reference_id}
                        </span>

                        {/* Fulfillment Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.fulfillment_type === 'DELIVERY'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.fulfillment_type || 'PICKUP'}
                        </span>

                        {/* Payment Mode Badge */}
                        <PaymentBadge
                          mode={tx.payment_mode || 'UPI_DIGITAL'}
                          status={isPaid ? 'PAID' : (tx.status === 'DISPUTED' ? 'DISPUTED' : 'PENDING')}
                          voucherOrRef={identifier}
                        />

                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(tx.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {tx.category}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">
                          (Sold by: <span className="text-slate-700 font-semibold">{tx.scrapper_name}</span>)
                        </span>
                      </div>

                      {/* Scraps items summary */}
                      {tx.scraps_items && tx.scraps_items.length > 0 && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="font-bold text-slate-700">Scrap Items:</span>
                          {tx.scraps_items.map((sc, i) => (
                            <span key={sc.id || i} className="bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {sc.name} ({sc.declared_weight_kg}kg)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Payout and Actions */}
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {mass} kg @ ₹{tx.offered_rate_per_kg}/kg
                        </span>
                        <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                          ₹{payout.toLocaleString('en-IN')}
                        </div>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isPaid ? 'PAID & RECONCILED' : 'PENDING SETTLEMENT'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {onSelectReceipt && (
                          <button
                            type="button"
                            onClick={() => onSelectReceipt(tx)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                            title="View CPCB Compliance Slip & Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        {!isPaid && onOpenPaymentModal && (
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(tx)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                          >
                            <span>Disburse</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedLotId(isExpanded ? null : tx.id)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 cursor-pointer"
                        >
                          {isExpanded ? 'Hide' : 'Details'}
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Expanded Lot & Scrap Items Breakdown Panel */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 bg-slate-50/70 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-100">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <strong className="text-slate-500 uppercase tracking-wider text-[10px] block">Recycler Facility</strong>
                          <span className="font-semibold text-slate-900">{tx.recycler_name}</span>
                        </div>
                        <div>
                          <strong className="text-slate-500 uppercase tracking-wider text-[10px] block">Collection Address</strong>
                          <span className="text-slate-700">{tx.collection_gps?.address || 'Designated Collection Point'}</span>
                        </div>
                        <div>
                          <strong className="text-slate-500 uppercase tracking-wider text-[10px] block">Weight Verification</strong>
                          <span className="font-semibold text-slate-900">
                            {tx.weight_confirmed_by_scrapper ? 'Scale Verified & Scrapper Confirmed' : 'Declared weight pending tare verification'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Details Card */}
                      {tx.payment_details && (
                        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Payment Reconcile Record
                            </span>
                            <span className="font-mono text-[10px] font-bold text-slate-500">
                              Logged: {tx.paid_at ? new Date(tx.paid_at).toLocaleString('en-IN') : 'Pending'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
                            {tx.payment_details.upi_id && (
                              <div>
                                <span className="text-slate-400 block">UPI Payee VPA:</span>
                                <span className="font-mono font-bold text-indigo-900">{tx.payment_details.upi_id}</span>
                              </div>
                            )}
                            {tx.payment_details.upi_txn_id && (
                              <div>
                                <span className="text-slate-400 block">UPI Ref / UTR:</span>
                                <span className="font-mono font-bold text-slate-900">{tx.payment_details.upi_txn_id}</span>
                              </div>
                            )}
                            {tx.payment_details.cash_receipt_no && (
                              <div>
                                <span className="text-slate-400 block">Cash Receipt #:</span>
                                <span className="font-mono font-bold text-emerald-900">{tx.payment_details.cash_receipt_no}</span>
                              </div>
                            )}
                            {tx.payment_details.cash_collected_by && (
                              <div>
                                <span className="text-slate-400 block">Collector Agent:</span>
                                <span className="font-semibold text-slate-900">{tx.payment_details.cash_collected_by}</span>
                              </div>
                            )}
                            {tx.payment_details.offline_voucher_no && (
                              <div>
                                <span className="text-slate-400 block">Offline Voucher #:</span>
                                <span className="font-mono font-black text-amber-900">{tx.payment_details.offline_voucher_no}</span>
                              </div>
                            )}
                            {tx.payment_details.offline_verified_by && (
                              <div>
                                <span className="text-slate-400 block">Offline Verifier:</span>
                                <span className="font-semibold text-slate-900">{tx.payment_details.offline_verified_by}</span>
                              </div>
                            )}
                          </div>

                          {tx.payment_details.offline_notes && (
                            <p className="text-[11px] text-amber-900 bg-amber-50/60 p-2 rounded border border-amber-200 mt-2">
                              <strong>Offline Memo:</strong> {tx.payment_details.offline_notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Scraps Detailed Table */}
                      {tx.scraps_items && tx.scraps_items.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Scrap Items & Fraction Audit ({tx.scraps_items.length} materials)
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400">
                                  <th className="pb-1 font-semibold">Material Grade</th>
                                  <th className="pb-1 font-semibold">Declared (kg)</th>
                                  <th className="pb-1 font-semibold">Verified (kg)</th>
                                  <th className="pb-1 font-semibold">Rate (₹/kg)</th>
                                  <th className="pb-1 font-semibold">Est. Amount</th>
                                  <th className="pb-1 font-semibold">Hazard Class</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {tx.scraps_items.map((sc) => (
                                  <tr key={sc.id}>
                                    <td className="py-1 font-medium text-slate-800">{sc.name}</td>
                                    <td className="py-1 font-mono">{sc.declared_weight_kg} kg</td>
                                    <td className="py-1 font-mono">{sc.verified_weight_kg ? `${sc.verified_weight_kg} kg` : '—'}</td>
                                    <td className="py-1 font-mono">₹{sc.rate_per_kg}</td>
                                    <td className="py-1 font-mono font-bold text-slate-900">₹{sc.estimated_amount}</td>
                                    <td className="py-1">
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                        sc.hazard_level === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                                        sc.hazard_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                                        'bg-slate-100 text-slate-700'
                                      }`}>
                                        {sc.hazard_level}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
