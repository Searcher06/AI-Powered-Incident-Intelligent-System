import { callModelStructured, BRIEFING_SCHEMA } from './client.js';
import { buildBriefingPrompt } from '../../prompts/briefing.prompt.js';

async function generateBriefing(incidentId) {
  const { Incident, Report, Briefing } = await import('../../models/index.js');
  const incident = await Incident.findById(incidentId);
  if (!incident) throw new Error('Incident not found');

  const reports = await Report.find({ incidentId }).sort({ timestamp: -1 }).limit(5).lean();

  const prompt = buildBriefingPrompt({
    incidentSummary: {
      title: incident.title,
      summary: incident.summary,
      severity: incident.severity,
      confidence: incident.confidence,
    },
    recentReports: reports.map((r) => ({
      _id: r._id,
      summary: r.understanding?.summary || r.description || '',
    })),
  });

  const { parsed } = await callModelStructured({ prompt, temperature: 0.0, schema: BRIEFING_SCHEMA });

  const text = parsed?.text
    || `${incident.title}. Severity: ${incident.severity}. ${incident.summary} Recommended: ${incident.recommendedResponse || 'Inspect on site.'}`;

  const confidence = typeof parsed?.confidence === 'number' ? parsed.confidence : (incident.confidence || 0.5);

  const briefing = await Briefing.create({
    incidentId,
    text,
    generatedBy: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    basedOnReportIds: reports.map((r) => r._id),
    confidence,
  });

  incident.latestBriefingId = briefing._id;
  await incident.save();

  return briefing;
}

export default { generateBriefing };
