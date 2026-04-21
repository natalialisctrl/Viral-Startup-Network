import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout";
import { useGetMyStats, useGetMyTalentProfile, useGetMyStartupProfile, getGetMyStatsQueryKey, getGetMyTalentProfileQueryKey, getGetMyStartupProfileQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Eye, MessageSquare, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const isTalent = user?.userType === "talent";

  const { data: stats, isLoading: statsLoading } = useGetMyStats({
    query: { queryKey: getGetMyStatsQueryKey() }
  });

  const { data: talentProfile, isLoading: talentLoading } = useGetMyTalentProfile({
    query: { enabled: isTalent, queryKey: getGetMyTalentProfileQueryKey() }
  });

  const { data: startupProfile, isLoading: startupLoading } = useGetMyStartupProfile({
    query: { enabled: !isTalent, queryKey: getGetMyStartupProfileQueryKey() }
  });

  const isLoading = statsLoading || talentLoading || startupLoading;

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

  const profile = isTalent ? talentProfile : startupProfile;
  const score = isTalent ? talentProfile?.profileStrength || 0 : startupProfile?.heatScore || 0;
  const scoreIcon = isTalent ? <Zap className="h-5 w-5 text-yellow-500" /> : <Flame className="h-5 w-5 text-orange-500" />;
  const scoreLabel = isTalent ? "Profile Strength" : "Heat Score";

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Here's your momentum today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {scoreIcon}
                </div>
                <h3 className="font-medium text-muted-foreground">{scoreLabel}</h3>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{score}%</span>
              </div>
              <Progress value={score} className="h-2 mt-4" />
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-medium text-muted-foreground">Profile Views</h3>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.profileViews || 0}</span>
                <span className="text-sm text-green-500">+12% this week</span>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-medium text-muted-foreground">Matches</h3>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.matches || 0}</span>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-medium text-muted-foreground">Swipes Made</h3>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stats?.swipesSent || 0}</span>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30">
          <h2 className="text-xl font-bold mb-2">Boost your visibility</h2>
          <p className="text-muted-foreground mb-4">Upgrade to Premium to get 5x more views and unlimited swipes.</p>
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all">
            View Plans
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
