import { Input } from "@/components/ui/input";
import { AnimatedField } from "./AnimatedField";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { GENDER, type Gender } from "@/app/_constants/gender";
import type { FormData } from "./EditFormDialog";

interface PersonalInfoProfileSectionProps {
  typedData: FormData["basicQuestion"];
  setData: (data: FormData["basicQuestion"]) => void;
}

export default function PersonalInfoProfileSection({ typedData, setData }: PersonalInfoProfileSectionProps) {
  return (
    <>
      <AnimatedField label="Name" index={0}>
        <Input
          id="name"
          value={typedData.name ?? ""}
          onChange={(e) => setData({ ...typedData, name: e.target.value || null })}
          className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
          style={{ height: "44px", fontSize: "15px" }}
        />
      </AnimatedField>
      <AnimatedField label="Age" index={1}>
        <Input
          id="age"
          type="number"
          value={typedData.age ?? ""}
          onChange={(e) => setData({ ...typedData, age: e.target.value ? parseInt(e.target.value) : null })}
          className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
          style={{ height: "44px", fontSize: "15px" }}
        />
      </AnimatedField>
      <AnimatedField label="Height (cm)" index={2}>
        <Input
          id="height"
          type="number"
          value={typedData.height ?? ""}
          onChange={(e) => setData({ ...typedData, height: e.target.value ? parseInt(e.target.value) : null })}
          className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
          style={{ height: "44px", fontSize: "15px" }}
        />
      </AnimatedField>
      <AnimatedField label="Weight (kg)" index={3}>
        <Input
          id="weight"
          type="number"
          value={typedData.weight ?? ""}
          onChange={(e) => setData({ ...typedData, weight: e.target.value ? parseInt(e.target.value) : null })}
          className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0"
          style={{ height: "44px", fontSize: "15px" }}
        />
      </AnimatedField>
      <AnimatedField label="Gender" index={4}>
        <Select
          value={typedData.gender ?? ""}
          onValueChange={(value: Gender) => setData({ ...typedData, gender: value })}
        >
          <SelectTrigger className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0 w-full min-h-[44px]">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDER.map((gender) => (
              <SelectItem key={gender} value={gender}>{gender}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AnimatedField>
    </>
  );
} 