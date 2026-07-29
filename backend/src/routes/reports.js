import express from 'express';
import reportController from '../controllers/reportController.js';

const router = express.Router();

router.post('/', reportController.createReport);

export default router;
