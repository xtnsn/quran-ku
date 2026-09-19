# Panduan Menjalankan & Build APK Android: Tahfidz Tracker (PRD v2)

Aplikasi ini dibangun khusus memenuhi seluruh spesifikasi pada **PRD v2: Aplikasi Hafalan Quran (Tahfidz Tracker)**.

---

## 🌟 Fitur Utama yang Telah Diimplementasikan

1. **Sistem 3 Peran Pengguna (User Roles)**:
   - **Santri**: Bottom Navigation Bar 4 tab (Home, Al-Qur'an, Progress, Profil).
   - **Guru Ngaji**: Manajemen Kelas (tambah/hapus kelas), Manajemen Santri per kelas, dan **Fitur Inti Validasi Hafalan** (pilih santri, checklist ayat per surat, catatan guru).
   - **Developer / Super Admin**: Pembuatan akun (provisioning Guru & Santri, no self-register), reset kata sandi, aktif/nonaktifkan akun, dan monitoring seluruh kelas lintas guru.
2. **Desain UI/UX Native Android**:
   - Skema warna: Biru Primer (`#2E86DE`), Kartu Aksen (`#E6F1FB`), Latar Belakang (`#F4F9FF`), Teks Gelap (`#0C447C`).
   - Bottom Navigation Bar tetap di bagian bawah layar.
   - Peta hafalan 30 Juz interaktif & riwayat setoran kronologis.
   - Search bar surat Al-Qur'an yang mencolok dan mudah dijangkau.
3. **Integrasi Al-Qur'an Indonesia (EQuran.id API v2)**:
   - 114 Surat lengkap dengan teks Arab (Font *Amiri* tajweed-friendly), transliterasi latin, dan terjemahan Bahasa Indonesia.
   - Audio murottal per ayat & full surat dengan pilihan Qari (Misyari Rasyid Al-Afasi, Sudais, Al-Juhany, dll.).
   - Pengaturan ukuran font Arab yang fleksibel.
4. **Backend & Skema Database**:
   - Dilengkapi file `database/supabase_schema.sql` (PostgreSQL + Row Level Security untuk 3 role).
   - Local-First reactive storage dengan data awal (*seed data*) sehingga langsung dapat digunakan seketika.

---

## 🔑 Akun Bawaan untuk Pengujian (Seeded Accounts)

| Peran | Username | Kata Sandi | Keterangan |
|---|---|---|---|
| **Santri** | `santri.fatih` | `123` | Muhammad Fatih (Target: Juz 30) |
| **Santri 2** | `santri.aisyah` | `123` | Aisyah Humaira |
| **Guru Ngaji** | `ustadz.ahmad` | `123` | Ustadz Ahmad Al-Hafidz |
| **Guru Ngaji 2** | `ustadzah.fatimah` | `123` | Ustadzah Fatimah Azzahra |
| **Super Admin** | `admin` | `123` | Developer / Administrator TPQ |

*(Pada halaman login juga tersedia tombol "Akun Uji Coba Cepat" untuk beralih akun dalam 1 ketukan tanpa mengetik).*

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

Aplikasi menggunakan modul JavaScript standar dan Vanilla CSS tanpa perlu kompilasi yang rumit:

```bash
# Jalankan web server lokal
npx serve -l 3000 .
```
Buka browser pada: `http://localhost:3000`

---

## 📱 Cara Ekspor / Build Menjadi APK Android

Proyek ini telah dikonfigurasi penuh dengan **Capacitor** (`capacitor.config.json` dan `manifest.json`):

### Langkah 1: Pasang Dependensi Proyek
```bash
npm install
```

### Langkah 2: Tambahkan Platform Android (Jika belum pernah dijalankan)
```bash
npx cap add android
```
*(Perintah ini membuat folder `android/` yang berisi proyek Android Studio lengkap).*

### Langkah 3: Build Asset Web & Sinkronisasi ke Proyek Android
> [!IMPORTANT]
> Selalu jalankan perintah ini setiap kali ada perubahan kode agar asset terbaru di folder `src/` disalin ke dalam aplikasi Android.
```bash
npm run cap:sync
```
*(Perintah ini secara otomatis menjalankan `node build.js` untuk memperbarui folder `www/` dan menyinkronkan seluruh file ke dalam `android/`).*

### Langkah 4: Buka di Android Studio & Build APK Baru
```bash
npx cap open android
```
Di dalam **Android Studio**:
1. Tunggu proses *Gradle sync* selesai.
2. Klik menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Setelah selesai, klik **locate** untuk mendapatkan file APK terbaru, lalu install ke smartphone Android Anda.

---

## ☁️ Integrasi Supabase Cloud (Opsional)

Jika ingin menghubungkan data ke Supabase Cloud (Free Tier):
1. Buka dashboard Supabase Anda di [https://supabase.com](https://supabase.com).
2. Buka menu **SQL Editor**.
3. Buka file `database/supabase_schema.sql` di proyek ini, salin seluruh isinya, lalu klik **Run** di Supabase SQL Editor.
4. Seluruh tabel (`users`, `kelas`, `santri_kelas`, `progress_hafalan`, `riwayat_setoran`) dan kebijakan **Row Level Security (RLS)** akan aktif secara otomatis.
