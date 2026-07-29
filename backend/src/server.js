import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import worker from './worker/worker.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civiclens';
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
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
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
