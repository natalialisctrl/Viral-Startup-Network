import { useRef, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListVideos, useLikeVideo, useListTalent } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, MessageSquare, Bookmark, Info, Zap, MapPin, Briefcase, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// ── Talent Reel Card (shown to founders) ─────────────────────────────────────
function TalentReelCard({
  profile,
  isActive,
  index,
}: {
  profile: any;
  isActive: boolean;
  index: number;
}) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [saved, setSaved] = useState(false);

  const gradients = [
    "from-zinc-900 via-zinc-800 to-zinc-900",
    "from-zinc-950 via-zinc-900 to-zinc-950",
    "from-black via-zinc-900 to-black",
  ];
  const gradient = gradients[index % gradients.length];

  const skills: string[] = profile.skills ?? [];
  const topSkills = skills.slice(0, 5);

  return (
    <div className="h-full w-full snap-start relative flex flex-col bg-black border-b border-white/10 overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-4 pb-20 md:pb-6">
        <div className="flex items-end justify-between w-full gap-4">
          {/* Left: Profile info */}
          <div className="flex-1 space-y-3">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-white/30">
                  <AvatarImage src={profile.avatarUrl || undefined} />
                  <AvatarFallback className="bg-white/10 text-white text-lg font-bold">
                    {profile.fullName?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                {isActive && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-xl leading-tight">{profile.fullName}</h3>
                <p className="text-white/70 text-sm">{profile.headline || "Startup Professional"}</p>
              </div>
            </div>

            {/* Bio snippet */}
            {profile.bio && (
              <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              {profile.yearsExperience && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {profile.yearsExperience}y exp
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </span>
              )}
              {profile.preferredWorkStyle && (
                <Badge variant="outline" className="border-white/20 text-white/70 text-[10px] py-0 h-5">
                  {profile.preferredWorkStyle}
                </Badge>
              )}
            </div>

            {/* Skills */}
            {topSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/15">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-white/90 rounded-full font-semibold text-sm px-5"
                onClick={() => setLocation("/swipe")}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" /> Connect
              </Button>
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-white/25 text-white hover:bg-white/10 rounded-full text-sm px-4">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Portfolio
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Right: Action column */}
          <div className="flex flex-col items-center gap-5 pb-2">
            <button
              onClick={() => {
                setSaved(!saved);
                toast({ title: saved ? "Removed" : "Saved", description: saved ? "Removed from saved talent." : "Added to your saved talent." });
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${saved ? "bg-white/20 border-white/40" : "bg-black/40 border-white/10 group-hover:bg-black/60"}`}>
                <Bookmark className={`h-5 w-5 ${saved ? "text-white fill-white" : "text-white"}`} />
              </div>
              <span className="text-white text-[10px] font-medium">Save</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-[10px] font-medium">Message</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: profile.fullName, text: `Check out ${profile.fullName} on Mesh — ${profile.headline}` }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.origin).then(() => toast({ title: "Link copied!" })).catch(() => {});
                }
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-[10px] font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top label */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Talent Reel</span>
      </div>
    </div>
  );
}

// ── Startup Pitch Card (shown to talent) ──────────────────────────────────────
function StartupPitchCard({
  video,
  isActive,
  onLike,
}: {
  video: any;
  isActive: boolean;
  onLike: (id: number) => void;
}) {
  const [, setLocation] = useLocation();

  return (
    <div className="h-full w-full snap-start relative flex items-center justify-center bg-zinc-900 border-b border-white/10">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-800">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4 pb-20 md:pb-6">
        <div className="flex items-end justify-between w-full">
          <div className="flex-1 pr-14">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-10 w-10 border border-white/50">
                <AvatarImage src={video.startupProfile?.logoUrl || undefined} />
                <AvatarFallback className="bg-white/10 text-white text-xs font-bold">
                  {video.startupProfile?.companyName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{video.startupProfile?.companyName}</h3>
                {video.startupProfile?.stage && (
                  <span className="text-white/60 text-xs">{video.startupProfile.stage} · {video.startupProfile.industry}</span>
                )}
              </div>
            </div>
            <p className="text-white/90 text-sm font-semibold mb-1">{video.title}</p>
            <p className="text-white/65 text-xs line-clamp-2 mb-3">{video.description}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-white/90 rounded-full font-semibold"
                onClick={() => setLocation("/swipe")}
              >
                Apply Now
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-5 pb-2">
            <button onClick={() => onLike(video.id)} className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-[10px] font-medium">{video.likes}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-[10px] font-medium">DM</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-[10px] font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top label */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Startup Pitch</span>
      </div>
    </div>
  );
}

// ── Feed page ──────────────────────────────────────────────────────────────────
export default function Feed() {
  const { user } = useAuth();
  const isTalent = user?.userType === "talent";

  const { data: videosData, isLoading: videosLoading } = useListVideos({ limit: 10 });
  const { data: talentData, isLoading: talentLoading } = useListTalent(
    { limit: 20 },
    { query: { enabled: !isTalent } }
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  // ── Founder: no talent yet ──
  if (!isTalent && talentProfiles.length === 0) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center text-center p-4">
          <div>
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold">No talent reels yet</h2>
            <p className="text-muted-foreground">Check back soon — candidates are creating their reels now.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Talent: no pitches yet ──
  if (isTalent && videos.length === 0) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center text-center p-4">
          <div>
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold">No pitches yet</h2>
            <p className="text-muted-foreground">Check back later for new startup pitches.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Tab header */}
      <div className="md:hidden sticky top-0 z-10 flex items-center justify-center py-2 bg-black/80 backdrop-blur-sm border-b border-white/5">
        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
          {isTalent ? "Startup Pitches" : "Talent Reels"}
        </span>
      </div>

      <div
        ref={containerRef}
        className="h-[calc(100dvh-120px)] md:h-[calc(100dvh-0px)] w-full max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory relative bg-black no-scrollbar"
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
