import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { ListNotificationsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/notifications", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = ListNotificationsQueryParams.safeParse(req.query);
  const unreadOnly = params.success ? params.data.unreadOnly : undefined;

  let query = db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)).$dynamic();
  if (unreadOnly) {
    query = query.where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
  }

  const notifications = await query;
  const [{ unreadCount }] = await db.select({ unreadCount: sql<number>`count(*)::int` }).from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

  res.json({ notifications, unreadCount });
});

router.post("/notifications/read-all", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  res.sendStatus(204);
});

export default router;
