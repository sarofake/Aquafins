export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { runDbMigrations } = await import('./lib/dbMigrations.js');
      await runDbMigrations();
    } catch (err) {
      console.warn('[Instrumentation] Migration check warning:', err?.message || err);
    }
  }
}
