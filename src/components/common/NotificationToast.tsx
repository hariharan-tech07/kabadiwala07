import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VernacularLang, Transaction, User } from '../../types';
import { api } from '../../api/client';
import {
  playChatMessageSound,
  playTransactionAssignedSound,
  playGeneralChime
} from '../../utils/soundEffects';
import {
  Bell, CheckCircle2, AlertTriangle, Scale,
  UserPlus, MessageSquare, X, ArrowRight, Sparkles, ExternalLink
} from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'connection' | 'status' | 'weight' | 'payment' | 'dispute' | 'info' | 'chat' | 'assignment';
  timestamp: Date;
  lotId?: string;
  lotReferenceId?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Global dispatcher for notifications
type NotificationListener = (notification: AppNotification) => void;
const listeners: Set<NotificationListener> = new Set();

export const notifyUser = (notification: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string }) => {
  const fullNotification: AppNotification = {
    ...notification,
    id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date()
  };

  listeners.forEach(listener => {
    try {
      listener(fullNotification);
    } catch (e) {
      console.warn('Error in notification listener:', e);
    }
  });

  // Also dispatch window custom event for decoupled subscribers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kc-notification-event', { detail: fullNotification }));
  }

  // Play subtle audio feedback based on event type
  try {
    if (fullNotification.type === 'chat') {
      playChatMessageSound();
    } else if (fullNotification.type === 'connection' || fullNotification.type === 'assignment') {
      playTransactionAssignedSound();
    } else {
      playGeneralChime();
    }
  } catch {
    // ignore audio block
  }
};

const LOCALIZED_STRINGS: Record<VernacularLang, {
  dismiss: string;
  justNow: string;
  viewLot: string;
  openChat: string;
  demoTrigger: string;
  testConnectionReq: string;
  testStatusChange: string;
  newConnectionTitle: string;
  newConnectionMsg: string;
  weightVerifiedTitle: string;
  weightVerifiedMsg: (ref: string, wt: number) => string;
  paymentSettledTitle: string;
  paymentSettledMsg: (ref: string, amt: number) => string;
  disputeTitle: string;
  disputeMsg: (ref: string) => string;
}> = {
  en: {
    dismiss: 'Dismiss',
    justNow: 'Just now',
    viewLot: 'View Lot',
    openChat: 'Open Chat',
    demoTrigger: 'Simulate Live Alert',
    testConnectionReq: 'New Connection Request',
    testStatusChange: 'Transaction Status Change',
    newConnectionTitle: 'New Recycler Connection Request',
    newConnectionMsg: 'EcoRecycle Facility in Peenya requested to connect regarding your active e-waste broadcast.',
    weightVerifiedTitle: 'Bench Scale Weight Verified',
    weightVerifiedMsg: (ref, wt) => `Scale weighment for Lot ${ref} confirmed at ${wt} kg. Ready for your approval.`,
    paymentSettledTitle: 'Digital Payout Settled',
    paymentSettledMsg: (ref, amt) => `₹${amt.toLocaleString('en-IN')} successfully transferred via instant UPI for Lot ${ref}.`,
    disputeTitle: 'Transaction Dispute Filed',
    disputeMsg: (ref) => `Discrepancy reported on Lot ${ref}. CPCB Redressal Officer assigned.`
  },
  hi: {
    dismiss: 'हटाएं',
    justNow: 'अभी-अभी',
    viewLot: 'लॉट देखें',
    openChat: 'चैट खोलें',
    demoTrigger: 'अलर्ट जांचें',
    testConnectionReq: 'नया कनेक्शन अनुरोध',
    testStatusChange: 'लेनदेन स्थिति परिवर्तन',
    newConnectionTitle: 'नया रिसाइकलर कनेक्शन अनुरोध',
    newConnectionMsg: 'पीन्या स्थित ईको-रिसाइकल प्लांट ने आपके सक्रिय ई-कचरा लॉट पर कनेक्शन का अनुरोध किया है।',
    weightVerifiedTitle: 'काटा वजन सत्यापित हुआ',
    weightVerifiedMsg: (ref, wt) => `लॉट ${ref} का काटा वजन ${wt} किग्रा सत्यापित हुआ। कृपया स्वीकृति दें।`,
    paymentSettledTitle: 'डिजिटल भुगतान प्राप्त हुआ',
    paymentSettledMsg: (ref, amt) => `लॉट ${ref} हेतु ₹${amt.toLocaleString('en-IN')} का भुगतान सीधे यूपीआई में संपन्न हुआ।`,
    disputeTitle: 'लेनदेन विवाद दर्ज',
    disputeMsg: (ref) => `लॉट ${ref} पर विसंगति दर्ज की गई। सीपीसीबी अधिकारी नियुक्त किया गया।`
  },
  mr: {
    dismiss: 'बंद करा',
    justNow: 'आत्ताच',
    viewLot: 'लॉट पहा',
    openChat: 'चॅट उघडा',
    demoTrigger: 'थेट सूचना तपासा',
    testConnectionReq: 'नवीन कनेक्शन विनंती',
    testStatusChange: 'व्यवहार स्थिती बदल',
    newConnectionTitle: 'नवीन रिसायकलर कनेक्शन विनंती',
    newConnectionMsg: 'इकोरिसायकल केंद्राने तुमच्या ई-कचरा लॉटसाठी थेट जोडणीची विनंती पाठवली आहे.',
    weightVerifiedTitle: 'काटा वजन पडताळणी पूर्ण',
    weightVerifiedMsg: (ref, wt) => `लॉट ${ref} चे काटा वजन ${wt} किलो निश्चित झाले आहे. कृपया मंजुरी द्या.`,
    paymentSettledTitle: 'डिजिटल पैसे जमा झाले',
    paymentSettledMsg: (ref, amt) => `लॉट ${ref} साठी ₹${amt.toLocaleString('en-IN')} चा मोबदला थेट बँक/UPI मध्ये जमा झाला.`,
    disputeTitle: 'तक्रार दाखल',
    disputeMsg: (ref) => `लॉट ${ref} बाबत आक्षेप नोंदवला गेला. CPCB अधिकारी चौकशी करत आहेत.`
  },
  ta: {
    dismiss: 'மூடு',
    justNow: 'இப்போது',
    viewLot: 'லாட்டை பார்',
    openChat: 'அரட்டையை திற',
    demoTrigger: 'நேரடி அறிவிப்பு சோதனை',
    testConnectionReq: 'புதிய இணைப்பு கோரிக்கை',
    testStatusChange: 'பரிவர்த்தனை நிலை மாற்றம்',
    newConnectionTitle: 'புதிய மறுசுழற்சி இணைப்பு கோரிக்கை',
    newConnectionMsg: 'உங்கள் மின்னணுக் கழிவு லாட்டிற்கு மறுசுழற்சி மையம் இணைப்பு கோரிக்கை விடுத்துள்ளது.',
    weightVerifiedTitle: 'எடை சரிபார்ப்பு முடிந்தது',
    weightVerifiedMsg: (ref, wt) => `லாட் ${ref}-ன் எடை ${wt} கிலோ என உறுதிப்படுத்தப்பட்டுள்ளது. உங்கள் ஒப்புதலுக்கு தயாராக உள்ளது.`,
    paymentSettledTitle: 'பணம் செலுத்தப்பட்டது',
    paymentSettledMsg: (ref, amt) => `லாட் ${ref}-க்கு ₹${amt.toLocaleString('en-IN')} நேரடியாக UPI மூலம் வரவு வைக்கப்பட்டது.`,
    disputeTitle: 'முரண்பாடு பதிவு செய்யப்பட்டது',
    disputeMsg: (ref) => `லாட் ${ref} மீது முரண்பாடு தெரிவிக்கப்பட்டு CPCB மதிப்பாய்வுக்கு அனுப்பப்பட்டது.`
  }
};

interface NotificationToastContainerProps {
  currentUser: User | null;
  lang: VernacularLang;
  onNavigateToLot?: (lotId?: string) => void;
  onOpenChatWithUser?: (target: { id: string; name: string; role: string; phone?: string }) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  currentUser,
  lang,
  onNavigateToLot,
  onOpenChatWithUser
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const lastKnownStatusesRef = useRef<Map<string, string>>(new Map());
  const isInitialTxCheckRef = useRef<boolean>(true);
  const lastKnownChatIdsRef = useRef<Set<string>>(new Set());
  const isInitialChatCheckRef = useRef<boolean>(true);
  const loc = LOCALIZED_STRINGS[lang] || LOCALIZED_STRINGS.en;

  // Subscribe to notifyUser calls
  useEffect(() => {
    const handleNotification = (notif: AppNotification) => {
      setNotifications(prev => [notif, ...prev.slice(0, 3)]); // Keep max 4 active
      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      }, 7000);
    };

    listeners.add(handleNotification);
    return () => {
      listeners.delete(handleNotification);
    };
  }, []);

  // Monitor active transactions for newly assigned lots & status changes
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;

    const checkTransactions = async () => {
      try {
        const txs = await api.getTransactions();
        if (!isMounted || !txs || !Array.isArray(txs)) return;

        // Filter transactions relevant to current user
        const isRecycler = currentUser.role === 'recycler';
        const userTxs = txs.filter(t => 
          t.scrapper_id === currentUser.id ||
          t.recycler_id === currentUser.id ||
          (isRecycler && (t.recycler_id === 'rec-1' || t.recycler_name?.toLowerCase().includes('ecorecycle'))) ||
          currentUser.role === 'admin'
        );

        userTxs.forEach(tx => {
          const prevStatus = lastKnownStatusesRef.current.get(tx.id);
          const lotRef = tx.lot_reference_id || tx.id.slice(0, 8);

          // 1. Detect newly assigned transaction request to this recycler facility
          if (!prevStatus && !isInitialTxCheckRef.current) {
            const isAssignedToThisRecycler = isRecycler && (
              tx.recycler_id === currentUser.id ||
              tx.recycler_id === 'rec-1' ||
              tx.recycler_name?.toLowerCase().includes('ecorecycle')
            );

            if (isAssignedToThisRecycler) {
              notifyUser({
                title: lang === 'hi' 
                  ? 'नया लॉट अनुरोध असाइन हुआ' 
                  : lang === 'mr' 
                  ? 'नवीन लॉट विनंती सोपवली' 
                  : lang === 'ta' 
                  ? 'புதிய பரிவர்த்தனை கோரிக்கை ஒதுக்கப்பட்டது' 
                  : 'New Transaction Request Assigned',
                message: lang === 'hi'
                  ? `${tx.scrapper_name} ने नया ${tx.category} लॉट (${tx.estimated_weight} किग्रा) आपकी रिसाइकलिंग सुविधा को भेजा है।`
                  : lang === 'mr'
                  ? `${tx.scrapper_name} ने नवीन ${tx.category} लॉट (${tx.estimated_weight} किलो) तुमच्या सुविधेला पाठवला आहे.`
                  : lang === 'ta'
                  ? `${tx.scrapper_name} புதிய ${tx.category} லாட்டை (${tx.estimated_weight} கிலோ) உங்கள் வசதிக்கு ஒதுக்கியுள்ளார்.`
                  : `${tx.scrapper_name} assigned new ${tx.category} lot (${tx.estimated_weight} kg) to your facility.`,
                type: 'assignment',
                lotId: tx.id,
                lotReferenceId: lotRef,
                actionLabel: lang === 'hi' ? 'लॉट देखें' : lang === 'mr' ? 'लॉट पहा' : lang === 'ta' ? 'லாட்டை பார்' : 'Inspect Lot',
                onAction: () => onNavigateToLot?.(tx.id)
              });
            }
          } else if (prevStatus && prevStatus !== tx.status) {
            // 2. Existing transaction status changed!
            const verifiedWeight = tx.actual_weight || tx.estimated_weight;
            const payout = tx.final_payout || Math.round(verifiedWeight * tx.offered_rate_per_kg);

            if (tx.status === 'WEIGHT_VERIFIED') {
              notifyUser({
                title: loc.weightVerifiedTitle,
                message: loc.weightVerifiedMsg(lotRef, verifiedWeight),
                type: 'weight',
                lotId: tx.id,
                lotReferenceId: lotRef,
                actionLabel: loc.viewLot,
                onAction: () => onNavigateToLot?.(tx.id)
              });
            } else if (tx.status === 'PAID' || tx.status === 'COMPLETED') {
              notifyUser({
                title: loc.paymentSettledTitle,
                message: loc.paymentSettledMsg(lotRef, payout),
                type: 'payment',
                lotId: tx.id,
                lotReferenceId: lotRef,
                actionLabel: loc.viewLot,
                onAction: () => onNavigateToLot?.(tx.id)
              });
            } else if (tx.status === 'DISPUTED') {
              notifyUser({
                title: loc.disputeTitle,
                message: loc.disputeMsg(lotRef),
                type: 'dispute',
                lotId: tx.id,
                lotReferenceId: lotRef,
                actionLabel: loc.viewLot,
                onAction: () => onNavigateToLot?.(tx.id)
              });
            } else if (tx.status === 'ACCEPTED') {
              notifyUser({
                title: lang === 'hi' ? 'लॉट स्वीकार किया गया' : lang === 'mr' ? 'लॉट मंजूर झाला' : lang === 'ta' ? 'லாட் ஏற்கப்பட்டது' : 'Lot Accepted by Recycler',
                message: lang === 'hi' ? `रिसाइकलर ने लॉट ${lotRef} स्वीकार कर लिया है।` : lang === 'mr' ? `रिसायकलरने लॉट ${lotRef} स्वीकारला आहे.` : lang === 'ta' ? `மறுசுழற்சி ஆலை லாட் ${lotRef}-ஐ ஏற்றுக்கொண்டது.` : `Authorized facility accepted your collection offer for Lot ${lotRef}.`,
                type: 'status',
                lotId: tx.id,
                lotReferenceId: lotRef,
                actionLabel: loc.viewLot,
                onAction: () => onNavigateToLot?.(tx.id)
              });
            }
          }

          // Update ref
          lastKnownStatusesRef.current.set(tx.id, tx.status);
        });

        isInitialTxCheckRef.current = false;
      } catch (err) {
        // silent polling catch
      }
    };

    // Monitor incoming chats across the app
    const checkChats = async () => {
      try {
        const chats = await api.getChats({ user_id: currentUser.id });
        if (!isMounted || !chats || !Array.isArray(chats)) return;

        if (isInitialChatCheckRef.current) {
          chats.forEach(c => lastKnownChatIdsRef.current.add(c.id));
          isInitialChatCheckRef.current = false;
          return;
        }

        chats.forEach(chat => {
          if (!lastKnownChatIdsRef.current.has(chat.id)) {
            lastKnownChatIdsRef.current.add(chat.id);
            // Only alert if incoming message (from someone else)
            if (chat.sender_id !== currentUser.id) {
              notifyUser({
                title: lang === 'hi'
                  ? `${chat.sender_name} से नया संदेश`
                  : lang === 'mr'
                  ? `${chat.sender_name} कडून नवीन संदेश`
                  : lang === 'ta'
                  ? `${chat.sender_name} இடமிருந்து புதிய செய்தி`
                  : `New Message from ${chat.sender_name}`,
                message: chat.message.length > 80 ? chat.message.slice(0, 80) + '...' : chat.message,
                type: 'chat',
                lotReferenceId: chat.lot_reference_id,
                actionLabel: loc.openChat,
                onAction: () => {
                  if (onOpenChatWithUser) {
                    onOpenChatWithUser({
                      id: chat.sender_id,
                      name: chat.sender_name,
                      role: chat.sender_role || 'scrapper'
                    });
                  }
                }
              });
            }
          }
        });
      } catch (err) {
        // silent catch
      }
    };

    // Initial check
    checkTransactions();
    checkChats();

    // Poll every 5 seconds for status updates and chats
    const interval = setInterval(() => {
      checkTransactions();
      checkChats();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, lang, loc, onNavigateToLot, onOpenChatWithUser]);

  const dismissToast = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'assignment':
      case 'connection':
        return <UserPlus className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'weight':
        return <Scale className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'payment':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'dispute':
        return <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'status':
        return <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600 shrink-0" />;
    }
  };

  const getBadgeStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'assignment':
      case 'connection':
        return 'border-blue-300 bg-blue-50/95';
      case 'chat':
        return 'border-emerald-300 bg-emerald-50/95';
      case 'weight':
        return 'border-amber-300 bg-amber-50/95';
      case 'payment':
        return 'border-emerald-300 bg-emerald-50/95';
      case 'dispute':
        return 'border-rose-300 bg-rose-50/95';
      default:
        return 'border-slate-300 bg-white/95';
    }
  };

  return (
    <aside
      aria-label="System Notification Toasts"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 max-w-lg w-[calc(100%-2rem)] pointer-events-none transition-all duration-300"
    >
      {notifications.map((notif) => (
        <div
          key={notif.id}
          id={`notification-toast-${notif.id}`}
          className={`pointer-events-auto w-full p-4 rounded-2xl border-2 shadow-xl backdrop-blur-md flex items-start justify-between gap-3 text-slate-900 animate-in fade-in slide-in-from-top-4 duration-200 transition-all ${getBadgeStyle(
            notif.type
          )}`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200 mt-0.5">
              {getIcon(notif.type)}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black tracking-wide text-slate-900 uppercase">
                  {notif.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {loc.justNow}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {notif.message}
              </p>

              {/* Action Button if provided */}
              {notif.actionLabel && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      notif.onAction?.();
                      dismissToast(notif.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-all"
                  >
                    <span>{notif.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => dismissToast(notif.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition-colors cursor-pointer shrink-0"
            title={loc.dismiss}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </aside>
  );
};
