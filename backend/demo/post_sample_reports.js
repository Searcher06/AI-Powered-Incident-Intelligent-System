import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const BASE = `http://127.0.0.1:${PORT}`;

async function main() {
  // Resolve relative to this file's directory so it works from any cwd
  const dataPath = path.join(__dirname, 'sample_reports.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`Posting ${data.length} sample reports to ${BASE}/reports...\n`);

  for (const r of data) {
    const res = await fetch(`${BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r),
    });
    const json = await res.json();
    console.log('Posted report:', json.report?._id, '—', json.message || json.error);
  }

  console.log('\nDone. Reports queued for AI processing.');
}

main().catch((e) => console.error(e));
