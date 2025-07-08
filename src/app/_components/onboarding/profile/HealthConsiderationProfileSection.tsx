import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { FormData } from "@/app/_components/onboarding/profile/EditFormDialog";
import {
  booleanToRadioValue,
  radioValueToBoolean,
} from "@/app/_utils/formRadioUtils";

import {
  HEALTH_CONDITIONS,
  PREGNANCY_OPTIONS,
  type PregnancyOption,
} from "@/app/_constants/health";
import { handleNoneMultiSelect } from "@/app/_utils/multiSelectNoneUtils";
import { CustomOtherInput } from "@/app/_components/onboarding/profile/CustomOtherInput";

type HealthConsiderationProps = {
  data: FormData["healthCons"];
  setData: (data: FormData["healthCons"]) => void;
};

const HealthConsiderationProfileSection: React.FC<HealthConsiderationProps> = ({
  data,
  setData,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2">Injuries (Past & Present)</Label>
        <RadioGroup
          className="flex gap-6"
          value={booleanToRadioValue(data.injuries)}
          onValueChange={(value) =>
            setData({ ...data, injuries: radioValueToBoolean(value) })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="injuries-yes" />
            <Label htmlFor="injuries-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="injuries-no" />
            <Label htmlFor="injuries-no">No</Label>
          </div>
        </RadioGroup>
        {data.injuries && (
          <div className="mt-2">
            <Textarea
              placeholder="Describe your injuries..."
              value={data.injuriesDetails ?? ""}
              onChange={(e) =>
                setData({ ...data, injuriesDetails: e.target.value || null })
              }
            />
          </div>
        )}
      </div>
      <div>
        <Label className="mb-2">Recent or Past Surgery</Label>
        <RadioGroup
          className="flex gap-6"
          value={booleanToRadioValue(data.recentSurgery)}
          onValueChange={(value) =>
            setData({ ...data, recentSurgery: radioValueToBoolean(value) })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="surgery-yes" />
            <Label htmlFor="surgery-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="surgery-no" />
            <Label htmlFor="surgery-no">No</Label>
          </div>
        </RadioGroup>
        {data.recentSurgery && (
          <div className="mt-2">
            <Textarea
              placeholder="Describe your surgery and recovery timeline..."
              value={data.surgeryDetails ?? ""}
              onChange={(e) =>
                setData({ ...data, surgeryDetails: e.target.value || null })
              }
            />
          </div>
        )}
      </div>
      <div>
        <Label className="mb-2">Health Considerations</Label>
        <MultiSelectPills
          options={HEALTH_CONDITIONS}
          selectedValues={data.chronicConditions}
          onChange={(value) => {
            const currentConditions = data.chronicConditions;
            const newConditions = handleNoneMultiSelect(
              currentConditions,
              value,
            );

            setData({ ...data, chronicConditions: newConditions });
          }}
        />
        {data.chronicConditions.includes("Other") && (
          <div className="mt-2">
            <CustomOtherInput
              placeholder="Add custom tracking method"
              items={data.otherHealthConditions}
              onAdd={(item) =>
                setData({
                  ...data,
                  otherHealthConditions: [...data.otherHealthConditions, item],
                })
              }
              onRemove={(idx) =>
                setData({
                  ...data,
                  otherHealthConditions: data.otherHealthConditions.filter(
                    (_, i) => i !== idx,
                  ),
                })
              }
            />
          </div>
        )}
      </div>
      <div>
        <Label className="mb-2" htmlFor="pregnancy">
          Pregnancy Status
        </Label>
        <Select
          value={data.pregnancy ?? ""}
          onValueChange={(value: PregnancyOption) =>
            setData({ ...data, pregnancy: value })
          }
        >
          <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {PREGNANCY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.pregnancy !== "Not applicable" && (
        <div>
          <Label className="mb-2">Doctor Consultation</Label>
          <RadioGroup
            className="flex gap-6"
            value={booleanToRadioValue(data.pregnancyConsultedDoctor)}
            onValueChange={(value) => {
              setData({
                ...data,
                pregnancyConsultedDoctor: radioValueToBoolean(value),
              });
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="pregnancy-consultation-yes" />
              <Label htmlFor="pregnancy-consultation-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="pregnancy-consultation-no" />
              <Label htmlFor="pregnancy-consultation-no">No</Label>
            </div>
          </RadioGroup>
          {data.pregnancyConsultedDoctor && (
            <div className="mt-2">
              <Textarea
                placeholder="Please provide more information about your doctor's consultation"
                value={data.pregnancyConsultedDoctorDetails ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    pregnancyConsultedDoctorDetails: e.target.value || null,
                  })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthConsiderationProfileSection;
