import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from '../../config/index.js';

let configured = false;

function configure() {
  if (configured) return;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  configured = true;
}

/**
 * Upload a file buffer to Cloudinary using base64 data URI.
 * This bypasses upload restrictions present on some Cloudinary accounts.
 *
 * @param {Buffer} buffer    - Raw file bytes from multer
 * @param {string} mimeType  - e.g. 'image/jpeg'
 * @returns {{ url: string, publicId: string, mimeType: string }}
 */
export async function uploadBuffer(buffer, mimeType) {
  configure();

  // Convert buffer to base64 data URI
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'civiclens/reports',
    resource_type: 'auto',
    quality: 'auto:good',
    fetch_format: 'auto',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    mimeType,
  };
}
