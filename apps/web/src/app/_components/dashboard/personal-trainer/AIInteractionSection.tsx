import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Settings } from "lucide-react";
import { api } from "@/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { CustomizePTSection } from "./CustomizePTSection";

type Message = {
  id: string;
  content: string | object;
  role: "user" | "assistant" | "developer";
  timestamp: Date;
};

export function AIInteractionSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get trainer info and status
  const { data: trainerInfo, isLoading: isLoadingInfo } = api.myPt.getTrainerInfo.useQuery();

  // Get chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = api.myPt.getChatHistory.useQuery(
    { limit: 50 },
    { enabled: trainerInfo?.isOnboardingComplete }
  );

  // Load chat history into messages when it's fetched
  useEffect(() => {
    if (chatHistory?.messages) {
      const formattedMessages: Message[] = chatHistory.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.createdAt),
      })).reverse(); // Reverse to show oldest first
      setMessages(formattedMessages);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mutation for sending messages
  const { mutate: sendMessage } = api.myPt.sendMessage.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setError(null);
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      console.error("Failed to send message:", error);
      setError(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    sendMessage({ message: input });
  };

  // Show loading state while fetching trainer info
  if (isLoadingInfo) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Personal Trainer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            Loading your AI trainer...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show onboarding required message if not completed
  if (!trainerInfo?.isOnboardingComplete) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            My PT
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please complete your onboarding first to start chatting with your AI personal trainer.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-[700px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Personal Trainer
          </CardTitle>
          <div className="flex items-center gap-4">
            {trainerInfo && (
              <span className="text-sm text-muted-foreground">
                {trainerInfo.messageCount} messages
              </span>
            )}
            <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCustomize(true)}
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0">
                <DialogTitle className="px-6 pt-6 pb-2">Customize My PT</DialogTitle>
                <CustomizePTSection />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoadingHistory && messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with your AI personal trainer!</p>
              <p className="text-sm mt-2">Ask about workouts, nutrition, goals, or anything fitness-related.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-full break-words ${message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <div className="text-sm">{typeof message.content === "string" ? message.content : JSON.stringify(message.content)}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-white sticky bottom-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Ask your AI trainer anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
} 