import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Incident, Report } from '../src/models/index.js';

await mongoose.connect(process.env.MONGODB_URI);

const MAX = 72;

function makeTitle(summary, description) {
  const source = summary || description || '';
  if (!source) return 'Incident';

  // Split into sentences and take the first complete one
  const sentences = source.match(/[^.!?]+[.!?]?/g) || [source];
  const first = sentences[0].trim().replace(/\.$/, '');

  if (first.length <= MAX) return first;

  // Find last space before MAX
  const cut = first.slice(0, MAX);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim();
}

const incidents = await Incident.find({});
let fixed = 0;

for (const inc of incidents) {
  // Get the first report linked to this incident for context
  const report = await Report.findOne({ incidentId: inc._id }).sort({ timestamp: 1 }).lean();
  const summary = inc.summary || report?.understanding?.summary || '';
  const description = report?.description || '';

  const goodTitle = makeTitle(summary, description);

  if (goodTitle && goodTitle !== inc.title) {
    console.log('ID:     ', inc._id);
    console.log('Before:', inc.title);
    console.log('After: ', goodTitle);
    console.log('---');
    inc.title = goodTitle;
    await inc.save();
    fixed++;
  }
}

console.log(`Fixed ${fixed} incident titles.`);
await mongoose.disconnect();
