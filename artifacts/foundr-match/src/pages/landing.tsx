import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { Rocket, Zap, Users, Sparkles, TrendingUp, Heart, Shield, Star, ArrowRight } from "lucide-react";

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

export default function Landing() {
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
            <Link href="/register">
              <button
                className="rounded-full px-6 py-2 text-sm font-semibold bg-white text-black transition-all neon-cta hover:bg-white/90"
              >
                Join Waitlist
              </button>
            </Link>
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
                Your network,
              </span>
              <br />
              <span className="text-gradient-cyan text-glow-cyan">
                accelerated.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-[580px] text-lg md:text-xl mb-10"
              style={{ color: "rgba(167,210,255,0.65)" }}
            >
              Stop applying to jobs. Start matching with founders.
              Mesh connects ambitious talent with high-growth startups through AI-powered compatibility.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <button
                  className="rounded-full px-10 h-14 text-lg font-bold bg-white text-black hover:bg-white/90 transition-all w-full sm:w-auto neon-cta"
                >
                  Find Your Match
                </button>
              </Link>
              <Link href="/login">
                <button className="rounded-full px-10 h-14 text-lg font-semibold border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto transition-all text-foreground">
                  Sign In
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              {[
                { icon: Shield, text: "No spam, ever" },
                { icon: Zap, text: "Match in 24h" },
                { icon: Star, text: "Curated startups only" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-cyan-400/70" />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-white/[0.07]"
          style={{ background: "rgba(255,255,255,0.018)", backdropFilter: "blur(8px)" }}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Active Startups", value: 2500, suffix: "+", display: "2.5k+" },
                { label: "Elite Talent", value: 50000, suffix: "+", display: "50k+" },
                { label: "Matches Made", value: 100000, suffix: "+", display: "100k+" },
                { label: "Success Rate", value: 94, suffix: "%", display: "94%" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center justify-center space-y-2"
                >
                  <h3 className="text-4xl md:text-5xl font-black stat-value-glow text-gradient-cyan">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              ))}
            </div>
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
              <Link href="/register">
                <button className="inline-flex items-center gap-2 rounded-full px-10 h-14 text-lg font-bold bg-white text-black hover:bg-white/90 transition-all neon-cta">
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] py-10"
        style={{ background: "rgba(255,255,255,0.012)" }}>
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2025 Mesh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
