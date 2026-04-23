import { Router, type IRouter } from "express";
import { db, startupProfilesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import {
  CreateStartupProfileBody,
  UpdateStartupProfileBody,
  GetStartupProfileParams,
  ListStartupsQueryParams,
  GetHotStartupsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/startups/hot", async (req, res): Promise<void> => {
  const params = GetHotStartupsQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 10) : 10;
  const profiles = await db.select().from(startupProfilesTable).orderBy(desc(startupProfilesTable.heatScore)).limit(limit);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(startupProfilesTable);
  res.json({ profiles, total: count });
});

router.get("/startups", async (req, res): Promise<void> => {
  const params = ListStartupsQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = params.success ? (params.data.offset ?? 0) : 0;

  const profiles = await db.select().from(startupProfilesTable).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(startupProfilesTable);
  res.json({ profiles, total: count });
});

router.get("/startups/me", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [profile] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, userId));
  if (!profile) {
    res.status(404).json({ error: "Startup profile not found" });
    return;
  }
  res.json(profile);
});

router.post("/startups/me", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = CreateStartupProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [profile] = await db
      .insert(startupProfilesTable)
      .values({ userId, ...parsed.data })
      .onConflictDoUpdate({
        target: startupProfilesTable.userId,
        set: parsed.data,
      })
      .returning();
    res.status(201).json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to create startup profile" });
  }
});

router.patch("/startups/me", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = UpdateStartupProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [profile] = await db.update(startupProfilesTable)
    .set(parsed.data)
    .where(eq(startupProfilesTable.userId, userId))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Startup profile not found" });
    return;
  }
  res.json(profile);
});

router.get("/startups/:id", async (req, res): Promise<void> => {
  const params = GetStartupProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [profile] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.id, params.data.id));
  if (!profile) {
    res.status(404).json({ error: "Startup profile not found" });
    return;
  }
  res.json(profile);
});

export default router;
