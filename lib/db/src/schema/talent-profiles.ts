import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const talentProfilesTable = pgTable("talent_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  skills: text("skills").array().notNull().default([]),
  yearsExperience: integer("years_experience"),
  pastCompanies: text("past_companies").array().notNull().default([]),
  desiredRoles: text("desired_roles").array().notNull().default([]),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  equityExpectation: text("equity_expectation"),
  preferredIndustries: text("preferred_industries").array().notNull().default([]),
  remotePreference: text("remote_preference"),
  city: text("city"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  whyStartups: text("why_startups"),
  availabilityDate: text("availability_date"),
  workStyle: text("work_style"),
  personalityType: text("personality_type"),
  willingToRelocate: boolean("willing_to_relocate").notNull().default(false),
  visaStatus: text("visa_status"),
  cofoundingOpen: boolean("cofounding_open").notNull().default(false),
  momentumScore: integer("momentum_score").notNull().default(50),
  profileStrength: integer("profile_strength").notNull().default(0),
  avatarUrl: text("avatar_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTalentProfileSchema = createInsertSchema(talentProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTalentProfile = z.infer<typeof insertTalentProfileSchema>;
export type TalentProfile = typeof talentProfilesTable.$inferSelect;
