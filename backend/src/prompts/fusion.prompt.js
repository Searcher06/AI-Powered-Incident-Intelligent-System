export function buildFusionPrompt({ reportUnderstanding, candidateSummaries = [] }) {
  const hasCandidates = candidateSummaries.length > 0;

  return `You are an AI incident fusion engine for a community emergency response system.

Your job is to decide whether an incoming report should be merged with an existing incident or create a new one.

${hasCandidates
  ? `There are ${candidateSummaries.length} candidate incident(s) nearby. Compare the incoming report against each candidate and decide if they describe the same real-world incident.`
  : 'There are no existing candidate incidents nearby. You must create a new incident.'}

Return a JSON object with exactly these keys:
- "decisionType": one of "merge_with_existing" or "create_new_incident"
- "selectedCandidateIndex": index (0-based) of the chosen candidate, or -1 if creating new
- "confidence": number 0-1 reflecting confidence in this decision
- "reasoning": 1-2 sentences explaining why you made this decision
- "evidence": array of 1-3 strings listing specific matching evidence (e.g. same location, same category)

Merge if: same category, overlapping location, similar description, same time window.
Create new if: different category, different location, or no strong match.

Incoming Report Analysis:
${JSON.stringify(reportUnderstanding, null, 2)}

Candidate Incidents:
${hasCandidates ? JSON.stringify(candidateSummaries, null, 2) : '[]'}`;
}
