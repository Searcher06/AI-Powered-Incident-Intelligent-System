import queue from './queue.js';
import IncidentIntelligenceEngine from '../services/IncidentIntelligenceEngine.js';

let running = false;

async function workerLoop() {
  if (running) return;
  running = true;
  while (running) {
    const id = queue.dequeue();
    if (!id) {
      // wait for enqueue
      await new Promise((resolve) => queue.once('enqueue', resolve));
      continue;
    }

    try {
      console.log('[worker] Processing report', id.toString());
      await IncidentIntelligenceEngine.processReport(id);
      console.log('[worker] Completed report', id.toString());
    } catch (err) {
      console.error('[worker] Error processing report', id.toString(), err);
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
