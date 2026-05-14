import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useDemoLogin(type: "talent" | "founder" = "founder") {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  async function handleDemoLogin() {
    setIsDemoLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/users/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        throw new Error("Demo login failed");
      }
      // Await the refetch so ProtectedRoute sees the authenticated user
      // before we navigate, preventing an immediate redirect back to /login.
      await queryClient.refetchQueries({ queryKey: ["getMe"] });
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

  return { handleDemoLogin, isDemoLoading };
}
