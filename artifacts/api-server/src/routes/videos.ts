import { Router, type IRouter } from "express";
import { db, videosTable, startupProfilesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateVideoBody,
  LikeVideoParams,
  ListVideosQueryParams,
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

async function hydrateVideo(video: any) {
  const [startup] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.id, video.startupId));
  return { ...video, startupProfile: startup ?? null };
}

router.get("/videos", async (req, res): Promise<void> => {
  const params = ListVideosQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = params.success ? (params.data.offset ?? 0) : 0;

  const videos = await db.select().from(videosTable).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(videosTable);
  const hydrated = await Promise.all(videos.map(hydrateVideo));
  res.json({ videos: hydrated, total: count });
});

router.post("/videos", async (req, res): Promise<void> => {
  requireAuth(req, res);

  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [video] = await db.insert(videosTable).values(parsed.data).returning();
  const hydrated = await hydrateVideo(video);
  res.status(201).json(hydrated);
});

router.post("/videos/:id/like", async (req, res): Promise<void> => {
  const params = LikeVideoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [video] = await db.update(videosTable)
    .set({ likes: sql`${videosTable.likes} + 1` })
    .where(eq(videosTable.id, params.data.id))
    .returning();

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const hydrated = await hydrateVideo(video);
  res.json(hydrated);
});

export default router;
