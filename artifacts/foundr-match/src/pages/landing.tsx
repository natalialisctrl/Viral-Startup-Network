import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { Zap, Sparkles, TrendingUp, Heart, Shield, Star, ArrowRight, Quote, X, CheckCircle2, Loader2, Play, MessageCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Watch Demo Modal ────────────────────────────────────────────────────────────
const DEMO_STEPS = [
  {
    icon: <Users className="h-6 w-6 text-cyan-400" />,
    title: "Build your profile in 60 seconds",
    desc: "Add your skills, equity range, and what excites you. Mesh builds your compatibility graph instantly.",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-violet-400" />,
    title: "AI matches you to the right people",
    desc: "Mesh analyzes 40+ signals — skills, stage, culture, pace — and serves you the highest-compatibility profiles first.",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.2)",
  },
  {
    icon: <Heart className="h-6 w-6 text-pink-400" />,
    title: "Swipe. Match. See insights.",
    desc: "When it's mutual, you get an AI breakdown of why you're a great fit — plus a ready-to-send conversation starter.",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.2)",
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-emerald-400" />,
    title: "Chat and book directly",
    desc: "No cold outreach. Chat in-app, share calendars, and move from match to meeting in under 10 minutes.",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
  },
];

function WatchDemoModal({
  onClose,
  loginAs,
  demoLoading,
}: {
  onClose: () => void;
  loginAs: (type: "talent" | "founder") => void;
  demoLoading: string | null;
}) {
  const [step, setStep] = useState(0);
  const current = DEMO_STEPS[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: "rgba(10,10,10,0.96)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 60px rgba(6,182,212,0.15), 0 40px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <X className="h-4 w-4 text-white/60" />
        </button>

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
              style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}>
              <Sparkles className="h-2.5 w-2.5" /> Mesh Demo
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">How Mesh works</h2>
          <p className="text-sm text-muted-foreground mt-0.5">4 steps from sign-up to first meeting</p>
        </div>

        {/* Step content */}
        <div className="px-7 py-6">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {DEMO_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="transition-all rounded-full"
                style={{
                  width: i === step ? "24px" : "6px",
                  height: "6px",
                  background: i === step ? "#06b6d4" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              <div
                className="p-5 rounded-2xl mb-4 flex items-start gap-4"
                style={{ background: current.bg, border: `1px solid ${current.border}` }}
              >
                <div className="p-2.5 rounded-xl shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {current.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Step {step + 1} of {DEMO_STEPS.length}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1.5">{current.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 mt-2">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-all hover:bg-white/8"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Back
            </button>
            {step < DEMO_STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9" }}
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onClose(); loginAs("talent"); }}
                  disabled={demoLoading !== null}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9" }}
                >
                  {demoLoading === "talent" ? <span className="h-3.5 w-3.5 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" /> : "🧑‍💻"}
                  Try as Engineer
                </button>
                <button
                  onClick={() => { onClose(); loginAs("founder"); }}
                  disabled={demoLoading !== null}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.8)" }}
                >
                  {demoLoading === "founder" ? <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "🚀"}
                  Try as Founder
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Waitlist Modal ─────────────────────────────────────────────────────────────
function WaitlistModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [persona, setPersona] = useState<"talent" | "founder" | "">("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ position: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, persona: persona || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      setDone({ position: data.position });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Couldn't join", description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-white/12 overflow-hidden"
        style={{ background: "rgba(10,10,10,0.97)", boxShadow: "0 0 60px rgba(6,182,212,0.12), 0 32px 64px rgba(0,0,0,0.6)" }}
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full"
            style={{ background: "radial-gradient(ellipse,rgba(6,182,212,0.12),transparent 70%)", filter: "blur(30px)" }} />
        </div>

        <button onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/8 hover:bg-white/14 transition-colors z-10">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="relative p-8">
          {done ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}>
                <CheckCircle2 className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">You're on the list</h3>
                <p className="text-muted-foreground mt-1.5 text-sm">
                  You're #{done.position} — we'll email you when your spot opens.
                </p>
              </div>
              <div className="pt-2 p-4 rounded-2xl text-sm text-center"
                style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.18)", color: "rgba(103,232,249,0.8)" }}>
                Want in faster? Try the demo now — no account needed.
              </div>
              <button onClick={onClose}
                className="w-full h-12 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h3 className="text-2xl font-black tracking-tight">Join the waitlist</h3>
                <p className="text-muted-foreground text-sm mt-1.5">
                  Drop your email and we'll ping you when your spot is ready.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "inherit" }}
                  onFocus={e => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "inherit" }}
                  onFocus={e => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">I am a…</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["talent", "founder"] as const).map(p => (
                      <button
                        key={p} type="button"
                        onClick={() => setPersona(prev => prev === p ? "" : p)}
                        className="h-10 rounded-xl text-sm font-semibold transition-all"
                        style={persona === p
                          ? { background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.45)", color: "#67e8f9" }
                          : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}
                      >
                        {p === "talent" ? "🧑‍💻 Job Seeker" : "🚀 Founder"}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 neon-cta"
                  style={{ background: "#ffffff", color: "#000000" }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "Joining…" : "Join Waitlist"}
                </button>
              </form>

              <p className="text-center text-xs text-muted-foreground/50 mt-4">
                No spam. We'll only reach out when your spot opens.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const COUNT = 55;
    const MAX_DIST = 130;

    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.5 + Math.random() * 1.5,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6,182,212,0.35)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.55 }}
    />
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate(v) {
        setDisplay(
          target >= 1000
            ? `${(v / 1000).toFixed(v >= target ? (target % 1000 === 0 ? 0 : 1) : 1)}k`
            : Math.round(v).toString()
        );
      },
    });
    return () => controls.stop();
  }, [inView, target]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const FLOAT_CARDS = [
  {
    name: "Zara K.",
    role: "ML Engineer · Seed",
    score: 94,
    tags: ["PyTorch", "LLMs"],
    cls: "float-1",
    top: "12%",
    side: "left-[-2%] md:left-[2%]",
    rotate: "-3deg",
  },
  {
    name: "NeuralBridge",
    role: "AI Infra · Series A",
    score: 97,
    tags: ["B2B", "AI"],
    cls: "float-2",
    top: "38%",
    side: "right-[-2%] md:right-[3%]",
    rotate: "4deg",
  },
  {
    name: "Marcus T.",
    role: "Full-Stack · Growth",
    score: 91,
    tags: ["React", "Go"],
    cls: "float-3",
    top: "62%",
    side: "left-[-1%] md:left-[5%]",
    rotate: "-1.5deg",
  },
];

const DEMO_PERSONAS = [
  { type: "talent" as const, emoji: "🧑‍💻", title: "Try as Engineer", desc: "Browse & swipe on startups" },
  { type: "founder" as const, emoji: "🚀",   title: "Try as Founder",  desc: "Discover top-tier talent" },
];

export default function Landing() {
  const { toast } = useToast();
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showWatchDemo, setShowWatchDemo] = useState(false);

  async function loginAs(type: "talent" | "founder") {
    setDemoLoading(type);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/users/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Demo login failed");
      const data = await res.json();
      window.location.href = base + (data.onboardingComplete === false ? "/onboarding" : "/swipe");
    } catch {
      setDemoLoading(null);
      toast({ variant: "destructive", title: "Demo login failed", description: "Please try again." });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.07]"
        style={{ background: "rgba(8,8,8,0.82)", backdropFilter: "blur(20px)" }}>
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight">Mesh</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <button
              onClick={() => setShowWaitlist(true)}
              className="rounded-full px-6 py-2 text-sm font-semibold bg-white text-black transition-all neon-cta hover:bg-white/90"
            >
              Join Waitlist
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-36 lg:pt-40 lg:pb-48">
          {/* Particle network background */}
          <div className="absolute inset-0">
            <ParticleCanvas />
          </div>

          {/* Subtle radial glow behind hero text */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(88,28,220,0.12),transparent_60%)] pointer-events-none" />

          {/* Floating profile preview cards */}
          {FLOAT_CARDS.map((card, i) => (
            <div
              key={i}
              className={`absolute hidden lg:block ${card.side} ${card.cls} pointer-events-none`}
              style={{ top: card.top, transform: `rotate(${card.rotate})` }}
            >
              <div className="w-44 glass-card rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="avatar-ring-sm shrink-0">
                    <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-sm font-black">
                      {card.name.charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{card.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{card.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {card.tags.map((t) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.18),rgba(124,58,237,0.18))", border: "1px solid rgba(6,182,212,0.22)", color: "rgba(103,232,249,0.85)" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black"
                    style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {card.score}% Match
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                </div>
              </div>
            </div>
          ))}

          <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/8 px-4 py-1.5 text-sm font-medium text-cyan-300 mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span>The #1 network for elite startup talent</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6"
            >
              <span className="text-white" style={{ textShadow: "0 0 40px rgba(255,255,255,0.12)" }}>
                Match with your
              </span>
              <br />
              <span className="text-gradient-cyan text-glow-cyan">
                dream startup.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-[580px] text-lg md:text-xl mb-3"
              style={{ color: "rgba(167,210,255,0.65)" }}
            >
              Swipe on talent that actually fits.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mx-auto max-w-[540px] text-base md:text-lg mb-10"
              style={{ color: "rgba(167,210,255,0.45)" }}
            >
              AI-powered matching for founders and builders who are done with cold emails.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => setShowWaitlist(true)}
                className="rounded-full px-10 h-14 text-lg font-bold bg-white text-black hover:bg-white/90 transition-all w-full sm:w-auto neon-cta"
              >
                Find Your Match
              </button>
              <button
                onClick={() => setShowWatchDemo(true)}
                className="flex items-center gap-2.5 rounded-full px-8 h-14 text-lg font-semibold border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto transition-all text-foreground"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 shrink-0">
                  <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                </span>
                Watch a Demo
              </button>
            </motion.div>

            {/* Demo Persona Picker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-6 flex flex-col items-center gap-3"
            >
              <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                Try the demo — no signup needed
              </p>
              <div className="flex items-center gap-3">
                {DEMO_PERSONAS.map((p) => (
                  <button
                    key={p.type}
                    onClick={() => loginAs(p.type)}
                    disabled={demoLoading !== null}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {demoLoading === p.type ? (
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <span className="text-base">{p.emoji}</span>
                    )}
                    <span className="text-white/80">{p.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
            >
              {[
                { icon: Zap,    text: "AI Matching",      color: "rgba(6,182,212,0.8)"  },
                { icon: Shield, text: "Invite-Only",       color: "rgba(167,139,250,0.8)" },
                { icon: Star,   text: "Next-Gen Founders", color: "rgba(52,211,153,0.8)"  },
              ].map(({ icon: Icon, text, color }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/70 tracking-wide"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Icon className="h-3 w-3 shrink-0" style={{ color }} />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Waitlist / Social Proof Counter */}
        <section className="py-20 border-y border-white/[0.07]"
          style={{ background: "rgba(255,255,255,0.018)", backdropFilter: "blur(8px)" }}>
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4"
            >
              Growing every day
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex flex-col items-center gap-2"
            >
              <h3 className="text-6xl md:text-7xl font-black stat-value-glow text-gradient-cyan">
                <AnimatedCounter target={1247} suffix="+" />
              </h3>
              <p className="text-base md:text-lg font-semibold" style={{ color: "rgba(167,210,255,0.7)" }}>
                founders and builders already on the waitlist
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              {[
                { label: "avg. AI match score", value: "88%" },
                { label: "startups actively hiring", value: "60+" },
                { label: "response rate on first message", value: "74%" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-black" style={{ color: "rgba(103,232,249,0.9)" }}>{s.value}</span>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground/60">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
                Built for{" "}
                <span className="text-gradient-cyan">ambitious people</span>
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Whether you're a founder looking for exceptional talent or a builder seeking your breakout startup.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "AI-Powered Matching",
                  desc: "Our model analyzes 50+ signals to surface your highest-compatibility connections first.",
                  color: "text-cyan-400",
                  bg: "rgba(6,182,212,0.1)",
                  border: "rgba(6,182,212,0.2)",
                },
                {
                  icon: Heart,
                  title: "Swipe-to-Match",
                  desc: "Tinder-style discovery meets LinkedIn depth. Swipe on potential, unlock the details.",
                  color: "text-pink-400",
                  bg: "rgba(244,114,182,0.1)",
                  border: "rgba(244,114,182,0.2)",
                },
                {
                  icon: TrendingUp,
                  title: "Traction Signals",
                  desc: "See real momentum data — who's trending, fast-replying, and growing fast.",
                  color: "text-emerald-400",
                  bg: "rgba(52,211,153,0.1)",
                  border: "rgba(52,211,153,0.2)",
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="glass-card rounded-2xl p-6 space-y-4"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-base">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 border-t border-white/[0.07]">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">
                What early members{" "}
                <span className="text-gradient-cyan">are saying</span>
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Real reactions from our beta cohort.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                {
                  quote: "This is what LinkedIn should have been. I matched with a YC-backed founder in my first session and we're in talks.",
                  name: "Marcus T.",
                  role: "Full-Stack Engineer",
                  score: "94% match",
                  delay: 0,
                },
                {
                  quote: "We hired our first founding engineer through Mesh. The AI match score was eerily accurate — she was a perfect fit.",
                  name: "Priya S.",
                  role: "Founder, VertexAI Labs",
                  score: "Hired in 11 days",
                  delay: 0.1,
                },
                {
                  quote: "I've done 3 VC-backed startups and never had a hiring tool that actually understood culture fit until this.",
                  name: "Dev P.",
                  role: "CTO & Co-founder",
                  score: "3 matches → 1 hire",
                  delay: 0.2,
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: t.delay }}
                  className="glass-card rounded-2xl p-6 flex flex-col gap-4 relative"
                >
                  <Quote className="h-5 w-5 shrink-0" style={{ color: "rgba(6,182,212,0.4)" }} />
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(226,232,240,0.85)" }}>
                    "{t.quote}"
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(124,58,237,0.12))", border: "1px solid rgba(6,182,212,0.2)", color: "#67e8f9" }}>
                      {t.score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="py-20 border-t border-white/[0.07]">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                Ready to find your match?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of founders and builders who've already made the leap.
              </p>
              <button
                onClick={() => setShowWaitlist(true)}
                className="inline-flex items-center gap-2 rounded-full px-10 h-14 text-lg font-bold bg-white text-black hover:bg-white/90 transition-all neon-cta"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showWatchDemo && <WatchDemoModal onClose={() => setShowWatchDemo(false)} loginAs={loginAs} demoLoading={demoLoading} />}
      </AnimatePresence>

      <footer className="border-t border-white/[0.07] py-10"
        style={{ background: "rgba(255,255,255,0.012)" }}>
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2026 Mesh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
