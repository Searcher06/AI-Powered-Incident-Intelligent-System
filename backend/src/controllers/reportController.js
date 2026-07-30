import mongoose from 'mongoose';
import { Report } from '../models/index.js';
import IncidentIntelligenceEngine from '../services/IncidentIntelligenceEngine.js';

// ── POST /reports ─────────────────────────────────────────────────────────────
async function createReport(req, res) {
  try {
    const { sourceType, reporterType, description, language, location, timestamp, mediaAssets } = req.body;
    const ts = timestamp ? new Date(timestamp) : new Date();

    const report = await Report.create({
      sourceType,
      reporterType,
      description,
      language,
      location,
      timestamp: ts,
      mediaAssets,
    });

    // Enqueue for background AI processing — respond immediately
    const queueModule = await import('../worker/queue.js');
    queueModule.default.enqueue(report._id);

    return res.status(201).json({ report, message: 'Report accepted and queued for analysis' });
  } catch (err) {
    console.error('[reportController.createReport]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /reports ──────────────────────────────────────────────────────────────
// Query params: status, incidentId, limit, page
async function listReports(req, res) {
  try {
    const { status, incidentId, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (incidentId) {
      if (!mongoose.isValidObjectId(incidentId)) {
        return res.status(400).json({ error: 'Invalid incidentId' });
      }
      filter.incidentId = incidentId;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ timestamp: -1 }).skip(skip).limit(pageSize).lean(),
      Report.countDocuments(filter),
    ]);

    return res.json({
      reports,
      pagination: { total, page: pageNum, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('[reportController.listReports]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /reports/:id ──────────────────────────────────────────────────────────
async function getReport(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }
    const report = await Report.findById(req.params.id).lean();
    if (!report) return res.status(404).json({ error: 'Report not found' });
    return res.json({ report });
  } catch (err) {
    console.error('[reportController.getReport]', err);
    return res.status(500).json({ error: err.message });
  }
}

export default { createReport, listReports, getReport };
