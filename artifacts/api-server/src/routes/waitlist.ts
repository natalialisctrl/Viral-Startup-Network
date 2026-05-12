import { Router } from "express";
import { db, waitlistTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/waitlist", async (req, res): Promise<void> => {
  const { email, name, persona, referrer } = req.body ?? {};

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }

  try {
    await db
      .insert(waitlistTable)
      .values({
        email: email.toLowerCase().trim(),
        name: typeof name === "string" ? name.trim().slice(0, 120) : undefined,
        persona: persona === "talent" || persona === "founder" ? persona : undefined,
        referrer: typeof referrer === "string" ? referrer.slice(0, 200) : undefined,
      })
      .onConflictDoNothing();

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(waitlistTable);

    res.json({ success: true, position: Number(total) });
  } catch {
    res.status(500).json({ error: "Failed to join waitlist" });
  }
});

router.get("/waitlist/count", async (_req, res): Promise<void> => {
  try {
    const [{ value }] = await db.select({ value: count() }).from(waitlistTable);
    res.json({ count: Number(value) });
  } catch {
    res.status(500).json({ error: "Failed to get count" });
  }
});

export default router;
