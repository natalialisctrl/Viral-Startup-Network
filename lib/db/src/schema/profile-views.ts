import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const profileViewsTable = pgTable("profile_views", {
  id: serial("id").primaryKey(),
  viewerId: integer("viewer_id").notNull(),
  viewedId: integer("viewed_id").notNull(),
  viewedType: text("viewed_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProfileView = typeof profileViewsTable.$inferSelect;
