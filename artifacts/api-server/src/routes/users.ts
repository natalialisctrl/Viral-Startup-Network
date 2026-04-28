import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, startupProfilesTable, talentProfilesTable, matchesTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  RegisterUserBody,
  LoginUserBody,
  UpdateUserBody,
  GetUserParams,
  UpdateUserParams,
  ListUsersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/me", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/users/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, name, userType } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing) {
    res.status(409).json({ error: "Email already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    name,
    userType,
  }).returning();

  (req.session as any).userId = user.id;
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.post("/users/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: "Session error" });
      return;
    }
    (req.session as any).userId = user.id;
    req.session.save((saveErr) => {
      if (saveErr) {
        res.status(500).json({ error: "Session save error" });
        return;
      }
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    });
  });
});

router.post("/users/logout", async (req, res): Promise<void> => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.sendStatus(204);
  });
});

const DEMO_TALENT_SEED = [
  {
    name: "Jordan Kim",
    email: "jordan.kim@demo.foundr.app",
    headline: "Full-Stack Engineer · ex-Stripe · 8 yrs",
    bio: "Passionate about building scalable infrastructure. Led payments engineering at Stripe before going startup.",
    skills: ["TypeScript", "Go", "PostgreSQL", "Kubernetes", "React"],
    yearsExperience: 8,
    pastCompanies: ["Stripe", "Dropbox"],
    desiredRoles: ["CTO", "VP Engineering", "Staff Engineer"],
    salaryMin: 150000,
    salaryMax: 200000,
    equityExpectation: "0.5–2%",
    preferredIndustries: ["AI / SaaS", "FinTech"],
    remotePreference: "Remote",
    city: "New York, NY",
    momentumScore: 88,
    profileStrength: 95,
    cofoundingOpen: true,
    aiMatchScore: 92,
    aiMatchReason: "Strong engineering background at top-tier companies aligns perfectly with NeuralLeap's technical hiring needs.",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@demo.foundr.app",
    headline: "Product Designer · ex-Figma · UX Lead",
    bio: "I craft beautiful, user-centric products. Led design systems at Figma and shipped features used by millions.",
    skills: ["Figma", "User Research", "Design Systems", "Prototyping", "Motion Design"],
    yearsExperience: 6,
    pastCompanies: ["Figma", "Airbnb"],
    desiredRoles: ["Head of Design", "Product Designer"],
    salaryMin: 130000,
    salaryMax: 170000,
    equityExpectation: "0.25–1%",
    preferredIndustries: ["AI / SaaS", "Consumer"],
    remotePreference: "Hybrid",
    city: "San Francisco, CA",
    momentumScore: 84,
    profileStrength: 91,
    cofoundingOpen: false,
    aiMatchScore: 88,
    aiMatchReason: "Design expertise from Figma and Airbnb directly maps to NeuralLeap's product-led growth strategy.",
  },
  {
    name: "Marcus Chen",
    email: "marcus.chen@demo.foundr.app",
    headline: "Growth & Marketing Lead · ex-HubSpot",
    bio: "Demand gen and growth hacker. Scaled HubSpot's mid-market pipeline 4x in 2 years through content-led SEO.",
    skills: ["Growth Marketing", "SEO", "Content Strategy", "HubSpot", "Analytics"],
    yearsExperience: 5,
    pastCompanies: ["HubSpot", "Intercom"],
    desiredRoles: ["VP Marketing", "Head of Growth"],
    salaryMin: 120000,
    salaryMax: 160000,
    equityExpectation: "0.5–1.5%",
    preferredIndustries: ["AI / SaaS", "B2B"],
    remotePreference: "Remote",
    city: "Austin, TX",
    momentumScore: 79,
    profileStrength: 87,
    cofoundingOpen: true,
    aiMatchScore: 85,
    aiMatchReason: "B2B SaaS growth experience at HubSpot and Intercom is exactly what NeuralLeap needs to scale pipeline.",
  },
];

async function seedDemoTalentAndMatches(demoUserId: number, passwordHash: string, tx: any) {
  for (const seed of DEMO_TALENT_SEED) {
    const { name, email, aiMatchScore, aiMatchReason, ...profileData } = seed;

    let [talentUser] = await tx.select().from(usersTable).where(eq(usersTable.email, email));
    if (!talentUser) {
      [talentUser] = await tx.insert(usersTable).values({
        email,
        passwordHash,
        name,
        userType: "talent",
        onboardingComplete: true,
        isVerified: true,
      }).returning();
    }

    const [existingProfile] = await tx.select().from(talentProfilesTable).where(eq(talentProfilesTable.userId, talentUser.id));
    if (!existingProfile) {
      await tx.insert(talentProfilesTable).values({
        userId: talentUser.id,
        fullName: name,
        ...profileData,
      });
    }

    const [existingMatch] = await tx.select().from(matchesTable)
      .where(eq(matchesTable.talentUserId, talentUser.id));
    if (!existingMatch) {
      await tx.insert(matchesTable).values({
        talentUserId: talentUser.id,
        startupUserId: demoUserId,
        aiMatchScore,
        aiMatchReason,
        status: "active",
      });
    }
  }
}

router.post("/users/demo", async (req, res): Promise<void> => {
  const DEMO_EMAIL = "demo@foundr.app";
  const DEMO_PASSWORD = "demo-password-not-used";
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  let [demoUser] = await db.select().from(usersTable).where(eq(usersTable.email, DEMO_EMAIL));

  if (!demoUser) {
    demoUser = await db.transaction(async (tx) => {
      const [user] = await tx.insert(usersTable).values({
        email: DEMO_EMAIL,
        passwordHash,
        name: "Alex Rivera",
        userType: "startup",
        onboardingComplete: true,
        isVerified: true,
      }).returning();

      await tx.insert(startupProfilesTable).values({
        userId: user.id,
        founderName: "Alex Rivera",
        companyName: "NeuralLeap",
        mission: "Democratize AI-powered productivity tools for knowledge workers",
        elevatorPitch: "NeuralLeap is a B2B SaaS platform that uses AI to automate repetitive knowledge-work tasks. We've grown 3x in the last 6 months with $2M ARR and are backed by top-tier angels.",
        industry: "AI / SaaS",
        stage: "Series A",
        fundingRaised: 4500000,
        teamSize: 12,
        salaryBandMin: 120000,
        salaryBandMax: 180000,
        equityOffered: "0.25–1.5%",
        location: "San Francisco, CA",
        remoteOptions: "Remote-friendly",
        cultureStyle: "High-performance, async-first",
        whyJoinNow: "We're at an inflection point — growing fast with strong product-market fit. This is the perfect time to join and have outsized impact.",
        growthMetrics: "$2M ARR, 3x YoY growth, 94% retention",
        websiteUrl: "https://neuralleap.ai",
        heatScore: 92,
        isVerified: true,
        isFeatured: true,
        badges: ["🔥 Hot", "YC-backed", "Series A"],
      });

      await seedDemoTalentAndMatches(user.id, passwordHash, tx);

      return user;
    });
  } else {
    await db.update(usersTable).set({ onboardingComplete: true }).where(eq(usersTable.id, demoUser.id));

    const [existingProfile] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, demoUser.id));
    if (!existingProfile) {
      await db.insert(startupProfilesTable).values({
        userId: demoUser.id,
        founderName: "Alex Rivera",
        companyName: "NeuralLeap",
        mission: "Democratize AI-powered productivity tools for knowledge workers",
        elevatorPitch: "NeuralLeap is a B2B SaaS platform that uses AI to automate repetitive knowledge-work tasks.",
        industry: "AI / SaaS",
        stage: "Series A",
        fundingRaised: 4500000,
        teamSize: 12,
        heatScore: 92,
        isVerified: true,
        isFeatured: true,
        badges: ["🔥 Hot", "YC-backed", "Series A"],
      });
    }

    await seedDemoTalentAndMatches(demoUser.id, passwordHash, db);
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: "Session error" });
      return;
    }
    (req.session as any).userId = demoUser.id;
    req.session.save((saveErr) => {
      if (saveErr) {
        res.status(500).json({ error: "Session save error" });
        return;
      }
      const { passwordHash: _, ...safeUser } = demoUser;
      res.json({ ...safeUser, onboardingComplete: true });
    });
  });
});

router.get("/users", async (req, res): Promise<void> => {
  const params = ListUsersQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 50) : 50;
  const offset = params.success ? (params.data.offset ?? 0) : 0;
  const search = params.success ? params.data.search : undefined;

  let query = db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    userType: usersTable.userType,
    avatarUrl: usersTable.avatarUrl,
    isAdmin: usersTable.isAdmin,
    isVerified: usersTable.isVerified,
    subscriptionTier: usersTable.subscriptionTier,
    personalityType: usersTable.personalityType,
    onboardingComplete: usersTable.onboardingComplete,
    createdAt: usersTable.createdAt,
  }).from(usersTable).$dynamic();

  if (search) {
    query = query.where(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`)));
  }

  const users = await query.limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);

  res.json({ users, total: count });
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    userType: usersTable.userType,
    avatarUrl: usersTable.avatarUrl,
    isAdmin: usersTable.isAdmin,
    isVerified: usersTable.isVerified,
    subscriptionTier: usersTable.subscriptionTier,
    personalityType: usersTable.personalityType,
    onboardingComplete: usersTable.onboardingComplete,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [user] = await db.update(usersTable).set(body.data).where(eq(usersTable.id, params.data.id)).returning({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    userType: usersTable.userType,
    avatarUrl: usersTable.avatarUrl,
    isAdmin: usersTable.isAdmin,
    isVerified: usersTable.isVerified,
    subscriptionTier: usersTable.subscriptionTier,
    personalityType: usersTable.personalityType,
    onboardingComplete: usersTable.onboardingComplete,
    createdAt: usersTable.createdAt,
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export default router;
