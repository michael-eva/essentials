import { AIInteractionSection } from "./personal-trainer/AIInteractionSection";
import { CustomizePTSection } from "./personal-trainer/CustomizePTSection";

export default function PersonalTrainer() {

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIInteractionSection />
        <CustomizePTSection />
      </div>
    </div>
  );
}
