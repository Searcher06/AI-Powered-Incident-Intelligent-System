import dotenv from 'dotenv';
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiclens';
export const GEMMA_MODEL_VERSION = process.env.GEMMA_MODEL_VERSION || process.env.GEMMA_MODEL || 'gemma-4-31b-it';
export const PORT = process.env.PORT || 5000;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
