import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface OnboardingRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingRequiredDialog({ open, onOpenChange }: OnboardingRequiredDialogProps) {
  const router = useRouter()

  const handleStartOnboarding = () => {
    onOpenChange(false)
    router.push("/onboarding")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Onboarding Required</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Please complete your onboarding to generate a personalised workout plan. This will help us understand your fitness goals and create the best plan for you.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartOnboarding} className="bg-accent">
              Start Onboarding
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 