import { redirect } from "next/navigation";
import { STEPS } from "./constants";

export default function OnboardingPage() {
  return redirect(`/onboarding/${STEPS[0]}`);
}
