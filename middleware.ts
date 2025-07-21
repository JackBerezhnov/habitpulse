import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /login, /dashboard)
  const { pathname } = request.nextUrl;

  // Get session cookie from the request
  const sessionCookie = request.cookies.get('a_session_' + process.env.NEXT_PUBLIC_PROJECT_ID);
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user is on login page and has session, redirect to home
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is trying to access protected route without session, redirect to login
  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
