import fs from 'fs';
import path from 'path';

async function downloadQuran() {
  const dir = path.resolve('assets/quran');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Fetching surah list...');
  const listResp = await fetch('https://equran.id/api/v2/surat');
  const listData = await listResp.json();
  fs.writeFileSync(path.join(dir, 'surah-list.json'), JSON.stringify(listData.data));
  console.log('Saved surah-list.json with', listData.data.length, 'surahs');

  console.log('Downloading 114 surahs in batches...');
  const numbers = Array.from({ length: 114 }, (_, i) => i + 1);
  const batchSize = 10;
  for (let i = 0; i < numbers.length; i += batchSize) {
    const batch = numbers.slice(i, i + batchSize);
    await Promise.all(batch.map(async num => {
      const filePath = path.join(dir, num + '.json');
      if (fs.existsSync(filePath)) return;
      const r = await fetch('https://equran.id/api/v2/surat/' + num);
      const d = await r.json();
      fs.writeFileSync(filePath, JSON.stringify(d.data));
    }));
    process.stdout.write('.');
  }
  console.log('\nAll 114 surahs downloaded to assets/quran successfully!');
}

downloadQuran().catch(console.error);
