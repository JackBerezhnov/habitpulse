import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Client, Account } from 'appwrite';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /login, /dashboard)
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Skip authentication check for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Initialize Appwrite client for server-side session validation
  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID || '');

  // Set the session from cookies if it exists
  const sessionCookie = request.cookies.get('a_session_' + process.env.NEXT_PUBLIC_PROJECT_ID);
  
  if (sessionCookie) {
    client.setSession(sessionCookie.value);
  }

  const account = new Account(client);

  try {
    // Validate the session by trying to get current user
    await account.get();
    
    // If we reach here, session is valid
    // If user is on login page with valid session, redirect to home
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow the request to continue for authenticated users
    return NextResponse.next();
    
  } catch (error) {
    // Session is invalid or doesn't exist
    // Redirect to login for protected routes
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
  }
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
