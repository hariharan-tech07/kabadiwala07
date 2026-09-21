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

export async function syncDocToFirestore(collectionName: string, docId: string, data: any) {
  if (!firestoreInstance) return;
  try {
    const docRef = doc(firestoreInstance, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`[Firestore Server] Error saving to ${collectionName}/${docId}:`, err);
  }
}

export async function removeDocFromFirestore(collectionName: string, docId: string) {
  if (!firestoreInstance) return;
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
        await setDoc(doc(firestoreInstance, 'materials', mat.id), mat);
      }
      for (const usr of data.users) {
        const { password, ...safeUser } = usr;
        await setDoc(doc(firestoreInstance, 'users', usr.id), safeUser);
      }
      for (const rec of data.recyclers) {
        await setDoc(doc(firestoreInstance, 'recyclers', rec.id), rec);
      }
      for (const tx of data.transactions) {
        await setDoc(doc(firestoreInstance, 'transactions', tx.id), tx);
      }
      for (const cmp of data.complaints) {
        await setDoc(doc(firestoreInstance, 'complaints', cmp.id), cmp);
      }
      console.log('[Firestore Server] Successfully seeded Firestore database collections.');
    }
  } catch (err) {
    console.warn('[Firestore Server] Seed warning:', err);
  }
}
