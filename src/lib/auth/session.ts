import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import type { User } from "next-auth";

/**
 * Get the current user in Server Components
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/**
 * Get the full session in Server Components
 * @returns Session object or null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Type guard to check if user is authenticated
 * @param user - User object or null
 * @returns true if user is authenticated
 */
export function isAuthenticated(user: User | null | undefined): user is User {
  return user !== null && user !== undefined && !!user.email;
}
