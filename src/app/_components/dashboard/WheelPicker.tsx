import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"
import type { MouseEvent } from "react"

// Column type: number range or options
export type WheelPickerColumn =
  | {
    label: string
    value: number
    setValue: (v: number) => void
    min: number
    max: number
    format?: (v: number) => string
    unit?: string
  }
  | {
    label: string
    value: string
    setValue: (v: string) => void
    options: string[]
  }

interface WheelPickerProps {
  isOpen: boolean
  onClose: () => void
  columns: WheelPickerColumn[]
  title?: string
  onConfirm: () => void
}

export function WheelPicker({
  isOpen,
  onClose,
  columns,
  title = "Select Value",
  onConfirm,
}: WheelPickerProps) {
  // For wheel scroll delta per column
  const wheelDeltas = useRef<number[]>(columns.map(() => 0))
  const WHEEL_THRESHOLD = 20

  // Reset wheel deltas on open
  useEffect(() => {
    if (isOpen) {
      wheelDeltas.current = columns.map(() => 0)
    }
  }, [isOpen, columns.length])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[340px] bg-background">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-center justify-center relative px-2 py-4 gap-4">
            {columns.map((col, idx) => {
              const colKey = col.label ? col.label : `col-${idx}`;
              // Number range column
              if ("min" in col) {
                const value = col.value
                const min = col.min
                const max = col.max
                const format = col.format ?? ((v: number) => v.toString())
                return (
                  <div key={colKey} className="flex flex-col items-center">
                    <div
                      className="relative w-[60px] h-[132px] flex flex-col items-center justify-center"
                      onWheel={e => {
                        if (typeof wheelDeltas.current[idx] !== 'number') return;
                        wheelDeltas.current[idx] += e.deltaY
                        while (wheelDeltas.current[idx] <= -WHEEL_THRESHOLD && value > min) {
                          col.setValue(value - 1)
                          wheelDeltas.current[idx] += WHEEL_THRESHOLD
                        }
                        while (wheelDeltas.current[idx] >= WHEEL_THRESHOLD && value < max) {
                          col.setValue(value + 1)
                          wheelDeltas.current[idx] -= WHEEL_THRESHOLD
                        }
                      }}
                    >
                      {/* Top faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-muted-foreground opacity-50 select-none">
                        {value > min ? format(value - 1) : ''}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[44px] h-px bg-border" />
                      {/* Selected value */}
                      <div className="h-[44px] flex items-center justify-center text-2xl font-bold text-foreground select-none">
                        {format(value)} {col.unit && <span className="text-base font-normal ml-1">{col.unit}</span>}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[88px] h-px bg-border" />
                      {/* Bottom faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-muted-foreground opacity-50 select-none">
                        {value < max ? format(value + 1) : ''}
                      </div>
                      {/* Clickable overlay */}
                      <div className="absolute inset-0 z-10 cursor-pointer" style={{ background: 'transparent' }}
                        onClick={(e: MouseEvent<HTMLDivElement>) => {
                          const y = e.nativeEvent.offsetY;
                          if (y < 44 && value > min) col.setValue(value - 1);
                          if (y > 88 && value < max) col.setValue(value + 1);
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{col.label}</div>
                  </div>
                )
              }
              // Options column
              else {
                const value = col.value
                const options = col.options
                const idxValue = options.indexOf(value)
                return (
                  <div key={colKey} className="flex flex-col items-center">
                    <div
                      className="relative w-[60px] h-[132px] flex flex-col items-center justify-center"
                      onWheel={e => {
                        if (typeof wheelDeltas.current[idx] !== 'number') return;
                        if (idxValue === -1) return;
                        wheelDeltas.current[idx] += e.deltaY
                        while (wheelDeltas.current[idx] <= -WHEEL_THRESHOLD && idxValue > 0) {
                          const prevOption = options[idxValue - 1];
                          if (typeof prevOption === 'string') {
                            col.setValue(prevOption);
                          }
                          wheelDeltas.current[idx] += WHEEL_THRESHOLD;
                        }
                        while (wheelDeltas.current[idx] >= WHEEL_THRESHOLD && idxValue < options.length - 1) {
                          const nextOption = options[idxValue + 1];
                          if (typeof nextOption === 'string') {
                            col.setValue(nextOption);
                          }
                          wheelDeltas.current[idx] -= WHEEL_THRESHOLD;
                        }
                      }}
                    >
                      {/* Top faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-muted-foreground opacity-50 select-none">
                        {idxValue > 0 && options[idxValue - 1] ? options[idxValue - 1] : ''}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[44px] h-px bg-border" />
                      {/* Selected value */}
                      <div className="h-[44px] flex items-center justify-center text-2xl font-bold text-foreground select-none">
                        {value}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[88px] h-px bg-border" />
                      {/* Bottom faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-muted-foreground opacity-50 select-none">
                        {idxValue < options.length - 1 && options[idxValue + 1] ? options[idxValue + 1] : ''}
                      </div>
                      {/* Clickable overlay */}
                      <div className="absolute inset-0 z-10 cursor-pointer" style={{ background: 'transparent' }}
                        onClick={(e: MouseEvent<HTMLDivElement>) => {
                          if (idxValue === -1) return;
                          const y = e.nativeEvent.offsetY;
                          if (y < 44 && idxValue > 0) {
                            const prevOption = options[idxValue - 1];
                            if (typeof prevOption === 'string') col.setValue(prevOption);
                          }
                          if (y > 88 && idxValue < options.length - 1) {
                            const nextOption = options[idxValue + 1];
                            if (typeof nextOption === 'string') col.setValue(nextOption);
                          }
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{col.label}</div>
                  </div>
                )
              }
            })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 