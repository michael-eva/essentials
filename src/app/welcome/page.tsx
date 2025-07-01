'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Sparkles, Trophy, Heart, Zap } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Let&apos;s Create Your Perfect Pilates Journey
          </h1>
        </div>

        <div className="space-y-6">
          <p className="text-xl text-gray-600 leading-relaxed">
            We&apos;re about to ask you a few questions to understand your fitness level, goals, and preferences.
            <span className="font-semibold text-gray-900"> Our AI will then craft a personalised pilates routine </span>
            along with complementary workouts to help you achieve your goals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">AI-Powered Pilates</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Supporting Workouts</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Personalised Plan</p>
            </div>
          </div>

          <p className="text-lg text-gray-600">
            Ready to begin? Let&apos;s start with a few quick questions to create your perfect workout plan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            size="lg"
            className="group relative overflow-hidden"
            onClick={() => {
              router.push("/onboarding");
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Onboarding
            </span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/dashboard/overview")}
            className="hover:bg-gray-50"
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </div>
  );
}
