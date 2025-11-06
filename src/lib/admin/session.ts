import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { AdminUser } from './auth';

/**
 * Session configuration
 */
const SESSION_CONFIG = {
  secret: new TextEncoder().encode(
    process.env.ADMIN_SESSION_SECRET || 'fallback-secret-change-in-production-2024'
  ),
  cookieName: 'admin_session',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Session payload
 */
export interface AdminSession {
  adminId: string;
  email: string;
  name: string | null;
  iat: number;
  exp: number;
}

/**
 * Create admin session
 * @param admin - Admin user
 * @returns Session token
 */
export async function createAdminSession(admin: AdminUser): Promise<string> {
  const token = await new SignJWT({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_CONFIG.maxAge}s`)
    .sign(SESSION_CONFIG.secret);

  return token;
}

/**
 * Verify admin session token
 * @param token - Session token
 * @returns Admin session or null
 */
export async function verifyAdminSession(
  token: string
): Promise<AdminSession | null> {
  try {
    const verified = await jwtVerify(token, SESSION_CONFIG.secret);
    const payload = verified.payload as unknown as AdminSession;
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Set admin session cookie
 * @param admin - Admin user
 */
export async function setAdminSessionCookie(admin: AdminUser): Promise<void> {
  const token = await createAdminSession(admin);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_CONFIG.maxAge,
    path: '/',
  });
}

/**
 * Get admin session from cookies
 * @returns Admin session or null
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_CONFIG.cookieName);

    if (!token) {
      return null;
    }

    return await verifyAdminSession(token.value);
  } catch (error) {
    return null;
  }
}

/**
 * Delete admin session cookie
 */
export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.cookieName);
}

/**
 * Check if admin is authenticated
 * @returns true if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}

/**
 * Get current admin ID from session
 * @returns Admin ID or null
 */
export async function getCurrentAdminId(): Promise<string | null> {
  const session = await getAdminSession();
  return session?.adminId || null;
}

/**
 * Get current admin email from session
 * @returns Admin email or null
 */
export async function getCurrentAdminEmail(): Promise<string | null> {
  const session = await getAdminSession();
  return session?.email || null;
}
