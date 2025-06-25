'use client'
import { use } from "react";
import MuxPlayer from '@mux/mux-player-react';
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dummy data for now
const dummyClassData = {
  title: "FULL BODY",
  summary: "Dynamic intermediate full-body flow with minimal rest periods",
  description:
    "A dynamic 24-minute full body workout with minimal rests that gets the heart rate up. Starting with breathwork and abs, flowing into side waist and outer glutes, standing curtsey lunges, and back work. This intermediate level class features a continuous flow style that's more challenging for beginners but includes modifications throughout. The workout progresses through abs on back, side kneeling core series, lunge series, and plank series, repeated on both sides for a comprehensive full body burn.",
  difficulty: "Intermediate",
  duration: 24,
  instructor: "Emma Uden",
  equipment: "None",
  pilatesStyle: "Mat Pilates",
  classType: "Full Body",
  focusArea: "Full Body",
  targetedMuscles:
    "Abdominals, Side Waist, Outer Glutes, Quadriceps, Back, Shoulders, Arms",
  intensity: 3,
  modifications: true,
  beginnerFriendly: false,
  tags: '["Dynamic", "Flow", "Heart Rate", "Burn", "Shaking", "Minimal Rest", "Breathwork", "Balance"]',
  exerciseSequence:
    '["Breathwork", "Abs on back", "Side kneeling core", "Lunge series", "Plank series", "Repeat other side", "Stretching"]',
  videoUrl: "", // To be provided
  mux_playback_id: "ZZCGrwKKUeFCNGP4nChYBycHZ9lotx24O02026OSiNakg"
};

export default function page() {
  const parsedTags = JSON.parse(dummyClassData.tags);
  const equipmentList = dummyClassData.equipment.split(',').map(e => e.trim());
  const parsedExerciseSequence = JSON.parse(dummyClassData.exerciseSequence);
  const targetedMuscles = dummyClassData.targetedMuscles.split(',').map(m => m.trim());

  return (
    <>
      <div>
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-brand-brown hover:text-brand-brown/80 mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Button>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-brand-brown overflow-hidden md:p-8 p-0">
        {/* Back Button */}
        {/* Responsive flex row for desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Video Player */}
          <div className="aspect-video bg-black w-full md:w-1/2 md:min-w-[340px] md:max-w-[420px] md:rounded-lg overflow-hidden">
            <MuxPlayer
              playbackId={dummyClassData.mux_playback_id}
              metadata={{ title: dummyClassData.title }}
              className="w-full h-full"
            />
          </div>

          {/* Info Section */}
          <div className="p-5 md:p-0 flex-1 flex flex-col justify-center">
            {/* Title and Summary */}
            <div className="mb-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight text-gray-900">{dummyClassData.title}</h1>
              <p className="text-sm md:text-base text-muted-foreground">with {dummyClassData.instructor}</p>
            </div>

            {/* Key Info Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {dummyClassData.duration} min
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {dummyClassData.difficulty}
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {dummyClassData.focusArea}
              </div>
            </div>

            {/* Targeted Muscles */}
            <div className="flex flex-wrap gap-2 mb-2">
              {targetedMuscles.map((muscle, i) => (
                <Badge key={i} variant="outline" className="text-brand-brown border-brand-brown/30 px-2 py-0.5 text-xs md:text-sm font-medium">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        {/* About Section */}
        <div className="px-5 md:px-0 mb-4">
          <h2 className="font-semibold text-base md:text-lg mb-1">About This Workout</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">{dummyClassData.description}</p>
        </div>

        {/* Equipment Needed */}
        <div className="px-5 md:px-0 mb-4">
          <h3 className="font-semibold text-sm md:text-base mb-1">Equipment Needed</h3>
          <div className="flex flex-wrap gap-2">
            {equipmentList.map((eq, i) => (
              <Badge key={i} variant="outline" className="text-gray-700 border-gray-200 px-2 py-0.5 text-xs md:text-sm font-medium">
                {eq}
              </Badge>
            ))}
          </div>
        </div>

        {/* Exercise Sequence */}
        <div className="px-5 md:px-0 mb-2">
          <h3 className="font-semibold text-sm md:text-base mb-2">Exercise Sequence</h3>
          <ol className="space-y-2">
            {parsedExerciseSequence.map((step: string, i: number) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-brand-brown text-white flex items-center justify-center font-bold text-sm md:text-base">
                  {i + 1}
                </span>
                <span className="text-gray-800 text-sm md:text-base">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tags (now beneath exercise sequence) */}
        <div className="px-5 pt-2 md:px-0 mb-6">
          <div className="flex flex-wrap gap-2">
            {parsedTags.map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="text-gray-700 border-gray-200 px-2 py-0.5 text-xs md:text-sm font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
