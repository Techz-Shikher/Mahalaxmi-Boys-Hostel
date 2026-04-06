// middleware.ts (Disabled - using client-side auth instead)
// This middleware was causing issues in production
// Auth is handled client-side with AuthContext instead

import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Minimal matcher - only for essential files
export const config = {
  matcher: ['/api/:path*'],
};
