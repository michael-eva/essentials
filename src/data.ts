import { activityTypeEnum } from "./drizzle/src/db/schema";

export const pilatesClasses = [
  {
    name: "Strength",
    instructor: "TBD",
    duration: 45,
    description:
      "Experience the dynamic fusion of Mat Pilates and functional fitness in our Strength class. Expect to see timed sets, heavy dumbbell strength work and dynamic pilates moves to get your heart rate pumping. Step up with this combination class for a full-body, strength and conditioning workout.",
    level: "All levels",
    type: "class",
    classId: 1,
  },
  {
    name: "Burn",
    instructor: "TBD",
    duration: 45,
    description:
      "Not your average Mat Pilates class. This 45 minute high-energy, low-impact session combines a variety of props and non-stop flowing moves to deliver a maximum burn with minimal chill. Get ready for a full-body workout that will leave you feeling energised.",
    level: "All levels",
    type: "class",
    classId: 2,
  },
  {
    name: "Essentials Reformer",
    instructor: "TBD",
    duration: 50,
    description:
      "Our signature open level flow style Reformer class. Using a variety of props, this 50 minute workout is designed to challenge the whole body, while focusing on alignment and strengthening from within. This will quickly become your new obsession.",
    level: "All levels",
    type: "class",
    classId: 3,
  },
  {
    name: "Jump Reformer",
    instructor: "TBD",
    duration: 50,
    description:
      "Get ready to jump into action with our Jump Reformer class! This open level dynamic workout will challenge your entire body while working up a sweat. It's low impact with high results, easy on your joints while up leveling your Pilates routine. Expect pumping tunes and a deep burn.",
    level: "All levels",
    type: "class",
    classId: 4,
  },
  {
    name: "Barre",
    instructor: "TBD",
    duration: 45,
    description:
      "A fitness style barre class combining bodyweight and equipment based pilates exercises in a seamless flow for a total body workout. Our Barre classes are designed to condition the body within, challenge your balance and improve stamina. Expect pumping tunes and a whole lot of pulsing.",
    level: "All levels",
    type: "class",
    classId: 5,
  },
  {
    name: "Power Reformer",
    instructor: "TBD",
    duration: 50,
    description:
      "Elevate your Pilates practice with our Power Reformer class. We take the fundamentals of reformer and kick it up a notch to bring you an extra strong and spicy flow. It's designed to challenge, enhance strength, and deliver a high-energy, empowering workout.",
    level: "Intermediate",
    type: "class",
    classId: 6,
  },
];

export const nonPilates = activityTypeEnum.enumValues;

// Video 1: 24 minute FULL BODY 05
const fullBodyVideo = {
  title: "FULL BODY",
  summary: "Dynamic intermediate full-body flow with minimal rest periods",
  instructor: "Sarah Johnson",
  description:
    "A dynamic 24-minute full body workout with minimal rests that gets the heart rate up. Starting with breathwork and abs, flowing into side waist and outer glutes, standing curtsey lunges, and back work. This intermediate level class features a continuous flow style that's more challenging for beginners but includes modifications throughout. The workout progresses through abs on back, side kneeling core series, lunge series, and plank series, repeated on both sides for a comprehensive full body burn.",
  difficulty: "Intermediate",
  duration: 24,
  equipment: "None",
  pilatesStyle: "Mat Pilates",
  classType: "Full Body",
  focusArea: "Full Body",
  targetedMuscles:
    "Abdominals, Side Waist, Outer Glutes, Quadriceps, Back, Shoulders, Arms",
  intensity: 3,
  modifications: true,
  beginnerFriendly: false,
  tags: '["dynamic", "flow", "heart_rate", "burn", "shaking", "minimal_rest", "breathwork", "balance"]',
  exerciseSequence:
    '["breathwork", "abs_on_back", "side_kneeling_core", "lunge_series", "plank_series", "repeat_other_side", "stretching"]',
  videoUrl: "", // To be provided
};

// Video 2: 15 minute Booty & Core
const bootyCoreVideo = {
  title: "Booty & Core",
  summary: "Targeted glutes and core workout suitable for all levels",
  description:
    "A 15-minute session targeting glutes and core with emphasis on side body work. Perfect for all levels, this workout includes glute bridge series, side lying series, and side kneeling core work. The focus is on strengthening the outer glutes and side waist while challenging core stability. Optional booty band can be used for the side lying series or ankle weights throughout to increase intensity. The workout is repeated on both sides to ensure balanced muscle development.",
  difficulty: "Moderate",
  duration: 15,
  equipment: "Optional booty band or ankle weights",
  pilatesStyle: "Mat Pilates",
  classType: "Targeted",
  focusArea: "Glutes & Core",
  targetedMuscles: "Glutes, Core, Side Body, Outer Glutes, Side Waist",
  intensity: 3,
  modifications: true,
  beginnerFriendly: true,
  tags: '["glutes", "core", "side_body", "burn", "shaking", "outer_glutes", "stability"]',
  exerciseSequence:
    '["glute_bridge_series", "side_lying_series", "side_kneeling_core", "repeat_other_side", "glute_stretch"]',
  videoUrl: "", // To be provided
};

// Video 3: 10 MINUTE BOOTY BURN
const bootyBurnVideo = {
  title: "BOOTY BURN",
  summary: "Quick targeted glute workout for hip stability and posture",
  description:
    "A quick 10-minute booty-focused workout perfect for when you're short on time. Targets the glute medius and minimus muscles which improve hip stability, posture, and reduce injuries in the lower back, hips, and knees. The workout includes clam series and star series exercises that help stabilize for everyday activities like walking and running. Optional booty band around thighs or ankle weights can increase intensity for those wanting an extra challenge.",
  difficulty: "Moderate",
  duration: 10,
  equipment: "Optional booty band or ankle weights",
  pilatesStyle: "Mat Pilates",
  classType: "Burn",
  focusArea: "Glutes",
  targetedMuscles: "Glute Medius, Glute Minimus, Hip Stabilizers",
  intensity: 2,
  modifications: true,
  beginnerFriendly: true,
  tags: '["booty_burn", "quick_workout", "hip_stability", "glute_medius", "shaking", "posture", "injury_prevention"]',
  exerciseSequence:
    '["clam_series", "star_series", "repeat_other_side", "glute_stretch"]',
  videoUrl: "", // To be provided
};

// Video 4: Abs, Arms & Booty (from previous request)
const absArmsBootyVideo = {
  title: "Abs, Arms & Booty",
  summary: "Full-body burn class creating intense heat and shaking",
  description:
    "A 24 minute pilates Burn mat class targeting the abdominals, arms and glutes. This full body workout gets the heart rate up with dynamic moves and maintains a steady pace throughout the session. The class is programmed into sections focusing on specific muscle groups while creating an intense burn that will leave you shaking and feeling the heat. Starting with a standing warm up, the class moves through standing leg series, glute series on all fours, ab series in side kneeling, and tricep series seated. The workout concludes by repeating all sections on the opposite side and ends with standing stretches.",
  difficulty: "Moderate",
  duration: 24,
  equipment: "None",
  pilatesStyle: "Mat Pilates",
  classType: "Burn",
  focusArea: "Abs, Arms & Glutes",
  targetedMuscles:
    "Abdominals, Arms, Glutes, Hamstrings, Inner Thighs, Obliques, Triceps",
  intensity: 3,
  modifications: true,
  beginnerFriendly: true,
  tags: '["burn", "heat", "shaking", "full_body", "standing", "balance", "pulses", "accessible"]',
  exerciseSequence:
    '["standing_warmup", "standing_leg_series", "glute_series", "ab_series", "tricep_series", "repeat_other_side", "standing_stretches"]',
  videoUrl: "", // To be provided
};

// Export all four videos as an array for easy database insertion
const pilatesVideosData = [
  fullBodyVideo,
  bootyCoreVideo,
  bootyBurnVideo,
  absArmsBootyVideo,
];
