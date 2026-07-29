import dotenv from 'dotenv';
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiclens';
export const GEMMA_MODEL_VERSION = process.env.GEMMA_MODEL_VERSION || process.env.GEMMA_MODEL || 'gemma-4';
export const PORT = process.env.PORT || 5000;
