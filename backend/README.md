# CivicLens Backend (MVP)

This backend implements the AI-first Incident Intelligence Engine pipeline for the CivicLens hackathon MVP.

## Quick start (development)

1. Install dependencies:

```bash
cd backend
pnpm install
```

2. Start the server (with Mongo):

```bash
pnpm run dev
```

3. For smoke testing (no Mongo connection):

```bash
# runs server with SKIP_DB=true on port 5050 and checks /health
pnpm run smoke
```

> Note: on Windows the smoke test intentionally leaves the server running to avoid an intermittent libuv assertion; stop the server manually when finished.

## Posting demo reports

Run a running backend (preferably with Mongo running). Then post the demo dataset:

```bash
pnpm run demo:post
```

This posts the sample reports from `demo/sample_reports.json` to `POST /reports`.

## Project structure

- `src/models` — Mongoose models (Report, Incident, FusionDecision, Briefing, TimelineEvent)
- `src/services` — Core intelligence services and orchestrator
- `src/controllers` — Express controllers
- `src/routes` — Route definitions
- `src/worker` — simple in-process queue and worker
- `demo` — sample dataset and poster script
- `scripts` — smoke test

## Next steps

- Add unit and integration tests (recommended)
- Add Redis-backed queue for scale
- Integrate real Gemma client
- Add monitoring and tracing

