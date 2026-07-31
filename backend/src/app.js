import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import reportsRouter from './routes/reports.js';
import incidentsRouter from './routes/incidents.js';
import uploadRouter from './routes/upload.js';
import feedRouter from './routes/feed.js';
import transcribeRouter from './routes/transcribe.js';

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
app.use('/upload', uploadRouter);
app.use('/transcribe', transcribeRouter);
app.use('/reports', reportsRouter);
app.use('/incidents', incidentsRouter);
app.use('/feed', feedRouter);

export default app;
