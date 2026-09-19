/**
 * TAHFIDZ TRACKER - SANTRI VIEW (PRD v2)
 * Comprehensive Santri Experience: Home, Quran, Progress (30 Juz & Timeline), Profil.
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { quranApi, RECITERS } from '../api.js';
import { audioManager } from '../audio.js';
import { app } from '../app.js';

export const santriView = {
  // ==========================================
  // TAB 1: HOME
  // ==========================================
  renderHome() {
    const user = auth.getCurrentUser();
    const progress = store.calculateStudentProgress(user.id);
    const setoranHistory = store.getStudentSetoranHistory(user.id);
    const latestSetoran = setoranHistory.length > 0 ? setoranHistory[0] : null;
    const studentClass = store.getStudentClass(user.id);

    // Circle stroke dash calculations
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress.juz30Percentage / 100) * circumference;

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Greeting Header -->
        <div class="hero-greeting-card">
          <span class="greeting-role-badge">SANTRI TAHFIDZ</span>
          <h2 class="greeting-name">Assalamu'alaikum, ${user.nama.split(' ')[0]} 👋</h2>
          <p class="greeting-desc">${studentClass ? studentClass.nama_kelas : 'Belum Terdaftar Kelas'} • Target: Juz ${user.target_juz || 30}</p>
        </div>

        <!-- Overall Progress Card (PRD 6.2) -->
        <div class="overall-progress-card">
          <div class="overall-progress-row">
            <div class="progress-circle-wrapper">
              <svg class="progress-circle-svg" viewBox="0 0 88 88">
                <circle class="progress-circle-bg" cx="44" cy="44" r="${radius}"></circle>
                <circle class="progress-circle-val" cx="44" cy="44" r="${radius}" 
                  stroke-dasharray="${circumference}" 
                  stroke-dashoffset="${strokeDashoffset}"></circle>
              </svg>
              <div class="progress-circle-text">${progress.juz30Percentage}%</div>
            </div>

            <div class="progress-stats-col">
              <div class="progress-stats-title">Hafalan Juz ${user.target_juz || 30}</div>
              <div class="progress-stats-sub">${progress.juz30Verses} dari 564 Ayat Disetorkan</div>
              
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${progress.juz30Percentage}%"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                <span>Total 30 Juz: <strong>${progress.overallPercentage}%</strong></span>
                <span>${progress.totalAyatHafal} / 6.236 Ayat</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Grid (PRD 6.2) -->
        <div class="quick-stats-grid">
          <div class="stat-box">
            <div class="stat-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <div>
              <div class="stat-num">${progress.totalAyatHafal}</div>
              <div class="stat-label">Ayat Hafal</div>
            </div>
          </div>

          <div class="stat-box">
            <div class="stat-icon-wrapper success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <div class="stat-num">${progress.completedSurahsCount}</div>
              <div class="stat-label">Surat Aktif</div>
            </div>
          </div>
        </div>

        <!-- Quick Action Row -->
        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Akses Cepat Murojaah</div>
        <div class="quick-action-row">
          <button class="quick-action-btn" id="btn-quick-quran">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Baca Al-Quran</span>
          </button>
          <button class="quick-action-btn" id="btn-quick-target">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>Murojaah Mandiri</span>
          </button>
          <button class="quick-action-btn" id="btn-quick-murottal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Simak Audio</span>
          </button>
        </div>

        <!-- Latest Validated Setoran -->
        <div class="card" style="margin-top: 14px;">
          <div class="card-header">
            <span class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Setoran Terakhir
            </span>
            <button class="btn btn-secondary btn-sm" id="btn-view-all-history">Semua Riwayat</button>
          </div>

          ${latestSetoran ? `
            <div style="background-color: var(--bg-page); border-radius: var(--radius-md); padding: 12px; border: 1px solid var(--border-light);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 14px; font-weight: 700; color: var(--text-dark);">Surat ${latestSetoran.namaSurat} (Ayat ${latestSetoran.ayatMulai}-${latestSetoran.ayatSelesai})</span>
                <span class="badge badge-success">✓ Divalidasi</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
                🗓️ ${latestSetoran.tanggal} • Dicentang oleh: <strong>${latestSetoran.guruNama}</strong>
              </div>
              ${latestSetoran.catatan ? `
                <div class="timeline-teacher-note" style="margin-top: 6px;">
                  💬 <em>"${latestSetoran.catatan}"</em>
                </div>
              ` : ''}
            </div>
          ` : `
            <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">
              Belum ada riwayat setoran hafalan yang divalidasi guru.
            </div>
          `}
        </div>
      </div>
    `;
  },

  initHomeEvents() {
    const quranBtn = document.getElementById('btn-quick-quran');
    if (quranBtn) quranBtn.addEventListener('click', () => app.navigate('quran'));

    const historyBtn = document.getElementById('btn-view-all-history');
    if (historyBtn) historyBtn.addEventListener('click', () => app.navigate('progress'));

    const targetBtn = document.getElementById('btn-quick-target');
    if (targetBtn) {
      targetBtn.addEventListener('click', () => {
        app.navigate('quran');
        setTimeout(() => app.openSurahDetail(114), 100);
      });
    }

    const audioBtn = document.getElementById('btn-quick-murottal');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        app.navigate('quran');
        setTimeout(() => app.openSurahDetail(114), 100);
      });
    }
  },

  // ==========================================
  // TAB 2: QURAN
  // ==========================================
  async renderQuran() {
    return `
      <div class="animate-fade">
        <!-- Prominent Search Bar (PRD 5.4 & 6.2) -->
        <div class="search-box-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="quran-search-input" class="search-input" placeholder="Cari surat (contoh: An-Nas, Al-Kahf, 18)...">
            <button type="button" id="quran-search-clear" class="search-clear-btn">&times;</button>
          </div>
        </div>

        <!-- Filter Pills Row -->
        <div class="filter-pills-row">
          <button class="filter-pill active" data-filter="all">Semua Surat (114)</button>
          <button class="filter-pill" data-filter="juz30">Juz 30 (An-Naba - An-Nas)</button>
          <button class="filter-pill" data-filter="juz29">Juz 29 (Al-Mulk - Al-Mursalat)</button>
          <button class="filter-pill" data-filter="makkiyyah">Makkiyyah</button>
          <button class="filter-pill" data-filter="madaniyyah">Madaniyyah</button>
        </div>

        <!-- Surah List Container -->
        <div id="surah-list-wrapper" class="surah-list">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div style="font-size: 28px; margin-bottom: 8px;">⏳</div>
            Memuat daftar surat Al-Qur'an...
          </div>
        </div>
      </div>
    `;
  },

  async initQuranEvents() {
    const listWrapper = document.getElementById('surah-list-wrapper');
    const searchInput = document.getElementById('quran-search-input');
    const clearBtn = document.getElementById('quran-search-clear');
    const filterPills = document.querySelectorAll('.filter-pill');

    let allSurahs = [];
    try {
      allSurahs = await quranApi.getAllSurah();
      this.renderSurahCards(allSurahs, listWrapper);
    } catch (e) {
      if (listWrapper) {
        listWrapper.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--color-danger);">Gagal memuat surat. Periksa jaringan internet.</div>`;
      }
      return;
    }

    let activeFilter = 'all';

    const filterAndRender = () => {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      let filtered = allSurahs;

      // Filter by category
      if (activeFilter === 'juz30') {
        filtered = filtered.filter(s => s.nomor >= 78 && s.nomor <= 114);
      } else if (activeFilter === 'juz29') {
        filtered = filtered.filter(s => s.nomor >= 67 && s.nomor <= 77);
      } else if (activeFilter === 'makkiyyah') {
        filtered = filtered.filter(s => (s.tempatTurun || '').toLowerCase().includes('mekah'));
      } else if (activeFilter === 'madaniyyah') {
        filtered = filtered.filter(s => (s.tempatTurun || '').toLowerCase().includes('madinah'));
      }

      // Search query
      if (q) {
        if (clearBtn) clearBtn.style.display = 'flex';
        filtered = filtered.filter(s => 
          s.namaLatin.toLowerCase().includes(q) || 
          s.nomor.toString() === q ||
          (s.arti && s.arti.toLowerCase().includes(q))
        );
      } else {
        if (clearBtn) clearBtn.style.display = 'none';
      }

      this.renderSurahCards(filtered, listWrapper);
    };

    if (searchInput) {
      searchInput.addEventListener('input', filterAndRender);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        filterAndRender();
        searchInput.focus();
      });
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.dataset.filter;
        filterAndRender();
      });
    });
  },

  renderSurahCards(surahs, container) {
    if (!container) return;
    if (!surahs || surahs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          Tidak ada surat yang cocok dengan pencarian Anda.
        </div>
      `;
      return;
    }

    const user = auth.getCurrentUser();
    const memorizedVerses = user ? store.getStudentMemorizedVerses(user.id) : [];

    const html = surahs.map(s => {
      // Calculate how many verses memorized in this surah
      const countInSurah = memorizedVerses.filter(m => m.nomorSurat === s.nomor).length;
      const isCompleted = countInSurah > 0 && countInSurah >= s.jumlahAyat;

      return `
        <div class="surah-card" data-surah-num="${s.nomor}">
          <div class="surah-card-left">
            <div class="surah-number-badge">${s.nomor}</div>
            <div class="surah-info-group">
              <div class="surah-name-latin">${s.namaLatin}</div>
              <div class="surah-meta-text">
                <span>${s.tempatTurun}</span>
                <span class="surah-meta-dot"></span>
                <span>${s.jumlahAyat} Ayat</span>
                ${countInSurah > 0 ? `
                  <span class="surah-meta-dot"></span>
                  <span style="color: var(--color-success); font-weight: 700;">${isCompleted ? '✓ Khatam' : `${countInSurah}/${s.jumlahAyat} Hafal`}</span>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="surah-card-right">
            <div class="surah-name-arabic">${s.nama || ''}</div>
            <div style="font-size: 11px; color: var(--text-subtle);">${s.arti || ''}</div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Attach click events
    container.querySelectorAll('.surah-card').forEach(card => {
      card.addEventListener('click', () => {
        const num = parseInt(card.dataset.surahNum);
        app.openSurahDetail(num);
      });
    });
  },

  // ==========================================
  // SURAH DETAIL & AYAT VIEWER
  // ==========================================
  async renderSurahDetailView(surahNumber) {
    const user = auth.getCurrentUser();
    const settings = store.data.settings;

    let surah = null;
    try {
      surah = await quranApi.getSurahDetail(surahNumber);
    } catch (e) {
      return `
        <div style="padding: 20px; text-align: center;">
          <p style="color: var(--color-danger);">Gagal memuat detail surat.</p>
          <button class="btn btn-secondary btn-sm" id="btn-back-to-quran">Kembali</button>
        </div>
      `;
    }

    if (!surah) return `<div>Surat tidak ditemukan</div>`;

    const fullAudioUrl = surah.audioFull ? (surah.audioFull[settings.defaultReciter || "05"] || Object.values(surah.audioFull)[0]) : null;

    return `
      <div class="surah-detail-container animate-fade">
        <!-- Back Navigation & Actions -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <button class="btn btn-secondary btn-sm" id="btn-back-to-surah-list" style="padding: 6px 12px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
            <span>Daftar Surat</span>
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="btn-adjust-font" title="Atur Huruf">
              <span>Aa</span>
            </button>
          </div>
        </div>

        <!-- Banner Card -->
        <div class="surah-banner-card">
          <div class="surah-banner-title">${surah.namaLatin} (${surah.nama})</div>
          <div class="surah-banner-meaning">"${surah.arti}"</div>
          <div class="surah-banner-divider"></div>
          <div class="surah-banner-meta">${surah.tempatTurun} • ${surah.jumlahAyat} AYAT • SURAT KE-${surah.nomor}</div>
          
          ${surah.nomor !== 1 && surah.nomor !== 9 ? `
            <div class="bismillah-text">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
          ` : ''}
        </div>

        <!-- Audio Player Controls Toolbar -->
        <div class="surah-audio-controller">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn btn-primary btn-sm" id="btn-play-full-surah" style="border-radius: var(--radius-full);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Putar Full Surat</span>
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Qari:</span>
            <select id="select-surah-reciter" class="reciter-selector">
              ${RECITERS.map(r => `
                <option value="${r.id}" ${(settings.defaultReciter === r.id) ? 'selected' : ''}>${r.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Verses List (PRD 6.2: Teks Arab, Latin, Terjemahan, Audio per ayat) -->
        <div class="verses-list" style="display: flex; flex-direction: column; gap: 14px;">
          ${(surah.ayat || []).map(a => {
            const isMemorized = user ? store.isVerseMemorized(user.id, surah.nomor, a.nomorAyat) : false;
            const verseAudioUrl = a.audio ? (a.audio[settings.defaultReciter || "05"] || Object.values(a.audio)[0]) : null;

            return `
              <div class="verse-card" id="verse-${a.nomorAyat}" data-ayat-num="${a.nomorAyat}">
                <div class="verse-card-header">
                  <div class="verse-number-tag">Ayat ${a.nomorAyat}</div>
                  
                  <div class="verse-action-group">
                    ${isMemorized ? `
                      <span class="badge badge-success">✓ Hafal</span>
                    ` : `
                      <span class="badge" style="background-color: var(--border-light); color: var(--text-muted);">Belum Hafal</span>
                    `}

                    ${verseAudioUrl ? `
                      <button class="btn btn-secondary btn-icon btn-sm btn-play-verse" 
                        data-url="${verseAudioUrl}" 
                        data-surah="${surah.nomor}" 
                        data-surah-name="${surah.namaLatin}"
                        data-ayat="${a.nomorAyat}"
                        title="Putar Ayat ${a.nomorAyat}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- Arabic Verse Text -->
                <div class="verse-arabic-text" style="font-size: ${settings.arabicFontSize || 24}px;">
                  ${a.teksArab}
                </div>

                <!-- Latin Transliteration -->
                ${settings.showLatin ? `
                  <div class="verse-latin-text">${a.teksLatin || ''}</div>
                ` : ''}

                <!-- Translation -->
                ${settings.showTranslation ? `
                  <div class="verse-translation-text">${a.teksIndonesia || ''}</div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  initSurahDetailEvents(surahNumber) {
    const backBtn = document.getElementById('btn-back-to-surah-list');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        app.navigate('quran');
      });
    }

    // Play Verse Audio
    document.querySelectorAll('.btn-play-verse').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        const sNum = parseInt(btn.dataset.surah);
        const sName = btn.dataset.surahName;
        const aNum = parseInt(btn.dataset.ayat);

        audioManager.playTrack({
          type: 'verse',
          surahNumber: sNum,
          surahName: sName,
          ayatNumber: aNum,
          url
        });
      });
    });

    // Play Full Surah
    const playFullBtn = document.getElementById('btn-play-full-surah');
    if (playFullBtn) {
      playFullBtn.addEventListener('click', async () => {
        const surah = await quranApi.getSurahDetail(surahNumber);
        const reciter = store.data.settings.defaultReciter || "05";
        const fullUrl = surah.audioFull ? (surah.audioFull[reciter] || Object.values(surah.audioFull)[0]) : null;
        if (fullUrl) {
          audioManager.playTrack({
            type: 'surah',
            surahNumber: surah.nomor,
            surahName: surah.namaLatin,
            url: fullUrl
          });
        } else {
          app.showToast('Audio full surat tidak tersedia', 'error');
        }
      });
    }

    // Change Reciter
    const reciterSelect = document.getElementById('select-surah-reciter');
    if (reciterSelect) {
      reciterSelect.addEventListener('change', (e) => {
        audioManager.setReciter(e.target.value);
        app.showToast('Qari murottal diubah', 'info');
        app.openSurahDetail(surahNumber);
      });
    }

    // Adjust font modal sheet
    const fontBtn = document.getElementById('btn-adjust-font');
    if (fontBtn) {
      fontBtn.addEventListener('click', () => {
        app.showFontAdjustSheet();
      });
    }
  },

  // ==========================================
  // TAB 3: PROGRESS
  // ==========================================
  renderProgress() {
    const user = auth.getCurrentUser();
    const progress = store.calculateStudentProgress(user.id);
    const history = store.getStudentSetoranHistory(user.id);

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- Header Banner -->
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Peta Hafalan 30 Juz</h2>
          <p style="font-size: 12.5px; color: var(--text-muted);">Pantau status pencapaian per juz Al-Qur'an secara visual.</p>
        </div>

        <!-- 30 Juz Grid (PRD 6.2 Tab Progress) -->
        <div class="juz-grid">
          ${progress.juzProgress.map(j => `
            <div class="juz-card ${j.status}" data-juz-num="${j.juz}">
              <div class="juz-number-label">Juz ${j.juz}</div>
              <div class="juz-percent-badge">${j.percentage}%</div>
              <div class="juz-mini-bar">
                <div class="juz-mini-fill" style="width: ${j.percentage}%"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Chronological Setoran Timeline (PRD 6.2) -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              Riwayat Setoran Hafalan
            </span>
            <span class="badge badge-primary">${history.length} Entri</span>
          </div>

          ${history.length > 0 ? `
            <div class="timeline-container">
              ${history.map(item => `
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-header">
                    <span class="timeline-surah">Surat ${item.namaSurat} (Ayat ${item.ayatMulai}-${item.ayatSelesai})</span>
                    <span class="badge badge-success">✓ ${item.status}</span>
                  </div>
                  <div class="timeline-date">
                    🗓️ ${item.tanggal} • Guru: <strong>${item.guruNama}</strong>
                  </div>
                  ${item.catatan ? `
                    <div class="timeline-teacher-note">
                      💬 Catatan Guru: "${item.catatan}"
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
              Belum ada riwayat setoran tercatat.
            </div>
          `}
        </div>
      </div>
    `;
  },

  initProgressEvents() {
    document.querySelectorAll('.juz-card').forEach(card => {
      card.addEventListener('click', () => {
        const jNum = card.dataset.juzNum;
        if (jNum === "30") {
          app.navigate('quran');
          // Activate Juz 30 filter
          setTimeout(() => {
            const pill = document.querySelector('.filter-pill[data-filter="juz30"]');
            if (pill) pill.click();
          }, 100);
        } else {
          app.showToast(`Menampilkan informasi Juz ${jNum}`, 'info');
        }
      });
    });
  },

  // ==========================================
  // TAB 4: PROFIL
  // ==========================================
  renderProfile() {
    const user = auth.getCurrentUser();
    const studentClass = store.getStudentClass(user.id);
    const settings = store.data.settings;

    return `
      <div class="animate-fade" style="padding: 16px;">
        <!-- User Profile Card -->
        <div class="card" style="margin-bottom: 16px; text-align: center; padding: 24px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%); color: #FFFFFF; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 8px 20px rgba(46, 134, 222, 0.3);">
            ${user.nama.charAt(0)}
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">${user.nama}</h2>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">@${user.username}</div>
          <span class="badge badge-success">Status: Aktif • Peran: Santri</span>

          <div style="margin-top: 18px; border-top: 1px solid var(--border-light); padding-top: 14px; text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted);">Kelas Santri</div>
            <div style="font-size: 15px; font-weight: 800; color: var(--color-primary);">${user.kelas_nama || (studentClass ? studentClass.nama_kelas : 'Belum Ditentukan')}</div>
          </div>
        </div>

        <!-- Settings Card (PRD 6.2) -->
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header">
            <span class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Pengaturan Al-Qur'an
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px;">
                <span>Ukuran Teks Arab</span>
                <span id="font-size-val">${settings.arabicFontSize || 24}px</span>
              </div>
              <input type="range" id="range-font-size" min="18" max="36" step="2" value="${settings.arabicFontSize || 24}" style="width: 100%; accent-color: var(--color-primary);">
              <div class="verse-arabic-text" id="arabic-preview" style="text-align: center; margin-top: 8px; font-size: ${settings.arabicFontSize || 24}px; color: var(--color-primary);">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-light); padding-top: 12px;">
              <label class="form-label">Qari Murottal Default</label>
              <select id="settings-reciter-select" class="form-select">
                ${RECITERS.map(r => `
                  <option value="${r.id}" ${(settings.defaultReciter === r.id) ? 'selected' : ''}>${r.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <button class="btn btn-danger btn-lg" id="btn-santri-logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Keluar dari Akun</span>
        </button>
      </div>
    `;
  },

  initProfileEvents() {
    const rangeFont = document.getElementById('range-font-size');
    const fontVal = document.getElementById('font-size-val');
    const preview = document.getElementById('arabic-preview');

    if (rangeFont) {
      rangeFont.addEventListener('input', (e) => {
        const val = e.target.value;
        if (fontVal) fontVal.textContent = `${val}px`;
        if (preview) preview.style.fontSize = `${val}px`;
        store.updateSettings({ arabicFontSize: parseInt(val) });
      });
    }

    const reciterSelect = document.getElementById('settings-reciter-select');
    if (reciterSelect) {
      reciterSelect.addEventListener('change', (e) => {
        store.updateSettings({ defaultReciter: e.target.value });
        app.showToast('Qari default berhasil disimpan', 'success');
      });
    }

    const logoutBtn = document.getElementById('btn-santri-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        audioManager.stop();
        auth.logout();
        app.navigate('login');
        app.showToast('Anda telah keluar dari akun.', 'info');
      });
    }
  }
};
