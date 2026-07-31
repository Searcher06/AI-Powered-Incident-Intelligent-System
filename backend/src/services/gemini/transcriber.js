import { GoogleGenAI } from '@google/genai';

let client = null;

function getClient() {
  if (client) return client;
  const apiKey = process.env.GEMMA_API_KEY; // same key works for Gemini too
  if (!apiKey) throw new Error('GEMMA_API_KEY not set');
  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Transcribe an audio buffer using Gemini 2.5 Flash.
 * Supports any language — the model returns the transcription in the
 * original language plus detects what language was spoken.
 *
 * @param {Buffer} audioBuffer  - raw audio bytes
 * @param {string} mimeType     - e.g. 'audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg'
 * @returns {{ transcript: string, detectedLanguage: string }}
 */
export async function transcribeAudio(audioBuffer, mimeType) {
  const c = getClient();
  const base64 = audioBuffer.toString('base64');

  const resp = await c.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64 } },
        {
          text: `Transcribe this audio clip exactly as spoken.
Return ONLY these two lines, no other text:
transcript: <exact words spoken>
detectedLanguage: <ISO 639-1 code, e.g. en, ha, yo, ar, fr>

If the audio is silent or unintelligible, return:
transcript: (no speech detected)
detectedLanguage: unknown`
        }
      ]
    }],
    generationConfig: { temperature: 0.0, maxOutputTokens: 256 },
  });

  const raw = resp.candidates[0]?.content?.parts[0]?.text || '';

  // Parse the two-line response
  const transcriptMatch = raw.match(/transcript:\s*(.+)/i);
  const langMatch = raw.match(/detectedLanguage:\s*([a-z]{2,3})/i);

  return {
    transcript: transcriptMatch?.[1]?.trim() || '',
    detectedLanguage: langMatch?.[1]?.trim() || 'en',
  };
}
