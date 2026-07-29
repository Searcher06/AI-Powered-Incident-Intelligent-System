import fs from 'fs';

const PORT = process.env.PORT || 5000;
const BASE = `http://127.0.0.1:${PORT}`;

async function main() {
  const data = JSON.parse(fs.readFileSync('./sample_reports.json', 'utf8'));
  for (const r of data) {
    const res = await fetch(`${BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r),
    });
    const json = await res.json();
    console.log('Posted report:', json.report?._id || json.report);
  }
}

main().catch((e) => console.error(e));
