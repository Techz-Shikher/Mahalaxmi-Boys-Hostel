// middleware.ts (Optional - for future route protection)
// This is an optional middleware file for additional route protection if needed

import { type NextRequest, NextResponse } from 'next/server';

export function middleware(_request: NextRequest) {
  // Auth middleware logic can be added here if needed
  // Currently, we're using client-side protection with AuthContext
  return NextResponse.next();
}

// Only run middleware on specific paths if needed
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
