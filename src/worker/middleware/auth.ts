import { Context, Next } from "hono";
import { sign, verify } from "hono/jwt";
import { createDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
}

// Extend Hono's Variables to include auth
declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

// Generate JWT token
export async function generateToken(
  user: { id: string; email: string; role: string },
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + 60 * 60 * 24 * 7, // 7 days
  };

  return await sign(payload, secret);
}

// Verify JWT token
export async function verifyToken(
  token: string,
  secret: string
): Promise<{ sub: string; email: string; role: string } | null> {
  try {
    const payload = await verify(token, secret);
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Extract token from Authorization header or cookie
function extractToken(c: Context): string | null {
  // Try Authorization header first
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Try cookie
  const cookie = c.req.header("Cookie");
  if (cookie) {
    const match = cookie.match(/auth_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Auth middleware - requires authentication
export function authMiddleware() {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const token = extractToken(c);

    if (!token) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Check if user still exists and is active
    const db = createDb(c.env.DB);
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });

    if (!user || !user.isActive) {
      return c.json({ error: "User not found or inactive" }, 401);
    }

    // Set auth context
    c.set("auth", {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    } as AuthContext);

    await next();
  };
}

// Optional auth middleware - adds auth context if token present
export function optionalAuthMiddleware() {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const token = extractToken(c);

    if (token) {
      const payload = await verifyToken(token, c.env.JWT_SECRET);

      if (payload) {
        c.set("auth", {
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
        } as AuthContext);
      }
    }

    await next();
  };
}

// Role-based access middleware
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth") as AuthContext | undefined;

    if (!auth) {
      return c.json({ error: "Authentication required" }, 401);
    }

    if (!allowedRoles.includes(auth.role)) {
      return c.json({ error: "Insufficient permissions" }, 403);
    }

    await next();
  };
}

// Helper to get auth context
export function getAuth(c: Context): AuthContext | undefined {
  return c.get("auth") as AuthContext | undefined;
}
