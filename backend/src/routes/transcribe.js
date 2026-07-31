import express from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/gemini/transcriber.js';

const router = express.Router();

// Accept audio in memory — max 25MB (Gemini limit is 20MB inline)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav',
      'audio/ogg', 'audio/aac', 'audio/x-m4a', 'audio/mp3',
    ];
    cb(null, allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/'));
  },
});

/**
 * POST /transcribe
 * Accepts: multipart/form-data with field "audio"
 * Returns: { transcript, detectedLanguage }
 */
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided. Use field name "audio".' });
    }

    const { transcript, detectedLanguage } = await transcribeAudio(
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({ transcript, detectedLanguage });
  } catch (err) {
    console.error('[transcribe]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
