export function buildReportAnalysisPrompt({ imageUrl, description, location }) {
  const hasImage = imageUrl && imageUrl.trim();

  return `You are an AI incident analyst for a community emergency response system.
${hasImage ? 'An image is attached. Analyze it carefully as your primary evidence.' : ''}

The report may be written in ANY language (English, Hausa, Yoruba, Igbo, Arabic, French, or others).
Understand the report in its original language, then output structured intelligence in the format below.

Output ONLY these fields in exactly this format — no extra text, no explanations:

detectedLanguage: <ISO 639-1 code, e.g. en, ha, yo, ar, fr>
englishSummary: <1-2 sentence English summary of what is happening, regardless of input language>
category: <slug: flood, fire, power_outage, road_blockage, infrastructure_damage, medical, crime, weather, earthquake, hazmat, protest, security, sanitation, other>
severity: <low|medium|high|critical>
confidence: <0.0-1.0>
summary: <1-2 sentence summary in the SAME language as the report>
tags: <keyword1, keyword2, keyword3>
affectedInfrastructure: <item1, item2>
affectedServices: <service1, service2>
recommendedResponse: <one action sentence in English>

Example output (Hausa input):
detectedLanguage: ha
englishSummary: A road traffic accident involving a truck has blocked the main road in Kano.
category: road_blockage
severity: high
confidence: 0.92
summary: An samu hatsarin mota a kan babbar hanya a Kano.
tags: road_accident, truck, kano, traffic_blocked
affectedInfrastructure: road, highway
affectedServices: transportation, emergency_response
recommendedResponse: Dispatch emergency services and towing equipment to clear the blocked road.

Now analyze this report:
Description: ${description || 'none'}
Location: ${location?.text || JSON.stringify(location)}`;
}
