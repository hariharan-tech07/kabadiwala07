import React, { useState } from 'react';
import { OfflinePhotoRecord, offlinePhotoDb } from '../../utils/offlinePhotoDb';
import { VernacularLang } from '../../types';
import {
  WifiOff, Wifi, Sparkles, CheckCircle2, Clock, Trash2,
  RefreshCw, AlertCircle, Eye, ArrowRight, ShieldCheck, Camera, Database, X
} from 'lucide-react';

interface OfflinePhotoVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: OfflinePhotoRecord[];
  onRefresh: () => Promise<void>;
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  lang: VernacularLang;
  simulateNoNetwork: boolean;
  onToggleSimulateNoNetwork: () => void;
  onViewLot?: (lotRefId: string) => void;
}

export const OfflinePhotoVaultModal: React.FC<OfflinePhotoVaultModalProps> = ({
  isOpen,
  onClose,
  photos,
  onRefresh,
  onSyncAll,
  isSyncing,
  lang,
  simulateNoNetwork,
  onToggleSimulateNoNetwork,
  onViewLot
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<OfflinePhotoRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOnline = navigator.onLine && !simulateNoNetwork;
  const pendingCount = photos.filter(p => p.status === 'pending_prediction').length;
  const convertedCount = photos.filter(p => p.status === 'converted_to_lot').length;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(id);
    try {
      await offlinePhotoDb.deletePhoto(id);
      await onRefresh();
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Offline Photo Vault Database
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{isOnline ? 'Network Connected' : 'Offline / Remote Yard'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Separate local database for photos taken in zero-network areas • Auto-predicted when online
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Status Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200">
              {pendingCount} Pending Prediction
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200">
              {convertedCount} Converted to Lots
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Simulate Offline */}
            <button
              type="button"
              onClick={onToggleSimulateNoNetwork}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                simulateNoNetwork
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
              title="Test offline behavior without disconnecting Wi-Fi"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>{simulateNoNetwork ? 'Simulating No Network (Active)' : 'Simulate No Network'}</span>
            </button>

            {/* Sync All Button */}
            <button
              type="button"
              onClick={onSyncAll}
              disabled={isSyncing || pendingCount === 0 || !isOnline}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Predicting via Gemini...' : 'Sync & Predict Offline Photos'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {photos.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-60" />
              <h4 className="font-bold text-slate-800 text-sm">No Offline Photos in Database</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                When you snap photos in remote collection yards with no internet, they are automatically stored in this separate offline database. Once network returns, Gemini AI predicts the material and adds it to your lots!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {photos.map((item) => {
                const isPending = item.status === 'pending_prediction';
                const isConverted = item.status === 'converted_to_lot';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isPending
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Photo Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative border border-slate-200 shadow-2xs">
                        <img
                          src={item.photo_data_url}
                          alt="Offline Scrap Capture"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[8px] font-black bg-slate-900/80 text-white font-mono">
                          {item.estimated_weight_kg} kg
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isPending ? 'Saved Offline' : 'AI Predicted'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-slate-900 mt-1 truncate">
                          {item.prediction?.category || item.category_hint || 'E-Waste Scrap Photo'}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Weight: <strong className="text-slate-800">{item.estimated_weight_kg} kg</strong> • Main Hub: <span className="truncate max-w-[120px]">{item.main_hub_address?.split(',')[0]}</span>
                        </div>

                        {item.prediction && (
                          <div className="mt-1 text-[11px] font-bold text-emerald-700">
                            Est: ₹{item.prediction.total_min_price?.toLocaleString('en-IN')} – ₹{item.prediction.total_max_price?.toLocaleString('en-IN')}
                          </div>
                        )}
                        {item.lot_reference_id && (
                          <div className="text-[10px] text-blue-700 font-mono font-bold mt-0.5">
                            Lot: {item.lot_reference_id}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="text-[10px] text-slate-400">
                        ID: <span className="font-mono">{item.id.slice(-8)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          disabled={isDeleting === item.id}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete from offline database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {isConverted && item.lot_reference_id && onViewLot && (
                          <button
                            type="button"
                            onClick={() => {
                              onViewLot(item.lot_reference_id!);
                              onClose();
                            }}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Lot</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>IndexedDB Secure Offline Photo Storage</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
