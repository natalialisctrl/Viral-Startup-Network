import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListMatches, getListMatchesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Layers, Zap, MessageSquare, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function getAiScore(cardId: number, myId: number): number {
  return 70 + (((cardId * 17 + myId * 13) * 7) % 26);
}

function getAiReason(name: string, score: number, isTalentCard: boolean): string {
  const reasons = isTalentCard
    ? [
        `Strong technical overlap with your open roles`,
        `Culture alignment signals are exceptional`,
        `Rare combination of skills for this stage`,
        `Growth trajectory mirrors your team's velocity`,
      ]
    : [
        `Mission resonates with your career goals`,
        `Stage and domain are a strong fit`,
        `Founding team DNA matches your working style`,
        `This startup is trending in your target space`,
      ];
  return reasons[(score * name.length) % reasons.length];
}

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = score >= 90 ? "#06b6d4" : score >= 80 ? "#818cf8" : "rgba(255,255,255,0.5)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
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
            <div key={i} className="h-24 bg-white/3 rounded-2xl border border-white/6 animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-28 md:pb-8">

        {/* Header */}
        <div className="px-5 pt-8 pb-5 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ textShadow: "0 0 20px rgba(255,255,255,0.12)" }}>
              Connections
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(103,232,249,0.6)" }}>
              {isTalent ? "Startups that want to meet you" : "Talent that matched with you"}
            </p>
          </div>
          {matches.length > 0 && (
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                background: "linear-gradient(#090909,#090909) padding-box, linear-gradient(135deg,#06b6d4,#7c3aed) border-box",
                border: "1.5px solid transparent",
                boxShadow: "0 0 12px rgba(6,182,212,0.25)",
                color: "rgba(103,232,249,0.85)",
              }}
            >
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {/* Empty state */}
        {matches.length === 0 ? (
          <div className="mx-4 mt-4 rounded-3xl p-10 text-center glass-card">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover opacity-40" />
            </div>
            <h2 className="text-xl font-bold mb-2">No connections yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              {isTalent
                ? "Swipe right on startups you're excited about — when they like you back, you'll appear here."
                : "Start reviewing candidates. Every mutual match shows up here ready to chat."}
            </p>
            <Link href="/swipe">
              <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/90 transition-all neon-cta">
                <Layers className="h-4 w-4" /> Go to Discover
              </button>
            </Link>
          </div>
        ) : (
          <div className="px-4 space-y-2.5">
            {matches.map((match, index) => {
              const startupP = match.startupProfile as any;
              const talentP = match.talentProfile as any;

              const name    = isTalent ? startupP?.companyName  : talentP?.fullName;
              const sub     = isTalent
                ? [startupP?.stage, startupP?.industry].filter(Boolean).join(" · ")
                : talentP?.headline;
              const initial = name?.charAt(0)?.toUpperCase() ?? "M";
              const score   = match.aiMatchScore ?? getAiScore(
                isTalent ? (startupP?.id ?? match.id) : (talentP?.id ?? match.id),
                user?.id ?? 0
              );
              const reason  = (match.aiMatchReason as string | undefined) || getAiReason(name ?? "", score, !isTalent);
              const isNew   = !match.lastMessageAt;
              const timeAgo = match.lastMessageAt
                ? formatDistanceToNow(new Date(match.lastMessageAt), { addSuffix: true })
                : null;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                >
                  <Link href={`/chat/${match.id}`}>
                    <div
                      className="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                        backdropFilter: "blur(8px)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.055)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px rgba(6,182,212,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)";
                      }}
                    >
                      {/* Score ring wrapping animated avatar ring */}
                      <div className="relative shrink-0">
                        <ScoreRing score={score} size={60} />
                        <div className="absolute inset-[4px] rounded-full overflow-hidden"
                          style={{
                            background: "conic-gradient(from 0deg, #06b6d4, #7c3aed, #3b82f6, #06b6d4)",
                            padding: "1.5px",
                            borderRadius: "9999px",
                          }}>
                          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-sm font-black">
                            {initial}
                          </div>
                        </div>
                        {isNew && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background nav-active-dot"
                            style={{ background: "#06b6d4" }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-base truncate">{name ?? "Unknown"}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isNew && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(6,182,212,0.15)",
                                  border: "1px solid rgba(6,182,212,0.35)",
                                  color: "#67e8f9",
                                  boxShadow: "0 0 8px rgba(6,182,212,0.3)",
                                }}
                              >
                                NEW
                              </span>
                            )}
                            {timeAgo && (
                              <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
                            )}
                          </div>
                        </div>

                        {sub && (
                          <p className="text-xs text-muted-foreground truncate mb-1.5">{sub}</p>
                        )}

                        <p className="text-xs truncate flex items-center gap-1.5"
                          style={{ color: "rgba(103,232,249,0.55)", fontStyle: "italic" }}>
                          <Sparkles className="h-2.5 w-2.5 shrink-0 text-cyan-400/50" />
                          {reason}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
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
