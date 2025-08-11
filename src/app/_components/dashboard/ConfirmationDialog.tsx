import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
  loadingText?: string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText,
  variant = "default",
  isLoading = false,
  loadingText
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLoading ? (loadingText ?? "Processing...") : title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className={isLoading ? "text-gray-600" : ""}>
            {isLoading ? "Please wait while we process your request." : description}
          </p>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant={variant} 
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? (loadingText ?? "Processing...") : (confirmText ?? title)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 