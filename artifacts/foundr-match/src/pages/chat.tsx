import { useState, useRef, useEffect } from "react";
import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { 
  useGetMatch, 
  useListMessages, 
  useSendMessage,
  getGetMatchQueryKey,
  getListMessagesQueryKey,
} from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Star, AlertCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function Chat() {
  const [, params] = useRoute("/chat/:matchId");
  const matchId = params?.matchId ? parseInt(params.matchId) : 0;
  const { user } = useAuth();
  const isTalent = user?.userType === "talent";
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: match, isLoading: matchLoading } = useGetMatch(matchId, {
    query: {
      enabled: !!matchId,
      queryKey: getGetMatchQueryKey(matchId)
    }
  });

  const { data: messagesData, isLoading: messagesLoading } = useListMessages(
    matchId,
    { limit: 50 },
    {
      query: {
        enabled: !!matchId,
        queryKey: getListMessagesQueryKey(matchId)
      }
    }
  );

  const sendMessage = useSendMessage();

  const messages = messagesData?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage.mutate(
      { matchId, data: { content: message, messageType: "text" } },
      {
        onSuccess: () => {
          setMessage("");
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(matchId) });
        }
      }
    );
  };

  if (matchLoading || messagesLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!match) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Match not found</h2>
        </div>
      </AppLayout>
    );
  }

  const startupProfile = match.startupProfile as { companyName?: string; logoUrl?: string } | undefined;
  const talentProfile = match.talentProfile as { fullName?: string; avatarUrl?: string } | undefined;
  const name = isTalent ? startupProfile?.companyName : talentProfile?.fullName;
  const avatar = isTalent ? startupProfile?.logoUrl : talentProfile?.avatarUrl;

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex-none p-4 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Link href="/matches">
              <Button variant="ghost" size="icon" className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">{name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold">{name}</h2>
              {match.aiMatchScore && (
                <div className="flex items-center text-xs text-primary font-medium">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {match.aiMatchScore}% Match
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Reason Banner */}
        {match.aiMatchReason && (
          <div className="bg-primary/10 border-b border-primary/20 p-3 text-sm text-primary flex items-start gap-2">
            <Star className="w-4 h-4 mt-0.5 shrink-0 fill-current" />
            <p>{match.aiMatchReason}</p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <p>No messages yet. Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.slice().reverse().map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMine 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    <p>{msg.content}</p>
                    <span className={`text-[10px] block mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {format(new Date(msg.createdAt), 'p')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 border-t border-border/50 bg-background/80 backdrop-blur-xl pb-safe">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary/50"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 shrink-0"
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
