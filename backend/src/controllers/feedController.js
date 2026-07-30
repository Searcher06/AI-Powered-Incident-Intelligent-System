import { TimelineEvent, Report, Incident } from '../models/index.js';

/**
 * GET /feed
 * Global activity feed — all timeline events across all incidents,
 * newest first, paginated, with the parent incident data attached.
 *
 * Query params:
 *   page      (default 1)
 *   limit     (default 30, max 100)
 *   eventType — filter by type: created | merged | severity_changed |
 *               briefing_updated | status_changed | confidence_changed
 *   severity  — filter by parent incident severity: low|medium|high|critical
 */
async function getFeed(req, res) {
  try {
    const { page = 1, limit = 30, eventType, severity } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * pageSize;

    // Build event filter
    const eventFilter = {};
    if (eventType) eventFilter.eventType = eventType;

    // If filtering by severity we need the matching incident IDs first
    if (severity) {
      const matchingIncidents = await Incident.find({ severity }).select('_id').lean();
      eventFilter.incidentId = { $in: matchingIncidents.map((i) => i._id) };
    }

    const [events, total] = await Promise.all([
      TimelineEvent.find(eventFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: 'incidentId',
          select: 'title category severity status location reportCount updatedAt',
        })
        .lean(),
      TimelineEvent.countDocuments(eventFilter),
    ]);

    return res.json({
      events,
      pagination: {
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('[feedController.getFeed]', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /feed/reports
 * Raw reports feed — all submitted reports, newest first, paginated.
 * Shows what citizens/officers are submitting in real time.
 *
 * Query params:
 *   page, limit, status, severity (on the report's understanding)
 */
async function getReportsFeed(req, res) {
  try {
    const { page = 1, limit = 30, status, severity } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * pageSize;

    const filter = {};
    if (status)   filter.status = status;
    if (severity) filter['understanding.severity'] = severity;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({ path: 'incidentId', select: 'title category severity status' })
        .lean(),
      Report.countDocuments(filter),
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
    console.error('[feedController.getReportsFeed]', err);
    return res.status(500).json({ error: err.message });
  }
}

export default { getFeed, getReportsFeed };
