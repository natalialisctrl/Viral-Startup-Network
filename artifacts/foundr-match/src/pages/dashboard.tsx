import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout";
import { useGetMyStats, useGetMyTalentProfile, useGetMyStartupProfile, getGetMyStatsQueryKey, getGetMyTalentProfileQueryKey, getGetMyStartupProfileQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Eye, MessageSquare, Flame, TrendingUp, Brain, Users, Share2, ArrowRight, Sparkles, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// ── Hot Right Now seeded profiles ─────────────────────────────────────────────
const HOT_PROFILES_TALENT = [
  { id: 1,  name: "Zara K.",    role: "AI/ML Engineer",        score: 94, archetype: "ML Engineer",       cls: "text-cyan-300 border-cyan-500/35 bg-cyan-500/10" },
  { id: 2,  name: "Marcus T.",  role: "Full-Stack Builder",     score: 91, archetype: "Full-Stack Builder", cls: "text-blue-300 border-blue-500/35 bg-blue-500/10" },
  { id: 3,  name: "Priya R.",   role: "Growth Hacker",          score: 89, archetype: "Growth Hacker",      cls: "text-orange-300 border-orange-500/35 bg-orange-500/10" },
  { id: 4,  name: "Dev P.",     role: "Tech Architect",         score: 88, archetype: "Tech Architect",     cls: "text-emerald-300 border-emerald-500/35 bg-emerald-500/10" },
  { id: 5,  name: "Sam L.",     role: "Product Thinker",        score: 87, archetype: "Product Thinker",    cls: "text-violet-300 border-violet-500/35 bg-violet-500/10" },
  { id: 6,  name: "Aisha M.",   role: "Design Lead",            score: 85, archetype: "Design Lead",        cls: "text-pink-300 border-pink-500/35 bg-pink-500/10" },
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
        <div className="p-6 space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  const score = isTalent ? talentProfile?.profileStrength || 0 : startupProfile?.heatScore || 0;
  const scoreLabel = isTalent ? "Profile Strength" : "Heat Score";
  const streakCount = (stats as any)?.streakCount ?? 0;

  // Funnel data (seeded from real stats)
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
      navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
      }).catch(() => {});
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, {user?.name?.split(" ")[0]}</h1>
            <p className="text-muted-foreground">Here's your momentum today.</p>
          </div>
          {streakCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex flex-col items-center bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl px-4 py-3"
            >
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-black text-orange-500">{streakCount}</span>
              <span className="text-xs text-muted-foreground font-medium">day streak</span>
            </motion.div>
          )}
        </div>

        {/* Streak Banner */}
        {streakCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 flex items-center gap-3"
          >
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-sm">{streakCount} Day Streak — Keep it up!</p>
              <p className="text-xs text-muted-foreground">Stay active to boost your visibility in the feed</p>
            </div>
            <Badge className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30">Active</Badge>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: isTalent ? <Zap className="h-5 w-5 text-yellow-500" /> : <Flame className="h-5 w-5 text-orange-500" />,
              bg: "bg-yellow-500/10",
              label: scoreLabel,
              value: `${score}%`,
              extra: <Progress value={score} className="h-1.5 mt-3" />,
              delay: 0.1,
            },
            {
              icon: <Eye className="h-5 w-5 text-blue-500" />,
              bg: "bg-blue-500/10",
              label: "Profile Views",
              value: stats?.profileViews ?? 0,
              sub: "Last 7 days",
              delay: 0.2,
            },
            {
              icon: <MessageSquare className="h-5 w-5 text-green-500" />,
              bg: "bg-green-500/10",
              label: "Matches",
              value: stats?.matches ?? 0,
              delay: 0.3,
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-foreground" />,
              bg: "bg-white/8",
              label: "Swipes Made",
              value: stats?.swipesSent ?? 0,
              delay: 0.4,
            },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}>
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${item.bg}`}>{item.icon}</div>
                  <h3 className="font-medium text-muted-foreground text-sm">{item.label}</h3>
                </div>
                <span className="text-3xl font-bold">{item.value}</span>
                {item.sub && <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>}
                {item.extra}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Match-to-Meeting Funnel ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg" style={{background:"linear-gradient(135deg,rgba(6,182,212,0.15),rgba(139,92,246,0.15))"}}>
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Match-to-Meeting Funnel</h3>
                <p className="text-xs text-muted-foreground">Your engagement depth over time</p>
              </div>
              <Badge variant="outline" className="ml-auto text-[10px] border-cyan-500/25 text-cyan-400 bg-cyan-500/8">Live</Badge>
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
                <span className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" /> Keep going
                </span>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ── Hot Right Now ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-orange-400 animate-pulse" />
              <h3 className="font-semibold text-sm">Hot Right Now</h3>
              <Badge className="text-[10px] bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400">Trending</Badge>
            </div>
            <span className="text-xs text-muted-foreground">Top profiles gaining traction</span>
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
                <div className="relative p-4 rounded-2xl border bg-card/50 backdrop-blur-sm cursor-pointer hover:bg-card/80 transition-all group"
                  style={{borderColor:"rgba(255,255,255,0.08)"}}>
                  {/* Heat rank */}
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-[9px] font-black text-orange-400">#{i+1}</span>
                  </div>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-white/8 border border-white/12 flex items-center justify-center text-lg font-black mb-3">
                    {p.name.charAt(0)}
                  </div>
                  {/* Name */}
                  <p className="text-sm font-bold leading-tight truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{p.role}</p>
                  {/* Archetype */}
                  <span className={`inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold ${p.cls}`}>
                    <Sparkles className="h-2 w-2" />{p.archetype}
                  </span>
                  {/* Match score */}
                  <div className="flex items-center gap-1 mt-2.5">
                    <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{width:`${p.score}%`}} />
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400">{p.score}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Who's Checking You Out */}
        {(viewerData?.last24h > 0 || viewerData?.total > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Who's checking you out</h3>
                  <p className="text-xs text-muted-foreground">
                    {viewerData?.last24h ?? 0} views in the last 24h · {viewerData?.total ?? 0} total
                  </p>
                </div>
              </div>
              {viewerData?.recentViewers?.length > 0 ? (
                <div className="flex items-center gap-3 flex-wrap">
                  {viewerData.recentViewers.map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-background/50 rounded-xl px-3 py-2 border border-border/40">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                        {v.name?.charAt(0) ?? "?"}
                      </div>
                      <span className="text-sm font-medium">{v.name}</span>
                    </div>
                  ))}
                  <span className="text-sm text-muted-foreground">...and more</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Keep swiping — views will roll in!</p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Career / Founder Insights */}
        {careerInsights && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Brain className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-semibold">Your {isTalent ? "Career" : "Founder"} Insights</h3>
                <Badge variant="outline" className="ml-auto text-xs border-white/15 text-muted-foreground">AI</Badge>
              </div>
              <div className="space-y-3 mb-4">
                {careerInsights.insights?.map((insight: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
                    <span className="text-muted-foreground mt-0.5 shrink-0">💡</span>
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested improvements</p>
              <div className="space-y-2">
                {careerInsights.improvements?.map((imp: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Boost CTA + Share */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-white/5 border border-primary/30">
            <h2 className="text-lg font-bold mb-1">
              {isTalent ? "Boost your visibility" : "Find talent faster"}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {isTalent
                ? "Upgrade to Premium for 5× more views and unlimited swipes."
                : "Upgrade to Premium to unlock candidate outreach and advanced filters."}
            </p>
            <button className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all">
              View Plans
            </button>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/50 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1">Spread the word</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {isTalent
                  ? "Tell the world you matched with an elite startup."
                  : "Tell the world you found exceptional talent on Mesh."}
              </p>
            </div>
            <button
              onClick={shareMatch}
              className="flex items-center gap-2 bg-background/60 text-foreground px-5 py-2 rounded-xl text-sm font-semibold border border-border/50 hover:bg-background transition-all w-fit"
            >
              <Share2 className="h-4 w-4" /> Share a Match Moment
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
