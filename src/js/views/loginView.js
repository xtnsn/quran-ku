/**
 * TAHFIDZ TRACKER - LOGIN VIEW (PRD v2)
 * Clean, modern authentication screen with quick-demo login chips.
 */

import { auth } from '../auth.js';
import { app } from '../app.js';

export function renderLoginView() {
  return `
    <div class="login-page-container animate-fade" style="padding: 24px 20px; min-height: 100%; display: flex; flex-direction: column; justify-content: center;">
      <!-- Brand Logo Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 84px; height: 84px; border-radius: 20px; background: #FFFFFF; margin: 0 auto 14px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(46, 134, 222, 0.25); border: 1.5px solid var(--border-color); overflow: hidden; padding: 6px;">
          <img src="./assets/icons/logo-sekolah.png" alt="Logo MI Al-Hidayah 1" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
        <h1 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">MI Al-Hidayah 1</h1>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">Pencatatan & Pemantauan Hafalan Al-Quran</p>
      </div>

      <!-- Login Card -->
      <div class="card" style="padding: 22px 20px; margin-bottom: 20px; box-shadow: var(--shadow-md);">
        <h2 style="font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 16px;">Masuk ke Akun</h2>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-username">Username atau Email</label>
            <input type="text" id="login-username" class="form-input" placeholder="Masukkan username Anda" required autocomplete="username">
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label" for="login-password">Kata Sandi</label>
            <input type="password" id="login-password" class="form-input" placeholder="Masukkan kata sandi" required autocomplete="current-password">
          </div>

          <div id="login-error-msg" style="display: none; padding: 10px 12px; background-color: var(--color-danger-bg); border-radius: var(--radius-sm); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--color-danger-text); font-size: 12px; font-weight: 600; margin-bottom: 16px;"></div>

          <button type="submit" id="btn-submit-login" class="btn btn-primary btn-lg" style="width: 100%;">
            <span>Masuk Sekarang</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;
}

export function initLoginEvents() {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error-msg');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const submitBtn = document.getElementById('btn-submit-login');
      const originalHtml = submitBtn ? submitBtn.innerHTML : 'Masuk Sekarang';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Memeriksa Akun...</span>';
      }

      const username = usernameInput.value;
      const password = passwordInput.value;

      try {
        const user = await auth.login(username, password);
        const activeApp = (typeof window !== 'undefined' && window.app) ? window.app : app;
        activeApp.showToast(`Selamat datang, ${user.nama}!`, 'success');
        activeApp.navigate('home');
      } catch (err) {
        errorDiv.textContent = err.message || 'Login gagal';
        errorDiv.style.display = 'block';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }
      }
    });
  }
}
