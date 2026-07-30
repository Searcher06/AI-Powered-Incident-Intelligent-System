export function buildBriefingPrompt({ incidentSummary, recentReports }) {
  return `You are an operational intelligence assistant for emergency responders.

Based on the incident information and recent reports below, generate a concise operational briefing that a response coordinator can act on immediately.

Return a JSON object with exactly these keys:
- "text": a 2-4 sentence operational briefing (plain language, action-oriented)
- "confidence": a number between 0 and 1 representing your confidence in the briefing
- "basedOnReportIds": array of report _id strings you used

Incident:
${JSON.stringify(incidentSummary, null, 2)}

Recent Reports:
${JSON.stringify(recentReports, null, 2)}`;
}
