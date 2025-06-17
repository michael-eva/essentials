'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Sparkles, Trophy, Heart, Zap } from "lucide-react";
import useGeneratePlan from "@/hooks/useGeneratePlan";

export default function LandingPage() {
  const router = useRouter();
  const { generatePlan, isLoading, LoadingScreen } = useGeneratePlan();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your Journey to Greatness Begins Here
          </h1>
        </div>

        <div className="space-y-6">
          <p className="text-xl text-muted-foreground leading-relaxed">
            We&apos;ve crafted something special just for you. Your fitness goals, your current level, your unique journey -
            <span className="font-semibold text-foreground"> it&apos;s all been carefully considered</span> to create your perfect workout companion.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Personalized Goals</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Health-First Approach</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Optimized Workouts</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground">
            Ready to transform your fitness journey? Your personalized plan is just one click away.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            size="lg"
            className="group relative overflow-hidden bg-primary hover:bg-primary/90 transition-all duration-300"
            disabled={isLoading}
            onClick={() => {
              void generatePlan();
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {isLoading ? "Generating..." : "Generate My Workout Plan"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/dashboard/overview")}
            className="hover:bg-muted/50"
          >
            Skip for Now
          </Button>
        </div>
      </div>
      <LoadingScreen />
    </div>
  );
}
