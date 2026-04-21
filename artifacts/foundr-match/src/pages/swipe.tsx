import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { useListTalent, useListStartups, useCreateSwipe } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, X, Star, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Swipe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createSwipe = useCreateSwipe();

  const isTalent = user?.userType === "talent";

  const { data: talentData, isLoading: isLoadingTalent } = useListTalent({}, { query: { enabled: !isTalent, queryKey: ["listTalent"] } });
  const { data: startupData, isLoading: isLoadingStartups } = useListStartups({}, { query: { enabled: isTalent, queryKey: ["listStartups"] } });

  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = isTalent ? startupData?.profiles || [] : talentData?.profiles || [];
  const isLoading = isTalent ? isLoadingStartups : isLoadingTalent;

  const currentCard = cards[currentIndex];

  const handleSwipe = (direction: "right" | "left" | "up" | "down") => {
    if (!currentCard) return;

    createSwipe.mutate({
      data: {
        targetId: currentCard.id,
        targetType: isTalent ? "startup" : "talent",
        direction,
      }
    }, {
      onSuccess: (res) => {
        if (res.matched) {
          toast({
            title: "It's a Match! 🎉",
            description: "Future unlocked.",
            duration: 5000,
          });
        }
        setCurrentIndex(prev => prev + 1);
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 mb-4 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/50 animate-ping" />
            </div>
            <p className="text-muted-foreground font-medium">Finding potential matches...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Star className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground max-w-md">
            Check back later for more potential matches. The ecosystem is always growing.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-md h-[70vh] md:h-[600px]">
          <AnimatePresence>
            {currentCard && (
              <motion.div
                key={currentCard.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ x: -1000, opacity: 0, transition: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = offset.x;
                  if (swipe > 100) handleSwipe("right");
                  else if (swipe < -100) handleSwipe("left");
                }}
                className="absolute inset-0 w-full h-full"
              >
                <Card className="w-full h-full overflow-hidden border-border/50 bg-card shadow-2xl relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-primary font-bold px-3 py-1 shadow-lg">
                      {isTalent ? "94% Match" : "88% Match"}
                    </Badge>
                  </div>
                  
                  <div className="h-1/2 bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-6 relative">
                    {isTalent ? (
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/20 mb-4 flex items-center justify-center text-4xl shadow-xl">
                           {(currentCard as any).companyName?.charAt(0)}
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">{(currentCard as any).companyName}</h2>
                        <p className="text-primary font-medium mt-1">{(currentCard as any).industry} • {(currentCard as any).stage}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 mb-4 flex items-center justify-center text-4xl shadow-xl">
                          {(currentCard as any).fullName?.charAt(0)}
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">{(currentCard as any).fullName}</h2>
                        <p className="text-primary font-medium mt-1">{(currentCard as any).headline}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 h-1/2 flex flex-col justify-between">
                    <div className="space-y-4">
                       <p className="text-muted-foreground text-sm line-clamp-3">
                         {isTalent ? (currentCard as any).elevatorPitch : (currentCard as any).bio}
                       </p>
                       
                       <div className="flex flex-wrap gap-2">
                         {isTalent ? 
                           (currentCard as any).badges?.map((badge: string, i: number) => (
                             <Badge key={i} variant="outline" className="bg-primary/5">{badge}</Badge>
                           ))
                           :
                           (currentCard as any).skills?.slice(0,4).map((skill: string, i: number) => (
                             <Badge key={i} variant="outline" className="bg-primary/5">{skill}</Badge>
                           ))
                         }
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all shadow-lg"
            onClick={() => handleSwipe("left")}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-12 h-12 rounded-full border-border/50 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 transition-all shadow-lg"
            onClick={() => handleSwipe("down")}
          >
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full border-border/50 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all shadow-lg shadow-primary/20"
            onClick={() => handleSwipe("right")}
          >
            <Heart className="h-6 w-6 fill-current" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
