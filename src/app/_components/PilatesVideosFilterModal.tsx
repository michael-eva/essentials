import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter as FilterIcon } from "lucide-react";

interface PilatesVideosFilterModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  DIFFICULTY_OPTIONS: string[];
  EQUIPMENT_OPTIONS: string[];
  INSTRUCTOR_OPTIONS: string[];
  pendingDifficulty: string;
  setPendingDifficulty: (v: string) => void;
  pendingEquipment: string;
  setPendingEquipment: (v: string) => void;
  pendingInstructor: string;
  setPendingInstructor: (v: string) => void;
  pendingMinDuration: number;
  setPendingMinDuration: (v: number) => void;
  pendingMaxDuration: number;
  setPendingMaxDuration: (v: number) => void;
  handleClearAll: () => void;
  handleApplyFilters: () => void;
}

const PilatesVideosFilterModal: React.FC<PilatesVideosFilterModalProps> = ({
  open,
  setOpen,
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  INSTRUCTOR_OPTIONS,
  pendingDifficulty,
  setPendingDifficulty,
  pendingEquipment,
  setPendingEquipment,
  pendingInstructor,
  setPendingInstructor,
  pendingMinDuration,
  setPendingMinDuration,
  pendingMaxDuration,
  setPendingMaxDuration,
  handleClearAll,
  handleApplyFilters,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex justify-end w-full mb-2">
        <DialogTrigger asChild>
          <Button variant="outline" aria-label="Filter">
            <FilterIcon className="w-5 h-5" />
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Videos</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Difficulty</label>
            <Select value={pendingDifficulty} onValueChange={setPendingDifficulty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className="[&>span]:capitalize">{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Equipment</label>
            <Select value={pendingEquipment} onValueChange={setPendingEquipment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className="[&>span]:capitalize">{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Instructor</label>
            <Select value={pendingInstructor} onValueChange={setPendingInstructor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {INSTRUCTOR_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className="[&>span]:capitalize">{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Duration (minutes)</label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={0}
                value={pendingMinDuration || ""}
                onChange={e => setPendingMinDuration(Number(e.target.value))}
                placeholder="Min"
                className="w-24"
              />
              <span>-</span>
              <Input
                type="number"
                min={0}
                value={pendingMaxDuration || ""}
                onChange={e => setPendingMaxDuration(Number(e.target.value))}
                placeholder="Max"
                className="w-24"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6 flex gap-3">
          <Button variant="outline" onClick={handleClearAll} type="button" >Clear All</Button>
          <Button onClick={handleApplyFilters} type="button">Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PilatesVideosFilterModal; 