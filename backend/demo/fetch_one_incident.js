import mongoose from 'mongoose';
import { Incident, Briefing } from '../src/models/index.js';

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civiclens';

async function main() {
  await mongoose.connect(MONGO, { autoIndex: false });
  const incident = await Incident.findOne().sort({ createdAt: -1 }).lean();
  if (!incident) {
    console.log('No incident found');
    await mongoose.disconnect();
    return;
  }

  const briefing = incident.latestBriefingId ? await Briefing.findById(incident.latestBriefingId).lean() : null;

  console.log('Incident:');
  console.log(JSON.stringify({ _id: incident._id, title: incident.title, category: incident.category, severity: incident.severity, confidence: incident.confidence, summary: incident.summary }, null, 2));

  console.log('\nLatest Briefing:');
  if (briefing) console.log(JSON.stringify({ _id: briefing._id, text: briefing.text, confidence: briefing.confidence, basedOnReportIds: briefing.basedOnReportIds }, null, 2));
  else console.log('No briefing found for this incident');

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
