import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, Save, RotateCcw, Sparkles, Info } from "lucide-react";
import { api } from "@/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_PROMPT = `You are a helpful and encouraging personal trainer AI assistant. You provide personalised fitness advice, workout suggestions, and motivation based on the user's profile, goals, and fitness level. 

Keep your responses:
- Encouraging and positive
- Practical and actionable
- Tailored to the user's specific situation
- Professional but friendly

Always consider the user's fitness level, any injuries or health conditions, and their stated goals when giving advice.`;

const DEFAULT_NAME = "AI Trainer";

export function CustomizePTSection() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [hasChanges, setHasChanges] = useState(false);

  // Get current system prompt
  const {
    data: systemPrompt,
    isLoading: isLoadingPrompt,
    refetch: refetchPrompt
  } = api.myPt.getSystemPrompt.useQuery();

  // Save system prompt mutation
  const { mutate: savePrompt, isPending: isSaving } = api.myPt.saveSystemPrompt.useMutation({
    onSuccess: (data) => {
      toast.success("Your AI trainer has been customised!");
      setHasChanges(false);
      refetchPrompt();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Failed to save system prompt:", error);
      toast.error(error.message || "Failed to save customisation");
    },
  });

  // Load existing data when available
  useEffect(() => {
    if (systemPrompt) {
      setName(systemPrompt.name ?? DEFAULT_NAME);
      setPrompt(systemPrompt.prompt ?? DEFAULT_PROMPT);
    }
  }, [systemPrompt]);

  // Track changes
  useEffect(() => {
    const currentName = systemPrompt?.name ?? DEFAULT_NAME;
    const currentPrompt = systemPrompt?.prompt ?? DEFAULT_PROMPT;
    setHasChanges(name !== currentName || prompt !== currentPrompt);
  }, [name, prompt, systemPrompt]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your AI trainer");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter a system prompt");
      return;
    }

    try {
      await savePrompt({
        id: systemPrompt?.id,
        name: name.trim(),
        prompt: prompt.trim(),
      });
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleReset = () => {
    setName(DEFAULT_NAME);
    setPrompt(DEFAULT_PROMPT);
  };

  const handleUseDefault = () => {
    setName(DEFAULT_NAME);
    setPrompt(DEFAULT_PROMPT);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {isLoadingPrompt ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              Loading your trainer settings...
            </div>
          </div>
        ) : (
          <>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Customise how your AI personal trainer behaves and responds to you.
                Give them a name and personality that motivates you!
              </AlertDescription>
            </Alert>

            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="trainer-name">Trainer Name</Label>
                <Input
                  id="trainer-name"
                  placeholder="e.g. Coach Sarah, Fitness Buddy, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={hasChanges ? "border-primary" : ""}
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  placeholder="Describe how you want your AI trainer to behave..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={`flex-1 min-h-[200px] resize-none ${hasChanges ? "border-primary" : ""}`}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Be specific about the tone, style, and approach you prefer.
                  The AI will use this to tailor all responses to your preferences.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </>
            </div>

            {!systemPrompt && !isLoadingPrompt && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You haven&apos;t customised your AI trainer yet. The default settings will be used until you save your preferences.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 