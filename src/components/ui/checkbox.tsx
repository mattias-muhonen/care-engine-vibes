"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

// New visual design for checkbox:
// - Fixed size (h-6 w-6) and box-border to prevent layout shifts
// - Subtle rounded square with smooth bg/border transitions
// - Centered indicator that doesn't affect layout (pointer-events-none)
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    // enforce exact pixel sizing so external utility classes can't override dimensions
    style={{ width: 24, height: 24 }}
    className={cn(
      // fixed sizing + layout stability
      "peer inline-flex box-border items-center justify-center h-6 w-6 shrink-0 rounded-md border bg-transparent text-muted-foreground transition-colors duration-150 ease-in-out",
      // visual states
      "border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  // checked state: solid primary fill (restored) and keep border to avoid layout jump
  "data-[state=checked]:bg-primary data-[state=checked]:border-border data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "pointer-events-none flex items-center justify-center h-full w-full",
        // fade indicator in/out instead of appearing abruptly
        "opacity-0 transition-opacity duration-150 ease-in-out data-[state=checked]:opacity-100"
      )}
    >
      <Check className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
