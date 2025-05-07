"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MultiSelectPillsProps {
    options: string[]
    selectedValues: string[]
    onChange: (value: string) => void
    className?: string
    pillClassName?: string
}

export function MultiSelectPills({
    options,
    selectedValues,
    onChange,
    className,
    pillClassName,
}: MultiSelectPillsProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={cn(
                        "px-4 py-2 text-sm rounded-full border transition-colors",
                        selectedValues.includes(option)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted border-muted text-muted-foreground",
                        pillClassName
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    )
} 