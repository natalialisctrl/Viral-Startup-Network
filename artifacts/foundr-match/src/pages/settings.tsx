import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useGetMe, useUpdateUser } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateUser = useUpdateUser();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    
    updateUser.mutate(
      { id: user.id, data: { name, avatarUrl } },
      {
        onSuccess: () => {
          toast({ title: "Settings saved", description: "Your profile has been updated." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences.</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Update your basic account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)} 
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button 
                onClick={handleSave} 
                disabled={updateUser.isPending}
                className="w-full sm:w-auto"
              >
                {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your premium status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
              <div>
                <p className="font-bold capitalize">{user?.subscriptionTier || "Free"} Plan</p>
                <p className="text-sm text-muted-foreground">Current active plan</p>
              </div>
              <Button variant="outline" asChild>
                <a href="/premium">Upgrade</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
