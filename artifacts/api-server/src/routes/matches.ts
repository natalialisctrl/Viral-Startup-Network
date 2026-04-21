import { Router, type IRouter } from "express";
import { db, matchesTable, talentProfilesTable, startupProfilesTable, usersTable } from "@workspace/db";
import { eq, or, sql } from "drizzle-orm";
import { GetMatchParams } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

async function hydrateMatch(match: any) {
  const [talent] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.userId, match.talentUserId));
  const [startup] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, match.startupUserId));
  return {
    ...match,
    talentProfile: talent ?? null,
    startupProfile: startup ?? null,
  };
}

router.get("/matches", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const matches = await db.select().from(matchesTable).where(
    or(eq(matchesTable.talentUserId, userId), eq(matchesTable.startupUserId, userId))
  );

  const hydrated = await Promise.all(matches.map(hydrateMatch));
  res.json({ matches: hydrated, total: hydrated.length });
});

router.get("/matches/:id", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = GetMatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, params.data.id));
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const hydrated = await hydrateMatch(match);
  res.json(hydrated);
});

export default router;
