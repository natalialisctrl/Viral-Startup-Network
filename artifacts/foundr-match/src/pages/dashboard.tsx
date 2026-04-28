import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout";
import { useGetMyStats, useGetMyTalentProfile, useGetMyStartupProfile, getGetMyStatsQueryKey, getGetMyTalentProfileQueryKey, getGetMyStartupProfileQueryKey } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Eye, MessageSquare, Flame, TrendingUp, Brain, Users, Share2, ArrowRight, Sparkles, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const HOT_PROFILES_TALENT = [
  { id: 1,  name: "Zara K.",    role: "AI/ML Engineer",        score: 94, archetype: "ML Engineer",        cls: "text-cyan-300 border-cyan-500/35 bg-cyan-500/10" },
  { id: 2,  name: "Marcus T.",  role: "Full-Stack Builder",     score: 91, archetype: "Full-Stack Builder",  cls: "text-blue-300 border-blue-500/35 bg-blue-500/10" },
  { id: 3,  name: "Priya R.",   role: "Growth Hacker",          score: 89, archetype: "Growth Hacker",       cls: "text-orange-300 border-orange-500/35 bg-orange-500/10" },
  { id: 4,  name: "Dev P.",     role: "Tech Architect",         score: 88, archetype: "Tech Architect",      cls: "text-emerald-300 border-emerald-500/35 bg-emerald-500/10" },
  { id: 5,  name: "Sam L.",     role: "Product Thinker",        score: 87, archetype: "Product Thinker",     cls: "text-violet-300 border-violet-500/35 bg-violet-500/10" },
  { id: 6,  name: "Aisha M.",   role: "Design Lead",            score: 85, archetype: "Design Lead",         cls: "text-pink-300 border-pink-500/35 bg-pink-500/10" },
];

const HOT_PROFILES_STARTUP = [
  { id: 7,  name: "NeuralBridge", role: "AI Infrastructure · Seed",  score: 96, archetype: "AI Pioneer",        cls: "text-cyan-300 border-cyan-500/35 bg-cyan-500/10" },
  { id: 8,  name: "Veritas",      role: "FinTech · Series A",        score: 93, archetype: "FinTech Visionary",  cls: "text-violet-300 border-violet-500/35 bg-violet-500/10" },
  { id: 9,  name: "Flowbase",     role: "DevTools · Pre-seed",       score: 91, archetype: "DevTools Builder",   cls: "text-sky-300 border-sky-500/35 bg-sky-500/10" },
  { id: 10, name: "Cura",         role: "Health Tech · Seed",        score: 89, archetype: "Impact Builder",     cls: "text-emerald-300 border-emerald-500/35 bg-emerald-500/10" },
  { id: 11, name: "Edify",        role: "EdTech · Pre-seed",         score: 87, archetype: "EdTech Pioneer",     cls: "text-amber-300 border-amber-500/35 bg-amber-500/10" },
  { id: 12, name: "Pinnacle",     role: "B2B SaaS · Seed",           score: 85, archetype: "Startup Operator",   cls: "text-orange-300 border-orange-500/35 bg-orange-500/10" },
];

async function fetchProfileViewers() {
  const res = await fetch("/api/profile-views/mine", { credentials: "include" });
  if (!res.ok) return { last24h: 0, recentViewers: [], total: 0 };
  return res.json();
}

async function fetchCareerInsights() {
  const res = await fetch("/api/ai/career-insights", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export default function Dashboard() {
  const { user } = useAuth();
  const isTalent = user?.userType === "talent";

  const { data: stats, isLoading: statsLoading } = useGetMyStats({ query: { queryKey: getGetMyStatsQueryKey() } });
  const { data: talentProfile, isLoading: talentLoading } = useGetMyTalentProfile({ query: { enabled: isTalent, queryKey: getGetMyTalentProfileQueryKey() } });
  const { data: startupProfile } = useGetMyStartupProfile({ query: { enabled: !isTalent, queryKey: getGetMyStartupProfileQueryKey() } });
  const { data: viewerData } = useQuery({ queryKey: ["profileViewers"], queryFn: fetchProfileViewers, staleTime: 60_000 });
  const { data: careerInsights } = useQuery({ queryKey: ["careerInsights"], queryFn: fetchCareerInsights, staleTime: 300_000 });

  const isLoading = statsLoading || talentLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <div className="h-10 w-56 bg-white/5 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/4 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  const score = isTalent ? talentProfile?.profileStrength || 0 : startupProfile?.heatScore || 0;
  const scoreLabel = isTalent ? "Profile Strength" : "Heat Score";
  const streakCount = (stats as any)?.streakCount ?? 0;

  const swipes   = (stats?.swipesSent ?? 0)  || 24;
  const matches  = (stats?.matches    ?? 0)  || 7;
  const convos   = Math.max(1, Math.round(matches * 0.57));
  const meetings = Math.max(0, Math.round(convos  * 0.4));
  const funnelStages = [
    { label: "Swipes",   val: swipes,   pct: 100,                                   color: "from-white/25 to-white/10" },
    { label: "Matches",  val: matches,  pct: swipes  ? Math.round(matches  / swipes  * 100) : 0, color: "from-cyan-500 to-cyan-400" },
    { label: "Convos",   val: convos,   pct: matches ? Math.round(convos   / matches * 100) : 0, color: "from-violet-500 to-violet-400" },
    { label: "Meetings", val: meetings, pct: convos  ? Math.round(meetings / convos  * 100) : 0, color: "from-emerald-500 to-emerald-400" },
  ];

  const hotProfiles = isTalent ? HOT_PROFILES_STARTUP : HOT_PROFILES_TALENT;

  const shareMatch = () => {
    const text = "I just matched with a startup on Mesh 🚀 Your network, accelerated.";
    if (navigator.share) {
      navigator.share({ text, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Copied!")).catch(() => {});
    }
  };

  return (
    <AppLayout>
      <div className="p-5 max-w-4xl mx-auto space-y-6 pb-28 md:pb-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between pt-2"
        >
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ textShadow: "0 0 24px rgba(255,255,255,0.15)" }}>
              Welcome back,{" "}
              <span style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>
                {user?.name?.split(" ")[0]}
              </span>
            </h1>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "rgba(103,232,249,0.65)" }}>
              Here's your momentum today.
            </p>
          </div>
          {streakCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex flex-col items-center rounded-2xl px-4 py-3"
              style={{
                background: "linear-gradient(135deg,rgba(249,115,22,0.18),rgba(220,38,38,0.12))",
                border: "1px solid rgba(249,115,22,0.3)",
                boxShadow: "0 0 20px rgba(249,115,22,0.15)",
              }}
            >
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-black" style={{ color: "#f97316" }}>{streakCount}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">streak</span>
            </motion.div>
          )}
        </motion.div>

        {/* Streak Banner */}
        {streakCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg,rgba(249,115,22,0.1),rgba(220,38,38,0.08))",
              border: "1px solid rgba(249,115,22,0.25)",
              boxShadow: "0 0 24px rgba(249,115,22,0.1)",
            }}
          >
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-sm">{streakCount} Day Streak — Keep it up!</p>
              <p className="text-xs text-muted-foreground">Stay active to boost your visibility in the feed</p>
            </div>
            <Badge className="ml-auto text-[10px] font-bold" style={{ background: "rgba(249,115,22,0.2)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.35)" }}>
              Active
            </Badge>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: isTalent ? <Zap className="h-5 w-5" style={{ color: "#06b6d4" }} /> : <Flame className="h-5 w-5" style={{ color: "#f97316" }} />,
              iconBg: isTalent ? "rgba(6,182,212,0.12)" : "rgba(249,115,22,0.12)",
              iconBorder: isTalent ? "rgba(6,182,212,0.25)" : "rgba(249,115,22,0.25)",
              iconGlow: isTalent ? "rgba(6,182,212,0.25)" : "rgba(249,115,22,0.25)",
              label: scoreLabel,
              value: `${score}%`,
              extra: (
                <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-white/8">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                    style={{ background: isTalent ? "linear-gradient(90deg,#06b6d4,#7c3aed)" : "linear-gradient(90deg,#f97316,#ef4444)" }}
                  />
                </div>
              ),
              delay: 0.1,
            },
            {
              icon: <Eye className="h-5 w-5 text-blue-400" />,
              iconBg: "rgba(96,165,250,0.12)",
              iconBorder: "rgba(96,165,250,0.25)",
              iconGlow: "rgba(96,165,250,0.3)",
              label: "Profile Views",
              value: stats?.profileViews ?? 0,
              sub: "Last 7 days",
              delay: 0.2,
            },
            {
              icon: <MessageSquare className="h-5 w-5 text-emerald-400" />,
              iconBg: "rgba(52,211,153,0.12)",
              iconBorder: "rgba(52,211,153,0.25)",
              iconGlow: "rgba(52,211,153,0.3)",
              label: "Matches",
              value: stats?.matches ?? 0,
              delay: 0.3,
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-violet-400" />,
              iconBg: "rgba(167,139,250,0.12)",
              iconBorder: "rgba(167,139,250,0.25)",
              iconGlow: "rgba(167,139,250,0.3)",
              label: "Swipes Made",
              value: stats?.swipesSent ?? 0,
              delay: 0.4,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.034)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(10px)",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="p-2 rounded-xl flex items-center justify-center"
                  style={{
                    background: item.iconBg,
                    border: `1px solid ${item.iconBorder}`,
                    boxShadow: `0 0 12px ${item.iconGlow}`,
                  }}>
                  {item.icon}
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground">{item.label}</h3>
              </div>
              <span className="text-3xl font-black stat-value-glow">{item.value}</span>
              {(item as any).sub && <p className="text-[11px] text-muted-foreground mt-1">{(item as any).sub}</p>}
              {item.extra}
            </motion.div>
          ))}
        </div>

        {/* Match-to-Meeting Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px rgba(6,182,212,0.04)",
            }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(139,92,246,0.15))", border: "1px solid rgba(6,182,212,0.2)" }}>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Match-to-Meeting Funnel</h3>
                <p className="text-[11px] text-muted-foreground">Your engagement depth over time</p>
              </div>
              <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}>
                Live
              </span>
            </div>
            <div className="space-y-3">
              {funnelStages.map((stage, i) => (
                <motion.div key={stage.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-16 text-xs text-muted-foreground text-right shrink-0">{stage.label}</span>
                  <div className="flex-1 h-7 rounded-lg bg-white/5 border border-white/8 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.pct}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                      className={`absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r ${stage.color}`}
                      style={{ boxShadow: i > 0 ? "inset 0 0 8px rgba(255,255,255,0.1)" : undefined }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-white/90 z-10">
                      {stage.val}
                      {stage.pct < 100 && <span className="ml-1.5 text-white/40 font-normal">{stage.pct}% of prior</span>}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {meetings > 0
                  ? `🎯 ${meetings} meeting${meetings > 1 ? "s" : ""} booked — top ${Math.round(meetings/swipes*100)}% of users`
                  : "Keep swiping — your first meeting is one match away"}
              </p>
              {meetings === 0 && (
                <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#67e8f9" }}>
                  <ArrowRight className="h-3 w-3" /> Keep going
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hot Right Now */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-orange-400 animate-pulse" />
              <h3 className="font-bold text-sm">Hot Right Now</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.18),rgba(239,68,68,0.12))", border: "1px solid rgba(249,115,22,0.3)", color: "#fb923c" }}>
                Trending
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">Top profiles gaining traction</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {hotProfiles.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="shrink-0 w-40 snap-start"
              >
                <div
                  className="relative p-4 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px rgba(6,182,212,0.08)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.3)" }}>
                    <span className="text-[9px] font-black text-orange-400">#{i+1}</span>
                  </div>
                  <div className="avatar-ring-sm w-10 h-10 mb-3">
                    <div className="w-full h-full rounded-full bg-white/8 flex items-center justify-center text-sm font-black">
                      {p.name.charAt(0)}
                    </div>
                  </div>
                  <p className="text-sm font-bold leading-tight truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{p.role}</p>
                  <span className={`inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold ${p.cls}`}>
                    <Sparkles className="h-2 w-2" />{p.archetype}
                  </span>
                  <div className="flex items-center gap-1 mt-2.5">
                    <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: "linear-gradient(90deg,#06b6d4,#7c3aed)" }} />
                    </div>
                    <span className="text-[10px] font-black text-cyan-400">{p.score}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights — Hero Card */}
        {careerInsights && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="rounded-2xl p-5 ai-glow-card" style={{ background: "rgba(6,182,212,0.03)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.18),rgba(124,58,237,0.18))", border: "1px solid rgba(6,182,212,0.25)", boxShadow: "0 0 12px rgba(6,182,212,0.2)" }}>
                  <Brain className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold">Your {isTalent ? "Career" : "Founder"} Insights</h3>
                  <p className="text-[11px]" style={{ color: "rgba(103,232,249,0.55)" }}>Powered by Mesh AI</p>
                </div>
                <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.2),rgba(124,58,237,0.2))", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9", boxShadow: "0 0 10px rgba(6,182,212,0.25)", animation: "nav-dot-pulse 2s ease-in-out infinite" }}>
                  AI
                </span>
              </div>
              <div className="space-y-2.5 mb-5">
                {careerInsights.insights?.map((insight: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <span className="text-muted-foreground mt-0.5 shrink-0">💡</span>
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
              <p className="section-header-gradient mb-2">Suggested improvements</p>
              <div className="space-y-2">
                {careerInsights.improvements?.map((imp: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Who's Checking You Out */}
        {(viewerData?.last24h > 0 || viewerData?.total > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <div className="rounded-2xl p-5 glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)", boxShadow: "0 0 10px rgba(244,114,182,0.18)" }}>
                  <Users className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Who's checking you out</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {viewerData?.last24h ?? 0} views in the last 24h · {viewerData?.total ?? 0} total
                  </p>
                </div>
              </div>
              {viewerData?.recentViewers?.length > 0 ? (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {viewerData.recentViewers.map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="avatar-ring-sm w-8 h-8">
                        <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-xs font-black">
                          {v.name?.charAt(0) ?? "?"}
                        </div>
                      </div>
                      <span className="text-sm font-medium">{v.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Keep swiping — views will roll in!</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Boost CTA + Share */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 30px rgba(255,255,255,0.03)",
            }}>
            <h2 className="text-base font-bold mb-1">
              {isTalent ? "Boost your visibility" : "Find talent faster"}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {isTalent
                ? "Upgrade to Premium for 5× more views and unlimited swipes."
                : "Upgrade to Premium to unlock candidate outreach and advanced filters."}
            </p>
            <button className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/90 transition-all neon-cta">
              View Plans
            </button>
          </div>
          <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold mb-1">Spread the word</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {isTalent
                  ? "Tell the world you matched with an elite startup."
                  : "Tell the world you found exceptional talent on Mesh."}
              </p>
            </div>
            <button
              onClick={shareMatch}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold border border-white/15 hover:bg-white/8 transition-all w-fit"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Share2 className="h-4 w-4" /> Share a Match Moment
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
