import { TimelineEvent, Report } from '../models/index.js';

async function createEvent({ incidentId, reportId = null, fusionDecisionId = null, eventType, triggeredBy = 'system', before = {}, after = {}, reason = '' }) {
  const event = await TimelineEvent.create({
    incidentId,
    reportId,
    fusionDecisionId,
    eventType,
    triggeredBy,
    before,
    after,
    reason,
  });
  return event;
}

export default { createEvent };
