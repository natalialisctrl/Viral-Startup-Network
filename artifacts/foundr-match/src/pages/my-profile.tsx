import { Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useGetMyTalentProfile, useGetMyStartupProfile } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ExternalLink, MapPin, Briefcase, Zap, Linkedin,
  Flame, Globe, TrendingUp, Users, Settings, Eye
} from "lucide-react";

export default function MyProfile() {
  const { user } = useAuth();
  const isTalent = user?.userType === "talent";

  const { data: talentProfile, isLoading: talentLoading } = useGetMyTalentProfile({
    query: { enabled: isTalent, queryKey: ["myTalentProfile"] }
  });
  const { data: startupProfile, isLoading: startupLoading } = useGetMyStartupProfile({
    query: { enabled: !isTalent, queryKey: ["myStartupProfile"] }
  });

  const isLoading = isTalent ? talentLoading : startupLoading;
  const profile = isTalent ? talentProfile : startupProfile;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
          <div className="h-40 bg-muted rounded-xl animate-pulse" />
          <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No profile yet</h2>
          <p className="text-muted-foreground mb-6">Complete your onboarding to create your public profile.</p>
          <Link href="/onboarding">
            <Button>Set up profile</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Hero banner */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-white/5 via-white/10 to-white/5 relative border-b border-border/30">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 bg-background/50 backdrop-blur-md hover:bg-background/80 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          {/* "Your profile" pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Your public profile</span>
          </div>
          <Link href="/settings" className="absolute top-4 right-4">
            <Button variant="outline" size="sm" className="rounded-full border-white/15 bg-background/50 backdrop-blur-md hover:bg-background/80 gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          {isTalent ? (
            <TalentView profile={talentProfile as any} />
          ) : (
            <StartupView profile={startupProfile as any} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function TalentView({ profile }: { profile: any }) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
          <AvatarImage src={profile.avatarUrl || undefined} />
          <AvatarFallback className="bg-white/10 text-foreground text-4xl font-bold">
            {profile.fullName?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2 pt-2 md:pt-0">
          <h1 className="text-3xl font-bold">{profile.fullName}</h1>
          <p className="text-lg text-muted-foreground">{profile.headline}</p>
          {profile.momentumScore > 0 && (
            <Badge variant="outline" className="border-white/20 text-muted-foreground gap-1">
              <Zap className="h-3 w-3" /> Momentum {profile.momentumScore}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-foreground" /> About
            </h3>
            <div className="p-6 rounded-2xl bg-card border border-border/50 text-muted-foreground leading-relaxed">
              {profile.bio || "No bio provided."}
            </div>
          </section>

          {profile.whyStartups && (
            <section className="space-y-3">
              <h3 className="text-xl font-bold">Why Startups?</h3>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-foreground/80 italic">
                "{profile.whyStartups}"
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-xl font-bold">Superpowers</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill: string, i: number) => (
                <Badge key={i} className="px-3 py-1.5 text-sm bg-white/8 text-foreground border-white/10 hover:bg-white/12">
                  {skill}
                </Badge>
              ))}
              {(!profile.skills || profile.skills.length === 0) && (
                <p className="text-muted-foreground text-sm">No skills listed yet.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Archetype</p>
              <p className="font-semibold">{profile.personalityType || "Not specified"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Experience</p>
              <p className="font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                {profile.yearsExperience ? `${profile.yearsExperience}+ years` : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Location</p>
              <p className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {profile.city || "Not specified"}
                {profile.remotePreference === "Remote" && " (Remote)"}
              </p>
            </div>
            {profile.salaryMin && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Salary</p>
                <p className="font-semibold">${profile.salaryMin.toLocaleString()}+ / yr</p>
              </div>
            )}
            {profile.momentumScore > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">Momentum</p>
                  <span className="font-bold">{profile.momentumScore}</span>
                </div>
                <Progress value={profile.momentumScore} className="h-2" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {profile.linkedinUrl && (
              <Button variant="outline" className="flex-1 border-white/15" asChild>
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                </a>
              </Button>
            )}
            {profile.portfolioUrl && (
              <Button variant="outline" className="flex-1 border-white/15" asChild>
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> Portfolio
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StartupView({ profile }: { profile: any }) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-2xl">
          <AvatarImage src={profile.logoUrl || undefined} className="object-cover" />
          <AvatarFallback className="bg-white/10 text-foreground text-4xl font-bold rounded-2xl">
            {profile.companyName?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2 pt-2 md:pt-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{profile.companyName}</h1>
            {profile.isVerified && (
              <Badge variant="outline" className="border-white/20 text-muted-foreground">Verified</Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{profile.mission || profile.elevatorPitch}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {profile.badges?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((b: string, i: number) => (
                <Badge key={i} variant="outline" className="px-3 py-1.5 border-white/15">{b}</Badge>
              ))}
            </div>
          )}

          <section className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> The Pitch
            </h3>
            <div className="p-6 rounded-2xl bg-card border border-border/50 text-muted-foreground leading-relaxed text-lg">
              {profile.elevatorPitch || profile.mission || "No pitch provided yet."}
            </div>
          </section>

          {profile.whyJoinNow && (
            <section className="space-y-3">
              <h3 className="text-xl font-bold">Why Join Now?</h3>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-foreground/80">
                {profile.whyJoinNow}
              </div>
            </section>
          )}

          {profile.growthMetrics && (
            <section className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" /> Traction
              </h3>
              <div className="p-6 rounded-2xl bg-card border border-border/50 text-muted-foreground">
                {profile.growthMetrics}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-5">
            {profile.founderName && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Founder</p>
                <p className="font-semibold">{profile.founderName}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stage</p>
                <p className="font-semibold">{profile.stage || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Industry</p>
                <p className="font-semibold">{profile.industry || "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Team Size</p>
              <p className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                {profile.teamSize ? `${profile.teamSize} people` : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Location</p>
              <p className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {profile.location || "Remote"}
              </p>
            </div>
            {profile.fundingRaised && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Funding</p>
                <p className="font-semibold">${(profile.fundingRaised / 1_000_000).toFixed(1)}M raised</p>
              </div>
            )}
            {profile.heatScore > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" /> Heat Score
                  </p>
                  <span className="font-bold text-orange-500">{profile.heatScore}</span>
                </div>
                <Progress value={profile.heatScore} className="h-2 [&>div]:bg-orange-500" />
              </div>
            )}
          </div>

          {profile.websiteUrl && (
            <Button variant="outline" className="w-full border-white/15" asChild>
              <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" /> Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
