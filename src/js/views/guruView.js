/**
 * TAHFIDZ TRACKER - GURU NGAJI VIEW (PRD v2)
 * Class Management, Student Management, and Core Memorization Validation.
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { quranApi } from '../api.js';
import { app } from '../app.js';

export const guruView = {
  selectedClassId: null,
  selectedStudentId: null,

  // ==========================================
  // TAB 1: KELAS & SANTRI (PRD 6.3)
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
          <span class="greeting-role-badge">GURU NGAJI / ASATIDZ</span>
          <h2 class="greeting-name">${guru.nama}</h2>
          <p class="greeting-desc">Kelola kelas tahfidz & catat validasi hafalan santri binaan Anda.</p>
        </div>

        <!-- Class Management Section -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Daftar Kelas Diampu</h3>
            <span style="font-size: 12px; color: var(--text-muted);">${classes.length} Kelas Aktif</span>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-class">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Tambah Kelas</span>
          </button>
        </div>

        <!-- Classes List Cards -->
        <div class="class-list-container">
          ${classes.length > 0 ? classes.map(cls => {
            const students = store.getStudentsInClass(cls.id);
            // Calculate average progress of class
            let avgProgress = 0;
            if (students.length > 0) {
              const totalPct = students.reduce((sum, s) => {
                const prog = store.calculateStudentProgress(s.id);
                return sum + prog.juz30Percentage;
              }, 0);
              avgProgress = (totalPct / students.length).toFixed(1);
            }

            return `
              <div class="class-card">
                <div class="class-card-top">
                  <div>
                    <h4 class="class-name">${cls.nama_kelas}</h4>
                    <div class="class-meta">Kelas Tahfidz • Dibuat: ${cls.dibuat_pada}</div>
                  </div>
                  <button class="btn btn-secondary btn-icon btn-sm btn-delete-class" data-class-id="${cls.id}" title="Hapus Kelas">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                  <span>Santri Terdaftar: <strong>${students.length} Santri</strong></span>
                  <span style="font-weight: 700; color: var(--color-primary);">Rata-rata: ${avgProgress}%</span>
                </div>

                <div class="progress-bar-track" style="margin-bottom: 14px;">
                  <div class="progress-bar-fill" style="width: ${avgProgress}%"></div>
                </div>

                <button class="btn btn-secondary btn-sm btn-open-class" data-class-id="${cls.id}" style="width: 100%; justify-content: space-between;">
                  <span>Buka Kelas & Daftar Santri</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            `;
          }).join('') : `
            <div class="card" style="text-align: center; padding: 40px 20px;">
              <div style="font-size: 36px; margin-bottom: 10px;">🏫</div>
              <p style="font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">Belum Ada Kelas</p>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Klik tombol di atas untuk membuat kelas tahfidz baru.</p>
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
            <span>Tambah Santri</span>
          </button>
        </div>

        <!-- Class Header Info -->
        <div class="card" style="margin-bottom: 16px; background-color: var(--color-primary-soft); border-color: rgba(46, 134, 222, 0.25);">
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${cls.nama_kelas}</h2>
          <p style="font-size: 12px; color: var(--text-muted);">${students.length} Santri Terdaftar di Kelas Ini</p>
        </div>

        <!-- Students List (PRD 6.3: Lihat daftar santri dengan indikator progress & tombol validasi) -->
        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Daftar Santri Kelas</span>
          <span style="font-size: 12px; color: var(--text-muted);">Pilih santri untuk validasi hafalan</span>
        </div>

        <div class="students-list">
          ${students.length > 0 ? students.map(st => {
            const prog = store.calculateStudentProgress(st.id);
            return `
              <div class="student-list-item">
                <div class="student-avatar">${st.nama.charAt(0)}</div>
                <div class="student-info">
                  <div class="student-name">${st.nama}</div>
                  <div class="student-sub">
                    ${prog.juz30Verses}/564 Ayat Hafal • <strong>${prog.juz30Percentage}%</strong> (Juz 30)
                  </div>
                  <div class="progress-bar-track" style="height: 5px; margin-top: 6px;">
                    <div class="progress-bar-fill" style="width: ${prog.juz30Percentage}%"></div>
                  </div>
                </div>

                <div style="display: flex; gap: 6px; margin-left: 10px;">
                  <button class="btn btn-primary btn-sm btn-validate-student" data-student-id="${st.id}" data-student-name="${st.nama}" title="Validasi Hafalan">
                    <span>Centang</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button class="btn btn-secondary btn-icon btn-sm btn-remove-student" data-student-id="${st.id}" data-student-name="${st.nama}" title="Keluarkan dari kelas">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="card" style="text-align: center; padding: 30px; color: var(--text-muted);">
              Belum ada santri terdaftar di kelas ini.<br>
              Klik tombol "Tambah Santri" untuk memasukkan santri ke kelas.
            </div>
          `}
        </div>
      </div>
    `;
  },

  initClassesEvents() {
    // Open Class Detail
    document.querySelectorAll('.btn-open-class').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedClassId = btn.dataset.classId;
        app.render();
      });
    });

    // Back to classes
    const backBtn = document.getElementById('btn-back-to-classes');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.selectedClassId = null;
        app.render();
      });
    }

    // Add Class Modal Trigger
    const addClassBtn = document.getElementById('btn-add-class');
    if (addClassBtn) {
      addClassBtn.addEventListener('click', () => {
        this.showAddClassModal();
      });
    }

    // Delete Class
    document.querySelectorAll('.btn-delete-class').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = btn.dataset.classId;
        const cls = store.getClassById(cid);
        const students = store.getStudentsInClass(cid);

        if (students.length > 0) {
          alert(`Tidak dapat menghapus kelas "${cls.nama_kelas}". Masih ada ${students.length} santri terdaftar di kelas ini.`);
          return;
        }

        if (confirm(`Yakin ingin menghapus kelas "${cls.nama_kelas}"?`)) {
          store.deleteClass(cid);
          app.showToast('Kelas berhasil dihapus', 'info');
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

    // Remove Student from Class
    document.querySelectorAll('.btn-remove-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.studentId;
        const sname = btn.dataset.studentName;
        if (confirm(`Keluarkan ${sname} dari kelas ini? Data riwayat hafalan santri akan tetap aman.`)) {
          store.removeStudentFromClass(sid, this.selectedClassId);
          app.showToast(`${sname} dikeluarkan dari kelas`, 'info');
          app.render();
        }
      });
    });

    // Validate Student Trigger
    document.querySelectorAll('.btn-validate-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.studentId;
        this.showValidationSheet(sid);
      });
    });
  },

  // ==========================================
  // FITUR INTI: VALIDASI HAFALAN (PRD 6.3)
  // ==========================================
  async showValidationSheet(studentId) {
    const student = store.getUserById(studentId);
    if (!student) return;

    let surahList = [];
    try {
      surahList = await quranApi.getAllSurah();
    } catch (e) {
      surahList = [];
    }

    // Automatically find the first uncompleted surah for this student in Juz 30 (from 114 down to 78, or from 1 to 114)
    let initialSurahNum = 114;
    for (let n = 114; n >= 1; n--) {
      const s = surahList.find(item => item.nomor === n);
      if (s) {
        const isDone = store.isSurahCompleted(studentId, s.nomor, s.jumlahAyat);
        if (!isDone) {
          initialSurahNum = s.nomor;
          break;
        }
      }
    }

    let hideCompleted = true;
    let currentSurahNum = initialSurahNum;
    let currentSurahDetail = await quranApi.getSurahDetail(currentSurahNum);

    const getSurahOptionsHtml = (hide) => {
      let filtered = surahList;
      if (hide) {
        filtered = surahList.filter(s => !store.isSurahCompleted(studentId, s.nomor, s.jumlahAyat));
        // If all filtered out, show all
        if (filtered.length === 0) filtered = surahList;
      }

      return filtered.map(s => {
        const memCount = store.getSurahMemorizedCount(studentId, s.nomor);
        const isDone = memCount >= s.jumlahAyat;
        const tag = isDone ? ' [✓ Lunas]' : memCount > 0 ? ` [${memCount}/${s.jumlahAyat} Hafal]` : '';
        return `
          <option value="${s.nomor}" ${s.nomor === currentSurahNum ? 'selected' : ''}>
            ${s.nomor}. ${s.namaLatin} (${s.jumlahAyat} Ayat)${tag}
          </option>
        `;
      }).join('');
    };

    const sheetContent = `
      <div style="padding: 10px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">Validasi Setoran Hafalan</div>
            <div style="font-size: 16px; font-weight: 800; color: var(--text-dark);">${student.nama}</div>
          </div>
          <span class="badge badge-primary">Kelas: ${student.kelas_nama || 'Santri'}</span>
        </div>

        <!-- Surah Selector with Hide Completed Filter -->
        <div class="form-group">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <label class="form-label" style="margin-bottom: 0;">Pilih Surat Al-Qur'an</label>
            <label style="font-size: 11px; color: var(--color-primary); cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 600;">
              <input type="checkbox" id="chk-hide-completed" ${hideCompleted ? 'checked' : ''} style="accent-color: var(--color-primary);">
              <span>Sembunyikan yang sudah lunas</span>
            </label>
          </div>
          <select id="val-surah-select" class="form-select">
            ${getSurahOptionsHtml(hideCompleted)}
          </select>
        </div>

        <!-- Dynamic Ayat Checklist Box -->
        <div id="val-ayat-checkbox-container" style="max-height: 220px; overflow-y: auto; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; margin-bottom: 14px; background-color: #FAFCFF;">
          ${this.renderAyatCheckboxes(currentSurahDetail, studentId)}
        </div>

        <!-- Teacher Notes -->
        <div class="form-group">
          <label class="form-label">Catatan Guru (Opsional)</label>
          <textarea id="val-teacher-notes" class="form-textarea" rows="2" placeholder="Contoh: Bacaan lancar dan fasih."></textarea>
        </div>

        <!-- Submit Button -->
        <button type="button" class="btn btn-success btn-lg" id="btn-submit-validation" style="width: 100%;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span id="btn-submit-text">Simpan Hafalan Santri</span>
        </button>
      </div>
    `;

    app.showBottomSheet('Form Setoran Hafalan', sheetContent);

    // Event handlers for validation sheet
    const surahSelect = document.getElementById('val-surah-select');
    const ayatContainer = document.getElementById('val-ayat-checkbox-container');
    const hideCheckbox = document.getElementById('chk-hide-completed');

    const updateAyatBox = async (sNum) => {
      currentSurahNum = sNum;
      ayatContainer.innerHTML = '<div style="text-align: center; padding: 16px; color: var(--text-muted);">Memuat ayat...</div>';
      currentSurahDetail = await quranApi.getSurahDetail(sNum);
      ayatContainer.innerHTML = this.renderAyatCheckboxes(currentSurahDetail, studentId);
      this.attachAyatBoxListeners(currentSurahDetail, studentId, surahSelect, updateAyatBox);
    };

    if (hideCheckbox && surahSelect) {
      hideCheckbox.addEventListener('change', (e) => {
        hideCompleted = e.target.checked;
        surahSelect.innerHTML = getSurahOptionsHtml(hideCompleted);
        const firstAvailable = parseInt(surahSelect.value);
        if (firstAvailable) {
          updateAyatBox(firstAvailable);
        }
      });
    }

    if (surahSelect) {
      surahSelect.addEventListener('change', (e) => {
        const sNum = parseInt(e.target.value);
        updateAyatBox(sNum);
      });
    }

    this.attachAyatBoxListeners(currentSurahDetail, studentId, surahSelect, updateAyatBox);

    const submitBtn = document.getElementById('btn-submit-validation');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const sNum = parseInt(surahSelect.value);
        const checkedAyat = Array.from(document.querySelectorAll('.val-ayat-cb:checked')).map(cb => parseInt(cb.value));
        const notes = (document.getElementById('val-teacher-notes')?.value || '').trim();

        if (checkedAyat.length === 0) {
          alert('Pilih minimal satu ayat yang baru disetorkan!');
          return;
        }

        const guru = auth.getCurrentUser();
        const selectedSurahText = surahSelect.options[surahSelect.selectedIndex]?.text || '';
        const surahNameLatin = currentSurahDetail?.namaLatin || `Surat ${sNum}`;

        const res = store.saveValidation({
          santriId: studentId,
          nomorSurat: sNum,
          namaSurat: surahNameLatin,
          ayatList: checkedAyat,
          guruId: guru.id,
          catatan: notes
        });

        const isNowCompleted = store.isSurahCompleted(studentId, sNum, currentSurahDetail.jumlahAyat);

        app.closeBottomSheet();

        if (isNowCompleted) {
          app.showToast(`🎉 Alhamdulillah! Surat ${surahNameLatin} selesai lunas dihafal oleh ${student.nama}!`, 'success');
        } else {
          app.showToast(`✓ Berhasil mencatat ${checkedAyat.length} ayat Surat ${surahNameLatin} untuk ${student.nama}`, 'success');
        }

        app.render();
      });
    }
  },

  attachAyatBoxListeners(surahDetail, studentId, surahSelect, updateAyatBoxCallback) {
    const checkAllBtn = document.getElementById('btn-val-check-all');
    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.val-ayat-cb').forEach(cb => cb.checked = true);
      });
    }

    const uncheckAllBtn = document.getElementById('btn-val-uncheck-all');
    if (uncheckAllBtn) {
      uncheckAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.val-ayat-cb').forEach(cb => cb.checked = false);
      });
    }

    const nextBtn = document.getElementById('btn-switch-next-surah');
    if (nextBtn && surahSelect) {
      nextBtn.addEventListener('click', () => {
        // Switch to the next uncompleted option in the dropdown
        for (let i = 0; i < surahSelect.options.length; i++) {
          const optVal = parseInt(surahSelect.options[i].value);
          if (optVal !== surahDetail.nomor) {
            surahSelect.selectedIndex = i;
            updateAyatBoxCallback(optVal);
            break;
          }
        }
      });
    }
  },

  renderAyatCheckboxes(surahDetail, studentId) {
    if (!surahDetail || !surahDetail.ayat) {
      return '<div style="text-align: center; color: var(--text-muted);">Data ayat tidak tersedia.</div>';
    }

    const memorizedCount = store.getSurahMemorizedCount(studentId, surahDetail.nomor);
    const isCompleted = memorizedCount >= surahDetail.jumlahAyat;

    // If 100% completed, show celebration banner & next button
    if (isCompleted) {
      return `
        <div style="background-color: var(--color-success-bg); border: 1.5px solid var(--color-success); border-radius: var(--radius-md); padding: 16px 12px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 4px;">🎉</div>
          <div style="font-size: 15px; font-weight: 800; color: var(--color-success-text); margin-bottom: 4px;">
            Surat ${surahDetail.namaLatin} Sudah 100% Lunas Dihafal!
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
            Seluruh ${surahDetail.jumlahAyat} ayat telah divalidasi dan tersimpan di sistem.
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btn-switch-next-surah" style="margin: 0 auto; display: inline-flex;">
            <span>Lanjut ke Surat Belum Lunas</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
      `;
    }

    const unmemorizedAyat = surahDetail.ayat.filter(a => !store.isVerseMemorized(studentId, surahDetail.nomor, a.nomorAyat));
    const alreadyMemorizedAyat = surahDetail.ayat.filter(a => store.isVerseMemorized(studentId, surahDetail.nomor, a.nomorAyat));

    return `
      <!-- Toolbar Select Range -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; background-color: var(--color-primary-soft); padding: 8px 12px; border-radius: var(--radius-sm);">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">
          Sisa ${unmemorizedAyat.length} dari ${surahDetail.jumlahAyat} Ayat
        </span>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-val-check-all" style="padding: 4px 8px; font-size: 11px;">Pilih Sisa</button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-val-uncheck-all" style="padding: 4px 8px; font-size: 11px;">Batal</button>
        </div>
      </div>

      <!-- Unmemorized Verses Checkboxes -->
      <div style="margin-bottom: 6px; font-size: 11.5px; font-weight: 700; color: var(--text-dark);">
        Ayat yang Baru Disetorkan:
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;">
        ${unmemorizedAyat.map(a => `
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 8px 10px; border-radius: 8px; background-color: #FFFFFF; border: 1.5px solid var(--border-color); cursor: pointer; transition: all 0.2s ease;">
            <input type="checkbox" class="val-ayat-cb" value="${a.nomorAyat}" style="width: 17px; height: 17px; accent-color: var(--color-primary);">
            <span style="font-weight: 600; color: var(--text-dark);">Ayat ${a.nomorAyat}</span>
          </label>
        `).join('')}
      </div>

      <!-- Already Memorized Verses (Tagged and info) -->
      ${alreadyMemorizedAyat.length > 0 ? `
        <div style="padding: 8px 10px; background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-sm); font-size: 11px; color: var(--color-success-text); display: flex; align-items: center; gap: 6px;">
          <span>✓</span>
          <span>Ayat yang sudah hafal sebelumnya: <strong>${alreadyMemorizedAyat.map(a => a.nomorAyat).join(', ')}</strong></span>
        </div>
      ` : ''}
    `;
  },

  // Modals for adding class & adding student to class
  showAddClassModal() {
    const content = `
      <form id="form-create-class" style="padding: 10px 0;">
        <div class="form-group">
          <label class="form-label">Nama Kelas Baru</label>
          <input type="text" id="new-class-name" class="form-input" placeholder="Contoh: 3A atau 3B" required>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 10px;">
          Buat Kelas Baru
        </button>
      </form>
    `;

    app.showBottomSheet('Tambah Kelas Tahfidz', content);

    const form = document.getElementById('form-create-class');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('new-class-name').value.trim();
        const guru = auth.getCurrentUser();

        if (nama) {
          store.addClass({
            nama_kelas: nama,
            guru_id: guru.id
          });
          app.closeBottomSheet();
          app.showToast(`Kelas "${nama}" berhasil dibuat`, 'success');
          app.render();
        }
      });
    }
  },

  showAddStudentModal(classId) {
    const cls = store.getClassById(classId);
    if (!cls) return;

    // Filter santri: HANYA santri yang terdaftar di kelas ini (kelas_nama sama dengan nama kelas)
    // dan belum dimasukkan ke daftar aktif kelas ini. Santri dari kelas lain tidak boleh muncul!
    const allSantri = store.getUsersByRole('santri').filter(s => s.status_aktif);
    const existingInClass = store.getStudentsInClass(classId).map(s => s.id);
    const availableSantri = allSantri.filter(s => {
      if (existingInClass.includes(s.id)) return false;
      return s.kelas_nama && s.kelas_nama.toLowerCase() === cls.nama_kelas.toLowerCase();
    });

    const content = `
      <div style="padding: 10px 0;">
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
          Pilih santri dari <strong>Kelas ${cls.nama_kelas}</strong> untuk ditambahkan:
        </p>

        ${availableSantri.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; margin-bottom: 14px;">
            ${availableSantri.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #FFFFFF;">
                <div>
                  <div style="font-size: 14px; font-weight: 700; color: var(--text-dark);">${s.nama}</div>
                  <div style="font-size: 12px; color: var(--text-muted);">@${s.username} • Kelas: ${s.kelas_nama}</div>
                </div>
                <button class="btn btn-primary btn-sm btn-select-student-add" data-student-id="${s.id}">
                  Tambahkan
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="card" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px; margin-bottom: 14px;">
            Tidak ada santri baru dari kelas <strong>${cls.nama_kelas}</strong> yang belum dimasukkan.<br>
            <span style="font-size: 11px; color: var(--color-primary); margin-top: 4px; display: inline-block;">
              Santri dari kelas lain tidak muncul pada kelas ini.
            </span>
          </div>
        `}
      </div>
    `;

    app.showBottomSheet(`Tambah Santri - Kelas ${cls.nama_kelas}`, content);

    document.querySelectorAll('.btn-select-student-add').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.studentId;
        store.addStudentToClass(sid, classId);
        app.closeBottomSheet();
        app.showToast('Santri berhasil ditambahkan ke kelas', 'success');
        app.render();
      });
    });
  },

  // ==========================================
  // TAB 2: RIWAYAT VALIDASI
  // ==========================================
  renderHistory() {
    const guru = auth.getCurrentUser();
    const allHistory = store.data.riwayat_setoran.filter(rw => rw.guru_id === guru.id);

    return `
      <div class="animate-fade" style="padding: 16px;">
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Riwayat Validasi</h2>
          <p style="font-size: 12.5px; color: var(--text-muted);">Catatan setoran santri yang Anda validasi.</p>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Log Validasi</span>
            <span class="badge badge-primary">${allHistory.length} Setoran</span>
          </div>

          ${allHistory.length > 0 ? `
            <div class="timeline-container">
              ${allHistory.map(item => {
                const st = store.getUserById(item.santri_id);
                return `
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-header">
                      <span class="timeline-surah">${st ? st.nama : 'Santri'} — Surat ${item.namaSurat} (${item.ayatMulai}-${item.ayatSelesai})</span>
                      <span class="badge badge-success">✓ Sah</span>
                    </div>
                    <div class="timeline-date">🗓️ ${item.tanggal} • ${item.totalAyat} Ayat</div>
                    ${item.catatan ? `
                      <div class="timeline-teacher-note">
                        💬 "${item.catatan}"
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
              Belum ada riwayat validasi hafalan yang Anda catat.
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ==========================================
  // TAB 3: PROFIL GURU
  // ==========================================
  renderProfile() {
    const guru = auth.getCurrentUser();
    const myClasses = store.getClasses(guru.id);

    return `
      <div class="animate-fade" style="padding: 16px;">
        <div class="card" style="margin-bottom: 16px; text-align: center; padding: 24px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%); color: #FFFFFF; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 8px 20px rgba(46, 134, 222, 0.3);">
            ${guru.nama.charAt(0)}
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${guru.nama}</h2>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">@${guru.username}</div>
          <span class="badge badge-primary">Peran: Guru Ngaji / Asatidz</span>

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

        <button class="btn btn-danger btn-lg" id="btn-guru-logout" style="width: 100%;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Keluar dari Akun Guru</span>
        </button>
      </div>
    `;
  },

  initProfileEvents() {
    const logoutBtn = document.getElementById('btn-guru-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.logout();
        app.navigate('login');
        app.showToast('Anda telah keluar dari akun.', 'info');
      });
    }
  }
};
