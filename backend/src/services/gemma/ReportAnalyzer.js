import { Report } from '../../models/index.js';
import { callModelStructured, REPORT_ANALYSIS_SCHEMA } from './client.js';
import { buildReportAnalysisPrompt } from '../../prompts/reportAnalysis.prompt.js';
import { ReportUnderstandingSchema } from './schemas.js';

/**
 * Sanitize a raw category string from Gemma into a clean slug.
 *
 * Gemma sometimes returns: power_outage" (National grid collapse is a massive power outage).
 * We want just:            power_outage
 */
const CATEGORY_ALIASES = {
  flooding:                  'flood',
  floods:                    'flood',
  'power outage':            'power_outage',
  poweroutage:               'power_outage',
  'power failure':           'power_outage',
  'power_failure':           'power_outage',
  infrastructure:            'infrastructure_damage',
  'infrastructure failure':  'infrastructure_damage',
  road:                      'road_blockage',
  roads:                     'road_blockage',
  'road blockage':           'road_blockage',
  fire:                      'fire',
  medical:                   'medical',
  crime:                     'crime',
  weather:                   'weather',
  earthquake:                'earthquake',
  hazmat:                    'hazmat',
  protest:                   'protest',
  security:                  'security',
};

function sanitizeCategory(raw) {
  if (!raw || typeof raw !== 'string') return 'unknown';

  // Stop at first quote, paren, comma, period or space — take only the slug token
  const firstToken = raw
    .split(/["'(),.\s]/)[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '');

  if (CATEGORY_ALIASES[firstToken]) return CATEGORY_ALIASES[firstToken];

  // Also try the full raw string (before first special char) against aliases
  const rawNormalized = raw.toLowerCase().split(/["'(),./]/)[0].trim();
  if (CATEGORY_ALIASES[rawNormalized]) return CATEGORY_ALIASES[rawNormalized];

  return firstToken || 'unknown';
}

async function analyzeReport(reportId) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  report.pipeline = report.pipeline || {};
  report.pipeline.startedAt = report.pipeline.startedAt || new Date();
  report.status = 'analyzing';
  await report.save();

  const imageUrl = report.mediaAssets?.[0]?.url || '';
  const description = report.description || report.input?.text || '';

  // Determine modality
  const hasImage = imageUrl && imageUrl.trim();
  const hasText = description && description.trim();
  const modality = hasImage && hasText ? 'multimodal'
    : hasImage ? 'image'
    : hasText ? 'text'
    : 'text';

  const prompt = buildReportAnalysisPrompt({
    imageUrl,
    description,
    location: report.location || {},
  });

  const startMs = Date.now();
  const { parsed } = await callModelStructured({
    prompt,
    temperature: 0.0,
    schema: REPORT_ANALYSIS_SCHEMA,
    imageUrl,
  });
  const processingMs = Date.now() - startMs;

  const fallback = {
    detectedLanguage: report.language || 'en',
    englishSummary: description?.slice(0, 200) || 'Report submitted without description',
    category: 'unknown',
    severity: 'medium',
    confidence: 0.5,
    summary: description?.slice(0, 200) || 'Report submitted without description',
    tags: [],
    affectedInfrastructure: [],
    affectedServices: [],
    recommendedResponse: '',
  };

  const data = parsed || fallback;

  // Gemma sometimes appends validation markers like "(Correct)" — strip them
  const cleanStr = (s) => typeof s === 'string'
    ? s.replace(/\s*\((Correct|Right|Yes|OK|✓)\)\s*$/i, '').trim()
    : s;
  const cleanArr = (arr) => Array.isArray(arr)
    ? arr.map((s) => cleanStr(s)).filter(Boolean)
    : [];

  const understanding = {
    model: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    modelVersion: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    detectedLanguage: cleanStr(data.detectedLanguage || fallback.detectedLanguage),
    englishSummary: cleanStr(data.englishSummary || fallback.englishSummary),
    category: sanitizeCategory(data.category || fallback.category),
    severity: ['low', 'medium', 'high', 'critical'].includes(data.severity)
      ? data.severity
      : fallback.severity,
    confidence: typeof data.confidence === 'number'
      ? Math.min(1, Math.max(0, data.confidence))
      : fallback.confidence,
    summary: cleanStr(data.summary || fallback.summary),
    tags: cleanArr(data.tags),
    affectedInfrastructure: cleanArr(data.affectedInfrastructure),
    affectedServices: cleanArr(data.affectedServices),
    recommendedResponse: cleanStr(data.recommendedResponse || ''),
    rawOutput: data,
    generatedAt: new Date(),
  };

  // Populate the input sub-document
  report.input = {
    text: description,
    language: understanding.detectedLanguage,
    modality,
  };
  report.understanding = understanding;
  report.status = 'matching';
  report.pipeline.analyzedAt = new Date();
  await report.save();

  return { understanding, processingMs };
}

export default { analyzeReport };
