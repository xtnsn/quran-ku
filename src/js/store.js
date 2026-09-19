/**
 * TAHFIDZ TRACKER - REACTIVE STORE (PRD v2)
 * Manages reactive state, localStorage persistence, and seed data.
 */

import { supabaseService } from './supabase.js';

const STORAGE_KEY = 'tahfidz_tracker_data_v3';

// 30 Juz Mapping (Approximate verses per Juz for accurate progress calculation)
export const JUZ_MAPPING = [
  { juz: 1, totalAyat: 148, name: "Juz 1", startSurah: "Al-Fatihah 1", endSurah: "Al-Baqarah 141" },
  { juz: 2, totalAyat: 111, name: "Juz 2", startSurah: "Al-Baqarah 142", endSurah: "Al-Baqarah 252" },
  { juz: 3, totalAyat: 126, name: "Juz 3", startSurah: "Al-Baqarah 253", endSurah: "Ali 'Imran 92" },
  { juz: 4, totalAyat: 131, name: "Juz 4", startSurah: "Ali 'Imran 93", endSurah: "An-Nisa' 23" },
  { juz: 5, totalAyat: 124, name: "Juz 5", startSurah: "An-Nisa' 24", endSurah: "An-Nisa' 147" },
  { juz: 6, totalAyat: 110, name: "Juz 6", startSurah: "An-Nisa' 148", endSurah: "Al-Ma'idah 81" },
  { juz: 7, totalAyat: 149, name: "Juz 7", startSurah: "Al-Ma'idah 82", endSurah: "Al-An'am 110" },
  { juz: 8, totalAyat: 142, name: "Juz 8", startSurah: "Al-An'am 111", endSurah: "Al-A'raf 87" },
  { juz: 9, totalAyat: 159, name: "Juz 9", startSurah: "Al-A'raf 88", endSurah: "Al-Anfal 40" },
  { juz: 10, totalAyat: 127, name: "Juz 10", startSurah: "Al-Anfal 41", endSurah: "At-Taubah 92" },
  { juz: 11, totalAyat: 151, name: "Juz 11", startSurah: "At-Taubah 93", endSurah: "Hud 5" },
  { juz: 12, totalAyat: 170, name: "Juz 12", startSurah: "Hud 6", endSurah: "Yusuf 52" },
  { juz: 13, totalAyat: 155, name: "Juz 13", startSurah: "Yusuf 53", endSurah: "Ibrahim 52" },
  { juz: 14, totalAyat: 227, name: "Juz 14", startSurah: "Al-Hijr 1", endSurah: "An-Nahl 128" },
  { juz: 15, totalAyat: 185, name: "Juz 15", startSurah: "Al-Isra' 1", endSurah: "Al-Kahf 74" },
  { juz: 16, totalAyat: 269, name: "Juz 16", startSurah: "Al-Kahf 75", endSurah: "Ta-Ha 135" },
  { juz: 17, totalAyat: 190, name: "Juz 17", startSurah: "Al-Anbiya' 1", endSurah: "Al-Hajj 78" },
  { juz: 18, totalAyat: 202, name: "Juz 18", startSurah: "Al-Mu'minun 1", endSurah: "Al-Furqan 20" },
  { juz: 19, totalAyat: 339, name: "Juz 19", startSurah: "Al-Furqan 21", endSurah: "An-Naml 55" },
  { juz: 20, totalAyat: 171, name: "Juz 20", startSurah: "An-Naml 56", endSurah: "Al-'Ankabut 45" },
  { juz: 21, totalAyat: 178, name: "Juz 21", startSurah: "Al-'Ankabut 46", endSurah: "Al-Ahzab 30" },
  { juz: 22, totalAyat: 169, name: "Juz 22", startSurah: "Al-Ahzab 31", endSurah: "Ya-Sin 27" },
  { juz: 23, totalAyat: 357, name: "Juz 23", startSurah: "Ya-Sin 28", endSurah: "Az-Zumar 31" },
  { juz: 24, totalAyat: 175, name: "Juz 24", startSurah: "Az-Zumar 32", endSurah: "Fussilat 46" },
  { juz: 25, totalAyat: 246, name: "Juz 25", startSurah: "Fussilat 47", endSurah: "Al-Jatsiyah 37" },
  { juz: 26, totalAyat: 195, name: "Juz 26", startSurah: "Al-Ahqaf 1", endSurah: "Az-Zariyat 30" },
  { juz: 27, totalAyat: 399, name: "Juz 27", startSurah: "Az-Zariyat 31", endSurah: "Al-Hadid 29" },
  { juz: 28, totalAyat: 137, name: "Juz 28", startSurah: "Al-Mujadilah 1", endSurah: "At-Tahrim 12" },
  { juz: 29, totalAyat: 431, name: "Juz 29", startSurah: "Al-Mulk 1", endSurah: "Al-Mursalat 50" },
  { juz: 30, totalAyat: 564, name: "Juz 30", startSurah: "An-Naba' 1", endSurah: "An-Nas 6" }
];

export const TOTAL_QURAN_VERSES = 6236;

export const LEGACY_ID_MAP = {
  'u-dev-1': '11111111-1111-1111-1111-111111111111',
  'u-guru-1': '22222222-2222-2222-2222-222222222221',
  'u-guru-2': '22222222-2222-2222-2222-222222222222',
  'u-santri-1': '33333333-3333-3333-3333-333333333331',
  'u-santri-2': '33333333-3333-3333-3333-333333333332',
  'u-santri-3': '33333333-3333-3333-3333-333333333333',
  'u-santri-4': '33333333-3333-3333-3333-333333333334',
  'k-1': '44444444-4444-4444-4444-444444444441',
  'k-2': '44444444-4444-4444-4444-444444444442',
  'k-3': '44444444-4444-4444-4444-444444444443'
};

const DEFAULT_SEED_DATA = {
  users: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      nama: "Iman (Super Admin)",
      username: "iman",
      password: "iman787",
      role: "developer",
      status_aktif: true,
      dibuat_pada: "2026-01-01"
    }
  ],
  kelas: [],
  santri_kelas: [],
  progress_hafalan: [],
  riwayat_setoran: [],
  settings: {
    arabicFontSize: 24,
    showLatin: true,
    showTranslation: true,
    defaultReciter: "05", // Misyari Rasyid
    theme: "light"
  }
};

class Store {
  constructor() {
    this.listeners = [];
    this.data = this.load();
    this.syncWithSupabase();
  }

  async syncWithSupabase() {
    try {
      const [users, classes, links, progress, riwayat] = await Promise.all([
        supabaseService.getUsers(),
        supabaseService.getClasses(),
        supabaseService.getSantriKelas(),
        supabaseService.getProgress(),
        supabaseService.getRiwayat()
      ]);

      let changed = false;
      if (users !== null && JSON.stringify(this.data.users) !== JSON.stringify(users)) {
        this.data.users = users;
        changed = true;
      }
      if (classes !== null && JSON.stringify(this.data.kelas) !== JSON.stringify(classes)) {
        this.data.kelas = classes;
        changed = true;
      }
      if (links !== null && JSON.stringify(this.data.santri_kelas) !== JSON.stringify(links)) {
        this.data.santri_kelas = links;
        changed = true;
      }
      if (progress !== null && JSON.stringify(this.data.progress_hafalan) !== JSON.stringify(progress)) {
        this.data.progress_hafalan = progress;
        changed = true;
      }
      if (riwayat !== null && JSON.stringify(this.data.riwayat_setoran) !== JSON.stringify(riwayat)) {
        this.data.riwayat_setoran = riwayat;
        changed = true;
      }

      if (changed) {
        this.save();
        console.log('✅ Synchronized with live Supabase database!');
      }
      return true;
    } catch (e) {
      console.warn('Supabase sync skipped, using local cache:', e);
      return false;
    }
  }

  migrateLegacyIds(parsed) {
    if (!parsed) return;
    if (Array.isArray(parsed.users)) {
      parsed.users.forEach(u => {
        if (LEGACY_ID_MAP[u.id]) u.id = LEGACY_ID_MAP[u.id];
      });
    }
    if (Array.isArray(parsed.kelas)) {
      parsed.kelas.forEach(k => {
        if (LEGACY_ID_MAP[k.id]) k.id = LEGACY_ID_MAP[k.id];
        if (LEGACY_ID_MAP[k.guru_id]) k.guru_id = LEGACY_ID_MAP[k.guru_id];
      });
    }
    if (Array.isArray(parsed.santri_kelas)) {
      parsed.santri_kelas.forEach(sk => {
        if (LEGACY_ID_MAP[sk.santri_id]) sk.santri_id = LEGACY_ID_MAP[sk.santri_id];
        if (LEGACY_ID_MAP[sk.kelas_id]) sk.kelas_id = LEGACY_ID_MAP[sk.kelas_id];
      });
    }
    if (Array.isArray(parsed.progress_hafalan)) {
      parsed.progress_hafalan.forEach(p => {
        if (LEGACY_ID_MAP[p.santri_id]) p.santri_id = LEGACY_ID_MAP[p.santri_id];
        if (LEGACY_ID_MAP[p.dicentangOleh]) p.dicentangOleh = LEGACY_ID_MAP[p.dicentangOleh];
      });
    }
    if (Array.isArray(parsed.riwayat_setoran)) {
      parsed.riwayat_setoran.forEach(r => {
        if (LEGACY_ID_MAP[r.santri_id]) r.santri_id = LEGACY_ID_MAP[r.santri_id];
        if (LEGACY_ID_MAP[r.guru_id]) r.guru_id = LEGACY_ID_MAP[r.guru_id];
      });
    }
  }

  load() {
    try {
      // Purge all old legacy storage versions
      if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
        localStorage.removeItem('tahfidz_tracker_data');
        localStorage.removeItem('tahfidz_tracker_data_v2');
        localStorage.removeItem('tahfidz_session');
        localStorage.removeItem('tahfidz_session_v2');
      }

      const stored = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        const hasIman = Array.isArray(parsed.users) && parsed.users.some(u => u.username === 'iman');
        const hasLegacyAdmin = Array.isArray(parsed.users) && parsed.users.some(u => u.username === 'admin');
        if (hasIman && !hasLegacyAdmin) {
          this.migrateLegacyIds(parsed);
          if (parsed.riwayat_setoran) {
            const seen = new Set();
            parsed.riwayat_setoran = parsed.riwayat_setoran.filter(item => {
              const timeMin = (item.tanggal || '').substring(0, 16);
              const key = `${item.santri_id}-${item.nomorSurat}-${item.ayatMulai}-${item.ayatSelesai}-${timeMin}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load localStorage, falling back to seed data:', e);
    }
    this.save(DEFAULT_SEED_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
  }

  save(dataToSave = this.data) {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    if (Array.isArray(this.listeners) && this.listeners.length > 0) {
      this.listeners.forEach(fn => {
        try {
          fn(this.data);
        } catch (err) {
          console.warn('Store listener error:', err);
        }
      });
    }
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    this.save();
  }

  // --- Users & Auth ---
  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUsersByRole(role) {
    return this.data.users.filter(u => u.role === role);
  }

  async createUser({ nama, username, password, role, kelas_nama = null, kelas_id = null, target_juz = 30 }) {
    const cleanUsername = username.trim().toLowerCase();
    const existing = this.data.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      throw new Error(`Username "${username}" sudah digunakan.`);
    }

    const cleanKelasNama = kelas_nama ? kelas_nama.trim() : null;

    const newUser = {
      id: `u-${Date.now()}`,
      nama,
      username: cleanUsername,
      password: password || '123456',
      role,
      kelas_nama: cleanKelasNama,
      target_juz: parseInt(target_juz) || 30,
      status_aktif: true,
      dibuat_pada: new Date().toISOString().split('T')[0]
    };

    // Attempt cloud create in Supabase to acquire UUID
    try {
      const cloudCreated = await supabaseService.createUser(newUser);
      if (cloudCreated && cloudCreated.id) {
        newUser.id = cloudCreated.id;
      }
    } catch (e) {
      console.error('Supabase createUser cloud notice:', e);
      throw e;
    }

    this.data.users.push(newUser);

    // If santri and class name is specified, resolve or create the class and link them
    if (role === 'santri' && cleanKelasNama) {
      let targetClass = this.data.kelas.find(k => k.nama_kelas.toLowerCase() === cleanKelasNama.toLowerCase() && !k.dihapus_pada);
      if (!targetClass) {
        targetClass = await this.addClass({ nama_kelas: cleanKelasNama, guru_id: null });
      }
      if (targetClass) {
        await this.addStudentToClass(newUser.id, targetClass.id);
      }
    } else if (role === 'santri' && kelas_id) {
      await this.addStudentToClass(newUser.id, kelas_id);
    }

    // If guru and kelas_id or kelas_nama specified, assign this guru to that class
    if (role === 'guru' && kelas_id) {
      const cls = this.getClassById(kelas_id);
      if (cls) {
        cls.guru_id = newUser.id;
        await supabaseService.updateClass(cls.id, { guru_id: newUser.id }).catch(() => {});
      }
    }

    this.save();
    return newUser;
  }

  async updateUser({ id, nama, username, password, kelas_nama }) {
    const user = this.getUserById(id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    // Check if username changed and is already taken
    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const existing = this.data.users.find(u => u.id !== id && u.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        throw new Error(`Username "${username}" sudah digunakan.`);
      }
      user.username = username;
    }

    if (nama) user.nama = nama;
    if (password) user.password = password;

    const cleanKelas = kelas_nama !== undefined ? (kelas_nama ? kelas_nama.trim() : null) : user.kelas_nama;
    const oldKelas = user.kelas_nama;
    user.kelas_nama = cleanKelas;

    // If santri and class changed, update santri_kelas link
    if (user.role === 'santri' && cleanKelas && cleanKelas !== oldKelas) {
      // Find or create new class
      let targetClass = this.data.kelas.find(k => k.nama_kelas.toLowerCase() === cleanKelas.toLowerCase() && !k.dihapus_pada);
      if (!targetClass) {
        targetClass = await this.addClass({ nama_kelas: cleanKelas, guru_id: null });
      }

      // Remove from old class
      const oldLink = this.data.santri_kelas.find(sk => sk.santri_id === user.id && !sk.tanggal_keluar);
      if (oldLink) {
        this.removeStudentFromClass(user.id, oldLink.kelas_id);
      }

      // Add to new class
      if (targetClass) {
        this.addStudentToClass(user.id, targetClass.id);
      }
    }

    this.save();

    // Sync update to Supabase
    try {
      await supabaseService.updateUser(user.id, {
        nama: user.nama,
        username: user.username,
        password: user.password,
        kelas_nama: user.kelas_nama
      });
    } catch (e) {
      console.warn('Supabase updateUser sync notice:', e);
    }

    return user;
  }

  async deleteUser(userId) {
    const user = this.getUserById(userId);
    if (!user) return false;

    // 1. Remove from local store users
    this.data.users = this.data.users.filter(u => u.id !== userId);

    // 2. Remove from santri_kelas links
    this.data.santri_kelas = this.data.santri_kelas.filter(sk => sk.santri_id !== userId);

    // 3. Remove from progress and riwayat if student
    this.data.progress_hafalan = this.data.progress_hafalan.filter(p => p.santri_id !== userId);
    this.data.riwayat_setoran = this.data.riwayat_setoran.filter(r => r.santri_id !== userId);

    // 4. If guru, unassign from classes
    this.data.kelas.forEach(k => {
      if (k.guru_id === userId) k.guru_id = null;
    });

    this.save();

    // 5. Delete from Supabase Cloud
    try {
      await supabaseService.deleteUser(user.id, user.username);
    } catch (e) {
      console.warn('Supabase deleteUser sync notice:', e);
    }

    return true;
  }

  async toggleUserActive(userId) {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.status_aktif = !user.status_aktif;
    this.save();
    try {
      await supabaseService.updateUserStatus(user.id, user.status_aktif, user.username);
    } catch (e) {
      console.warn('Supabase updateUserStatus notice:', e);
    }
    return user.status_aktif;
  }

  async resetPassword(userId, newPassword) {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.password = newPassword;
    this.save();
    try {
      await supabaseService.updatePassword(user.id, newPassword, user.username);
    } catch (e) {
      console.warn('Supabase updatePassword notice:', e);
    }
    return true;
  }

  // --- Classes (Kelas) ---
  getClasses(guruId = null) {
    const active = this.data.kelas.filter(k => !k.dihapus_pada);
    if (guruId) {
      return active.filter(k => k.guru_id === guruId);
    }
    return active;
  }

  getClassById(classId) {
    return this.data.kelas.find(k => k.id === classId && !k.dihapus_pada);
  }

  async addClass({ nama_kelas, guru_id = null, target_juz = 30 }) {
    const cleanName = (nama_kelas || '').trim();
    // Check if class with this name already exists
    let existing = this.data.kelas.find(k => k.nama_kelas.toLowerCase() === cleanName.toLowerCase() && !k.dihapus_pada);
    if (existing) {
      if (guru_id && existing.guru_id !== guru_id) {
        existing.guru_id = guru_id;
        await supabaseService.updateClass(existing.id, { guru_id }).catch(() => {});
        this.save();
      }
      return existing;
    }

    const newClass = {
      id: `k-${Date.now()}`,
      nama_kelas: cleanName,
      guru_id,
      target_juz: parseInt(target_juz) || 30,
      dibuat_pada: new Date().toISOString().split('T')[0],
      dihapus_pada: null
    };

    try {
      const cloudClass = await supabaseService.createClass(newClass);
      if (cloudClass && cloudClass.id) {
        newClass.id = cloudClass.id;
      }
    } catch (e) {
      console.warn('Supabase createClass notice:', e);
    }

    this.data.kelas.push(newClass);
    this.save();
    return newClass;
  }

  async deleteClass(classId) {
    const cls = this.data.kelas.find(k => k.id === classId);
    if (!cls) return false;
    cls.dihapus_pada = new Date().toISOString();
    this.save();
    try {
      await supabaseService.deleteClass(classId, cls.nama_kelas);
    } catch (e) {
      console.warn('Supabase deleteClass notice:', e);
    }
    return true;
  }

  // --- Students in Class ---
  getStudentsInClass(classId) {
    const links = this.data.santri_kelas.filter(sk => sk.kelas_id === classId && !sk.tanggal_keluar);
    return links.map(sk => {
      const student = this.getUserById(sk.santri_id);
      return {
        ...student,
        linkId: sk.id,
        tanggal_masuk: sk.tanggal_masuk
      };
    }).filter(s => s && s.status_aktif);
  }

  getStudentClass(santriId) {
    const link = this.data.santri_kelas.find(sk => sk.santri_id === santriId && !sk.tanggal_keluar);
    if (!link) return null;
    return this.getClassById(link.kelas_id);
  }

  async addStudentToClass(santriId, classId) {
    // Check if already in class
    const existing = this.data.santri_kelas.find(sk => sk.santri_id === santriId && sk.kelas_id === classId && !sk.tanggal_keluar);
    if (existing) return existing;

    const newLink = {
      id: `sk-${Date.now()}`,
      santri_id: santriId,
      kelas_id: classId,
      tanggal_masuk: new Date().toISOString().split('T')[0],
      tanggal_keluar: null
    };
    this.data.santri_kelas.push(newLink);
    this.save();
    await supabaseService.addSantriToClass(santriId, classId).catch(e => {
      console.warn('Supabase addSantriToClass notice:', e);
    });
    return newLink;
  }

  async removeStudentFromClass(santriId, classId) {
    const link = this.data.santri_kelas.find(sk => sk.santri_id === santriId && sk.kelas_id === classId && !sk.tanggal_keluar);
    if (link) {
      link.tanggal_keluar = new Date().toISOString().split('T')[0];
      this.save();
      await supabaseService.removeSantriFromClass(santriId, classId).catch(e => {});
      return true;
    }
    return false;
  }

  // --- Progress & Validation (Fitur Inti PRD 6.3) ---
  getStudentMemorizedVerses(santriId) {
    return this.data.progress_hafalan.filter(p => p.santri_id === santriId && p.status === 'hafal');
  }

  isVerseMemorized(santriId, nomorSurat, nomorAyat) {
    return this.data.progress_hafalan.some(p => 
      p.santri_id === santriId && 
      p.nomorSurat === nomorSurat && 
      p.nomorAyat === nomorAyat && 
      p.status === 'hafal'
    );
  }

  getSurahMemorizedCount(santriId, nomorSurat) {
    return this.data.progress_hafalan.filter(p => 
      p.santri_id === santriId && 
      p.nomorSurat === nomorSurat && 
      p.status === 'hafal'
    ).length;
  }

  isSurahCompleted(santriId, nomorSurat, totalAyat) {
    return this.getSurahMemorizedCount(santriId, nomorSurat) >= totalAyat;
  }

  cleanDuplicateHistory() {
    if (!this.data.riwayat_setoran) return;
    const seen = new Set();
    this.data.riwayat_setoran = this.data.riwayat_setoran.filter(item => {
      const timeMin = (item.tanggal || '').substring(0, 16);
      const key = `${item.santri_id}-${item.nomorSurat}-${item.ayatMulai}-${item.ayatSelesai}-${timeMin}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  saveValidation({ santriId, nomorSurat, namaSurat, ayatList, guruId, catatan = "" }) {
    const guru = this.getUserById(guruId);
    const guruNama = guru ? guru.nama : "Guru Ngaji";
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let addedCount = 0;

    ayatList.forEach(ayatNum => {
      const existingIdx = this.data.progress_hafalan.findIndex(p => 
        p.santri_id === santriId && p.nomorSurat === nomorSurat && p.nomorAyat === ayatNum
      );

      if (existingIdx >= 0) {
        if (this.data.progress_hafalan[existingIdx].status !== 'hafal') {
          addedCount++;
        }
        this.data.progress_hafalan[existingIdx].status = 'hafal';
        this.data.progress_hafalan[existingIdx].dicentangOleh = guruId;
        this.data.progress_hafalan[existingIdx].tanggalSetor = dateStr;
        if (catatan) this.data.progress_hafalan[existingIdx].catatan = catatan;
      } else {
        this.data.progress_hafalan.push({
          santri_id: santriId,
          nomorSurat,
          nomorAyat: ayatNum,
          nomorJuz: 30,
          status: 'hafal',
          tanggalSetor: dateStr,
          dicentangOleh: guruId,
          catatan
        });
        addedCount++;
      }
    });

    // Create a Setoran Log Entry in riwayat_setoran ONLY if new ayat were recorded or note added
    if (ayatList.length > 0) {
      const sortedAyat = [...ayatList].sort((a, b) => a - b);
      const minAyat = sortedAyat[0];
      const maxAyat = sortedAyat[sortedAyat.length - 1];

      // Prevent exact duplicate entry within the same minute
      const duplicateRecent = this.data.riwayat_setoran.find(r => 
        r.santri_id === santriId &&
        r.nomorSurat === nomorSurat &&
        r.ayatMulai === minAyat &&
        r.ayatSelesai === maxAyat &&
        (r.tanggal || '').substring(0, 16) === dateStr.substring(0, 16)
      );

      if (!duplicateRecent) {
        this.data.riwayat_setoran.unshift({
          id: `rw-${Date.now()}`,
          santri_id: santriId,
          nomorSurat,
          namaSurat,
          ayatMulai: minAyat,
          ayatSelesai: maxAyat,
          totalAyat: sortedAyat.length,
          status: "hafal",
          guru_id: guruId,
          guruNama,
          catatan,
          tanggal: dateStr
        });

        supabaseService.createRiwayat({
          santri_id: santriId,
          nomorSurat,
          namaSurat,
          ayatMulai: minAyat,
          ayatSelesai: maxAyat,
          totalAyat: sortedAyat.length,
          status: 'hafal',
          guru_id: guruId,
          catatan
        }).catch(e => console.warn('Supabase createRiwayat bg err:', e));
      }
    }

    this.save();

    // Live Sync to Supabase in background
    supabaseService.saveValidation({
      santriId,
      nomorSurat,
      ayatList,
      guruId,
      catatan
    }).catch(e => console.warn('Supabase saveValidation bg err:', e));

    return { addedCount, totalSubmitted: ayatList.length };
  }

  // --- Statistics & Progress Calculation ---
  calculateStudentProgress(santriId) {
    const memorized = this.getStudentMemorizedVerses(santriId);
    const totalAyatHafal = memorized.length;

    // Overall Quran Progress (Total 6236 Ayat)
    const overallPercentage = ((totalAyatHafal / TOTAL_QURAN_VERSES) * 100).toFixed(1);

    // Juz 30 Specific Progress (564 Ayat)
    // Most santri start with Juz 30 (Surahs 78 to 114)
    const juz30Verses = memorized.filter(p => p.nomorSurat >= 78 && p.nomorSurat <= 114).length;
    const juz30Percentage = Math.min(100, ((juz30Verses / 564) * 100)).toFixed(1);

    // Surahs Khatam (completed surahs)
    // Group memorized verses by surah
    const surahCountMap = {};
    memorized.forEach(p => {
      surahCountMap[p.nomorSurat] = (surahCountMap[p.nomorSurat] || 0) + 1;
    });

    // We can evaluate completed surahs if total verses match
    const completedSurahsCount = Object.keys(surahCountMap).length; // approximate completed/active

    // Progress by Juz (1 to 30)
    const juzProgress = JUZ_MAPPING.map(jm => {
      if (jm.juz === 30) {
        const pct = Math.min(100, Math.round((juz30Verses / jm.totalAyat) * 100));
        return {
          juz: jm.juz,
          name: jm.name,
          totalAyat: jm.totalAyat,
          memorizedCount: juz30Verses,
          percentage: pct,
          status: pct >= 100 ? 'completed' : pct > 0 ? 'in-progress' : 'unstarted'
        };
      }
      return {
        juz: jm.juz,
        name: jm.name,
        totalAyat: jm.totalAyat,
        memorizedCount: 0,
        percentage: 0,
        status: 'unstarted'
      };
    });

    return {
      totalAyatHafal,
      overallPercentage: parseFloat(overallPercentage),
      juz30Percentage: parseFloat(juz30Percentage),
      juz30Verses,
      completedSurahsCount,
      juzProgress
    };
  }

  getStudentSetoranHistory(santriId) {
    return this.data.riwayat_setoran.filter(rw => rw.santri_id === santriId);
  }

  // --- Settings ---
  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
  }
}

export const store = new Store();
