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
  Sparkles,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"
import { backendUrl } from "@/lib/backendUrl"

type QuickLearnSession = {
  id: string
  title: string
  description?: string
  topic: string
  difficulty: string
  createdAt: string
  lastAccessed?: string
  estimated_duration_minutes?: number
  sections: Array<{ id: string; title: string }>  // sections are required now
  completed: number                               // added completed field
}

type SortOption =
  | "progress_asc"
  | "progress_desc"
  | "lessons_asc"
  | "lessons_desc"
  | "lastAccessed_asc"
  | "lastAccessed_desc"

export default function QuickLearnPage() {
  const [pageLoading, setPageLoading] = useState(true)
  const [sessions, setSessions] = useState<QuickLearnSession[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("lastAccessed_desc")
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth")
          return false
        }
        return session
      } catch (err) {
        console.error('Authentication error:', err)
        router.push("/auth")
        return false
      }
    }

    const fetchSessions = async () => {
      setLoading(true)
      setError(null)
    
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth")
          return
        }
    
        const token = session.access_token
    
        const response = await fetch(`${backendUrl}/api/quick_learns`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
    
        if (!response.ok) {
          throw new Error(`Error fetching quick learn sessions: ${response.statusText}`)
        }
    
        const data = await response.json()
    
        if (Array.isArray(data)) {
          setSessions(
            data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description || "",
              topic: item.topic,
              difficulty: item.difficulty,
              createdAt: item.created_at || new Date().toISOString(),
              lastAccessed: item.last_accessed || item.created_at || new Date().toISOString(),
              estimated_duration_minutes: item.estimated_duration_minutes || 0,
              sections: item.sections || [],
              completed: item.completed || 0,
            }))
          )
        } else {
          console.error('Unexpected data format:', data)
          setSessions([])
        }
      } catch (err) {
        console.error('Error fetching quick learn sessions:', err)
        setError('Failed to load quick learn sessions')
        setSessions([])
      } finally {
        setLoading(false)
      }
    }    
    checkAuth()
    Promise.all([
    fetchSessions()
    ]).finally(() => setPageLoading(false));
  }, [router])

  const filteredAndSortedSessions = useMemo(() => {
    const filtered = sessions.filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.topic.toLowerCase().includes(searchTerm.toLowerCase())
    )
  
    const [key, direction] = sortOption.split("_")
  
    filtered.sort((a, b) => {
      if (key === "lastAccessed" || key === "createdAt") {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return direction === "asc" ? dateA - dateB : dateB - dateA
      } else if (key === "lessons") {
        const valA = a.sections?.length || 0
        const valB = b.sections?.length || 0
        return direction === "asc" ? valA - valB : valB - valA  
      } else {
        // Default sort by creation date if other fields don't exist
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return direction === "asc" ? dateA - dateB : dateB - dateA
      }
    })
  
    return filtered
  }, [sessions, searchTerm, sortOption])  

  console.log(filteredAndSortedSessions)

  if (pageLoading){
    return (<AppShell><DashboardLoading></DashboardLoading></AppShell>)
  }

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
                  {[["lessons", "Sections"], ["createdAt", "Created"]].map(
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
            {/* Create Quick Learn Card - Always visible */}
            {loading ? (
              // Loading placeholders
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="border-border/50 card-hover group animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 w-24 bg-muted rounded mb-1.5"></div>
                    <div className="h-6 w-5/6 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-4 w-24 bg-muted rounded ml-auto"></div>
                      </div>
                      <div className="h-4 w-32 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3">
                    <div className="h-10 w-full bg-muted rounded"></div>
                  </CardFooter>
                </Card>
              ))
            ) : error ? (
              // Error state
              <Card className="border-border/50 border-dashed bg-muted/50 col-span-2">
                <CardContent className="flex flex-col items-center justify-center h-full py-10">
                  <p className="text-sm text-muted-foreground text-center mb-5">
                    {error}
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAndSortedSessions.map((session) => (
                <Card key={session.id} className="border-border/50 card-hover group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-xs text-secondary mb-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      <span>{session.difficulty} Level</span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-secondary transition-colors truncate">
                      {session.title}
                    </CardTitle>
                    <CardDescription className="mt-1.5 line-clamp-2">
                      {session.description || session.topic}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {session.estimated_duration_minutes ? `${session.estimated_duration_minutes} min` : 'Quick session'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDistanceToNowStrict(parseISO(session.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{session.sections?.length || 0} sections</span>
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

function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10">
        <Sparkles className="h-10 w-10 text-secondary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-secondary">
        Loading your Quick Learns...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}