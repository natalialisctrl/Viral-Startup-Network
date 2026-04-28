import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCreateTalentProfile, useCreateStartupProfile, useUpdateUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const isTalent = user?.userType === "talent";

  const createTalent = useCreateTalentProfile();
  const createStartup = useCreateStartupProfile();
  const updateUser = useUpdateUser();

  // Talent State
  const [personality, setPersonality] = useState("");
  const [skills, setSkills] = useState("");
  const [roles, setRoles] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [whyStartups, setWhyStartups] = useState("");
  
  // Startup State
  const [companyName, setCompanyName] = useState("");
  const [mission, setMission] = useState("");
  const [stage, setStage] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [locationText, setLocationText] = useState("");

  const totalSteps = isTalent ? 3 : 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      if (isTalent) {
        await createTalent.mutateAsync({
          data: {
            fullName: user?.name || "Talent",
            personalityType: personality,
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            desiredRoles: roles.split(",").map(r => r.trim()).filter(Boolean),
            salaryMin: parseInt(salaryMin) || 0,
            whyStartups,
          }
        });
      } else {
        await createStartup.mutateAsync({
          data: {
            founderName: user?.name || "Founder",
            companyName,
            mission,
            stage,
            teamSize: parseInt(teamSize) || 1,
            location: locationText,
          }
        });
      }

      await updateUser.mutateAsync({
        id: user!.id,
        data: { onboardingComplete: true, personalityType: personality }
      });

      setLocation("/swipe");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Progress value={(step / totalSteps) * 100} className="mb-8" />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">What's your archetype?</h2>
              <p className="text-muted-foreground text-sm -mt-2">Pick the one that fits you best — this shapes who you get matched with.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { type: "Builder",    emoji: "🔨", desc: "You ship fast and turn ideas into working products from scratch." },
                  { type: "Visionary",  emoji: "🔭", desc: "You see the future others can't yet and inspire people to build toward it." },
                  { type: "Operator",   emoji: "⚙️",  desc: "You turn chaos into process and make the engine run at scale." },
                  { type: "Craftsman",  emoji: "🎯", desc: "You obsess over quality and produce deeply thoughtful, refined work." },
                  { type: "Rainmaker",  emoji: "💰", desc: "You open doors, close deals, and turn relationships into revenue." },
                ].map(({ type, emoji, desc }) => (
                  <div
                    key={type}
                    onClick={() => setPersonality(type)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      personality === type ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{emoji}</span>
                      <h3 className="font-bold">{type}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
              <Button disabled={!personality} onClick={handleNext} className="w-full">Continue</Button>
            </motion.div>
          )}

          {step === 2 && isTalent && (
            <motion.div
              key="step2t"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Your Arsenal</h2>
              <div className="space-y-4">
                <div>
                  <Label>Skills (comma separated)</Label>
                  <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" />
                </div>
                <div>
                  <Label>Desired Roles (comma separated)</Label>
                  <Input value={roles} onChange={e => setRoles(e.target.value)} placeholder="Frontend Engineer, Full Stack" />
                </div>
                <div>
                  <Label>Minimum Salary Expectation ($)</Label>
                  <Input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="120000" />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleNext} className="flex-1">Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && !isTalent && (
            <motion.div
              key="step2s"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Your Startup</h2>
              <div className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc" />
                </div>
                <div>
                  <Label>Mission / Elevator Pitch</Label>
                  <Textarea value={mission} onChange={e => setMission(e.target.value)} placeholder="We are building..." />
                </div>
                <div>
                  <Label>Stage</Label>
                  <Input value={stage} onChange={e => setStage(e.target.value)} placeholder="Seed, Series A..." />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleNext} className="flex-1">Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && isTalent && (
            <motion.div
              key="step3t"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Why Startups?</h2>
              <div>
                <Label>Tell founders what drives you</Label>
                <Textarea value={whyStartups} onChange={e => setWhyStartups(e.target.value)} placeholder="I want to build things from zero to one..." className="h-32" />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleNext} className="flex-1">Complete Profile</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && !isTalent && (
            <motion.div
              key="step3s"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Logistics</h2>
              <div className="space-y-4">
                <div>
                  <Label>Current Team Size</Label>
                  <Input type="number" value={teamSize} onChange={e => setTeamSize(e.target.value)} placeholder="5" />
                </div>
                <div>
                  <Label>HQ Location</Label>
                  <Input value={locationText} onChange={e => setLocationText(e.target.value)} placeholder="San Francisco, CA" />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleNext} className="flex-1">Complete Profile</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
