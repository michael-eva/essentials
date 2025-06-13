import { AIInteractionSection } from "./personal-trainer/AIInteractionSection";
import { CustomizePTSection } from "./personal-trainer/CustomizePTSection";

export default function PersonalTrainer() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AIInteractionSection />
    </div>
  );
}
