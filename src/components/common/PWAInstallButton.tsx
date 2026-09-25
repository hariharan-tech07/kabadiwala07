import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { AndroidAppModal } from './AndroidAppModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'mobile' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'header' 
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isInstalled 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          } ${className}`}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android App</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install Android App</span>
            </>
          )}
        </button>
        <AndroidAppModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isInstalled
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-98'
        } ${className}`}
        title="Install Kabadiwala Connect as Android App"
      >
        {isInstalled ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Android App Installed</span>
            <span className="sm:hidden">App Ready</span>
          </>
        ) : (
          <>
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install Android App</span>
          </>
        )}
      </button>

      <AndroidAppModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
