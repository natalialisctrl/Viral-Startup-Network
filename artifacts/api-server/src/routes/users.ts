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

    const inserted = await tx.insert(usersTable).values({
      email,
      passwordHash,
      name,
      userType: "talent",
      onboardingComplete: true,
      isVerified: true,
    }).onConflictDoNothing().returning();

    let talentUserId: number;
    if (inserted.length > 0) {
      talentUserId = inserted[0].id;
    } else {
      const [existing] = await tx.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
      if (!existing) continue;
      talentUserId = existing.id;
    }

    await tx.insert(talentProfilesTable).values({
      userId: talentUserId,
      fullName: name,
      ...profileData,
    }).onConflictDoNothing();

    await tx.insert(matchesTable).values({
      talentUserId,
      startupUserId: demoUserId,
      aiMatchScore,
      aiMatchReason,
      status: "active",
    }).onConflictDoNothing();
  }
}

const DEMO_STARTUP_SEED = [
  {
    email: "synthmind@demo.mesh.app",
    name: "Clara Hoffman",
    companyName: "SynthMind",
    founderName: "Clara Hoffman",
    mission: "Build the first AI co-pilot for scientific research",
    elevatorPitch: "SynthMind accelerates drug discovery with LLM-driven literature synthesis. 2x faster hypothesis generation, used by 3 top-10 pharma firms. Seed round: $3.2M.",
    industry: "AI / BioTech",
    stage: "Seed",
    fundingRaised: 3200000,
    teamSize: 6,
    salaryBandMin: 130000,
    salaryBandMax: 175000,
    equityOffered: "0.5–2%",
    location: "Boston, MA",
    remoteOptions: "Remote-first",
    cultureStyle: "Research-driven, deep technical",
    whyJoinNow: "We're at the frontier of AI + science. Join us before Series A.",
    growthMetrics: "3 enterprise pilots, $800K ARR, 2x MoM",
    websiteUrl: "https://synthmind.ai",
    heatScore: 87,
    isVerified: true,
    isFeatured: true,
    badges: ["🧬 BioAI", "Seed"],
  },
  {
    email: "flowstate@demo.mesh.app",
    name: "Dev Patel",
    companyName: "FlowState",
    founderName: "Dev Patel",
    mission: "Help remote teams reach deep work together",
    elevatorPitch: "FlowState is async-first collaboration for engineering teams. We've replaced Slack + Jira for 120+ startups. Growing 25% MoM with $1.4M ARR.",
    industry: "SaaS / Productivity",
    stage: "Seed",
    fundingRaised: 2800000,
    teamSize: 9,
    salaryBandMin: 110000,
    salaryBandMax: 160000,
    equityOffered: "0.25–1.5%",
    location: "Remote",
    remoteOptions: "Fully remote",
    cultureStyle: "Async-first, autonomous",
    whyJoinNow: "Series A imminent. Huge opportunity to shape the product direction.",
    growthMetrics: "$1.4M ARR, 120+ customers, 25% MoM",
    websiteUrl: "https://flowstate.app",
    heatScore: 82,
    isVerified: true,
    isFeatured: false,
    badges: ["⚡ Fast Growing"],
  },
  {
    email: "arkwright@demo.mesh.app",
    name: "Yuki Tanaka",
    companyName: "Arkwright",
    founderName: "Yuki Tanaka",
    mission: "Automate compliance for financial services",
    elevatorPitch: "Arkwright turns regulatory documents into automated audit trails. $4M ARR, SOC2 certified, deployed at 2 top-5 US banks. Series A: $10M.",
    industry: "FinTech / RegTech",
    stage: "Series A",
    fundingRaised: 10000000,
    teamSize: 22,
    salaryBandMin: 150000,
    salaryBandMax: 200000,
    equityOffered: "0.1–0.75%",
    location: "New York, NY",
    remoteOptions: "Hybrid",
    cultureStyle: "Execution-focused, high ownership",
    whyJoinNow: "We're scaling to 50 enterprise clients this year. Come build the compliance layer for finance.",
    growthMetrics: "$4M ARR, 2 top-5 bank clients, Series A closed",
    websiteUrl: "https://arkwright.io",
    heatScore: 91,
    isVerified: true,
    isFeatured: true,
    badges: ["🏦 FinTech", "Series A", "🔥 Hot"],
  },
  {
    email: "siftai@demo.mesh.app",
    name: "Marcus Bell",
    companyName: "Sift AI",
    founderName: "Marcus Bell",
    mission: "Eliminate fraud before it happens with real-time AI",
    elevatorPitch: "Sift AI detects transaction fraud 10x faster than legacy rules engines. $2.8M ARR, 40+ e-commerce clients. YC W23.",
    industry: "AI / FinTech",
    stage: "Seed",
    fundingRaised: 4500000,
    teamSize: 11,
    salaryBandMin: 125000,
    salaryBandMax: 165000,
    equityOffered: "0.3–1.5%",
    location: "San Francisco, CA",
    remoteOptions: "Remote-friendly",
    cultureStyle: "Fast-paced, data-obsessed",
    whyJoinNow: "YC-backed and growing fast. Great time to join before Series A valuation jumps.",
    growthMetrics: "$2.8M ARR, 40+ clients, YC W23",
    websiteUrl: "https://siftai.co",
    heatScore: 89,
    isVerified: true,
    isFeatured: false,
    badges: ["YC W23", "⚡ Fast Growing"],
  },
  {
    email: "portali@demo.mesh.app",
    name: "Leila Hassan",
    companyName: "Portali",
    founderName: "Leila Hassan",
    mission: "Make global hiring as easy as local hiring",
    elevatorPitch: "Portali is the Rippling for international teams — payroll, compliance, and benefits in 60+ countries. $1.9M ARR, 90 customers, growing 30% MoM.",
    industry: "HR Tech / Global",
    stage: "Seed",
    fundingRaised: 3800000,
    teamSize: 14,
    salaryBandMin: 115000,
    salaryBandMax: 155000,
    equityOffered: "0.25–1%",
    location: "London, UK (Remote)",
    remoteOptions: "Fully remote",
    cultureStyle: "Global-first, inclusive",
    whyJoinNow: "Massive TAM, strong PMF, and a team that's already done this before.",
    growthMetrics: "$1.9M ARR, 90 customers, 30% MoM",
    websiteUrl: "https://portali.hr",
    heatScore: 78,
    isVerified: true,
    isFeatured: false,
    badges: ["🌍 Global"],
  },
];

async function seedDemoStartupsForTalent(_talentUserId: number, passwordHash: string) {
  for (const seed of DEMO_STARTUP_SEED) {
    const { email, name, companyName, founderName, ...profileData } = seed;

    const inserted = await db.insert(usersTable).values({
      email,
      passwordHash,
      name,
      userType: "startup",
      onboardingComplete: true,
      isVerified: true,
    }).onConflictDoNothing().returning();

    let startupUserId: number;
    if (inserted.length > 0) {
      startupUserId = inserted[0].id;
    } else {
      const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
      if (!existing) continue;
      startupUserId = existing.id;
    }

    await db.insert(startupProfilesTable).values({
      userId: startupUserId,
      companyName,
      founderName,
      ...profileData,
    }).onConflictDoNothing();
  }
}

router.post("/users/demo", async (req, res): Promise<void> => {
  const type = (req.body?.type ?? "founder") as "talent" | "founder";
  const DEMO_PASSWORD = "demo-password-not-used";
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  let demoUser: typeof import("@workspace/db").usersTable.$inferSelect;

  if (type === "talent") {
    const TALENT_EMAIL = "demo@talent.com";
    let [existing] = await db.select().from(usersTable).where(eq(usersTable.email, TALENT_EMAIL));

    if (!existing) {
      [existing] = await db.insert(usersTable).values({
        email: TALENT_EMAIL,
        passwordHash,
        name: "Jordan Kim",
        userType: "talent",
        onboardingComplete: true,
        isVerified: true,
      }).returning();

      await db.insert(talentProfilesTable).values({
        userId: existing.id,
        fullName: "Jordan Kim",
        headline: "Full-Stack Engineer · ex-Stripe · 8 yrs",
        bio: "Passionate about building scalable infrastructure. Led payments engineering at Stripe before going startup. Looking for my next big bet.",
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
      });
    } else {
      await db.update(usersTable).set({ onboardingComplete: true }).where(eq(usersTable.id, existing.id));
    }

    await seedDemoStartupsForTalent(existing.id, passwordHash);
    demoUser = existing;

  } else {
    const FOUNDER_EMAIL = "demo@founder.com";
    let [existing] = await db.select().from(usersTable).where(eq(usersTable.email, FOUNDER_EMAIL));

    if (!existing) {
      existing = await db.transaction(async (tx) => {
        const [user] = await tx.insert(usersTable).values({
          email: FOUNDER_EMAIL,
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
          whyJoinNow: "We're at an inflection point — growing fast with strong product-market fit.",
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
      await db.update(usersTable).set({ onboardingComplete: true }).where(eq(usersTable.id, existing.id));
      const [existingProfile] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, existing.id));
      if (!existingProfile) {
        await db.insert(startupProfilesTable).values({
          userId: existing.id,
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
      await seedDemoTalentAndMatches(existing.id, passwordHash, db);
    }

    demoUser = existing;
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
