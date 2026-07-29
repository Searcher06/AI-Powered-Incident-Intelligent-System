import ReportAnalyzer from './ReportAnalyzer.js';
import CandidateFinder from './CandidateFinder.js';
import FusionEngine from './FusionEngine.js';
import BriefingGenerator from './BriefingGenerator.js';
import TimelineGenerator from './TimelineGenerator.js';

// Orchestrator: runs the full pipeline for a given reportId
async function processReport(reportId) {
  // 1. Analyze
  const analysis = await ReportAnalyzer.analyzeReport(reportId);

  // 2. Find candidates
  const candidates = await CandidateFinder.findCandidates(reportId);

  // 3. Fuse
  const { decision, incident } = await FusionEngine.fuse(reportId, candidates);

  // 4. Timeline
  if (decision && decision.shouldCreateTimelineEvent) {
    const before = {};
    const after = { incidentId: decision.selectedIncidentId };
    await TimelineGenerator.createEvent({
      incidentId: decision.selectedIncidentId || (incident && incident._id),
      reportId,
      fusionDecisionId: decision._id,
      eventType: decision.decisionType === 'create_new_incident' ? 'created' : 'merged',
      triggeredBy: 'fusion',
      before,
      after,
      reason: decision.reasoning || '',
    });
  }

  // 5. Briefing
  if (decision && decision.shouldRegenerateBriefing) {
    const incidentId = decision.selectedIncidentId || (incident && incident._id);
    if (incidentId) {
      await BriefingGenerator.generateBriefing(incidentId);
    }
  }

  return { analysis, decision, incident };
}

export default { processReport };
