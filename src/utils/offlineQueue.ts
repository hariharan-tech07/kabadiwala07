import { Transaction } from '../types';
import { api } from '../api/client';

const OFFLINE_QUEUE_KEY = 'kc_offline_lots_queue';

export interface QueuedLot {
  id: string;
  client_reference_id?: string;
  txData?: any;
  payload?: any;
  created_at: string;
  synced: boolean;
}

export const offlineQueue = {
  getQueuedLots(): QueuedLot[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getQueue(): QueuedLot[] {
    return this.getQueuedLots();
  },

  enqueueLot(txData: any): QueuedLot {
    const queue = this.getQueuedLots();
    const queuedItem: QueuedLot = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      client_reference_id: txData?.lot_reference_id || `LOT-${Date.now().toString(36).toUpperCase()}`,
      txData,
      payload: txData,
      created_at: new Date().toISOString(),
      synced: false
    };
    queue.push(queuedItem);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return queuedItem;
  },

  removeLot(queueId: string): void {
    const queue = this.getQueuedLots().filter(q => q.id !== queueId);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  },

  clearQueue(): void {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  async syncQueue(): Promise<{ syncedCount: number; errors: number; synced: number; failed: number }> {
    const queue = this.getQueuedLots();
    if (queue.length === 0) return { syncedCount: 0, errors: 0, synced: 0, failed: 0 };

    let syncedCount = 0;
    let errors = 0;
    const remaining: QueuedLot[] = [];

    for (const item of queue) {
      try {
        await api.createTransaction(item.txData || item.payload);
        syncedCount++;
      } catch (err) {
        console.error('Failed to sync offline lot:', err);
        errors++;
        remaining.push(item);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return { syncedCount, errors, synced: syncedCount, failed: errors };
  },

  async syncAll(): Promise<{ syncedCount: number; errors: number; synced: number; failed: number }> {
    return this.syncQueue();
  }
};
