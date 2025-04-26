"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Zap,
  Clock,
  Search,
  BookOpen,
  Filter,
} from "lucide-react"
import { parseISO, formatDistanceToNowStrict } from "date-fns"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"

type QuickLearnSession = {
  id: number
  title: string
  description: string
  duration: string
  progress: number
  totalLessons: number
  lastAccessed: string // ISO string
}

type SortOption =
  | "progress_asc"
  | "progress_desc"
  | "lessons_asc"
  | "lessons_desc"
  | "lastAccessed_asc"
  | "lastAccessed_desc"

export default function QuickLearnPage() {
  const [sessions, setSessions] = useState<QuickLearnSession[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("lastAccessed_desc")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/auth")
    }

    const fetchSessions = async () => {
      setSessions([
        {
          id: 1,
          title: "TypeScript Types",
          description: "TypeScript types and interfaces overview",
          duration: "12 min",
          progress: 60,
          totalLessons: 3,
          lastAccessed: "2025-04-23T10:00:00.000Z",
        },
        {
          id: 2,
          title: "JavaScript Promises",
          description: "Understanding asynchronous programming",
          duration: "15 min",
          progress: 80,
          totalLessons: 5,
          lastAccessed: "2025-04-22T09:30:00.000Z",
        },
        {
          id: 3,
          title: "CSS Grid Layout",
          description: "Modern web layouts with CSS Grid",
          duration: "10 min",
          progress: 100,
          totalLessons: 4,
          lastAccessed: "2025-04-18T08:00:00.000Z",
        },
      ])
    }

    checkAuth()
    fetchSessions()
  }, [router])

  const filteredAndSortedSessions = useMemo(() => {
    const filtered = sessions.filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  
    const [key, direction] = sortOption.split("_")
  
    filtered.sort((a, b) => {
      if (key === "lastAccessed") {
        const dateA = new Date(a.lastAccessed).getTime()
        const dateB = new Date(b.lastAccessed).getTime()
        return direction === "asc" ? dateA - dateB : dateB - dateA
      } else {
        const valA = a[key as keyof QuickLearnSession] as number
        const valB = b[key as keyof QuickLearnSession] as number
        return direction === "asc" ? valA - valB : valB - valA
      }
    })
  
    return filtered
  }, [sessions, searchTerm, sortOption])  

  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display glow-text-pink mb-1">Quick Learn</h1>
              <p className="text-muted-foreground">Fast, focused learning on specific topics</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sessions..."
                  className="w-[250px] pl-8 rounded-lg border-border/40 bg-muted/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[["progress", "Progress"], ["lessons", "Lessons"], ["lastAccessed", "Last Accessed"]].map(
                    ([key, label]) => (
                      <div key={key}>
                        <DropdownMenuItem onClick={() => setSortOption(`${key}_asc` as SortOption)}>
                          {label} ↑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortOption(`${key}_desc` as SortOption)}>
                          {label} ↓
                        </DropdownMenuItem>
                      </div>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
                <Link href="/quick-learn/create">
                  <Zap className="mr-2 h-4 w-4" />
                  New Session
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedSessions.map((session) => (
              <Card key={session.id} className="border-border/50 card-hover group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-xs text-secondary mb-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Quick Learn</span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-secondary transition-colors truncate">
                    {session.title}
                  </CardTitle>
                  <CardDescription className="mt-1.5 line-clamp-2">{session.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{session.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDistanceToNowStrict(parseISO(session.lastAccessed), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className="text-secondary font-medium">{session.progress}%</span>
                      </div>
                      <Progress value={session.progress} className="h-2 bg-secondary/10 [&>div]:bg-secondary" />
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{session.totalLessons} lessons</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button className="glow-button-pink bg-secondary hover:bg-secondary/90 w-full" asChild>
                    <Link href={`/quick-learn/${session.id}`}>Continue</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
            <CardContent className="flex flex-col items-center justify-center h-full py-10">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Quick Learn</h3>
              <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
                Create a focused single-topic lesson in minutes
              </p>
              <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
                <Link href="/quick-learn/create">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Quick Learn
                </Link>
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </AppShell>
    </div>
  )
}