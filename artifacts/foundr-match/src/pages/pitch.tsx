import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, TrendingUp, Users, DollarSign, Shield, Sparkles, ArrowRight, BarChart3, Globe } from "lucide-react";

const METRICS = [
  { label: "Waitlist", value: "2,400+", sub: "pre-launch signups", color: "#06b6d4" },
  { label: "Match Quality", value: "91%", sub: "avg AI match score", color: "#7c3aed" },
  { label: "Time to Match", value: "< 48h", sub: "avg first match", color: "#10b981" },
  { label: "Retention", value: "78%", sub: "D7 retention (demo)", color: "#f97316" },
];

const INVESTORS = [
  { q: "Why now?", a: "Remote-first hiring is permanent. LinkedIn is 20 years old. Founders waste 200+ hrs/yr on bad-fit hires. AI changed the matching problem." },
  { q: "Moat?", a: "Network effects (more founders → more talent → better matches), proprietary compatibility graph, and AI that gets smarter with every swipe." },
  { q: "Business model?", a: "Freemium SaaS — free tier for up to 10 swipes/day, Pro at $29/mo, Teams at $199/mo per seat. Pipeline fees optional." },
];

const TRACTION = [
  { label: "Landing page CVR", value: "34%", icon: <Globe className="h-4 w-4 text-cyan-400" /> },
  { label: "Demo session length", value: "4.2 min", icon: <BarChart3 className="h-4 w-4 text-violet-400" /> },
  { label: "Match-to-chat rate", value: "62%", icon: <TrendingUp className="h-4 w-4 text-emerald-400" /> },
  { label: "NPS (demo)", value: "71", icon: <Sparkles className="h-4 w-4 text-amber-400" /> },
];

export default function Pitch() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(4,4,4,0.9)", backdropFilter: "blur(20px)" }}>
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Mesh
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/mesh-logo.png" alt="Mesh" className="h-7 w-7 rounded-lg object-cover" />
          <span className="font-bold">Mesh</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}>
            Investor Brief
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:block">Confidential · May 2026</span>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-14 space-y-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}>
              <Sparkles className="h-2.5 w-2.5" /> Seed Stage
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">Pre-Series A</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none mb-3"
            style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}>
            Hiring is broken.
            <br />
            <span style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Mesh fixes it.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            The first AI-native hiring platform built for the startup ecosystem — where founders find world-class engineers in days, not months.
          </p>
        </motion.div>

        {/* Problem */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-5">The Problem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { stat: "200+", label: "hours/yr wasted on bad-fit hires per startup" },
              { stat: "$28k", label: "avg cost of a mis-hire at an early-stage company" },
              { stat: "73%", label: "of founders say hiring is their #1 bottleneck" },
            ].map((item) => (
              <div key={item.stat} className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-3xl font-black mb-1" style={{ color: "#ef4444" }}>{item.stat}</p>
                <p className="text-sm text-muted-foreground leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Solution */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-5">The Solution</h2>
          <div className="p-6 rounded-3xl"
            style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", boxShadow: "0 0 40px rgba(6,182,212,0.06)" }}>
            <p className="text-xl font-bold mb-4 leading-snug">
              Tinder-style swipe UX + LinkedIn signal depth + AI compatibility scoring — for the startup hiring market.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Zap className="h-4 w-4 text-cyan-400" />, label: "AI Match Score" },
                { icon: <Shield className="h-4 w-4 text-violet-400" />, label: "Verified Profiles" },
                { icon: <TrendingUp className="h-4 w-4 text-emerald-400" />, label: "Founder Feed" },
                { icon: <Users className="h-4 w-4 text-pink-400" />, label: "Mutual Network" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {f.icon}
                  <span className="text-xs font-semibold">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Market */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-5">Market Opportunity</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "TAM", value: "$420B", sub: "Global talent acquisition market" },
              { label: "SAM", value: "$38B", sub: "Startup & tech hiring segment" },
              { label: "SOM", value: "$1.2B", sub: "AI-native platforms (5yr)" },
            ].map((m) => (
              <div key={m.label} className="p-5 rounded-2xl text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">{m.label}</p>
                <p className="text-2xl font-black">{m.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{m.sub}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Traction Metrics */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-5">Early Traction</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {METRICS.map((m) => (
              <div key={m.label} className="p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[11px] font-semibold text-muted-foreground/60 mb-1">{m.label}</p>
                <p className="text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TRACTION.map((t) => (
              <div key={t.label} className="flex items-center gap-2.5 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {t.icon}
                <div>
                  <p className="text-sm font-black">{t.value}</p>
                  <p className="text-[10px] text-muted-foreground">{t.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Business model */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-5">Business Model</h2>
          <div className="space-y-3">
            {[
              { tier: "Free", price: "$0", desc: "10 swipes/day, 3 matches/mo — viral growth driver", highlight: false },
              { tier: "Pro", price: "$29/mo", desc: "Unlimited swipes, full AI insights, priority placement", highlight: true },
              { tier: "Teams", price: "$199/mo per seat", desc: "Multi-user, candidate pipeline, ATS integrations", highlight: false },
            ].map((t) => (
              <div key={t.tier} className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                style={{
                  background: t.highlight ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${t.highlight ? "rgba(6,182,212,0.25)" : "rgba(255,255,255,0.08)"}`,
                }}>
                <div className="flex items-center gap-2 min-w-[80px]">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <span className="text-xs font-bold uppercase tracking-wide">{t.tier}</span>
                </div>
                <span className="font-black text-sm w-32 shrink-0" style={{ color: t.highlight ? "#67e8f9" : undefined }}>{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Investor FAQ */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-5">Investor FAQs</h2>
          <div className="space-y-4">
            {INVESTORS.map((item) => (
              <div key={item.q} className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="font-bold text-sm mb-1.5" style={{ color: "#67e8f9" }}>{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="p-8 rounded-3xl text-center"
            style={{
              background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(124,58,237,0.08))",
              border: "1px solid rgba(6,182,212,0.2)",
              boxShadow: "0 0 40px rgba(6,182,212,0.08)",
            }}>
            <h2 className="text-2xl font-black mb-2">Ready to back the future of hiring?</h2>
            <p className="text-muted-foreground text-sm mb-6">Seed round open. $2M target. Lead investor conversations welcome.</p>
            <div className="flex items-center justify-center gap-3">
              <a href="mailto:invest@getmesh.io"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.9)", color: "#000" }}>
                Get in Touch <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/">
                <button className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:bg-white/8"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
                  Try the Product
                </button>
              </Link>
            </div>
          </div>
        </motion.section>

      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center"
        style={{ background: "rgba(4,4,4,0.6)" }}>
        <p className="text-[11px] text-muted-foreground/40">© 2026 Mesh Inc. · Confidential · Not for distribution · getmesh.io</p>
      </footer>
    </div>
  );
}
