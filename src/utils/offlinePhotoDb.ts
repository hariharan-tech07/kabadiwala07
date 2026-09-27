import { AIPredictionResult } from '../types';
import { api } from '../api/client';

export interface OfflinePhotoRecord {
  id: string;
  scrapper_id: string;
  scrapper_name: string;
  photo_data_url: string;
  file_name: string;
  mime_type: string;
  captured_at: string;
  estimated_weight_kg: number;
  category_hint?: string;
  notes?: string;
  main_hub_address: string;
  main_hub_coords: { latitude: number; longitude: number };
  status: 'pending_prediction' | 'predicted' | 'converted_to_lot';
  prediction?: AIPredictionResult;
  lot_reference_id?: string;
  error?: string;
}

const DB_NAME = 'KabadiwalaConnect_OfflinePhotoDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_photos';
const FALLBACK_STORAGE_KEY = 'kc_offline_photo_database_fallback';

class OfflinePhotoDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB not supported in this environment');
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('captured_at', 'captured_at', { unique: false });
          store.createIndex('scrapper_id', 'scrapper_id', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB open failed, falling back to localStorage');
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Fallback to localStorage if IndexedDB is blocked or restricted in iframe
  private getFallbackPhotos(): OfflinePhotoRecord[] {
    try {
      const data = localStorage.getItem(FALLBACK_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveFallbackPhotos(photos: OfflinePhotoRecord[]): void {
    try {
      localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(photos));
    } catch (e) {
      console.warn('localStorage quota reached for fallback offline photos:', e);
    }
  }

  async savePhoto(item: Omit<OfflinePhotoRecord, 'id' | 'captured_at' | 'status'>): Promise<OfflinePhotoRecord> {
    const record: OfflinePhotoRecord = {
      ...item,
      id: `off-photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      captured_at: new Date().toISOString(),
      status: 'pending_prediction'
    };

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.add(record);
        req.onsuccess = () => resolve(record);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // LocalStorage fallback
      const list = this.getFallbackPhotos();
      list.unshift(record);
      this.saveFallbackPhotos(list);
      return record;
    }
  }

  async getAllPhotos(): Promise<OfflinePhotoRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const results = (req.result as OfflinePhotoRecord[]) || [];
          results.sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getFallbackPhotos();
    }
  }

  async getPendingPhotos(): Promise<OfflinePhotoRecord[]> {
    const all = await this.getAllPhotos();
    return all.filter(p => p.status === 'pending_prediction');
  }

  async updatePhoto(id: string, updates: Partial<OfflinePhotoRecord>): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const current = getReq.result;
          if (current) {
            const updated = { ...current, ...updates };
            const putReq = store.put(updated);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
          } else {
            resolve();
          }
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch {
      const list = this.getFallbackPhotos();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        this.saveFallbackPhotos(list);
      }
    }
  }

  async deletePhoto(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFallbackPhotos().filter(p => p.id !== id);
      this.saveFallbackPhotos(list);
    }
  }

  async clearAll(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
    }
  }

  /**
   * Sync and predict all pending offline photos using Gemini Vision API
   * and convert them into broadcast-ready lots targeting the Scrapper's Main Hub!
   */
  async syncAndPredictPending(
    onProgress?: (index: number, total: number, photo: OfflinePhotoRecord) => void
  ): Promise<{
    processed: number;
    predicted: number;
    failed: number;
    convertedLots: any[];
    results: OfflinePhotoRecord[];
  }> {
    const pending = await this.getPendingPhotos();
    if (pending.length === 0) {
      return { processed: 0, predicted: 0, failed: 0, convertedLots: [], results: [] };
    }

    let predicted = 0;
    let failed = 0;
    const convertedLots: any[] = [];
    const results: OfflinePhotoRecord[] = [];

    for (let i = 0; i < pending.length; i++) {
      const photo = pending[i];
      try {
        onProgress?.(i + 1, pending.length, photo);

        // 1. Run AI Material Prediction
        const prediction = await api.predictMaterial({
          imageBase64: photo.photo_data_url,
          imageMimeType: photo.mime_type || 'image/jpeg',
          fileName: photo.file_name || `offline_capture_${photo.id}.jpg`,
          weightKg: photo.estimated_weight_kg || 15,
          categoryHint: photo.category_hint
        });

        // 2. Automatically create digital transaction targeting Scrapper's Main Hub
        const estimatedRate = prediction.estimated_rate_per_kg_min || 320;
        const lotTx = await api.createTransaction({
          scrapper_id: photo.scrapper_id,
          scrapper_name: photo.scrapper_name,
          recycler_id: 'rec-1',
          recycler_name: 'EcoRecycle Solutions Pvt Ltd',
          category: prediction.category || photo.category_hint || 'Mixed Electronic Scrap',
          estimated_weight: photo.estimated_weight_kg || 15,
          declared_weight: photo.estimated_weight_kg || 15,
          weight_confirmed_by_scrapper: true,
          offered_rate_per_kg: estimatedRate,
          // CRITICAL: Must use the Main Hub of the scrapper, not live roaming GPS!
          collection_gps: {
            latitude: photo.main_hub_coords?.latitude || 13.0315,
            longitude: photo.main_hub_coords?.longitude || 77.5210,
            address: photo.main_hub_address || 'Peenya Industrial Area Collection Hub (Plot 14, Main Yard), Bengaluru',
            hub_name: `${photo.scrapper_name}'s Registered Main Hub`,
            is_main_hub: true
          },
          payment_mode: 'UPI_DIGITAL',
          image_url: photo.photo_data_url,
          notes: `[Auto-Predicted from Offline Photo Vault] AI Confidence: ${prediction.confidence || 95}%. Pickup destination: Scrapper Main Hub.`
        });

        const updated: OfflinePhotoRecord = {
          ...photo,
          status: 'converted_to_lot',
          prediction,
          lot_reference_id: lotTx.lot_reference_id
        };

        await this.updatePhoto(photo.id, {
          status: 'converted_to_lot',
          prediction,
          lot_reference_id: lotTx.lot_reference_id
        });

        predicted++;
        convertedLots.push(lotTx);
        results.push(updated);
      } catch (err: any) {
        console.error(`Failed to predict offline photo ${photo.id}:`, err);
        failed++;
        await this.updatePhoto(photo.id, {
          error: err?.message || 'Prediction failed'
        });
      }
    }

    return {
      processed: pending.length,
      predicted,
      failed,
      convertedLots,
      results
    };
  }
}

export const offlinePhotoDb = new OfflinePhotoDatabase();
