import { Router, type IRouter } from "express";
import { db, swipesTable, matchesTable, talentProfilesTable, startupProfilesTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

import {
  CreateSwipeBody,
  ListMySwipesQueryParams,
} from "@workspace/api-zod";

async function updateStreak(userId: number): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const [user] = await db.select({ streakCount: usersTable.streakCount, lastActiveDate: usersTable.lastActiveDate }).from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return;
    if (user.lastActiveDate === today) return;
    const newStreak = user.lastActiveDate === yesterday ? (user.streakCount ?? 0) + 1 : 1;
    await db.update(usersTable).set({ streakCount: newStreak, lastActiveDate: today }).where(eq(usersTable.id, userId));
  } catch { /* non-critical */ }
}

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.post("/swipes", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = CreateSwipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { targetId, targetType, direction } = parsed.data;

  const [swipe] = await db.insert(swipesTable).values({
    swiperId: userId,
    targetId,
    targetType,
    direction,
  }).returning();

  updateStreak(userId);

  let matched = false;
  let matchId: number | null = null;

  if (direction === "right" || direction === "up") {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (user.userType === "talent") {
      const [myTalent] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.userId, userId));
      if (myTalent) {
        const [reverseSwipe] = await db.select().from(swipesTable).where(
          and(
            eq(swipesTable.swiperId, targetId),
            eq(swipesTable.targetId, myTalent.id),
            eq(swipesTable.targetType, "talent"),
          )
        );

        if (reverseSwipe && (reverseSwipe.direction === "right" || reverseSwipe.direction === "up")) {
          const existingMatch = await db.select().from(matchesTable).where(
            and(eq(matchesTable.talentUserId, userId), eq(matchesTable.startupUserId, targetId))
          );
          if (!existingMatch.length) {
            const [match] = await db.insert(matchesTable).values({
              talentUserId: userId,
              startupUserId: targetId,
            }).returning();
            matched = true;
            matchId = match.id;

            await db.insert(notificationsTable).values([
              { userId, type: "match", title: "New Match!", body: "You have a new mutual match. Start chatting now.", relatedId: match.id },
              { userId: targetId, type: "match", title: "New Match!", body: "You have a new mutual match. Start chatting now.", relatedId: match.id },
            ]);
          }
        }
      }
    } else if (user.userType === "founder") {
      const [myStartup] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, userId));
      if (myStartup) {
        const [reverseSwipe] = await db.select().from(swipesTable).where(
          and(
            eq(swipesTable.swiperId, targetId),
            eq(swipesTable.targetId, myStartup.id),
            eq(swipesTable.targetType, "startup"),
          )
        );

        if (reverseSwipe && (reverseSwipe.direction === "right" || reverseSwipe.direction === "up")) {
          const existingMatch = await db.select().from(matchesTable).where(
            and(eq(matchesTable.talentUserId, targetId), eq(matchesTable.startupUserId, userId))
          );
          if (!existingMatch.length) {
            const [match] = await db.insert(matchesTable).values({
              talentUserId: targetId,
              startupUserId: userId,
            }).returning();
            matched = true;
            matchId = match.id;

            await db.insert(notificationsTable).values([
              { userId, type: "match", title: "New Match!", body: "You have a new mutual match. Start chatting now.", relatedId: match.id },
              { userId: targetId, type: "match", title: "New Match!", body: "You have a new mutual match. Start chatting now.", relatedId: match.id },
            ]);
          }
        }
      }
    }
  }

  res.status(201).json({
    id: swipe.id,
    matched,
    matchId,
    direction: swipe.direction,
    createdAt: swipe.createdAt.toISOString(),
  });
});

router.get("/swipes/history", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = ListMySwipesQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 50) : 50;

  const swipes = await db.select().from(swipesTable).where(eq(swipesTable.swiperId, userId)).limit(limit);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(swipesTable).where(eq(swipesTable.swiperId, userId));
  res.json({ swipes, total: count });
});

export default router;
