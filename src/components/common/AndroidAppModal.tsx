import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Camera, 
  MapPin, 
  Volume2, 
  Zap,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'features'>('install');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  const bubblewrapCommand = `npx @bubblewrap/cli init --manifest=https://${window.location.host}/manifest.webmanifest && npx @bubblewrap/cli build`;

  const copyCommand = () => {
    navigator.clipboard.writeText(bubblewrapCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const downloadTwaManifest = () => {
    const twaManifest = {
      packageId: "com.kabadiwala.connect",
      host: window.location.host,
      name: "Kabadiwala Connect",
      launcherName: "Kabadiwala",
      themeColor: "#065F46",
      navigationColor: "#065F46",
      backgroundColor: "#F0FDF4",
      startUrl: "/",
      iconUrl: `https://${window.location.host}/pwa-512x512.png`,
      maskableIconUrl: `https://${window.location.host}/pwa-maskable-512x512.png`,
      appVersionName: "1.0.0",
      appVersionCode: 1,
      shortcuts: [],
      generatorApp: "bubblewrap-cli",
      webManifestUrl: `https://${window.location.host}/manifest.webmanifest`,
      fallbackType: "customtabs",
      features: {
        locationDelegation: { enabled: true },
        playBilling: { enabled: false }
      },
      alphaDependencies: { enabled: false },
      enableNotifications: true
    };

    const blob = new Blob([JSON.stringify(twaManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'twa-manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Android Styling */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-5 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-emerald-300">
              <img src="/icon.svg" alt="App Icon" className="w-10 h-10 rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Kabadiwala Connect</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 border border-emerald-300/40">
                  Android App
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Circular E-Waste Network • WebAPK & Standalone App
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex gap-2 mt-4 pt-2 border-t border-emerald-600/50">
            <button
              onClick={() => setActiveTab('install')}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'install' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install on Android</span>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'features' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Android Features</span>
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'apk' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>APK / Package</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Tab 1: Install on Android */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Why install?</span> You are currently viewing this in a browser tab. Installing it adds the <strong>Kabadiwala Connect Android App icon</strong> directly to your phone's home screen and app drawer, enables <strong>offline scrap queueing</strong>, and removes browser address bars for a full-screen mobile experience.
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                      Already Running as Android App!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Kabadiwala Connect is active in standalone fullscreen mode on your device.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Package Information
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded font-bold">
                        v1.0.0
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">App Identifier</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">com.kabadiwala.connect</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Android Target</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Android 8.0+ (Oreo to 15+)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Install Engine</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Google Chrome WebAPK</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Permissions</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Camera & GPS Location</span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Install Button */}
                  {isInstallable ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base"
                    >
                      <Download className="w-5 h-5" />
                      <span>Install App on Android Phone (1-Tap)</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-100">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>How to Install on Any Android Phone:</span>
                      </div>
                      <ol className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1.5 list-decimal pl-4">
                        <li>Open this URL in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.</li>
                        <li>Tap the <strong>Three-Dots Menu (⋮)</strong> at the top right of your browser.</li>
                        <li>Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
                        <li>Android will generate an official <strong>WebAPK</strong> and add the app icon directly to your app drawer!</li>
                      </ol>
                    </div>
                  )}

                  {isIOS && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                      <strong>Using iPhone or iPad?</strong> Tap the <strong>Share</strong> icon in Safari toolbar, then choose <strong>"Add to Home Screen"</strong>.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab 2: Native Android Features */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Scrap Camera Lock</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Direct access to Android's native rear camera with autofocus for PCB and battery material classification.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Live GPS Yard Navigator</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Pinpoints the nearest CPCB-authorized recycler hubs within 50 km with direct Google Maps turn-by-turn routing.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Vernacular Voice Safety Narration</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Audio warnings in Hindi, Tamil, Kannada, Marathi & English speak safety alerts directly through the phone speaker.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Offline Scrap Yard Mode</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Works offline in remote industrial collection yards with ServiceWorker asset & price table caching.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Direct Download APK / Android Package */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-950 dark:text-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Download className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-50">
                        Direct Android APK Package Installer
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Official standalone installer for Scrappers & Field Collectors
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900">
                    v2.4.1
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-white/80 dark:bg-slate-900/60 rounded-lg border border-emerald-200/80 mb-3">
                  <div>
                    <span className="text-slate-500 block">Package Name:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">in.cpcb.kabadiwalaconnect.scrapper</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Architecture:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Universal (ARM64 / ARMv7)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Min SDK:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Android 8.0+ (Oreo to 15+)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Offline Vault:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">IndexedDB Database Enabled</span>
                  </div>
                </div>

                {/* Direct 1-Click APK Download Button */}
                <a
                  href="/downloads/KabadiwalaConnect-Scrapper-v2.4.1.apk"
                  download="KabadiwalaConnect-Scrapper-v2.4.1.apk"
                  id="direct-apk-modal-download-link"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download KabadiwalaConnect-Scrapper-v2.4.1.apk</span>
                </a>
              </div>

              {/* 3-Step Sideload Installation Guide */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How to Install on Android:</span>
                </h5>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                  <li>Tap the green <strong>Download APK</strong> button above to save the installer.</li>
                  <li>In Android Notification or Downloads folder, tap <strong>KabadiwalaConnect-Scrapper-v2.4.1.apk</strong>.</li>
                  <li>Tap <strong>Install</strong>. If prompted with <em>"Install unknown apps"</em>, toggle <strong>Allow from this source</strong>.</li>
                  <li>Open Kabadiwala Connect to access the offline camera vault and direct recycler hub dispatch!</li>
                </ol>
              </div>

              {/* Android Parse Error Troubleshooting Card */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Fix "There was a problem parsing the package" on Mobile:</span>
                </h5>
                <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-emerald-400">1. Instant 1-Tap Home Screen Install (Zero Parse Errors):</strong> On Android Chrome, tap the 3 dots (<span className="font-mono text-white bg-slate-800 px-1 py-0.2 rounded">⋮</span>) on top right and select <strong>"Install app"</strong> (or <em>"Add to Home screen"</em>). Google Chrome automatically installs the verified Android WebAPK with native camera access & offline storage!
                  </p>
                  <p>
                    <strong className="text-slate-100">2. Enable Sideload Permission:</strong> Go to Android <em>Settings &rarr; Apps &rarr; Chrome (or Files) &rarr; Install unknown apps</em> &rarr; toggle <strong>Allow from this source</strong>.
                  </p>
                  <p>
                    <strong className="text-slate-100">3. Android Version:</strong> Supported on Android 8.0 (Oreo) through Android 15+. Open using the native <em>Files by Google</em> app.
                  </p>
                </div>
              </div>

              {/* Developer / CLI info */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Alternative: Build Signed Play Store AAB
                  </span>
                  <button
                    type="button"
                    onClick={downloadTwaManifest}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>twa-manifest.json</span>
                  </button>
                </div>
                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto select-all pr-10">
                    {bubblewrapCommand}
                  </pre>
                  <button
                    type="button"
                    onClick={copyCommand}
                    className="absolute right-1.5 top-1.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>PWA & WebAPK Verified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
