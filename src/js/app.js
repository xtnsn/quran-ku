/**
 * TAHFIDZ TRACKER - MAIN APP ORCHESTRATOR (PRD v2)
 * Handles routing, view assembly, bottom navigation, bottom sheets, audio bar, and toast.
 */

import { auth } from './auth.js';
import { store } from './store.js';
import { audioManager } from './audio.js';
import { renderLoginView, initLoginEvents } from './views/loginView.js';
import { santriView } from './views/santriView.js';
import { guruView } from './views/guruView.js';
import { adminView } from './views/adminView.js';

class App {
  constructor() {
    this.currentRoute = 'home'; // 'home'|'quran'|'progress'|'profile' for santri, or role-specific
    this.currentSurahDetail = null;
    this.container = null;
    this.viewport = null;
    this.header = null;
    this.bottomNav = null;
    this.audioMiniBar = null;
    this.sheetBackdrop = null;
    this.toastContainer = null;
  }

  init() {
    this.container = document.getElementById('app-container');
    this.viewport = document.getElementById('main-viewport');
    this.header = document.getElementById('app-header');
    this.bottomNav = document.getElementById('bottom-nav');
    this.audioMiniBar = document.getElementById('audio-mini-bar');
    this.sheetBackdrop = document.getElementById('sheet-backdrop');
    this.toastContainer = document.getElementById('toast-container');

    // Subscribe to store updates (Re-render when cloud sync completes or data changes)
    store.subscribe(() => {
      const hasModalOpen = this.sheetBackdrop && this.sheetBackdrop.classList.contains('active');
      if (auth.isAuthenticated() && this.currentRoute !== 'quran-detail' && !hasModalOpen) {
        this.render();
      }
    });

    // Auto-sync with Supabase when window/app gains focus or becomes visible
    window.addEventListener('focus', () => {
      store.syncWithSupabase();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        store.syncWithSupabase();
      }
    });

    // Cross-tab sync in same browser via storage event
    window.addEventListener('storage', (e) => {
      if (e.key === 'tahfidz_tracker_data_v3') {
        store.data = store.load();
        store.notify();
      }
    });

    // Periodic auto-sync every 4 seconds for seamless multi-device synchronization
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        store.syncWithSupabase();
      }
    }, 4000);

    // Subscribe to auth changes (login / logout)
    auth.subscribe((user) => {
      this.currentRoute = 'home';
      this.currentSurahDetail = null;
      this.render();
    });

    // Subscribe to audio changes
    audioManager.subscribe((audioState) => {
      this.updateAudioMiniBar(audioState);
    });

    // Close bottom sheet on backdrop click
    if (this.sheetBackdrop) {
      this.sheetBackdrop.addEventListener('click', (e) => {
        if (e.target === this.sheetBackdrop) {
          this.closeBottomSheet();
        }
      });
    }

    // Setup Android Hardware Back Button
    this.setupBackButton();

    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration note:', err);
        });
      });
    }

    // Initial sync with database on startup
    store.syncWithSupabase().then(() => {
      if (!auth.isAuthenticated()) {
        this.render();
      }
    }).catch(() => {});

    // Initial render
    this.render();
  }

  setupBackButton() {
    let lastBackPress = 0;

    const handleBack = () => {
      // 1. If bottom sheet / modal is open, close it
      if (this.sheetBackdrop && this.sheetBackdrop.classList.contains('active')) {
        this.closeBottomSheet();
        return;
      }

      // 2. If viewing surah detail, go back to quran list
      if (this.currentRoute === 'quran-detail') {
        this.navigate('quran');
        return;
      }

      // 3. If guru viewing class detail, go back to class list
      const user = auth.getCurrentUser();
      if (user?.role === 'guru' && guruView.selectedClassId) {
        guruView.selectedClassId = null;
        this.render();
        return;
      }

      // 4. If on another tab than the root tab for the role, return to root
      const rootTab = user?.role === 'guru' ? 'classes' : (user?.role === 'developer' ? 'accounts' : 'home');
      if (this.currentRoute !== rootTab && auth.isAuthenticated()) {
        this.navigate(rootTab);
        return;
      }

      // 5. If already on root tab or login screen: double press within 2s to exit
      const now = Date.now();
      if (now - lastBackPress < 2000) {
        if (window.Capacitor?.Plugins?.App?.exitApp) {
          window.Capacitor.Plugins.App.exitApp();
        } else if (navigator.app?.exitApp) {
          navigator.app.exitApp();
        }
      } else {
        lastBackPress = now;
        this.showToast('Tekan sekali lagi untuk keluar dari aplikasi', 'info');
      }
    };

    // Listen via Capacitor App plugin
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        handleBack();
      });
    }

    // Fallback for Cordova / WebView backbutton event
    document.addEventListener('backbutton', (e) => {
      e.preventDefault();
      handleBack();
    }, false);
  }

  navigate(route) {
    this.currentRoute = route;
    this.currentSurahDetail = null;
    this.render();
    if (this.viewport) this.viewport.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openSurahDetail(surahNumber) {
    this.currentRoute = 'quran-detail';
    this.currentSurahDetail = surahNumber;
    this.render();
    if (this.viewport) this.viewport.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async render() {
    const user = auth.getCurrentUser();

    // 1. Not Authenticated -> Show Login View
    if (!user) {
      if (this.header) this.header.style.display = 'none';
      if (this.bottomNav) this.bottomNav.style.display = 'none';
      if (this.audioMiniBar) this.audioMiniBar.style.display = 'none';
      this.viewport.innerHTML = renderLoginView();
      initLoginEvents();
      return;
    }

    // 2. Authenticated -> Show Header & Bottom Nav
    if (this.header) {
      this.header.style.display = 'flex';
      this.renderHeader(user);
    }

    if (this.bottomNav) {
      this.bottomNav.style.display = 'flex';
      this.renderBottomNav(user);
    }

    // 3. Render Viewport Content according to Role & Route
    if (user.role === 'santri') {
      await this.renderSantriRoutes();
    } else if (user.role === 'guru') {
      await this.renderGuruRoutes();
    } else if (user.role === 'developer') {
      await this.renderAdminRoutes();
    }
  }

  renderHeader(user) {
    const roleColors = {
      santri: 'badge-success',
      guru: 'badge-primary',
      developer: 'badge-warning'
    };

    const roleLabels = {
      santri: 'Santri',
      guru: 'Guru',
      developer: 'Admin'
    };

    this.header.innerHTML = `
      <div class="header-brand">
        <div class="header-logo">TT</div>
        <div class="header-title-group">
          <h1>Tahfidz Tracker</h1>
          <div class="header-subtitle">${user.nama}</div>
        </div>
      </div>

      <div class="header-actions">
        <div class="user-badge-chip">
          <span class="role-dot"></span>
          <span>${roleLabels[user.role] || user.role}</span>
        </div>
      </div>
    `;
  }

  renderBottomNav(user) {
    let tabs = [];

    if (user.role === 'santri') {
      // PRD v2 Section 2 & 5.2: 4 Tabs (Home, Quran, Progress, Profil)
      tabs = [
        {
          id: 'home',
          label: 'Home',
          icon: `<svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
        },
        {
          id: 'quran',
          label: 'Al-Qur\'an',
          icon: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
        },
        {
          id: 'progress',
          label: 'Progress',
          icon: `<svg viewBox="0 0 24 24"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>`
        },
        {
          id: 'profile',
          label: 'Profil',
          icon: `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
        }
      ];
    } else if (user.role === 'guru') {
      // Guru Navigation Tabs
      tabs = [
        {
          id: 'classes',
          label: 'Kelas & Santri',
          icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
        },
        {
          id: 'history',
          label: 'Riwayat Validasi',
          icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>`
        },
        {
          id: 'profile',
          label: 'Profil Guru',
          icon: `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
        }
      ];
    } else if (user.role === 'developer') {
      // Developer Navigation Tabs
      tabs = [
        {
          id: 'accounts',
          label: 'Kelola Akun',
          icon: `<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`
        },
        {
          id: 'overview',
          label: 'Monitoring',
          icon: `<svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>`
        },
        {
          id: 'profile',
          label: 'Profil Admin',
          icon: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
        }
      ];
    }

    // Determine which tab is active
    let activeTabId = this.currentRoute;
    if (this.currentRoute === 'quran-detail') activeTabId = 'quran';
    if (!tabs.some(t => t.id === activeTabId)) {
      activeTabId = tabs[0].id;
      this.currentRoute = activeTabId;
    }

    this.bottomNav.innerHTML = tabs.map(tab => `
      <button class="nav-item ${tab.id === activeTabId ? 'active' : ''}" data-route="${tab.id}">
        <div class="nav-icon-wrapper">${tab.icon}</div>
        <span class="nav-label">${tab.label}</span>
      </button>
    `).join('');

    // Attach click listeners to nav items
    this.bottomNav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        this.navigate(route);
      });
    });
  }

  // --- Santri Routes ---
  async renderSantriRoutes() {
    switch (this.currentRoute) {
      case 'home':
        this.viewport.innerHTML = santriView.renderHome();
        santriView.initHomeEvents();
        break;

      case 'quran':
        this.viewport.innerHTML = await santriView.renderQuran();
        await santriView.initQuranEvents();
        break;

      case 'quran-detail':
        this.viewport.innerHTML = await santriView.renderSurahDetailView(this.currentSurahDetail || 114);
        santriView.initSurahDetailEvents(this.currentSurahDetail || 114);
        break;

      case 'progress':
        this.viewport.innerHTML = santriView.renderProgress();
        santriView.initProgressEvents();
        break;

      case 'profile':
        this.viewport.innerHTML = santriView.renderProfile();
        santriView.initProfileEvents();
        break;

      default:
        this.viewport.innerHTML = santriView.renderHome();
        santriView.initHomeEvents();
    }
  }

  // --- Guru Routes ---
  async renderGuruRoutes() {
    switch (this.currentRoute) {
      case 'classes':
      case 'home':
        this.viewport.innerHTML = guruView.renderClasses();
        guruView.initClassesEvents();
        break;

      case 'history':
        this.viewport.innerHTML = guruView.renderHistory();
        break;

      case 'profile':
        this.viewport.innerHTML = guruView.renderProfile();
        guruView.initProfileEvents();
        break;

      default:
        this.viewport.innerHTML = guruView.renderClasses();
        guruView.initClassesEvents();
    }
  }

  // --- Admin Routes ---
  async renderAdminRoutes() {
    switch (this.currentRoute) {
      case 'accounts':
      case 'home':
        this.viewport.innerHTML = adminView.renderAccounts();
        adminView.initAccountsEvents();
        break;

      case 'overview':
        this.viewport.innerHTML = adminView.renderOverview();
        break;

      case 'profile':
        this.viewport.innerHTML = adminView.renderProfile();
        adminView.initProfileEvents();
        break;

      default:
        this.viewport.innerHTML = adminView.renderAccounts();
        adminView.initAccountsEvents();
    }
  }

  // --- Bottom Sheet Modal System ---
  showBottomSheet(title, htmlContent) {
    if (!this.sheetBackdrop) return;
    this.sheetBackdrop.innerHTML = `
      <div class="bottom-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <span class="sheet-title">${title}</span>
          <button class="btn btn-secondary btn-icon btn-sm" id="btn-close-sheet" style="width: 30px; height: 30px;">
            &times;
          </button>
        </div>
        <div class="sheet-body">
          ${htmlContent}
        </div>
      </div>
    `;

    this.sheetBackdrop.classList.add('active');

    const closeBtn = document.getElementById('btn-close-sheet');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeBottomSheet());
    }
  }

  closeBottomSheet() {
    if (this.sheetBackdrop) {
      this.sheetBackdrop.classList.remove('active');
    }
  }

  showFontAdjustSheet() {
    const settings = store.data.settings;
    const content = `
      <div style="padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">
          <span>Ukuran Font Huruf Al-Qur'an</span>
          <span id="sheet-font-size-text">${settings.arabicFontSize || 24}px</span>
        </div>
        <input type="range" id="sheet-font-range" min="18" max="38" step="2" value="${settings.arabicFontSize || 24}" style="width: 100%; accent-color: var(--color-primary); margin-bottom: 16px;">

        <div style="padding: 16px; background-color: var(--bg-page); border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-color);">
          <div id="sheet-arabic-sample" class="verse-arabic-text" style="font-size: ${settings.arabicFontSize || 24}px; color: var(--color-primary);">
            قُلْ اَعُوْذُ بِرَبِّ النَّاسِۙ
          </div>
        </div>

        <button class="btn btn-primary btn-lg" id="btn-save-font-size" style="width: 100%; margin-top: 18px;">
          Terapkan
        </button>
      </div>
    `;

    this.showBottomSheet('Pengaturan Tampilan Huruf', content);

    const range = document.getElementById('sheet-font-range');
    const label = document.getElementById('sheet-font-size-text');
    const sample = document.getElementById('sheet-arabic-sample');
    const saveBtn = document.getElementById('btn-save-font-size');

    if (range) {
      range.addEventListener('input', (e) => {
        const sz = e.target.value;
        if (label) label.textContent = `${sz}px`;
        if (sample) sample.style.fontSize = `${sz}px`;
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const sz = parseInt(range.value);
        store.updateSettings({ arabicFontSize: sz });
        this.closeBottomSheet();
        this.showToast('Ukuran huruf berhasil disimpan', 'success');
        this.render();
      });
    }
  }

  // --- Audio Mini Bar ---
  updateAudioMiniBar(audioState) {
    if (!this.audioMiniBar) return;

    if (!audioState.track) {
      this.audioMiniBar.style.display = 'none';
      return;
    }

    this.audioMiniBar.style.display = 'flex';
    const tr = audioState.track;
    const title = tr.type === 'verse' ? `${tr.surahName} : Ayat ${tr.ayatNumber}` : `Full Surat ${tr.surahName}`;

    this.audioMiniBar.innerHTML = `
      <div class="audio-mini-info">
        <div class="audio-disc-icon" style="${audioState.isPlaying ? 'animation-play-state: running;' : 'animation-play-state: paused;'}">
          ♫
        </div>
        <div class="audio-mini-text">
          <div class="audio-mini-title">${title}</div>
          <div class="audio-mini-sub">${audioState.isPlaying ? 'Sedang diputar' : 'Dijeda'}</div>
        </div>
      </div>

      <div class="audio-mini-controls">
        <button class="btn btn-primary btn-icon btn-sm" id="btn-mini-play-pause">
          ${audioState.isPlaying ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          ` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          `}
        </button>
        <button class="btn btn-secondary btn-icon btn-sm" id="btn-mini-close" style="width: 28px; height: 28px;">
          &times;
        </button>
      </div>
    `;

    document.getElementById('btn-mini-play-pause')?.addEventListener('click', () => {
      audioManager.togglePlayPause();
    });

    document.getElementById('btn-mini-close')?.addEventListener('click', () => {
      audioManager.stop();
    });
  }

  // --- Toast Notifications ---
  showToast(message, type = 'info') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

export const app = new App();
if (typeof window !== 'undefined') {
  window.app = app;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
} else {
  app.init();
}
