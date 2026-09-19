/**
 * TAHFIDZ TRACKER - SUPABASE SERVICE (PRD v2)
 * Live Cloud Synchronization with Supabase Database (iman-ngaji).
 */

export const SUPABASE_CONFIG = {
  url: 'https://bnlogvposwzcnyllgksa.supabase.co',
  publishableKey: 'sb_publishable_7VL__p4dVsVcLtAn45Jj5w_PQOsfOqI'
};

class SupabaseService {
  constructor() {
    this.url = SUPABASE_CONFIG.url;
    this.apiKey = SUPABASE_CONFIG.publishableKey;
    this.isConnected = false;
  }

  getHeaders() {
    return {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async checkConnection() {
    try {
      const resp = await fetch(`${this.url}/rest/v1/users?select=count`, {
        method: 'HEAD',
        headers: this.getHeaders()
      });
      this.isConnected = resp.ok;
      return this.isConnected;
    } catch (e) {
      this.isConnected = false;
      return false;
    }
  }

  // --- Users ---
  async getUsers() {
    try {
      const resp = await fetch(`${this.url}/rest/v1/users?select=*&order=dibuat_pada.asc`, {
        headers: this.getHeaders()
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return data.map(u => ({
        id: u.id,
        nama: u.nama,
        username: u.username,
        password: u.password_hash,
        role: u.role,
        kelas_nama: u.kelas_nama || null,
        target_juz: u.target_juz,
        status_aktif: u.status_aktif,
        dibuat_pada: u.dibuat_pada?.split('T')[0]
      }));
    } catch (e) {
      console.warn('Failed to fetch users from Supabase:', e);
      return null;
    }
  }

  async createUser(user) {
    try {
      const resp = await fetch(`${this.url}/rest/v1/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          nama: user.nama,
          username: user.username,
          password_hash: user.password,
          role: user.role,
          kelas_nama: user.kelas_nama || null,
          target_juz: user.target_juz || 30,
          status_aktif: true
        })
      });
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.message || `Gagal membuat user di Supabase (HTTP ${resp.status})`);
      }
      const created = await resp.json();
      return created[0];
    } catch (e) {
      console.error('Supabase createUser error:', e);
      throw e;
    }
  }

  async updateUser(userOrId, fields) {
    try {
      let queryParam = '';
      const isUUID = typeof userOrId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userOrId);
      
      if (isUUID) {
        queryParam = `id=eq.${userOrId}`;
      } else if (typeof userOrId === 'object' && userOrId.id) {
        queryParam = `id=eq.${userOrId.id}`;
      } else if (typeof userOrId === 'object' && userOrId.username) {
        queryParam = `username=eq.${encodeURIComponent(userOrId.username)}`;
      } else {
        queryParam = `username=eq.${encodeURIComponent(userOrId)}`;
      }

      const bodyData = {};
      if (fields.nama !== undefined) bodyData.nama = fields.nama;
      if (fields.username !== undefined) bodyData.username = fields.username;
      if (fields.password !== undefined) bodyData.password_hash = fields.password;
      if (fields.kelas_nama !== undefined) bodyData.kelas_nama = fields.kelas_nama;
      if (fields.status_aktif !== undefined) bodyData.status_aktif = fields.status_aktif;

      const resp = await fetch(`${this.url}/rest/v1/users?${queryParam}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(bodyData)
      });
      return resp.ok;
    } catch (e) {
      console.warn('Supabase updateUser error:', e);
      return false;
    }
  }

  async deleteUser(userOrId, username = null) {
    try {
      let queryParam = '';
      const isUUID = typeof userOrId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userOrId);
      
      if (isUUID) {
        queryParam = `id=eq.${userOrId}`;
      } else if (username) {
        queryParam = `username=eq.${encodeURIComponent(username)}`;
      } else if (typeof userOrId === 'object' && userOrId.id) {
        queryParam = `id=eq.${userOrId.id}`;
      } else {
        queryParam = `username=eq.${encodeURIComponent(userOrId)}`;
      }

      const resp = await fetch(`${this.url}/rest/v1/users?${queryParam}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return resp.ok;
    } catch (e) {
      console.warn('Supabase deleteUser error:', e);
      return false;
    }
  }

  async updateUserStatus(userOrId, status_aktif, username = null) {
    return this.updateUser(userOrId, { status_aktif });
  }

  async updatePassword(userOrId, newPassword, username = null) {
    return this.updateUser(userOrId, { password: newPassword });
  }

  // --- Classes (Kelas) ---
  async getClasses() {
    try {
      const resp = await fetch(`${this.url}/rest/v1/kelas?select=*&dihapus_pada=is.null&order=dibuat_pada.asc`, {
        headers: this.getHeaders()
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return data.map(c => ({
        id: c.id,
        nama_kelas: c.nama_kelas,
        guru_id: c.guru_id,
        target_juz: c.target_juz,
        dibuat_pada: c.dibuat_pada?.split('T')[0],
        dihapus_pada: c.dihapus_pada
      }));
    } catch (e) {
      console.warn('Failed to fetch classes from Supabase:', e);
      return null;
    }
  }

  async createClass(cls) {
    try {
      const resp = await fetch(`${this.url}/rest/v1/kelas`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          nama_kelas: cls.nama_kelas,
          guru_id: cls.guru_id,
          target_juz: cls.target_juz || 30
        })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const res = await resp.json();
      return res[0];
    } catch (e) {
      console.warn('Supabase createClass error:', e);
      return null;
    }
  }

  async updateClass(classId, fields) {
    try {
      const isUUID = typeof classId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId);
      const query = isUUID ? `id=eq.${classId}` : `nama_kelas=eq.${encodeURIComponent(classId)}`;
      const resp = await fetch(`${this.url}/rest/v1/kelas?${query}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(fields)
      });
      return resp.ok;
    } catch (e) {
      console.warn('Supabase updateClass error:', e);
      return false;
    }
  }

  async deleteClass(classId, nama_kelas = null) {
    try {
      const isUUID = typeof classId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId);
      const query = isUUID ? `id=eq.${classId}` : (nama_kelas ? `nama_kelas=eq.${encodeURIComponent(nama_kelas)}` : null);
      if (!query) return false;
      const resp = await fetch(`${this.url}/rest/v1/kelas?${query}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ dihapus_pada: new Date().toISOString() })
      });
      return resp.ok;
    } catch (e) {
      console.warn('Supabase deleteClass error:', e);
      return false;
    }
  }

  // --- Santri Kelas Links ---
  async getSantriKelas() {
    try {
      const resp = await fetch(`${this.url}/rest/v1/santri_kelas?select=*&tanggal_keluar=is.null`, {
        headers: this.getHeaders()
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  }

  async addSantriToClass(santri_id, kelas_id) {
    try {
      await fetch(`${this.url}/rest/v1/santri_kelas`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ santri_id, kelas_id })
      });
    } catch (e) {
      console.warn('Supabase addSantriToClass error:', e);
    }
  }

  async removeSantriFromClass(santri_id, kelas_id) {
    try {
      await fetch(`${this.url}/rest/v1/santri_kelas?santri_id=eq.${santri_id}&kelas_id=eq.${kelas_id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ tanggal_keluar: new Date().toISOString().split('T')[0] })
      });
    } catch (e) {
      console.warn('Supabase removeSantriFromClass error:', e);
    }
  }

  // --- Progress Hafalan ---
  async getProgress() {
    try {
      const resp = await fetch(`${this.url}/rest/v1/progress_hafalan?select=*`, {
        headers: this.getHeaders()
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.map(p => ({
        id: p.id,
        santri_id: p.santri_id,
        nomorSurat: p.nomor_surat,
        nomorAyat: p.nomor_ayat,
        nomorJuz: p.nomor_juz,
        status: p.status,
        tanggalSetor: p.tanggal_setor,
        dicentangOleh: p.dicentang_oleh,
        catatan: p.catatan
      }));
    } catch (e) {
      return null;
    }
  }

  async saveValidation({ santriId, nomorSurat, ayatList, guruId, catatan }) {
    try {
      const rows = ayatList.map(ayat => ({
        santri_id: santriId,
        nomor_surat: nomorSurat,
        nomor_ayat: ayat,
        nomor_juz: 30,
        status: 'hafal',
        dicentang_oleh: guruId,
        catatan
      }));

      // Upsert progress_hafalan
      await fetch(`${this.url}/rest/v1/progress_hafalan?on_conflict=santri_id,nomor_surat,nomor_ayat`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(rows)
      });
    } catch (e) {
      console.warn('Supabase saveValidation error:', e);
    }
  }

  // --- Riwayat Setoran ---
  async getRiwayat() {
    try {
      const resp = await fetch(`${this.url}/rest/v1/riwayat_setoran?select=*&order=dibuat_pada.desc`, {
        headers: this.getHeaders()
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.map(r => ({
        id: r.id,
        santri_id: r.santri_id,
        nomorSurat: r.nomor_surat,
        namaSurat: r.nama_surat,
        ayatMulai: r.ayat_mulai,
        ayatSelesai: r.ayat_selesai,
        totalAyat: r.total_ayat,
        status: r.status_saat_itu,
        guru_id: r.guru_id,
        catatan: r.catatan,
        tanggal: r.dibuat_pada?.replace('T', ' ').substring(0, 16)
      }));
    } catch (e) {
      return null;
    }
  }

  async createRiwayat(item) {
    try {
      await fetch(`${this.url}/rest/v1/riwayat_setoran`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          santri_id: item.santri_id,
          nomor_surat: item.nomorSurat,
          nama_surat: item.namaSurat,
          ayat_mulai: item.ayatMulai,
          ayat_selesai: item.ayatSelesai,
          total_ayat: item.totalAyat,
          status_saat_itu: item.status || 'hafal',
          guru_id: item.guru_id,
          catatan: item.catatan
        })
      });
    } catch (e) {
      console.warn('Supabase createRiwayat error:', e);
    }
  }
}

export const supabaseService = new SupabaseService();
