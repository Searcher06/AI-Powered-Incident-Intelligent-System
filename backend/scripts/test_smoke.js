const PORT = process.env.PORT || 5050;
process.env.SKIP_DB = 'true';
process.env.PORT = String(PORT);

console.log('Starting smoke test: launching Express app in-process (no worker)');
import('../src/app.js')
  .then(({ default: app }) => {
    const server = app.listen(PORT, () => console.log(`App listening on ${PORT}`));

    (async function waitForHealth() {
      const deadline = Date.now() + 10000; // 10s
      let ready = false;
      while (Date.now() < deadline) {
        try {
          const res = await fetch(`http://127.0.0.1:${PORT}/health`);
          if (res.ok) {
            console.log('Health check OK');
            ready = true;
            break;
          }
        } catch (e) {
          // ignore
        }
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!ready) {
        console.error('Server did not become ready in time');
        process.exit(1);
      }

      console.log('Smoke test passed — shutting down app');
      server.close(() => console.log('App closed')); // allow process to exit naturally
    })();
  })
  .catch((err) => {
    console.error('Failed to import app:', err);
    process.exit(1);
  });
