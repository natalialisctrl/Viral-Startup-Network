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
  const [location, setLocation] = useLocation();
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

  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.07] sticky top-0 z-50"
        style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2">
          <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight">Mesh</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Mobile full-screen overlay when menu is open */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar & Mobile Menu */}
      <AnimatePresence>
        {(mobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`
              fixed md:sticky top-0 left-0 h-[100dvh] w-64 border-r border-white/[0.07] flex flex-col
              ${mobileMenuOpen ? 'z-[70]' : 'z-40 hidden md:flex'}
            `}
            style={{ background: "rgba(6,6,6,0.92)", backdropFilter: "blur(24px)" }}
          >
            <div className="p-6 hidden md:flex items-center gap-2">
              <img src="/mesh-logo.png" alt="Mesh" className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-xl font-bold tracking-tight">Mesh</span>
            </div>

            {/* Mobile menu header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.07]">
              <span className="text-lg font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || location === basePath + item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? "bg-white/[0.08] text-foreground"
                          : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-cyan-400" : ""}`}
                        style={isActive ? { filter: "drop-shadow(0 0 6px rgba(6,182,212,0.7))" } : {}} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 nav-active-dot" />}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/[0.07] space-y-1">
              <Link href="/settings">
                <span
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.05] transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-destructive cursor-pointer"
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

      {/* Mobile Bottom Nav — glassmorphism */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 nav-glass pb-safe z-50 flex items-center justify-around px-1 py-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location === basePath + item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span className="relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all">
                <Icon
                  className={`h-5 w-5 transition-all ${isActive ? "text-cyan-400" : "text-muted-foreground"}`}
                  style={isActive ? { filter: "drop-shadow(0 0 8px rgba(6,182,212,0.8))" } : {}}
                />
                <span className={`text-[9px] mt-0.5 font-semibold tracking-wide transition-all ${isActive ? "text-cyan-400" : "text-muted-foreground/60"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 nav-active-dot" />
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
