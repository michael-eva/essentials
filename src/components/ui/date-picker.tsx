"use client"

import * as React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  error?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  error,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center w-full border rounded-md px-3 py-2 text-left bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors",
              !date && "text-muted-foreground",
              error && "border-destructive focus:ring-destructive/50",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">{
              date
                ? (date.toDateString() === new Date().toDateString() ? 'Today' : format(date, "PPP"))
                : placeholder
            }</span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-300" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (onSelect) onSelect(selectedDate)
              if (selectedDate) setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
} 