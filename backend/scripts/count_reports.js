import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Report, Incident, FusionDecision, Briefing, TimelineEvent } from '../src/models/index.js';

dotenv.config();
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiclens';

async function main() {
  await mongoose.connect(uri);
  const reports = await Report.countDocuments();
  const incidents = await Incident.countDocuments();
  const decisions = await FusionDecision.countDocuments();
  const briefings = await Briefing.countDocuments();
  const timeline = await TimelineEvent.countDocuments();

  console.log('counts:');
  console.log({ reports, incidents, decisions, briefings, timeline });

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
