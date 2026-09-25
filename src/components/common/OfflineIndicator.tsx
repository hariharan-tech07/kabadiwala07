import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2.5 text-xs font-bold shadow-xl border border-amber-500 animate-pulse">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Scrap rates, safety rules & cached yard data are active.</span>
    </div>
  );
};
