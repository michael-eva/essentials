import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MarkClassMissed({ isDialogOpen, setIsDialogOpen, onSubmit, workoutId }: { isDialogOpen: boolean, setIsDialogOpen: (isOpen: boolean) => void, onSubmit: (workoutId: string) => void, workoutId: string }) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Class Missed</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to mark this class as missed?</p>
        <DialogFooter className="flex flex-row gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setIsDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            className="flex-1"
            onClick={() => onSubmit(workoutId)}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}