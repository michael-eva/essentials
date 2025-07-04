import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Heart, Target, Zap, Users, Award } from "lucide-react";
import { api } from "@/trpc/react";
import { DialogTitle } from "@radix-ui/react-dialog";

const TRAINER_PERSONALITY = {
  name: "Coach Emma",
  characteristics: [
    {
      icon: Heart,
      title: "Encouraging",
      description: "Always positive and motivating."
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Helps you set and achieve goals."
    },
    {
      icon: Zap,
      title: "Energetic",
      description: "Brings enthusiasm to every session."
    },
    {
      icon: Users,
      title: "Personalised",
      description: "Advice tailored to you."
    },
    {
      icon: Award,
      title: "Expertise",
      description: "Guides you safely and effectively."
    }
  ],
  communicationStyle: "Friendly, practical, and actionable advice."
};

function CustomizePTSection() {
  const { isLoading: isLoadingPrompt } = api.myPt.getSystemPrompt.useQuery();

  return (
    <>
      <div className=" pt-5 pb-2 flex flex-row items-center gap-3">
        <span className="p-2 rounded-full bg-brand-bright-orange/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-brand-bright-orange" />
        </span>
        <DialogTitle className="text-xl font-extrabold text-brand-brown">
          Meet {TRAINER_PERSONALITY.name}
        </DialogTitle>
      </div>
      <div className=" pb-4 pt-0">
        {isLoadingPrompt ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Loading your trainer info...
          </div>
        ) : (
          <>
            <div className="text-sm text-brand-brown/70 mb-3">
              Your personal trainer at a glance
            </div>
            {/* Characteristics in 2-column grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {TRAINER_PERSONALITY.characteristics.map((c) => (
                <div
                  key={c.title}
                  className="flex items-start gap-2 bg-white rounded-lg border border-brand-nude px-2.5 py-2 shadow-sm"
                >
                  <span className="p-1.5 rounded-full bg-brand-bright-orange/15 flex items-center justify-center mt-0.5">
                    <c.icon className="h-4 w-4 text-brand-brown" />
                  </span>
                  <div>
                    <div className="font-semibold text-xs text-brand-brown uppercase tracking-wide">
                      {c.title}
                    </div>
                    <div className="text-xs text-brand-brown/70 leading-tight">
                      {c.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Communication Style as card footer/info box */}
            <div className="rounded-lg border border-brand-brown bg-brand-light-nude px-3 py-2 mb-2">
              <div className="font-semibold text-xs text-brand-brown mb-0.5 uppercase tracking-wide">
                Communication
              </div>
              <div className="text-xs text-brand-brown/80">
                {TRAINER_PERSONALITY.communicationStyle}
              </div>
            </div>
            {/* CTA */}
            <div className="text-xs text-brand-brown/60 text-center">
              Start chatting with {TRAINER_PERSONALITY.name} to begin your fitness journey!
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function CustomizePTDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <CustomizePTSection />
      </DialogContent>
    </Dialog>
  );
} 