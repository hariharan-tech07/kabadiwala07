import React, { useState } from 'react';
import { HouseholdPickupRequest, VernacularLang, User } from '../../types';
import { api } from '../../api/client';
import { notifyUser } from '../common/NotificationToast';
import {
  Truck, Home, Phone, MessageSquare, MapPin, Calendar, Clock,
  CheckCircle2, Scale, IndianRupee, ArrowRight, ExternalLink,
  Check, AlertCircle, Sparkles, Filter, ChevronRight, PackageCheck
} from 'lucide-react';

interface HouseholdPickupsModuleProps {
  pickups: HouseholdPickupRequest[];
  scrapperUser: User;
  onRefresh: () => Promise<void>;
  onOpenChat: (household: { id: string; name: string; role: string; phone?: string }) => void;
  onNavigateToCapture?: () => void;
  lang: VernacularLang;
}

export const HouseholdPickupsModule: React.FC<HouseholdPickupsModuleProps> = ({
  pickups,
  scrapperUser,
  onRefresh,
  onOpenChat,
  onNavigateToCapture,
  lang
}) => {
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'ACCEPTED' | 'COMPLETED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [collectModalPickup, setCollectModalPickup] = useState<HouseholdPickupRequest | null>(null);
  const [scaleWeight, setScaleWeight] = useState<string>('15');
  const [finalPayout, setFinalPayout] = useState<string>('720');

  const filtered = pickups.filter(p => {
    if (filter === 'ALL') return true;
    if (filter === 'SCHEDULED') return p.status === 'SCHEDULED' || p.status === 'PENDING';
    return p.status === filter;
  });

  const handleAcceptPickup = async (pickup: HouseholdPickupRequest) => {
    setUpdatingId(pickup.id);
    try {
      await api.updateHouseholdPickup(pickup.id, {
        status: 'ACCEPTED',
        scrapper_id: scrapperUser.id,
        scrapper_name: scrapperUser.name,
        scrapper_phone: scrapperUser.phone
      });
      notifyUser({
        title: 'Doorstep Pickup Accepted',
        message: `Accepted scrap pickup from ${pickup.household_name} for ${pickup.pickup_date}.`,
        type: 'status'
      });
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDoorstepCollection = async () => {
    if (!collectModalPickup) return;
    const w = parseFloat(scaleWeight) || collectModalPickup.estimated_weight_kg;
    const p = parseFloat(finalPayout) || (w * (collectModalPickup.offered_rate_per_kg || 45));

    setUpdatingId(collectModalPickup.id);
    try {
      await api.updateHouseholdPickup(collectModalPickup.id, {
        status: 'COMPLETED',
        actual_weight_kg: w,
        total_payout: p,
        scrapper_resale_status: 'COLLECTED_AT_DOORSTEP',
        completed_at: new Date().toISOString()
      });
      notifyUser({
        title: 'Scrap Collected & Paid',
        message: `Collected ${w} kg from ${collectModalPickup.household_name}. Payout ₹${p.toLocaleString('en-IN')} settled.`,
        type: 'payment'
      });
      setCollectModalPickup(null);
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 sm:p-6 rounded-2xl border border-blue-500/30 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 uppercase tracking-wider flex items-center gap-1 border border-blue-500/30">
              <Home className="w-3 h-3 text-blue-400" />
              Citizen Doorstep Grid
            </span>
            <span className="text-xs text-slate-400 font-semibold">Household Scrap Lots</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Household User Lots & Doorstep Collections
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Live household scrap pickup requests in your area. Accept doorstep bookings, chat directly with families, verify weights with your digital scale, and add collected scrap to your recycler lots.
          </p>
        </div>

        {/* Filter Controls (Clean Segmented Control - Zero Static Pills) */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shrink-0">
          {(['ALL', 'SCHEDULED', 'ACCEPTED', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL'
                ? `All (${pickups.length})`
                : tab === 'SCHEDULED'
                ? `Open / Scheduled (${pickups.filter(p => p.status === 'PENDING' || p.status === 'SCHEDULED').length})`
                : tab === 'ACCEPTED'
                ? `Accepted (${pickups.filter(p => p.status === 'ACCEPTED').length})`
                : `Completed (${pickups.filter(p => p.status === 'COMPLETED').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Lots List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-12 text-center shadow-md">
          <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Household Lots in this View</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            When household citizens in your neighborhood schedule e-waste doorstep collections, their requests appear here for immediate acceptance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const isAccepted = item.status === 'ACCEPTED';
            const isScheduled = item.status === 'SCHEDULED' || item.status === 'PENDING';

            return (
              <div
                key={item.id}
                className="bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-emerald-500/40 p-5 shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold shrink-0 border border-blue-500/30">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.household_name}</h4>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{item.household_phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isAccepted
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {item.id}
                      </span>
                    </div>
                  </div>

                  {/* Lot Details */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Scrap Category & Items
                      </span>
                      <strong className="text-white text-xs block mt-0.5">
                        {item.category}
                      </strong>
                      <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                        {item.items_description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold">Estimated Weight</span>
                        <span className="font-bold text-emerald-400 text-xs font-mono">
                          {item.actual_weight_kg || item.estimated_weight_kg} kg
                        </span>
                        {item.actual_weight_kg && (
                          <span className="text-[10px] text-emerald-400 block font-semibold">Scale Weighed</span>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold">Schedule Slot</span>
                        <span className="font-bold text-white text-xs">
                          {item.pickup_date}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.preferred_time_slot}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-slate-300 text-[11px] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="truncate">{item.household_address}</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onOpenChat({
                      id: item.household_id,
                      name: item.household_name,
                      role: 'household',
                      phone: item.household_phone
                    })}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>Chat with Household</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isScheduled && (
                      <button
                        type="button"
                        onClick={() => handleAcceptPickup(item)}
                        disabled={updatingId === item.id}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Pickup</span>
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        type="button"
                        onClick={() => {
                          setCollectModalPickup(item);
                          setScaleWeight(item.estimated_weight_kg.toString());
                          setFinalPayout(Math.round(item.estimated_weight_kg * (item.offered_rate_per_kg || 48)).toString());
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Weigh & Collect Scrap</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Collected (₹{item.total_payout || 936})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weigh at Doorstep & Collect Modal */}
      {collectModalPickup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Weigh & Settle Doorstep Scrap</h3>
                <p className="text-xs text-slate-500">Record digital scale weight and confirm citizen payout</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
              <div>Citizen: <strong className="text-slate-800">{collectModalPickup.household_name}</strong></div>
              <div>Items: <span className="text-slate-600">{collectModalPickup.items_description}</span></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scale Weight (Kilograms)
              </label>
              <input
                type="number"
                step="0.5"
                value={scaleWeight}
                onChange={(e) => {
                  setScaleWeight(e.target.value);
                  const w = parseFloat(e.target.value) || 0;
                  setFinalPayout(Math.round(w * (collectModalPickup.offered_rate_per_kg || 48)).toString());
                }}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Payout to Household (₹)
              </label>
              <input
                type="number"
                value={finalPayout}
                onChange={(e) => setFinalPayout(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold text-emerald-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCollectModalPickup(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDoorstepCollection}
                disabled={updatingId === collectModalPickup.id}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Confirm Collection & Payout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
