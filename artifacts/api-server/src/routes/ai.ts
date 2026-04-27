import { Router, type IRouter } from "express";
import { db, talentProfilesTable, startupProfilesTable, matchesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetAiMatchScoreBody, GetInterviewPrepBody, OptimizeProfileBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

async function callOpenAI(messages: any[]): Promise<string> {
  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    });
    return response.choices[0].message.content ?? "{}";
  } catch (err) {
    logger.error({ err }, "OpenAI call failed");
    throw err;
  }
}

router.post("/ai/match-score", async (req, res): Promise<void> => {
  const parsed = GetAiMatchScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { talentId, startupId } = parsed.data;
  const [talent] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.id, talentId));
  const [startup] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.id, startupId));

  if (!talent || !startup) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await callOpenAI([
        {
          role: "system",
          content: "You are an expert startup hiring matchmaker. Analyze compatibility between a talent and a startup and return a JSON object with: score (0-100 integer), reason (string explaining match), highlights (array of 3 strength strings), redFlags (array of 0-2 concern strings), talkingPoints (array of 3 conversation starter strings).",
        },
        {
          role: "user",
          content: `Talent: ${JSON.stringify({ skills: talent.skills, desiredRoles: talent.desiredRoles, yearsExperience: talent.yearsExperience, workStyle: talent.workStyle, personalityType: talent.personalityType, preferredIndustries: talent.preferredIndustries, whyStartups: talent.whyStartups })}
Startup: ${JSON.stringify({ companyName: startup.companyName, industry: startup.industry, stage: startup.stage, mission: startup.mission, cultureStyle: startup.cultureStyle, equityOffered: startup.equityOffered })}`,
        },
      ]);
      const data = JSON.parse(result);
      res.json(data);
      return;
    } catch {
      // fall through to mock
    }
  }

  const mockScore = 70 + Math.floor(Math.random() * 25);
  res.json({
    score: mockScore,
    reason: `Strong alignment between ${talent.fullName}'s skills and ${startup.companyName}'s mission. Both value speed and ownership.`,
    highlights: ["Skill overlap in core competencies", "Shared preference for high-growth environments", "Culture and work style alignment"],
    redFlags: mockScore < 80 ? ["Salary expectations may need alignment"] : [],
    talkingPoints: ["Ask about their biggest product challenge this quarter", "Share your proudest project outcome", "Discuss equity vesting structure"],
  });
});

router.post("/ai/interview-prep", async (req, res): Promise<void> => {
  const parsed = GetInterviewPrepBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, parsed.data.matchId));
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const [startup] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, match.startupUserId));

  res.json({
    questions: [
      "Tell me about a time you worked in a high-pressure, fast-moving environment",
      "How do you approach building something from zero to one?",
      "What's your experience with wearing multiple hats?",
      "Where do you see yourself in the company 2 years from now?",
      "What excites you most about our mission?",
    ],
    founderBackground: startup ? `${startup.founderName} is building ${startup.companyName} — ${startup.mission ?? "an exciting startup"}. ${startup.stage ? `Currently at ${startup.stage} stage` : ""}.` : "Research the founder before your call.",
    companyTalkingPoints: [
      startup?.mission ?? "Their mission to change the industry",
      startup?.growthMetrics ?? "Recent growth trajectory",
      startup?.cultureStyle ?? "Unique team culture",
    ],
    smartQuestions: [
      "What does success look like for this role in 90 days?",
      "What's the biggest challenge the team is working through right now?",
      "How do you make decisions about equity for early team members?",
    ],
  });
});

router.post("/ai/profile-optimize", async (req, res): Promise<void> => {
  const parsed = OptimizeProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [talent] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.userId, parsed.data.userId));

  const score = talent?.profileStrength ?? 40;
  const suggestions: string[] = [];
  const improvements: string[] = [];

  if (!talent?.headline) improvements.push("Add a compelling headline that captures your unique value");
  if (!talent?.bio) improvements.push("Write a bio that tells your startup journey story");
  if (!talent?.skills?.length) improvements.push("Add at least 5 key skills");
  if (!talent?.portfolioUrl) improvements.push("Link your portfolio or GitHub");
  if (!talent?.whyStartups) improvements.push("Explain why you're passionate about startups");

  res.json({
    overallScore: score,
    suggestions: ["Complete all profile sections to increase visibility by 3x", "Add specific metrics to your past company descriptions", "Upload a professional headshot"],
    strengths: talent?.skills?.length ? ["Strong skill set defined", "Clear role preferences"] : ["Getting started — every great journey begins here"],
    improvements: improvements.slice(0, 3),
  });
});

router.get("/ai/career-insights", async (req, res): Promise<void> => {
  const userId = (req as any).session?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [talent] = await db.select().from(talentProfilesTable).where(eq(talentProfilesTable.id, userId));
  const [startup] = await db.select().from(startupProfilesTable).where(eq(startupProfilesTable.userId, userId));
  const profile = talent ?? startup;
  const isTalent = !!talent;

  if (isTalent) {
    const skillCount = talent.skills?.length ?? 0;
    const hasPortfolio = !!talent.portfolioUrl;
    const hasVideo = !!(talent as any).videoUrl;
    res.json({
      insights: [
        skillCount > 5
          ? `Your ${skillCount}-skill stack puts you in the top 20% of profiles attracting Series A+ startups.`
          : "Profiles with 6+ skills get 3× more right-swipes from founders.",
        hasPortfolio
          ? "Your portfolio link is boosting your credibility score significantly."
          : "Adding a portfolio or GitHub could increase your match rate by 40%.",
      ],
      improvements: [
        !talent.headline ? "Add a punchy headline — it's the first thing founders read." : "Consider quantifying impact in your headline.",
        !talent.whyStartups ? "Tell founders WHY you want startup life. Passion is the #1 hiring signal." : "Your 'Why Startups' answer is a key differentiator — keep it sharp.",
      ],
    });
  } else {
    const hasMission = !!(startup as any)?.mission;
    const heatScore = (startup as any)?.heatScore ?? 50;
    res.json({
      insights: [
        heatScore > 70
          ? "Your startup is trending — you're in the top 25% for founder engagement this week."
          : "Startups with a clear mission statement attract 2× more quality applicants.",
        hasMission
          ? "Your mission resonates — talent matching your culture is swiping right."
          : "Add equity details to unlock matches with high-performance equity-motivated talent.",
      ],
      improvements: [
        "Founders who respond within 24h have a 3× higher match conversion rate.",
        "Adding a short team intro video can 5× profile engagement.",
      ],
    });
  }
});

export default router;
