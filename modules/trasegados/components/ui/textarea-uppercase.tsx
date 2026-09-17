"use client"

import * as React from "react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export const TextareaUppercase = React.forwardRef<
  React.ComponentRef<typeof Textarea>,
  React.ComponentProps<typeof Textarea>
>(({ className, onChange, value, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.value = e.target.value.toUpperCase()
    onChange?.(e)
  }

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={handleChange}
      className={cn("uppercase", className)}
      {...props}
    />
  )
})
TextareaUppercase.displayName = "TextareaUppercase"
