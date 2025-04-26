"use client"

import { Moon, Sun, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { JSX, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [currentIcon, setCurrentIcon] = useState<JSX.Element | null>(null)

  useEffect(() => {
    const activeTheme = theme === "system" ? systemTheme : theme
    if (theme === "system") {
      setCurrentIcon(<Globe className="h-[1.2rem] w-[1.2rem]" />)
    } else if (activeTheme === "dark") {
      setCurrentIcon(<Moon className="h-[1.2rem] w-[1.2rem]" />)
    } else {
      setCurrentIcon(<Sun className="h-[1.2rem] w-[1.2rem]" />)
    }
  }, [theme, systemTheme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
          {currentIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}