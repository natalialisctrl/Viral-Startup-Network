import { Router, type IRouter } from "express";
import { db, messagesTable, matchesTable } from "@workspace/db";
import { eq, lt, sql, desc } from "drizzle-orm";
import {
  SendMessageBody,
  SendMessageParams,
  ListMessagesQueryParams,
  ListMessagesParams,
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

router.get("/messages/:matchId", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const pathParams = ListMessagesParams.safeParse(req.params);
  if (!pathParams.success) {
    res.status(400).json({ error: pathParams.error.message });
    return;
  }

  const queryParams = ListMessagesQueryParams.safeParse(req.query);
  const limit = queryParams.success ? (queryParams.data.limit ?? 50) : 50;

  const matchId = pathParams.data.matchId;

  let query = db.select().from(messagesTable).where(eq(messagesTable.matchId, matchId)).$dynamic();

  if (queryParams.success && queryParams.data.before) {
    query = query.where(lt(messagesTable.id, queryParams.data.before));
  }

  const messages = await query.orderBy(desc(messagesTable.createdAt)).limit(limit);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(messagesTable).where(eq(messagesTable.matchId, matchId));

  res.json({ messages: messages.reverse(), total: count });
});

router.post("/messages/:matchId", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const pathParams = SendMessageParams.safeParse(req.params);
  if (!pathParams.success) {
    res.status(400).json({ error: pathParams.error.message });
    return;
  }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const matchId = pathParams.data.matchId;

  const [message] = await db.insert(messagesTable).values({
    matchId,
    senderId: userId,
    content: parsed.data.content,
    messageType: parsed.data.messageType ?? "text",
  }).returning();

  await db.update(matchesTable).set({ lastMessageAt: new Date() }).where(eq(matchesTable.id, matchId));

  res.status(201).json(message);
});

export default router;
