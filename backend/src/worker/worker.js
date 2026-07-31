import queue from './queue.js';
import IncidentIntelligenceEngine from '../services/IncidentIntelligenceEngine.js';

let running = false;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 8000; // 8 seconds between retries

function isRetryable(err) {
  // 503 = model overloaded, 429 = rate limit, fetch failed = network blip
  // All are transient and worth retrying
  return err?.status === 503 || err?.status === 429
    || err?.message?.includes('503')
    || err?.message?.includes('429')
    || err?.message?.includes('UNAVAILABLE')
    || err?.message?.includes('high demand')
    || err?.message?.includes('fetch failed')
    || err?.message?.includes('network')
    || err?.message?.includes('ECONNRESET')
    || err?.message?.includes('ETIMEDOUT');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processWithRetry(id) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await IncidentIntelligenceEngine.processReport(id);
      return; // success
    } catch (err) {
      lastErr = err;
      if (isRetryable(err) && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt; // 8s, 16s, 24s
        console.warn(`[worker] Retryable error on report ${id} (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        throw err; // non-retryable or exhausted retries
      }
    }
  }
  throw lastErr;
}

async function workerLoop() {
  if (running) return;
  running = true;
  while (running) {
    const id = queue.dequeue();
    if (!id) {
      await new Promise((resolve) => queue.once('enqueue', resolve));
      continue;
    }

    try {
      console.log('[worker] Processing report', id.toString());
      await processWithRetry(id);
      console.log('[worker] Completed report', id.toString());
    } catch (err) {
      console.error('[worker] Failed report', id.toString(), err.message || err);
    }
  }
}

function startWorker() {
  workerLoop().catch((err) => console.error('[worker] fatal', err));
}

function stopWorker() {
  running = false;
}

export default { startWorker, stopWorker };
