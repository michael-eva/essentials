import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MultiSelectPills } from "@/app/_components/global/multi-select-pills";
import {
  PILATES_DURATION,
  PILATES_SESSIONS,
  PILATES_SESSION_PREFERENCE,
  PILATES_APPARATUS,
  CUSTOM_PILATES_APPARATUS,
  type PilatesDuration,
  type PilatesSessions,
  type PilatesSessionPreference,
  type PilatesApparatus,
  type CustomPilateApparatus,
} from "@/app/_constants/pilates";
import type { FormData } from "./EditFormDialog";

import { handleNoneMultiSelect } from "@/app/_utils/multiSelectNoneUtils";

type PilatesProfileSectionProps = {
  data: FormData["pilates"];
  setData: (data: FormData["pilates"]) => void;
};

const PilatesProfileSection: React.FC<PilatesProfileSectionProps> = ({
  data: typedData,
  setData,
}) => {
  return (
    <>
      <div className="space-y-4">
        <div>
          <Label className="mb-2">Pilates Experience</Label>
          <RadioGroup
            className="mb-4 flex gap-6"
            value={
              typedData.pilatesExperience === null
                ? ""
                : typedData.pilatesExperience
                  ? "true"
                  : "false"
            }
            onValueChange={(value) =>
              setData({
                ...typedData,
                pilatesExperience: value === "" ? null : value === "true",
              })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="pilates-yes" />
              <Label htmlFor="pilates-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="pilates-no" />
              <Label htmlFor="pilates-no">No</Label>
            </div>
          </RadioGroup>
          {typedData.pilatesExperience && (
            <div className="mb-4">
              <Label htmlFor="pilatesDuration" className="mb-2">
                Duration
              </Label>
              <Select
                value={typedData.pilatesDuration ?? ""}
                onValueChange={(value: PilatesDuration) =>
                  setData({ ...typedData, pilatesDuration: value })
                }
              >
                <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {PILATES_DURATION.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="studioFrequency" className="mb-2">
            Studio Frequency
          </Label>
          <Select
            value={typedData.studioFrequency ?? ""}
            onValueChange={(value: PilatesSessions) =>
              setData({ ...typedData, studioFrequency: value })
            }
          >
            <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {PILATES_SESSIONS.map((session) => (
                <SelectItem key={session} value={session}>
                  {session}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sessionPreference" className="mb-2">
            Preferred Class Type
          </Label>
          <Select
            value={typedData.sessionPreference ?? ""}
            onValueChange={(value: PilatesSessionPreference) =>
              setData({ ...typedData, sessionPreference: value })
            }
          >
            <SelectTrigger className="min-h-[44px] w-full rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-offset-0">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              {PILATES_SESSION_PREFERENCE.map((preference) => (
                <SelectItem key={preference} value={preference}>
                  {preference}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2">Type of Pilates</Label>
          <MultiSelectPills
            options={PILATES_APPARATUS}
            selectedValues={typedData.apparatusPreference}
            onChange={(value) => {
              const newPreference = handleNoneMultiSelect(
                typedData.apparatusPreference,
                value,
              );
              setData({
                ...typedData,
                apparatusPreference: newPreference,
              });
            }}
          />
        </div>
        <div>
          <Label className="mb-2">Available Equipment</Label>
          <MultiSelectPills
            options={CUSTOM_PILATES_APPARATUS}
            selectedValues={typedData.customApparatus}
            onChange={(value) => {
              const newPreference = handleNoneMultiSelect(
                typedData.customApparatus,
                value,
              );

              setData({
                ...typedData,
                customApparatus: newPreference,
              });
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PilatesProfileSection;
