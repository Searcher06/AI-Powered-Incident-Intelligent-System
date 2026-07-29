import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import reportsRouter from './routes/reports.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'civiclens-backend' });
});

// API routes
app.use('/reports', reportsRouter);

export default app;
