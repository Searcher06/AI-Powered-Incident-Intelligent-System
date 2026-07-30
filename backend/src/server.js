import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import worker from './worker/worker.js';
import { MONGODB_URI, PORT as CONFIG_PORT } from './config/index.js';

dotenv.config();

const PORT = process.env.PORT || CONFIG_PORT || 5000;
const SKIP_DB = process.env.SKIP_DB === 'true' || process.env.NODE_ENV === 'test';

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
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      worker.startWorker();
      console.log('Background worker started');
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

start();
