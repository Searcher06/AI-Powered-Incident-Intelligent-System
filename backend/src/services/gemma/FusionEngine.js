import { FusionDecision, Incident, Report } from '../../models/index.js';

// Simple FusionEngine that uses heuristics + placeholder Gemma compare
async function fuse(reportId, candidates = [], gemmaClient = null) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  const start = Date.now();

  // Very simple heuristic: if any candidate is within same category (if report.understanding.category is set and matches), pick it.
  const category = report.understanding?.category || null;
  let selected = null;
  if (category) {
    selected = candidates.find((c) => c.category && c.category === category);
  }

  // fallback: pick the first candidate if exists with naive confidence
  if (!selected && candidates.length > 0) {
    selected = candidates[0];
  }

  const decision = {
    reportId,
    decisionType: selected ? 'merge_with_existing' : 'create_new_incident',
    candidateIncidentIds: candidates.map((c) => c._id),
    selectedIncidentId: selected ? selected._id : null,
    confidence: selected ? 0.8 : 0.6,
    reasoning: selected ? `Matched candidate incident ${selected._id}` : 'No candidate matched, creating new incident',
    evidence: selected ? ['candidate_location', 'category_match'] : ['no_candidates'],
    processingTimeMs: Date.now() - start,
    modelVersion: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    shouldRegenerateBriefing: true,
    shouldCreateTimelineEvent: true,
  };

  const saved = await FusionDecision.create(decision);

  // Apply decision: create or update incident and attach report.incidentId
  if (decision.decisionType === 'create_new_incident') {
    const incident = await Incident.create({
      title: report.understanding?.summary || 'New incident',
      category: report.understanding?.category || '',
      severity: report.understanding?.severity || 'medium',
      confidence: report.understanding?.confidence || 0.5,
      summary: report.understanding?.summary || '',
      recommendedResponse: report.understanding?.recommendedResponse || '',
      location: report.location || {},
    });
    saved.selectedIncidentId = incident._id;
    await saved.save();

    report.incidentId = incident._id;
    report.status = 'merged';
    await report.save();

    return { decision: saved, incident };
  } else if (decision.decisionType === 'merge_with_existing') {
    // Update incident conservatively
    const incident = await Incident.findById(decision.selectedIncidentId);
    if (incident) {
      // simple merge: bump confidence/severity if needed
      incident.confidence = Math.max(incident.confidence || 0, report.understanding?.confidence || 0.5);
      // if incoming severity is higher, adopt it
      const severities = ['low', 'medium', 'high', 'critical'];
      const incomingIdx = severities.indexOf(report.understanding?.severity || 'medium');
      const currentIdx = severities.indexOf(incident.severity || 'medium');
      if (incomingIdx > currentIdx) incident.severity = report.understanding?.severity;
      incident.summary = incident.summary || report.understanding?.summary || incident.summary;
      incident.updatedAt = new Date();
      await incident.save();

      report.incidentId = incident._id;
      report.status = 'merged';
      await report.save();

      return { decision: saved, incident };
    }
  }

  return { decision: saved, incident: null };
}

export default { fuse };
