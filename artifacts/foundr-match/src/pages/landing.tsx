import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, Zap, Users, Sparkles, TrendingUp, Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight">Mesh</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                Join Waitlist
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          
          <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span>The #1 network for elite startup talent</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6"
            >
              Your network,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                accelerated.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-[600px] text-lg md:text-xl text-muted-foreground mb-10"
            >
              Stop applying to jobs. Start matching with founders.
              Mesh connects ambitious talent with high-growth startups through AI-powered compatibility.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.12)] hover:shadow-[0_0_50px_rgba(255,255,255,0.18)] w-full sm:w-auto">
                  Find Your Match
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg font-semibold w-full sm:w-auto border-border/50 hover:bg-accent/50 backdrop-blur-sm">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Active Startups", value: "2,500+" },
                { label: "Elite Talent", value: "50k+" },
                { label: "Matches Made", value: "100k+" },
                { label: "Success Rate", value: "94%" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center space-y-2">
                  <h3 className="text-4xl md:text-5xl font-black text-primary">{stat.value}</h3>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border/40 py-12 bg-card/20">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Mesh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
