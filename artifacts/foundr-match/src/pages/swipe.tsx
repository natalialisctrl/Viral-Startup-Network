import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListTalent, useListStartups, useCreateSwipe, useGetMyTalentProfile, useGetMyStartupProfile } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, X, Star, Bookmark, Zap, MessageCircle, User, ExternalLink, MapPin, Briefcase, ChevronDown, Flame, TrendingUp, Users, SlidersHorizontal } from "lucide-react";
import { useLocation } from "wouter";

// ── Deterministic AI scoring ──────────────────────────────────────────────────
function getAiScore(cardId: number, myId: number): number {
  return 70 + (((cardId * 17 + myId * 13) * 7) % 26);
}

// ── Per-card gradient accent ───────────────────────────────────────────────────
function getCardGradient(card: any, isTalent: boolean): string {
  if (isTalent) {
    const ind = (card.industry || "").toLowerCase();
    if (ind.includes("ai") || ind.includes("ml") || ind.includes("llm") || ind.includes("neural"))
      return "from-[#0d1527] via-[#08101e] to-black";
    if (ind.includes("health") || ind.includes("bio"))
      return "from-[#0a1a0e] via-[#07120a] to-black";
    if (ind.includes("fintech") || ind.includes("finance") || ind.includes("legal"))
      return "from-[#13092a] via-[#0d0619] to-black";
    if (ind.includes("dev") || ind.includes("tool"))
      return "from-[#071520] via-[#040d14] to-black";
    if (ind.includes("creator") || ind.includes("media") || ind.includes("marketing"))
      return "from-[#1a0d1a] via-[#110811] to-black";
    if (ind.includes("edtech") || ind.includes("education"))
      return "from-[#1a150a] via-[#120e07] to-black";
    return "from-[#111] via-[#0a0a0a] to-black";
  } else {
    const skills = ((card.skills ?? []) as string[]).join(" ").toLowerCase();
    const hl = (card.headline || "").toLowerCase();
    if (skills.includes("python") || skills.includes("torch") || skills.includes("ml") || hl.includes("ml") || hl.includes("ai") || hl.includes("nlp"))
      return "from-[#071520] via-[#040d14] to-black";
    if (skills.includes("figma") || skills.includes("design") || hl.includes("design") || hl.includes("brand"))
      return "from-[#150d2a] via-[#0d0818] to-black";
    if (hl.includes("growth") || hl.includes("revenue") || hl.includes("marketing") || hl.includes("gtm"))
      return "from-[#1a100a] via-[#120b05] to-black";
    if (skills.includes("go") || skills.includes("rust") || skills.includes("kubernetes") || hl.includes("backend") || hl.includes("infra") || hl.includes("platform") || hl.includes("devops"))
      return "from-[#0a1a0e] via-[#07120a] to-black";
    if (hl.includes("security") || hl.includes("zero trust"))
      return "from-[#1a0a0a] via-[#120505] to-black";
    if (hl.includes("data") || hl.includes("analytics"))
      return "from-[#07161a] via-[#040f12] to-black";
    if (hl.includes("product") || hl.includes("pm"))
      return "from-[#130d1a] via-[#0d0812] to-black";
    return "from-[#0d1527] via-[#08101e] to-black";
  }
}

function getDimensions(cardId: number, myId: number) {
  const b = cardId * 17 + myId * 13;
  return {
    skills:  60 + ((b * 3  + 7)  % 35),
    culture: 58 + ((b * 11 + 5)  % 37),
    growth:  65 + ((b * 7  + 11) % 30),
    vibe:    55 + ((b * 13 + 3)  % 40),
  };
}

function getAiInsights(card: any, isTalent: boolean, score: number) {
  const strengths = isTalent
    ? [`Mission aligns with your career goals`, `Culture fit: ${score > 85 ? "exceptional" : "strong"}`]
    : [`Skill overlap with your open roles`, `Work style: ${score > 85 ? "perfect" : "solid"} match`];
  const challenge = score < 80 ? "Salary expectations may need alignment" : "Timezone overlap worth discussing";
  const starter = isTalent
    ? `Ask about their biggest product challenge this quarter`
    : `Ask what excites them most about early-stage building`;
  return { strengths, challenge, starter };
}

function recordProfileView(viewedId: number, viewedType: string) {
  fetch("/api/profile-views", {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ viewedId, viewedType }),
  }).catch(() => {});
}

// ── Animated match ring ───────────────────────────────────────────────────────
function MatchRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <motion.circle
          cx="56" cy="56" r={r} fill="none"
          stroke="rgba(255,255,255,0.9)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-black">{score}%</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Match</span>
      </div>
    </div>
  );
}

// ── Dimension bar ─────────────────────────────────────────────────────────────
function DimBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className="text-xs font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

// ── Project card (talent) ─────────────────────────────────────────────────────
function ProjectCard({ profile }: { profile: any }) {
  const skills = profile.skills ?? [];
  const hasPortfolio = !!profile.portfolioUrl;
  const hasGithub = !!profile.githubUrl;

  if (!hasPortfolio && !hasGithub && skills.length === 0) return null;

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Work & Projects</h4>
      <div className="space-y-2">
        {hasPortfolio && (
          <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors group">
            <div>
              <p className="font-semibold text-sm">Portfolio</p>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{profile.portfolioUrl}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </a>
        )}
        {hasGithub && (
          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors group">
            <div>
              <p className="font-semibold text-sm">GitHub</p>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{profile.githubUrl}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </a>
        )}
        {!hasPortfolio && !hasGithub && skills.length > 0 && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground mb-2">Top skills in action</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 6).map((s: string, i: number) => (
                <Badge key={i} variant="outline" className="border-white/15 text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Traction card (startup) ───────────────────────────────────────────────────
function TractionCard({ profile }: { profile: any }) {
  const items = [
    profile.teamSize && { icon: Users, label: "Team", value: `${profile.teamSize} people` },
    profile.fundingRaised && { icon: TrendingUp, label: "Raised", value: `$${(profile.fundingRaised / 1_000_000).toFixed(1)}M` },
    profile.growthMetrics && { icon: Flame, label: "Traction", value: profile.growthMetrics },
    profile.websiteUrl && { icon: ExternalLink, label: "Website", value: profile.websiteUrl, href: profile.websiteUrl },
  ].filter(Boolean) as any[];

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Traction & Team</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          const inner = (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1 h-full">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-sm font-semibold line-clamp-2">{item.value}</p>
            </div>
          );
          return item.href
            ? <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">{inner}</a>
            : <div key={i}>{inner}</div>;
        })}
      </div>
    </section>
  );
}

// ── Full-screen profile sheet ─────────────────────────────────────────────────
function ProfileSheet({
  card, isTalent, myId, onClose, onSwipe,
}: {
  card: any; isTalent: boolean; myId: number;
  onClose: () => void; onSwipe: (dir: "right" | "left") => void;
}) {
  const score = getAiScore(card.id, myId);
  const dims = getDimensions(card.id, myId);
  const { strengths, challenge, starter } = getAiInsights(card, isTalent, score);

  const name = isTalent ? card.companyName : card.fullName;
  const sub  = isTalent ? `${card.industry || "Startup"} · ${card.stage || "Early"}` : card.headline;
  const bio  = isTalent ? card.elevatorPitch ?? card.mission : card.bio ?? card.whyStartups;
  const tags = isTalent ? card.badges ?? [] : card.skills ?? [];
  const whyLabel = isTalent ? "Why Join Now?" : "Why Startups?";
  const whyText  = isTalent ? card.whyJoinNow : card.whyStartups;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-[#0d0d0d] rounded-t-[28px] border-t border-white/10 flex flex-col"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/8 hover:bg-white/14 transition-colors">
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-32 space-y-7 overscroll-contain">

          {/* ── Hero ── */}
          <div className="flex items-center gap-5 pt-2">
            <div className={`w-16 h-16 shrink-0 ${isTalent ? "rounded-2xl" : "rounded-full"} bg-white/10 border border-white/15 flex items-center justify-center text-2xl font-black`}>
              {name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black truncate">{name}</h2>
              <p className="text-sm text-muted-foreground truncate">{sub}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tags.slice(0, 3).map((t: string, i: number) => (
                  <Badge key={i} variant="outline" className="border-white/15 text-[10px] px-2 py-0">{t}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* ── AI Match Analysis ── */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Match Analysis</h4>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
              <div className="flex items-center gap-5">
                <MatchRing score={score} />
                <div className="flex-1 space-y-3">
                  <DimBar label="Skills overlap"  value={dims.skills}  delay={0.4} />
                  <DimBar label="Culture fit"     value={dims.culture} delay={0.5} />
                  <DimBar label="Growth potential" value={dims.growth} delay={0.6} />
                  <DimBar label="Working style"   value={dims.vibe}   delay={0.7} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 p-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
                    <span className="text-green-400 text-xs mt-0.5 shrink-0">✓</span>
                    <span className="text-xs text-foreground/80">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
                  <span className="text-amber-400 text-xs mt-0.5 shrink-0">⚠</span>
                  <span className="text-xs text-foreground/80">{challenge}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── About ── */}
          {bio && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">About</h4>
              <p className="text-sm leading-relaxed text-foreground/80">{bio}</p>
            </section>
          )}

          {/* ── Projects / Traction ── */}
          {isTalent
            ? <TractionCard profile={card} />
            : <ProjectCard profile={card} />
          }

          {/* ── All skills / badges ── */}
          {tags.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {isTalent ? "Culture & Vibe" : "Superpowers"}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t: string, i: number) => (
                  <Badge key={i} variant="outline" className="border-white/15 text-xs px-2.5 py-1">{t}</Badge>
                ))}
              </div>
            </section>
          )}

          {/* ── Why section ── */}
          {whyText && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{whyLabel}</h4>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-foreground/80 italic">
                "{whyText}"
              </div>
            </section>
          )}

          {/* ── Stats row ── */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h4>
            <div className="grid grid-cols-2 gap-2">
              {isTalent ? (
                <>
                  {card.stage && <StatPill icon={Flame} label="Stage" value={card.stage} />}
                  {card.industry && <StatPill icon={TrendingUp} label="Industry" value={card.industry} />}
                  {card.location && <StatPill icon={MapPin} label="Location" value={card.location} />}
                  {card.teamSize && <StatPill icon={Users} label="Team" value={`${card.teamSize} ppl`} />}
                </>
              ) : (
                <>
                  {card.yearsExperience && <StatPill icon={Briefcase} label="Experience" value={`${card.yearsExperience}+ yrs`} />}
                  {card.city && <StatPill icon={MapPin} label="Location" value={card.city} />}
                  {card.salaryMin && <StatPill icon={Zap} label="Min Salary" value={`$${(card.salaryMin/1000).toFixed(0)}k`} />}
                  {card.remotePreference && <StatPill icon={TrendingUp} label="Remote" value={card.remotePreference} />}
                </>
              )}
            </div>
          </section>

          {/* ── Conversation starter ── */}
          <section className="space-y-2 pb-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Conversation Starter</h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <Zap className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 italic">"{starter}"</p>
            </div>
          </section>

        </div>

        {/* ── Sticky action bar ── */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pt-4 border-t border-white/8 bg-[#0d0d0d]/95 backdrop-blur-md flex gap-3">
          <motion.div className="flex-1" whileTap={{ scale: 0.96 }}>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-white/15 text-muted-foreground hover:bg-destructive/10 hover:text-red-400 hover:border-red-400/40 text-base font-semibold gap-2 transition-all"
              onClick={() => onSwipe("left")}>
              <X className="h-5 w-5" /> Pass
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileTap={{ scale: 0.96 }}>
            <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-semibold gap-2 shadow-[0_0_30px_rgba(255,255,255,0.12)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all"
              onClick={() => onSwipe("right")}>
              <Heart className="h-5 w-5 fill-current" /> Connect
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────
const RADII = ["10 mi", "25 mi", "50 mi", "100 mi", "Anywhere"] as const;
type Radius = typeof RADII[number];

interface Filters {
  city: string;
  radius: Radius;
  experience: string;
  workStyle: string;
  industry: string;
}

const DEFAULT_FILTERS: Filters = { city: "", radius: "Anywhere", experience: "Any", workStyle: "Any", industry: "Any" };

const EXP_OPTS = ["Any", "0–2 yrs", "3–5 yrs", "6–10 yrs", "10+ yrs"] as const;
const STYLE_OPTS = ["Any", "Remote", "Hybrid", "On-site"] as const;
const INDUSTRY_OPTS = ["Any", "AI / ML", "FinTech", "DevTools", "HealthTech", "SaaS", "Consumer", "EdTech", "Climate"] as const;

function ChipRow({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
            value === o
              ? "bg-white text-black border-white"
              : "bg-white/5 border-white/12 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function FilterSheet({
  filters, onApply, onClose, isTalent,
}: { filters: Filters; onApply: (f: Filters) => void; onClose: () => void; isTalent: boolean }) {
  const [local, setLocal] = useState<Filters>(filters);
  const set = (k: keyof Filters) => (v: string) => setLocal(prev => ({ ...prev, [k]: v }));

  const activeCount = [
    local.city,
    local.experience !== "Any" && "x",
    local.workStyle !== "Any" && "x",
    local.industry !== "Any" && "x",
  ].filter(Boolean).length;

  const handleApply = () => { onApply({ ...local, city: local.city.trim() }); onClose(); };
  const handleClear = () => { onApply(DEFAULT_FILTERS); onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-white/10 rounded-t-[28px] flex flex-col"
        style={{ maxHeight: "88dvh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">Filters</h3>
            {activeCount > 0 && (
              <span className="text-xs font-bold bg-white text-black rounded-full px-2 py-0.5">{activeCount}</span>
            )}
          </div>
          <button onClick={handleClear} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Clear all
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="overflow-y-auto flex-1 px-6 pb-32 space-y-7 overscroll-contain">

          {/* Location */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Location</span>
            </div>
            <div className="relative">
              <Input
                placeholder="City, e.g. San Francisco…"
                value={local.city}
                onChange={e => set("city")(e.target.value)}
                className="pl-4 bg-white/5 border-white/15 focus:border-white/40 rounded-xl h-11"
                autoFocus
              />
            </div>
            <ChipRow options={RADII} value={local.radius} onChange={v => set("radius")(v as Radius)} />
          </section>

          {/* Experience */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{isTalent ? "Company Stage" : "Experience Level"}</span>
            </div>
            {isTalent ? (
              <ChipRow options={["Any", "Pre-seed", "Seed", "Series A", "Series B+"]} value={local.experience} onChange={set("experience")} />
            ) : (
              <ChipRow options={EXP_OPTS} value={local.experience} onChange={set("experience")} />
            )}
          </section>

          {/* Work Style */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Work Style</span>
            </div>
            <ChipRow options={STYLE_OPTS} value={local.workStyle} onChange={set("workStyle")} />
          </section>

          {/* Main Interest / Industry */}
          <section className="space-y-3 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Main Interest</span>
            </div>
            <ChipRow options={INDUSTRY_OPTS} value={local.industry} onChange={set("industry")} />
          </section>

        </div>

        {/* Sticky apply */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/8 bg-[#0d0d0d]/95 backdrop-blur-md">
          <Button className="w-full h-13 rounded-2xl text-base font-semibold" onClick={handleApply}>
            Apply Filters{activeCount > 0 ? ` (${activeCount} active)` : ""}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Swipe Page ────────────────────────────────────────────────────────────
export default function Swipe() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createSwipe = useCreateSwipe();
  const isTalent = user?.userType === "talent";

  const { data: talentData, isLoading: isLoadingTalent, isError: isErrorTalent, refetch: refetchTalent } = useListTalent({}, { query: { enabled: !isTalent, queryKey: ["listTalent"] } });
  const { data: startupData, isLoading: isLoadingStartups, isError: isErrorStartups, refetch: refetchStartups } = useListStartups({}, { query: { enabled: isTalent, queryKey: ["listStartups"] } });
  useGetMyTalentProfile({ query: { enabled: isTalent, queryKey: ["myTalentProfile"] } });
  useGetMyStartupProfile({ query: { enabled: !isTalent, queryKey: ["myStartupProfile"] } });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<{ card: any; score: number; matchId: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [expandedCard, setExpandedCard] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const isDragging = useRef(false);

  const allCards = isTalent ? startupData?.profiles || [] : talentData?.profiles || [];
  const isLoading = isTalent ? isLoadingStartups : isLoadingTalent;
  const isError = isTalent ? isErrorStartups : isErrorTalent;
  const refetch = isTalent ? refetchStartups : refetchTalent;
  const myId = user?.id ?? 1;

  const cards = useMemo(() => {
    return allCards.filter((c: any) => {
      if (filters.city) {
        const loc = (c.city || c.location || "").toLowerCase();
        if (!loc.includes(filters.city.toLowerCase())) return false;
      }
      if (filters.experience !== "Any") {
        if (isTalent) {
          const stageMap: Record<string, string[]> = {
            "Pre-seed": ["Pre-seed", "pre-seed", "Idea"],
            "Seed": ["Seed", "seed"],
            "Series A": ["Series A", "series a", "Series A+"],
            "Series B+": ["Series B", "Series C", "series b", "series c", "Growth", "Late"],
          };
          const allowed = stageMap[filters.experience] ?? [];
          if (!allowed.some(s => (c.stage || "").toLowerCase().includes(s.toLowerCase()))) return false;
        } else {
          const rangeMap: Record<string, [number, number]> = {
            "0–2 yrs": [0, 2], "3–5 yrs": [3, 5], "6–10 yrs": [6, 10], "10+ yrs": [10, 99],
          };
          const [min, max] = rangeMap[filters.experience] ?? [0, 99];
          const yrs = c.yearsExperience ?? 0;
          if (yrs < min || yrs > max) return false;
        }
      }
      if (filters.workStyle !== "Any") {
        const remote = (c.remotePreference || c.remoteOptions || "").toLowerCase();
        const ws = filters.workStyle.toLowerCase();
        if (!remote.includes(ws)) return false;
      }
      if (filters.industry !== "Any") {
        const ind = (c.industry || (c.skills ?? []).join(" ") || "").toLowerCase();
        if (!ind.includes(filters.industry.toLowerCase().replace(" / ", "/"))) return false;
      }
      return true;
    });
  }, [allCards, filters, isTalent]);

  useEffect(() => { setCurrentIndex(0); }, [filters]);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (currentCard) recordProfileView(currentCard.id, isTalent ? "startup" : "talent");
  }, [currentIndex]);

  const handleSwipe = useCallback((direction: "right" | "left" | "up" | "down") => {
    if (!currentCard) return;
    setExpandedCard(null);
    createSwipe.mutate(
      { data: { targetId: currentCard.id, targetType: isTalent ? "startup" : "talent", direction } },
      {
        onSuccess: (res) => {
          if (res.matched && res.matchId) {
            const score = getAiScore(currentCard.id, myId);
            setMatchModal({ card: currentCard, score, matchId: res.matchId });
          }
          setCurrentIndex(prev => prev + 1);
        }
      }
    );
  }, [currentCard, isTalent, myId, createSwipe]);

  if (isError) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
            <X className="h-8 w-8 text-destructive/60" />
          </div>
          <h2 className="text-xl font-bold mb-2">Couldn't load profiles</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">Something went wrong fetching profiles. Try again.</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/20 animate-ping" />
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
          {[filters.city, filters.experience !== "Any" && "x", filters.workStyle !== "Any" && "x", filters.industry !== "Any" && "x"].filter(Boolean).length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-2">No matches found</h2>
              <p className="text-muted-foreground max-w-md mb-6">No profiles match your current filters. Try broadening your search.</p>
              <Button onClick={() => setFilters(DEFAULT_FILTERS)}>
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Clear filters
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
              <p className="text-muted-foreground max-w-md mb-6">You've seen all current {isTalent ? "startups" : "candidates"}. Explore them again or check back soon for new ones.</p>
              <Button onClick={() => setCurrentIndex(0)}>
                <Star className="h-4 w-4 mr-2" /> Explore again
              </Button>
            </>
          )}
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
      {/* ── Filter Sheet ── */}
      <AnimatePresence>
        {showFilters && (
          <FilterSheet
            filters={filters}
            onApply={setFilters}
            onClose={() => setShowFilters(false)}
            isTalent={isTalent}
          />
        )}
      </AnimatePresence>

      {/* ── Profile Sheet ── */}
      <AnimatePresence>
        {expandedCard && (
          <ProfileSheet
            card={expandedCard}
            isTalent={isTalent}
            myId={myId}
            onClose={() => setExpandedCard(null)}
            onSwipe={(dir) => { setExpandedCard(null); handleSwipe(dir); }}
          />
        )}
      </AnimatePresence>

      {/* ── Match Modal ── */}
      <AnimatePresence>
        {matchModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="w-full max-w-md bg-card border border-white/15 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-6">
                <div className="text-5xl mb-3">🎯</div>
                <h2 className="text-3xl font-black tracking-tight">It's a Match!</h2>
                <p className="text-muted-foreground mt-1 text-sm">This could change everything.</p>
              </motion.div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }} className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold border border-white/15">{user?.name?.charAt(0)}</div>
                <div className="flex flex-col items-center">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent via-foreground to-transparent mb-1" />
                  <Badge className="bg-primary text-primary-foreground font-black text-lg px-3 py-1 shadow-[0_0_20px_rgba(255,255,255,0.18)]">{matchModal.score}%</Badge>
                  <div className="h-px w-8 bg-gradient-to-r from-transparent via-foreground to-transparent mt-1" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold border border-white/15">
                  {((matchModal.card as any).companyName ?? (matchModal.card as any).fullName ?? "?").charAt(0)}
                </div>
              </motion.div>
              {(() => {
                const { strengths, challenge, starter } = getAiInsights(matchModal.card, isTalent, matchModal.score);
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-3 mb-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1.5">Why You Match</p>
                      {strengths.map((s, i) => <p key={i} className="text-sm flex items-start gap-1.5"><span className="text-green-400 mt-0.5">✓</span>{s}</p>)}
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Potential Challenge</p>
                      <p className="text-sm">⚠ {challenge}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Try saying this</p>
                      <p className="text-sm italic">"{starter}"</p>
                    </div>
                  </motion.div>
                );
              })()}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-white/15" onClick={() => { setMatchModal(null); setLocation(`/talent/${matchModal?.card?.id}`); }}>
                  <User className="h-4 w-4 mr-2" />View Profile
                </Button>
                <Button className="flex-1 h-12 rounded-xl bg-primary shadow-[0_0_20px_rgba(255,255,255,0.12)]" onClick={() => { setMatchModal(null); setLocation(`/chat/${matchModal?.matchId}`); }}>
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
      <div className="flex flex-col items-center px-3 pt-2 overflow-hidden" style={{ height: 'calc(100dvh - 64px)' }}>

        {/* Filter pill */}
        {(() => {
          const activeCount = [
            filters.city,
            filters.experience !== "Any" && "x",
            filters.workStyle !== "Any" && "x",
            filters.industry !== "Any" && "x",
          ].filter(Boolean).length;
          return (
            <div className="flex items-center gap-2 mb-2 w-full max-w-md shrink-0">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  activeCount > 0
                    ? "bg-white text-black border-white"
                    : "bg-white/5 border-white/15 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                <span>Filters{activeCount > 0 ? ` · ${activeCount}` : ""}</span>
              </motion.button>
              {activeCount > 0 && (
                <>
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {cards.length} {cards.length === 1 ? "result" : "results"}
                  </span>
                </>
              )}
            </div>
          );
        })()}

        {/* Card stack — flexible height */}
        <div className="relative w-full max-w-md flex-1 min-h-0">
          {cards[currentIndex + 1] && (
            <div className="absolute inset-x-3 top-2 bottom-0 rounded-3xl border border-white/8 bg-white/3" />
          )}

          <AnimatePresence mode="popLayout">
            {currentCard && (
              <motion.div
                key={currentCard.id}
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ x: dragX > 0 ? 1400 : -1400, opacity: 0, rotate: dragX > 0 ? 22 : -22, transition: { duration: 0.22 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.75}
                onDragStart={() => { isDragging.current = true; }}
                onDrag={(_, info) => setDragX(info.offset.x)}
                onDragEnd={(_, { offset }) => {
                  setDragX(0);
                  setTimeout(() => { isDragging.current = false; }, 50);
                  if (offset.x > 100) handleSwipe("right");
                  else if (offset.x < -100) handleSwipe("left");
                }}
                onClick={() => {
                  if (!isDragging.current) setExpandedCard(currentCard);
                }}
                style={{ rotate: dragX * 0.035 }}
                className="absolute inset-0 w-full h-full cursor-pointer select-none"
              >
                {/* ── Card ── */}
                <div className={`w-full h-full rounded-3xl overflow-hidden relative shadow-2xl bg-gradient-to-br ${getCardGradient(currentCard, isTalent)}`}>

                  {/* Subtle radial highlight */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(255,255,255,0.07),transparent_55%)] pointer-events-none" />

                  {/* Video */}
                  {videoUrl && (
                    <video src={videoUrl} autoPlay muted loop playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  )}

                  {/* Like / Nope overlays */}
                  <AnimatePresence>
                    {dragX > 40 && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: Math.min(dragX / 110, 1), scale: 1 }}
                        className="absolute top-8 left-6 z-20 border-[3px] border-emerald-400 text-emerald-400 rounded-2xl px-4 py-1.5 font-black text-xl -rotate-12 backdrop-blur-sm bg-emerald-400/5">
                        LIKE 💚
                      </motion.div>
                    )}
                    {dragX < -40 && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: Math.min(-dragX / 110, 1), scale: 1 }}
                        className="absolute top-8 right-6 z-20 border-[3px] border-red-400 text-red-400 rounded-2xl px-4 py-1.5 font-black text-xl rotate-12 backdrop-blur-sm bg-red-400/5">
                        NOPE ✕
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Top-left: tap hint */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                    <User className="h-3 w-3 text-white/50" />
                    <span className="text-[10px] text-white/50 font-medium">tap to explore</span>
                  </div>

                  {/* Top-right: badges */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 items-end">
                    <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full shadow-lg">
                      {score}% Match
                    </span>
                    {isTrending && (
                      <span className="bg-orange-500/90 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">🔥 Trending</span>
                    )}
                    {isFastReply && (
                      <span className="bg-white/15 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/20">⚡ Fast Reply</span>
                    )}
                  </div>

                  {/* Center: avatar / logo */}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '56%' }}>
                    {isTalent ? (
                      <div className="relative">
                        {(currentCard as any).logoUrl ? (
                          <img src={(currentCard as any).logoUrl} alt="" className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-2xl" />
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl font-black text-white/90 shadow-2xl backdrop-blur-sm">
                            {(currentCard as any).companyName?.charAt(0)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        {(currentCard as any).avatarUrl ? (
                          <img
                            src={(currentCard as any).avatarUrl}
                            alt=""
                            className="w-28 h-28 rounded-full object-cover border-[3px] border-white/25 shadow-2xl"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-white/10 border-[3px] border-white/20 flex items-center justify-center text-5xl font-black text-white/90 shadow-2xl">
                            {(currentCard as any).fullName?.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-16 px-5 pb-5">
                    {/* Name + meta */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-white leading-tight truncate">
                            {isTalent ? (currentCard as any).companyName : (currentCard as any).fullName}
                          </h2>
                          {/* Portfolio / website link */}
                          {(() => {
                            const url = isTalent
                              ? (currentCard as any).websiteUrl
                              : ((currentCard as any).portfolioUrl ?? (currentCard as any).linkedinUrl);
                            return url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 p-1 rounded-full bg-white/10 border border-white/20 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null;
                          })()}
                        </div>
                        <p className="text-white/50 text-[13px] leading-snug mt-0.5 truncate">
                          {isTalent
                            ? `${(currentCard as any).industry || "Startup"} · ${(currentCard as any).stage || "Early"}`
                            : (currentCard as any).headline}
                        </p>
                      </div>
                      {!isTalent && (currentCard as any).yearsExperience && (
                        <span className="shrink-0 text-white/40 text-xs bg-white/8 border border-white/12 px-2.5 py-1 rounded-full mt-0.5">
                          {(currentCard as any).yearsExperience}y exp
                        </span>
                      )}
                      {isTalent && (currentCard as any).teamSize && (
                        <span className="shrink-0 text-white/40 text-xs bg-white/8 border border-white/12 px-2.5 py-1 rounded-full flex items-center gap-1 mt-0.5">
                          <Users className="h-3 w-3" />{(currentCard as any).teamSize}
                        </span>
                      )}
                    </div>

                    {/* Bio — capped at ~120 chars / 2 sentences */}
                    {(() => {
                      const raw = isTalent
                        ? ((currentCard as any).elevatorPitch ?? (currentCard as any).mission ?? (currentCard as any).bio)
                        : ((currentCard as any).bio ?? (currentCard as any).whyStartups);
                      if (!raw) return null;
                      const MAX = 120;
                      const trimmed = raw.length > MAX
                        ? raw.slice(0, raw.lastIndexOf(" ", MAX)) + "…"
                        : raw;
                      return (
                        <p className="text-white/65 text-[12.5px] leading-relaxed mb-2.5 mt-1.5">
                          {trimmed}
                        </p>
                      );
                    })()}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {(isTalent
                        ? ((currentCard as any).badges ?? []).slice(0, 4)
                        : ((currentCard as any).skills ?? []).slice(0, 4)
                      ).map((tag: string, i: number) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/65 text-xs border border-white/12 backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* AI insight row */}
                    <div className="flex items-center gap-2 bg-white/6 rounded-xl px-3 py-2 border border-white/10">
                      <Zap className="h-3 w-3 text-white/35 shrink-0" />
                      <p className="text-[11px] text-white/45 truncate">
                        {score > 87 ? "Exceptional culture & skill alignment detected"
                          : score > 82 ? "Strong alignment across key hiring signals"
                          : "Good compatibility on core requirements"}
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Action Buttons — always visible above bottom nav ── */}
        <div className="flex items-center justify-center gap-4 pt-3 pb-[72px] md:pb-5 w-full max-w-md shrink-0">
          {/* Pass */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
            onClick={() => handleSwipe("left")}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-[60px] h-[60px] rounded-full bg-white/6 border-2 border-red-500/40 flex items-center justify-center shadow-lg group-hover:bg-red-500/10 group-hover:border-red-500/70 transition-all">
              <X className="h-6 w-6 text-red-400" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] text-white/30 font-medium">Pass</span>
          </motion.button>

          {/* Save */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
            onClick={() => handleSwipe("down")}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-[48px] h-[48px] rounded-full bg-white/5 border border-white/20 flex items-center justify-center shadow-md group-hover:bg-white/10 group-hover:border-white/40 transition-all">
              <Bookmark className="h-5 w-5 text-white/50" />
            </div>
            <span className="text-[10px] text-white/25 font-medium">Save</span>
          </motion.button>

          {/* Like */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
            onClick={() => handleSwipe("right")}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-[60px] h-[60px] rounded-full bg-white border-2 border-white flex items-center justify-center shadow-xl shadow-white/15 group-hover:bg-white/90 transition-all">
              <Heart className="h-6 w-6 text-black fill-current" strokeWidth={2} />
            </div>
            <span className="text-[10px] text-white/30 font-medium">Like</span>
          </motion.button>
        </div>

      </div>
    </AppLayout>
  );
}
