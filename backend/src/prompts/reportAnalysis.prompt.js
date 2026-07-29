export function buildReportAnalysisPrompt({ imageUrl, description, location }) {
  return `Analyze the following report and extract structured fields: category, severity (low|medium|high|critical), confidence (0-1), summary, tags, affectedInfrastructure, affectedServices, recommendedResponse.\n\nDescription: ${description}\nImage: ${imageUrl}\nLocation: ${JSON.stringify(location)}`;
}
