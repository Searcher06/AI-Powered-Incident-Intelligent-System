export function buildReportAnalysisPrompt({ imageUrl, description, location }) {
  const hasImage = imageUrl && imageUrl.trim();

  return `You are an AI incident analyst for a community emergency response system.
${hasImage ? 'An image is attached. Analyze it carefully as your primary evidence.' : ''}

Analyze the incident report below. Output ONLY the fields below in exactly this format — no extra text, no explanations:

category: <slug>
severity: <low|medium|high|critical>
confidence: <0.0-1.0>
summary: <1-2 sentence description>
tags: <keyword1, keyword2, keyword3>
affectedInfrastructure: <item1, item2>
affectedServices: <service1, service2>
recommendedResponse: <one action sentence>

Example output:
category: flood
severity: high
confidence: 0.85
summary: Severe flooding on Main Street has blocked all traffic lanes and water levels are rising rapidly.
tags: flooding, road_blocked, rising_water
affectedInfrastructure: road, bridge
affectedServices: transportation, emergency_response
recommendedResponse: Deploy water pumps and redirect traffic via alternate routes immediately.

Now analyze this report:
Description: ${description || 'none'}
Location: ${location?.text || JSON.stringify(location)}`;
}
