# PRD v2: Aplikasi Hafalan Quran (Tahfidz Tracker)

> Versi ini merevisi v1: perbaikan UI/UX (navigasi, skema warna), penambahan role Developer/Super Admin, dan fitur kelola kelas & santri untuk guru.

## 1. Ringkasan Produk

**Nama produk:** Tahfidz Tracker (nama sementara, bisa diganti)

**Deskripsi singkat:**
Aplikasi Android untuk mencatat dan memantau progress hafalan Al-Quran santri secara digital. Santri menyetorkan hafalan secara langsung (tatap muka) kepada guru ngaji, lalu guru mencatat/mencentang hafalan yang sudah disetor ke dalam aplikasi. Sistem otomatis menghitung dan menampilkan persentase progress hafalan per santri, per juz, dan secara keseluruhan.

**Target pengguna:**
- **Developer/Super Admin**: pengelola teknis sistem (provisioning akun guru & santri)
- **Guru ngaji**: mengelola kelas dan memvalidasi hafalan santri
- **Santri**: menghafal Al-Quran dan memantau progress sendiri

**Masalah yang diselesaikan:**
Pencatatan progress hafalan manual (buku/kertas) sulit dipantau dan mudah hilang. Selain itu, kebutuhan santri untuk membaca/mencari surat sering terhambat oleh navigasi aplikasi yang tidak jelas. Aplikasi ini menggantikan pencatatan manual dengan sistem digital terpusat, serta menghadirkan pengalaman baca Al-Quran yang mudah diakses.

**Platform:** Android (minimal Android 6.0 / API level 23)

**Budget:** Gratis — seluruh stack teknologi menggunakan free tier yang mencukupi untuk skala satu TPQ/lembaga.


## 2. Perubahan Utama dari v1

| Area | v1 | v2 |
|---|---|---|
| Role pengguna | Guru, Murid | **Developer/Super Admin** (baru), Guru, Santri |
| Registrasi akun | Tidak dijelaskan detail | Semua akun (guru & santri) dibuat oleh Developer/Super Admin, tidak ada self-register |
| Switch role di UI | Ada tombol switch Guru/Santri di dashboard | **Dihapus.** Setiap akun hanya punya satu role, login otomatis masuk ke dashboard sesuai role |
| Navigasi utama santri | Satu halaman scroll panjang, fitur baca Quran hanya ikon kecil di pojok atas | **Bottom navigation bar** dengan 4 tab: Home, Quran, Progress, Profil — fitur baca/cari surat jadi tab utama yang mudah dijangkau |
| Skema warna | Hijau tua & emas | **Biru muda & putih** |
| Manajemen kelas (guru) | Guru bisa lihat murid di kelasnya | Guru bisa **tambah kelas, hapus kelas, tambah santri, hapus santri** |


## 3. Peran Pengguna (User Roles)

| Role | Deskripsi | Hak Akses |
|---|---|---|
| **Developer/Super Admin** | Pengelola teknis tertinggi sistem | Buat/nonaktifkan akun guru & santri, lihat seluruh kelas lintas guru, akses penuh ke seluruh data sistem |
| **Guru ngaji** | Mengajar satu atau beberapa kelas tahfidz | Tambah/hapus kelas miliknya, tambah/hapus santri di kelasnya, centang/validasi hafalan, beri catatan, lihat progress santri di kelasnya |
| **Santri** | Peserta program tahfidz | Lihat progress hafalan sendiri, baca/cari surat Al-Quran, lihat riwayat setoran, murojaah mandiri |

**Catatan penting:** Akun Santri dan Guru **tidak bisa mendaftar sendiri** (no self-register). Akun hanya dibuat oleh Developer/Super Admin melalui menu khusus di dalam aplikasi. Tidak ada tombol "switch role" di UI mana pun — satu akun = satu role, ditentukan saat pembuatan akun.

> **Catatan keamanan:** Kredensial akun Developer/Super Admin yang pertama (akun paling awal) dibuat dan disimpan langsung melalui dashboard database backend (misal Supabase Table Editor / Authentication panel), **bukan** melalui form di dalam aplikasi maupun ditulis di dokumen prompt manapun. Ini untuk mencegah kredensial sensitif tersimpan di tempat yang tidak semestinya.


## 4. Struktur Data Referensi Al-Quran

Data referensi statis (tidak berubah):
- 30 Juz, 114 Surat, 6.236 Ayat total, 604 halaman

**Sumber data (gratis, API publik):**
- EQuran.id API (data lokal Indonesia, sudah ada terjemahan & link audio per ayat) — https://equran.id/apidev/v2
- Al-Quran Cloud API — https://alquran.cloud/api

Data ini di-*fetch* sekali lalu disimpan lokal di database aplikasi sebagai tabel referensi.


## 5. Prinsip Desain UI/UX (Wajib Diikuti)

1. **Skema warna**: biru muda sebagai warna primer (contoh: `#2E86DE` untuk elemen aksen/tombol, `#E6F1FB` untuk fill ringan/background kartu), putih (`#FFFFFF`) sebagai warna dasar permukaan/kartu, abu-abu muda (`#F4F9FF`) sebagai latar halaman. Teks gelap (`#0C447C` atau hitam standar) di atas latar terang untuk kontras yang cukup.
2. **Navigasi utama (Santri) memakai Bottom Navigation Bar** dengan 4 tab tetap yang selalu terlihat di bagian bawah layar:
   - **Home**: ringkasan progress, target hafalan, shortcut ke murojaah
   - **Quran**: pencarian & daftar surat untuk dibaca (bukan ikon kecil tersembunyi — ini tab utama yang mudah dijangkau satu ketukan)
   - **Progress**: peta hafalan 30 juz secara detail, riwayat setoran
   - **Profil**: data akun, pengaturan, logout
3. **Tidak ada tombol switch role** di UI manapun. Halaman login menentukan dashboard mana yang muncul berdasarkan role akun.
4. **Fitur yang sering dipakai harus mudah dijangkau** — pencarian surat harus punya search bar yang terlihat jelas di bagian atas tab Quran, bukan disembunyikan di menu lain.
5. **Konsistensi antar role**: Guru dan Developer juga memakai bottom navigation bar dengan tab yang disesuaikan perannya masing-masing (lihat bagian 6.3 dan 6.4).


## 6. Fitur Utama (MVP)

### 6.1 Autentikasi
- Login dengan username/email + password
- Tidak ada form registrasi mandiri untuk guru maupun santri
- Sistem mengarahkan ke dashboard sesuai role begitu login berhasil (tanpa opsi ganti role manual)

### 6.2 Dashboard & Fitur Santri

**Tab Home:**
- Kartu progress keseluruhan (persentase + progress bar)
- Fokus target juz saat ini dengan progress bar terpisah
- Ringkasan angka: total ayat hafal, jumlah surat khatam
- Tombol akses cepat ke murojaah mandiri & simak murottal

**Tab Quran:**
- Search bar di posisi paling atas & mencolok — cari surat berdasarkan nama
- Filter cepat: Semua surat / per Juz / Terakhir dibaca
- Daftar surat menampilkan: nomor surat, nama, tempat turun (Mekah/Madinah), jumlah ayat, juz
- Halaman detail surat: teks Arab per ayat, transliterasi latin, terjemahan Bahasa Indonesia, tombol audio per ayat, tombol dengarkan murottal full surat

**Tab Progress:**
- Peta hafalan 30 juz (grid kartu per juz dengan persentase masing-masing)
- Riwayat setoran kronologis (tanggal, surat/ayat, status, catatan guru jika ada)

**Tab Profil:**
- Data akun santri (nama, kelas, target hafalan)
- Pengaturan aplikasi (contoh: ukuran font Arab, tema)
- Logout

### 6.3 Dashboard & Fitur Guru Ngaji

**Manajemen Kelas:**
- **Tambah kelas** baru (nama kelas, contoh: "Kelas Juz 30 - Pagi")
- **Hapus kelas** (dengan konfirmasi, dan penanganan santri yang masih terdaftar di kelas tersebut — misal harus dipindah dulu)
- Lihat daftar kelas yang diampu beserta jumlah santri & rata-rata progress per kelas

**Manajemen Santri (dalam kelas):**
- **Tambah santri** ke kelas (pilih dari akun yang sudah dibuat Developer, atau isi data dasar untuk diteruskan ke Developer)
- **Hapus santri** dari kelas (santri tidak otomatis terhapus dari sistem, hanya keluar dari kelas tersebut)
- Lihat daftar santri per kelas dengan indikator progress masing-masing, bisa diurutkan

**Validasi Hafalan (Fitur Inti):**
- Pilih santri → pilih surat/ayat yang baru disetorkan → centang status hafalan
- Tambah catatan singkat opsional (contoh: "ayat 5 masih terbata-bata")
- Riwayat validasi tersimpan otomatis dengan tanggal & nama guru yang mencentang

### 6.4 Dashboard & Fitur Developer/Super Admin

**Kelola Akun (fitur wajib MVP):**
- Buat akun baru untuk role Guru (nama, username/email, kelas yang diampu)
- Buat akun baru untuk role Santri (nama, username/email, kelas awal jika sudah ditentukan)
- Reset password akun Guru atau Santri
- Nonaktifkan (bukan hapus permanen) akun yang sudah tidak aktif, untuk menjaga riwayat data tetap ada

**Dashboard ringkas:**
- Jumlah total guru, santri, dan kelas terdaftar di sistem
- Daftar seluruh kelas lintas guru (read-only, untuk pemantauan)


## 7. Fitur Tambahan (Fase Selanjutnya — Nice to Have)

Tidak wajib ada di rilis pertama:

1. Status hafalan bertingkat: belum → sedang dihafal → hafal → lancar/mutqin
2. Reminder murojaah otomatis untuk ayat yang lama tidak diulang
3. Mode hafalan mandiri (sembunyikan teks untuk self-test)
4. Achievement/Badge otomatis ("Khatam Juz 30", dst.)
5. Leaderboard kelas (opsional, dapat dinonaktifkan guru)
6. Notifikasi saat hafalan baru divalidasi guru
7. Export laporan progress ke PDF untuk orang tua
8. Kalender jadwal setor hafalan
9. Role tambahan: Orang tua/wali (read-only, memantau progress anak)
10. Developer: pindahkan santri antar kelas/guru, log aktivitas (audit trail), export backup data sistem, broadcast pengumuman


## 8. Struktur Data / Skema Database (Gambaran)

**users**
- id, nama, username, password_hash, role (developer/guru/santri), status_aktif, dibuat_pada

**kelas**
- id, nama_kelas, guru_id, dibuat_pada, dihapus_pada (soft delete, agar riwayat santri yang pernah di kelas itu tidak hilang)

**santri_kelas** *(tabel penghubung, karena santri bisa keluar-masuk kelas)*
- id, santri_id, kelas_id, tanggal_masuk, tanggal_keluar (nullable)

**ayat_referensi** *(data statis dari API Quran)*
- id, nomor_juz, nomor_surat, nama_surat, nomor_ayat, teks_arab, teks_latin, teks_terjemahan, nomor_halaman, url_audio

**progress_hafalan**
- id, santri_id, ayat_id, status (belum/hafal), tanggal_setor, dicentang_oleh (guru_id), catatan

**riwayat_setoran**
- id, santri_id, ayat_id atau surat_id, tanggal, status_saat_itu, guru_id, catatan


## 9. Rekomendasi Teknis (Stack — Gratis)

| Komponen | Rekomendasi | Alasan |
|---|---|---|
| **Frontend/App** | Flutter (Dart) | Cross-platform, gratis, build APK tanpa wajib publish Play Store |
| **Backend & Database** | Supabase (free tier) | PostgreSQL + Authentication + Row Level Security (cocok membedakan akses Developer/Guru/Santri) |
| **Data referensi Quran** | EQuran.id API atau Al-Quran Cloud API | Gratis, ada terjemahan & audio Bahasa Indonesia |
| **Notifikasi (fase lanjutan)** | Firebase Cloud Messaging (free tier) | Bisa dipakai bersamaan dengan Supabase |
| **Distribusi aplikasi** | Build APK manual (gratis) | Tidak wajib publish ke Play Store |

**Row Level Security (RLS) — penting untuk 3 role:**
- Developer: akses baca/tulis penuh ke semua tabel
- Guru: akses baca/tulis hanya ke kelas & santri yang berelasi dengan `guru_id` miliknya
- Santri: akses baca hanya ke data progress miliknya sendiri, tidak bisa menulis/mengubah status hafalan


## 10. Alur Penggunaan Utama (User Flow)

**Alur pembuatan akun baru:**
1. Developer login ke aplikasi.
2. Developer membuka menu "Kelola Akun" → pilih "Tambah Guru" atau "Tambah Santri".
3. Developer mengisi data dasar (nama, username, password awal).
4. Sistem membuat akun; guru/santri menerima username & password untuk login pertama kali.

**Alur setor hafalan:**
1. Santri menyetorkan hafalan langsung (tatap muka) ke guru.
2. Guru membuka aplikasi → pilih kelas → pilih santri.
3. Guru memilih surat/ayat yang baru disetorkan, mencentang status "sudah hafal".
4. Sistem otomatis memperbarui persentase progress santri tersebut.
5. Santri login dan melihat progress terbaru di tab Home/Progress.

**Alur mencari & membaca surat (santri):**
1. Santri membuka tab "Quran" dari bottom navigation (satu ketukan, selalu terlihat).
2. Santri mengetik nama surat di search bar, atau memfilter per Juz.
3. Santri memilih surat dari daftar, membaca teks Arab, terjemahan, atau memutar audio.


## 11. Batasan & Asumsi

- Aplikasi tidak melakukan validasi hafalan otomatis (misal pengenalan suara) — validasi selalu manual oleh guru.
- Tidak ada self-register; seluruh akun guru & santri dibuat oleh Developer/Super Admin.
- Koneksi internet diperlukan untuk sinkronisasi data (kecuali ditambahkan mode offline di fase lanjutan).
- Skala awal: satu lembaga (TPQ/pesantren/sekolah), puluhan hingga ratusan pengguna.
- Seluruh biaya operasional ditargetkan Rp0 menggunakan free tier layanan yang tersedia.


## 12. Metrik Keberhasilan

- Guru dapat mencatat hafalan santri dalam waktu kurang dari 30 detik per entri.
- Santri dapat menemukan & membuka surat yang dicari dalam kurang dari 3 ketukan dari halaman manapun.
- Progress yang ditampilkan akurat sesuai data yang dicentang.
- Tidak ada kebingungan navigasi — seluruh fitur utama dapat diakses langsung dari bottom navigation bar.


---

*Dokumen ini adalah PRD (Product Requirement Document) v2 yang dapat digunakan sebagai prompt/acuan pengembangan aplikasi menggunakan Google AI Studio atau tools AI coding lainnya. Detail teknis implementasi dapat disesuaikan oleh tools tersebut selama tujuan, fitur, dan prinsip desain di atas tetap terpenuhi.*
