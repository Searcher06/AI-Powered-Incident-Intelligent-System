import { Briefing, Report, Incident } from '../models/index.js';

// Simple briefing generator using existing report summaries
async function generateBriefing(incidentId) {
  const incident = await Incident.findById(incidentId);
  if (!incident) throw new Error('Incident not found');

  // For MVP: gather recent reports and stitch a short briefing
  const reports = await Report.find({ incidentId }).sort({ timestamp: -1 }).limit(5).lean();

  const lines = [];
  lines.push(`Incident: ${incident.title || 'Untitled'}`);
  lines.push(`Severity: ${incident.severity}  Confidence: ${incident.confidence}`);
  lines.push('Recent reports:');
  for (const r of reports) {
    lines.push(`- ${new Date(r.timestamp).toISOString()}: ${r.understanding?.summary || r.description || ''}`);
  }

  lines.push('Recommended response:');
  lines.push(incident.recommendedResponse || 'Inspect on site');

  const text = lines.join('\n');

  const briefing = await Briefing.create({
    incidentId,
    text,
    generatedBy: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    basedOnReportIds: reports.map((r) => r._id),
    confidence: incident.confidence || 0.5,
  });

  incident.latestBriefingId = briefing._id;
  await incident.save();

  return briefing;
}

export default { generateBriefing };
