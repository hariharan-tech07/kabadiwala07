import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, getDocs, collection, setLogLevel } from 'firebase/firestore/lite';
import fs from 'fs';
import path from 'path';

setLogLevel('silent');

let firestoreInstance: any = null;
let firestoreConfig: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firestoreConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = getApps().length > 0 ? getApp() : initializeApp(firestoreConfig);
    firestoreInstance = getFirestore(app, firestoreConfig.firestoreDatabaseId);
    console.log(`[Firestore Server] Connected to Firestore Database: ${firestoreConfig.firestoreDatabaseId} (${firestoreConfig.projectId}) via Firestore Lite`);
  }
} catch (err) {
  console.warn('[Firestore Server] Initialization notice:', err);
}

export const serverDb = firestoreInstance;
export const config = firestoreConfig;

/**
 * Recursively cleans an object or array for Firestore:
 * - Removes any keys whose value is `undefined`.
 * - Converts `undefined` in arrays to `null`.
 * - Converts Dates to ISO strings.
 */
export function sanitizeForFirestore<T>(data: T): any {
  if (data === undefined) {
    return null;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(item => (item === undefined ? null : sanitizeForFirestore(item)));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

export async function syncDocToFirestore(collectionName: string, docId: string, data: any) {
  if (!firestoreInstance || !docId) return;
  try {
    const cleanData = sanitizeForFirestore(data);
    const docRef = doc(firestoreInstance, collectionName, docId);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.warn(`[Firestore Server] Error saving to ${collectionName}/${docId}:`, err);
  }
}

export async function removeDocFromFirestore(collectionName: string, docId: string) {
  if (!firestoreInstance || !docId) return;
  try {
    const docRef = doc(firestoreInstance, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`[Firestore Server] Error deleting ${collectionName}/${docId}:`, err);
  }
}

export async function seedFirestoreIfEmpty(data: {
  materials: any[];
  users: any[];
  recyclers: any[];
  transactions: any[];
  complaints: any[];
}) {
  if (!firestoreInstance) return;
  try {
    // Check if materials already seeded
    const materialsSnap = await getDocs(collection(firestoreInstance, 'materials'));
    if (materialsSnap.empty) {
      console.log('[Firestore Server] Seeding initial database records into Firestore...');
      for (const mat of data.materials) {
        await setDoc(doc(firestoreInstance, 'materials', mat.id), sanitizeForFirestore(mat));
      }
      for (const usr of data.users) {
        const { password, ...safeUser } = usr;
        await setDoc(doc(firestoreInstance, 'users', usr.id), sanitizeForFirestore(safeUser));
      }
      for (const rec of data.recyclers) {
        await setDoc(doc(firestoreInstance, 'recyclers', rec.id), sanitizeForFirestore(rec));
      }
      for (const tx of data.transactions) {
        await setDoc(doc(firestoreInstance, 'transactions', tx.id), sanitizeForFirestore(tx));
      }
      for (const cmp of data.complaints) {
        await setDoc(doc(firestoreInstance, 'complaints', cmp.id), sanitizeForFirestore(cmp));
      }
      console.log('[Firestore Server] Successfully seeded Firestore database collections.');
    }
  } catch (err) {
    console.warn('[Firestore Server] Seed warning:', err);
  }
}
