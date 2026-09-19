import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:imanngaji123A!@db.bnlogvposwzcnyllgksa.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function dedupe() {
  await client.connect();
  const delRes = await client.query(`
    DELETE FROM public.riwayat_setoran a USING public.riwayat_setoran b
    WHERE a.id < b.id 
      AND a.santri_id = b.santri_id 
      AND a.nomor_surat = b.nomor_surat 
      AND a.ayat_mulai = b.ayat_mulai 
      AND a.ayat_selesai = b.ayat_selesai;
  `);
  console.log('Deleted duplicate rows from Supabase:', delRes.rowCount);
  const remaining = await client.query('SELECT count(*) FROM public.riwayat_setoran');
  console.log('Remaining clean riwayat count in Supabase:', remaining.rows[0].count);
  await client.end();
}
dedupe();
