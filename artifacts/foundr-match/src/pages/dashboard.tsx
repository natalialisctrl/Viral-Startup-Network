import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout";
import { useGetMyStats, useGetMyTalentProfile, useGetMyStartupProfile, getGetMyStatsQueryKey, getGetMyTalentProfileQueryKey, getGetMyStartupProfileQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Eye, MessageSquare, Flame, TrendingUp, Brain, Users, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

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

  const shareMatch = () => {
    const text = "I just matched with a startup on FoundrMatch 🚀 The future of hiring is here.";
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
              icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
              bg: "bg-purple-500/10",
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
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <Brain className="h-5 w-5 text-violet-500" />
                </div>
                <h3 className="font-semibold">Your {isTalent ? "Career" : "Founder"} Insights</h3>
                <Badge variant="outline" className="ml-auto text-xs border-violet-500/30 text-violet-400">AI</Badge>
              </div>
              <div className="space-y-3 mb-4">
                {careerInsights.insights?.map((insight: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                    <span className="text-violet-400 mt-0.5 shrink-0">💡</span>
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
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30">
            <h2 className="text-lg font-bold mb-1">Boost your visibility</h2>
            <p className="text-muted-foreground text-sm mb-4">Upgrade to Premium for 5× more views and unlimited swipes.</p>
            <button className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all">
              View Plans
            </button>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1">Spread the word</h2>
              <p className="text-muted-foreground text-sm mb-4">Tell the world you matched with an elite startup.</p>
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
