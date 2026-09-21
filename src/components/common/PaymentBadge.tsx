import React from 'react';
import { PaymentMode, PaymentStatus } from '../../types';
import {
  QrCode, Banknote, Truck, Building2, WifiOff,
  Landmark, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';

interface PaymentBadgeProps {
  mode: PaymentMode;
  status?: PaymentStatus;
  voucherOrRef?: string;
  className?: string;
  showStatus?: boolean;
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({
  mode,
  status = 'PAID',
  voucherOrRef,
  className = '',
  showStatus = false
}) => {
  const getModeConfig = () => {
    switch (mode) {
      case 'UPI':
      case 'UPI_DIGITAL':
        return {
          label: 'UPI Instant Payout',
          shortLabel: 'UPI Digital',
          icon: QrCode,
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          iconColor: 'text-indigo-600',
          dotColor: 'bg-indigo-500'
        };
      case 'CASH_ON_PICKUP':
        return {
          label: 'Cash on Pickup (COP)',
          shortLabel: 'Cash on Pickup',
          icon: Truck,
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          iconColor: 'text-emerald-600',
          dotColor: 'bg-emerald-500'
        };
      case 'CASH_ON_DELIVERY':
        return {
          label: 'Cash on Delivery (COD)',
          shortLabel: 'Cash on Delivery',
          icon: Building2,
          bg: 'bg-teal-50 text-teal-900 border-teal-200',
          iconColor: 'text-teal-600',
          dotColor: 'bg-teal-500'
        };
      case 'OFFLINE_PAYMENT':
        return {
          label: 'Offline Payment Voucher',
          shortLabel: 'Offline Voucher',
          icon: WifiOff,
          bg: 'bg-amber-50 text-amber-950 border-amber-300',
          iconColor: 'text-amber-700',
          dotColor: 'bg-amber-600'
        };
      case 'BANK_TRANSFER':
        return {
          label: 'Bank NEFT/RTGS',
          shortLabel: 'Bank Transfer',
          icon: Landmark,
          bg: 'bg-sky-50 text-sky-900 border-sky-200',
          iconColor: 'text-sky-600',
          dotColor: 'bg-sky-500'
        };
      case 'CASH':
      default:
        return {
          label: 'Spot Physical Cash',
          shortLabel: 'Physical Cash',
          icon: Banknote,
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          iconColor: 'text-emerald-600',
          dotColor: 'bg-emerald-500'
        };
    }
  };

  const cfg = getModeConfig();
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${cfg.bg} ${className}`}
      title={voucherOrRef ? `${cfg.label} (${voucherOrRef})` : cfg.label}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.iconColor}`} />
      <span>{cfg.shortLabel}</span>
      {voucherOrRef && (
        <span className="font-mono text-[10px] opacity-75 font-semibold">
          • {voucherOrRef}
        </span>
      )}
      {showStatus && (
        <span
          className={`ml-1 px-1.5 py-0.2 rounded text-[10px] uppercase font-mono font-bold ${
            status === 'PAID'
              ? 'bg-emerald-200/60 text-emerald-900'
              : status === 'PENDING'
              ? 'bg-amber-200/60 text-amber-900'
              : 'bg-slate-200 text-slate-800'
          }`}
        >
          {status}
        </span>
      )}
    </span>
  );
};
