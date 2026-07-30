import { Report } from '../../models/index.js';
import { callModelStructured, REPORT_ANALYSIS_SCHEMA } from './client.js';
import { buildReportAnalysisPrompt } from '../../prompts/reportAnalysis.prompt.js';
import { ReportUnderstandingSchema } from './schemas.js';

async function analyzeReport(reportId) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  report.pipeline = report.pipeline || {};
  report.pipeline.startedAt = report.pipeline.startedAt || new Date();
  report.status = 'analyzing';
  await report.save();

  const imageUrl = report.mediaAssets?.[0]?.url || '';
  const prompt = buildReportAnalysisPrompt({
    imageUrl,
    description: report.description || '',
    location: report.location || {},
  });

  const startMs = Date.now();
  const { parsed } = await callModelStructured({ prompt, temperature: 0.0, schema: REPORT_ANALYSIS_SCHEMA });
  const processingMs = Date.now() - startMs;

  const fallback = {
    category: 'unknown',
    severity: 'medium',
    confidence: 0.5,
    summary: report.description?.slice(0, 200) || 'Report submitted without description',
    tags: [],
    affectedInfrastructure: [],
    affectedServices: [],
    recommendedResponse: '',
  };

  const data = parsed || fallback;
  const result = ReportUnderstandingSchema.safeParse(data);

  const understanding = {
    model: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    modelVersion: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    category: data.category || fallback.category,
    severity: ['low', 'medium', 'high', 'critical'].includes(data.severity) ? data.severity : fallback.severity,
    confidence: typeof data.confidence === 'number' ? Math.min(1, Math.max(0, data.confidence)) : fallback.confidence,
    summary: data.summary || fallback.summary,
    tags: Array.isArray(data.tags) ? data.tags : [],
    affectedInfrastructure: Array.isArray(data.affectedInfrastructure) ? data.affectedInfrastructure : [],
    affectedServices: Array.isArray(data.affectedServices) ? data.affectedServices : [],
    recommendedResponse: data.recommendedResponse || '',
    rawOutput: data,
    generatedAt: new Date(),
  };

  report.understanding = understanding;
  report.status = 'matching';
  report.pipeline.analyzedAt = new Date();
  await report.save();

  return { understanding, processingMs };
}

export default { analyzeReport };
