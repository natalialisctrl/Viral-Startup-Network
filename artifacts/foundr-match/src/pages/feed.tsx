import { useRef, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListVideos, useLikeVideo, useListTalent } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageSquare, Bookmark, Info, Zap, MapPin, Briefcase, ExternalLink, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const DEMO_TALENT = [
  { id: 101, fullName: "Zara Kim", headline: "ML Engineer · ex-Google Brain", bio: "Building the next generation of AI-native developer tools. 3× startup founder, 8 years deep in distributed systems.", skills: ["PyTorch", "LLMs", "Python", "Go"], yearsExperience: 8, city: "San Francisco" },
  { id: 102, fullName: "Marcus Tran", headline: "Full-Stack Builder · ex-Stripe", bio: "I live at the intersection of design and engineering. Shipped products used by 5M+ people. Looking for my next founding team.", skills: ["React", "TypeScript", "Node", "PostgreSQL"], yearsExperience: 6, city: "New York" },
  { id: 103, fullName: "Priya Rao", headline: "Growth Lead · ex-Figma", bio: "Took Figma from 100k to 4M users. Growth is a science — I bring the experiments and the instincts.", skills: ["GTM", "SEO", "Mixpanel", "SQL"], yearsExperience: 5, city: "Remote" },
  { id: 104, fullName: "Dev Patel", headline: "Platform Engineer · ex-Cloudflare", bio: "Built infra that serves 1T+ requests/day. Obsessed with zero-downtime and making ops boring in a good way.", skills: ["Kubernetes", "Rust", "Terraform", "Go"], yearsExperience: 7, city: "Austin" },
  { id: 105, fullName: "Sam Lee", headline: "Product Thinker · ex-Linear", bio: "I believe great products are opinionated. Shipped 0→1 three times. Looking for a founder with a strong point of view.", skills: ["Product", "Figma", "SQL", "Python"], yearsExperience: 4, city: "Los Angeles" },
];

function TalentReelCard({ profile, isActive, index }: { profile: any; isActive: boolean; index: number }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [saved, setSaved] = useState(false);

  const gradients = [
    "from-[#07101a] via-[#04090e] to-black",
    "from-[#120a1a] via-[#0a0612] to-black",
    "from-[#0a1a0f] via-[#06100a] to-black",
    "from-[#1a0f07] via-[#100905] to-black",
    "from-[#0a0d1a] via-[#060812] to-black",
  ];
  const gradient = gradients[index % gradients.length];
  const skills: string[] = profile.skills ?? [];
  const topSkills = skills.slice(0, 4);

  return (
    <div className={`h-full w-full snap-start relative flex flex-col bg-gradient-to-br ${gradient} border-b border-white/[0.06] overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(6,182,212,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(124,58,237,0.05),transparent_50%)] pointer-events-none" />

      {/* LIVE + Reel badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(252,165,165,0.9)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />
          LIVE
        </span>
        <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Talent Reel</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-4 pb-20 md:pb-6">
        <div className="flex items-end justify-between w-full gap-4">
          {/* Left: Profile info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="avatar-ring-sm shrink-0">
                <div className="w-14 h-14 rounded-full bg-white/8 flex items-center justify-center text-2xl font-black text-white relative">
                  {profile.fullName?.charAt(0) ?? "?"}
                  {isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-xl leading-tight" style={{ textShadow: "0 0 16px rgba(255,255,255,0.2)" }}>
                  {profile.fullName}
                </h3>
                <p style={{ color: "rgba(167,210,255,0.6)", fontSize: "0.8rem" }}>{profile.headline || "Startup Professional"}</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-white/75 text-sm line-clamp-2 leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/50">
              {profile.yearsExperience && (
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{profile.yearsExperience}y exp</span>
              )}
              {(profile.city || profile.location) && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.city || profile.location}</span>
              )}
            </div>

            {topSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium chip-shimmer"
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

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setLocation("/swipe")}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold bg-white text-black hover:bg-white/90 transition-all neon-cta"
              >
                <Zap className="h-3.5 w-3.5" /> Connect
              </button>
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border border-white/20 text-white/80 hover:bg-white/10 transition-all">
                    <ExternalLink className="h-3.5 w-3.5" /> Portfolio
                  </button>
                </a>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col items-center gap-5 pb-2">
            <button
              onClick={() => {
                setSaved(!saved);
                toast({ title: saved ? "Removed" : "Saved", description: saved ? "Removed from saved." : "Added to your saved talent." });
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${saved ? "border-white/40" : "border-white/12 group-hover:border-white/25"}`}
                style={{ background: saved ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.45)" }}>
                <Bookmark className={`h-5 w-5 ${saved ? "text-white fill-white" : "text-white/70"}`} />
              </div>
              <span className="text-white/50 text-[10px] font-medium">Save</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <MessageSquare className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/50 text-[10px] font-medium">Message</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: profile.fullName, text: `Check out ${profile.fullName} on Mesh` }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.origin).then(() => toast({ title: "Link copied!" })).catch(() => {});
                }
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <Share2 className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/50 text-[10px] font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
    </div>
  );
}

function StartupPitchCard({ video, isActive, onLike }: { video: any; isActive: boolean; onLike: (id: number) => void }) {
  const [, setLocation] = useLocation();

  return (
    <div className="h-full w-full snap-start relative flex items-center justify-center bg-black border-b border-white/[0.06]">
      <div className="absolute inset-0">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-55" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0d1527] to-black flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* LIVE badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(252,165,165,0.9)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />
          LIVE
        </span>
        <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Startup Pitch</span>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-20 md:pb-6 z-10">
        <div className="flex items-end justify-between w-full">
          <div className="flex-1 pr-14">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="avatar-ring-sm shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-xs font-black">
                  {video.startupProfile?.companyName?.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight" style={{ textShadow: "0 0 12px rgba(255,255,255,0.2)" }}>
                  {video.startupProfile?.companyName}
                </h3>
                {video.startupProfile?.stage && (
                  <span style={{ color: "rgba(167,210,255,0.55)", fontSize: "0.75rem" }}>
                    {video.startupProfile.stage} · {video.startupProfile.industry}
                  </span>
                )}
              </div>
            </div>
            <p className="text-white/90 text-sm font-semibold mb-1">{video.title}</p>
            <p className="text-white/55 text-xs line-clamp-2 mb-3 leading-relaxed">{video.description}</p>
            <button
              onClick={() => setLocation("/swipe")}
              className="px-5 py-2 rounded-full text-sm font-bold bg-white text-black hover:bg-white/90 transition-all neon-cta"
            >
              Apply Now
            </button>
          </div>

          <div className="flex flex-col items-center gap-5 pb-2">
            <button onClick={() => onLike(video.id)} className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-red-400/40 transition-all"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <Heart className="h-5 w-5 text-white/70 group-hover:text-red-400 transition-colors" />
              </div>
              <span className="text-white/50 text-[10px] font-medium">{video.likes}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <MessageSquare className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/50 text-[10px] font-medium">DM</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border border-white/12 group-hover:border-white/25 transition-all"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <Share2 className="h-5 w-5 text-white/70" />
              </div>
              <span className="text-white/50 text-[10px] font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
    </div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const isTalent = user?.userType === "talent";

  const { data: videosData, isLoading: videosLoading } = useListVideos({ limit: 10 });
  const { data: talentData, isLoading: talentLoading } = useListTalent(
    { limit: 20 },
    { query: { enabled: !isTalent, queryKey: ["feedTalent"] } }
  );
  const likeVideo = useLikeVideo();
  const { toast } = useToast();

  const videos = videosData?.videos || [];
  const talentProfilesRaw = talentData?.profiles || [];
  const talentProfiles = talentProfilesRaw.length > 0 ? talentProfilesRaw : DEMO_TALENT;

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      setActiveIndex(Math.round(scrollTop / clientHeight));
    };
    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = (id: number) => {
    likeVideo.mutate({ id }, {
      onSuccess: () => toast({ title: "Liked", description: "Added to your liked videos." }),
    });
  };

  const isLoading = isTalent ? videosLoading : talentLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400/40 border-t-cyan-400 animate-spin" />
            <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Loading feed...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isTalent && videos.length === 0) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center text-center p-4">
          <div>
            <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="text-xl font-bold">No pitches yet</h2>
            <p className="text-muted-foreground text-sm mt-2">Check back later for new startup pitches.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Tab header */}
      <div className="md:hidden sticky top-0 z-10 flex items-center justify-center gap-3 py-2.5 border-b border-white/[0.06]"
        style={{ background: "rgba(4,4,4,0.88)", backdropFilter: "blur(16px)" }}>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(252,165,165,0.8)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />
          LIVE
        </span>
        <span className="section-header-gradient">
          {isTalent ? "Startup Pitches" : "Talent Reels"}
        </span>
      </div>

      <div
        ref={containerRef}
        className="h-[calc(100dvh-120px)] md:h-[calc(100dvh-0px)] w-full max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory relative bg-black no-scrollbar scrollbar-none"
      >
        {isTalent
          ? videos.map((video, index) => (
              <StartupPitchCard
                key={video.id}
                video={video}
                isActive={index === activeIndex}
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
      </div>
    </AppLayout>
  );
}
