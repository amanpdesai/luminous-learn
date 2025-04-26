import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/layout/app-navbar"
import { SidebarInset } from "@/components/ui/sidebar"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1 min-w-0 flex flex-col bg-background">
        <AppNavbar title={title} description={description} />
        {/* Remove internal padding here */}
        <main className="flex-1 flex flex-col">{children}</main>
      </SidebarInset>
    </div>
  )
}