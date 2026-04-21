import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const startupProfilesTable = pgTable("startup_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  founderName: text("founder_name").notNull(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  mission: text("mission"),
  elevatorPitch: text("elevator_pitch"),
  industry: text("industry"),
  stage: text("stage"),
  fundingRaised: integer("funding_raised"),
  investors: text("investors").array().notNull().default([]),
  teamSize: integer("team_size"),
  salaryBandMin: integer("salary_band_min"),
  salaryBandMax: integer("salary_band_max"),
  equityOffered: text("equity_offered"),
  location: text("location"),
  remoteOptions: text("remote_options"),
  cultureStyle: text("culture_style"),
  whyJoinNow: text("why_join_now"),
  growthMetrics: text("growth_metrics"),
  websiteUrl: text("website_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  badges: text("badges").array().notNull().default([]),
  heatScore: integer("heat_score").notNull().default(50),
  isVerified: boolean("is_verified").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isSecret: boolean("is_secret").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStartupProfileSchema = createInsertSchema(startupProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStartupProfile = z.infer<typeof insertStartupProfileSchema>;
export type StartupProfile = typeof startupProfilesTable.$inferSelect;
