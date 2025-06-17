import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState, useCallback } from "react"
import type { MouseEvent, TouchEvent } from "react"

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

  // Touch handling state with momentum
  const [touchStart, setTouchStart] = useState<{ y: number; time: number; columnIndex: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const touchHistory = useRef<{ y: number; time: number }[]>([])
  const momentumRefs = useRef<Record<number, number>>({})

  // Momentum settings
  const TOUCH_THRESHOLD = 10 // Lower threshold for more responsive feel
  const MOMENTUM_THRESHOLD = 1.0 // Minimum velocity to trigger momentum (increased)
  const FRICTION = 0.95 // Deceleration factor (slower friction for longer momentum)
  const MIN_MOMENTUM = 0.5 // Stop momentum below this value (increased)

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      wheelDeltas.current = columns.map(() => 0)
      setTouchStart(null)
      setIsDragging(false)
      touchHistory.current = []
      // Clear any existing momentum
      Object.keys(momentumRefs.current).forEach(key => {
        const rafId = momentumRefs.current[parseInt(key)]
        if (typeof rafId === 'number') {
          cancelAnimationFrame(rafId)
        }
      })
      momentumRefs.current = {}
    }
  }, [isOpen, columns])

  // Cleanup momentum on unmount
  useEffect(() => {
    return () => {
      Object.values(momentumRefs.current).forEach(rafId => {
        cancelAnimationFrame(rafId)
      })
    }
  }, [])

  const changeValue = useCallback((columnIndex: number, direction: 'up' | 'down') => {
    const col = columns[columnIndex]
    if (!col) return false

    if (direction === 'up') {
      if ("min" in col && col.value < col.max) {
        col.setValue(col.value + 1)
        return true
      } else if ("options" in col) {
        const currentIndex = col.options.indexOf(col.value)
        const nextOption = col.options[currentIndex + 1]
        if (currentIndex < col.options.length - 1 && typeof nextOption === 'string') {
          col.setValue(nextOption)
          return true
        }
      }
    } else {
      if ("min" in col && col.value > col.min) {
        col.setValue(col.value - 1)
        return true
      } else if ("options" in col) {
        const currentIndex = col.options.indexOf(col.value)
        const prevOption = col.options[currentIndex - 1]
        if (currentIndex > 0 && typeof prevOption === 'string') {
          col.setValue(prevOption)
          return true
        }
      }
    }
    return false
  }, [columns])

  const startMomentum = useCallback((columnIndex: number, velocity: number) => {
    // Clear any existing momentum for this column
    if (momentumRefs.current[columnIndex]) {
      cancelAnimationFrame(momentumRefs.current[columnIndex])
    }

    let currentVelocity = velocity
    let accumulatedMovement = 0

    const animate = () => {
      if (Math.abs(currentVelocity) < MIN_MOMENTUM) {
        delete momentumRefs.current[columnIndex]
        return
      }

      // Accumulate movement
      accumulatedMovement += currentVelocity

      // Check if we should trigger a value change
      if (Math.abs(accumulatedMovement) >= TOUCH_THRESHOLD) {
        const direction = accumulatedMovement > 0 ? 'up' : 'down'
        const didChange = changeValue(columnIndex, direction)

        if (!didChange) {
          // Hit boundary, stop momentum
          delete momentumRefs.current[columnIndex]
          return
        }

        // Reset accumulated movement since we just made a change
        accumulatedMovement = 0
      }

      // Apply friction
      currentVelocity *= FRICTION

      // Continue animation
      momentumRefs.current[columnIndex] = requestAnimationFrame(animate)
    }

    momentumRefs.current[columnIndex] = requestAnimationFrame(animate)
  }, [changeValue])

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>, columnIndex: number) => {
    const touch = e.touches[0]
    if (touch) {
      const now = Date.now()
      setTouchStart({ y: touch.clientY, time: now, columnIndex })
      setIsDragging(false)
      touchHistory.current = [{ y: touch.clientY, time: now }]

      // Stop any existing momentum for this column
      if (momentumRefs.current[columnIndex]) {
        cancelAnimationFrame(momentumRefs.current[columnIndex])
        delete momentumRefs.current[columnIndex]
      }

      e.preventDefault()
    }
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>, columnIndex: number) => {
    if (!touchStart || touchStart.columnIndex !== columnIndex) return

    const touch = e.touches[0]
    if (!touch) return

    const now = Date.now()
    const deltaY = touchStart.y - touch.clientY
    const absDeltaY = Math.abs(deltaY)

    // Add to touch history for velocity calculation
    touchHistory.current.push({ y: touch.clientY, time: now })
    // Keep only recent history (last 100ms)
    touchHistory.current = touchHistory.current.filter(point => now - point.time < 100)

    if (absDeltaY > 5) {
      setIsDragging(true)
    }

    if (absDeltaY > TOUCH_THRESHOLD) {
      const direction = deltaY > 0 ? 'up' : 'down'
      const didChange = changeValue(columnIndex, direction)

      if (didChange) {
        // Reset touch start to allow for continuous scrolling
        setTouchStart({ y: touch.clientY, time: now, columnIndex })
      }
    }

    e.preventDefault()
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>, columnIndex: number) => {
    if (!touchStart || touchStart.columnIndex !== columnIndex) {
      setTouchStart(null)
      setIsDragging(false)
      return
    }

    // Calculate velocity from touch history
    const now = Date.now()
    const recentHistory = touchHistory.current.filter(point => now - point.time < 100)


    if (recentHistory.length >= 2) {
      const start = recentHistory[0]
      const end = recentHistory[recentHistory.length - 1]
      const timeDiff = start?.time && end?.time ? end.time - start.time : 0
      const yDiff = start?.y && end?.y ? start.y - end.y : 0 // Inverted because we want up to be positive


      if (timeDiff > 0) {
        const velocity = (yDiff / timeDiff) * 50 // Increased multiplier for more sensitivity



        if (Math.abs(velocity) > MOMENTUM_THRESHOLD) {
          startMomentum(columnIndex, velocity)
        } else {
        }
      }
    } else {
    }

    setTouchStart(null)
    setIsDragging(false)
    touchHistory.current = []
    e.preventDefault()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[340px] bg-background">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-center justify-center relative px-2 py-4 gap-4 select-none" style={{ touchAction: 'none' }}>
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
                      className="relative w-[60px] h-[132px] flex flex-col items-center justify-center touch-pan-y"
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
                      onTouchStart={e => handleTouchStart(e, idx)}
                      onTouchMove={e => handleTouchMove(e, idx)}
                      onTouchEnd={e => handleTouchEnd(e, idx)}
                    >
                      {/* Top faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-[var(--muted-foreground)] opacity-50 select-none">
                        {value > min ? format(value - 1) : ''}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[44px] h-px bg-[var(--border)]" />
                      {/* Selected value */}
                      <div className="h-[44px] flex items-center justify-center text-2xl font-bold text-[var(--foreground)] select-none">
                        {format(value)} {col.unit && <span className="text-base font-normal ml-1">{col.unit}</span>}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[88px] h-px bg-[var(--border)]" />
                      {/* Bottom faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-[var(--muted-foreground)] opacity-50 select-none">
                        {value < max ? format(value + 1) : ''}
                      </div>
                      {/* Clickable overlay */}
                      <div className="absolute inset-0 z-10 cursor-pointer" style={{ background: 'transparent' }}
                        onClick={(e: MouseEvent<HTMLDivElement>) => {
                          if (isDragging) return; // Prevent click during drag
                          const y = e.nativeEvent.offsetY;
                          if (y < 44 && value > min) col.setValue(value - 1);
                          if (y > 88 && value < max) col.setValue(value + 1);
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">{col.label}</div>
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
                      className="relative w-[60px] h-[132px] flex flex-col items-center justify-center touch-pan-y"
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
                      onTouchStart={e => handleTouchStart(e, idx)}
                      onTouchMove={e => handleTouchMove(e, idx)}
                      onTouchEnd={e => handleTouchEnd(e, idx)}
                    >
                      {/* Top faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-[var(--muted-foreground)] opacity-50 select-none">
                        {idxValue > 0 && options[idxValue - 1] ? options[idxValue - 1] : ''}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[44px] h-px bg-[var(--border)]" />
                      {/* Selected value */}
                      <div className="h-[44px] flex items-center justify-center text-2xl font-bold text-[var(--foreground)] select-none">
                        {value}
                      </div>
                      {/* Divider */}
                      <div className="absolute left-0 right-0 top-[88px] h-px bg-[var(--border)]" />
                      {/* Bottom faded value */}
                      <div className="h-[44px] flex items-center justify-center text-lg text-[var(--muted-foreground)] opacity-50 select-none">
                        {idxValue < options.length - 1 && options[idxValue + 1] ? options[idxValue + 1] : ''}
                      </div>
                      {/* Clickable overlay */}
                      <div className="absolute inset-0 z-10 cursor-pointer" style={{ background: 'transparent' }}
                        onClick={(e: MouseEvent<HTMLDivElement>) => {
                          if (isDragging || idxValue === -1) return; // Prevent click during drag
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
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">{col.label}</div>
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