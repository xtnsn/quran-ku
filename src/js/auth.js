/**
 * TAHFIDZ TRACKER - AUTHENTICATION MANAGER (PRD v2)
 * Role-based authentication, session management, no self-register.
 */

import { store } from './store.js';

const SESSION_KEY = 'tahfidz_session_v3';

class Auth {
  constructor() {
    this.currentUser = this.loadSession();
    this.authListeners = [];
  }

  loadSession() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('tahfidz_session');
        localStorage.removeItem('tahfidz_session_v2');
      }

      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
      if (stored) {
        const sessionUser = JSON.parse(stored);
        // Verify user still exists and active in store
        const liveUser = store.getUserById(sessionUser.id) || store.data.users.find(u => u.username === sessionUser.username);
        if (liveUser && liveUser.status_aktif) {
          return liveUser;
        }
      }
    } catch (e) {
      console.warn('Session load error:', e);
    }
    return null;
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role
        }));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      console.error('Session save error:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.authListeners.push(listener);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.authListeners.forEach(fn => fn(this.currentUser));
  }

  async login(username, password) {
    const cleanUsername = username.trim().toLowerCase();

    // Always fetch freshest data from Supabase before validating login credentials
    try {
      await store.syncWithSupabase();
    } catch (e) {
      console.warn('Sync notice during login:', e);
    }

    const user = store.data.users.find(u => 
      u.username.toLowerCase() === cleanUsername && u.password === password
    );

    if (!user) {
      throw new Error('Username atau kata sandi tidak cocok.');
    }

    if (!user.status_aktif) {
      throw new Error('Akun ini dinonaktifkan oleh Administrator.');
    }

    this.saveSession(user);
    return user;
  }

  logout() {
    this.saveSession(null);
  }

  getCurrentUser() {
    // Return latest user info from store
    if (!this.currentUser) return null;
    return store.getUserById(this.currentUser.id) || this.currentUser;
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }
}

export const auth = new Auth();
