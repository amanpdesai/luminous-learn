import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { Bell, Search } from "lucide-react"

interface AppNavbarProps {
  title?: string
  description?: string
}

export function AppNavbar({ title, description }: AppNavbarProps) {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <SidebarTrigger />
        <div className="ml-3 flex-1 flex items-center gap-4">
          {(title || description) && (
            <div className="hidden md:block">
              {title && <h1 className="text-lg font-medium">{title}</h1>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          )}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search courses and lessons..."
              className="w-full bg-muted/50 border-none rounded-full h-9 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary/20 input-glow"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
