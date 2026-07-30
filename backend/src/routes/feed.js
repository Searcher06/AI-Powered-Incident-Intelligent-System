import express from 'express';
import feedController from '../controllers/feedController.js';

const router = express.Router();

// GET /feed              — paginated global activity feed (all timeline events)
router.get('/', feedController.getFeed);

// GET /feed/reports      — paginated raw reports feed
router.get('/reports', feedController.getReportsFeed);

export default router;
