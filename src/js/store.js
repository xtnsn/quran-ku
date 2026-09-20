/**
 * TAHFIDZ TRACKER - REACTIVE STORE (PRD v2)
 * Manages reactive state, localStorage persistence, and seed data.
 */

import { supabaseService } from './supabase.js';

const STORAGE_KEY = 'tahfidz_tracker_data_v3';

// 30 Juz Mapping (Exact verse boundaries per Juz according to standard Quran Rasm Utsmani)
export const JUZ_MAPPING = [
  { juz: 1, totalAyat: 148, name: "Juz 1", startSurah: "Al-Fatihah 1", endSurah: "Al-Baqarah 141", s1: 1, a1: 1, s2: 2, a2: 141 },
  { juz: 2, totalAyat: 111, name: "Juz 2", startSurah: "Al-Baqarah 142", endSurah: "Al-Baqarah 252", s1: 2, a1: 142, s2: 2, a2: 252 },
  { juz: 3, totalAyat: 126, name: "Juz 3", startSurah: "Al-Baqarah 253", endSurah: "Ali 'Imran 92", s1: 2, a1: 253, s2: 3, a2: 92 },
  { juz: 4, totalAyat: 131, name: "Juz 4", startSurah: "Ali 'Imran 93", endSurah: "An-Nisa' 23", s1: 3, a1: 93, s2: 4, a2: 23 },
  { juz: 5, totalAyat: 124, name: "Juz 5", startSurah: "An-Nisa' 24", endSurah: "An-Nisa' 147", s1: 4, a1: 24, s2: 4, a2: 147 },
  { juz: 6, totalAyat: 110, name: "Juz 6", startSurah: "An-Nisa' 148", endSurah: "Al-Ma'idah 81", s1: 4, a1: 148, s2: 5, a2: 81 },
  { juz: 7, totalAyat: 149, name: "Juz 7", startSurah: "Al-Ma'idah 82", endSurah: "Al-An'am 110", s1: 5, a1: 82, s2: 6, a2: 110 },
  { juz: 8, totalAyat: 142, name: "Juz 8", startSurah: "Al-An'am 111", endSurah: "Al-A'raf 87", s1: 6, a1: 111, s2: 7, a2: 87 },
  { juz: 9, totalAyat: 159, name: "Juz 9", startSurah: "Al-A'raf 88", endSurah: "Al-Anfal 40", s1: 7, a1: 88, s2: 8, a2: 40 },
  { juz: 10, totalAyat: 127, name: "Juz 10", startSurah: "Al-Anfal 41", endSurah: "At-Taubah 92", s1: 8, a1: 41, s2: 9, a2: 92 },
  { juz: 11, totalAyat: 151, name: "Juz 11", startSurah: "At-Taubah 93", endSurah: "Hud 5", s1: 9, a1: 93, s2: 11, a2: 5 },
  { juz: 12, totalAyat: 170, name: "Juz 12", startSurah: "Hud 6", endSurah: "Yusuf 52", s1: 11, a1: 6, s2: 12, a2: 52 },
  { juz: 13, totalAyat: 154, name: "Juz 13", startSurah: "Yusuf 53", endSurah: "Ibrahim 52", s1: 12, a1: 53, s2: 14, a2: 52 },
  { juz: 14, totalAyat: 227, name: "Juz 14", startSurah: "Al-Hijr 1", endSurah: "An-Nahl 128", s1: 15, a1: 1, s2: 16, a2: 128 },
  { juz: 15, totalAyat: 185, name: "Juz 15", startSurah: "Al-Isra' 1", endSurah: "Al-Kahf 74", s1: 17, a1: 1, s2: 18, a2: 74 },
  { juz: 16, totalAyat: 269, name: "Juz 16", startSurah: "Al-Kahf 75", endSurah: "Ta-Ha 135", s1: 18, a1: 75, s2: 20, a2: 135 },
  { juz: 17, totalAyat: 190, name: "Juz 17", startSurah: "Al-Anbiya' 1", endSurah: "Al-Hajj 78", s1: 21, a1: 1, s2: 22, a2: 78 },
  { juz: 18, totalAyat: 202, name: "Juz 18", startSurah: "Al-Mu'minun 1", endSurah: "Al-Furqan 20", s1: 23, a1: 1, s2: 25, a2: 20 },
  { juz: 19, totalAyat: 339, name: "Juz 19", startSurah: "Al-Furqan 21", endSurah: "An-Naml 55", s1: 25, a1: 21, s2: 27, a2: 55 },
  { juz: 20, totalAyat: 171, name: "Juz 20", startSurah: "An-Naml 56", endSurah: "Al-'Ankabut 45", s1: 27, a1: 56, s2: 29, a2: 45 },
  { juz: 21, totalAyat: 178, name: "Juz 21", startSurah: "Al-'Ankabut 46", endSurah: "Al-Ahzab 30", s1: 29, a1: 46, s2: 33, a2: 30 },
  { juz: 22, totalAyat: 169, name: "Juz 22", startSurah: "Al-Ahzab 31", endSurah: "Ya-Sin 27", s1: 33, a1: 31, s2: 36, a2: 27 },
  { juz: 23, totalAyat: 357, name: "Juz 23", startSurah: "Ya-Sin 28", endSurah: "Az-Zumar 31", s1: 36, a1: 28, s2: 39, a2: 31 },
  { juz: 24, totalAyat: 175, name: "Juz 24", startSurah: "Az-Zumar 32", endSurah: "Fussilat 46", s1: 39, a1: 32, s2: 41, a2: 46 },
  { juz: 25, totalAyat: 246, name: "Juz 25", startSurah: "Fussilat 47", endSurah: "Al-Jatsiyah 37", s1: 41, a1: 47, s2: 45, a2: 37 },
  { juz: 26, totalAyat: 195, name: "Juz 26", startSurah: "Al-Ahqaf 1", endSurah: "Az-Zariyat 30", s1: 46, a1: 1, s2: 51, a2: 30 },
  { juz: 27, totalAyat: 399, name: "Juz 27", startSurah: "Az-Zariyat 31", endSurah: "Al-Hadid 29", s1: 51, a1: 31, s2: 57, a2: 29 },
  { juz: 28, totalAyat: 137, name: "Juz 28", startSurah: "Al-Mujadilah 1", endSurah: "At-Tahrim 12", s1: 58, a1: 1, s2: 66, a2: 12 },
  { juz: 29, totalAyat: 431, name: "Juz 29", startSurah: "Al-Mulk 1", endSurah: "Al-Mursalat 50", s1: 67, a1: 1, s2: 77, a2: 50 },
  { juz: 30, totalAyat: 564, name: "Juz 30", startSurah: "An-Naba' 1", endSurah: "An-Nas 6", s1: 78, a1: 1, s2: 114, a2: 6 }
];

export const TOTAL_QURAN_VERSES = 6236;

export function getJuzForVerse(s, a) {
  const surah = parseInt(s) || 1;
  const ayah = parseInt(a) || 1;
  for (const jm of JUZ_MAPPING) {
    const afterStart = surah > jm.s1 || (surah === jm.s1 && ayah >= jm.a1);
    const beforeEnd = surah < jm.s2 || (surah === jm.s2 && ayah <= jm.a2);
    if (afterStart && beforeEnd) {
      return jm.juz;
    }
  }
  return surah >= 78 ? 30 : 1;
}

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
      if (users !== null) {
        const userHash = u => `${u.id}:${u.nama}:${u.username}:${u.role}:${u.kelas_nama || ''}:${u.target_juz || ''}:${u.dihapus_pada || ''}:${u.status_aktif !== false}`;
        const currentHash = (this.data.users || []).map(userHash).sort().join('|');
        const newHash = users.map(userHash).sort().join('|');
        if (currentHash !== newHash) {
          this.data.users = users;
          changed = true;
        }
      }
      if (classes !== null) {
        const classHash = c => `${c.id}:${c.nama_kelas}:${c.guru_id || ''}:${c.dihapus_pada || ''}`;
        const currentHash = (this.data.kelas || []).map(classHash).sort().join('|');
        const newHash = classes.map(classHash).sort().join('|');
        if (currentHash !== newHash) {
          this.data.kelas = classes;
          changed = true;
        }
      }
      if (links !== null) {
        const linkHash = l => `${l.santri_id}:${l.kelas_id}:${l.tanggal_keluar || ''}`;
        const currentHash = (this.data.santri_kelas || []).map(linkHash).sort().join('|');
        const newHash = links.map(linkHash).sort().join('|');
        if (currentHash !== newHash) {
          this.data.santri_kelas = links;
          changed = true;
        }
      }
      if (progress !== null) {
        // Build set of current local verses for comparison
        const currentKeys = new Set((this.data.progress_hafalan || []).map(lp => {
          const s = parseInt(lp.nomorSurat || lp.nomor_surat);
          const a = parseInt(lp.nomorAyat || lp.nomor_ayat);
          return `${lp.santri_id}-${s}-${a}-${lp.status || 'hafal'}`;
        }));

        // Merge progress without wiping local newly memorized verses
        const progressMap = new Map();
        (this.data.progress_hafalan || []).forEach(lp => {
          const s = parseInt(lp.nomorSurat || lp.nomor_surat);
          const a = parseInt(lp.nomorAyat || lp.nomor_ayat);
          if (s && a) {
            progressMap.set(`${lp.santri_id}-${s}-${a}`, {
              santri_id: lp.santri_id,
              nomorSurat: s,
              nomorAyat: a,
              nomorJuz: getJuzForVerse(s, a),
              status: lp.status || 'hafal',
              tanggalSetor: lp.tanggalSetor || lp.tanggal_setor || '',
              dicentangOleh: lp.dicentangOleh || lp.dicentang_oleh || '',
              catatan: lp.catatan || ''
            });
          }
        });
        progress.forEach(cp => {
          const s = parseInt(cp.nomorSurat || cp.nomor_surat);
          const a = parseInt(cp.nomorAyat || cp.nomor_ayat);
          if (s && a) {
            progressMap.set(`${cp.santri_id}-${s}-${a}`, {
              santri_id: cp.santri_id,
              nomorSurat: s,
              nomorAyat: a,
              nomorJuz: getJuzForVerse(s, a),
              status: cp.status || 'hafal',
              tanggalSetor: cp.tanggalSetor || cp.tanggal_setor || '',
              dicentangOleh: cp.dicentangOleh || cp.dicentang_oleh || '',
              catatan: cp.catatan || ''
            });
          }
        });

        const mergedProgress = Array.from(progressMap.values());
        let progressChanged = false;
        if (mergedProgress.length !== (this.data.progress_hafalan || []).length) {
          progressChanged = true;
        } else {
          for (const item of mergedProgress) {
            const k = `${item.santri_id}-${item.nomorSurat}-${item.nomorAyat}-${item.status}`;
            if (!currentKeys.has(k)) {
              progressChanged = true;
              break;
            }
          }
        }

        if (progressChanged) {
          this.data.progress_hafalan = mergedProgress;
          changed = true;
        }
      }

      if (riwayat !== null) {
        const seen = new Set();
        const mergedRiwayat = [];
        [...(this.data.riwayat_setoran || []), ...riwayat].forEach(item => {
          const timeMin = (item.tanggal || '').substring(0, 16);
          const key = `${item.santri_id}-${item.nomorSurat}-${item.ayatMulai}-${item.ayatSelesai}-${timeMin}`;
          if (!seen.has(key)) {
            seen.add(key);
            mergedRiwayat.push(item);
          }
        });

        if (mergedRiwayat.length !== (this.data.riwayat_setoran || []).length) {
          this.data.riwayat_setoran = mergedRiwayat;
          changed = true;
        }
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

          // Restore progress_hafalan from compact grouped format if present
          if (parsed._p_grouped && !parsed.progress_hafalan) {
            const restoredProgress = [];
            for (const sid in parsed._p_grouped) {
              const list = parsed._p_grouped[sid];
              if (Array.isArray(list)) {
                list.forEach(t => {
                  const s = t[0];
                  const a = t[1];
                  restoredProgress.push({
                    santri_id: sid,
                    nomorSurat: s,
                    nomorAyat: a,
                    nomorJuz: getJuzForVerse(s, a),
                    status: 'hafal',
                    tanggalSetor: t[2] || '',
                    dicentangOleh: t[3] || '',
                    catatan: t[4] || ''
                  });
                });
              }
            }
            parsed.progress_hafalan = restoredProgress;
            delete parsed._p_grouped;
          } else if (Array.isArray(parsed.progress_hafalan)) {
            // Ensure nomorJuz is computed correctly
            parsed.progress_hafalan.forEach(p => {
              const s = p.nomorSurat || p.nomor_surat;
              const a = p.nomorAyat || p.nomor_ayat;
              if (s && a) {
                p.nomorSurat = s;
                p.nomorAyat = a;
                p.nomorJuz = getJuzForVerse(s, a);
              }
            });
          }

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
        // Compact progress_hafalan to prevent QuotaExceededError (~5MB browser limit)
        // Group by student ID into tuple arrays: [nomorSurat, nomorAyat, tanggalSetor, dicentangOleh, catatan]
        let compactProgress = null;
        if (Array.isArray(dataToSave.progress_hafalan)) {
          compactProgress = {};
          dataToSave.progress_hafalan.forEach(p => {
            const sid = p.santri_id;
            if (!sid) return;
            if (!compactProgress[sid]) compactProgress[sid] = [];
            compactProgress[sid].push([
              p.nomorSurat || p.nomor_surat,
              p.nomorAyat || p.nomor_ayat,
              p.tanggalSetor || p.tanggal_setor || '',
              p.dicentangOleh || p.dicentang_oleh || '',
              p.catatan || ''
            ]);
          });
        }

        const payload = {
          ...dataToSave,
          progress_hafalan: undefined,
          _p_grouped: compactProgress
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (quotaErr) {
          console.warn('LocalStorage quota limit reached, pruning non-critical metadata for cache:', quotaErr);
          // Fallback: If still large, omit notes/dates in localStorage (Supabase retains full data)
          if (compactProgress) {
            const minimalProgress = {};
            for (const sid in compactProgress) {
              minimalProgress[sid] = compactProgress[sid].map(t => [t[0], t[1]]);
            }
            const minimalPayload = {
              ...dataToSave,
              progress_hafalan: undefined,
              _p_grouped: minimalProgress
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalPayload));
          }
        }
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

    // Super Admin Protection: Only Super Admin (iman) can update their own account
    if (user.username?.toLowerCase() === 'iman') {
      const { auth } = await import('./auth.js');
      const currentUser = auth.getCurrentUser();
      if (currentUser?.username?.toLowerCase() !== 'iman') {
        throw new Error('Akses ditolak: Akun Super Admin tidak dapat diubah oleh Admin biasa.');
      }
    }

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
    } else if (user.role === 'santri' && !cleanKelas && oldKelas) {
      // Student's class was set to null (tanpa kelas)
      const oldLink = this.data.santri_kelas.find(sk => sk.santri_id === user.id && !sk.tanggal_keluar);
      if (oldLink) {
        this.removeStudentFromClass(user.id, oldLink.kelas_id);
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

    // Super Admin Protection: cannot be deleted
    if (user.username?.toLowerCase() === 'iman') {
      throw new Error('Akun Super Admin (iman) dilindungi dan tidak dapat dihapus.');
    }

    // 1. Remove from local store users
    this.data.users = this.data.users.filter(u => u.id !== userId);

    // 2. Remove from santri_kelas links
    this.data.santri_kelas = this.data.santri_kelas.filter(sk => sk.santri_id !== userId);

    // 3. Remove progress and riwayat
    this.data.progress_hafalan = this.data.progress_hafalan.filter(p => p.santri_id !== userId);
    this.data.riwayat_setoran = this.data.riwayat_setoran.filter(r => r.santri_id !== userId);

    // 4. If guru, unassign from classes
    this.data.kelas.forEach(k => {
      if (k.guru_id === userId) k.guru_id = null;
    });

    this.save();

    // Sync deletion to Supabase
    await supabaseService.deleteUser(userId, user.username).catch(err => {
      console.warn('Sync deleteUser to Supabase notice:', err);
    });

    return true;
  }

  async toggleUserActive(userId) {
    const user = this.getUserById(userId);
    if (!user) return false;

    // Super Admin Protection: cannot be deactivated
    if (user.username?.toLowerCase() === 'iman') {
      throw new Error('Akun Super Admin (iman) dilindungi dan tidak dapat dinonaktifkan.');
    }

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
    
    // Release active student links to this class
    this.data.santri_kelas.forEach(sk => {
      if (sk.kelas_id === classId && !sk.tanggal_keluar) {
        sk.tanggal_keluar = new Date().toISOString().split('T')[0];
      }
    });

    // Unassign kelas_nama for students in this class so they can be selected for new classes
    this.data.users.forEach(u => {
      if (u.role === 'santri' && u.kelas_nama && u.kelas_nama.toLowerCase() === cls.nama_kelas.toLowerCase()) {
        u.kelas_nama = null;
      }
    });

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
    const cls = this.getClassById(classId);
    const className = cls ? cls.nama_kelas.toLowerCase() : '';

    const studentMap = new Map();

    // 1. Check direct active santri_kelas links
    const activeLinks = this.data.santri_kelas.filter(sk => sk.kelas_id === classId && !sk.tanggal_keluar);
    activeLinks.forEach(sk => {
      const student = this.getUserById(sk.santri_id);
      if (student && student.status_aktif && student.role === 'santri') {
        studentMap.set(student.id, {
          ...student,
          linkId: sk.id,
          tanggal_masuk: sk.tanggal_masuk
        });
      }
    });

    // 2. Self-healing: Check active students with matching kelas_nama
    if (className) {
      const matchingUsers = this.data.users.filter(u => 
        u.role === 'santri' && 
        u.status_aktif && 
        u.kelas_nama && 
        u.kelas_nama.toLowerCase() === className
      );

      matchingUsers.forEach(u => {
        if (!studentMap.has(u.id)) {
          let existingLink = this.data.santri_kelas.find(sk => sk.santri_id === u.id && sk.kelas_id === classId);
          if (existingLink) {
            existingLink.tanggal_keluar = null;
          } else {
            existingLink = {
              id: `sk-${Date.now()}-${u.id.substring(0, 5)}`,
              santri_id: u.id,
              kelas_id: classId,
              tanggal_masuk: new Date().toISOString().split('T')[0],
              tanggal_keluar: null
            };
            this.data.santri_kelas.push(existingLink);
            supabaseService.addSantriToClass(u.id, classId).catch(() => {});
          }
          studentMap.set(u.id, {
            ...u,
            linkId: existingLink.id,
            tanggal_masuk: existingLink.tanggal_masuk
          });
        }
      });
    }

    return Array.from(studentMap.values());
  }

  // --- Students Taught by Guru ---
  getStudentsByGuru(guruId) {
    if (!guruId) return [];
    const myClasses = this.getClasses(guruId);
    const studentMap = new Map();

    myClasses.forEach(cls => {
      const students = this.getStudentsInClass(cls.id);
      students.forEach(st => {
        if (!studentMap.has(st.id) && st.status_aktif !== false) {
          studentMap.set(st.id, {
            ...st,
            kelas_nama: st.kelas_nama || cls.nama_kelas
          });
        }
      });
    });

    return Array.from(studentMap.values()).sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
  }

  getStudentClass(santriId) {
    const link = this.data.santri_kelas.find(sk => sk.santri_id === santriId && !sk.tanggal_keluar);
    if (link) {
      const cls = this.getClassById(link.kelas_id);
      if (cls) return cls;
    }
    const student = this.getUserById(santriId);
    if (student && student.kelas_nama) {
      return this.data.kelas.find(k => k.nama_kelas.toLowerCase() === student.kelas_nama.toLowerCase() && !k.dihapus_pada) || null;
    }
    return null;
  }

  async addStudentToClass(santriId, classId) {
    const cls = this.getClassById(classId);
    if (!cls) return null;

    // 1. Release any existing active link to other classes
    this.data.santri_kelas.forEach(sk => {
      if (sk.santri_id === santriId && !sk.tanggal_keluar && sk.kelas_id !== classId) {
        sk.tanggal_keluar = new Date().toISOString().split('T')[0];
        supabaseService.removeSantriFromClass(santriId, sk.kelas_id).catch(() => {});
      }
    });

    // 2. Find or create link for this class
    let link = this.data.santri_kelas.find(sk => sk.santri_id === santriId && sk.kelas_id === classId);
    if (link) {
      link.tanggal_keluar = null;
      link.tanggal_masuk = new Date().toISOString().split('T')[0];
    } else {
      link = {
        id: `sk-${Date.now()}`,
        santri_id: santriId,
        kelas_id: classId,
        tanggal_masuk: new Date().toISOString().split('T')[0],
        tanggal_keluar: null
      };
      this.data.santri_kelas.push(link);
    }

    // 3. Atomically set student's kelas_nama
    const student = this.getUserById(santriId);
    if (student) {
      student.kelas_nama = cls.nama_kelas;
      supabaseService.updateUser(santriId, { kelas_nama: cls.nama_kelas }).catch(() => {});
    }

    this.save();
    await supabaseService.addSantriToClass(santriId, classId).catch(e => {
      console.warn('Supabase addSantriToClass notice:', e);
    });

    return link;
  }

  async removeStudentFromClass(santriId, classId) {
    const link = this.data.santri_kelas.find(sk => sk.santri_id === santriId && sk.kelas_id === classId && !sk.tanggal_keluar);
    if (link) {
      link.tanggal_keluar = new Date().toISOString().split('T')[0];
    }
    // Release student's kelas_nama
    const student = this.getUserById(santriId);
    const cls = this.getClassById(classId);
    if (student && cls && student.kelas_nama && student.kelas_nama.toLowerCase() === cls.nama_kelas.toLowerCase()) {
      student.kelas_nama = null;
      supabaseService.updateUser(student.id, { kelas_nama: null }).catch(() => {});
    }
    this.save();
    if (link) {
      await supabaseService.removeSantriFromClass(santriId, classId).catch(() => {});
    }
    return true;
  }

  async assignClassToGuru(classId, guruId) {
    const cls = this.getClassById(classId);
    if (!cls) return false;
    cls.guru_id = guruId;
    this.save();
    await supabaseService.updateClass(classId, { guru_id: guruId }).catch(() => {});
    return true;
  }

  async unassignClassFromGuru(classId) {
    const cls = this.getClassById(classId);
    if (!cls) return false;
    cls.guru_id = null;
    this.save();
    await supabaseService.updateClass(classId, { guru_id: null }).catch(() => {});
    return true;
  }

  // --- Progress & Validation (Fitur Inti PRD 6.3) ---
  getStudentMemorizedVerses(santriId) {
    const verses = (this.data.progress_hafalan || []).filter(p => p.santri_id === santriId && p.status === 'hafal');
    const uniqueMap = new Map();
    verses.forEach(v => {
      const s = parseInt(v.nomorSurat || v.nomor_surat) || 0;
      const a = parseInt(v.nomorAyat || v.nomor_ayat) || 0;
      if (s > 0 && a > 0) {
        const key = `${s}:${a}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { ...v, nomorSurat: s, nomorAyat: a });
        }
      }
    });
    return Array.from(uniqueMap.values());
  }

  isVerseMemorized(santriId, nomorSurat, nomorAyat) {
    const sTarget = parseInt(nomorSurat);
    const aTarget = parseInt(nomorAyat);
    return (this.data.progress_hafalan || []).some(p => 
      p.santri_id === santriId && 
      (p.nomorSurat === sTarget || p.nomor_surat === sTarget) && 
      (p.nomorAyat === aTarget || p.nomor_ayat === aTarget) && 
      p.status === 'hafal'
    );
  }

  getSurahMemorizedCount(santriId, nomorSurat) {
    const sTarget = parseInt(nomorSurat);
    const verses = (this.data.progress_hafalan || []).filter(p => 
      p.santri_id === santriId && 
      (p.nomorSurat === sTarget || p.nomor_surat === sTarget) && 
      p.status === 'hafal'
    );
    // Deduplicate in case multiple records exist for the same ayah
    const ayatSet = new Set();
    verses.forEach(p => {
      const a = parseInt(p.nomorAyat || p.nomor_ayat);
      if (a) ayatSet.add(a);
    });
    return ayatSet.size;
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

      const actualJuz = getJuzForVerse(nomorSurat, ayatNum);
      if (existingIdx >= 0) {
        if (this.data.progress_hafalan[existingIdx].status !== 'hafal') {
          addedCount++;
        }
        this.data.progress_hafalan[existingIdx].status = 'hafal';
        this.data.progress_hafalan[existingIdx].nomorJuz = actualJuz;
        this.data.progress_hafalan[existingIdx].dicentangOleh = guruId;
        this.data.progress_hafalan[existingIdx].tanggalSetor = dateStr;
        if (catatan) this.data.progress_hafalan[existingIdx].catatan = catatan;
      } else {
        this.data.progress_hafalan.push({
          santri_id: santriId,
          nomorSurat,
          nomorAyat: ayatNum,
          nomorJuz: actualJuz,
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
    const cloudRows = ayatList.map(a => ({
      santri_id: santriId,
      nomor_surat: nomorSurat,
      nomor_ayat: a,
      nomor_juz: getJuzForVerse(nomorSurat, a),
      status: 'hafal',
      dicentang_oleh: guruId,
      catatan
    }));
    supabaseService.saveValidationBulk(cloudRows).catch(e => console.warn('Supabase saveValidation bg err:', e));

    return { addedCount, totalSubmitted: ayatList.length };
  }

  // --- Multi-Surah Validation (Bulk Optimized) ---
  saveMultiSurahValidation({ santriId, items, guruId, catatan = "" }) {
    // items: array of { nomorSurat, namaSurat, ayatList }
    const guru = this.getUserById(guruId);
    const guruNama = guru ? guru.nama : "Guru";
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let totalAddedCount = 0;
    let totalSubmittedCount = 0;
    const processedSurahs = [];
    const bulkCloudProgressRows = [];
    const bulkCloudRiwayatItems = [];

    items.forEach(item => {
      const { nomorSurat, namaSurat, ayatList } = item;
      totalSubmittedCount += ayatList.length;
      processedSurahs.push(namaSurat);

      // 1. Process verses locally
      ayatList.forEach(ayatNum => {
        const existingIdx = this.data.progress_hafalan.findIndex(p => 
          p.santri_id === santriId && p.nomorSurat === nomorSurat && p.nomorAyat === ayatNum
        );

        const actualJuz = getJuzForVerse(nomorSurat, ayatNum);
        if (existingIdx >= 0) {
          if (this.data.progress_hafalan[existingIdx].status !== 'hafal') {
            totalAddedCount++;
          }
          this.data.progress_hafalan[existingIdx].status = 'hafal';
          this.data.progress_hafalan[existingIdx].nomorJuz = actualJuz;
          this.data.progress_hafalan[existingIdx].dicentangOleh = guruId;
          this.data.progress_hafalan[existingIdx].tanggalSetor = dateStr;
          if (catatan) this.data.progress_hafalan[existingIdx].catatan = catatan;
        } else {
          this.data.progress_hafalan.push({
            santri_id: santriId,
            nomorSurat,
            nomorAyat: ayatNum,
            nomorJuz: actualJuz,
            status: 'hafal',
            tanggalSetor: dateStr,
            dicentangOleh: guruId,
            catatan
          });
          totalAddedCount++;
        }

        bulkCloudProgressRows.push({
          santri_id: santriId,
          nomor_surat: nomorSurat,
          nomor_ayat: ayatNum,
          nomor_juz: actualJuz,
          status: 'hafal',
          dicentang_oleh: guruId,
          catatan
        });
      });

      // 2. Add riwayat entry for this surah
      if (ayatList.length > 0) {
        const sortedAyat = [...ayatList].sort((a, b) => a - b);
        const minAyat = sortedAyat[0];
        const maxAyat = sortedAyat[sortedAyat.length - 1];

        const duplicateRecent = this.data.riwayat_setoran.find(r => 
          r.santri_id === santriId &&
          r.nomorSurat === nomorSurat &&
          r.ayatMulai === minAyat &&
          r.ayatSelesai === maxAyat &&
          (r.tanggal || '').substring(0, 16) === dateStr.substring(0, 16)
        );

        if (!duplicateRecent) {
          const riwayatItem = {
            id: `rw-${Date.now()}-${nomorSurat}`,
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
          };

          this.data.riwayat_setoran.unshift(riwayatItem);
          bulkCloudRiwayatItems.push(riwayatItem);
        }
      }
    });

    // Save locally ONCE to prevent redundant re-renders & race conditions
    this.save();

    // Async bulk push to Supabase Cloud
    if (bulkCloudProgressRows.length > 0) {
      supabaseService.saveValidationBulk(bulkCloudProgressRows).catch(e => console.warn('Supabase bulk progress error:', e));
    }
    if (bulkCloudRiwayatItems.length > 0) {
      supabaseService.createRiwayatBulk(bulkCloudRiwayatItems).catch(e => console.warn('Supabase bulk riwayat error:', e));
    }

    return { totalAddedCount, totalSubmittedCount, processedSurahs };
  }

  // --- Hafalan Reports (Per Hari & Pekan) ---
  getHafalanReport({ period = 'all', startDate = null, endDate = null, classId = null, guruId = null, studentId = null }) {
    let history = [...this.data.riwayat_setoran];

    // Filter by guru's students (only include students taught by this teacher)
    if (guruId) {
      const myStudents = this.getStudentsByGuru(guruId);
      const myStudentIds = new Set(myStudents.map(s => s.id));
      history = history.filter(h => myStudentIds.has(h.santri_id));
    }

    // Filter by specific class if selected
    if (classId) {
      const classStudents = this.getStudentsInClass(classId);
      const classStudentIds = new Set(classStudents.map(s => s.id));
      history = history.filter(h => classStudentIds.has(h.santri_id));
    }

    // Filter by specific student
    if (studentId) {
      history = history.filter(h => h.santri_id === studentId);
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;

    if (period === 'today') {
      history = history.filter(h => (h.tanggal || '').split(' ')[0] === todayStr);
    } else if (period === 'week') {
      history = history.filter(h => {
        const d = (h.tanggal || '').split(' ')[0];
        return d >= weekAgoStr && d <= todayStr;
      });
    } else if (period === 'custom' && startDate && endDate) {
      history = history.filter(h => {
        const d = (h.tanggal || '').split(' ')[0];
        return d >= startDate && d <= endDate;
      });
    }

    // Map student details, class name
    let mapped = history.map(item => {
      const student = this.getUserById(item.santri_id);
      let className = student?.kelas_nama;
      if (!className && student) {
        const sClass = this.getStudentClass(student.id);
        className = sClass ? sClass.nama_kelas : '-';
      }
      return {
        ...item,
        studentName: student ? student.nama : 'Murid',
        studentUsername: student ? student.username : '',
        className: className || 'Kelas Belum Ditentukan'
      };
    });

    return mapped;
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

    // Progress by Juz (Accurately calculate all 30 Juz based on memorized verses)
    const juzVersesCount = {};
    for (let j = 1; j <= 30; j++) {
      juzVersesCount[j] = 0;
    }

    memorized.forEach(p => {
      const juz = getJuzForVerse(p.nomorSurat, p.nomorAyat);
      if (juz >= 1 && juz <= 30) {
        juzVersesCount[juz]++;
      }
    });

    const juzProgress = JUZ_MAPPING.map(jm => {
      const count = juzVersesCount[jm.juz] || 0;
      const pct = Math.min(100, Math.round((count / jm.totalAyat) * 100));
      return {
        juz: jm.juz,
        name: jm.name,
        totalAyat: jm.totalAyat,
        memorizedCount: count,
        percentage: pct,
        status: pct >= 100 ? 'completed' : pct > 0 ? 'in-progress' : 'unstarted'
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
