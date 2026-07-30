import mongoose from 'mongoose';
import { Incident, Report, Briefing, TimelineEvent } from '../models/index.js';

// ── GET /incidents ────────────────────────────────────────────────────────────
// Query params: status, severity, category, limit, page
async function listIncidents(req, res) {
  try {
    const { status, severity, category, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = { $regex: category, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Incident.countDocuments(filter),
    ]);

    return res.json({
      incidents,
      pagination: {
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('[incidentController.listIncidents]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /incidents/stats ──────────────────────────────────────────────────────
async function getStats(req, res) {
  try {
    const [
      totalIncidents,
      activeIncidents,
      criticalIncidents,
      resolvedIncidents,
      totalReports,
      categoryBreakdown,
    ] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ status: 'active' }),
      Incident.countDocuments({ status: 'critical' }),
      Incident.countDocuments({ status: 'resolved' }),
      Report.countDocuments(),
      Incident.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return res.json({
      totalIncidents,
      activeIncidents,
      criticalIncidents,
      resolvedIncidents,
      totalReports,
      categoryBreakdown,
    });
  } catch (err) {
    console.error('[incidentController.getStats]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /incidents/:id ────────────────────────────────────────────────────────
async function getIncident(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid incident ID' });
    }

    const incident = await Incident.findById(req.params.id)
      .populate('latestBriefingId')
      .lean();

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Attach report count from actual linked reports
    const reportCount = await Report.countDocuments({ incidentId: incident._id });

    return res.json({ ...incident, reportCount });
  } catch (err) {
    console.error('[incidentController.getIncident]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /incidents/:id/reports ────────────────────────────────────────────────
async function getIncidentReports(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid incident ID' });
    }

    const { limit = 50, page = 1 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const incidentId = req.params.id;

    const [reports, total] = await Promise.all([
      Report.find({ incidentId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Report.countDocuments({ incidentId }),
    ]);

    return res.json({
      reports,
      pagination: {
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('[incidentController.getIncidentReports]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /incidents/:id/timeline ───────────────────────────────────────────────
async function getIncidentTimeline(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid incident ID' });
    }

    const events = await TimelineEvent.find({ incidentId: req.params.id })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({ events });
  } catch (err) {
    console.error('[incidentController.getIncidentTimeline]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /incidents/:id/briefing ───────────────────────────────────────────────
async function getIncidentBriefing(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid incident ID' });
    }

    const incident = await Incident.findById(req.params.id).lean();
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Return the latest briefing
    const briefing = incident.latestBriefingId
      ? await Briefing.findById(incident.latestBriefingId).lean()
      : await Briefing.findOne({ incidentId: incident._id }).sort({ generatedAt: -1 }).lean();

    if (!briefing) {
      return res.status(404).json({ error: 'No briefing available yet for this incident' });
    }

    return res.json({ briefing });
  } catch (err) {
    console.error('[incidentController.getIncidentBriefing]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── PATCH /incidents/:id/status ───────────────────────────────────────────────
async function updateIncidentStatus(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid incident ID' });
    }

    const { status } = req.body;
    const allowed = ['active', 'critical', 'resolved', 'archived'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const prevStatus = incident.status;
    incident.status = status;
    incident.updatedAt = new Date();
    await incident.save();

    // Log status change in timeline
    await TimelineEvent.create({
      incidentId: incident._id,
      eventType: 'status_changed',
      triggeredBy: 'user',
      before: { status: prevStatus },
      after: { status },
      reason: `Status manually changed from ${prevStatus} to ${status}`,
    });

    return res.json({ incident });
  } catch (err) {
    console.error('[incidentController.updateIncidentStatus]', err);
    return res.status(500).json({ error: err.message });
  }
}

export default {
  listIncidents,
  getStats,
  getIncident,
  getIncidentReports,
  getIncidentTimeline,
  getIncidentBriefing,
  updateIncidentStatus,
};
