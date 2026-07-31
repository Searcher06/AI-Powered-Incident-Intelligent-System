export function buildFusionPrompt({ reportUnderstanding, candidateSummaries = [] }) {
  const hasCandidates = candidateSummaries.length > 0;

  // Use englishSummary for cross-language comparison when available
  const incomingSummary = reportUnderstanding.englishSummary || reportUnderstanding.summary || '';

  return `You are an AI incident fusion engine for a community emergency response system.

Reports may come from citizens speaking different languages. All summaries below have been normalized to English by Gemma for consistent comparison.

Your job is to decide whether the incoming report should be merged with an existing incident or create a new one.

${hasCandidates
  ? `There are ${candidateSummaries.length} candidate incident(s) nearby. Compare the incoming report against each candidate.`
  : 'There are no existing candidate incidents nearby. You must create a new incident.'}

Output ONLY these fields in exactly this format:
decisionType: <merge_with_existing|create_new_incident>
selectedCandidateIndex: <0-based index, or -1 if creating new>
confidence: <0.0-1.0>
reasoning: <1-2 sentences>
evidence: <item1, item2>

Merge if: same category, overlapping location, similar English summary, same time window.
Create new if: different category, different location, or no strong match.

Incoming Report (English summary):
category: ${reportUnderstanding.category || 'unknown'}
severity: ${reportUnderstanding.severity || 'medium'}
summary: ${incomingSummary}
detectedLanguage: ${reportUnderstanding.detectedLanguage || 'en'}

Candidate Incidents:
${hasCandidates ? candidateSummaries.map((c, i) => `[${i}] ${c.title} — ${c.summary} (${c.category}, ${c.severity})`).join('\n') : 'none'}`;
}
