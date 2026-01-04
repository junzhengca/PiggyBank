import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:from-primary-light hover:to-primary",
        destructive:
          "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground hover:shadow-lg hover:shadow-destructive/25 hover:from-red-600 hover:to-destructive",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary:
          "bg-gradient-to-r from-secondary to-slate-200 text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-gradient-to-r from-success to-green-600 text-success-foreground hover:shadow-lg hover:shadow-success/25 hover:from-green-600 hover:to-success",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 px-2 text-xs",
        lg: "h-9 px-6 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
