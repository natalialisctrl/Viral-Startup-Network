import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  RegisterUserBody,
  LoginUserBody,
  UpdateUserBody,
  GetUserParams,
  UpdateUserParams,
  ListUsersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/me", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/users/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, name, userType } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing) {
    res.status(409).json({ error: "Email already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    name,
    userType,
  }).returning();

  (req.session as any).userId = user.id;
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.post("/users/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  (req.session as any).userId = user.id;
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/users/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.sendStatus(204);
});

router.get("/users", async (req, res): Promise<void> => {
  const params = ListUsersQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 50) : 50;
  const offset = params.success ? (params.data.offset ?? 0) : 0;
  const search = params.success ? params.data.search : undefined;

  let query = db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    userType: usersTable.userType,
    avatarUrl: usersTable.avatarUrl,
    isAdmin: usersTable.isAdmin,
    isVerified: usersTable.isVerified,
    subscriptionTier: usersTable.subscriptionTier,
    personalityType: usersTable.personalityType,
    onboardingComplete: usersTable.onboardingComplete,
    createdAt: usersTable.createdAt,
  }).from(usersTable).$dynamic();

  if (search) {
    query = query.where(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`)));
  }

  const users = await query.limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);

  res.json({ users, total: count });
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    userType: usersTable.userType,
    avatarUrl: usersTable.avatarUrl,
    isAdmin: usersTable.isAdmin,
    isVerified: usersTable.isVerified,
    subscriptionTier: usersTable.subscriptionTier,
    personalityType: usersTable.personalityType,
    onboardingComplete: usersTable.onboardingComplete,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [user] = await db.update(usersTable).set(body.data).where(eq(usersTable.id, params.data.id)).returning({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    userType: usersTable.userType,
    avatarUrl: usersTable.avatarUrl,
    isAdmin: usersTable.isAdmin,
    isVerified: usersTable.isVerified,
    subscriptionTier: usersTable.subscriptionTier,
    personalityType: usersTable.personalityType,
    onboardingComplete: usersTable.onboardingComplete,
    createdAt: usersTable.createdAt,
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export default router;
