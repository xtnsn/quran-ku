/**
 * MI AL-HIDAYAH 1 - DEVELOPER / SUPER ADMIN VIEW
 * Account Provisioning (Guru & Murid), Class Management (Tambah & Hapus Kelas), System Monitoring.
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { app } from '../app.js';

export const adminView = {
  activeTab: 'users',
  filterRole: 'all',

  // ==========================================
  // TAB 1: KELOLA AKUN
  // ==========================================
  renderAccounts() {
    const currentUser = auth.getCurrentUser();
    const isCurrentSuperAdmin = currentUser?.username?.toLowerCase() === 'iman';

    let users = store.data.users.filter(u => !u.dihapus_pada);
    if (this.filterRole === 'guru') {
      users = users.filter(u => u.role === 'guru');
    } else if (this.filterRole === 'santri') {
      users = users.filter(u => u.role === 'santri');
    } else if (this.filterRole === 'admin') {
      users = users.filter(u => u.role === 'developer');
    } else if (this.filterRole === 'inactive') {
      users = users.filter(u => !u.status_aktif);
    }

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Top Title & Action -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Kelola Akun</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Data akun Pengguna MI Al-Hidayah 1</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-create-account-sheet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Buat Akun</span>
          </button>
        </div>

        <!-- Role Filter Tabs -->
        <div class="filter-pills-row" style="margin-bottom: 14px; padding: 0 0 8px 0; background: transparent;">
          <button class="filter-pill ${this.filterRole === 'all' ? 'active' : ''}" data-role="all">Semua (${store.data.users.filter(u => !u.dihapus_pada).length})</button>
          <button class="filter-pill ${this.filterRole === 'santri' ? 'active' : ''}" data-role="santri">Murid (${store.getUsersByRole('santri').filter(u => !u.dihapus_pada).length})</button>
          <button class="filter-pill ${this.filterRole === 'guru' ? 'active' : ''}" data-role="guru">Guru (${store.getUsersByRole('guru').filter(u => !u.dihapus_pada).length})</button>
          <button class="filter-pill ${this.filterRole === 'admin' ? 'active' : ''}" data-role="admin">Admin (${store.data.users.filter(u => u.role === 'developer' && !u.dihapus_pada).length})</button>
          <button class="filter-pill ${this.filterRole === 'inactive' ? 'active' : ''}" data-role="inactive">Nonaktif (${store.data.users.filter(u => !u.status_aktif && !u.dihapus_pada).length})</button>
        </div>

        <!-- User Accounts List -->
        <div class="user-accounts-list" style="display: flex; flex-direction: column; gap: 10px;">
          ${users.map(u => {
            const isUserSuperAdmin = u.username?.toLowerCase() === 'iman';
            const isUserRegularAdmin = u.role === 'developer' && !isUserSuperAdmin;
            
            let roleBadgeClass = 'badge-success';
            let roleLabel = 'MURID';
            if (isUserSuperAdmin) {
              roleBadgeClass = 'badge-warning';
              roleLabel = 'SUPER ADMIN';
            } else if (isUserRegularAdmin) {
              roleBadgeClass = 'badge-primary';
              roleLabel = 'ADMIN';
            } else if (u.role === 'guru') {
              roleBadgeClass = 'badge-primary';
              roleLabel = 'GURU';
            }
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
                  <span class="badge ${roleBadgeClass}">${roleLabel}</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; border-top: 1px solid var(--border-light); padding-top: 8px;">
                  <span style="font-size: 11px; color: ${u.status_aktif ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 600;">
                    ${u.status_aktif ? '● Aktif' : '○ Nonaktif'}
                  </span>

                  <div style="display: flex; gap: 6px; align-items: center;">
                    ${isUserSuperAdmin ? `
                      ${isCurrentSuperAdmin ? `
                        <button class="btn btn-secondary btn-sm btn-edit-user" data-user-id="${u.id}" title="Edit Data Akun" style="padding: 4px 8px; font-size: 11px;">
                          ✏️ Edit
                        </button>
                        <span style="font-size: 11px; color: var(--color-warning); font-weight: 700; margin-left: 4px;">Root Super Admin</span>
                      ` : `
                        <span class="badge" style="background: #FEF3C7; color: #D97706; font-size: 11px; font-weight: 700; padding: 4px 8px;">
                          🔒 Super Admin (Dilindungi)
                        </span>
                      `}
                    ` : `
                      <button class="btn btn-secondary btn-sm btn-edit-user" data-user-id="${u.id}" title="Edit Data Akun" style="padding: 4px 8px; font-size: 11px;">
                        ✏️ Edit
                      </button>
                      <button class="btn ${u.status_aktif ? 'btn-secondary' : 'btn-primary'} btn-sm btn-toggle-active-user" data-user-id="${u.id}" style="padding: 4px 8px; font-size: 11px;">
                        ${u.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button class="btn btn-danger btn-sm btn-delete-user" data-user-id="${u.id}" data-username="${u.username}" data-nama="${u.nama}" title="Hapus Permanen" style="padding: 4px 8px; font-size: 11px;">
                        🗑️ Hapus
                      </button>
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

    // Edit User
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
        if (confirm(`Yakin ingin menghapus akun "${nama}" (@${uname}) secara permanen? Seluruh riwayat hafalan dan data akun ini akan dibersihkan.`)) {
          btn.disabled = true;
          await store.deleteUser(uid);
          app.showToast(`Akun "${nama}" berhasil dihapus permanen!`, 'info');
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
        app.showToast(`Status akun diperbarui: ${isActive ? 'Aktif' : 'Nonaktif'}`, 'info');
        app.render();
      });
    });
  },

  showCreateAccountSheet() {
    const currentUser = auth.getCurrentUser();
    const isCurrentSuperAdmin = currentUser?.username?.toLowerCase() === 'iman';
    const classes = store.getClasses();

    const content = `
      <form id="form-create-account" style="padding: 10px 0;">
        <div class="form-group">
          <label class="form-label">Peran Akun (Role)</label>
          <select id="acc-role" class="form-select" required>
            <option value="santri">Murid</option>
            <option value="guru">Guru</option>
            ${isCurrentSuperAdmin ? `<option value="developer">Admin Biasa</option>` : ''}
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

        <!-- Murid Specific: Sistem Kelas (Dropdown dari kelas yang tersedia) -->
        <div id="santri-only-fields">
          <div class="form-group">
            <label class="form-label">Pilih Kelas Murid (Opsional)</label>
            <select id="acc-kelas-nama" class="form-select">
              <option value="">-- Tanpa Kelas (Atur Nanti di Kelola Kelas) --</option>
              ${classes.map(c => `<option value="${c.nama_kelas}">Kelas ${c.nama_kelas}</option>`).join('')}
            </select>
            <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block;">
              Bisa dipilih sekarang atau diatur nanti melalui menu Kelola Kelas.
            </span>
          </div>
        </div>

        <!-- Guru Specific: Kelas yang Diampu (Dropdown) -->
        <div id="guru-only-fields" style="display: none;">
          <div class="form-group">
            <label class="form-label">Kelas yang Diampu (Opsional)</label>
            <select id="acc-guru-class-id" class="form-select">
              <option value="">-- Tanpa Kelas (Atur Nanti di Kelola Kelas) --</option>
              ${classes.map(c => `
                <option value="${c.id}">Kelas ${c.nama_kelas}</option>
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
    const kelasSelect = document.getElementById('acc-kelas-nama');

    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (santriFields) santriFields.style.display = val === 'santri' ? 'block' : 'none';
        if (guruFields) guruFields.style.display = val === 'guru' ? 'block' : 'none';
        if (kelasSelect) kelasSelect.required = false;
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
          const roleLabel = role === 'guru' ? 'Guru' : (role === 'developer' ? 'Admin' : 'Murid');
          app.showToast(`Akun ${roleLabel} "${nama}" berhasil dibuat!`, 'success');
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

    const currentUser = auth.getCurrentUser();
    const isTargetSuper = user.username?.toLowerCase() === 'iman';
    const isCurrentSuper = currentUser?.username?.toLowerCase() === 'iman';

    if (isTargetSuper && !isCurrentSuper) {
      app.showToast('Akun Super Admin dilindungi dan tidak dapat diubah oleh Admin biasa.', 'error');
      return;
    }

    const classes = store.getClasses();
    const roleText = isTargetSuper ? 'SUPER ADMIN' : (user.role === 'developer' ? 'ADMIN' : (user.role === 'guru' ? 'GURU' : 'MURID'));

    const content = `
      <form id="form-edit-user" style="padding: 10px 0;">
        <div style="font-size: 12px; color: var(--color-primary); font-weight: 700; margin-bottom: 12px;">
          Peran: ${roleText}
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
            <label class="form-label">Pilih Kelas Murid (Opsional)</label>
            <select id="edit-kelas-nama" class="form-select">
              <option value="">-- Tanpa Kelas (Belum Ditentukan) --</option>
              ${classes.map(c => `
                <option value="${c.nama_kelas}" ${user.kelas_nama === c.nama_kelas ? 'selected' : ''}>
                  Kelas ${c.nama_kelas}
                </option>
              `).join('')}
            </select>
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
          app.showToast(`Data akun "${nama}" berhasil diperbarui!`, 'success');
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
  // TAB 2: KELOLA KELAS (TAMBAH & HAPUS KELAS)
  // ==========================================
  renderClasses() {
    const allClasses = store.getClasses();
    const teachers = store.getUsersByRole('guru');

    return `
      <div class="animate-fade" style="padding: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Kelola Kelas</h2>
            <p style="font-size: 12px; color: var(--text-muted);">${allClasses.length} Kelas Terdaftar di MI Al-Hidayah 1</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-admin-add-class">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Tambah Kelas</span>
          </button>
        </div>

        <div class="class-list-container" style="display: flex; flex-direction: column; gap: 10px;">
          ${allClasses.length > 0 ? allClasses.map(cls => {
            const guru = store.getUserById(cls.guru_id);
            const students = store.getStudentsInClass(cls.id);

            return `
              <div class="card admin-class-card" data-class-id="${cls.id}" style="padding: 14px; border-left: 4px solid var(--color-primary); cursor: pointer; transition: all 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <h3 style="font-size: 16px; font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">
                      Kelas ${cls.nama_kelas}
                    </h3>
                    <div style="font-size: 12px; color: var(--text-muted);">
                      Dibuat: ${cls.dibuat_pada || '-'}
                    </div>
                  </div>
                  <button class="btn btn-secondary btn-icon btn-sm btn-admin-delete-class" data-class-id="${cls.id}" data-class-name="${cls.nama_kelas}" title="Hapus Kelas" onclick="event.stopPropagation();">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; border-top: 1px solid var(--border-light); padding-top: 8px; margin-top: 4px;">
                  <div>
                    <span style="color: var(--text-muted);">Guru Pengampu:</span>
                    <strong style="color: var(--color-primary);">${guru ? guru.nama : 'Belum Ditugaskan'}</strong>
                  </div>
                  <span class="badge badge-primary">${students.length} Murid</span>
                </div>

                <div class="btn btn-secondary btn-sm" style="width: 100%; justify-content: space-between; margin-top: 10px; font-weight: 700; pointer-events: none;">
                  <span style="color: var(--color-primary); display: flex; align-items: center; gap: 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Kelola Guru & Murid Kelas
                  </span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="card" style="text-align: center; padding: 40px 20px;">
              <div style="font-size: 36px; margin-bottom: 10px;">🏫</div>
              <p style="font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">Belum Ada Kelas</p>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
                Klik tombol "Tambah Kelas" untuk menambahkan kelas baru agar dapat dipilih saat pendaftaran akun murid & guru.
              </p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  initClassesEvents() {
    // Add Class
    const addClassBtn = document.getElementById('btn-admin-add-class');
    if (addClassBtn) {
      addClassBtn.addEventListener('click', () => {
        this.showAddClassModal();
      });
    }

    // Manage Class (Entire Card Click)
    document.querySelectorAll('.admin-class-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-admin-delete-class')) return;
        const cid = card.dataset.classId;
        if (cid) this.showManageClassSheet(cid);
      });
    });

    // Delete Class
    document.querySelectorAll('.btn-admin-delete-class').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cid = btn.dataset.classId;
        const cname = btn.dataset.className;

        if (confirm(`Yakin ingin menghapus Kelas "${cname}"? Kelas ini tidak akan dapat dipilih lagi dan murid yang terdaftar akan dilepaskan.`)) {
          btn.disabled = true;
          await store.deleteClass(cid);
          app.showToast(`Kelas "${cname}" berhasil dihapus`, 'info');
          app.render();
        }
      });
    });
  },

  showManageClassSheet(classId) {
    const cls = store.getClassById(classId);
    if (!cls) return;

    const teachers = store.getUsersByRole('guru');
    const students = store.getStudentsInClass(classId);
    const assignedGuru = cls.guru_id ? store.getUserById(cls.guru_id) : null;

    const content = `
      <div style="padding: 6px 0;">
        <!-- Class Meta Banner -->
        <div style="background: var(--color-primary-soft); padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 16px; border: 1px solid rgba(46, 134, 222, 0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h3 style="font-size: 17px; font-weight: 800; color: var(--text-dark);">Kelas ${cls.nama_kelas}</h3>
            <span class="badge badge-primary">${students.length} Murid Terdaftar</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted);">
            Dibuat: ${cls.dibuat_pada || '-'} • Pengampu: <strong>${assignedGuru ? assignedGuru.nama : 'Belum Ditugaskan'}</strong>
          </div>
        </div>

        <!-- 1. SETTING GURU PENGAMPU -->
        <div class="card" style="padding: 12px 14px; margin-bottom: 16px; background: #FFFFFF; border: 1.5px solid var(--border-color);">
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">
            👨‍🏫 Setting Guru Pengampu
          </label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <select id="manage-class-guru-select" class="form-select" style="flex: 1;">
              <option value="">-- Belum Ditugaskan (Kosongkan) --</option>
              ${teachers.map(g => `
                <option value="${g.id}" ${cls.guru_id === g.id ? 'selected' : ''}>
                  ${g.nama} (@${g.username})
                </option>
              `).join('')}
            </select>
            <button type="button" class="btn btn-primary btn-sm" id="btn-save-manage-guru" style="white-space: nowrap;">
              Simpan Guru
            </button>
          </div>
        </div>

        <!-- 2. SETTING MURID KELAS -->
        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-size: 14px; font-weight: 800; color: var(--text-dark); margin: 0;">Setting Murid Kelas</h4>
            <span style="font-size: 11.5px; color: var(--text-muted);">Bisa hapus satu atau banyak sekaligus</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btn-trigger-add-students-to-class">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ Masukkan Murid</span>
          </button>
        </div>

        <!-- Bulk Action Bar -->
        ${students.length > 0 ? `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #F1F5F9; border-radius: var(--radius-sm); margin-bottom: 8px; font-size: 12px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600; color: var(--text-dark);">
              <input type="checkbox" id="chk-manage-select-all" style="width: 16px; height: 16px; accent-color: var(--color-primary);">
              <span>Pilih Semua (${students.length})</span>
            </label>
            <button type="button" class="btn btn-danger btn-sm" id="btn-manage-bulk-remove" disabled style="font-size: 11px; padding: 4px 10px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span id="bulk-remove-btn-text">Hapus Murid Terpilih (0)</span>
            </button>
          </div>
        ` : ''}

        <!-- Student List Container -->
        <div id="manage-students-list-box" style="display: flex; flex-direction: column; gap: 6px; max-height: 230px; overflow-y: auto; margin-bottom: 14px;">
          ${students.length > 0 ? students.map(st => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: #FFFFFF;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" class="chk-manage-student-item" value="${st.id}" data-student-name="${st.nama}" style="width: 16px; height: 16px; accent-color: var(--color-danger);">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: var(--text-dark);">${st.nama}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">@${st.username}</div>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-icon btn-sm btn-manage-remove-single" data-student-id="${st.id}" data-student-name="${st.nama}" title="Hapus Murid dari Kelas Ini">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          `).join('') : `
            <div class="card" style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 12.5px;">
              Belum ada murid di kelas ini.<br>
              Klik tombol "+ Masukkan Murid" di atas untuk memasukkan murid ke Kelas ${cls.nama_kelas}.
            </div>
          `}
        </div>
      </div>
    `;

    app.showBottomSheet(`Kelola Kelas ${cls.nama_kelas}`, content);

    // 1. Save Guru Pengampu
    document.getElementById('btn-save-manage-guru')?.addEventListener('click', async () => {
      const guruId = document.getElementById('manage-class-guru-select')?.value || null;
      if (guruId) {
        await store.assignClassToGuru(classId, guruId);
      } else {
        await store.unassignClassFromGuru(classId);
      }
      app.showToast(`Guru pengampu Kelas ${cls.nama_kelas} berhasil diperbarui!`, 'success');
      this.showManageClassSheet(classId);
    });

    // 2. Trigger Add Students
    document.getElementById('btn-trigger-add-students-to-class')?.addEventListener('click', () => {
      this.showAddStudentsToClassModal(classId);
    });

    // 3. Selection & Bulk Remove
    const selectAllChk = document.getElementById('chk-manage-select-all');
    const bulkRemoveBtn = document.getElementById('btn-manage-bulk-remove');
    const bulkRemoveText = document.getElementById('bulk-remove-btn-text');

    const updateBulkRemoveBtn = () => {
      const checkedBoxes = document.querySelectorAll('.chk-manage-student-item:checked');
      const count = checkedBoxes.length;
      if (bulkRemoveBtn && bulkRemoveText) {
        bulkRemoveBtn.disabled = count === 0;
        bulkRemoveText.textContent = `Hapus Murid Terpilih (${count})`;
      }
      if (selectAllChk) {
        const total = document.querySelectorAll('.chk-manage-student-item').length;
        selectAllChk.checked = total > 0 && count === total;
      }
    };

    if (selectAllChk) {
      selectAllChk.addEventListener('change', (e) => {
        document.querySelectorAll('.chk-manage-student-item').forEach(cb => {
          cb.checked = e.target.checked;
        });
        updateBulkRemoveBtn();
      });
    }

    document.querySelectorAll('.chk-manage-student-item').forEach(cb => {
      cb.addEventListener('change', updateBulkRemoveBtn);
    });

    // Single Remove
    document.querySelectorAll('.btn-manage-remove-single').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sid = btn.dataset.studentId;
        const sname = btn.dataset.studentName;
        if (confirm(`Keluarkan "${sname}" dari Kelas ${cls.nama_kelas}? Akun murid dan riwayat hafalannya tetap aman di sistem.`)) {
          await store.removeStudentFromClass(sid, classId);
          app.showToast(`${sname} telah dikeluarkan dari Kelas ${cls.nama_kelas}`, 'info');
          this.showManageClassSheet(classId);
        }
      });
    });

    // Bulk Remove
    if (bulkRemoveBtn) {
      bulkRemoveBtn.addEventListener('click', async () => {
        const checkedBoxes = Array.from(document.querySelectorAll('.chk-manage-student-item:checked'));
        if (checkedBoxes.length === 0) return;

        if (confirm(`Yakin ingin mengeluarkan ${checkedBoxes.length} murid terpilih dari Kelas ${cls.nama_kelas}? Akun murid dan data hafalannya tetap aman tersimpan.`)) {
          bulkRemoveBtn.disabled = true;
          for (const cb of checkedBoxes) {
            await store.removeStudentFromClass(cb.value, classId);
          }
          app.showToast(`🎉 Berhasil mengeluarkan ${checkedBoxes.length} murid dari Kelas ${cls.nama_kelas}`, 'info');
          this.showManageClassSheet(classId);
        }
      });
    }
  },

  showAddStudentsToClassModal(classId) {
    const cls = store.getClassById(classId);
    if (!cls) return;

    const allMurid = store.getUsersByRole('santri').filter(s => s.status_aktif);
    const existingInClass = store.getStudentsInClass(classId).map(s => s.id);
    const availableMurid = allMurid.filter(s => !existingInClass.includes(s.id));

    const content = `
      <div style="padding: 6px 0;">
        <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
          Pilih murid yang ingin dimasukkan ke <strong>Kelas ${cls.nama_kelas}</strong>. Anda bisa memasukkan satu per satu atau centang banyak murid sekaligus:
        </p>

        ${availableMurid.length > 0 ? `
          <!-- Toolbar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #F1F5F9; border-radius: var(--radius-sm); margin-bottom: 8px; font-size: 12px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600; color: var(--text-dark);">
              <input type="checkbox" id="chk-add-all-available" style="width: 16px; height: 16px; accent-color: var(--color-primary);">
              <span>Pilih Semua (${availableMurid.length})</span>
            </label>
            <button type="button" class="btn btn-primary btn-sm" id="btn-bulk-insert-students" disabled style="font-size: 11px; padding: 4px 10px;">
              <span id="bulk-insert-count-text">+ Masukkan Terpilih (0)</span>
            </button>
          </div>

          <!-- List of available students -->
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 250px; overflow-y: auto; margin-bottom: 14px;">
            ${availableMurid.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: #FFFFFF;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" class="chk-available-student-item" value="${s.id}" data-student-name="${s.nama}" style="width: 16px; height: 16px; accent-color: var(--color-primary);">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--text-dark);">${s.nama}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">@${s.username} • Status: ${s.kelas_nama ? `Kelas ${s.kelas_nama}` : 'Belum Ada Kelas'}</div>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm btn-insert-single-student" data-student-id="${s.id}" style="font-size: 11px; padding: 4px 8px;">
                  + Masukkan
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="card" style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; margin-bottom: 14px;">
            Semua murid aktif yang terdaftar sudah berada di Kelas ${cls.nama_kelas}.
          </div>
        `}

        <button type="button" class="btn btn-secondary btn-sm" id="btn-back-to-manage-class" style="width: 100%;">
          Kembali ke Pengaturan Kelas ${cls.nama_kelas}
        </button>
      </div>
    `;

    app.showBottomSheet(`Masukkan Murid ke Kelas ${cls.nama_kelas}`, content);

    // Back to manage class sheet
    document.getElementById('btn-back-to-manage-class')?.addEventListener('click', () => {
      this.showManageClassSheet(classId);
    });

    // Single Insert
    document.querySelectorAll('.btn-insert-single-student').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sid = btn.dataset.studentId;
        await store.addStudentToClass(sid, classId);
        await store.updateUser({ id: sid, kelas_nama: cls.nama_kelas });
        app.showToast(`Murid berhasil dimasukkan ke Kelas ${cls.nama_kelas}!`, 'success');
        this.showManageClassSheet(classId);
      });
    });

    // Bulk Insert Logic
    const selectAllAvailable = document.getElementById('chk-add-all-available');
    const bulkInsertBtn = document.getElementById('btn-bulk-insert-students');
    const bulkInsertText = document.getElementById('bulk-insert-count-text');

    const updateBulkInsertBtn = () => {
      const checkedBoxes = document.querySelectorAll('.chk-available-student-item:checked');
      const count = checkedBoxes.length;
      if (bulkInsertBtn && bulkInsertText) {
        bulkInsertBtn.disabled = count === 0;
        bulkInsertText.textContent = `+ Masukkan Terpilih (${count})`;
      }
      if (selectAllAvailable) {
        const total = document.querySelectorAll('.chk-available-student-item').length;
        selectAllAvailable.checked = total > 0 && count === total;
      }
    };

    if (selectAllAvailable) {
      selectAllAvailable.addEventListener('change', (e) => {
        document.querySelectorAll('.chk-available-student-item').forEach(cb => {
          cb.checked = e.target.checked;
        });
        updateBulkInsertBtn();
      });
    }

    document.querySelectorAll('.chk-available-student-item').forEach(cb => {
      cb.addEventListener('change', updateBulkInsertBtn);
    });

    if (bulkInsertBtn) {
      bulkInsertBtn.addEventListener('click', async () => {
        const checkedBoxes = Array.from(document.querySelectorAll('.chk-available-student-item:checked'));
        if (checkedBoxes.length === 0) return;

        bulkInsertBtn.disabled = true;
        bulkInsertBtn.textContent = '⏳ Menyimpan...';

        for (const cb of checkedBoxes) {
          await store.addStudentToClass(cb.value, classId);
          await store.updateUser({ id: cb.value, kelas_nama: cls.nama_kelas });
        }

        app.showToast(`🎉 Berhasil memasukkan ${checkedBoxes.length} murid ke Kelas ${cls.nama_kelas}!`, 'success');
        this.showManageClassSheet(classId);
      });
    }
  },

  showAddClassModal() {
    const teachers = store.getUsersByRole('guru');

    const content = `
      <form id="form-admin-create-class" style="padding: 10px 0;">
        <div class="form-group">
          <label class="form-label">Nama Kelas Baru (Contoh: 1A, 2B, 3A)</label>
          <input type="text" id="admin-new-class-name" class="form-input" placeholder="Contoh: 1A" required>
        </div>

        <div class="form-group">
          <label class="form-label">Tugaskan Guru Pengampu (Opsional)</label>
          <select id="admin-new-class-guru" class="form-select">
            <option value="">-- Pilih Guru Pengampu --</option>
            ${teachers.map(g => `<option value="${g.id}">${g.nama} (@${g.username})</option>`).join('')}
          </select>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 12px;">
          Simpan Kelas Baru
        </button>
      </form>
    `;

    app.showBottomSheet('Tambah Kelas Baru', content);

    const form = document.getElementById('form-admin-create-class');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const nama = document.getElementById('admin-new-class-name').value.trim();
        const guruId = document.getElementById('admin-new-class-guru').value || null;
        const targetJuz = 30;

        if (nama) {
          await store.addClass({
            nama_kelas: nama,
            guru_id: guruId,
            target_juz: targetJuz
          });
          app.closeBottomSheet();
          app.showToast(`Kelas "${nama}" berhasil dibuat & dapat dipilih di pembuatan akun!`, 'success');
          app.render();
        }
      });
    }
  },

  // ==========================================
  // TAB 3: OVERVIEW & MONITORING
  // ==========================================
  renderOverview() {
    const admin = auth.getCurrentUser();
    const isSuperAdmin = admin?.username?.toLowerCase() === 'iman';
    const totalMurid = store.getUsersByRole('santri').length;
    const totalGuru = store.getUsersByRole('guru').length;
    const allClasses = store.getClasses();
    const totalSetoran = store.data.riwayat_setoran.length;

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Header -->
        <div class="hero-greeting-card">
          <span class="greeting-role-badge">${isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}</span>
          <h2 class="greeting-name">MI Al-Hidayah 1</h2>
          <p class="greeting-desc">Monitoring menyeluruh seluruh kelas, guru, dan murid.</p>
        </div>

        <!-- Metrics Grid -->
        <div class="quick-stats-grid">
          <div class="stat-box">
            <div class="stat-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <div class="stat-num">${totalMurid}</div>
              <div class="stat-label">Total Murid</div>
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

        <!-- Monitoring Seluruh Kelas -->
        <div class="card" style="margin-top: 6px;">
          <div class="card-header">
            <span class="card-title">Daftar Kelas & Guru</span>
            <span class="badge badge-primary">${allClasses.length} Kelas</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${allClasses.map(cls => {
              const guru = store.getUserById(cls.guru_id);
              const students = store.getStudentsInClass(cls.id);
              return `
                <div style="padding: 12px; background-color: var(--bg-page); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 14px; color: var(--text-dark);">Kelas ${cls.nama_kelas}</strong>
                    <span class="badge badge-primary">${students.length} Murid</span>
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    Pengampu: <strong>${guru ? guru.nama : 'Belum Ada'}</strong> • Murid: <strong>${students.length} Orang</strong>
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
  // TAB 4: PROFIL ADMIN
  // ==========================================
  renderProfile() {
    const admin = auth.getCurrentUser();
    const isSuperAdmin = admin?.username?.toLowerCase() === 'iman';

    return `
      <div class="animate-fade" style="padding: 16px;">
        <div class="card" style="margin-bottom: 16px; text-align: center; padding: 24px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--color-warning) 0%, #D97706 100%); color: #FFFFFF; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);">
            🛡️
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${admin.nama}</h2>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">@${admin.username}</div>
          <span class="badge ${isSuperAdmin ? 'badge-warning' : 'badge-primary'}">Hak Akses: ${isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
        </div>

        ${isSuperAdmin ? `
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
        ` : ''}

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
              <li>Row Level Security (RLS) aktif untuk Developer, Guru, dan Murid</li>
            </ul>
            <button class="btn btn-primary btn-sm" id="btn-close-schema-sheet" style="width: 100%;">Tutup</button>
          </div>`
        );
        document.getElementById('btn-close-schema-sheet')?.addEventListener('click', () => app.closeBottomSheet());
      });
    }
  }
};
