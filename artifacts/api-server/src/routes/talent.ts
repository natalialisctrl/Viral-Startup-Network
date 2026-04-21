import { Router, type IRouter } from "express";
import { db, talentProfilesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateTalentProfileBody,
  UpdateTalentProfileBody,
  GetTalentProfileParams,
  ListTalentQueryParams,
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

function calcProfileStrength(profile: any): number {
  let score = 0;
  if (profile.fullName) score += 10;
  if (profile.headline) score += 10;
  if (profile.bio) score += 10;
  if (profile.skills?.length) score += 15;
  if (profile.yearsExperience) score += 10;
  if (profile.desiredRoles?.length) score += 10;
  if (profile.city) score += 5;
  if (profile.linkedinUrl) score += 10;
  if (profile.portfolioUrl) score += 10;
  if (profile.whyStartups) score += 10;
  return Math.min(score, 100);
}

router.get("/talent", async (req, res): Promise<void> => {
  const params = ListTalentQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = params.success ? (params.data.offset ?? 0) : 0;

  const profiles = await db.select().from(talentProfilesTable).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(talentProfilesTable);
  res.json({ profiles, total: count });
});

router.get("/talent/me", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [profile] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.userId, userId));
  if (!profile) {
    res.status(404).json({ error: "Talent profile not found" });
    return;
  }
  res.json(profile);
});

router.post("/talent/me", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = CreateTalentProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const strength = calcProfileStrength(parsed.data);
  const [profile] = await db.insert(talentProfilesTable).values({
    userId,
    ...parsed.data,
    profileStrength: strength,
  }).returning();

  res.status(201).json(profile);
});

router.patch("/talent/me", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = UpdateTalentProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.userId, userId));
  if (!existing) {
    res.status(404).json({ error: "Talent profile not found" });
    return;
  }

  const merged = { ...existing, ...parsed.data };
  const strength = calcProfileStrength(merged);

  const [profile] = await db.update(talentProfilesTable)
    .set({ ...parsed.data, profileStrength: strength })
    .where(eq(talentProfilesTable.userId, userId))
    .returning();

  res.json(profile);
});

router.get("/talent/:id", async (req, res): Promise<void> => {
  const params = GetTalentProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [profile] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.id, params.data.id));
  if (!profile) {
    res.status(404).json({ error: "Talent profile not found" });
    return;
  }
  res.json(profile);
});

export default router;
