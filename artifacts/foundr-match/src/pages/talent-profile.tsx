import { useRoute, Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { useGetTalentProfile } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, MapPin, Briefcase, Zap, Github, Linkedin, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function TalentProfile() {
  const [, params] = useRoute("/talent/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: profile, isLoading } = useGetTalentProfile(id, {
    query: { enabled: !!id, queryKey: ["getTalentProfile", id] }
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
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">This profile may have been removed or is unavailable.</p>
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
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/10 relative">
          <Link href="/swipe">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 bg-background/50 backdrop-blur-md hover:bg-background/80 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-4xl font-bold">
                {profile.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2 pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                  <p className="text-lg text-muted-foreground">{profile.headline}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="rounded-full shadow-lg shadow-primary/20">
                    <MessageSquare className="w-4 h-4 mr-2" /> Message
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" /> About
                </h3>
                <div className="p-6 rounded-2xl bg-card border border-border/50 text-muted-foreground leading-relaxed">
                  {profile.bio || "No bio provided."}
                </div>
              </section>

              {/* Why Startups Section */}
              {profile.whyStartups && (
                <section className="space-y-4">
                  <h3 className="text-xl font-bold">Why Startups?</h3>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-primary-foreground/90 italic">
                    "{profile.whyStartups}"
                  </div>
                </section>
              )}

              {/* Skills */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold">Superpowers</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <Badge key={i} className="px-3 py-1.5 text-sm bg-accent/50 text-accent-foreground hover:bg-accent border-border/50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Archetype</p>
                  <p className="font-semibold">{profile.personalityType || "Not specified"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Experience</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> 
                    {profile.yearsExperience ? `${profile.yearsExperience}+ years` : "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> 
                    {profile.city || "Not specified"} {profile.remotePreference === "Remote" && "(Remote preferred)"}
                  </p>
                </div>

                {profile.salaryMin && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Salary Expectation</p>
                    <p className="font-semibold">${profile.salaryMin.toLocaleString()}+ / yr</p>
                  </div>
                )}
                
                {profile.momentumScore > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-muted-foreground">Momentum Score</p>
                      <span className="font-bold text-primary">{profile.momentumScore}</span>
                    </div>
                    <Progress value={profile.momentumScore} className="h-2" />
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex gap-2">
                {profile.linkedinUrl && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                    </a>
                  </Button>
                )}
                {profile.portfolioUrl && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
