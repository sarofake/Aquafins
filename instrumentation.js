export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { runDbMigrations } = await import('./lib/dbMigrations.mjs');
      const result = await runDbMigrations();

      if (result.status === 'skipped') {
        console.warn(`[Instrumentation] Auto-migration skipped (${result.reason}): ${result.message || ''}`);
      } else if (result.status === 'failed') {
        console.warn(
          `[Instrumentation] Auto-migration failed: ${result.error ||
            result.results?.find((item) => item.status === 'failed')?.error ||
            'unknown error'}`
        );
      } else {
        console.log(
          `[Instrumentation] Auto-migration complete (${result.appliedCount ?? 0} applied, ${result.skippedCount ?? 0} skipped)`
        );
      }
    } catch (err) {
      console.warn('[Instrumentation] Migration check warning:', err?.message || err);
    }
  }
}
