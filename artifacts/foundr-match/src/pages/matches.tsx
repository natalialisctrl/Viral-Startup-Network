import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListMatches, getListMatchesQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Matches() {
  const { user } = useAuth();
  const { data: matchesData, isLoading } = useListMatches({
    query: {
      queryKey: getListMatchesQueryKey(),
    }
  });

  const matches = matchesData?.matches || [];
  const isTalent = user?.userType === "talent";

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card rounded-xl border border-border/50 animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Matches</h1>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {matches.length} Total
          </Badge>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-border/50 backdrop-blur-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Keep swiping to find your perfect {isTalent ? "startup" : "co-founder"}.
            </p>
            <Link href="/swipe">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Start Swiping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match, index) => {
              const startupP = match.startupProfile as { companyName?: string; industry?: string; logoUrl?: string } | undefined;
              const talentP = match.talentProfile as { fullName?: string; headline?: string; avatarUrl?: string } | undefined;
              const name = isTalent ? startupP?.companyName : talentP?.fullName;
              const subtext = isTalent ? startupP?.industry : talentP?.headline;
              const avatar = isTalent ? startupP?.logoUrl : talentP?.avatarUrl;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/chat/${match.id}`}>
                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50 shadow-sm hover:shadow-md group">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                          <AvatarImage src={avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                            {name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-lg truncate">{name}</h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {match.lastMessageAt ? formatDistanceToNow(new Date(match.lastMessageAt), { addSuffix: true }) : "New match"}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate pr-4">
                              {match.status === "matched" && !match.lastMessageAt ? "Start the conversation!" : "Tap to view messages"}
                            </p>
                            {match.aiMatchScore && (
                              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary whitespace-nowrap">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                {match.aiMatchScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
