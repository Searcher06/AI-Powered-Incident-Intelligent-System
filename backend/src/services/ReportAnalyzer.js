import { Report } from '../models/index.js';

// Minimal ReportAnalyzer: wraps Gemma call (mocked here) and writes Report.understanding
async function analyzeReport(reportId, gemmaClient = null) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  // Mark started
  report.pipeline = report.pipeline || {};
  report.pipeline.startedAt = report.pipeline.startedAt || new Date();
  report.status = 'analyzing';
  await report.save();

  // TODO: Replace with real Gemma integration. For now, create a simple understanding.
  const start = Date.now();
  const understanding = {
    model: 'gemma-4',
    modelVersion: process.env.GEMMA_MODEL_VERSION || 'gemma-4',
    category: 'unknown',
    severity: 'medium',
    confidence: 0.6,
    summary: report.description ? report.description.slice(0, 200) : 'Image-based report',
    tags: [],
    affectedInfrastructure: [],
    affectedServices: [],
    recommendedResponse: '',
    rawOutput: {},
    generatedAt: new Date(),
  };

  // simple heuristics: if description contains 'flood' -> flood
  if (report.description && /flood|flooding|water/i.test(report.description)) {
    understanding.category = 'flood';
    understanding.severity = 'high';
    understanding.confidence = 0.85;
    understanding.summary = understanding.summary + ' (detected flood)';
  }

  report.understanding = understanding;
  report.pipeline.analyzedAt = new Date();
  await report.save();

  const processingMs = Date.now() - start;
  return { understanding, processingMs };
}

export default { analyzeReport };
