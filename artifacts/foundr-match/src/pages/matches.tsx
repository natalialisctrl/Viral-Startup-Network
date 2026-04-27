import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListMatches, getListMatchesQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Layers, Zap, MessageSquare, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// Deterministic score (mirrors swipe.tsx)
function getAiScore(cardId: number, myId: number): number {
  return 70 + (((cardId * 17 + myId * 13) * 7) % 26);
}

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (score >= 80) return "text-sky-400 border-sky-400/30 bg-sky-400/10";
  return "text-foreground border-border/50 bg-white/5";
}

function scoreRingColor(score: number) {
  if (score >= 90) return "#34d399";
  if (score >= 80) return "#38bdf8";
  return "rgba(255,255,255,0.6)";
}

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = scoreRingColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

export default function Matches() {
  const { user } = useAuth();
  const { data: matchesData, isLoading } = useListMatches({
    query: { queryKey: getListMatchesQueryKey() }
  });

  const matches = matchesData?.matches || [];
  const isTalent = user?.userType === "talent";

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4 space-y-3 pt-8">
          <div className="h-7 w-36 bg-white/5 rounded-lg animate-pulse mb-6" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white/3 rounded-2xl border border-white/6 animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="px-5 pt-8 pb-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Connections</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isTalent ? "Startups that want to meet you" : "Talent that matched with you"}
            </p>
          </div>
          {matches.length > 0 && (
            <span className="text-xs font-semibold text-muted-foreground bg-white/6 border border-white/10 px-3 py-1.5 rounded-full">
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {/* Empty state */}
        {matches.length === 0 ? (
          <div className="mx-4 mt-4 rounded-3xl border border-white/8 bg-white/3 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover opacity-50" />
            </div>
            <h2 className="text-xl font-bold mb-2">No connections yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              {isTalent
                ? "Swipe right on startups you're excited about — when they like you back, you'll appear here."
                : "Start reviewing candidates. Every mutual match shows up here ready to chat."}
            </p>
            <Link href="/swipe">
              <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/90 transition-all">
                <Layers className="h-4 w-4" /> Go to Discover
              </button>
            </Link>
          </div>
        ) : (
          <div className="px-4 pb-24 md:pb-8 space-y-2">
            {matches.map((match, index) => {
              const startupP = match.startupProfile as any;
              const talentP = match.talentProfile as any;

              const name    = isTalent ? startupP?.companyName  : talentP?.fullName;
              const sub     = isTalent ? [startupP?.stage, startupP?.industry].filter(Boolean).join(" · ") : talentP?.headline;
              const avatar  = isTalent ? startupP?.logoUrl      : talentP?.avatarUrl;
              const initial = name?.charAt(0)?.toUpperCase() ?? "M";

              const score   = match.aiMatchScore ?? getAiScore(
                isTalent ? (startupP?.id ?? match.id) : (talentP?.id ?? match.id),
                user?.id ?? 0
              );
              const reason  = match.aiMatchReason as string | undefined;
              const isNew   = !match.lastMessageAt;
              const timeAgo = match.lastMessageAt
                ? formatDistanceToNow(new Date(match.lastMessageAt), { addSuffix: true })
                : null;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                >
                  <Link href={`/chat/${match.id}`}>
                    <div className="group flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all cursor-pointer">

                      {/* Score ring wrapping avatar */}
                      <div className="relative shrink-0">
                        <ScoreRing score={score} size={58} />
                        <div className="absolute inset-[5px] rounded-full overflow-hidden">
                          <Avatar className="h-full w-full rounded-full">
                            <AvatarImage src={avatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-zinc-800 rounded-full flex items-center justify-center">
                              {avatar ? (
                                <span className="text-lg font-black text-white">{initial}</span>
                              ) : (
                                <img src="/mesh-logo.png" alt="M" className="h-5 w-5 rounded object-cover opacity-70" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {/* New dot */}
                        {isNew && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full border-2 border-background" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-base truncate">{name ?? "Unknown"}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isNew && (
                              <Badge className="bg-white text-black text-[10px] font-bold px-2 py-0 h-4 rounded-full border-0">
                                NEW
                              </Badge>
                            )}
                            {timeAgo && (
                              <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
                            )}
                          </div>
                        </div>

                        {sub && (
                          <p className="text-xs text-muted-foreground truncate mb-1.5">{sub}</p>
                        )}

                        <div className="flex items-center gap-2">
                          {reason ? (
                            <p className="text-xs text-muted-foreground/80 truncate flex-1 flex items-center gap-1.5">
                              <Zap className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                              {reason}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
                              <MessageSquare className="h-3 w-3 shrink-0" />
                              {isNew ? "Start the conversation" : "Tap to open chat"}
                            </p>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
                    </div>
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
