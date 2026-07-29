import { Report } from '../models/index.js';
import IncidentIntelligenceEngine from '../services/IncidentIntelligenceEngine.js';

// POST /reports
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

    // Enqueue processing and return quickly. A background worker will run the intelligence engine.
    const queueModule = await import('../worker/queue.js');
    queueModule.default.enqueue(report._id);

    return res.status(201).json({ report, message: 'Report accepted and queued for analysis' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export default { createReport };
