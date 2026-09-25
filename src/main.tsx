import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Android / PWA Service Worker for offline support and WebAPK installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[Android PWA] App update available');
      },
      onOfflineReady() {
        console.log('[Android PWA] App cached and ready for offline use in scrap yards');
      },
      onRegisterError(error) {
        console.info('[Android PWA] Service worker registration note:', error);
      },
    });
  } catch (swErr) {
    console.info('[Android PWA] Service worker initialization note:', swErr);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

