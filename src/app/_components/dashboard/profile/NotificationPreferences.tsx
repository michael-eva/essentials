"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

type NotificationPreferences = {
  enabledTypes: string[];
};

const NOTIFICATION_TYPES = [
  { value: "workout_reminder", label: "Workout Reminders" },
  { value: "progress_celebration", label: "Progress Celebrations" },
  { value: "motivation_boost", label: "Motivation Boosts" },
];

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabledTypes: ["workout_reminder", "progress_celebration", "motivation_boost"],
  });

  const { data: currentPreferences, isLoading } = api.notifications.getPreferences.useQuery();
  const updatePreferences = api.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });

  useEffect(() => {
    if (currentPreferences) {
      setPreferences({
        enabledTypes: currentPreferences.enabledTypes || [],
      });
    }
  }, [currentPreferences]);

  const handleNotificationTypeToggle = (type: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      enabledTypes: enabled
        ? [...prev.enabledTypes, type]
        : prev.enabledTypes.filter(t => t !== type)
    }));
  };

  const handleSave = () => {
    updatePreferences.mutate(preferences);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Notification Types</h3>
          <p className="text-sm text-gray-600">Choose which types of notifications you want to receive</p>
        </div>
        <div className="grid gap-4">
          {NOTIFICATION_TYPES.map((type) => (
            <div key={type.value} className="flex items-center justify-between">
              <Label htmlFor={type.value} className="text-sm font-medium">
                {type.label}
              </Label>
              <Switch
                id={type.value}
                checked={preferences.enabledTypes.includes(type.value)}
                onCheckedChange={(checked) => handleNotificationTypeToggle(type.value, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          className="flex items-center gap-2"
        >
          {updatePreferences.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}