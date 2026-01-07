import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
  value: string
  label: string
  color?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation()
    onChange(selectedValues.filter((v) => v !== value))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value))

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex min-h-[42px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  option.color && "text-white"
                )}
                style={{
                  backgroundColor: option.color || "hsl(var(--secondary))",
                  color: option.color ? "white" : undefined,
                }}
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, option.value)}
                  className="hover:opacity-80"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClearAll()
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Clear all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {option.color && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
