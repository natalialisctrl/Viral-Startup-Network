import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useDemoLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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

  return { handleDemoLogin, isDemoLoading };
}
