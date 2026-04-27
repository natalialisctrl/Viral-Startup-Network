import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListTalent, useListStartups, useCreateSwipe, useGetMyTalentProfile, useGetMyStartupProfile } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, X, Star, Bookmark, Zap, MessageCircle, User } from "lucide-react";
import { useLocation } from "wouter";

function getAiScore(cardId: number, myId: number): number {
  return 70 + (((cardId * 17 + myId * 13) * 7) % 26);
}

function getAiInsights(card: any, isTalent: boolean, score: number) {
  const strengths = isTalent
    ? [`Mission aligns with your career goals`, `Culture fit: ${score > 85 ? "exceptional" : "strong"}`]
    : [`Skill overlap with your open roles`, `Work style: ${score > 85 ? "perfect" : "solid"} match`];
  const challenge = score < 80
    ? "Salary expectations may need alignment"
    : "Timezone overlap worth discussing";
  const starter = isTalent
    ? `Ask about their biggest product challenge this quarter`
    : `Ask what excites them most about early-stage building`;
  return { strengths, challenge, starter };
}

function recordProfileView(viewedId: number, viewedType: string) {
  fetch("/api/profile-views", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ viewedId, viewedType }),
  }).catch(() => {});
}

export default function Swipe() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createSwipe = useCreateSwipe();
  const isTalent = user?.userType === "talent";

  const { data: talentData, isLoading: isLoadingTalent } = useListTalent({}, { query: { enabled: !isTalent, queryKey: ["listTalent"] } });
  const { data: startupData, isLoading: isLoadingStartups } = useListStartups({}, { query: { enabled: isTalent, queryKey: ["listStartups"] } });
  useGetMyTalentProfile({ query: { enabled: isTalent, queryKey: ["myTalentProfile"] } });
  useGetMyStartupProfile({ query: { enabled: !isTalent, queryKey: ["myStartupProfile"] } });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<{ card: any; score: number; matchId: number } | null>(null);
  const [dragX, setDragX] = useState(0);

  const cards = isTalent ? startupData?.profiles || [] : talentData?.profiles || [];
  const isLoading = isTalent ? isLoadingStartups : isLoadingTalent;
  const myId = user?.id ?? 1;
  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (currentCard) {
      recordProfileView(currentCard.id, isTalent ? "startup" : "talent");
    }
  }, [currentIndex]);

  const handleSwipe = useCallback((direction: "right" | "left" | "up" | "down") => {
    if (!currentCard) return;
    createSwipe.mutate({
      data: { targetId: currentCard.id, targetType: isTalent ? "startup" : "talent", direction },
    }, {
      onSuccess: (res) => {
        if (res.matched && res.matchId) {
          const score = getAiScore(currentCard.id, myId);
          setMatchModal({ card: currentCard, score, matchId: res.matchId });
        }
        setCurrentIndex(prev => prev + 1);
      }
    });
  }, [currentCard, isTalent, myId, createSwipe]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/50 animate-ping" />
            </div>
            <p className="text-muted-foreground font-medium">Finding potential matches...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Star className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground max-w-md">Check back later for more potential matches.</p>
        </div>
      </AppLayout>
    );
  }

  const score = currentCard ? getAiScore(currentCard.id, myId) : 0;
  const heatScore = (currentCard as any)?.heatScore ?? 0;
  const momentumScore = (currentCard as any)?.momentumScore ?? 0;
  const isTrending = heatScore > 70 || momentumScore > 75;
  const isFastReply = heatScore > 85 || momentumScore > 85;
  const videoUrl = (currentCard as any)?.videoUrl;

  return (
    <AppLayout>
      {/* ── Match Modal ── */}
      <AnimatePresence>
        {matchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="w-full max-w-md bg-card border border-primary/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-6">
                <div className="text-5xl mb-3">🎯</div>
                <h2 className="text-3xl font-black tracking-tight">It's a Match!</h2>
                <p className="text-muted-foreground mt-1 text-sm">This could change everything.</p>
              </motion.div>

              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }} className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold border border-primary/30">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent via-primary to-transparent mb-1" />
                  <Badge className="bg-primary text-primary-foreground font-black text-lg px-3 py-1 shadow-[0_0_20px_rgba(124,58,237,0.6)]">
                    {matchModal.score}%
                  </Badge>
                  <div className="h-px w-8 bg-gradient-to-r from-transparent via-primary to-transparent mt-1" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold border border-primary/30">
                  {((matchModal.card as any).companyName ?? (matchModal.card as any).fullName ?? "?").charAt(0)}
                </div>
              </motion.div>

              {(() => {
                const { strengths, challenge, starter } = getAiInsights(matchModal.card, isTalent, matchModal.score);
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-3 mb-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1.5">Why You Match</p>
                      {strengths.map((s, i) => (
                        <p key={i} className="text-sm flex items-start gap-1.5"><span className="text-green-400 mt-0.5">✓</span>{s}</p>
                      ))}
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Potential Challenge</p>
                      <p className="text-sm">⚠ {challenge}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Try saying this</p>
                      <p className="text-sm italic">"{starter}"</p>
                    </div>
                  </motion.div>
                );
              })()}

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => { setMatchModal(null); setLocation(`/talent/${matchModal?.card?.id}`); }}>
                  <User className="h-4 w-4 mr-2" />View Profile
                </Button>
                <Button className="flex-1 h-12 rounded-xl bg-primary shadow-[0_0_20px_rgba(124,58,237,0.4)]" onClick={() => { setMatchModal(null); setLocation(`/chat/${matchModal?.matchId}`); }}>
                  <MessageCircle className="h-4 w-4 mr-2" />Start Chat
                </Button>
              </motion.div>

              <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onClick={() => setMatchModal(null)}>
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Swipe Area ── */}
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-md h-[70vh] md:h-[600px]">
          {cards[currentIndex + 1] && (
            <div className="absolute inset-2 rounded-2xl bg-card border border-border/20 opacity-30 scale-95" />
          )}

          <AnimatePresence mode="popLayout">
            {currentCard && (
              <motion.div
                key={currentCard.id}
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ x: dragX > 0 ? 1200 : -1200, opacity: 0, rotate: dragX > 0 ? 20 : -20, transition: { duration: 0.25 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDrag={(_, info) => setDragX(info.offset.x)}
                onDragEnd={(_, { offset }) => {
                  setDragX(0);
                  if (offset.x > 100) handleSwipe("right");
                  else if (offset.x < -100) handleSwipe("left");
                }}
                style={{ rotate: dragX * 0.04 }}
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              >
                {/* Like/Nope overlays */}
                <AnimatePresence>
                  {dragX > 40 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: Math.min(dragX / 130, 1) }}
                      className="absolute top-6 left-6 z-20 border-4 border-green-400 text-green-400 rounded-xl px-3 py-1 font-black text-xl -rotate-12">
                      LIKE 💚
                    </motion.div>
                  )}
                  {dragX < -40 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: Math.min(-dragX / 130, 1) }}
                      className="absolute top-6 right-6 z-20 border-4 border-red-400 text-red-400 rounded-xl px-3 py-1 font-black text-xl rotate-12">
                      NOPE ✕
                    </motion.div>
                  )}
                </AnimatePresence>

                <Card className="w-full h-full overflow-hidden border-border/50 bg-card shadow-2xl relative">
                  {/* Badges */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 items-end">
                    <Badge className="bg-primary text-primary-foreground font-black px-3 py-1 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                      {score}% Match
                    </Badge>
                    {isTrending && <Badge className="bg-orange-500/90 text-white font-semibold px-2 py-0.5 text-xs">🔥 Trending</Badge>}
                    {isFastReply && <Badge className="bg-blue-500/90 text-white font-semibold px-2 py-0.5 text-xs">⚡ Fast Replies</Badge>}
                  </div>

                  {/* Hero */}
                  <div className="h-1/2 bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-6 relative overflow-hidden">
                    {videoUrl && (
                      <video src={videoUrl} autoPlay muted loop playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    )}
                    <div className={`text-center relative z-10 ${videoUrl ? "bg-black/50 backdrop-blur-sm rounded-2xl p-4" : ""}`}>
                      {isTalent ? (
                        <>
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/40 to-purple-500/40 mb-3 flex items-center justify-center text-3xl font-bold shadow-xl border border-primary/30">
                            {(currentCard as any).companyName?.charAt(0)}
                          </div>
                          <h2 className="text-2xl font-bold">{(currentCard as any).companyName}</h2>
                          <p className="text-primary font-medium text-sm mt-1">{(currentCard as any).industry || "Startup"} · {(currentCard as any).stage || "Early"}</p>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 mb-3 flex items-center justify-center text-3xl font-bold shadow-xl border border-primary/30">
                            {(currentCard as any).fullName?.charAt(0)}
                          </div>
                          <h2 className="text-2xl font-bold">{(currentCard as any).fullName}</h2>
                          <p className="text-primary font-medium text-sm mt-1">{(currentCard as any).headline}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 h-1/2 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {isTalent
                          ? (currentCard as any).elevatorPitch ?? (currentCard as any).mission
                          : (currentCard as any).bio ?? (currentCard as any).whyStartups}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(isTalent
                          ? ((currentCard as any).badges ?? []).slice(0, 4)
                          : ((currentCard as any).skills ?? []).slice(0, 4)
                        ).map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-primary/5 text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-primary/5 border border-primary/10">
                      <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {score > 87 ? "Exceptional culture & skill alignment detected"
                          : score > 82 ? "Strong alignment across key hiring signals"
                          : "Good compatibility on core requirements"}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="outline" size="icon" onClick={() => handleSwipe("left")}
              className="w-14 h-14 rounded-full border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 shadow-lg">
              <X className="h-6 w-6" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="outline" size="icon" onClick={() => handleSwipe("down")}
              className="w-12 h-12 rounded-full border-border/50 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 shadow-lg">
              <Bookmark className="h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <Button variant="outline" size="icon" onClick={() => handleSwipe("right")}
              className="w-14 h-14 rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:border-primary shadow-lg shadow-primary/20">
              <Heart className="h-6 w-6 fill-current" />
            </Button>
          </motion.div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 opacity-50">Drag left to pass · drag right to match</p>
      </div>
    </AppLayout>
  );
}
