import { Router, type IRouter } from "express";
import { db, rolesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateRoleBody,
  UpdateRoleBody,
  GetRoleParams,
  UpdateRoleParams,
  DeleteRoleParams,
  ListRolesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/roles", async (req, res): Promise<void> => {
  const params = ListRolesQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const startupId = params.success ? params.data.startupId : undefined;

  let query = db.select().from(rolesTable).$dynamic();
  if (startupId) {
    query = query.where(eq(rolesTable.startupId, startupId));
  }
  const roles = await query.limit(limit);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(rolesTable);
  res.json({ roles, total: count });
});

router.post("/roles", async (req, res): Promise<void> => {
  const parsed = CreateRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [role] = await db.insert(rolesTable).values(parsed.data).returning();
  res.status(201).json(role);
});

router.get("/roles/:id", async (req, res): Promise<void> => {
  const params = GetRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, params.data.id));
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  res.json(role);
});

router.patch("/roles/:id", async (req, res): Promise<void> => {
  const params = UpdateRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [role] = await db.update(rolesTable).set(parsed.data).where(eq(rolesTable.id, params.data.id)).returning();
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  res.json(role);
});

router.delete("/roles/:id", async (req, res): Promise<void> => {
  const params = DeleteRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [role] = await db.delete(rolesTable).where(eq(rolesTable.id, params.data.id)).returning();
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
