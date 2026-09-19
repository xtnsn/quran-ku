/**
 * TAHFIDZ TRACKER - AUDIO MANAGER (PRD v2)
 * Handles verse-by-verse and full-surah audio playback.
 */

import { store } from './store.js';

class AudioManager {
  constructor() {
    this.audio = typeof Audio !== 'undefined' ? new Audio() : null;
    this.isPlaying = false;
    this.currentTrack = null; // { type: 'verse'|'surah', surahNumber, surahName, ayatNumber, url }
    this.listeners = [];

    if (this.audio) {
      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify();
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.notify();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        this.isPlaying = false;
        this.notify();
      });
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn({
      isPlaying: this.isPlaying,
      track: this.currentTrack
    }));
  }

  playTrack({ type, surahNumber, surahName, ayatNumber = null, url }) {
    if (!url) {
      console.warn('No audio URL provided.');
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      if (typeof window !== 'undefined' && window.app) {
        window.app.showToast('Pemutaran murotal membutuhkan koneksi internet (Fitur online). Seluruh ayat tetap dapat dibaca secara offline.', 'info');
      }
      return;
    }

    // If same track is already playing, toggle pause
    if (this.currentTrack && this.currentTrack.url === url) {
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        this.audio.play().catch(e => {
          console.warn('Play error:', e);
          if (typeof window !== 'undefined' && window.app) {
            window.app.showToast('Koneksi internet diperlukan untuk pemutaran murotal.', 'info');
          }
        });
      }
      return;
    }

    this.audio.pause();
    this.audio.src = url;
    this.currentTrack = { type, surahNumber, surahName, ayatNumber, url };
    
    this.audio.play().catch(e => {
      console.warn('Audio play failed:', e);
      if (typeof window !== 'undefined' && window.app) {
        window.app.showToast('Koneksi internet diperlukan untuk pemutaran murotal.', 'info');
      }
    });
    this.notify();
  }

  togglePlayPause() {
    if (!this.audio.src) return;
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(e => console.warn('Play error:', e));
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.currentTrack = null;
    this.notify();
  }

  getReciter() {
    return store.data.settings.defaultReciter || "05";
  }

  setReciter(reciterId) {
    store.updateSettings({ defaultReciter: reciterId });
  }
}

export const audioManager = new AudioManager();
