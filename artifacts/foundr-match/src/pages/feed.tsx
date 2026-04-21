import { useRef, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { useListVideos, useLikeVideo } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageSquare, Plus, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Feed() {
  const { data: videosData, isLoading } = useListVideos({ limit: 10 });
  const likeVideo = useLikeVideo();
  const { toast } = useToast();
  const videos = videosData?.videos || [];

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      setActiveVideoIndex(index);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      containerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLike = (id: number) => {
    likeVideo.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Liked", description: "Video added to your liked videos." });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (videos.length === 0) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center text-center p-4">
          <div>
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold">No pitches available</h2>
            <p className="text-muted-foreground">Check back later for new founder pitches.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div 
        ref={containerRef}
        className="h-[calc(100vh-80px)] w-full max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory relative bg-black no-scrollbar"
      >
        {videos.map((video, index) => {
          const isActive = index === activeVideoIndex;
          
          return (
            <div 
              key={video.id} 
              className="h-full w-full snap-start relative flex items-center justify-center bg-zinc-900 border-b border-white/10"
            >
              {/* Fake Video Player (Thumbnail with play button overlay since we don't have real videos) */}
              <div className="absolute inset-0 bg-zinc-800">
                {video.thumbnailUrl ? (
                   <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                   <div className="w-full h-full bg-gradient-to-br from-primary/40 to-blue-900/40 flex items-center justify-center">
                     <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border border-white/20">
                       <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                     </div>
                   </div>
                )}
              </div>

              {/* Overlay Info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 pb-20 md:pb-6">
                <div className="flex items-end justify-between w-full">
                  <div className="flex-1 pr-12">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-10 w-10 border border-white/50">
                        <AvatarImage src={video.startupProfile?.logoUrl || undefined} />
                        <AvatarFallback className="bg-primary/20 text-white text-xs">
                          {video.startupProfile?.companyName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-white text-lg">{video.startupProfile?.companyName}</h3>
                    </div>
                    <p className="text-white/90 text-sm font-medium mb-1">{video.title}</p>
                    <p className="text-white/70 text-xs line-clamp-2">{video.description}</p>
                    
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full">
                        Apply Now
                      </Button>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col items-center gap-6 pb-4">
                    <button 
                      onClick={() => handleLike(video.id)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                        <Heart className={`h-6 w-6 text-white`} />
                      </div>
                      <span className="text-white text-xs font-medium">{video.likes}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">DM</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-black/60 transition-colors">
                        <Share2 className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
