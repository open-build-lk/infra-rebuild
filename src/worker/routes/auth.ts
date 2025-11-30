import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateToken, authMiddleware, getAuth } from "../middleware/auth";

const authRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
});

// Simple password hashing (in production, use bcrypt or argon2)
// For Cloudflare Workers, we use Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

// POST /api/v1/auth/register
authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  const body = c.req.valid("json");
  const db = createDb(c.env.DB);

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, body.email.toLowerCase()),
  });

  if (existingUser) {
    return c.json({ error: "Email already registered" }, 400);
  }

  // Create user
  const passwordHash = await hashPassword(body.password);
  const userId = generateId();
  const now = new Date();

  await db.insert(users).values({
    id: userId,
    email: body.email.toLowerCase(),
    passwordHash,
    name: body.name,
    phone: body.phone || null,
    role: "citizen",
    isActive: true,
    createdAt: now,
    lastLogin: now,
  });

  // Generate token
  const token = await generateToken(
    { id: userId, email: body.email.toLowerCase(), role: "citizen" },
    c.env.JWT_SECRET
  );

  return c.json({
    token,
    user: {
      id: userId,
      email: body.email.toLowerCase(),
      name: body.name,
      role: "citizen",
    },
  });
});

// POST /api/v1/auth/login
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json");
  const db = createDb(c.env.DB);

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, body.email.toLowerCase()),
  });

  if (!user) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  if (!user.isActive) {
    return c.json({ error: "Account is disabled" }, 403);
  }

  // Verify password
  const isValid = await verifyPassword(body.password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  // Generate token
  const token = await generateToken(
    { id: user.id, email: user.email, role: user.role },
    c.env.JWT_SECRET
  );

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// GET /api/v1/auth/me
authRoutes.get("/me", authMiddleware(), async (c) => {
  const auth = getAuth(c);
  if (!auth) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const db = createDb(c.env.DB);
  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.userId),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    provinceScope: user.provinceScope,
    districtScope: user.districtScope,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  });
});

// POST /api/v1/auth/logout
authRoutes.post("/logout", (c) => {
  // Client-side should remove the token
  return c.json({ success: true });
});

export { authRoutes };
