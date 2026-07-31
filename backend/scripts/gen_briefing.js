import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Incident } from '../src/models/index.js';
import BriefingGenerator from '../src/services/gemma/BriefingGenerator.js';

const INCIDENT_ID = process.argv[2] || '6a6c7be49134706968856dca';

await mongoose.connect(process.env.MONGODB_URI);

const inc = await Incident.findById(INCIDENT_ID).lean();
console.log('Incident:', inc?.title);
console.log('Has briefing:', !!inc?.latestBriefingId);

if (!inc?.latestBriefingId) {
  let success = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`Attempt ${attempt}/5...`);
      const briefing = await BriefingGenerator.generateBriefing(INCIDENT_ID);
      console.log('Briefing created:', briefing._id);
      console.log('Text:', briefing.text?.slice(0, 200));
      success = true;
      break;
    } catch (err) {
      console.warn(`Attempt ${attempt} failed:`, err.message?.slice(0, 80));
      if (attempt < 5) {
        const wait = attempt * 10000;
        console.log(`Waiting ${wait / 1000}s before retry...`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
  if (!success) console.error('All attempts failed. Try again later.');
} else {
  console.log('Already has a briefing, skipping.');
}

await mongoose.disconnect();
