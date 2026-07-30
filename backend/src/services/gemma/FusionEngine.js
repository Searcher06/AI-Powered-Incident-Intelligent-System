import { FusionDecision, Incident, Report } from '../../models/index.js';
import { callModelStructured, FUSION_SCHEMA } from './client.js';
import { buildFusionPrompt } from '../../prompts/fusion.prompt.js';
import { FusionDecisionSchema } from './schemas.js';

async function fuse(reportId, candidates = []) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  const prompt = buildFusionPrompt({
    reportUnderstanding: report.understanding || {},
    candidateSummaries: candidates.map((c) => ({
      _id: c._id,
      title: c.title,
      category: c.category,
      severity: c.severity,
      summary: c.summary,
      location: c.location,
    })),
  });

  const { parsed } = await callModelStructured({ prompt, temperature: 0.0, schema: FUSION_SCHEMA });

  const fallback = {
    decisionType: candidates.length ? 'merge_with_existing' : 'create_new_incident',
    selectedCandidateIndex: candidates.length ? 0 : -1,
    confidence: 0.6,
    reasoning: 'fallback heuristic — model output could not be parsed',
    evidence: [],
  };

  const data = parsed || fallback;

  // Validate and coerce
  const decisionType = ['merge_with_existing', 'create_new_incident', 'no_change'].includes(data.decisionType)
    ? data.decisionType
    : fallback.decisionType;

  const selectedCandidateIndex = typeof data.selectedCandidateIndex === 'number'
    ? data.selectedCandidateIndex
    : fallback.selectedCandidateIndex;

  const selected = selectedCandidateIndex >= 0 ? candidates[selectedCandidateIndex] : null;

  const decisionRecord = await FusionDecision.create({
    reportId,
    decisionType,
    candidateIncidentIds: candidates.map((c) => c._id),
    selectedIncidentId: selected?._id || null,
    confidence: typeof data.confidence === 'number' ? data.confidence : fallback.confidence,
    reasoning: data.reasoning || fallback.reasoning,
    evidence: Array.isArray(data.evidence) ? data.evidence : [],
    processingTimeMs: 0,
    modelVersion: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    shouldRegenerateBriefing: true,
    shouldCreateTimelineEvent: true,
  });

  const severities = ['low', 'medium', 'high', 'critical'];

  // ── Create new incident ──────────────────────────────────────────────────
  if (decisionRecord.decisionType === 'create_new_incident') {
    const incident = await Incident.create({
      title: report.understanding?.summary || report.description?.slice(0, 100) || 'New incident',
      category: report.understanding?.category || 'other',
      severity: report.understanding?.severity || 'medium',
      confidence: report.understanding?.confidence || 0.5,
      summary: report.understanding?.summary || '',
      recommendedResponse: report.understanding?.recommendedResponse || '',
      location: report.location || {},
      reportCount: 1,
    });

    decisionRecord.selectedIncidentId = incident._id;
    await decisionRecord.save();

    report.incidentId = incident._id;
    report.status = 'merged';
    report.pipeline = report.pipeline || {};
    report.pipeline.matchedAt = new Date();
    report.pipeline.completedAt = new Date();
    await report.save();

    return { decision: decisionRecord, incident };
  }

  // ── Merge with existing incident ─────────────────────────────────────────
  if (decisionRecord.decisionType === 'merge_with_existing') {
    const incident = selected ? await Incident.findById(selected._id) : null;
    if (incident) {
      const incomingIdx = severities.indexOf(report.understanding?.severity || 'medium');
      const currentIdx = severities.indexOf(incident.severity || 'medium');
      const prevSeverity = incident.severity;
      if (incomingIdx > currentIdx) incident.severity = report.understanding.severity;

      incident.confidence = Math.max(incident.confidence || 0, report.understanding?.confidence || 0.5);
      incident.reportCount = (incident.reportCount || 1) + 1;
      if (incident.severity === 'critical') incident.status = 'critical';
      incident.updatedAt = new Date();
      await incident.save();

      report.incidentId = incident._id;
      report.status = 'merged';
      report.pipeline = report.pipeline || {};
      report.pipeline.matchedAt = new Date();
      report.pipeline.completedAt = new Date();
      await report.save();

      return { decision: decisionRecord, incident, prevSeverity };
    }
  }

  // ── no_change ────────────────────────────────────────────────────────────
  report.status = 'completed';
  report.pipeline = report.pipeline || {};
  report.pipeline.completedAt = new Date();
  await report.save();

  return { decision: decisionRecord, incident: null };
}

export default { fuse };
