// Subtle Audio Feedback System for Kabadiwala Connect
// Provides soft, non-intrusive Web Audio API sound effects for:
// 1. Incoming chat messages
// 2. New transaction requests assigned to a recycler
// 3. General notifications and status confirmations

class SoundFeedbackService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private lastChatSoundTime: number = 0;
  private lastTxSoundTime: number = 0;
  private listeners: Set<(enabled: boolean) => void> = new Set();
  private unlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kc_audio_feedback');
      this.isEnabled = saved !== 'false';

      // Auto-unlock AudioContext on first user interaction
      const unlock = () => {
        if (this.unlocked) return;
        this.getAudioContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        this.unlocked = true;
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };

      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      } catch (err) {
        console.warn('[AudioFeedback] Could not initialize Web Audio API:', err);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kc_audio_feedback', enabled ? 'true' : 'false');
    }
    this.listeners.forEach((listener) => {
      try {
        listener(enabled);
      } catch (e) {
        console.warn('[AudioFeedback] Error in listener:', e);
      }
    });
  }

  public toggleSound(): boolean {
    const next = !this.isEnabled;
    this.setSoundEnabled(next);
    if (next) {
      // Play a quick subtle confirmation beep
      this.playChatMessageSound();
    }
    return next;
  }

  public subscribe(callback: (enabled: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Plays a soft, gentle notification ping when a new message is received in the chat.
   * Uses smooth sinusoidal harmonics with an organic lowpass filter to prevent harshness.
   */
  public playChatMessageSound(): void {
    if (!this.isEnabled) return;
    const now = Date.now();
    // Debounce to prevent audio stacking if multiple poll events fire simultaneously
    if (now - this.lastChatSoundTime < 300) return;
    this.lastChatSoundTime = now;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;

      // Master output filter (gentle low-pass at 2400 Hz for warm, velvety tone)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.connect(ctx.destination);

      // Tone 1: 587.33 Hz (D5) - soft entry ping
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, t);
      osc1.frequency.exponentialRampToValueAtTime(659.25, t + 0.08); // subtle upward pitch inflection

      gain1.gain.setValueAtTime(0.0001, t);
      gain1.gain.linearRampToValueAtTime(0.06, t + 0.008); // 8ms soft attack (no clicks)
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc1.connect(gain1);
      gain1.connect(filter);
      osc1.start(t);
      osc1.stop(t + 0.2);

      // Tone 2: 880 Hz (A5) - soft resolving harmonic chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, t + 0.05);

      gain2.gain.setValueAtTime(0.0001, t + 0.05);
      gain2.gain.linearRampToValueAtTime(0.045, t + 0.058);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      osc2.connect(gain2);
      gain2.connect(filter);
      osc2.start(t + 0.05);
      osc2.stop(t + 0.3);
    } catch (e) {
      console.warn('[AudioFeedback] Chat sound playback failed:', e);
    }
  }

  /**
   * Plays a distinctive, soft, elegant ascending chime when a new transaction request
   * is assigned to a recycler facility.
   * Uses three gentle ascending musical intervals (C5 -> E5 -> G5) with a light shimmer.
   */
  public playTransactionAssignedSound(): void {
    if (!this.isEnabled) return;
    const now = Date.now();
    if (now - this.lastTxSoundTime < 500) return;
    this.lastTxSoundTime = now;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;

      // Master output filter (gentle lowpass for acoustic roundness)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, t);
      filter.connect(ctx.destination);

      // Notes: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz), with light octave sparkle C6 (1046.50 Hz)
      const notes = [
        { freq: 523.25, start: 0.0,  duration: 0.26, maxGain: 0.055 },
        { freq: 659.25, start: 0.08, duration: 0.30, maxGain: 0.065 },
        { freq: 783.99, start: 0.16, duration: 0.38, maxGain: 0.075 },
        { freq: 1046.50, start: 0.22, duration: 0.42, maxGain: 0.035 }
      ];

      notes.forEach(({ freq, start, duration, maxGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + start);

        // Soft envelope: 10ms attack, exponential decay to prevent clicking
        gain.gain.setValueAtTime(0.0001, t + start);
        gain.gain.linearRampToValueAtTime(maxGain, t + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + start + duration);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(t + start);
        osc.stop(t + start + duration + 0.02);
      });
    } catch (e) {
      console.warn('[AudioFeedback] Transaction sound playback failed:', e);
    }
  }

  /**
   * Generic notification chime fallback
   */
  public playGeneralChime(): void {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t); // E5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12); // A5

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch (e) {
      // ignore
    }
  }
}

export const soundEffects = new SoundFeedbackService();

// Export helper functions for direct import
export const playChatMessageSound = () => soundEffects.playChatMessageSound();
export const playTransactionAssignedSound = () => soundEffects.playTransactionAssignedSound();
export const playGeneralChime = () => soundEffects.playGeneralChime();
export const isAudioFeedbackEnabled = () => soundEffects.isSoundEnabled();
export const toggleAudioFeedback = () => soundEffects.toggleSound();
export const setAudioFeedbackEnabled = (enabled: boolean) => soundEffects.setSoundEnabled(enabled);
export const subscribeAudioFeedback = (cb: (enabled: boolean) => void) => soundEffects.subscribe(cb);
