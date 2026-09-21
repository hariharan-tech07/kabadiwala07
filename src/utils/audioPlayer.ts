import { VernacularLang } from '../types';

// Vernacular Speech & Audio Narration Utility
// Provides authentic native audio for Marathi, Tamil, Hindi, and English
// Uses server-side high-fidelity TTS stream with browser SpeechSynthesis fallback

class VernacularAudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentId: string | null = null;
  private onStateChange: ((id: string | null, isPlaying: boolean, isLoading: boolean) => void) | null = null;

  public subscribe(callback: (id: string | null, isPlaying: boolean, isLoading: boolean) => void) {
    this.onStateChange = callback;
    return () => {
      this.onStateChange = null;
    };
  }

  public getCurrentId(): string | null {
    return this.currentId;
  }

  public stop() {
    // 1. Stop HTML5 audio stream
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.removeAttribute('src');
        this.currentAudio.load();
      } catch (e) {
        // ignore
      }
      this.currentAudio = null;
    }

    // 2. Stop browser speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    this.currentUtterance = null;
    const previousId = this.currentId;
    this.currentId = null;

    if (this.onStateChange && previousId) {
      this.onStateChange(null, false, false);
    }
  }

  public async play(id: string, text: string, lang: VernacularLang): Promise<void> {
    // If already playing this ID, toggle off
    if (this.currentId === id) {
      this.stop();
      return;
    }

    // Stop any existing playback first
    this.stop();

    this.currentId = id;
    if (this.onStateChange) {
      this.onStateChange(id, false, true); // loading state
    }

    try {
      // Primary Route: High-fidelity audio stream from /api/tts
      const ttsUrl = `/api/tts?tl=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
      const audio = new Audio();
      audio.preload = 'auto';
      this.currentAudio = audio;

      const playPromise = new Promise<void>((resolve, reject) => {
        audio.oncanplay = () => {
          if (this.currentId === id && this.onStateChange) {
            this.onStateChange(id, true, false); // playing state
          }
        };

        audio.onended = () => {
          if (this.currentId === id) {
            this.stop();
          }
          resolve();
        };

        audio.onerror = (e) => {
          console.warn('Audio stream failed, attempting speech synthesis fallback:', e);
          reject(e);
        };

        audio.src = ttsUrl;
        audio.play().catch(reject);
      });

      await playPromise;
    } catch (streamError) {
      console.warn('Fallback to SpeechSynthesis due to audio element error:', streamError);
      this.playSpeechSynthesisFallback(id, text, lang);
    }
  }

  private playSpeechSynthesisFallback(id: string, text: string, lang: VernacularLang) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.stop();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;

      const targetLang = lang === 'mr' ? 'mr-IN' : lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = targetLang;

      // Check available voices for Marathi, Tamil, Hindi or matching language
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v =>
        v.lang === targetLang ||
        v.lang.startsWith(lang) ||
        (lang === 'mr' && (v.name.toLowerCase().includes('marathi') || v.lang.includes('mr'))) ||
        (lang === 'ta' && (v.name.toLowerCase().includes('tamil') || v.lang.includes('ta'))) ||
        (lang === 'hi' && (v.name.toLowerCase().includes('hindi') || v.lang.includes('hi')))
      );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        if (this.currentId === id && this.onStateChange) {
          this.onStateChange(id, true, false);
        }
      };

      utterance.onend = () => {
        if (this.currentId === id) {
          this.stop();
        }
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        if (this.currentId === id) {
          this.stop();
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis totally unavailable:', e);
      this.stop();
    }
  }
}

export const vernacularAudio = new VernacularAudioPlayer();
