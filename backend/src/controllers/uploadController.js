import { uploadBuffer } from '../services/cloudinary/uploader.js';

/**
 * POST /upload
 * Accepts: multipart/form-data with field "image"
 * Returns: { url, publicId, mimeType }
 *
 * The frontend calls this first, gets back the Cloudinary URL,
 * then includes that URL in the mediaAssets array when POSTing to /reports.
 */
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided. Use field name "image".' });
    }

    const result = await uploadBuffer(req.file.buffer, req.file.mimetype);

    return res.status(201).json({
      url: result.url,
      publicId: result.publicId,
      mimeType: result.mimeType,
      message: 'Image uploaded successfully',
    });
  } catch (err) {
    console.error('[uploadController]', err.message);

    // Give a clear actionable message if this is a Cloudinary permissions issue
    if (err.message?.includes('403') || err.message?.includes('forbidden') || err.message?.includes('missing permissions')) {
      return res.status(503).json({
        error: 'Image upload unavailable: Cloudinary API key does not have upload permissions. Go to Cloudinary Console → Settings → Access Keys and enable "Upload" permission on your API key.',
      });
    }

    return res.status(500).json({ error: err.message });
  }
}

export default { uploadImage };
