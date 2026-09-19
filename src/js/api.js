/**
 * TAHFIDZ TRACKER - QURAN API CLIENT (PRD v2)
 * Integrates with EQuran.id API v2 with offline fallback & caching.
 */

const BASE_URL = 'https://equran.id/api/v2';
const SURAH_CACHE_KEY = 'tahfidz_surah_list_cache';
const SURAH_DETAIL_CACHE_PREFIX = 'tahfidz_surah_detail_';

export const RECITERS = [
  { id: "05", name: "Misyari Rasyid Al-Afasi", slug: "Misyari-Rasyid-Al-Afasi" },
  { id: "01", name: "Abdullah Al-Juhany", slug: "Abdullah-Al-Juhany" },
  { id: "02", name: "Abdul Muhsin Al-Qasim", slug: "Abdul-Muhsin-Al-Qasim" },
  { id: "03", name: "Abdurrahman As-Sudais", slug: "Abdurrahman-as-Sudais" },
  { id: "04", name: "Ibrahim Al-Dossari", slug: "Ibrahim-Al-Dossari" },
  { id: "06", name: "Yasser Al-Dosari", slug: "Yasser-Al-Dosari" }
];

// Offline fallback for 114 surah overview list
const POPULAR_SURAH_SUMMARY = [
  { nomor: 1, nama: "الفاتحة", namaLatin: "Al-Fatihah", jumlahAyat: 7, tempatTurun: "Mekah", arti: "Pembukaan" },
  { nomor: 2, nama: "البقرة", namaLatin: "Al-Baqarah", jumlahAyat: 286, tempatTurun: "Madinah", arti: "Sapi Betina" },
  { nomor: 3, nama: "آل عمران", namaLatin: "Ali 'Imran", jumlahAyat: 200, tempatTurun: "Madinah", arti: "Keluarga Imran" },
  { nomor: 18, nama: "الكهف", namaLatin: "Al-Kahf", jumlahAyat: 110, tempatTurun: "Mekah", arti: "Gua" },
  { nomor: 36, nama: "يس", namaLatin: "Ya-Sin", jumlahAyat: 83, tempatTurun: "Mekah", arti: "Ya Sin" },
  { nomor: 55, nama: "الرحمن", namaLatin: "Ar-Rahman", jumlahAyat: 78, tempatTurun: "Madinah", arti: "Yang Maha Pengasih" },
  { nomor: 56, nama: "الواقعة", namaLatin: "Al-Waqi'ah", jumlahAyat: 96, tempatTurun: "Mekah", arti: "Hari Kiamat" },
  { nomor: 67, nama: "الملك", namaLatin: "Al-Mulk", jumlahAyat: 30, tempatTurun: "Mekah", arti: "Kerajaan" },
  { nomor: 78, nama: "النبإ", namaLatin: "An-Naba'", jumlahAyat: 40, tempatTurun: "Mekah", arti: "Berita Besar" },
  { nomor: 108, nama: "الكوثر", namaLatin: "Al-Kautsar", jumlahAyat: 3, tempatTurun: "Mekah", arti: "Nikmat yang Banyak" },
  { nomor: 109, nama: "الكافرون", namaLatin: "Al-Kafirun", jumlahAyat: 6, tempatTurun: "Mekah", arti: "Orang-Orang Kafir" },
  { nomor: 110, nama: "النصر", namaLatin: "An-Nasr", jumlahAyat: 3, tempatTurun: "Madinah", arti: "Pertolongan" },
  { nomor: 111, nama: "اللهب", namaLatin: "Al-Lahab", jumlahAyat: 5, tempatTurun: "Mekah", arti: "Gejolak Api" },
  { nomor: 112, nama: "الإخلاص", namaLatin: "Al-Ikhlas", jumlahAyat: 4, tempatTurun: "Mekah", arti: "Ikhlas" },
  { nomor: 113, nama: "الفلق", namaLatin: "Al-Falaq", jumlahAyat: 5, tempatTurun: "Mekah", arti: "Waktu Subuh" },
  { nomor: 114, nama: "الناس", namaLatin: "An-Nas", jumlahAyat: 6, tempatTurun: "Mekah", arti: "Manusia" }
];

class QuranAPI {
  constructor() {
    this.surahListCache = null;
    this.surahDetailsCache = {};
  }

  async getAllSurah() {
    if (this.surahListCache && this.surahListCache.length > 0) {
      return this.surahListCache;
    }

    // 1. Try local bundled assets (100% Offline)
    try {
      const localResp = await fetch('./assets/quran/surah-list.json');
      if (localResp.ok) {
        const localData = await localResp.json();
        if (Array.isArray(localData) && localData.length > 0) {
          this.surahListCache = localData;
          return this.surahListCache;
        }
      }
    } catch (e) {
      // Continue to next fallback
    }

    // 2. Check localStorage cache
    try {
      const cached = localStorage.getItem(SURAH_CACHE_KEY);
      if (cached) {
        this.surahListCache = JSON.parse(cached);
        return this.surahListCache;
      }
    } catch (e) {
      console.warn('LocalStorage error on surah list:', e);
    }

    // 3. Fetch from EQuran.id API (Online fallback)
    try {
      const resp = await fetch(`${BASE_URL}/surat`);
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      const json = await resp.json();
      if (json && json.data) {
        this.surahListCache = json.data;
        try {
          localStorage.setItem(SURAH_CACHE_KEY, JSON.stringify(json.data));
        } catch (e) {
          console.warn('Failed to cache surah list:', e);
        }
        return this.surahListCache;
      }
    } catch (err) {
      console.warn('Network fetch failed for surah list, using fallback:', err);
    }

    // Fallback if all fails
    return POPULAR_SURAH_SUMMARY;
  }

  async getSurahDetail(nomorSurat) {
    const key = `${SURAH_DETAIL_CACHE_PREFIX}${nomorSurat}`;

    if (this.surahDetailsCache[nomorSurat]) {
      return this.surahDetailsCache[nomorSurat];
    }

    // 1. Try local bundled JSON file (100% Offline for all 114 Surahs and 6,236 verses)
    try {
      const localResp = await fetch(`./assets/quran/${nomorSurat}.json`);
      if (localResp.ok) {
        const localData = await localResp.json();
        if (localData && localData.ayat) {
          this.surahDetailsCache[nomorSurat] = localData;
          return localData;
        }
      }
    } catch (e) {
      // Continue to next fallback
    }

    // 2. Try localStorage cache
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.surahDetailsCache[nomorSurat] = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage read error for surah detail:', e);
    }

    // 3. Try EQuran.id Network API
    try {
      const resp = await fetch(`${BASE_URL}/surat/${nomorSurat}`);
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      const json = await resp.json();
      if (json && json.data) {
        this.surahDetailsCache[nomorSurat] = json.data;
        try {
          localStorage.setItem(key, JSON.stringify(json.data));
        } catch (e) {
          console.warn('LocalStorage write error for surah detail:', e);
        }
        return json.data;
      }
    } catch (err) {
      console.error(`Failed to fetch surah detail #${nomorSurat}:`, err);
      return this.generateOfflineSurahDetail(nomorSurat);
    }
  }

  generateOfflineSurahDetail(nomorSurat) {
    // Basic offline representation for essential surahs
    if (nomorSurat === 114) {
      return {
        nomor: 114,
        nama: "الناس",
        namaLatin: "An-Nas",
        jumlahAyat: 6,
        tempatTurun: "Mekah",
        arti: "Manusia",
        deskripsi: "Surat An-Nas adalah surat ke-114 dalam Al-Qur'an.",
        audioFull: { "05": "https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/114.mp3" },
        ayat: [
          { nomorAyat: 1, teksArab: "قُلْ اَعُوْذُ بِرَبِّ النَّاسِۙ", teksLatin: "Qul a'ūżu birabbin-nās(i)", teksIndonesia: "Katakanlah, “Aku berlindung kepada Tuhannya manusia,", audio: { "05": "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114001.mp3" } },
          { nomorAyat: 2, teksArab: "مَلِكِ النَّاسِۙ", teksLatin: "Malikin-nās(i)", teksIndonesia: "raja manusia,", audio: { "05": "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114002.mp3" } },
          { nomorAyat: 3, teksArab: "اِلٰهِ النَّاسِۙ", teksLatin: "Ilāhin-nās(i)", teksIndonesia: "sembahan manusia,", audio: { "05": "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114003.mp3" } },
          { nomorAyat: 4, teksArab: "مِنْ شَرِّ الْوَسْوَاسِ ەۙ الْخَنَّاسِۖ", teksLatin: "Min syarril-waswāsil-khannās(i)", teksIndonesia: "dari kejahatan (bisikan) setan yang bersembunyi,", audio: { "05": "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114004.mp3" } },
          { nomorAyat: 5, teksArab: "الَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِۙ", teksLatin: "Allażī yuwaswisu fī ṣudūrin-nās(i)", teksIndonesia: "yang membisikkan (kejahatan) ke dalam dada manusia,", audio: { "05": "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114005.mp3" } },
          { nomorAyat: 6, teksArab: "مِنَ الْجِنَّةِ وَالنَّاسِ ࣖ", teksLatin: "Minal-jinnati wan-nās(i)", teksIndonesia: "dari (golongan) jin dan manusia.”", audio: { "05": "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114006.mp3" } }
        ]
      };
    }
    return null;
  }
}

export const quranApi = new QuranAPI();
