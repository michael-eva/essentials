import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutDuration: number;
  setWorkoutDuration: (val: number) => void;
  classDuration: number;
  setClassDuration: (val: number) => void;
  isLoading: boolean;
  onConfirm: () => void;
}

const DurationDialog: React.FC<DurationDialogProps> = ({
  open,
  onOpenChange,
  workoutDuration,
  setWorkoutDuration,
  classDuration,
  setClassDuration,
  isLoading,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-red-200 border-2 gap-8">
        <DialogHeader>
          <DialogTitle className="text-center">Set Workout & Class Duration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="workout-duration" className="block text-sm font-medium text-gray-700 mb-1 text-center">Workout Duration (minutes)</label>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3 sm:justify-center">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWorkoutDuration(Math.max(10, workoutDuration - 5))}
                  aria-label="Decrease workout duration"
                >
                  -
                </Button>
                <span className="text-lg font-semibold w-12 text-center">{workoutDuration}</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWorkoutDuration(Math.min(180, workoutDuration + 5))}
                  aria-label="Increase workout duration"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="class-duration" className="block text-sm font-medium text-gray-700 mb-1 text-center">Class Duration (minutes)</label>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3 sm:justify-center">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClassDuration(Math.max(10, classDuration - 5))}
                  aria-label="Decrease class duration"
                >
                  -
                </Button>
                <span className="text-lg font-semibold w-12 text-center">{classDuration}</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClassDuration(Math.min(180, classDuration + 5))}
                  aria-label="Increase class duration"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancel</Button>
          <Button onClick={onConfirm} type="button" disabled={isLoading}>
            {isLoading ? "Generating..." : "Proceed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DurationDialog; 