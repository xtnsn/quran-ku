/**
 * TAHFIDZ TRACKER - DEVELOPER / SUPER ADMIN VIEW (PRD v2)
 * Account Provisioning (Guru & Santri), Password Reset, System Monitoring.
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { app } from '../app.js';

export const adminView = {
  activeTab: 'users', // 'overview', 'users', 'classes', 'profile'
  filterRole: 'all',

  // ==========================================
  // ==========================================
  // TAB 1: KELOLA AKUN (PRD 6.4)
  // ==========================================
  renderAccounts() {
    let users = store.data.users;
    if (this.filterRole === 'guru') {
      users = users.filter(u => u.role === 'guru');
    } else if (this.filterRole === 'santri') {
      users = users.filter(u => u.role === 'santri');
    } else if (this.filterRole === 'inactive') {
      users = users.filter(u => !u.status_aktif);
    }

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Top Title & Action -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Kelola Akun Sistem</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Provisioning akun Guru & Santri (No Self-Register)</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-create-account-sheet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Buat Akun</span>
          </button>
        </div>

        <!-- Role Filter Tabs -->
        <div class="filter-pills-row" style="margin-bottom: 14px; padding: 0 0 8px 0; background: transparent;">
          <button class="filter-pill ${this.filterRole === 'all' ? 'active' : ''}" data-role="all">Semua (${store.data.users.length})</button>
          <button class="filter-pill ${this.filterRole === 'santri' ? 'active' : ''}" data-role="santri">Santri (${store.getUsersByRole('santri').length})</button>
          <button class="filter-pill ${this.filterRole === 'guru' ? 'active' : ''}" data-role="guru">Guru (${store.getUsersByRole('guru').length})</button>
          <button class="filter-pill ${this.filterRole === 'inactive' ? 'active' : ''}" data-role="inactive">Nonaktif (${store.data.users.filter(u => !u.status_aktif).length})</button>
        </div>

        <!-- User Accounts List -->
        <div class="user-accounts-list" style="display: flex; flex-direction: column; gap: 10px;">
          ${users.map(u => {
            const roleBadgeClass = u.role === 'developer' ? 'badge-warning' : u.role === 'guru' ? 'badge-primary' : 'badge-success';
            const teacherClasses = u.role === 'guru' ? store.getClasses(u.id).map(c => c.nama_kelas).join(', ') : '';

            return `
              <div class="card" style="padding: 14px; opacity: ${u.status_aktif ? 1 : 0.6}; border-left: 4px solid ${u.status_aktif ? 'var(--color-primary)' : 'var(--color-danger)'};">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px;">
                  <div>
                    <div style="font-size: 15px; font-weight: 700; color: var(--text-dark);">${u.nama}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
                      @${u.username} • Sandi: <code>${u.password}</code>
                    </div>
                    ${u.role === 'santri' ? `
                      <span class="badge badge-primary" style="font-size: 11px;">Kelas: ${u.kelas_nama || 'Belum Ditentukan'}</span>
                    ` : u.role === 'guru' ? `
                      <div style="font-size: 11px; color: var(--text-muted);">
                        Mengajar: <strong>${teacherClasses || 'Belum Ada Kelas'}</strong>
                      </div>
                    ` : ''}
                  </div>
                  <span class="badge ${roleBadgeClass}">${u.role.toUpperCase()}</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; border-top: 1px solid var(--border-light); padding-top: 8px;">
                  <span style="font-size: 11px; color: ${u.status_aktif ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 600;">
                    ${u.status_aktif ? '● Aktif' : '○ Nonaktif'}
                  </span>

                  <div style="display: flex; gap: 6px;">
                    ${u.role !== 'developer' ? `
                      <button class="btn btn-secondary btn-sm btn-edit-user" data-user-id="${u.id}" title="Edit Data Akun" style="padding: 4px 8px; font-size: 11px;">
                        ✏️ Edit
                      </button>
                      <button class="btn ${u.status_aktif ? 'btn-secondary' : 'btn-primary'} btn-sm btn-toggle-active-user" data-user-id="${u.id}" style="padding: 4px 8px; font-size: 11px;">
                        ${u.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button class="btn btn-danger btn-sm btn-delete-user" data-user-id="${u.id}" data-username="${u.username}" data-nama="${u.nama}" title="Hapus Permanen" style="padding: 4px 8px; font-size: 11px;">
                        🗑️ Hapus
                      </button>
                    ` : `
                      <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Root Super Admin</span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  initAccountsEvents() {
    // Role filter pill clicks
    document.querySelectorAll('.filter-pill[data-role]').forEach(pill => {
      pill.addEventListener('click', () => {
        this.filterRole = pill.dataset.role;
        app.render();
      });
    });

    // Create Account Modal Sheet
    const createBtn = document.getElementById('btn-create-account-sheet');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.showCreateAccountSheet();
      });
    }

    // Edit User (Student or Teacher)
    document.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.userId;
        this.showEditUserSheet(uid);
      });
    });

    // Delete User Permanently
    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const uid = btn.dataset.userId;
        const uname = btn.dataset.username;
        const nama = btn.dataset.nama;
        if (confirm(`Yakin ingin menghapus akun "${nama}" (@${uname}) secara permanen dari database? Seluruh data hafalan dan kelas akun ini akan dibersihkan.`)) {
          btn.disabled = true;
          await store.deleteUser(uid);
          app.showToast(`Akun "${nama}" berhasil dihapus permanen dari sistem & cloud!`, 'info');
          app.render();
        }
      });
    });

    // Toggle Active/Inactive
    document.querySelectorAll('.btn-toggle-active-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        const uid = btn.dataset.userId;
        const isActive = await store.toggleUserActive(uid);
        app.showToast(`Status akun diperbarui: ${isActive ? 'Aktif' : 'Nonaktif'} (Tersinkron ke Cloud)`, 'info');
        app.render();
      });
    });
  },

  showCreateAccountSheet() {
    const classes = store.getClasses();

    const content = `
      <form id="form-create-account" style="padding: 10px 0;">
        <div class="form-group">
          <label class="form-label">Peran Akun (Role)</label>
          <select id="acc-role" class="form-select" required>
            <option value="santri">Santri Tahfidz</option>
            <option value="guru">Guru Ngaji / Asatidz</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Nama Lengkap</label>
          <input type="text" id="acc-nama" class="form-input" placeholder="Contoh: Ryan Pratama" required>
        </div>

        <div class="form-group">
          <label class="form-label">Username (Untuk Login)</label>
          <input type="text" id="acc-username" class="form-input" placeholder="Contoh: ryan" required>
        </div>

        <div class="form-group">
          <label class="form-label">Kata Sandi Awal</label>
          <input type="text" id="acc-password" class="form-input" value="123" required>
        </div>

        <!-- Santri Specific: Sistem Kelas -->
        <div id="santri-only-fields">
          <div class="form-group">
            <label class="form-label">Kelas Santri (Wajib)</label>
            <input type="text" id="acc-kelas-nama" class="form-input" placeholder="Ketik nama kelas, contoh: 3A atau 3B" required list="existing-classes-list">
            <datalist id="existing-classes-list">
              ${classes.map(c => `<option value="${c.nama_kelas}">`).join('')}
            </datalist>
            <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block;">Contoh: Ryan kelas 3A, Aldi kelas 3B</span>
          </div>
        </div>

        <!-- Guru Specific: Kelas yang Diampu -->
        <div id="guru-only-fields" style="display: none;">
          <div class="form-group">
            <label class="form-label">Kelas yang Diampu (Opsional)</label>
            <select id="acc-guru-class-id" class="form-select">
              <option value="">-- Belum Menugaskan Kelas --</option>
              ${classes.map(c => `
                <option value="${c.id}">${c.nama_kelas}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 14px;">
          Buat Akun Sekarang
        </button>
      </form>
    `;

    app.showBottomSheet('Buat Akun Baru (Admin)', content);

    const roleSelect = document.getElementById('acc-role');
    const santriFields = document.getElementById('santri-only-fields');
    const guruFields = document.getElementById('guru-only-fields');
    const kelasInput = document.getElementById('acc-kelas-nama');

    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const isSantri = e.target.value === 'santri';
        if (santriFields) santriFields.style.display = isSantri ? 'block' : 'none';
        if (guruFields) guruFields.style.display = isSantri ? 'none' : 'block';
        if (kelasInput) kelasInput.required = isSantri;
      });
    }

    const form = document.getElementById('form-create-account');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳ Menyimpan ke Database...</span>';
        }

        const role = roleSelect.value;
        const nama = document.getElementById('acc-nama').value.trim();
        const username = document.getElementById('acc-username').value.trim();
        const password = document.getElementById('acc-password').value.trim();
        const kelas_nama = role === 'santri' ? (document.getElementById('acc-kelas-nama')?.value.trim() || null) : null;
        const kelas_id = role === 'guru' ? (document.getElementById('acc-guru-class-id')?.value || null) : null;

        try {
          await store.createUser({
            nama,
            username,
            password,
            role,
            kelas_nama,
            kelas_id
          });
          app.closeBottomSheet();
          app.showToast(`Akun ${role} "${nama}" berhasil dibuat & disinkronkan ke Database!`, 'success');
          app.render();
        } catch (err) {
          alert(err.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Buat Akun Sekarang</span>';
          }
        }
      });
    }
  },

  showEditUserSheet(userId) {
    const user = store.getUserById(userId);
    if (!user) return;

    const classes = store.getClasses();

    const content = `
      <form id="form-edit-user" style="padding: 10px 0;">
        <div style="font-size: 12px; color: var(--color-primary); font-weight: 700; margin-bottom: 12px;">
          Peran: ${user.role.toUpperCase()}
        </div>

        <div class="form-group">
          <label class="form-label">Nama Lengkap</label>
          <input type="text" id="edit-nama" class="form-input" value="${user.nama}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" id="edit-username" class="form-input" value="${user.username}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Kata Sandi</label>
          <input type="text" id="edit-password" class="form-input" value="${user.password}" required>
        </div>

        ${user.role === 'santri' ? `
          <div class="form-group">
            <label class="form-label">Kelas Santri</label>
            <input type="text" id="edit-kelas-nama" class="form-input" value="${user.kelas_nama || ''}" placeholder="Contoh: 3A atau 3B" list="existing-edit-classes" required>
            <datalist id="existing-edit-classes">
              ${classes.map(c => `<option value="${c.nama_kelas}">`).join('')}
            </datalist>
          </div>
        ` : ''}

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 14px;">
          Simpan Perubahan
        </button>
      </form>
    `;

    app.showBottomSheet(`Edit Akun: ${user.nama}`, content);

    const form = document.getElementById('form-edit-user');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳ Memperbarui Database...</span>';
        }

        const nama = document.getElementById('edit-nama').value.trim();
        const username = document.getElementById('edit-username').value.trim();
        const password = document.getElementById('edit-password').value.trim();
        const kelas_nama = user.role === 'santri' ? (document.getElementById('edit-kelas-nama')?.value.trim() || null) : null;

        try {
          await store.updateUser({
            id: user.id,
            nama,
            username,
            password,
            kelas_nama
          });
          app.closeBottomSheet();
          app.showToast(`Data akun "${nama}" berhasil diperbarui di seluruh device!`, 'success');
          app.render();
        } catch (err) {
          alert(err.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Simpan Perubahan</span>';
          }
        }
      });
    }
  },

  // ==========================================
  // TAB 2: OVERVIEW & MONITORING (PRD 6.4)
  // ==========================================
  renderOverview() {
    const totalSantri = store.getUsersByRole('santri').length;
    const totalGuru = store.getUsersByRole('guru').length;
    const allClasses = store.getClasses();
    const totalSetoran = store.data.riwayat_setoran.length;

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Header -->
        <div class="hero-greeting-card">
          <span class="greeting-role-badge">SUPER ADMIN / DEVELOPER</span>
          <h2 class="greeting-name">Ringkasan Sistem</h2>
          <p class="greeting-desc">Monitoring menyeluruh seluruh kelas, guru, dan santri TPQ.</p>
        </div>

        <!-- Metrics Grid (PRD 6.4) -->
        <div class="quick-stats-grid">
          <div class="stat-box">
            <div class="stat-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <div class="stat-num">${totalSantri}</div>
              <div class="stat-label">Total Santri</div>
            </div>
          </div>

          <div class="stat-box">
            <div class="stat-icon-wrapper success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div class="stat-num">${totalGuru}</div>
              <div class="stat-label">Total Guru</div>
            </div>
          </div>

          <div class="stat-box">
            <div class="stat-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div>
              <div class="stat-num">${allClasses.length}</div>
              <div class="stat-label">Total Kelas</div>
            </div>
          </div>

          <div class="stat-box">
            <div class="stat-icon-wrapper success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <div class="stat-num">${totalSetoran}</div>
              <div class="stat-label">Setoran Sah</div>
            </div>
          </div>
        </div>

        <!-- Monitoring Seluruh Kelas Lintas Guru (PRD 6.4) -->
        <div class="card" style="margin-top: 6px;">
          <div class="card-header">
            <span class="card-title">Daftar Kelas Lintas Guru (Read-Only)</span>
            <span class="badge badge-primary">${allClasses.length} Kelas</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${allClasses.map(cls => {
              const guru = store.getUserById(cls.guru_id);
              const students = store.getStudentsInClass(cls.id);
              return `
                <div style="padding: 12px; background-color: var(--bg-page); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 14px; color: var(--text-dark);">${cls.nama_kelas}</strong>
                    <span class="badge badge-primary">Target: Juz ${cls.target_juz}</span>
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    Pengampu: <strong>${guru ? guru.nama : 'Belum Ada'}</strong> • Santri: <strong>${students.length} Orang</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // TAB 3: PROFIL ADMIN
  // ==========================================
  renderProfile() {
    const admin = auth.getCurrentUser();

    return `
      <div class="animate-fade" style="padding: 16px;">
        <div class="card" style="margin-bottom: 16px; text-align: center; padding: 24px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--color-warning) 0%, #D97706 100%); color: #FFFFFF; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);">
            🛡️
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${admin.nama}</h2>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">@${admin.username}</div>
          <span class="badge badge-warning">Hak Akses: Developer / Super Admin</span>
        </div>

        <!-- Supabase Live Cloud Status -->
        <div class="card" style="margin-bottom: 16px; border-left: 4px solid var(--color-success);">
          <div class="card-header">
            <span class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
              Supabase Cloud Database
            </span>
            <span class="badge badge-success">🟢 Terhubung Live</span>
          </div>
          <div style="font-size: 12px; color: var(--text-dark); margin-bottom: 6px;">
            Proyek: <strong>iman-ngaji</strong>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); word-break: break-all; margin-bottom: 12px;">
            <code>https://bnlogvposwzcnyllgksa.supabase.co</code>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="btn-sync-supabase" style="flex: 1;">
              🔄 Sinkronkan Sekarang
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-view-schema-info" style="flex: 1;">
              Info Skema
            </button>
          </div>
        </div>

        <button class="btn btn-danger btn-lg" id="btn-admin-logout" style="width: 100%;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Keluar dari Akun Admin</span>
        </button>
      </div>
    `;
  },

  initProfileEvents() {
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.logout();
        app.navigate('login');
        app.showToast('Anda telah keluar dari akun.', 'info');
      });
    }

    const syncBtn = document.getElementById('btn-sync-supabase');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.textContent = '⏳ Menyinkronkan...';
        await store.syncWithSupabase();
        syncBtn.textContent = '🔄 Sinkronkan Sekarang';
        app.showToast('Data berhasil disinkronkan dengan Supabase Cloud!', 'success');
        app.render();
      });
    }

    const schemaBtn = document.getElementById('btn-view-schema-info');
    if (schemaBtn) {
      schemaBtn.addEventListener('click', () => {
        app.showBottomSheet(
          'Skema Database Supabase',
          `<div style="padding: 10px 0;">
            <p style="font-size: 13px; color: var(--text-dark); margin-bottom: 10px;">
              Skema PostgreSQL Supabase telah dibuat pada file:<br>
              <code style="color: var(--color-primary); font-weight: bold;">database/supabase_schema.sql</code>
            </p>
            <ul style="font-size: 12px; color: var(--text-muted); line-height: 1.6; padding-left: 18px; margin-bottom: 14px;">
              <li>Tabel: <strong>users, kelas, santri_kelas, ayat_referensi, progress_hafalan, riwayat_setoran</strong></li>
              <li>Row Level Security (RLS) aktif untuk Developer, Guru, dan Santri</li>
              <li>Dapat disalin langsung ke SQL Editor di dashboard Supabase Cloud</li>
            </ul>
            <button class="btn btn-primary btn-sm" id="btn-close-schema-sheet" style="width: 100%;">Tutup</button>
          </div>`
        );
        document.getElementById('btn-close-schema-sheet')?.addEventListener('click', () => app.closeBottomSheet());
      });
    }
  }
};
