import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Check, FlipHorizontal } from 'lucide-react';

interface DeviceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const DeviceCameraModal: React.FC<DeviceCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStarting, setIsStarting] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (facing: 'environment' | 'user') => {
    stopStream();
    setIsStarting(true);
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser or environment.');
      }

      // Try with desired facingMode (environment for back camera on phone, user on laptop fallback)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (firstErr) {
        // Fallback to any available video camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Failed to access device camera:', err);
      let msg = 'Unable to access your device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is already in use by another app or tab.';
      }
      setError(msg);
    } finally {
      setIsStarting(false);
    }
  }, [stopStream]);

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startStream(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startStream, stopStream]);

  const handleFlipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image for natural selfie feel
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      stopStream();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    } else {
      startStream(facingMode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm tracking-tight">
              {capturedPhoto ? 'Review Scrap Photo' : 'Device Camera Feed'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!capturedPhoto && (
              <button
                type="button"
                onClick={handleFlipCamera}
                title="Switch Front / Rear Camera"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] max-h-[65vh] overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-sm text-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-rose-300">{error}</p>
              <button
                type="button"
                onClick={() => startStream(facingMode)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured Scrap"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {isStarting && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Initializing camera...</span>
                </div>
              )}

              {/* Viewfinder Reticle */}
              <div className="absolute inset-6 sm:inset-10 border-2 border-emerald-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
                  <span>[ LIVE SENSOR ]</span>
                  <span>[ E-WASTE FOCUS ]</span>
                </div>
                <div className="text-center">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/40">
                    Align scrap lot inside reticle
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
                  <span>AI SCALE READY</span>
                  <span>TAP SHUTTER</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Controls Bottom Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Retake Photo
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Use This Photo</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center relative">
              <button
                type="button"
                onClick={handleTakeSnapshot}
                disabled={isStarting || !!error}
                className="w-16 h-16 rounded-full bg-white hover:bg-emerald-400 p-1 border-4 border-slate-700 shadow-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-50"
                title="Capture Photo"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
