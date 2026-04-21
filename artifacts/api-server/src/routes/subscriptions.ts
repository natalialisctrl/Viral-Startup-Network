import { Router, type IRouter } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCheckoutSessionBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

const PLANS = [
  {
    id: "free",
    name: "Talent Free",
    description: "Get started for free",
    price: 0,
    interval: "month",
    features: ["Limited swipes (10/day)", "Basic matches", "Limited chats"],
    tier: "free",
    popular: false,
  },
  {
    id: "talent_pro",
    name: "Talent Pro",
    description: "For serious job seekers",
    price: 1900,
    interval: "month",
    features: ["Unlimited swipes", "See who liked you", "AI profile optimization", "Priority ranking", "Salary insights", "Hidden mode"],
    tier: "talent_pro",
    popular: true,
  },
  {
    id: "startup_starter",
    name: "Startup Starter",
    description: "Start hiring great talent",
    price: 9900,
    interval: "month",
    features: ["50 swipes/day", "Basic chat", "3 open roles"],
    tier: "startup_starter",
    popular: false,
  },
  {
    id: "startup_growth",
    name: "Startup Growth",
    description: "Scale your team fast",
    price: 29900,
    interval: "month",
    features: ["Unlimited candidates", "AI recruiting assistant", "Featured placement", "Analytics"],
    tier: "startup_growth",
    popular: true,
  },
  {
    id: "startup_scale",
    name: "Startup Scale",
    description: "Enterprise hiring power",
    price: 59900,
    interval: "month",
    features: ["Team seats", "Bulk outreach", "Pipeline CRM", "Branded page"],
    tier: "startup_scale",
    popular: false,
  },
];

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  res.json({ plans: PLANS });
});

router.get("/subscriptions/current", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
  if (!sub) {
    res.json({
      id: 0,
      userId,
      tier: "free",
      status: "active",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  res.json(sub);
});

router.post("/subscriptions/checkout", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const plan = PLANS.find(p => p.id === parsed.data.planId);
  if (!plan) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  res.json({
    sessionId: `mock_session_${Date.now()}`,
    url: parsed.data.successUrl ?? "/premium",
  });
});

export default router;
