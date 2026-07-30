import { GoogleGenAI } from '@google/genai';
import { GEMMA_MODEL_VERSION } from '../../config/index.js';

let client = null;

export function getGemmaClient() {
  if (client) return client;
  const apiKey = process.env.GEMMA_API_KEY;
  if (!apiKey) throw new Error('GEMMA_API_KEY not set in environment');
  client = new GoogleGenAI({ apiKey });
  return client;
}

function extractTextFromResponse(resp) {
  try {
    return resp.candidates[0].content.parts[0].text || '';
  } catch (_) {
    if (typeof resp.text === 'function') return resp.text();
    if (typeof resp.text === 'string') return resp.text;
    return JSON.stringify(resp);
  }
}

/**
 * Parse Gemma 4's thinking-model bullet-point output into a plain object.
 *
 * Gemma 4 instruction-tuned models always reason out loud in bullet points
 * like:  *   `category`: "flooding"
 *        *   severity: high
 *        *   confidence: 0.9
 *
 * This function extracts field-value pairs from that format deterministically.
 * It also tries ```json fences first in case the model does use them.
 */
function parseGemmaOutput(raw, schema) {
  if (!raw) return null;

  // 1. Try ```json ... ``` code fence first
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {}
  }

  // 2. Try bare JSON (unlikely but handle it)
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try { return JSON.parse(trimmed); } catch (_) {}
  }

  // 3. Parse the bullet-point reasoning output
  // The model consistently writes:  *   `fieldName`: value  OR  *   fieldName: value
  const result = {};

  for (const field of schema) {
    // All names to try: primary name + any aliases
    const namesToTry = [field.name, ...(field.aliases || [])];
    let rawVal = null;

    for (const name of namesToTry) {
      // Match:  *   `fieldName`: ...  or  *   fieldName: ...  or  fieldName: ...
      const pattern = new RegExp(
        `(?:\\*\\s+)?\`?${name}\`?\\s*:\\s*(.+)`,
        'i'
      );
      const match = raw.match(pattern);
      if (match) {
        rawVal = match[1].trim()
          .replace(/^\*\*/, '').replace(/\*\*$/, '')
          .replace(/^"/, '').replace(/"$/, '')
          .replace(/^'/, '').replace(/'$/, '');
        break;
      }
    }

    if (!rawVal) continue;

    switch (field.type) {
      case 'number': {
        const n = parseFloat(rawVal);
        if (!isNaN(n)) result[field.name] = n;
        break;
      }
      case 'enum': {
        // find first match in allowed values (case-insensitive)
        const found = field.values.find(
          (v) => rawVal.toLowerCase().includes(v.toLowerCase())
        );
        if (found) result[field.name] = found;
        break;
      }
      case 'array': {
        // Try inline JSON array first: ["a", "b"]
        const arrMatch = rawVal.match(/\[[\s\S]*?\]/);
        if (arrMatch) {
          try {
            result[field.name] = JSON.parse(arrMatch[0]);
            break;
          } catch (_) {}
        }
        // Otherwise split by comma
        result[field.name] = rawVal
          .replace(/[\[\]]/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^["']/, '').replace(/["']$/, ''))
          .filter(Boolean);
        break;
      }
      default: // string
        result[field.name] = rawVal;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

// Schema descriptors for each call type — used by parseGemmaOutput
export const REPORT_ANALYSIS_SCHEMA = [
  { name: 'category', type: 'string' },
  { name: 'severity', type: 'enum', values: ['low', 'medium', 'high', 'critical'] },
  { name: 'confidence', type: 'number' },
  { name: 'summary', type: 'string' },
  { name: 'tags', type: 'array' },
  { name: 'affectedInfrastructure', type: 'array' },
  { name: 'affectedServices', type: 'array' },
  { name: 'recommendedResponse', type: 'string' },
];

export const FUSION_SCHEMA = [
  { name: 'decisionType', type: 'enum', values: ['merge_with_existing', 'create_new_incident', 'no_change'], aliases: ['decision', 'Decision'] },
  { name: 'selectedCandidateIndex', type: 'number', aliases: ['Index', 'index', 'selectedIndex', 'candidate_index', 'candidateIndex'] },
  { name: 'confidence', type: 'number' },
  { name: 'reasoning', type: 'string', aliases: ['Reasoning'] },
  { name: 'evidence', type: 'array' },
];

export const BRIEFING_SCHEMA = [
  { name: 'text', type: 'string' },
  { name: 'confidence', type: 'number' },
  { name: 'basedOnReportIds', type: 'array' },
];

/**
 * Call the Gemma model and return the raw text response.
 * Callers should use parseGemmaOutput() to extract structured data.
 */
export async function callModel({ prompt, temperature = 0.0 }) {
  const c = getGemmaClient();
  const model = GEMMA_MODEL_VERSION || 'gemma-4-31b-it';

  const resp = await c.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
    },
  });

  return extractTextFromResponse(resp);
}

/**
 * Call model and parse its output against the given schema.
 * Returns a plain object. Throws only on network/API errors.
 */
export async function callModelStructured({ prompt, temperature = 0.0, schema }) {
  const raw = await callModel({ prompt, temperature });
  const parsed = parseGemmaOutput(raw, schema);
  return { raw, parsed };
}
