"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number; // Value in seconds
  onChange?: (seconds: number) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, value = 35, onChange, onBlur, error, ...props }, ref) => {
    // Convert seconds to mm:ss format
    const secondsToMMSS = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Convert mm:ss format to seconds
    const mmssToSeconds = (mmss: string): number => {
      const parts = mmss.split(':');
      if (parts.length !== 2) return 35; // Default fallback
      
      const mins = parseInt(parts[0] || '0', 10);
      const secs = parseInt(parts[1] || '0', 10);
      
      if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs > 59) {
        return 35; // Default fallback for invalid input
      }
      
      return mins * 60 + secs;
    };

    // Validate mm:ss format
    const isValidMMSS = (mmss: string): boolean => {
      const pattern = /^([0-9]{1,2}):([0-5][0-9])$/;
      return pattern.test(mmss);
    };

    const [displayValue, setDisplayValue] = React.useState(secondsToMMSS(value));
    const [isValid, setIsValid] = React.useState(true);

    // Update display when value prop changes
    React.useEffect(() => {
      setDisplayValue(secondsToMMSS(value));
      setIsValid(true);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setDisplayValue(newValue);

      // Validate and convert
      if (isValidMMSS(newValue)) {
        const seconds = mmssToSeconds(newValue);
        setIsValid(true);
        onChange?.(seconds);
      } else {
        setIsValid(false);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const currentValue = event.target.value;
      
      if (!isValidMMSS(currentValue)) {
        // Reset to last valid value on blur if invalid
        setDisplayValue(secondsToMMSS(value));
        setIsValid(true);
      }
      
      onBlur?.(event);
    };

    return (
      <Input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="00:35"
        className={cn(
          className,
          (!isValid || error) && "border-red-500 focus-visible:ring-red-500"
        )}
        {...props}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";

export { TimeInput };