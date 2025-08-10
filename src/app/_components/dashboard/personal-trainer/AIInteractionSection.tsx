import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Settings, Sparkles, Info, Activity, Zap, Play, Trash2, Heart, Baby } from "lucide-react";
import { api } from "@/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import DefaultBox from "../../global/DefaultBox";
import { motion } from "framer-motion";
import useGeneratePlan from "@/hooks/useGeneratePlan";
import { CustomizePTDialog } from "./CustomizePTSection";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConnectionAwareLoading } from "@/components/ui/connection-aware-loading";
import { useConnectionFeedback } from "@/hooks/useConnectionFeedback";
import { utils } from "prettier/doc.js";
import React from "react";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant" | "developer";
  timestamp: Date;
  toolCalls?: Array<{
    id: string;
    type: string;
    function?: {
      name: string;
      arguments: Record<string, any>;
    };
    name?: string;
    args?: Record<string, any>;
    response?: {
      name: string;
      content: string;
      tool_call_id: string;
    };
  }>;
};

// Helper function to detect if a message suggests plan generation
function detectPlanGenerationSuggestion(content: string): boolean {
  const keywords = [
    "generate plan",
    "create plan",
    "workout plan",
    "fitness plan",
    "training plan",
    "generate a plan",
    "create a plan",
    "new plan",
    "plan for you",
    "custom plan",
    "personalised plan",
    "generate workout",
    "create workout plan"
  ];

  const buttonPhrases = [
    "generate plan button",
    "generate button",
    "button to proceed",
    "button to generate",
    "click to generate",
    "button will appear",
    "see a button",
    "see a 'generate plan' button",
    "generate plan' button",
    "button to continue",
    "button to proceed",
    "you'll see a",
    "you will see a",
    "then you'll see",
    "then you will see"
  ];

  const contentLower = content.toLowerCase();

  // Check for plan-related keywords AND button-related phrases
  const hasKeywords = keywords.some(keyword => contentLower.includes(keyword));
  const hasButtonPhrases = buttonPhrases.some(phrase => contentLower.includes(phrase));

  return hasKeywords && hasButtonPhrases;
}

// Helper function to detect class recommendations
function detectClassRecommendation(content: string): { hasRecommendation: boolean, className: string | null, classType: 'class' | null } {
  const contentLower = content.toLowerCase();

  // Available pilates videos
  const pilatesVideos = [
    "FULL BODY",
    "Booty & Core",
    "BOOTY BURN",
    "Abs, Arms & Booty"
  ];

  // Action phrases that indicate the user wants to proceed with a workout
  const actionPhrases = [
    "try it now",
    "do it now",
    "start the workout",
    "go to the workout",
    "take me to",
    "yes, let's do it",
    "let's try it",
    "i want to try",
    "i'd like to try",
    "show me the workout",
    "start now",
    "let's go",
    "yes please",
    "sure",
    "sounds good"
  ];

  // Phrases that indicate AI is offering options (don't show button yet)
  const questionPhrases = [
    "would you like to",
    "should i add it to",
    "what would you prefer",
    "how does that sound",
    "would you prefer to"
  ];

  // Check if user is responding positively to a workout recommendation
  const hasActionPhrase = actionPhrases.some(phrase => contentLower.includes(phrase));

  // Check if AI is asking a question (don't show button yet)
  const isAskingQuestion = questionPhrases.some(phrase => contentLower.includes(phrase));

  // Check for pilates videos in the content
  for (const video of pilatesVideos) {
    if (contentLower.includes(video.toLowerCase())) {
      // Show button only when:
      // 1. User is responding positively with action phrases, OR
      // 2. AI explicitly says "try it now" or similar direct action, AND
      // 3. AI is NOT asking a question (offering choices)
      const shouldShowButton = hasActionPhrase && !isAskingQuestion;

      return {
        hasRecommendation: shouldShowButton,
        className: video,
        classType: 'class'
      };
    }
  }

  return {
    hasRecommendation: false,
    className: null,
    classType: null
  };
}

// Utility function to render markdown bold text
function renderMarkdownContent(content: string): React.ReactNode {
  const parts = content.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return part;
  });
}

export function AIInteractionSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const utils = api.useUtils();

  // Connection feedback for better error handling
  const connectionFeedback = useConnectionFeedback({
    maxRetries: 2,
    retryDelay: 2000,
    timeoutMs: 25000
  });

  // Get trainer info and status
  const { data: trainerInfo, isLoading: isLoadingInfo } = api.myPt.getTrainerInfo.useQuery();

  // Get chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = api.myPt.getChatHistory.useQuery(
    { limit: 50 },
    // { enabled: trainerInfo?.isOnboardingComplete }
  );
  const isOnboardingComplete = trainerInfo?.isOnboardingComplete === true

  // Get health considerations
  const { data: healthConsiderations } = api.myPt.getHealthConsiderations.useQuery(
    undefined,
    { enabled: isOnboardingComplete }
  );

  // Get pilates videos for class recommendations
  const { data: pilatesVideos } = api.workout.getPilatesVideos.useQuery({
    limit: 50
  });


  const { mutate: deleteChat } = api.personalTrainer.deleteChat.useMutation({
    onSuccess: () => {
      toast.success("Chat history cleared");
      setMessages([]); // Clear local state immediately
      utils.myPt.getChatHistory.invalidate();
    },
  });

  // Store retry function for connection feedback
  const [retryMessageFn, setRetryMessageFn] = useState<(() => void) | null>(null);

  // Mutation for sending messages
  const { mutate: sendMessage } = api.myPt.sendMessage.useMutation({
    onSuccess: async (data) => {
      setError(null);
      connectionFeedback.resetRetries(); // Reset retry count on success

      // Remove temporary optimistic updates
      setMessages((prev) => prev.filter(msg => !msg.id.startsWith('temp-')));

      // Invalidate and refetch chat history to sync with database
      // This will replace any optimistic updates with real database data
      await utils.myPt.getChatHistory.invalidate();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Failed to send message:", error);

      // Use connection feedback for retry logic
      connectionFeedback.handleError(error, retryMessageFn || undefined);

      // Only set error for non-retryable errors or after max retries
      if (connectionFeedback.retryCount >= connectionFeedback.maxRetries) {
        setError(error.message);
        // Remove optimistic update on permanent failure
        setMessages((prev) => prev.filter(msg => !msg.id.startsWith('temp-')));
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  const { generatePlan, GeneratePlanDialog, isLoading: isGeneratePlanLoading, LoadingScreen, error: generatePlanError } = useGeneratePlan()

  // Helper component to render health considerations
  const HealthConsiderationsInfo = () => {
    if (!healthConsiderations) {
      return null;
    }

    // Only show pregnancy if it's a positive pregnancy status
    const pregnancyValue = healthConsiderations.pregnancy?.toLowerCase() || '';
    const hasPregnancy = pregnancyValue &&
      pregnancyValue !== 'no' &&
      pregnancyValue !== 'not_applicable' &&
      pregnancyValue !== 'n/a' &&
      pregnancyValue !== 'not applicable' &&
      pregnancyValue !== 'none' &&
      !pregnancyValue.includes('not') &&
      (pregnancyValue.includes('trimester') ||
        pregnancyValue.includes('pregnant') ||
        pregnancyValue.includes('expecting') ||
        pregnancyValue === 'yes');

    const hasInjuries = healthConsiderations.hasInjuries &&
      healthConsiderations.injuriesDetails &&
      healthConsiderations.injuriesDetails.trim() !== '';

    // Only show if there are actual relevant health considerations
    if (!hasPregnancy && !hasInjuries) {
      return null;
    }

    // Determine title based on what's present
    const getTitle = () => {
      if (hasInjuries && hasPregnancy) {
        return "Your Health Considerations";
      } else if (hasInjuries) {
        return "Health Condition Noted";
      } else if (hasPregnancy) {
        return "Pregnancy Considerations";
      }
      return "Your Health Considerations";
    };

    return (
      <div className="mb-2 px-3 py-2.5 bg-brand-light-yellow border border-brand-nude rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-brand-brown flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-brand-brown">
              {getTitle()}
            </div>
            <div className="text-xs text-brand-brown/70 mt-1">
              {hasInjuries && (
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3 w-3 flex-shrink-0 text-brand-bright-orange" />
                  <span className="font-medium">{healthConsiderations.injuriesDetails}</span>
                  <span className="text-brand-brown/60">• Emma will adapt exercises</span>
                </div>
              )}
              {hasPregnancy && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Baby className="h-3 w-3 flex-shrink-0 text-brand-bright-orange" />
                  <span className="font-medium capitalize">{healthConsiderations.pregnancy}</span>
                  <span className="text-brand-brown/60">• Pregnancy-safe focus</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleGeneratePlan = () => {
    generatePlan();
  };

  const handleClassRecommendation = (className: string) => {
    const video = pilatesVideos?.items?.find(v => v.title === className);
    console.log('🔍 Found pilates video:', video);
    router.push(`/dashboard/pilates-video/${video?.id}`);
  };

  const handleDeleteConfirmation = () => {
    setShowDeleteDialog(false);
    deleteChat();
  };

  // Load chat history into messages when it's fetched
  useEffect(() => {
    if (chatHistory?.messages) {
      const formattedMessages: Message[] = chatHistory.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.createdAt),
        toolCalls: msg.toolCalls || undefined,
      }));

      // Only update if the messages actually changed to avoid unnecessary re-renders
      setMessages((prev) => {
        const prevIds = prev.filter(m => !m.id.startsWith('temp-')).map(m => m.id);
        const newIds = formattedMessages.map(m => m.id);

        // If the message IDs are the same, keep the current state
        if (prevIds.length === newIds.length && prevIds.every(id => newIds.includes(id))) {
          return prev;
        }

        return formattedMessages;
      });

      // Scroll to bottom after loading/updating chat history
      setTimeout(() => {
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
        }
        if (desktopScrollRef.current) {
          desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
        }
      }, 300); // Longer delay to ensure all messages are rendered
    } else if (chatHistory?.messages?.length === 0) {
      // Explicitly handle empty messages array
      setMessages([]);
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



  const handleSend = () => {
    if (!input.trim()) return;

    const currentMessage = input.trim();
    const userMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
    };

    // Optimistic update: immediately show user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Create retry function for connection feedback
    const retryFn = () => {
      setIsLoading(true);
      setError(null);
      // Don't add another optimistic update on retry - it's already there
      sendMessage({ message: currentMessage });
    };
    setRetryMessageFn(() => retryFn);

    // Scroll to bottom immediately after sending
    setTimeout(() => {
      if (mobileScrollRef.current) {
        mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
      }
      if (desktopScrollRef.current) {
        desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
      }
    }, 50);

    sendMessage({ message: currentMessage });
  };

  // Show loading state while fetching trainer info OR chat history
  if (isLoadingInfo || isLoadingHistory) {
    return (
      <ConnectionAwareLoading
        isLoading={true}
        onTimeout={() => {
          toast.error("Loading is taking longer than expected. Please check your connection.");
        }}
      >
        {/* This content won't show while loading */}
      </ConnectionAwareLoading>
    );
  }



  // Show onboarding required message if not completed
  if (!isOnboardingComplete) {
    return (
      <>
        {GeneratePlanDialog}
        <div className="min-h-screen flex flex-col items-center  px-4 py-8">
          <div className="w-full max-w-md mx-auto rounded-2xl shadow-xl bg-white/90 border border-brand-brown/20 p-8 flex flex-col items-center">
            <Sparkles className="h-12 w-12 text-brand-bright-orange mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-brand-brown mb-2 text-center">Welcome to My PT</h2>
            <p className="text-base text-muted-foreground mb-6 text-center">Your fitness companion</p>
            <div className="w-full mb-8">
              <div className="flex items-center gap-3 bg-brand-light-nude/60 border border-brand-brown/10 rounded-lg px-4 py-4">
                <Info className="h-5 w-5 text-brand-bright-orange flex-shrink-0" />
                <span className="text-sm text-brand-brown font-medium">
                  Please complete your onboarding first to start chatting with your personal trainer.
                </span>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleGeneratePlan}
              disabled={isGeneratePlanLoading}
            >
              <Sparkles className="h-5 w-5 mr-1" />
              {isGeneratePlanLoading ? "Generating..." : "Complete Onboarding"}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {GeneratePlanDialog}
      <LoadingScreen />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Clear Chat
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to clear your chat history? This action cannot be undone and will remove all chat history.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirmation}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Mobile: Fixed chat interface */}
      <div className="md:hidden fixed inset-0 top-20 bottom-16 flex flex-col">
        {/* Top Section: Header + Health Info - Mobile */}
        <div className="flex-shrink-0 bg-white border-b border-brand-brown/10 max-h-[40vh] overflow-y-auto">
          <div className="px-4">
            <DefaultBox
              title="Coach Emma"
              description="Your fitness companion"
              showViewAll={false}
              icon={
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        className="justify-start px-4 py-2 text-sm"
                        onClick={() => {
                          setShowCustomize(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Meet your trainer
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Chat
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              }
              showChildren={false}
            >
              {/* Required children prop even when showChildren is false */}
              <></>
            </DefaultBox>
            <CustomizePTDialog open={showCustomize} onOpenChange={setShowCustomize} />

            {/* Health Considerations - Outside DefaultBox but visually integrated */}
            <div className="mt-2">
              <HealthConsiderationsInfo />
            </div>
          </div>
        </div>

        {/* Middle Section: Messages Area - Mobile */}
        <div className="flex-1 overflow-hidden px-4 py-2 min-h-0">
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
              <div className="flex flex-col gap-4 pb-2">
                {messages.map((message) => {
                  const classRecommendation = message.role === "assistant" ? detectClassRecommendation(message.content) : null;

                  return (
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

                        <div className="text-sm">{renderMarkdownContent(message.content)}</div>

                        {/* Generate Plan Button - Mobile */}
                        {message.role === "assistant" && detectPlanGenerationSuggestion(message.content) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              onClick={handleGeneratePlan}
                              disabled={isGeneratePlanLoading}
                              className="w-full bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90 text-sm"
                              size="sm"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              {isGeneratePlanLoading ? "Generating..." : "Generate Plan"}
                            </Button>
                          </div>
                        )}

                        {/* Class Recommendation Button - Mobile */}
                        {classRecommendation?.hasRecommendation && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              onClick={() => handleClassRecommendation(classRecommendation.className!)}
                              disabled={isGeneratePlanLoading}
                              className="w-full bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90 text-sm"
                              size="sm"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {isGeneratePlanLoading ? "Loading..." : `Go to ${classRecommendation.className}`}
                            </Button>
                          </div>
                        )}

                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                  <ConnectionAwareLoading
                    isLoading={true}
                    className="p-0"
                    slowWarningMs={8000}
                    timeoutMs={20000}
                    onTimeout={() => {
                      if (connectionFeedback.isRetrying) return; // Don't show if already handling retry
                      toast.error("AI response is taking longer than expected. This might be a connection issue.");
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse text-sm text-muted-foreground">Thinking...</div>
                    </div>
                  </ConnectionAwareLoading>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Section: Input Area - Mobile */}
        <div className="flex-shrink-0 px-4 pt-2 pb-6 bg-white border-t border-brand-brown/10 safe-area-inset-bottom min-h-[80px]">
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
          title="Coach Emma"
          description="Your fitness companion"
          showViewAll={false}
          icon={
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 text-sm"
                    onClick={() => {
                      setShowCustomize(true);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Meet your trainer
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          }
        >
          <CustomizePTDialog open={showCustomize} onOpenChange={setShowCustomize} />

          <HealthConsiderationsInfo />

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
              <div className="flex flex-col gap-4 pb-6">
                {messages.map((message) => {
                  const classRecommendation = message.role === "assistant" ? detectClassRecommendation(message.content) : null;

                  return (
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

                        <div className="text-sm">{renderMarkdownContent(message.content)}</div>

                        {/* Generate Plan Button - Desktop */}
                        {message.role === "assistant" && detectPlanGenerationSuggestion(message.content) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              onClick={handleGeneratePlan}
                              disabled={isGeneratePlanLoading}
                              className="w-full bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90 text-sm"
                              size="sm"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              {isGeneratePlanLoading ? "Generating..." : "Generate Plan"}
                            </Button>
                          </div>
                        )}

                        {/* Class Recommendation Button - Desktop */}
                        {classRecommendation?.hasRecommendation && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              onClick={() => handleClassRecommendation(classRecommendation.className!)}
                              disabled={isGeneratePlanLoading}
                              className="w-full bg-brand-bright-orange text-brand-white hover:bg-brand-bright-orange/90 text-sm"
                              size="sm"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {isGeneratePlanLoading ? "Loading..." : `Go to ${classRecommendation.className}`}
                            </Button>
                          </div>
                        )}

                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                  <ConnectionAwareLoading
                    isLoading={true}
                    className="p-0"
                    slowWarningMs={8000}
                    timeoutMs={20000}
                    onTimeout={() => {
                      if (connectionFeedback.isRetrying) return; // Don't show if already handling retry
                      toast.error("AI response is taking longer than expected. This might be a connection issue.");
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse text-sm text-muted-foreground">Thinking...</div>
                    </div>
                  </ConnectionAwareLoading>
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
