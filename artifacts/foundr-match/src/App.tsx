import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import Swipe from "@/pages/swipe";
import Matches from "@/pages/matches";
import Chat from "@/pages/chat";
import Feed from "@/pages/feed";
import Dashboard from "@/pages/dashboard";
import TalentProfile from "@/pages/talent-profile";
import StartupProfile from "@/pages/startup-profile";
import EquityCalculator from "@/pages/equity-calculator";
import Premium from "@/pages/premium";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import MyProfile from "@/pages/my-profile";
import Pitch from "@/pages/pitch";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <div className="relative flex items-center justify-center">
        <span
          className="absolute w-24 h-24 rounded-full border border-white/20 splash-ring"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="absolute w-24 h-24 rounded-full border border-white/10 splash-ring"
          style={{ animationDelay: "0.5s" }}
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className="relative z-10 flex flex-col items-center gap-3"
        >
          <img src="/mesh-logo.png" alt="Mesh" className="h-14 w-14 rounded-2xl object-cover shadow-[0_0_30px_rgba(255,255,255,0.18)]" />
          <span className="text-2xl font-black tracking-tight text-white" style={{ textShadow: "0 0 18px rgba(255,255,255,0.3)" }}>
            Mesh
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem("mesh-splash-seen") === "1";
  });

  const handleSplashDone = () => {
    sessionStorage.setItem("mesh-splash-seen", "1");
    setSplashDone(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AnimatePresence>
            {!splashDone && <SplashScreen key="splash" onDone={handleSplashDone} />}
          </AnimatePresence>
          <div className="mesh-ambient-bg" aria-hidden="true" />
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/onboarding" component={Onboarding} />
              <Route path="/swipe" component={Swipe} />
              <Route path="/matches" component={Matches} />
              <Route path="/chat/:matchId" component={Chat} />
              <Route path="/feed" component={Feed} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/talent/:id" component={TalentProfile} />
              <Route path="/startup/:id" component={StartupProfile} />
              <Route path="/equity-calculator" component={EquityCalculator} />
              <Route path="/premium" component={Premium} />
              <Route path="/settings" component={Settings} />
              <Route path="/my-profile" component={MyProfile} />
              <Route path="/admin" component={Admin} />
              <Route path="/pitch" component={Pitch} />
              <Route component={NotFound} />
            </Switch>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
