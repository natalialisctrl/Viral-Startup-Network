import { Router, type IRouter } from "express";
import { db, profileViewsTable, usersTable, talentProfilesTable, startupProfilesTable } from "@workspace/db";
import { eq, and, gte, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.post("/profile-views", async (req, res): Promise<void> => {
  const viewerId = requireAuth(req, res);
  if (!viewerId) return;

  const { viewedId, viewedType } = req.body;
  if (!viewedId || !viewedType) {
    res.status(400).json({ error: "viewedId and viewedType required" });
    return;
  }

  if (viewerId === viewedId) {
    res.json({ ok: true });
    return;
  }

  try {
    await db.insert(profileViewsTable).values({ viewerId, viewedId, viewedType });
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

router.get("/profile-views/mine", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  let myProfileId: number | null = null;
  let myProfileType: string | null = null;

  if (user.userType === "talent") {
    const [p] = await db.select({ id: talentProfilesTable.id }).from(talentProfilesTable).where(eq(talentProfilesTable.userId, userId));
    if (p) { myProfileId = p.id; myProfileType = "talent"; }
  } else {
    const [p] = await db.select({ id: startupProfilesTable.id }).from(startupProfilesTable).where(eq(startupProfilesTable.userId, userId));
    if (p) { myProfileId = p.id; myProfileType = "startup"; }
  }

  if (!myProfileId) {
    res.json({ last24h: 0, recentViewers: [], total: 0 });
    return;
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [{ count24h }] = await db.select({ count24h: sql<number>`count(*)::int` })
    .from(profileViewsTable)
    .where(and(eq(profileViewsTable.viewedId, myProfileId), eq(profileViewsTable.viewedType, myProfileType!), gte(profileViewsTable.createdAt, since24h)));

  const [{ totalCount }] = await db.select({ totalCount: sql<number>`count(*)::int` })
    .from(profileViewsTable)
    .where(and(eq(profileViewsTable.viewedId, myProfileId), eq(profileViewsTable.viewedType, myProfileType!)));

  const allViewerRows = await db
    .select({ viewerId: profileViewsTable.viewerId })
    .from(profileViewsTable)
    .where(and(eq(profileViewsTable.viewedId, myProfileId), eq(profileViewsTable.viewedType, myProfileType!)))
    .orderBy(desc(profileViewsTable.createdAt))
    .limit(20);

  const seen = new Set<number>();
  const viewerIds: number[] = [];
  for (const r of allViewerRows) {
    if (!seen.has(r.viewerId)) { seen.add(r.viewerId); viewerIds.push(r.viewerId); }
    if (viewerIds.length >= 3) break;
  }
  const viewers: { name: string; avatarUrl: string | null }[] = [];

  for (const vid of viewerIds) {
    const [u] = await db.select({ name: usersTable.name, avatarUrl: usersTable.avatarUrl }).from(usersTable).where(eq(usersTable.id, vid));
    if (u) viewers.push(u);
  }

  res.json({ last24h: count24h, recentViewers: viewers, total: totalCount });
});

export default router;
