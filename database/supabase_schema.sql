-- =======================================================
-- SKEMA DATABASE TAHFIDZ TRACKER (PRD v2)
-- Platform: Supabase (PostgreSQL)
-- =======================================================

-- Aktifkan UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('developer', 'guru', 'santri')),
    kelas_nama VARCHAR(100),
    target_juz INT DEFAULT 30,
    status_aktif BOOLEAN DEFAULT true,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL KELAS
CREATE TABLE IF NOT EXISTS public.kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas VARCHAR(120) NOT NULL,
    guru_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_juz INT DEFAULT 30,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    dihapus_pada TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- 3. TABEL SANTRI_KELAS (Penghubung Santri & Kelas)
CREATE TABLE IF NOT EXISTS public.santri_kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    santri_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
    tanggal_masuk DATE DEFAULT CURRENT_DATE NOT NULL,
    tanggal_keluar DATE,
    CONSTRAINT unique_santri_aktif UNIQUE (santri_id, kelas_id)
);

-- 4. TABEL AYAT_REFERENSI (Data Statis Quran)
CREATE TABLE IF NOT EXISTS public.ayat_referensi (
    id SERIAL PRIMARY KEY,
    nomor_juz INT NOT NULL,
    nomor_surat INT NOT NULL,
    nama_surat VARCHAR(100) NOT NULL,
    nomor_ayat INT NOT NULL,
    teks_arab TEXT NOT NULL,
    teks_latin TEXT,
    teks_terjemahan TEXT,
    nomor_halaman INT,
    url_audio TEXT,
    CONSTRAINT unique_ayat UNIQUE (nomor_surat, nomor_ayat)
);

-- 5. TABEL PROGRESS_HAFALAN (Pencatatan Status Hafalan per Ayat)
CREATE TABLE IF NOT EXISTS public.progress_hafalan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    santri_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nomor_surat INT NOT NULL,
    nomor_ayat INT NOT NULL,
    nomor_juz INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'hafal' CHECK (status IN ('belum', 'sedang', 'hafal', 'mutqin')),
    tanggal_setor TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    dicentang_oleh UUID REFERENCES public.users(id) ON DELETE SET NULL,
    catatan TEXT,
    CONSTRAINT unique_santri_hafalan UNIQUE (santri_id, nomor_surat, nomor_ayat)
);

-- 6. TABEL RIWAYAT_SETORAN (Log Kronologis Setoran Hafalan)
CREATE TABLE IF NOT EXISTS public.riwayat_setoran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    santri_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nomor_surat INT NOT NULL,
    nama_surat VARCHAR(100) NOT NULL,
    ayat_mulai INT NOT NULL,
    ayat_selesai INT NOT NULL,
    total_ayat INT NOT NULL,
    status_saat_itu VARCHAR(20) NOT NULL DEFAULT 'hafal',
    guru_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    catatan TEXT,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.santri_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_hafalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_setoran ENABLE ROW LEVEL SECURITY;

-- Helper function: Dapatkan role user yang sedang login
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS text AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Kebijakan untuk DEVELOPER / SUPER ADMIN (Akses Penuh)
CREATE POLICY "Developer full access users" ON public.users FOR ALL USING (get_auth_user_role() = 'developer');
CREATE POLICY "Developer full access kelas" ON public.kelas FOR ALL USING (get_auth_user_role() = 'developer');
CREATE POLICY "Developer full access santri_kelas" ON public.santri_kelas FOR ALL USING (get_auth_user_role() = 'developer');
CREATE POLICY "Developer full access progress" ON public.progress_hafalan FOR ALL USING (get_auth_user_role() = 'developer');
CREATE POLICY "Developer full access riwayat" ON public.riwayat_setoran FOR ALL USING (get_auth_user_role() = 'developer');

-- Kebijakan untuk GURU
CREATE POLICY "Guru read own profile" ON public.users FOR SELECT USING (id = auth.uid() OR role = 'santri');
CREATE POLICY "Guru access own classes" ON public.kelas FOR ALL USING (guru_id = auth.uid());
CREATE POLICY "Guru access santri_kelas" ON public.santri_kelas FOR ALL USING (
    kelas_id IN (SELECT id FROM public.kelas WHERE guru_id = auth.uid())
);
CREATE POLICY "Guru validate progress" ON public.progress_hafalan FOR ALL USING (
    dicentang_oleh = auth.uid() OR santri_id IN (
        SELECT santri_id FROM public.santri_kelas sk
        JOIN public.kelas k ON sk.kelas_id = k.id
        WHERE k.guru_id = auth.uid()
    )
);
CREATE POLICY "Guru create riwayat" ON public.riwayat_setoran FOR ALL USING (guru_id = auth.uid());

-- Kebijakan untuk SANTRI (Read Only data sendiri)
CREATE POLICY "Santri read own profile" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Santri read own progress" ON public.progress_hafalan FOR SELECT USING (santri_id = auth.uid());
CREATE POLICY "Santri read own riwayat" ON public.riwayat_setoran FOR SELECT USING (santri_id = auth.uid());
