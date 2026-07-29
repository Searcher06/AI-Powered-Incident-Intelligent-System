export function buildFusionPrompt({ reportUnderstanding, candidateSummaries = [] }) {
  // Minimal prompt builder for the fusion step. In production this would be a
  // careful instruction prompting Gemma to compare the incoming report against
  // candidate incidents and return a structured JSON decision.
  const prompt = `Compare the following report to candidate incidents and decide whether to merge or create new. Return JSON with decisionType, selectedCandidateIndex (or -1), confidence, reasoning, and evidence array. \n\nReport:\n${JSON.stringify(reportUnderstanding, null, 2)}\n\nCandidates:\n${JSON.stringify(candidateSummaries, null, 2)}`;
  return prompt;
}
