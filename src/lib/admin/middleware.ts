import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './session';

/**
 * Check if a route is an admin route
 * @param pathname - Request pathname
 * @returns true if pathname is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/adminpage');
}

/**
 * Check if admin route is public (doesn't require authentication)
 * @param pathname - Request pathname
 * @returns true if pathname is a public admin route
 */
export function isPublicAdminRoute(pathname: string): boolean {
  const publicAdminRoutes = [
    '/adminpage/auth',
    '/adminpage/auth/login',
  ];

  return publicAdminRoutes.some(route => pathname.startsWith(route));
}

/**
 * Verify admin authentication from request
 * @param request - Next.js request object
 * @returns true if admin is authenticated
 */
export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('admin_session');

    if (!token) {
      return false;
    }

    const session = await verifyAdminSession(token.value);
    return session !== null;
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return false;
  }
}

/**
 * Admin middleware - protects admin routes
 * @param request - Next.js request object
 * @returns Response or null (null means continue)
 */
export async function adminMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Only process admin routes
  if (!isAdminRoute(pathname)) {
    return null;
  }

  // Allow public admin routes (login page)
  if (isPublicAdminRoute(pathname)) {
    // If already authenticated, redirect to admin dashboard
    const isAuthenticated = await verifyAdminAuth(request);
    if (isAuthenticated && pathname.includes('/auth')) {
      return NextResponse.redirect(new URL('/adminpage/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected admin routes - require authentication
  const isAuthenticated = await verifyAdminAuth(request);

  if (!isAuthenticated) {
    // Redirect to admin login
    const loginUrl = new URL('/adminpage/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated - allow access
  return NextResponse.next();
}

/**
 * Get admin session from request (helper for API routes)
 * @param request - Next.js request object
 * @returns Admin session or null
 */
export async function getAdminSessionFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session');

    if (!token) {
      return null;
    }

    return await verifyAdminSession(token.value);
  } catch (error) {
    return null;
  }
}

/**
 * Require admin authentication (helper for API routes)
 * Throws error if not authenticated
 * @param request - Next.js request object
 * @returns Admin session
 */
export async function requireAdminAuth(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
