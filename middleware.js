import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Health checks are hit by uptime monitors and must stay unthrottled.
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    // Apply strict rate limiting for login authentication requests (10 requests per minute)
    if (pathname.startsWith('/api/admin/login')) {
      const authLimit = checkRateLimit(req, {
        limit: 10,
        windowMs: 60 * 1000,
        keyPrefix: 'auth',
      });
      if (!authLimit.success) {
        return rateLimitResponse(authLimit);
      }
    } else {
      // Apply standard rate limiting for general API routes (60 requests per minute)
      const apiLimit = checkRateLimit(req, {
        limit: 60,
        windowMs: 60 * 1000,
        keyPrefix: 'api',
      });
      if (!apiLimit.success) {
        return rateLimitResponse(apiLimit);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
