"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  color?: "default" | "secondary"
}

function Switch({
  className,
  color = "default",
  ...props
}: SwitchProps) {
  const bgCheckedClass =
    color === "secondary"
      ? "data-[state=checked]:bg-secondary dark:data-[state=checked]:bg-secondary"
      : "data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary"

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50",
        "data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        bgCheckedClass,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          color === "secondary"
            ? "dark:data-[state=checked]:bg-secondary-foreground"
            : "dark:data-[state=checked]:bg-primary-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }