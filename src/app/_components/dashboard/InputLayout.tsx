import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { ChevronDown } from "lucide-react"

interface CustomInputProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  value?: string | number
  placeholder?: string
  error?: string
  className?: string
}

const InputLayout = React.forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ icon: Icon, value, placeholder, error, className, children, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <button
          ref={ref}
          type="button"
          className={cn(
            "flex items-center w-full border rounded-md px-3 py-2 text-left bg-[var(--background)] text-[var(--foreground)] border-[var(--input)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-colors",
            !value && "text-[var(--muted-foreground)]",
            error && "border-[var(--destructive)] focus:ring-[var(--destructive)]/50",
            className
          )}
          {...props}
        >
          {Icon && <Icon className="w-4 h-4 mr-2 text-muted-foreground" />}
          <span className="flex-1 text-left">{value ?? placeholder}</span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-300" />
        </button>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

InputLayout.displayName = "CustomInput"

export { InputLayout as CustomInput } 