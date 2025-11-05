import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "./password";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Type guard: Validate credentials exist
        if (!credentials?.emailOrUsername || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Type guard: Ensure values are strings
        if (typeof credentials.emailOrUsername !== "string" || typeof credentials.password !== "string") {
          throw new Error("Invalid credentials");
        }

        // Check if input is email or username
        const isEmail = credentials.emailOrUsername.includes("@");

        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: credentials.emailOrUsername }
            : { username: credentials.emailOrUsername.toLowerCase() },
        });

        // Type guard: Validate user exists and has password
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        );

        // Type guard: Validate password match
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Type guard: Ensure email exists before returning
        if (!user.email) {
          throw new Error("Invalid user data");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "User", // Provide default if name is null
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - refresh session every 24 hours
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Type guard: Add user id to token on initial sign in
      if (user?.id) {
        token.id = user.id;
      }

      // Handle manual session updates (e.g., profile updates)
      if (trigger === "update" && session) {
        // Update token with new session data
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
        token.iat = Math.floor(Date.now() / 1000);
        return token;
      }

      // Periodically fetch fresh user data from database
      if (trigger === "update" || !token.name || !token.picture) {
        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, image: true, email: true },
          });

          if (dbUser) {
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.email = dbUser.email;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Type guard: Ensure session user exists and token has id
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
