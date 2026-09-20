/**
 * MI AL-HIDAYAH 1 - GURU VIEW
 * Class Management, Student Management (Tambah & Hapus Murid),
 * Multi-Surah Memorization Validation, Murotal Audio Feature,
 * and Daily/Weekly Hafalan Reports with PDF Export.
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { quranApi, RECITERS } from '../api.js';
import { audioManager } from '../audio.js';
import { app } from '../app.js';

export const guruView = {
  selectedClassId: null,
  selectedStudentId: null,
  reportType: 'all', // 'all' (Semua Setoran) | 'student' (Per Siswa)
  selectedReportStudentId: '', // ID siswa terpilih untuk laporan per siswa
  reportPeriod: 'today', // 'today' | 'week' | 'all'
  reportClassFilter: '',
  murotalFilter: 'juz30', // 'juz30' | 'all'
  murotalSearch: '',

  // ==========================================
  // TAB 1: KELAS & MURID
  // ==========================================
  renderClasses() {
    const guru = auth.getCurrentUser();
    const classes = store.getClasses(guru.id);

    // If a class is selected, show students inside it
    if (this.selectedClassId) {
      return this.renderClassDetail(this.selectedClassId);
    }

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Teacher Header -->
        <div class="hero-greeting-card">
          <span class="greeting-role-badge">GURU</span>
          <h2 class="greeting-name">${guru.nama}</h2>
          <p class="greeting-desc">Kelola kelas & validasi hafalan murid binaan Anda di MI Al-Hidayah 1.</p>
        </div>

        <!-- Class Management Section -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Daftar Kelas Diampu</h3>
            <span style="font-size: 12px; color: var(--text-muted);">${classes.length} Kelas Aktif</span>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-select-class-to-manage" style="display: flex; align-items: center; gap: 6px; padding: 7px 14px; font-weight: 700; border-radius: var(--radius-full);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Pilih Kelas Diampu</span>
          </button>
        </div>

        <!-- Classes List Cards -->
        <div class="class-list-container">
          ${classes.length > 0 ? classes.map(cls => {
            const students = store.getStudentsInClass(cls.id);
            // Calculate average progress of class based on student actual achievement
            let avgProgress = 0;
            if (students.length > 0) {
              const totalPct = students.reduce((sum, s) => {
                const prog = store.calculateStudentProgress(s.id);
                return sum + Math.max(prog.overallPercentage, prog.juz30Percentage);
              }, 0);
              avgProgress = (totalPct / students.length).toFixed(1);
            }

            return `
              <div class="class-card btn-open-class" data-class-id="${cls.id}" onclick="window.guruView ? window.guruView.openClass('${cls.id}') : null" style="cursor: pointer; position: relative; user-select: none;">
                <div class="class-card-top" style="pointer-events: none;">
                  <div>
                    <h4 class="class-name" style="font-size: 16px; font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">Kelas ${cls.nama_kelas}</h4>
                    <div class="class-meta" style="font-size: 12px; color: var(--text-muted);">Dibuat: ${cls.dibuat_pada || '-'}</div>
                  </div>
                  <button class="btn btn-secondary btn-icon btn-sm btn-unassign-class" data-class-id="${cls.id}" data-class-name="${cls.nama_kelas}" title="Lepas Pengampuan Kelas" style="position: relative; z-index: 10; pointer-events: auto;" onclick="event.stopPropagation();">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                  </button>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 13px; pointer-events: none;">
                  <span>Murid Terdaftar: <strong>${students.length} Murid</strong></span>
                  <span style="font-weight: 700; color: var(--color-primary);">Rata-rata: ${avgProgress}%</span>
                </div>

                <div class="progress-bar-track" style="margin-bottom: 14px; pointer-events: none;">
                  <div class="progress-bar-fill" style="width: ${avgProgress}%"></div>
                </div>

                <div class="class-open-indicator" style="display: flex; align-items: center; justify-content: space-between; background: var(--color-primary-soft); color: var(--color-primary); padding: 10px 14px; border-radius: var(--radius-md); font-weight: 700; font-size: 13px; border: 1.5px solid rgba(46, 134, 222, 0.2); transition: all 0.2s ease; pointer-events: none;">
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Buka Kelas & Daftar Murid
                  </span>
                  <span style="display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700;">
                    Buka
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="card" style="text-align: center; padding: 40px 20px;">
              <div style="font-size: 36px; margin-bottom: 10px;">🏫</div>
              <p style="font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">Belum Ada Kelas Diampu</p>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Klik tombol "+ Pilih Kelas Diampu" di atas untuk memilih kelas yang telah disediakan oleh Superadmin.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  renderClassDetail(classId) {
    const cls = store.getClassById(classId);
    if (!cls) {
      this.selectedClassId = null;
      return this.renderClasses();
    }

    const students = store.getStudentsInClass(classId);

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Top Back Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <button class="btn btn-secondary btn-sm" id="btn-back-to-classes">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
            <span>Semua Kelas</span>
          </button>
          <button class="btn btn-primary btn-sm" id="btn-add-student-to-class">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Tambah Murid</span>
          </button>
        </div>

        <!-- Class Header Info -->
        <div class="card" style="margin-bottom: 16px; background-color: var(--color-primary-soft); border-color: rgba(46, 134, 222, 0.25);">
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Kelas ${cls.nama_kelas}</h2>
          <p style="font-size: 12px; color: var(--text-muted);">${students.length} Murid Terdaftar di Kelas Ini</p>
        </div>

        <!-- Students List -->
        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Daftar Murid</span>
          <span style="font-size: 12px; color: var(--text-muted);">Centang hafalan untuk validasi</span>
        </div>

        <div class="students-list">
          ${students.length > 0 ? students.map(st => {
            const prog = store.calculateStudentProgress(st.id);
            const studentProgressPct = Math.max(prog.overallPercentage, prog.juz30Percentage);
            return `
              <div class="student-list-item">
                <div class="student-avatar">${st.nama.charAt(0)}</div>
                <div class="student-info">
                  <div class="student-name">${st.nama}</div>
                  <div class="student-sub">
                    <strong>${prog.totalAyatHafal} / 6.236 Ayat Hafal</strong> • ${prog.overallPercentage}% (30 Juz)${prog.juz30Percentage > 0 ? ` • ${prog.juz30Percentage}% (Juz 30)` : ''}
                  </div>
                  <div class="progress-bar-track" style="height: 6px; margin-top: 6px;">
                    <div class="progress-bar-fill" style="width: ${studentProgressPct}%"></div>
                  </div>
                </div>

                <div style="display: flex; gap: 6px; margin-left: 10px;">
                  <button class="btn btn-primary btn-sm btn-validate-student" data-student-id="${st.id}" data-student-name="${st.nama}" title="Validasi Hafalan (Bisa Banyak Surat Sekaligus)">
                    <span>Centang</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button class="btn btn-secondary btn-icon btn-sm btn-remove-student-from-class" data-student-id="${st.id}" data-student-name="${st.nama}" title="Keluarkan Murid dari Kelas">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="card" style="text-align: center; padding: 30px; color: var(--text-muted);">
              Belum ada murid terdaftar di kelas ini.<br>
              Klik tombol "Tambah Murid" di atas untuk mendaftarkan atau memasukkan murid ke kelas ini.
            </div>
          `}
        </div>
      </div>
    `;
  },

  openClass(classId, pushHistory = true) {
    if (pushHistory && window.history) {
      window.history.pushState({ route: 'classes', classId: classId }, '', window.location.href);
    }
    this.selectedClassId = classId;
    app.render();
  },

  initClassesEvents() {
    // Open Class Detail (Clicking anywhere on the large class card box)
    document.querySelectorAll('.class-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-unassign-class')) {
          return;
        }
        const cid = card.dataset.classId;
        if (cid) {
          this.openClass(cid);
        }
      });
    });

    // Back to classes
    const backBtn = document.getElementById('btn-back-to-classes');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (window.history && window.history.state?.classId) {
          window.history.back();
        } else {
          this.selectedClassId = null;
          app.render();
        }
      });
    }

    // Select Class Modal Trigger (Guru hanya memilih kelas yang dibuat superadmin)
    const selectClassBtn = document.getElementById('btn-select-class-to-manage');
    if (selectClassBtn) {
      selectClassBtn.addEventListener('click', () => {
        this.showSelectClassModal();
      });
    }

    // Unassign Class from Guru
    document.querySelectorAll('.btn-unassign-class').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cid = btn.dataset.classId;
        const cls = store.getClassById(cid);
        if (cls && confirm(`Lepas pengampuan Kelas "${cls.nama_kelas}"? Kelas ini tetap tersimpan di database dan dibuat oleh Superadmin, hanya dilepas dari akun Anda.`)) {
          await store.unassignClassFromGuru(cid);
          app.showToast(`Pengampuan Kelas ${cls.nama_kelas} berhasil dilepas`, 'info');
          app.render();
        }
      });
    });

    // Add Student to Class
    const addStudentBtn = document.getElementById('btn-add-student-to-class');
    if (addStudentBtn) {
      addStudentBtn.addEventListener('click', () => {
        this.showAddStudentModal(this.selectedClassId);
      });
    }

    // Remove student from class (Tanpa hapus akun permanen)
    document.querySelectorAll('.btn-remove-student-from-class').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.studentId;
        const sname = btn.dataset.studentName;
        this.showRemoveStudentModal(sid, sname, this.selectedClassId);
      });
    });

    // Validate Student Trigger (Dual mode: Per Surat & Per Ayat)
    document.querySelectorAll('.btn-validate-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.studentId;
        this.showValidationModal(sid);
      });
    });
  },

  // ==========================================
  // TAMBAH & HAPUS MURID OLEH GURU
  // ==========================================
  showAddStudentModal(classId) {
    const cls = store.getClassById(classId);
    if (!cls) return;

    const allMurid = store.getUsersByRole('santri').filter(s => s.status_aktif);
    const existingInClass = store.getStudentsInClass(classId).map(s => s.id);
    const availableMurid = allMurid.filter(s => !existingInClass.includes(s.id));

    const content = `
      <div style="padding: 10px 0;">
        <!-- Tabs Option -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 8px;">
          <button type="button" class="filter-pill active" id="tab-btn-create-murid">
            + Daftarkan Murid Baru
          </button>
          <button type="button" class="filter-pill" id="tab-btn-select-existing">
            Pilih Murid Terdaftar (${availableMurid.length})
          </button>
        </div>

        <!-- Section 1: Daftarkan Murid Baru -->
        <div id="section-create-murid">
          <form id="form-guru-create-murid">
            <div class="form-group">
              <label class="form-label">Nama Lengkap Murid</label>
              <input type="text" id="guru-new-murid-nama" class="form-input" placeholder="Contoh: Muhammad Raihan" required>
            </div>

            <div class="form-group">
              <label class="form-label">Username (Untuk Login Murid)</label>
              <input type="text" id="guru-new-murid-username" class="form-input" placeholder="Contoh: raihan" required>
            </div>

            <div class="form-group">
              <label class="form-label">Kata Sandi</label>
              <input type="text" id="guru-new-murid-password" class="form-input" value="123" required>
            </div>

            <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 14px; background: var(--bg-page); padding: 8px 10px; border-radius: var(--radius-sm);">
              Murid ini akan otomatis didaftarkan dan langsung masuk ke <strong>Kelas ${cls.nama_kelas}</strong>.
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
              Daftarkan Murid ke Kelas ${cls.nama_kelas}
            </button>
          </form>
        </div>

        <!-- Section 2: Pilih Murid yang Sudah Terdaftar -->
        <div id="section-select-murid" style="display: none;">
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Pilih murid dari sistem untuk dimasukkan ke <strong>Kelas ${cls.nama_kelas}</strong>:
          </p>

          ${availableMurid.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; margin-bottom: 14px;">
              ${availableMurid.map(s => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #FFFFFF;">
                  <div>
                    <div style="font-size: 14px; font-weight: 700; color: var(--text-dark);">${s.nama}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">@${s.username} • Kelas Sebelumnya: ${s.kelas_nama || '-'}</div>
                  </div>
                  <button class="btn btn-primary btn-sm btn-select-student-add" data-student-id="${s.id}">
                    Tambahkan
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="card" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px; margin-bottom: 14px;">
              Semua murid yang ada di sistem sudah terdaftar di kelas ini.<br>
              Gunakan tab "Daftarkan Murid Baru" di atas jika ada murid baru yang belum memiliki akun.
            </div>
          `}
        </div>
      </div>
    `;

    app.showBottomSheet(`Tambah Murid - Kelas ${cls.nama_kelas}`, content);

    // Tab toggle logic
    const tabCreate = document.getElementById('tab-btn-create-murid');
    const tabSelect = document.getElementById('tab-btn-select-existing');
    const secCreate = document.getElementById('section-create-murid');
    const secSelect = document.getElementById('section-select-murid');

    if (tabCreate && tabSelect) {
      tabCreate.addEventListener('click', () => {
        tabCreate.classList.add('active');
        tabSelect.classList.remove('active');
        secCreate.style.display = 'block';
        secSelect.style.display = 'none';
      });

      tabSelect.addEventListener('click', () => {
        tabSelect.classList.add('active');
        tabCreate.classList.remove('active');
        secSelect.style.display = 'block';
        secCreate.style.display = 'none';
      });
    }

    // Form submit for creating new student
    const createForm = document.getElementById('form-guru-create-murid');
    if (createForm) {
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = createForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳ Menyimpan ke Database...</span>';
        }

        const nama = document.getElementById('guru-new-murid-nama').value.trim();
        const username = document.getElementById('guru-new-murid-username').value.trim();
        const password = document.getElementById('guru-new-murid-password').value.trim();

        try {
          await store.createUser({
            nama,
            username,
            password,
            role: 'santri',
            kelas_nama: cls.nama_kelas,
            kelas_id: cls.id
          });
          app.closeBottomSheet();
          app.showToast(`Murid "${nama}" berhasil didaftarkan & masuk Kelas ${cls.nama_kelas}!`, 'success');
          app.render();
        } catch (err) {
          alert(err.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Daftarkan Murid ke Kelas ${cls.nama_kelas}`;
          }
        }
      });
    }

    // Attach existing student
    document.querySelectorAll('.btn-select-student-add').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ Menyimpan...</span>';
        const sid = btn.dataset.studentId;
        await store.addStudentToClass(sid, classId);
        app.closeBottomSheet();
        const st = store.getUserById(sid);
        app.showToast(`Murid "${st ? st.nama : 'Murid'}" berhasil dimasukkan ke Kelas ${cls.nama_kelas}!`, 'success');
        app.render();
      });
    });
  },

  showRemoveStudentModal(studentId, studentName, classId) {
    const cls = store.getClassById(classId);
    const className = cls ? cls.nama_kelas : '';

    const content = `
      <div style="padding: 10px 0;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 36px; margin-bottom: 8px;">👤</div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-dark); margin-bottom: 4px;">
            Kelola Murid: ${studentName}
          </h3>
          <p style="font-size: 12.5px; color: var(--text-muted);">
            Pilih opsi tindakan untuk murid ini di <strong>Kelas ${className}</strong>:
          </p>
        </div>

        <!-- Option 1: Keluarkan dari Kelas -->
        <div style="border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; background: var(--bg-surface);">
          <div style="font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
            1. Keluarkan dari Kelas ${className}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
            Murid hanya dilepas dari kelas ini. Akun login dan riwayat hafalan tetap aman tersimpan. Murid dapat dipindah atau dimasukkan ke kelas lain kapan saja.
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-confirm-remove-from-class" style="width: 100%; margin-top: 10px; font-weight: 700; color: #D97706; border-color: #FCD34D; background: #FEF3C7;">
            Keluarkan dari Kelas Ini
          </button>
        </div>

        <!-- Option 2: Hapus Akun Murid Permanen -->
        <div style="border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px; background: rgba(239, 68, 68, 0.04);">
          <div style="font-size: 14px; font-weight: 700; color: var(--color-danger); margin-bottom: 3px;">
            2. Hapus Akun Murid Permanen
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
            Menghapus akun murid dan seluruh data hafalannya secara permanen dari sistem & database sekolah. Gunakan jika murid pindah sekolah atau akun salah dibuat.
          </div>
          <button type="button" class="btn btn-danger btn-sm" id="btn-confirm-delete-student-permanently" style="width: 100%; margin-top: 10px; font-weight: 700;">
            Hapus Akun Murid Permanen
          </button>
        </div>

        <button type="button" class="btn btn-secondary btn-lg" id="btn-cancel-student-action" style="width: 100%;">
          Batal
        </button>
      </div>
    `;

    app.showBottomSheet(`Kelola Murid - ${studentName}`, content);

    document.getElementById('btn-cancel-student-action')?.addEventListener('click', () => {
      app.closeBottomSheet();
    });

    document.getElementById('btn-confirm-remove-from-class')?.addEventListener('click', async (e) => {
      e.target.disabled = true;
      e.target.innerText = 'Mengeluarkan...';
      await store.removeStudentFromClass(studentId, classId);
      app.closeBottomSheet();
      app.showToast(`"${studentName}" telah dikeluarkan dari Kelas ${className}`, 'info');
      app.render();
    });

    document.getElementById('btn-confirm-delete-student-permanently')?.addEventListener('click', async (e) => {
      if (confirm(`PERINGATAN: Yakin ingin menghapus akun murid "${studentName}" secara permanen? Seluruh riwayat hafalan akun ini akan dibersihkan dari database.`)) {
        e.target.disabled = true;
        e.target.innerText = 'Menghapus Akun...';
        await store.deleteUser(studentId);
        app.closeBottomSheet();
        app.showToast(`Akun murid "${studentName}" berhasil dihapus permanen!`, 'info');
        app.render();
      }
    });
  },

  // ==========================================
  // PILIH KELAS DIAMPU OLEH GURU (HANYA MEMILIH DARI SUPERADMIN)
  // ==========================================
  showSelectClassModal() {
    const user = auth.getCurrentUser();
    const allClasses = store.getClasses(); // Semua kelas yang dibuat superadmin
    const myClasses = store.getClasses(user.id).map(c => c.id);
    const availableClasses = allClasses.filter(c => !myClasses.includes(c.id));

    const content = `
      <div style="padding: 10px 0;">
        <div style="background: var(--color-primary-soft); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 12.5px; color: var(--text-primary); margin-bottom: 16px; line-height: 1.4;">
          ℹ️ <strong>Informasi:</strong> Pembuatan kelas baru hanya dapat dilakukan oleh Superadmin. Di sini Anda dapat memilih kelas yang telah disediakan untuk diampu.
        </div>

        ${availableClasses.length > 0 ? `
          <form id="form-guru-select-class">
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 700;">Pilih Kelas yang Ingin Diampu</label>
              <select id="guru-selected-class-id" class="form-select" required>
                <option value="">-- Pilih Kelas --</option>
                ${availableClasses.map(c => {
                  const guru = c.guru_id ? store.getUserById(c.guru_id) : null;
                  const guruNote = guru ? `(Saat ini diampu: ${guru.nama})` : '(Belum ada guru)';
                  return `<option value="${c.id}">Kelas ${c.nama_kelas} ${guruNote}</option>`;
                }).join('')}
              </select>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
              Jadikan Kelas Diampu Saya
            </button>
          </form>
        ` : `
          <div class="card" style="text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 13px;">
            <div style="font-size: 32px; margin-bottom: 8px;">🏫</div>
            <strong style="color: var(--text-dark); font-size: 14px;">Semua Kelas Sudah Anda Ampu</strong><br>
            Seluruh kelas yang telah dibuat oleh Superadmin saat ini sudah berada dalam daftar ampu Anda.<br>
            <span style="font-size: 11.5px; margin-top: 6px; display: inline-block;">
              Jika membutuhkan kelas baru, silakan ajukan kepada Superadmin.
            </span>
          </div>
        `}
      </div>
    `;

    app.showBottomSheet('Pilih Kelas Diampu', content);

    const form = document.getElementById('form-guru-select-class');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cid = document.getElementById('guru-selected-class-id').value;
        if (!cid) return;
        const cls = store.getClassById(cid);
        await store.assignClassToGuru(cid, user.id);
        app.closeBottomSheet();
        app.showToast(`Kelas ${cls ? cls.nama_kelas : ''} berhasil ditambahkan ke daftar ampu Anda!`, 'success');
        app.render();
      });
    }
  },

  // ==========================================
  // FITUR VALIDASI HAFALAN: DUAL MODE (PER SURAT & PER AYAT)
  // ==========================================
  async showValidationModal(studentId) {
    const student = store.getUserById(studentId);
    if (!student) return;

    let surahList = [];
    try {
      surahList = await quranApi.getAllSurah();
    } catch (e) {
      surahList = [];
    }

    // Default sorting for Juz 30: Surah 114 (An-Nas) down to Surah 78 (An-Naba')
    const juz30Surahs = surahList.filter(s => s.nomor >= 78 && s.nomor <= 114).sort((a, b) => b.nomor - a.nomor);
    const juz1To29Surahs = surahList.filter(s => s.nomor < 78).sort((a, b) => a.nomor - b.nomor);

    let activeTab = 'per-surat'; // 'per-surat' | 'per-ayat'
    let multiFilter = 'juz30';   // 'juz30' | 'juz1-29' | 'all'
    let hideCompleted = false;   // Default false so completed surahs are clearly visible with [✓ Lunas]!
    let selectedAyatSurahNum = 78; // Default An-Naba' for per-ayat

    // Render Tab 1 HTML (Multi-Surah Checklist)
    const renderMultiSurahHtml = () => {
      let list = multiFilter === 'juz30' ? juz30Surahs : (multiFilter === 'juz1-29' ? juz1To29Surahs : surahList);
      if (hideCompleted) {
        list = list.filter(s => !store.isSurahCompleted(studentId, s.nomor, s.jumlahAyat));
      }

      if (list.length === 0) {
        return `
          <div style="text-align: center; padding: 24px; color: var(--color-success-text); background: var(--color-success-bg); border-radius: var(--radius-md); font-size: 13px;">
            <div style="font-size: 28px; margin-bottom: 6px;">🎉</div>
            <strong>Seluruh surat pada filter ini sudah lunas dihafal oleh ${student.nama}!</strong>
            <div style="font-size: 11.5px; margin-top: 6px; color: var(--text-muted);">
              (Hapus centang "Sembunyikan surat yang sudah lunas" di atas jika ingin melihat daftar lengkapnya)
            </div>
          </div>
        `;
      }

      return list.map(s => {
        const memCount = store.getSurahMemorizedCount(studentId, s.nomor);
        const isDone = memCount >= s.jumlahAyat;

        return `
          <label class="multi-surah-item ${isDone ? 'lunas' : ''}" id="surah-item-${s.nomor}" data-surah-num="${s.nomor}" style="display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; margin-bottom: 6px; border: 1.5px solid ${isDone ? 'var(--color-success)' : 'var(--border-color)'}; border-radius: var(--radius-md); cursor: pointer; background: ${isDone ? 'rgba(46, 204, 113, 0.08)' : '#FFFFFF'}; transition: all 0.15s ease;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="checkbox" class="chk-multi-surah" value="${s.nomor}" data-surah-name="${s.namaLatin}" data-total-ayat="${s.jumlahAyat}" data-mem-count="${memCount}" style="width: 18px; height: 18px; accent-color: var(--color-primary); cursor: pointer;" ${isDone ? 'checked disabled' : ''}>
              <div>
                <div style="font-size: 13.5px; font-weight: 700; color: var(--text-dark);">
                  ${s.nomor}. Surat ${s.namaLatin}
                </div>
                <div style="font-size: 11.5px; color: var(--text-muted);">
                  ${s.jumlahAyat} Ayat • ${s.arti || s.tempatTurun}
                </div>
              </div>
            </div>

            <div class="surah-status-badge-container">
              ${isDone ? `
                <span class="badge badge-success" style="font-size: 10.5px;">✓ Lunas (${s.jumlahAyat}/${s.jumlahAyat})</span>
              ` : memCount > 0 ? `
                <span class="badge badge-primary" style="font-size: 10.5px;">${memCount}/${s.jumlahAyat} Hafal</span>
              ` : `
                <span class="badge" style="font-size: 10.5px; background: #F1F5F9; color: #64748B;">0/${s.jumlahAyat} Ayat (Belum)</span>
              `}
            </div>
          </label>
        `;
      }).join('');
    };

    // Render Tab 2 HTML (Per-Ayat Checklist for a specific surah)
    const renderAyatChecklistHtml = (surahNum) => {
      const sInfo = surahList.find(s => s.nomor === surahNum);
      if (!sInfo) return `<div style="padding: 20px; text-align: center; color: var(--text-muted);">Pilih surat terlebih dahulu.</div>`;

      const memCount = store.getSurahMemorizedCount(studentId, surahNum);
      const isDone = memCount >= sInfo.jumlahAyat;

      let versesHtml = '';
      for (let a = 1; a <= sInfo.jumlahAyat; a++) {
        const isHafal = store.isVerseMemorized(studentId, surahNum, a);
        versesHtml += `
          <label class="verse-chk-item ${isHafal ? 'hafal' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; border: 1px solid ${isHafal ? 'var(--color-success)' : 'var(--border-color)'}; border-radius: var(--radius-sm); background: ${isHafal ? 'rgba(46, 204, 113, 0.08)' : '#FFFFFF'}; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="chk-single-ayat" value="${a}" style="width: 16px; height: 16px; accent-color: var(--color-primary);" ${isHafal ? 'checked disabled' : ''}>
              <span style="font-size: 13px; font-weight: 600; color: var(--text-dark);">Ayat ${a}</span>
            </div>
            ${isHafal ? `<span style="font-size: 11px; font-weight: 700; color: var(--color-success);">✓ Hafal</span>` : `<span style="font-size: 11px; color: var(--text-muted);">-</span>`}
          </label>
        `;
      }

      return `
        <div>
          <!-- Surah Header Card in per-ayat -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--color-primary-soft); border-radius: var(--radius-sm); margin-bottom: 10px;">
            <div>
              <strong style="font-size: 13.5px; color: var(--text-primary);">${sInfo.nomor}. Surat ${sInfo.namaLatin}</strong>
              <div style="font-size: 11.5px; color: var(--text-muted);">${sInfo.jumlahAyat} Ayat • ${sInfo.arti || ''}</div>
            </div>
            <span class="badge ${isDone ? 'badge-success' : 'badge-primary'}">${memCount}/${sInfo.jumlahAyat} Ayat Hafal</span>
          </div>

          <!-- Quick Action Buttons for Verses -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-ayat-pick-remaining" style="font-size: 11px; padding: 4px 8px;">Pilih Sisa</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-ayat-pick-all" style="font-size: 11px; padding: 4px 8px;">Pilih Semua</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-ayat-clear" style="font-size: 11px; padding: 4px 8px;">Batal</button>
            </div>

            <!-- Range helper -->
            <div style="display: flex; align-items: center; gap: 4px; font-size: 11.5px;">
              <span>Ayat</span>
              <input type="number" id="input-range-from" min="1" max="${sInfo.jumlahAyat}" value="1" style="width: 44px; padding: 2px 4px; border: 1px solid var(--border-color); border-radius: 4px; text-align: center;">
              <span>s/d</span>
              <input type="number" id="input-range-to" min="1" max="${sInfo.jumlahAyat}" value="${Math.min(sInfo.jumlahAyat, 10)}" style="width: 44px; padding: 2px 4px; border: 1px solid var(--border-color); border-radius: 4px; text-align: center;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-apply-range" style="font-size: 11px; padding: 4px 8px;">Terapkan</button>
            </div>
          </div>

          <!-- Verses Grid (2 Columns) -->
          <div id="ayat-grid-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; max-height: 200px; overflow-y: auto; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 8px; background: #FAFCFF; margin-bottom: 12px;">
            ${versesHtml}
          </div>
        </div>
      `;
    };

    const sheetFooter = `
      <div id="footer-mode-surat" style="width: 100%;">
        <button type="button" class="btn btn-success btn-lg" id="btn-submit-multi-surah" style="width: 100%; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); font-weight: 800; opacity: 0.6; cursor: not-allowed;" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Pilih Surat untuk Disimpan</span>
        </button>
      </div>

      <div id="footer-mode-ayat" style="display: none; width: 100%;">
        <button type="button" class="btn btn-primary btn-lg" id="btn-submit-single-ayat" style="width: 100%; box-shadow: 0 4px 14px rgba(46, 134, 222, 0.35); font-weight: 800;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Simpan Hafalan Ayat Terpilih</span>
        </button>
      </div>
    `;

    const sheetContent = `
      <div>
        <!-- Student Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">Validasi Setoran Hafalan</div>
            <div style="font-size: 17px; font-weight: 800; color: var(--text-dark);">${student.nama}</div>
          </div>
          <span class="badge badge-primary">Kelas ${student.kelas_nama || '-'}</span>
        </div>

        <!-- Mode Tabs: Centang Per Surat vs Centang Per Ayat -->
        <div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 8px;">
          <button type="button" class="filter-pill active" id="tab-btn-mode-surat" style="flex: 1; text-align: center;">
            📋 Centang Per Surat (Banyak Sekaligus)
          </button>
          <button type="button" class="filter-pill" id="tab-btn-mode-ayat" style="flex: 1; text-align: center;">
            🔢 Centang Per Ayat (Detail)
          </button>
        </div>

        <!-- SECTION 1: CENTANG PER SURAT (MULTI-SURAT) -->
        <div id="section-mode-surat">
          <!-- Filter and Select Controls -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 8px;">
            <div style="display: flex; gap: 4px;">
              <button type="button" class="btn btn-primary btn-sm" id="btn-val-filter-juz30" style="padding: 4px 8px; font-size: 11px;">Juz 30 (78-114)</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-val-filter-juz1-29" style="padding: 4px 8px; font-size: 11px;">Juz 1-29 (1-77)</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-val-filter-all" style="padding: 4px 8px; font-size: 11px;">Semua Surat (114)</button>
            </div>

            <div style="display: flex; gap: 4px;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-multi-check-all" style="padding: 4px 8px; font-size: 11px;">Pilih Semua</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-multi-uncheck-all" style="padding: 4px 8px; font-size: 11px;">Batal</button>
            </div>
          </div>

          <!-- Sembunyikan yang sudah lunas Checkbox Toggle -->
          <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="chk-val-hide-completed" style="width: 15px; height: 15px; accent-color: var(--color-primary);">
            <label for="chk-val-hide-completed" style="font-size: 12px; color: var(--text-dark); cursor: pointer;">
              Sembunyikan surat yang sudah lunas (Hafal)
            </label>
          </div>

          <!-- Multi Surah Checkbox List Container -->
          <div id="multi-surah-list-container" style="height: 150px; max-height: 150px; overflow-y: auto; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 6px 8px; margin-bottom: 8px; background: #FAFCFF;">
            ${renderMultiSurahHtml()}
          </div>

          <!-- Notes -->
          <div class="form-group" style="margin-top: 4px; margin-bottom: 2px;">
            <label class="form-label" style="font-size: 12px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; display: block;">
              Catatan Guru untuk Setoran Ini (Opsional)
            </label>
            <input type="text" id="multi-surah-notes" class="form-input" style="font-size: 13px; padding: 8px 12px;" placeholder="Contoh: Bacaan lancar, makhraj & tajwid baik.">
          </div>
        </div>

        <!-- SECTION 2: CENTANG PER AYAT (GRANULAR) -->
        <div id="section-mode-ayat" style="display: none;">
          <div class="form-group" style="margin-bottom: 8px;">
            <label class="form-label" style="font-size: 12px; font-weight: 700;">Pilih Surat yang Disetorkan</label>
            <select id="val-ayat-surah-picker" class="form-select">
              ${surahList.map(s => `
                <option value="${s.nomor}" ${s.nomor === selectedAyatSurahNum ? 'selected' : ''}>
                  ${s.nomor}. Surat ${s.namaLatin} (${s.jumlahAyat} Ayat)
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Per-Ayat Checklist Container -->
          <div id="per-ayat-container" style="height: 150px; max-height: 150px; overflow-y: auto; margin-bottom: 8px;">
            ${renderAyatChecklistHtml(selectedAyatSurahNum)}
          </div>

          <!-- Notes -->
          <div class="form-group" style="margin-top: 4px; margin-bottom: 2px;">
            <label class="form-label" style="font-size: 12px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; display: block;">
              Catatan Guru untuk Setoran Ini (Opsional)
            </label>
            <input type="text" id="single-ayat-notes" class="form-input" style="font-size: 13px; padding: 8px 12px;" placeholder="Contoh: Ayat 1-10 sudah lancar...">
          </div>
        </div>
      </div>
    `;

    app.showBottomSheet('Form Validasi Hafalan Murid', sheetContent, '', sheetFooter);

    // --- Tab Switch Logic ---
    const tabSurat = document.getElementById('tab-btn-mode-surat');
    const tabAyat = document.getElementById('tab-btn-mode-ayat');
    const secSurat = document.getElementById('section-mode-surat');
    const secAyat = document.getElementById('section-mode-ayat');

    if (tabSurat && tabAyat) {
      tabSurat.addEventListener('click', () => {
        activeTab = 'per-surat';
        tabSurat.classList.add('active');
        tabAyat.classList.remove('active');
        secSurat.style.display = 'block';
        secAyat.style.display = 'none';
        const fSurat = document.getElementById('footer-mode-surat');
        const fAyat = document.getElementById('footer-mode-ayat');
        if (fSurat) fSurat.style.display = 'flex';
        if (fAyat) fAyat.style.display = 'none';
      });

      tabAyat.addEventListener('click', () => {
        activeTab = 'per-ayat';
        tabAyat.classList.add('active');
        tabSurat.classList.remove('active');
        secAyat.style.display = 'block';
        secSurat.style.display = 'none';
        const fSurat = document.getElementById('footer-mode-surat');
        const fAyat = document.getElementById('footer-mode-ayat');
        if (fSurat) fSurat.style.display = 'none';
        if (fAyat) fAyat.style.display = 'block';
        attachAyatEvents();
      });
    }

    // --- Tab 1: Multi Surah Filter Events ---
    const multiContainer = document.getElementById('multi-surah-list-container');
    const btnFilterJuz30 = document.getElementById('btn-val-filter-juz30');
    const btnFilterJuz1To29 = document.getElementById('btn-val-filter-juz1-29');
    const btnFilterAll = document.getElementById('btn-val-filter-all');
    const chkHideCompleted = document.getElementById('chk-val-hide-completed');

    const updateSurahRowUI = (cb) => {
      const label = cb.closest('.multi-surah-item');
      if (!label) return;
      const totalAyat = parseInt(cb.dataset.totalAyat);
      const memCount = parseInt(cb.dataset.memCount) || 0;
      const badgeContainer = label.querySelector('.surah-status-badge-container');
      if (!badgeContainer) return;

      if (cb.checked) {
        label.style.borderColor = 'var(--color-success)';
        label.style.background = 'rgba(46, 204, 113, 0.12)';
        badgeContainer.innerHTML = `<span class="badge badge-success" style="font-size: 10.5px; font-weight: 700;">✓ ${totalAyat}/${totalAyat} Terpenuhi</span>`;
      } else {
        label.style.borderColor = 'var(--border-color)';
        label.style.background = '#FFFFFF';
        if (memCount > 0) {
          badgeContainer.innerHTML = `<span class="badge badge-primary" style="font-size: 10.5px;">${memCount}/${totalAyat} Hafal</span>`;
        } else {
          badgeContainer.innerHTML = `<span class="badge" style="font-size: 10.5px; background: #F1F5F9; color: #64748B;">0/${totalAyat} Ayat (Belum)</span>`;
        }
      }
      updateSummaryCounter();
    };

    const updateSummaryCounter = () => {
      const checkedBoxes = document.querySelectorAll('.chk-multi-surah:checked:not(:disabled)');
      let countSurat = checkedBoxes.length;
      let countAyat = 0;
      checkedBoxes.forEach(cb => {
        countAyat += parseInt(cb.dataset.totalAyat) || 0;
      });

      const btnSubmit = document.getElementById('btn-submit-multi-surah');
      if (btnSubmit) {
        if (countSurat > 0) {
          btnSubmit.disabled = false;
          btnSubmit.style.opacity = '1';
          btnSubmit.style.cursor = 'pointer';
          btnSubmit.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Simpan Hafalan (${countSurat} Surat • ${countAyat} Ayat)</span>
          `;
        } else {
          btnSubmit.disabled = true;
          btnSubmit.style.opacity = '0.6';
          btnSubmit.style.cursor = 'not-allowed';
          btnSubmit.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Pilih Surat untuk Disimpan</span>
          `;
        }
      }
    };

    const attachMultiSurahItemEvents = () => {
      document.querySelectorAll('.chk-multi-surah:not(:disabled)').forEach(cb => {
        cb.addEventListener('change', () => {
          updateSurahRowUI(cb);
        });
      });
    };

    const updateMultiContainer = () => {
      if (multiContainer) {
        multiContainer.innerHTML = renderMultiSurahHtml();
        attachMultiSurahItemEvents();
        updateSummaryCounter();
      }
    };

    const updateFilterButtons = () => {
      [btnFilterJuz30, btnFilterJuz1To29, btnFilterAll].forEach(btn => {
        if (!btn) return;
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      });
      if (multiFilter === 'juz30' && btnFilterJuz30) {
        btnFilterJuz30.classList.remove('btn-secondary');
        btnFilterJuz30.classList.add('btn-primary');
      } else if (multiFilter === 'juz1-29' && btnFilterJuz1To29) {
        btnFilterJuz1To29.classList.remove('btn-secondary');
        btnFilterJuz1To29.classList.add('btn-primary');
      } else if (multiFilter === 'all' && btnFilterAll) {
        btnFilterAll.classList.remove('btn-secondary');
        btnFilterAll.classList.add('btn-primary');
      }
    };

    if (btnFilterJuz30) {
      btnFilterJuz30.addEventListener('click', () => {
        multiFilter = 'juz30';
        updateFilterButtons();
        updateMultiContainer();
      });
    }

    if (btnFilterJuz1To29) {
      btnFilterJuz1To29.addEventListener('click', () => {
        multiFilter = 'juz1-29';
        updateFilterButtons();
        updateMultiContainer();
      });
    }

    if (btnFilterAll) {
      btnFilterAll.addEventListener('click', () => {
        multiFilter = 'all';
        updateFilterButtons();
        updateMultiContainer();
      });
    }

    if (chkHideCompleted) {
      chkHideCompleted.addEventListener('change', (e) => {
        hideCompleted = e.target.checked;
        updateMultiContainer();
      });
    }

    document.getElementById('btn-multi-check-all')?.addEventListener('click', () => {
      document.querySelectorAll('.chk-multi-surah:not(:disabled)').forEach(cb => {
        cb.checked = true;
        updateSurahRowUI(cb);
      });
    });

    document.getElementById('btn-multi-uncheck-all')?.addEventListener('click', () => {
      document.querySelectorAll('.chk-multi-surah:not(:disabled)').forEach(cb => {
        cb.checked = false;
        updateSurahRowUI(cb);
      });
    });

    attachMultiSurahItemEvents();

    // Submit Multi-Surah Validation
    document.getElementById('btn-submit-multi-surah')?.addEventListener('click', async () => {
      const checkedBoxes = Array.from(document.querySelectorAll('.chk-multi-surah:checked:not(:disabled)'));
      if (checkedBoxes.length === 0) {
        alert('Pilih minimal satu surat baru yang disetorkan!');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-multi-surah');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Menyimpan Setoran...</span>';

      const guru = auth.getCurrentUser();
      const catatan = (document.getElementById('multi-surah-notes')?.value || '').trim();

      const items = [];
      for (const cb of checkedBoxes) {
        const sNum = parseInt(cb.value);
        const totalAyat = parseInt(cb.dataset.totalAyat);
        const sName = cb.dataset.surahName;

        const ayatList = [];
        for (let a = 1; a <= totalAyat; a++) {
          ayatList.push(a);
        }

        items.push({
          nomorSurat: sNum,
          namaSurat: sName,
          ayatList
        });
      }

      store.saveMultiSurahValidation({
        santriId: studentId,
        items,
        guruId: guru.id,
        catatan
      });

      app.closeBottomSheet();
      app.showToast(`🎉 Berhasil memvalidasi ${items.length} surat untuk ${student.nama}!`, 'success');
      app.render();
    });

    // --- Tab 2: Per Ayat Events ---
    const ayatPicker = document.getElementById('val-ayat-surah-picker');
    const perAyatContainer = document.getElementById('per-ayat-container');

    const attachAyatEvents = () => {
      document.getElementById('btn-ayat-pick-remaining')?.addEventListener('click', () => {
        document.querySelectorAll('.chk-single-ayat:not(:disabled)').forEach(cb => cb.checked = true);
      });

      document.getElementById('btn-ayat-pick-all')?.addEventListener('click', () => {
        document.querySelectorAll('.chk-single-ayat').forEach(cb => cb.checked = true);
      });

      document.getElementById('btn-ayat-clear')?.addEventListener('click', () => {
        document.querySelectorAll('.chk-single-ayat:not(:disabled)').forEach(cb => cb.checked = false);
      });

      document.getElementById('btn-apply-range')?.addEventListener('click', () => {
        const fromVal = parseInt(document.getElementById('input-range-from')?.value) || 1;
        const toVal = parseInt(document.getElementById('input-range-to')?.value) || 1;
        const minA = Math.min(fromVal, toVal);
        const maxA = Math.max(fromVal, toVal);

        document.querySelectorAll('.chk-single-ayat:not(:disabled)').forEach(cb => {
          const val = parseInt(cb.value);
          if (val >= minA && val <= maxA) {
            cb.checked = true;
          }
        });
      });
    };

    if (ayatPicker) {
      ayatPicker.addEventListener('change', (e) => {
        selectedAyatSurahNum = parseInt(e.target.value);
        if (perAyatContainer) {
          perAyatContainer.innerHTML = renderAyatChecklistHtml(selectedAyatSurahNum);
          attachAyatEvents();
        }
      });
    }

    attachAyatEvents();

    // Submit Per Ayat Validation
    document.getElementById('btn-submit-single-ayat')?.addEventListener('click', async () => {
      const checkedBoxes = Array.from(document.querySelectorAll('.chk-single-ayat:checked:not(:disabled)'));
      if (checkedBoxes.length === 0) {
        alert('Pilih minimal satu ayat baru yang disetorkan!');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-single-ayat');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Menyimpan Setoran...</span>';

      const sInfo = surahList.find(s => s.nomor === selectedAyatSurahNum);
      const sName = sInfo ? sInfo.namaLatin : `Surat ${selectedAyatSurahNum}`;
      const ayatList = checkedBoxes.map(cb => parseInt(cb.value));
      const guru = auth.getCurrentUser();
      const catatan = (document.getElementById('single-ayat-notes')?.value || '').trim();

      store.saveValidation({
        santriId: studentId,
        nomorSurat: selectedAyatSurahNum,
        namaSurat: sName,
        ayatList,
        guruId: guru.id,
        catatan
      });

      app.closeBottomSheet();
      app.showToast(`🎉 Berhasil memvalidasi ${ayatList.length} ayat Surat ${sName} untuk ${student.nama}!`, 'success');
      app.render();
    });
  },

  // ==========================================
  // TAB 2: FITUR MUROTAL UNTUK GURU
  // ==========================================
  async renderMurotal() {
    let surahs = [];
    try {
      surahs = await quranApi.getAllSurah();
    } catch (e) {
      surahs = [];
    }

    let filtered = surahs;
    if (this.murotalFilter === 'juz30') {
      filtered = surahs.filter(s => s.nomor >= 78 && s.nomor <= 114);
    }

    if (this.murotalSearch) {
      const q = this.murotalSearch.toLowerCase();
      filtered = filtered.filter(s => s.namaLatin.toLowerCase().includes(q) || String(s.nomor).includes(q));
    }

    const currentReciter = audioManager.getReciter();

    return `
      <div class="animate-fade" style="padding: 16px;">
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Murotal Al-Qur'an</h2>
          <p style="font-size: 12.5px; color: var(--text-muted);">Dengarkan lantunan ayat suci Al-Qur'an dengan berbagai pilihan Qari ternama.</p>
        </div>

        <!-- Reciter Selection Card -->
        <div class="card" style="margin-bottom: 14px; padding: 14px;">
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">Pilihan Qari / Pembaca Al-Qur'an</label>
          <select id="select-guru-reciter" class="form-select">
            ${RECITERS.map(r => `
              <option value="${r.id}" ${r.id === currentReciter ? 'selected' : ''}>${r.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- Search & Filter Controls -->
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="input-search-murotal" class="form-input" placeholder="Cari nama surat..." value="${this.murotalSearch}" style="flex: 1;">
          <button class="filter-pill ${this.murotalFilter === 'juz30' ? 'active' : ''}" id="btn-murotal-filter-juz30">Juz 30</button>
          <button class="filter-pill ${this.murotalFilter === 'all' ? 'active' : ''}" id="btn-murotal-filter-all">114 Surat</button>
        </div>

        <!-- Surah Audio Cards List -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${filtered.length > 0 ? filtered.map(s => {
            const isPlayingThis = audioManager.currentTrack && audioManager.currentTrack.surahNumber === s.nomor && audioManager.isPlaying;

            return `
              <div class="card" style="padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid ${isPlayingThis ? 'var(--color-primary)' : 'transparent'};">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary-soft); color: var(--color-primary); font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center;">
                    ${s.nomor}
                  </div>
                  <div>
                    <div style="font-size: 14.5px; font-weight: 700; color: var(--text-dark);">
                      ${s.namaLatin}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted);">
                      ${s.jumlahAyat} Ayat • ${s.arti || s.tempatTurun}
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="font-family: var(--font-arabic); font-size: 18px; color: var(--text-primary); margin-right: 6px;">
                    ${s.nama}
                  </div>
                  <button class="btn ${isPlayingThis ? 'btn-danger' : 'btn-primary'} btn-icon btn-sm btn-play-murotal-surah" data-surah-num="${s.nomor}" data-surah-name="${s.namaLatin}" title="Putar Murotal">
                    ${isPlayingThis ? `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ` : `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    `}
                  </button>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="card" style="text-align: center; padding: 24px; color: var(--text-muted);">
              Surat tidak ditemukan.
            </div>
          `}
        </div>
      </div>
    `;
  },

  initMurotalEvents() {
    // Reciter change
    const reciterSelect = document.getElementById('select-guru-reciter');
    if (reciterSelect) {
      reciterSelect.addEventListener('change', (e) => {
        audioManager.setReciter(e.target.value);
        app.showToast('Qari murotal berhasil diganti', 'info');
      });
    }

    // Search input
    const searchInput = document.getElementById('input-search-murotal');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.murotalSearch = e.target.value;
        app.render();
      });
    }

    // Filter Juz 30 vs All
    document.getElementById('btn-murotal-filter-juz30')?.addEventListener('click', () => {
      this.murotalFilter = 'juz30';
      app.render();
    });

    document.getElementById('btn-murotal-filter-all')?.addEventListener('click', () => {
      this.murotalFilter = 'all';
      app.render();
    });

    // Play/Pause Surah Audio
    document.querySelectorAll('.btn-play-murotal-surah').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sNum = parseInt(btn.dataset.surahNum);
        const sName = btn.dataset.surahName;
        const reciterId = audioManager.getReciter();

        // Get full audio URL from API detail or standard EQuran CDN
        btn.disabled = true;
        try {
          const detail = await quranApi.getSurahDetail(sNum);
          const audioUrl = detail?.audioFull?.[reciterId] || `https://equran.nos.wjv-1.neo.id/audio-full/${reciterId}/${String(sNum).padStart(3, '0')}.mp3`;

          audioManager.playTrack({
            type: 'surah',
            surahNumber: sNum,
            surahName: sName,
            url: audioUrl
          });
        } catch (e) {
          app.showToast('Gagal memuat audio murotal', 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });
  },

  // ==========================================
  // TAB 3: LAPORAN HAFALAN & EKSPOR PDF (2 JENIS: SEMUA & PER SISWA)
  // ==========================================
  renderReports() {
    const guru = auth.getCurrentUser();
    const myClasses = store.getClasses(guru.id);
    const allStudents = store.getUsersByRole('santri').filter(s => s.status_aktif).sort((a, b) => a.nama.localeCompare(b.nama));

    const periodLabels = {
      today: 'Hari Ini',
      week: 'Pekan Ini (7 Hari Terakhir)',
      all: 'Semua Waktu'
    };

    // -------------------------------------------------------------
    // JENIS 1: SEMUA SETORAN HAFALAN (REKAPITULASI)
    // -------------------------------------------------------------
    if (this.reportType === 'all') {
      const reportData = store.getHafalanReport({
        period: this.reportPeriod,
        classId: this.reportClassFilter || null,
        guruId: guru.id
      });

      const totalSetoran = reportData.length;
      const uniqueStudents = new Set(reportData.map(r => r.santri_id)).size;
      const totalAyat = reportData.reduce((sum, r) => sum + (r.totalAyat || 0), 0);

      return `
        <div class="animate-fade" style="padding: 16px;">
          <!-- Header Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div>
              <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Laporan Hafalan</h2>
              <p style="font-size: 12px; color: var(--text-muted);">Data setoran murid MI Al-Hidayah 1</p>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-export-report-pdf" style="background: #10B981; border-color: #10B981;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Ekspor PDF</span>
            </button>
          </div>

          <!-- Report Type Switcher Tabs (2 Jenis Laporan) -->
          <div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 8px;">
            <button type="button" class="filter-pill active" id="tab-report-type-all" style="flex: 1; text-align: center; font-weight: 700;">
              📋 Semua Setoran Hafalan
            </button>
            <button type="button" class="filter-pill" id="tab-report-type-student" style="flex: 1; text-align: center; font-weight: 700;">
              👤 Setoran Per Siswa
            </button>
          </div>

          <!-- Period Filter Pills -->
          <div class="filter-pills-row" style="margin-bottom: 12px; padding: 0; background: transparent;">
            <button class="filter-pill ${this.reportPeriod === 'today' ? 'active' : ''}" data-period="today">Hari Ini</button>
            <button class="filter-pill ${this.reportPeriod === 'week' ? 'active' : ''}" data-period="week">Pekan Ini</button>
            <button class="filter-pill ${this.reportPeriod === 'all' ? 'active' : ''}" data-period="all">Semua Waktu</button>
          </div>

          <!-- Class Filter Dropdown -->
          ${myClasses.length > 1 ? `
            <div style="margin-bottom: 14px;">
              <select id="select-report-class" class="form-select" style="padding: 8px 12px; font-size: 13px;">
                <option value="">-- Semua Kelas Diampu --</option>
                ${myClasses.map(c => `
                  <option value="${c.id}" ${this.reportClassFilter === c.id ? 'selected' : ''}>Kelas ${c.nama_kelas}</option>
                `).join('')}
              </select>
            </div>
          ` : ''}

          <!-- Metrics Summary Cards -->
          <div class="quick-stats-grid" style="margin-bottom: 14px;">
            <div class="stat-box">
              <div class="stat-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <div class="stat-num">${totalSetoran}</div>
                <div class="stat-label">Setoran</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon-wrapper success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <div class="stat-num">${uniqueStudents}</div>
                <div class="stat-label">Murid Menyetor</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <div>
                <div class="stat-num">${totalAyat}</div>
                <div class="stat-label">Total Ayat</div>
              </div>
            </div>
          </div>

          <!-- Report Data Table -->
          <div class="card" style="padding: 12px;">
            <div class="card-header" style="margin-bottom: 8px;">
              <span class="card-title">Tabel Rekapitulasi (${periodLabels[this.reportPeriod]})</span>
              <span class="badge badge-primary">${totalSetoran} Data</span>
            </div>

            ${reportData.length > 0 ? `
              <div class="report-table-wrapper">
                <table class="report-table" id="report-table-view">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Murid</th>
                      <th>Kelas</th>
                      <th>Surat yang Dihafal</th>
                      <th>Waktu</th>
                      <th>Catatan Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${reportData.map((item, idx) => `
                      <tr>
                        <td style="font-weight: 700; color: var(--text-muted);">${idx + 1}</td>
                        <td style="font-weight: 700; color: var(--text-dark);">${item.studentName}</td>
                        <td><span class="badge badge-primary" style="font-size: 11px;">${item.className}</span></td>
                        <td>
                          <strong>Surat ${item.namaSurat}</strong><br>
                          <span style="font-size: 11px; color: var(--text-muted);">(Ayat ${item.ayatMulai}-${item.ayatSelesai} • ${item.totalAyat} Ayat)</span>
                        </td>
                        <td style="font-size: 11.5px; color: var(--text-muted); white-space: nowrap;">${item.tanggal || '-'}</td>
                        <td style="font-size: 11.5px; color: var(--text-dark);">${item.catatan || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
                Belum ada data setoran hafalan pada periode <strong>${periodLabels[this.reportPeriod]}</strong>.
              </div>
            `}
          </div>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // JENIS 2: SETORAN HAFALAN PER SISWA
    // -------------------------------------------------------------
    const selectedStudent = this.selectedReportStudentId ? store.getUserById(this.selectedReportStudentId) : null;
    let studentReportData = [];
    let studentProgress = null;

    if (selectedStudent) {
      studentReportData = store.getHafalanReport({
        studentId: selectedStudent.id,
        period: this.reportPeriod
      });
      studentProgress = store.calculateStudentProgress(selectedStudent.id);
    }

    const totalStudentAyat = studentReportData.reduce((sum, r) => sum + (r.totalAyat || 0), 0);

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Header Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Laporan Hafalan</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Laporan detail setoran per siswa</p>
          </div>
          ${selectedStudent ? `
            <button class="btn btn-primary btn-sm" id="btn-export-report-pdf" style="background: #10B981; border-color: #10B981;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Ekspor PDF Siswa</span>
            </button>
          ` : ''}
        </div>

        <!-- Report Type Switcher Tabs (2 Jenis Laporan) -->
        <div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 8px;">
          <button type="button" class="filter-pill" id="tab-report-type-all" style="flex: 1; text-align: center; font-weight: 700;">
            📋 Semua Setoran Hafalan
          </button>
          <button type="button" class="filter-pill active" id="tab-report-type-student" style="flex: 1; text-align: center; font-weight: 700;">
            👤 Setoran Per Siswa
          </button>
        </div>

        <!-- Student Selector Dropdown -->
        <div class="card" style="margin-bottom: 14px; padding: 14px; border-color: rgba(46, 134, 222, 0.3); background: #F8FAFC;">
          <label class="form-label" style="font-size: 13px; font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">
            Pilih Siswa untuk Melihat Laporan:
          </label>
          <select id="select-report-student" class="form-select" style="font-size: 13.5px; padding: 10px 12px; font-weight: 600;">
            <option value="">-- Ketuk di Sini untuk Memilih Siswa --</option>
            ${allStudents.map(st => `
              <option value="${st.id}" ${this.selectedReportStudentId === st.id ? 'selected' : ''}>
                ${st.nama} (${st.kelas_nama ? `Kelas ${st.kelas_nama}` : 'Tanpa Kelas'})
              </option>
            `).join('')}
          </select>
        </div>

        ${selectedStudent ? `
          <!-- Student Profile & Highlight Card -->
          <div class="card" style="margin-bottom: 14px; background: linear-gradient(135deg, #0C447C 0%, #1B68B3 100%); color: #FFFFFF; border: none; box-shadow: var(--shadow-md);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
              <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.2); color: #FFFFFF; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.4);">
                ${selectedStudent.nama.charAt(0)}
              </div>
              <div style="flex: 1;">
                <h3 style="font-size: 17px; font-weight: 800; color: #FFFFFF; margin-bottom: 2px;">${selectedStudent.nama}</h3>
                <div style="font-size: 12px; color: rgba(255,255,255,0.85);">
                  @${selectedStudent.username} • Kelas: <strong>${selectedStudent.kelas_nama || '-'}</strong> • Target: <strong>Juz ${selectedStudent.target_juz || 30}</strong>
                </div>
              </div>
              <span class="badge" style="background: ${studentProgress.overallPercentage >= 100 ? '#10B981' : 'rgba(255,255,255,0.25)'}; color: #FFFFFF; font-size: 12px; padding: 6px 10px;">
                ${studentProgress.overallPercentage >= 100 ? '🎉 100% Khatam' : `${studentProgress.overallPercentage}% Selesai`}
              </span>
            </div>

            <div style="background: rgba(255,255,255,0.2); border-radius: 999px; height: 7px; overflow: hidden; margin-bottom: 8px;">
              <div style="background: #10B981; height: 100%; width: ${studentProgress.overallPercentage}%; border-radius: 999px;"></div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: rgba(255,255,255,0.9);">
              <span>Hafalan 30 Juz: <strong>${studentProgress.totalAyatHafal} / 6.236 Ayat (${studentProgress.overallPercentage}%)</strong></span>
              <span>Juz 30: <strong>${studentProgress.juz30Verses} / 564 Ayat (${studentProgress.juz30Percentage}%)</strong></span>
            </div>
          </div>

          <!-- Period Filter Pills -->
          <div class="filter-pills-row" style="margin-bottom: 12px; padding: 0; background: transparent;">
            <button class="filter-pill ${this.reportPeriod === 'today' ? 'active' : ''}" data-period="today">Hari Ini</button>
            <button class="filter-pill ${this.reportPeriod === 'week' ? 'active' : ''}" data-period="week">Pekan Ini</button>
            <button class="filter-pill ${this.reportPeriod === 'all' ? 'active' : ''}" data-period="all">Semua Waktu</button>
          </div>

          <!-- Metrics for Student -->
          <div class="quick-stats-grid" style="margin-bottom: 14px;">
            <div class="stat-box">
              <div class="stat-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <div class="stat-num">${studentReportData.length}</div>
                <div class="stat-label">Kali Setoran</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon-wrapper success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <div>
                <div class="stat-num">${totalStudentAyat}</div>
                <div class="stat-label">Ayat Disetor</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              </div>
              <div>
                <div class="stat-num" style="font-size: 13px; margin-top: 4px;">${studentReportData[0] ? (studentReportData[0].tanggal || '-').split(' ')[0] : '-'}</div>
                <div class="stat-label">Terakhir Setor</div>
              </div>
            </div>
          </div>

          <!-- Table of Student Setoran -->
          <div class="card" style="padding: 12px;">
            <div class="card-header" style="margin-bottom: 8px;">
              <span class="card-title">Riwayat Setoran: ${selectedStudent.nama} (${periodLabels[this.reportPeriod]})</span>
              <span class="badge badge-primary">${studentReportData.length} Setoran</span>
            </div>

            ${studentReportData.length > 0 ? `
              <div class="report-table-wrapper">
                <table class="report-table" id="report-table-view">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Surat & Ayat yang Dihafal</th>
                      <th>Jumlah Ayat</th>
                      <th>Tanggal & Waktu</th>
                      <th>Catatan Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${studentReportData.map((item, idx) => `
                      <tr>
                        <td style="font-weight: 700; color: var(--text-muted);">${idx + 1}</td>
                        <td>
                          <strong>Surat ${item.namaSurat}</strong><br>
                          <span style="font-size: 11.5px; color: var(--color-primary);">Ayat ${item.ayatMulai} - ${item.ayatSelesai}</span>
                        </td>
                        <td style="font-weight: 700;">${item.totalAyat} Ayat</td>
                        <td style="font-size: 11.5px; color: var(--text-muted); white-space: nowrap;">${item.tanggal || '-'}</td>
                        <td style="font-size: 11.5px; color: var(--text-dark);">${item.catatan || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
                Belum ada data setoran untuk <strong>${selectedStudent.nama}</strong> pada periode ${periodLabels[this.reportPeriod]}.
              </div>
            `}
          </div>
        ` : `
          <div class="card" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 40px; margin-bottom: 10px;">📋</div>
            <p style="font-size: 14.5px; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">Pilih Siswa untuk Melihat Laporan</p>
            <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 auto; max-width: 280px;">
              Silakan pilih salah satu siswa dari menu dropdown di atas untuk melihat detail riwayat setoran, persentase hafalan, dan ekspor PDF rapor hafalan siswa tersebut.
            </p>
          </div>
        `}
      </div>
    `;
  },

  initReportsEvents() {
    // Switch between Semua Setoran vs Per Siswa
    const tabAll = document.getElementById('tab-report-type-all');
    const tabStudent = document.getElementById('tab-report-type-student');

    if (tabAll) {
      tabAll.addEventListener('click', () => {
        this.reportType = 'all';
        app.render();
      });
    }

    if (tabStudent) {
      tabStudent.addEventListener('click', () => {
        this.reportType = 'student';
        app.render();
      });
    }

    // Student picker dropdown
    const studentSelect = document.getElementById('select-report-student');
    if (studentSelect) {
      studentSelect.addEventListener('change', (e) => {
        this.selectedReportStudentId = e.target.value;
        app.render();
      });
    }

    // Period filter clicks
    document.querySelectorAll('.filter-pill[data-period]').forEach(pill => {
      pill.addEventListener('click', () => {
        this.reportPeriod = pill.dataset.period;
        app.render();
      });
    });

    // Class filter change
    const classFilter = document.getElementById('select-report-class');
    if (classFilter) {
      classFilter.addEventListener('change', (e) => {
        this.reportClassFilter = e.target.value;
        app.render();
      });
    }

    // Export PDF Trigger
    const exportBtn = document.getElementById('btn-export-report-pdf');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.generatePdfReport();
      });
    }
  },

  generatePdfReport() {
    const guru = auth.getCurrentUser();
    const periodLabels = {
      today: 'Hari Ini',
      week: 'Pekan Ini (7 Hari Terakhir)',
      all: 'Semua Waktu'
    };

    const periodText = periodLabels[this.reportPeriod] || 'Laporan Hafalan';
    const now = new Date();
    const dateFormatted = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    // -------------------------------------------------------------
    // PDF TIPE 2: LAPORAN SETORAN PER SISWA
    // -------------------------------------------------------------
    if (this.reportType === 'student') {
      const student = this.selectedReportStudentId ? store.getUserById(this.selectedReportStudentId) : null;
      if (!student) {
        alert('Silakan pilih siswa terlebih dahulu dari menu dropdown untuk mencetak laporan per siswa.');
        return;
      }

      const studentReportData = store.getHafalanReport({
        studentId: student.id,
        period: this.reportPeriod
      });

      const prog = store.calculateStudentProgress(student.id);

      if (studentReportData.length === 0) {
        alert(`Belum ada riwayat setoran untuk ${student.nama} pada periode ${periodText}.`);
        return;
      }

      try {
        if (window.jspdf && window.jspdf.jsPDF) {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

          // Header Section: School branding
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(12, 68, 124);
          doc.text('MI AL-HIDAYAH 1', 105, 18, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text('LEMBAR PERKEMBANGAN HAFALAN SANTRI INDIVIDUAL', 105, 25, { align: 'center' });

          doc.setDrawColor(46, 134, 222);
          doc.setLineWidth(0.8);
          doc.line(15, 29, 195, 29);

          // Student Metadata Card in PDF
          doc.setFillColor(245, 249, 255);
          doc.roundedRect(15, 33, 180, 26, 2, 2, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(12, 68, 124);
          doc.text(`Nama Murid: ${student.nama}`, 20, 40);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(60, 60, 60);
          doc.text(`Kelas: ${student.kelas_nama || '-'}`, 20, 46);
          doc.text(`Target Hafalan: Juz ${student.target_juz || 30}`, 20, 52);

          doc.setFont('helvetica', 'bold');
          doc.text(`Total Pencapaian: ${prog.totalAyatHafal} / 6.236 Ayat (${prog.overallPercentage}%)`, 110, 40);
          doc.setFont('helvetica', 'normal');
          doc.text(`Pencapaian Juz 30: ${prog.juz30Verses} / 564 Ayat (${prog.juz30Percentage}%)`, 110, 46);
          doc.text(`Guru Pembimbing: ${guru.nama}`, 110, 52);

          // Table Rows Data
          const tableBody = studentReportData.map((r, i) => [
            String(i + 1),
            `Surat ${r.namaSurat}`,
            `Ayat ${r.ayatMulai} - ${r.ayatSelesai}`,
            `${r.totalAyat} Ayat`,
            r.tanggal || '-',
            r.catatan || '-'
          ]);

          doc.autoTable({
            startY: 64,
            head: [['No', 'Surat yang Dihafal', 'Rentang Ayat', 'Total', 'Waktu Setor', 'Catatan Guru']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
              fillColor: [12, 68, 124],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9
            },
            bodyStyles: {
              fontSize: 8.5,
              textColor: 40
            },
            columnStyles: {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 40 },
              2: { cellWidth: 35 },
              3: { cellWidth: 20, halign: 'center' },
              4: { cellWidth: 35 },
              5: { cellWidth: 40 }
            },
            margin: { left: 15, right: 15 }
          });

          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 180;
          if (finalY < 250) {
            doc.setFontSize(9.5);
            doc.setTextColor(80, 80, 80);
            doc.text(`Mengetahui,`, 30, finalY);
            doc.text(`Kepala Madrasah MI Al-Hidayah 1`, 30, finalY + 5);
            doc.text(`( ......................................... )`, 30, finalY + 25);

            doc.text(`Guru Pembimbing Tahfidz,`, 130, finalY);
            doc.text(`${guru.nama}`, 130, finalY + 25);
          }

          const filename = `Laporan_Hafalan_${student.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${dateFormatted.replace(/\//g, '-')}.pdf`;
          doc.save(filename);
          app.showToast(`Laporan PDF untuk ${student.nama} berhasil diunduh!`, 'success');
          return;
        }
      } catch (err) {
        console.warn('PDF export error:', err);
      }
    }

    // -------------------------------------------------------------
    // PDF TIPE 1: REKAPITULASI SEMUA SETORAN HAFALAN
    // -------------------------------------------------------------
    const reportData = store.getHafalanReport({
      period: this.reportPeriod,
      classId: this.reportClassFilter || null,
      guruId: guru.id
    });

    if (reportData.length === 0) {
      alert('Tidak ada data setoran hafalan untuk diekspor pada periode ini.');
      return;
    }

    try {
      if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Header Section: School branding
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(12, 68, 124);
        doc.text('MI AL-HIDAYAH 1', 105, 18, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('LAPORAN DATA SETORAN HAFALAN AL-QUR\'AN', 105, 25, { align: 'center' });

        doc.setDrawColor(46, 134, 222);
        doc.setLineWidth(0.8);
        doc.line(15, 29, 195, 29);

        // Metadata section
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Periode: ${periodText}`, 15, 36);
        doc.text(`Guru Pembimbing: ${guru.nama}`, 15, 41);
        doc.text(`Tanggal Cetak: ${dateFormatted}`, 195, 36, { align: 'right' });
        doc.text(`Total Setoran: ${reportData.length} data`, 195, 41, { align: 'right' });

        // Table Rows Data
        const tableBody = reportData.map((r, i) => [
          String(i + 1),
          r.studentName,
          r.className,
          `Surat ${r.namaSurat} (${r.ayatMulai}-${r.ayatSelesai})`,
          r.tanggal || '-',
          r.catatan || '-'
        ]);

        doc.autoTable({
          startY: 46,
          head: [['No', 'Nama Murid', 'Kelas', 'Surat yang Dihafal', 'Waktu', 'Catatan Guru']],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [46, 134, 222],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 8.5,
            textColor: 40
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 35 },
            2: { cellWidth: 22 },
            3: { cellWidth: 50 },
            4: { cellWidth: 30 },
            5: { cellWidth: 35 }
          },
          margin: { left: 15, right: 15 }
        });

        const filename = `Laporan_Rekap_Hafalan_MI_AlHidayah1_${this.reportPeriod}_${dateFormatted.replace(/\//g, '-')}.pdf`;
        doc.save(filename);
        app.showToast('Laporan PDF berhasil diunduh!', 'success');
        return;
      }
    } catch (err) {
      console.warn('jsPDF export error, falling back to print view:', err);
    }

    // Fallback: Clean printable window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Hafalan MI Al-Hidayah 1</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .header { text-align: center; border-bottom: 2px solid #2E86DE; padding-bottom: 10px; margin-bottom: 16px; }
            .school-name { font-size: 20px; font-weight: bold; color: #0C447C; }
            .title { font-size: 14px; font-weight: bold; margin-top: 4px; }
            .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 14px; color: #555; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #CCC; padding: 8px 10px; text-align: left; }
            th { background-color: #E6F1FB; color: #0C447C; }
            tr:nth-child(even) { background-color: #F8FAFD; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">MI AL-HIDAYAH 1</div>
            <div class="title">LAPORAN DATA SETORAN HAFALAN AL-QUR'AN</div>
          </div>
          <div class="meta">
            <div><strong>Guru Pembimbing:</strong> ${guru.nama}<br><strong>Periode:</strong> ${periodText}</div>
            <div style="text-align: right;"><strong>Tanggal Cetak:</strong> ${dateFormatted}<br><strong>Total Setoran:</strong> ${reportData.length} data</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Murid</th>
                <th>Kelas</th>
                <th>Surat yang Dihafal</th>
                <th>Waktu</th>
                <th>Catatan Guru</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${r.studentName}</strong></td>
                  <td>${r.className}</td>
                  <td>Surat ${r.namaSurat} (${r.ayatMulai}-${r.ayatSelesai})</td>
                  <td>${r.tanggal || '-'}</td>
                  <td>${r.catatan || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  },

  // ==========================================
  // TAB 4: PROFIL GURU
  // ==========================================
  renderProfile() {
    const guru = auth.getCurrentUser();
    const myClasses = store.getClasses(guru.id);
    const settings = store.data.settings;

    return `
      <div class="animate-fade" style="padding: 16px;">
        <div class="card" style="margin-bottom: 16px; text-align: center; padding: 24px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%); color: #FFFFFF; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 8px 20px rgba(46, 134, 222, 0.3);">
            ${guru.nama.charAt(0)}
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${guru.nama}</h2>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">@${guru.username}</div>
          <span class="badge badge-primary">Peran: Guru</span>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; border-top: 1px solid var(--border-light); padding-top: 14px; text-align: left;">
            <div>
              <div style="font-size: 11px; color: var(--text-muted);">Jumlah Kelas</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-dark);">${myClasses.length} Kelas</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted);">Status Pengajar</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--color-success);">Aktif Mengajar</div>
            </div>
          </div>
        </div>

        <!-- Settings Card (Pengaturan Al-Qur'an untuk Guru) -->
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header">
            <span class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Pengaturan Al-Qur'an (Guru)
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px;">
                <span>Ukuran Teks Arab</span>
                <span id="guru-font-size-val">${settings.arabicFontSize || 24}px</span>
              </div>
              <input type="range" id="guru-range-font-size" min="18" max="38" step="2" value="${settings.arabicFontSize || 24}" style="width: 100%; accent-color: var(--color-primary);">
              <div class="verse-arabic-text" id="guru-arabic-preview" style="text-align: center; margin-top: 10px; font-size: ${settings.arabicFontSize || 24}px; color: var(--color-primary); padding: 12px; background: var(--bg-page); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-light); padding-top: 12px;">
              <label class="form-label" style="font-size: 12px;">Qari Murottal Default</label>
              <select id="guru-settings-reciter-select" class="form-select">
                ${RECITERS.map(r => `
                  <option value="${r.id}" ${(settings.defaultReciter === r.id) ? 'selected' : ''}>${r.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <button class="btn btn-danger btn-lg" id="btn-guru-logout" style="width: 100%;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Keluar dari Akun Guru</span>
        </button>
      </div>
    `;
  },

  initProfileEvents() {
    const rangeFont = document.getElementById('guru-range-font-size');
    const fontVal = document.getElementById('guru-font-size-val');
    const preview = document.getElementById('guru-arabic-preview');

    if (rangeFont) {
      rangeFont.addEventListener('input', (e) => {
        const val = e.target.value;
        if (fontVal) fontVal.textContent = `${val}px`;
        if (preview) preview.style.fontSize = `${val}px`;
        store.updateSettings({ arabicFontSize: parseInt(val) });
      });
    }

    const reciterSelect = document.getElementById('guru-settings-reciter-select');
    if (reciterSelect) {
      reciterSelect.addEventListener('change', (e) => {
        store.updateSettings({ defaultReciter: e.target.value });
        app.showToast('Qari default berhasil disimpan', 'success');
      });
    }

    const logoutBtn = document.getElementById('btn-guru-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.logout();
        app.navigate('login');
        app.showToast('Anda telah keluar dari akun.', 'info');
      });
    }
  },

  showAddClassModal() {
    const content = `
      <form id="form-create-class" style="padding: 10px 0;">
        <div class="form-group">
          <label class="form-label">Nama Kelas Baru (Contoh: 1A, 2B, 3A)</label>
          <input type="text" id="new-class-name" class="form-input" placeholder="Contoh: 3A" required>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 10px;">
          Buat Kelas Baru
        </button>
      </form>
    `;

    app.showBottomSheet('Tambah Kelas Baru', content);

    const form = document.getElementById('form-create-class');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('new-class-name').value.trim();
        const guru = auth.getCurrentUser();

        if (nama) {
          await store.addClass({
            nama_kelas: nama,
            guru_id: guru.id
          });
          app.closeBottomSheet();
          app.showToast(`Kelas "${nama}" berhasil dibuat`, 'success');
          app.render();
        }
      });
    }
  }
};

// Expose globally for inline onclick handlers across web & WebView
if (typeof window !== 'undefined') {
  window.guruView = guruView;
}

