"use client"

import { BookOpen, Brain, GalleryVerticalEnd, Home, Lightbulb, ListTodo, Settings, Sparkles, User, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <Sidebar className="overflow-x-hidden">
      <SidebarHeader className="pb-0">
        <Link href="/" className="flex items-center gap-2 px-4 py-3 hover:opacity-80 transition-opacity">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-2xl font-display">Luminous</span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator className="mb-4" />
      <SidebarContent className="gap-y-4 w-full max-w-full overflow-x-hidden">
        <SidebarMenu className="gap-y-2.5">
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard" className="flex items-center gap-4 text-base">
                <Home className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/courses")}>
              <Link href="/courses" className="flex items-center gap-4 text-base">
                <BookOpen className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">My Courses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/quick-learn")}>
              <Link href="/quick-learn" className="flex items-center gap-4 text-base">
                <Zap className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">Quick Learn</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/flashcards")}>
              <Link href="/flashcards" className="flex items-center gap-4 text-base">
                <GalleryVerticalEnd className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">Flashcards</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/quizzes")}>
              <Link href="/quizzes" className="flex items-center gap-4 text-base">
                <ListTodo className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">Quizzes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu className="gap-y-2.5">
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/tutor")}>
              <Link href="/tutor" className="flex items-center gap-4 text-base">
                <Brain className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">AI Tutor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/suggestions")}>
              <Link href="/suggestions" className="flex items-center gap-4 text-base">
                <Lightbulb className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">Suggestions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mb-6">
        <SidebarSeparator className="mb-2"/>
        <SidebarMenu className="gap-y-2.5">
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/profile")}>
              <Link href="/profile" className="flex items-center gap-4 text-base">
                <User className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild isActive={isActive("/settings")}>
              <Link href="/settings" className="flex items-center gap-4 text-base">
                <Settings className="!h-5 !w-5 md:h-5 md:w-5" />
                <span className="text-lg">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
