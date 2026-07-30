import express from 'express';
import incidentController from '../controllers/incidentController.js';

const router = express.Router();

// GET /incidents         — list all incidents with optional filters
router.get('/', incidentController.listIncidents);

// GET /incidents/stats   — dashboard statistics (must be before /:id)
router.get('/stats', incidentController.getStats);

// GET /incidents/:id     — full incident detail
router.get('/:id', incidentController.getIncident);

// GET /incidents/:id/reports   — all reports linked to an incident
router.get('/:id/reports', incidentController.getIncidentReports);

// GET /incidents/:id/timeline  — timeline events for an incident
router.get('/:id/timeline', incidentController.getIncidentTimeline);

// GET /incidents/:id/briefing  — latest operational briefing
router.get('/:id/briefing', incidentController.getIncidentBriefing);

// PATCH /incidents/:id/status  — manually update status (active/resolved)
router.patch('/:id/status', incidentController.updateIncidentStatus);

export default router;
