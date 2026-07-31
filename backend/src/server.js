import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import worker from './worker/worker.js';
import { MONGODB_URI, PORT as CONFIG_PORT } from './config/index.js';

dotenv.config();

const PORT = process.env.PORT || CONFIG_PORT || 5000;
const SKIP_DB = process.env.SKIP_DB === 'true' || process.env.NODE_ENV === 'test';

/**
 * Re-queue any reports that were left in 'analyzing' or 'matching' state
 * from a previous server crash or 503 failure. Runs once on startup.
 */
async function recoverStuckReports() {
  try {
    const { Report } = await import('./models/index.js');
    const queue = (await import('./worker/queue.js')).default;

    const stuck = await Report.find({
      status: { $in: ['analyzing', 'matching'] },
    }).select('_id status').lean();

    if (stuck.length > 0) {
      console.log(`[recovery] Re-queuing ${stuck.length} stuck report(s)...`);
      for (const r of stuck) {
        // Reset to submitted so the pipeline starts clean
        await Report.findByIdAndUpdate(r._id, {
          status: 'submitted',
          'pipeline.startedAt': null,
          'pipeline.analyzedAt': null,
        });
        queue.enqueue(r._id);
      }
      console.log(`[recovery] Done.`);
    }
  } catch (err) {
    console.warn('[recovery] Could not recover stuck reports:', err.message);
  }
}

async function start() {
  if (SKIP_DB) {
    console.log('SKIP_DB=true, starting server without MongoDB connection');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      worker.startWorker();
      console.log('Background worker started');
    });
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected to', MONGODB_URI);

    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      worker.startWorker();
      console.log('Background worker started');
      // Recover any reports stuck from previous runs
      await recoverStuckReports();
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

start();
