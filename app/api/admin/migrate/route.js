import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/adminHelpers';
import { runDbMigrations, getDbConnectionString } from '@/lib/dbMigrations';

export async function GET(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const hasConnectionString = Boolean(getDbConnectionString());
  return NextResponse.json({
    configured: hasConnectionString,
    message: hasConnectionString
      ? 'Database connection string is configured.'
      : 'No DB connection string or credentials configured.',
  });
}

export async function POST(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  try {
    const result = await runDbMigrations();
    return NextResponse.json({
      success: result.status === 'completed',
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Auto-migration failed' },
      { status: 500 }
    );
  }
}
