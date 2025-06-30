import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Settings } from "lucide-react";
import { api } from "@/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { CustomizePTSection } from "./CustomizePTSection";
import DefaultBox from "../../global/DefaultBox";
import { motion } from "framer-motion";

type Message = {
  id: string;
  content: string;
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
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);

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

      // Scroll to bottom after loading chat history
      setTimeout(() => {
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
        }
        if (desktopScrollRef.current) {
          desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
        }
      }, 300); // Longer delay to ensure all messages are rendered
    }
  }, [chatHistory]);

  // Scroll to bottom when loading completes and we have messages
  useEffect(() => {
    if (!isLoadingHistory && !isLoadingInfo && messages.length > 0) {
      // Extra delay to ensure all DOM elements are fully rendered
      const timer = setTimeout(() => {
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
        }
        if (desktopScrollRef.current) {
          desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoadingHistory, isLoadingInfo, messages.length]);

  // Scroll when loading state changes (when trainer is responding)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        // Scroll mobile container
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
        }
        // Scroll desktop container
        if (desktopScrollRef.current) {
          desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

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
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
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

    // Scroll to bottom immediately after sending
    setTimeout(() => {
      if (mobileScrollRef.current) {
        mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
      }
      if (desktopScrollRef.current) {
        desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
      }
    }, 50);

    sendMessage({ message: input });
  };

  // Show loading state while fetching trainer info OR chat history
  if (isLoadingInfo || isLoadingHistory) {
    return (
      <>
        {/* Mobile: Loading state */}
        <div className="md:hidden fixed inset-0 top-20 flex flex-col bg-white">
          <div className="flex-shrink-0 px-4 pt-4 pb-2">
            <DefaultBox
              title="Personal Trainer"
              description="Your fitness companion"
              showViewAll={false}
            >
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Loading your personal trainer...</p>
                </div>
              </div>
            </DefaultBox>
          </div>
        </div>

        {/* Desktop: Loading state */}
        <div className="hidden md:block space-y-6">
          <DefaultBox
            title="Personal Trainer"
            description="Your fitness companion"
            showViewAll={false}
          >
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Loading your personal trainer...</p>
              </div>
            </div>
          </DefaultBox>
        </div>
      </>
    );
  }

  // Show onboarding required message if not completed
  // if (!trainerInfo?.isOnboardingComplete) {
  //   return (
  //     <>
  //       {/* Mobile: Onboarding message */}
  //       <div className="md:hidden fixed inset-0 top-20 flex flex-col bg-white">
  //         <div className="flex-shrink-0 px-4 pt-4 pb-2">
  //           <DefaultBox
  //             title="My PT"
  //             description="Your fitness companion"
  //             showViewAll={false}
  //           >
  //             <div className="flex items-center justify-center py-12">
  //               <Alert className="max-w-md">
  //                 <Info className="h-4 w-4" />
  //                 <AlertDescription>
  //                   Please complete your onboarding first to start chatting with your personal trainer.
  //                 </AlertDescription>
  //               </Alert>
  //             </div>
  //           </DefaultBox>
  //         </div>
  //       </div>

  //       {/* Desktop: Onboarding message */}
  //       <div className="hidden md:block space-y-6">
  //         <DefaultBox
  //           title="My PT"
  //           description="Your fitness companion"
  //           showViewAll={false}
  //         >
  //           <div className="flex items-center justify-center py-12">
  //             <Alert className="max-w-md">
  //               <Info className="h-4 w-4" />
  //               <AlertDescription>
  //                 Please complete your onboarding first to start chatting with your personal trainer.
  //               </AlertDescription>
  //             </Alert>
  //           </div>
  //         </DefaultBox>
  //       </div>
  //     </>
  //   );
  // }

  return (
    <>
      {/* Mobile: Fixed chat interface */}
      <div className="md:hidden fixed inset-0 top-20 flex flex-col bg-white">
        {/* Personal Trainer Header Section - Mobile */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <DefaultBox
            title="Personal Trainer"
            description="Your fitness companion"
            showViewAll={false}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-brand-bright-orange/10 text-brand-bright-orange">
                  Active
                </span>
                {trainerInfo && (
                  <span className="text-sm text-muted-foreground">
                    {trainerInfo.messageCount} messages
                  </span>
                )}
              </div>
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
          </DefaultBox>
        </div>

        {/* Messages Area - Mobile */}
        <div className="flex-1 overflow-hidden px-4 py-2">
          <div ref={mobileScrollRef} className="h-full overflow-y-auto px-4 py-4 border border-brand-brown/20 rounded-lg bg-brand-light-nude">
            {isLoadingHistory && messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Loading chat history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Start a conversation!</p>
                <p className="text-sm">Ask about workouts, nutrition, goals, or anything fitness-related.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] break-words shadow-warm ${message.role === "user"
                        ? "bg-brand-bright-orange text-brand-white"
                        : "bg-white border border-brand-brown/20"
                        }`}
                      style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-brand-brown/20 rounded-lg px-4 py-2 shadow-warm">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse text-sm text-muted-foreground">Thinking...</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area - Mobile */}
        <div className="flex-shrink-0 p-4 pb-20 bg-white">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Ask your trainer anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: Regular layout */}
      <div className="hidden md:block space-y-6">
        <DefaultBox
          title="Personal Trainer"
          description="Your fitness companion"
          showViewAll={false}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-brand-bright-orange/10 text-brand-bright-orange">
                Active
              </span>
              {trainerInfo && (
                <span className="text-sm text-muted-foreground">
                  {trainerInfo.messageCount} messages
                </span>
              )}
            </div>
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

          {/* Messages Area - Desktop */}
          <div ref={desktopScrollRef} className="h-96 overflow-y-auto px-4 py-4 border border-brand-brown/20 rounded-lg bg-brand-nude/30">
            {isLoadingHistory && messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Loading chat history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Start a conversation!</p>
                <p className="text-sm">Ask about workouts, nutrition, goals, or anything fitness-related.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] break-words shadow-warm ${message.role === "user"
                        ? "bg-brand-bright-orange text-brand-white"
                        : "bg-white border border-brand-brown/20"
                        }`}
                      style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-brand-brown/20 rounded-lg px-4 py-2 shadow-warm">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse text-sm text-muted-foreground">Thinking...</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area - Desktop */}
          <div className="mt-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Ask your trainer anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DefaultBox>
      </div>
    </>
  );
} 
