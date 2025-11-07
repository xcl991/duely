import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminMiddleware, isAdminRoute } from "./lib/admin/middleware";
import { checkMaintenanceMode } from "./lib/maintenance";

// Language detection based on country
function getLanguageFromCountry(country: string | null): string {
  // Indonesia country code
  if (country === "ID") {
    return "id";
  }
  // Default to English for all other countries
  return "en";
}

// Middleware to handle auth and language detection
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === MAINTENANCE MODE CHECK ===
  // Paths that bypass maintenance mode
  const maintenanceBypassPaths = [
    '/adminpage',           // Admin panel always accessible
    '/api/admin',           // Admin APIs work
    '/maintenance',         // Maintenance page itself
    '/_next',               // Next.js internal files
    '/favicon.ico',         // Favicon
    '/api/auth',            // NextAuth API routes
  ];

  const shouldBypass = maintenanceBypassPaths.some(path =>
    pathname.startsWith(path)
  );

  // Check maintenance mode (only for non-bypass paths)
  if (!shouldBypass) {
    const isMaintenanceActive = await checkMaintenanceMode();
    if (isMaintenanceActive) {
      // Redirect to maintenance page
      return NextResponse.rewrite(new URL('/maintenance', request.url));
    }
  }
  // === END MAINTENANCE MODE CHECK ===

  // Handle admin routes first
  if (isAdminRoute(pathname)) {
    const adminResponse = await adminMiddleware(request);
    if (adminResponse) {
      return adminResponse;
    }
  }

  // Check if this is an auth-protected route
  const isProtectedRoute = [
    "/dashboard",
    "/subscriptions",
    "/analytics",
    "/categories",
    "/members",
    "/settings",
  ].some((path) => pathname.startsWith(path));

  // Auto-detect language from IP geolocation (only if language not already set)
  const existingLanguage = request.cookies.get("duely-language")?.value;

  // Create response
  let response: NextResponse;

  if (isProtectedRoute) {
    // For protected routes, use withAuth
    const authResult = withAuth({
      callbacks: {
        authorized: ({ token }) => !!token,
      },
    })(request as any, {} as any);

    // withAuth might return a redirect or undefined
    if (authResult) {
      response = authResult as NextResponse;
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // Set language cookie if not already set
  if (!existingLanguage) {
    // Try to get country from headers (Vercel/Cloudflare provides this)
    const country =
      request.headers.get("x-vercel-ip-country") || // Vercel
      request.headers.get("cf-ipcountry") || // Cloudflare
      null;

    const detectedLanguage = getLanguageFromCountry(country);

    // Set the language cookie (expires in 1 year)
    response.cookies.set("duely-language", detectedLanguage, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
