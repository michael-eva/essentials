"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-brand-brown data-[state=unchecked]:bg-brand-bright-orange focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-brand-bright-orange dark:data-[state=checked]:bg-brand-bright-orange inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        // Fallback colors for mobile compatibility
        "data-[state=checked]:bg-[#705444] data-[state=unchecked]:bg-[#ffab0c] dark:data-[state=unchecked]:bg-[#ffab0c] dark:data-[state=checked]:bg-[#ffab0c]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-brand-white data-[state=checked]:bg-brand-light-yellow dark:data-[state=unchecked]:bg-brand-light-yellow dark:data-[state=checked]:bg-brand-brown pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          // Fallback colors for mobile compatibility
          "bg-[#ffffff] data-[state=checked]:bg-[#fffce8] dark:data-[state=unchecked]:bg-[#fffce8] dark:data-[state=checked]:bg-[#705444]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
