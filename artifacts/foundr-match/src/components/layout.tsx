import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Layers, 
  MessageSquare, 
  PlaySquare, 
  UserCircle, 
  Settings, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { useLogoutUser, useGetMyStats, useListNotifications } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = useLogoutUser();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
      },
      onError: () => {
        queryClient.clear();
        setLocation("/login");
      },
    });
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Layers, label: "Discover", href: "/swipe" },
    { icon: MessageSquare, label: "Matches", href: "/matches" },
    { icon: PlaySquare, label: "Feed", href: "/feed" },
    { icon: UserCircle, label: "Profile", href: "/my-profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight">Mesh</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Desktop Sidebar & Mobile Menu */}
      <AnimatePresence>
        {(mobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`
              fixed md:sticky top-0 left-0 z-40 h-[100dvh] w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl flex flex-col
              ${mobileMenuOpen ? 'block' : 'hidden md:flex'}
            `}
          >
            <div className="p-6 hidden md:flex items-center gap-2">
              <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-xl font-bold tracking-tight">Mesh</span>
            </div>

            <nav className="flex-1 px-4 py-6 md:py-0 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <span 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border/40 space-y-2">
              <Link href="/settings">
                <span 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-destructive hover:text-destructive cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur-xl pb-safe z-50 flex items-center justify-around p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <span className="flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-primary transition-colors">
                <Icon className="h-6 w-6" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-2 text-destructive/70 hover:text-destructive transition-colors"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Log out</span>
        </button>
      </nav>
    </div>
  );
}
