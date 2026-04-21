import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  roleType: text("role_type"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  equityMin: text("equity_min"),
  equityMax: text("equity_max"),
  remote: boolean("remote").notNull().default(false),
  skills: text("skills").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRoleSchema = createInsertSchema(rolesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof rolesTable.$inferSelect;
