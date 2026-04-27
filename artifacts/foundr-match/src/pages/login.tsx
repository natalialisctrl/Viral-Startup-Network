import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const DEMO_ACCOUNTS = [
  { label: "Talent", email: "demo@talent.com", color: "from-zinc-200 to-zinc-400" },
  { label: "Founder", email: "demo@founder.com", color: "from-zinc-700 to-zinc-900" },
  { label: "Admin", email: "admin@foundrMatch.com", color: "from-zinc-600 to-zinc-800" },
] as const;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginUser = useLoginUser();
  const queryClient = useQueryClient();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  async function handleDemoLogin() {
    setIsDemoLoading(true);
    try {
      const res = await fetch("/api/users/demo", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Demo login failed");
      }
      await queryClient.invalidateQueries({ queryKey: ["getMe"] });
      setLocation("/swipe");
    } catch {
      toast({
        variant: "destructive",
        title: "Demo unavailable",
        description: "Could not start demo session. Please try again.",
      });
    } finally {
      setIsDemoLoading(false);
    }
  }

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function loginAs(email: string) {
    loginUser.mutate(
      { data: { email, password: "password123" } },
      {
        onSuccess: (data) => {
          if (!data.onboardingComplete) {
            setLocation("/onboarding");
          } else {
            setLocation("/swipe");
          }
        },
        onError: () => {
          toast({ variant: "destructive", title: "Demo login failed", description: "Please try again." });
        },
      }
    );
  }

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginUser.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          toast({
            title: "Welcome back",
            description: "Successfully logged in.",
          });
          if (!data.onboardingComplete) {
            setLocation("/onboarding");
          } else {
            setLocation("/swipe");
          }
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message || "Please check your credentials.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border/50 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <img src="/mesh-logo.png" alt="Mesh" className="mx-auto h-14 w-14 rounded-2xl object-cover mb-6 ring-1 ring-white/10" />
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="space-y-3">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Try a demo account</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => loginAs(account.email)}
                disabled={loginUser.isPending}
                className={`relative h-10 rounded-xl bg-gradient-to-r ${account.color} text-white text-sm font-semibold transition-all hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md`}
              >
                {account.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">or sign in manually</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="bg-background/50 border-border/50 focus-visible:ring-primary/50 h-12 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 border-border/50 focus-visible:ring-primary/50 h-12 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              disabled={loginUser.isPending}
            >
              {loginUser.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-border/50" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-border/50" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 rounded-xl text-base font-semibold border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition-all"
          onClick={handleDemoLogin}
          disabled={isDemoLoading || loginUser.isPending}
        >
          {isDemoLoading ? "Loading demo..." : "✨ Try Demo"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/register" className="font-medium text-primary hover:text-primary/80">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
