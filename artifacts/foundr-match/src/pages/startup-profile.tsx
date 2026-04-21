import { useRoute, Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { useGetStartupProfile } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, TrendingUp, Flame, Globe, ExternalLink, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StartupProfile() {
  const [, params] = useRoute("/startup/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: profile, isLoading } = useGetStartupProfile(id, {
    query: { enabled: !!id, queryKey: ["getStartupProfile", id] }
  });

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
          <h2 className="text-2xl font-bold mb-2">Startup not found</h2>
          <p className="text-muted-foreground mb-4">This startup may have been removed or is unavailable.</p>
          <Link href="/swipe">
            <Button>Back to Discovery</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Header Hero */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600/30 via-primary/20 to-purple-600/30 relative">
          <Link href="/swipe">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 bg-background/50 backdrop-blur-md hover:bg-background/80 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-2xl">
              <AvatarImage src={profile.logoUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary text-4xl font-bold rounded-2xl">
                {profile.companyName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2 pt-2 md:pt-0 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{profile.companyName}</h1>
                    {profile.isVerified && (
                      <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/20 border-0">Verified</Badge>
                    )}
                  </div>
                  <p className="text-lg text-primary font-medium mt-1">{profile.mission || profile.elevatorPitch}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button className="rounded-full shadow-lg shadow-primary/20">
                    <MessageSquare className="w-4 h-4 mr-2" /> Message Founder
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Badges row */}
              {profile.badges && profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1.5 bg-card border-primary/20 text-foreground">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Pitch Section */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" /> The Pitch
                </h3>
                <div className="p-6 rounded-2xl bg-card border border-border/50 text-muted-foreground leading-relaxed text-lg">
                  {profile.elevatorPitch || profile.mission || "No detailed pitch provided."}
                </div>
              </section>

              {/* Why Join Section */}
              {profile.whyJoinNow && (
                <section className="space-y-4">
                  <h3 className="text-xl font-bold">Why Join Now?</h3>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-primary-foreground/90">
                    {profile.whyJoinNow}
                  </div>
                </section>
              )}

              {/* Growth Metrics */}
              {profile.growthMetrics && (
                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" /> Traction
                  </h3>
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    {profile.growthMetrics}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Founder</p>
                  <p className="font-semibold">{profile.founderName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Stage</p>
                    <p className="font-semibold">{profile.stage || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Industry</p>
                    <p className="font-semibold">{profile.industry || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Team Size</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" /> 
                    {profile.teamSize ? `${profile.teamSize} employees` : "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" /> 
                    {profile.location || "Remote"}
                  </p>
                </div>

                {profile.fundingRaised && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Funding</p>
                    <p className="font-semibold">${(profile.fundingRaised / 1000000).toFixed(1)}M Raised</p>
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

              {/* Links */}
              {profile.websiteUrl && (
                <Button className="w-full" asChild>
                  <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" /> Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
