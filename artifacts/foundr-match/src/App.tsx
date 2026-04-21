import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext";

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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
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
              <Route path="/admin" component={Admin} />
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
