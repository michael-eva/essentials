import WaitlistForm from "@/app/_components/waitlist/WaitlistForm";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WaitlistForm />
    </Suspense>
  )
}
