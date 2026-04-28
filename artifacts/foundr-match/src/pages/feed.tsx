import { useRef, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListVideos, useLikeVideo, useListTalent } from "@workspace/api-client-react";
import { Heart, Share2, MessageSquare, Bookmark, Zap, MapPin, Briefcase, ExternalLink, Radio, Play, Eye, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// ── Seeded helpers ────────────────────────────────────────────────────────────
function seeded(id: number, mod: number, offset = 0) {
  return ((id * 2654435761 + offset) >>> 0) % mod;
}

const REEL_TYPES = [
  { label: "Intro Reel", desc: "Introducing themselves & their story" },
  { label: "Work Demo",  desc: "Demoing a project or product they built" },
  { label: "Skills Drop", desc: "Showcasing their top skills live" },
  { label: "Open to Work", desc: "Sharing what they're looking for next" },
  { label: "Case Study", desc: "Breaking down a win from their career" },
];

const REEL_HOOKS: Record<string, string[]> = {
  "Intro Reel": [
    "Hey, I'm {name} — here's why I left {prev} to build something new 👋",
    "3 things you should know about me before we connect…",
    "My story: from {yrs} yrs of {skill1} to founding my first startup 🚀",
  ],
  "Work Demo": [
    "I built this in 48 hours using {skill1} and {skill2} — let me show you",
    "Live demo: here's the {skill1} project that got me 3 job offers",
    "Watch me ship a feature from zero to prod in real time ⚡",
  ],
  "Skills Drop": [
    "Rate my stack: {skill1} · {skill2} · {skill3} — drop a 🔥 if this is you",
    "Hot take: {skill1} is the most underrated skill in startups right now",
    "My {yrs}-year {skill1} journey in 60 seconds",
  ],
  "Open to Work": [
    "I'm {name}, I do {skill1}, and I'm looking for a seed-stage team 🌱",
    "Interviewing for my next role — here's what I bring to the table",
    "Available now · {yrs} yrs exp · {city} · let's build something real",
  ],
  "Case Study": [
    "How I took a product from 0 to {metric} using {skill1} alone",
    "The {skill1} decision that changed everything for my last startup",
    "We 10×'d growth in 90 days — here's the exact playbook 📈",
  ],
};

function getReelType(id: number) {
  return REEL_TYPES[seeded(id, REEL_TYPES.length)];
}

function getReelHook(profile: any): string {
  const reel = getReelType(profile.id);
  const hooks = REEL_HOOKS[reel.label] ?? REEL_HOOKS["Intro Reel"];
  const hook = hooks[seeded(profile.id, hooks.length, 7)];
  const skills: string[] = profile.skills ?? [];
  const metrics = ["4 M users", "2 M requests/day", "$500 K ARR", "50 K MAU", "1 B impressions"];
  return hook
    .replace("{name}", profile.fullName?.split(" ")[0] ?? "I")
    .replace("{prev}", ["Google", "Stripe", "Figma", "Linear", "Vercel"][seeded(profile.id, 5)])
    .replace("{yrs}", String(profile.yearsExperience ?? 5))
    .replace("{skill1}", skills[0] ?? "engineering")
    .replace("{skill2}", skills[1] ?? "design")
    .replace("{skill3}", skills[2] ?? "product")
    .replace("{metric}", metrics[seeded(profile.id, metrics.length, 3)])
    .replace("{city}", profile.city ?? "Remote");
}

function getReelStats(id: number) {
  return {
    views: 800 + seeded(id, 50000, 1) * 43,
    likes: 40 + seeded(id, 8000, 2) * 7,
    comments: 5 + seeded(id, 300, 3),
    duration: 30 + seeded(id, 60, 4),
    progress: 15 + seeded(id, 75, 5),
  };
}

function fmtNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

const CARD_GRADIENTS = [
  ["#07101a", "#04090e"],
  ["#120a1a", "#0a0612"],
  ["#0a1a0f", "#06100a"],
  ["#1a0f07", "#100905"],
  ["#0a0d1a", "#060812"],
  ["#0f1a12", "#08100a"],
  ["#1a120a", "#100b05"],
];

// ── Talent Reel Card (shown to founders) ─────────────────────────────────────
function TalentReelCard({ profile, isActive, index }: { profile: any; isActive: boolean; index: number }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(true);

  const [g1, g2] = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const skills: string[] = profile.skills ?? [];
  const reel = getReelType(profile.id);
  const hook = getReelHook(profile);
  const stats = getReelStats(profile.id);
  const topSkills = skills.slice(0, 3);

  const progressAnim = isActive && playing;

  return (
    <div
      className="h-full w-full snap-start relative flex flex-col overflow-hidden border-b border-white/[0.06]"
      style={{ background: `linear-gradient(160deg, ${g1} 0%, ${g2} 50%, #000 100%)` }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.6), transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.5), transparent 70%)", filter: "blur(36px)" }} />
      </div>

      {/* Avatar mosaic bg (subtle) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent 65%)" }} />
      </div>

      {/* Top bar: badges */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(252,165,165,0.9)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />
            REEL
          </span>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{reel.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/35 text-[10px] font-medium">
          <Eye className="h-3 w-3" />{fmtNum(stats.views)}
        </div>
      </div>

      {/* Video progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-white/10">
        {progressAnim ? (
          <motion.div
            className="h-full bg-white/70"
            initial={{ width: `${stats.progress}%` }}
            animate={{ width: "100%" }}
            transition={{ duration: (stats.duration * (100 - stats.progress)) / 100, ease: "linear" }}
          />
        ) : (
          <div className="h-full bg-white/70" style={{ width: `${stats.progress}%` }} />
        )}
      </div>

      {/* Center: reel hook quote */}
      <div className="absolute inset-0 flex flex-col items-start justify-center px-5 z-10 pointer-events-none" style={{ top: "10%", bottom: "45%" }}>
        <motion.p
          key={profile.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isActive ? 1 : 0.4, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="text-white/90 text-base font-semibold leading-snug"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}
        >
          "{hook}"
        </motion.p>
      </div>

      {/* Bottom overlay: profile + CTAs */}
      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <div className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)" }} />

        <div className="relative z-10 px-4 pb-20 md:pb-6 flex items-end justify-between gap-3">
          {/* Left: profile info */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl font-black text-white">
                  {profile.fullName?.charAt(0) ?? "?"}
                </div>
                {isActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg leading-tight" style={{ textShadow: "0 0 16px rgba(255,255,255,0.25)" }}>
                  {profile.fullName}
                </h3>
                <p style={{ color: "rgba(167,210,255,0.6)", fontSize: "0.75rem" }}>{profile.headline || "Startup Professional"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/45">
              {profile.yearsExperience && (
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{profile.yearsExperience}y exp</span>
              )}
              {(profile.city || profile.location) && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.city || profile.location}</span>
              )}
              <span className="flex items-center gap-1"><Play className="h-3 w-3" />{stats.duration}s</span>
            </div>

            {topSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(124,58,237,0.12))",
                      border: "1px solid rgba(6,182,212,0.22)",
                      color: "rgba(103,232,249,0.85)",
                    }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => setLocation("/swipe")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-white text-black hover:bg-white/90 transition-all neon-cta"
              >
                <Zap className="h-3.5 w-3.5" /> View Profile
              </button>
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-white/20 text-white/80 hover:bg-white/10 transition-all">
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </a>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-col items-center gap-4 pb-1">
            <button
              onClick={() => {
                setLiked(!liked);
                toast({ title: liked ? "Unliked" : "Liked", description: liked ? "Removed like." : "Added to liked reels." });
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${liked ? "border-red-400/50" : "border-white/12 group-hover:border-red-400/40"}`}
                style={{ background: liked ? "rgba(239,68,68,0.2)" : "rgba(0,0,0,0.5)" }}>
                <Heart className={`h-5 w-5 transition-colors ${liked ? "text-red-400 fill-red-400" : "text-white/70 group-hover:text-red-400"}`} />
              </div>
              <span className="text-white/45 text-[10px] font-medium">{fmtNum(stats.likes + (liked ? 1 : 0))}</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${saved ? "border-white/40" : "border-white/12 group-hover:border-white/25"}`}
                style={{ background: saved ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.5)" }}>
                <Bookmark className={`h-5 w-5 ${saved ? "text-white fill-white" : "text-white/70"}`} />
              </div>
              <span className="text-white/45 text-[10px] font-medium">Save</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: profile.fullName, text: `Check out ${profile.fullName} on Mesh` }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href).then(() => toast({ title: "Link copied!" })).catch(() => {});
                }
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.5)" }}>
                <Share2 className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/45 text-[10px] font-medium">Share</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.5)" }}>
                <MessageSquare className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/45 text-[10px] font-medium">{fmtNum(stats.comments)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Startup Pitch Card (shown to job seekers) ─────────────────────────────────
function StartupPitchCard({ video, isActive, index, onLike }: { video: any; isActive: boolean; index: number; onLike: (id: number) => void }) {
  const [, setLocation] = useLocation();
  const [liked, setLiked] = useState(false);
  const stats = getReelStats(video.id + 50);

  return (
    <div className="h-full w-full snap-start relative flex items-center justify-center bg-black border-b border-white/[0.06] overflow-hidden">
      {/* Video progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-white/10">
        {isActive ? (
          <motion.div
            className="h-full bg-white/70"
            initial={{ width: `${stats.progress}%` }}
            animate={{ width: "100%" }}
            transition={{ duration: (stats.duration * (100 - stats.progress)) / 100, ease: "linear" }}
          />
        ) : (
          <div className="h-full bg-white/70" style={{ width: `${stats.progress}%` }} />
        )}
      </div>

      {/* Thumbnail */}
      <div className="absolute inset-0">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-55" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0d1527] to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-transparent" />
      </div>

      {/* Play icon overlay (subtle) */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
            <Play className="h-6 w-6 text-white/80 ml-1" />
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(252,165,165,0.9)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />
            PITCH
          </span>
          <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Startup Pitch</span>
        </div>
        <div className="flex items-center gap-1 text-white/35 text-[10px]">
          <Eye className="h-3 w-3" />{fmtNum(video.views ?? stats.views)}
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-20 md:pb-6 z-10">
        <div className="flex items-end justify-between w-full">
          <div className="flex-1 pr-14 space-y-2">
            {/* Company */}
            <div className="flex items-center gap-2.5">
              <div className="avatar-ring-sm shrink-0">
                {video.startupProfile?.logoUrl ? (
                  <img src={video.startupProfile.logoUrl} alt={video.startupProfile.companyName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-xs font-black">
                    {video.startupProfile?.companyName?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight" style={{ textShadow: "0 0 12px rgba(255,255,255,0.2)" }}>
                  {video.startupProfile?.companyName}
                </h3>
                {video.startupProfile?.stage && (
                  <span style={{ color: "rgba(167,210,255,0.55)", fontSize: "0.72rem" }}>
                    {video.startupProfile.stage} · {video.startupProfile.industry}
                  </span>
                )}
              </div>
            </div>

            <p className="text-white/90 text-sm font-semibold leading-snug">{video.title}</p>
            <p className="text-white/55 text-xs line-clamp-2 leading-relaxed">{video.description}</p>

            {/* Traction badge */}
            {video.startupProfile?.growthMetrics && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium"
                style={{ color: "rgba(52,211,153,0.85)" }}>
                <TrendingUp className="h-3 w-3" />
                {video.startupProfile.growthMetrics}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setLocation("/swipe")}
                className="px-5 py-2 rounded-full text-sm font-bold bg-white text-black hover:bg-white/90 transition-all neon-cta"
              >
                Apply Now
              </button>
              {video.startupProfile?.websiteUrl && (
                <a href={video.startupProfile.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border border-white/20 text-white/80 hover:bg-white/10 transition-all">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-4 pb-2 absolute right-4 bottom-24 md:bottom-6">
            <button
              onClick={() => {
                setLiked(!liked);
                onLike(video.id);
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${liked ? "border-red-400/50" : "border-white/12 group-hover:border-red-400/40"}`}
                style={{ background: liked ? "rgba(239,68,68,0.2)" : "rgba(0,0,0,0.45)" }}>
                <Heart className={`h-5 w-5 transition-colors ${liked ? "text-red-400 fill-red-400" : "text-white/70 group-hover:text-red-400"}`} />
              </div>
              <span className="text-white/45 text-[10px] font-medium">{video.likes + (liked ? 1 : 0)}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <MessageSquare className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/45 text-[10px] font-medium">DM</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <Share2 className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/45 text-[10px] font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Feed page ────────────────────────────────────────────────────────────
export default function Feed() {
  const { user, isLoading: authLoading } = useAuth();
  const isTalent = user?.userType === "talent";
  const userLoaded = !!user;

  const { data: videosData, isLoading: videosLoading } = useListVideos(
    { limit: 10 },
    { query: { enabled: userLoaded && isTalent, queryKey: ["feedVideos"] } }
  );
  const { data: talentData, isLoading: talentLoading } = useListTalent(
    { limit: 20 },
    { query: { enabled: userLoaded && !isTalent, queryKey: ["feedTalent"] } }
  );
  const likeVideo = useLikeVideo();
  const { toast } = useToast();

  const videos = videosData?.videos || [];
  const talentProfiles = talentData?.profiles || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      setActiveIndex(Math.round(scrollTop / clientHeight));
    };
    const el = containerRef.current;
    el?.addEventListener("scroll", handleScroll, { passive: true });
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = (id: number) => {
    likeVideo.mutate({ id }, {
      onSuccess: () => toast({ title: "Liked!", description: "Added to your liked pitches." }),
    });
  };

  const isLoading = authLoading || (userLoaded && (isTalent ? videosLoading : talentLoading));

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400/40 border-t-cyan-400 animate-spin" />
            <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Loading feed…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const noContent = isTalent ? videos.length === 0 : talentProfiles.length === 0;

  if (noContent) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center text-center p-4">
          <div>
            <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="text-xl font-bold">{isTalent ? "No pitches yet" : "No reels yet"}</h2>
            <p className="text-muted-foreground text-sm mt-2">
              {isTalent ? "Check back for new startup pitches." : "Check back for new talent reels."}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-center gap-3 py-2.5 border-b border-white/[0.06]"
        style={{ background: "rgba(4,4,4,0.88)", backdropFilter: "blur(16px)" }}>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(252,165,165,0.8)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />
          LIVE
        </span>
        <span className="section-header-gradient text-sm font-bold">
          {isTalent ? "Startup Pitches" : "Talent Reels"}
        </span>
        <span className="text-white/25 text-xs">
          {isTalent ? `${videos.length} pitches` : `${talentProfiles.length} reels`}
        </span>
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-[calc(100dvh-120px)] md:h-[calc(100dvh-48px)] w-full max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory relative bg-black no-scrollbar scrollbar-none"
      >
        <AnimatePresence mode="wait">
          {isTalent
            ? videos.map((video, index) => (
                <StartupPitchCard
                  key={video.id}
                  video={video}
                  isActive={index === activeIndex}
                  index={index}
                  onLike={handleLike}
                />
              ))
            : talentProfiles.map((profile, index) => (
                <TalentReelCard
                  key={profile.id}
                  profile={profile}
                  isActive={index === activeIndex}
                  index={index}
                />
              ))
          }
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
