import express from 'express';
import reportController from '../controllers/reportController.js';

const router = express.Router();

// POST /reports — submit a new incident report
router.post('/', reportController.createReport);

// GET /reports — list all reports (with optional filters)
router.get('/', reportController.listReports);

// GET /reports/:id — single report detail
router.get('/:id', reportController.getReport);

export default router;
