"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MultiSelectPillsProps {
    options: string[]
    selectedValues: string[]
    onChange: (value: string) => void
    className?: string
    singleSelect?: boolean
}

export function MultiSelectPills({
    options,
    selectedValues,
    onChange,
    className,
    singleSelect = false,
}: MultiSelectPillsProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => {
                        if (singleSelect) {
                            if (selectedValues[0] !== option) {
                                onChange(option);
                            }
                        } else {
                            onChange(option);
                        }
                    }}
                    className={cn(
                        "px-4 py-2 text-sm rounded-full border transition-colors capitalize",
                        selectedValues.includes(option)
                        && "bg-brand-light-nude border-brand-brown text-primary-foreground"
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    )
} 