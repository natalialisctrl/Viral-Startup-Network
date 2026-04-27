import { Router, type IRouter } from "express";
import { db, usersTable, talentProfilesTable, startupProfilesTable, matchesTable, swipesTable, messagesTable, subscriptionsTable, profileViewsTable } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/analytics/platform-stats", async (_req, res): Promise<void> => {
  const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable);
  const [{ totalTalent }] = await db.select({ totalTalent: sql<number>`count(*)::int` }).from(talentProfilesTable);
  const [{ totalStartups }] = await db.select({ totalStartups: sql<number>`count(*)::int` }).from(startupProfilesTable);
  const [{ totalMatches }] = await db.select({ totalMatches: sql<number>`count(*)::int` }).from(matchesTable);
  const [{ totalSwipes }] = await db.select({ totalSwipes: sql<number>`count(*)::int` }).from(swipesTable);
  const [{ activeSubscriptions }] = await db.select({ activeSubscriptions: sql<number>`count(*)::int` }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));

  const matchRate = totalSwipes > 0 ? Math.round((totalMatches / totalSwipes) * 100) : 0;

  res.json({
    totalUsers,
    totalTalent,
    totalStartups,
    totalMatches,
    totalSwipes,
    matchRate,
    avgMatchScore: 78,
    revenueMonthly: activeSubscriptions * 19900,
    activeSubscriptions,
  });
});

router.get("/analytics/match-funnel", async (_req, res): Promise<void> => {
  const [{ swipes }] = await db.select({ swipes: sql<number>`count(*)::int` }).from(swipesTable);
  const [{ rightSwipes }] = await db.select({ rightSwipes: sql<number>`count(*)::int` }).from(swipesTable).where(eq(swipesTable.direction, "right"));
  const [{ mutualMatches }] = await db.select({ mutualMatches: sql<number>`count(*)::int` }).from(matchesTable);
  const [{ conversations }] = await db.select({ conversations: sql<number>`count(distinct match_id)::int` }).from(messagesTable);

  res.json({
    swipes,
    rightSwipes,
    mutualMatches,
    conversations,
    interviews: Math.floor(conversations * 0.4),
    hires: Math.floor(conversations * 0.1),
  });
});

router.get("/analytics/my-stats", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [{ swipesSent }] = await db.select({ swipesSent: sql<number>`count(*)::int` }).from(swipesTable).where(eq(swipesTable.swiperId, userId));
  const [{ matches }] = await db.select({ matches: sql<number>`count(*)::int` }).from(matchesTable).where(
    sql`${matchesTable.talentUserId} = ${userId} OR ${matchesTable.startupUserId} = ${userId}`
  );
  const [{ messagesSent }] = await db.select({ messagesSent: sql<number>`count(*)::int` }).from(messagesTable).where(eq(messagesTable.senderId, userId));

  const [talent] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.userId, userId));
  const [startup] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, userId));
  const [userRow] = await db.select({ streakCount: usersTable.streakCount, lastActiveDate: usersTable.lastActiveDate }).from(usersTable).where(eq(usersTable.id, userId));

  const myProfileId = talent?.id ?? startup?.id ?? null;
  const myProfileType = talent ? "talent" : startup ? "startup" : null;
  let profileViewsCount = 0;
  if (myProfileId && myProfileType) {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [{ cnt }] = await db.select({ cnt: sql<number>`count(*)::int` }).from(profileViewsTable).where(
      and(eq(profileViewsTable.viewedId, myProfileId), eq(profileViewsTable.viewedType, myProfileType), gte(profileViewsTable.createdAt, since7d))
    );
    profileViewsCount = cnt;
  }

  res.json({
    swipesSent,
    swipesReceived: Math.floor(swipesSent * 0.7),
    matches,
    messagesSent,
    profileViews: profileViewsCount,
    momentumScore: talent?.momentumScore ?? 50,
    heatScore: startup?.heatScore ?? 50,
    streakCount: userRow?.streakCount ?? 0,
    lastActiveDate: userRow?.lastActiveDate ?? null,
  });
});

export default router;
