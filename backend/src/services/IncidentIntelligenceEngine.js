import ReportAnalyzer from './gemma/ReportAnalyzer.js';
import CandidateFinder from './incident/CandidateFinder.js';
import FusionEngine from './gemma/FusionEngine.js';
import BriefingGenerator from './gemma/BriefingGenerator.js';
import TimelineGenerator from './TimelineGenerator.js';

// Orchestrator: runs the full pipeline for a given reportId
async function processReport(reportId) {
  // 1. Analyze — Gemma extracts category, severity, summary, tags, etc.
  const analysis = await ReportAnalyzer.analyzeReport(reportId);

  // 2. Find candidate incidents within 1km / 24h window
  const candidates = await CandidateFinder.findCandidates(reportId);

  // 3. Fuse — Gemma decides: merge with existing or create new incident
  const { decision, incident, prevSeverity } = await FusionEngine.fuse(reportId, candidates);

  const incidentId = decision?.selectedIncidentId || (incident && incident._id);

  // 4. Timeline event
  if (decision && decision.shouldCreateTimelineEvent && incidentId) {
    const eventType = decision.decisionType === 'create_new_incident' ? 'created' : 'merged';

    await TimelineGenerator.createEvent({
      incidentId,
      reportId,
      fusionDecisionId: decision._id,
      eventType,
      triggeredBy: 'fusion',
      before: prevSeverity ? { severity: prevSeverity } : {},
      after: {
        incidentId,
        severity: incident?.severity,
        confidence: incident?.confidence,
        reportCount: incident?.reportCount,
      },
      reason: decision.reasoning || '',
    });

    // Log a separate severity_changed event when severity escalated
    if (
      prevSeverity &&
      incident?.severity &&
      prevSeverity !== incident.severity
    ) {
      await TimelineGenerator.createEvent({
        incidentId,
        reportId,
        fusionDecisionId: decision._id,
        eventType: 'severity_changed',
        triggeredBy: 'fusion',
        before: { severity: prevSeverity },
        after: { severity: incident.severity },
        reason: `Severity escalated from ${prevSeverity} to ${incident.severity} based on new report evidence`,
      });
    }
  }

  // 5. Regenerate operational briefing
  if (decision && decision.shouldRegenerateBriefing && incidentId) {
    await BriefingGenerator.generateBriefing(incidentId);

    // Log briefing_updated timeline event
    if (incidentId) {
      await TimelineGenerator.createEvent({
        incidentId,
        reportId,
        eventType: 'briefing_updated',
        triggeredBy: 'gemma',
        before: {},
        after: {},
        reason: 'Operational briefing regenerated after new report',
      });
    }
  }

  return { analysis, decision, incident };
}

export default { processReport };
