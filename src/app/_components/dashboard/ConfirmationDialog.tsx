import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  variant?: "default" | "destructive"
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText,
  variant = "default"
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>{description}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant={variant} onClick={onConfirm}>
              {confirmText ?? title}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 