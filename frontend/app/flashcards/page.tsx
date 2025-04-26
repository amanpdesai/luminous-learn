"use client"

import { useCallback, useMemo, useState, useEffect  } from "react"
import { supabase } from "@/lib/supabaseClient"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Calendar, ExternalLink, Filter, Layers, Plus, Search, Sparkles, Zap } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNowStrict } from "date-fns"

export default function FlashcardsPage() {
  const router = useRouter()
  const [tab, setTab] = useState("courses")

  const [courseSets, setCourseSets] = useState<FlashcardSet[]>([])
  const [quickLearnSets, setQuickLearnSets] = useState<FlashcardSet[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingQuickLearns, setLoadingQuickLearns] = useState(true)

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth")
          return
        }
        const token = session.access_token
  
        setLoadingCourses(true)
        const resCourses = await fetch("http://localhost:8080/api/flashcard_sets?type=course", {
          headers: { Authorization: `Bearer ${token}` },
        })
        let courseSetsData: FlashcardSet[] = await resCourses.json()
        console.log('Course API response:', courseSetsData)
        
        // Ensure we're only setting course type flashcards
        courseSetsData = (courseSetsData || []).filter((set): set is FlashcardSet => set.source_type === 'course').map((set) => ({
          ...set,
          flashcards: set.flashcards ?? []
        }))        
        console.log('Filtered course sets:', courseSetsData)
        setCourseSets(courseSetsData)
  
        setLoadingQuickLearns(true)
        const resQuickLearns = await fetch("http://localhost:8080/api/flashcard_sets?type=quick-learn", {
          headers: { Authorization: `Bearer ${token}` },
        })
        let quickLearnSetsData: FlashcardSet[] = await resQuickLearns.json()
        console.log('Quick Learn API response:', quickLearnSetsData)
        
        // Ensure we're only setting quick-learn type flashcards
        quickLearnSetsData = (quickLearnSetsData || []).filter((set): set is FlashcardSet => set.source_type === 'quick-learn').map((set) => ({
          ...set,
          flashcards: set.flashcards ?? []
        }))        
        console.log('Filtered quick-learn sets:', quickLearnSetsData)
        setQuickLearnSets(quickLearnSetsData)
  
      } catch (error) {
        console.error("Error fetching flashcard sets:", error)
      } finally {
        setLoadingCourses(false)
        setLoadingQuickLearns(false)
      }
    }
  
    fetchFlashcardSets()
  }, [router])  

  const [searchTerm, setSearchTerm] = useState("")
  type SortOption = "title_asc" | "title_desc" | "cards_asc" | "cards_desc" | "lastReviewed_asc" | "lastReviewed_desc"
  const [sortOption, setSortOption] = useState<SortOption>("title_asc")

  const sortAndFilterSets = useCallback(
    (sets: FlashcardSet[] = []) => {
      if (!sets || !Array.isArray(sets)) return []
  
      return [...sets]
        .filter((set) => set.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          const [key, dir] = sortOption.split("_")
  
          if (key === "cards") {
            const aCards = a.flashcards?.length || 0
            const bCards = b.flashcards?.length || 0
            return dir === "asc" ? aCards - bCards : bCards - aCards
          }
  
          if (key === "lastReviewed") {
            const dateA = new Date(a.last_accessed).getTime()
            const dateB = new Date(b.last_accessed).getTime()
            return dir === "asc" ? dateA - dateB : dateB - dateA
          }
  
          return dir === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title)
        })
    },
    [searchTerm, sortOption]
  )  

  const filteredCourses = useMemo(() => sortAndFilterSets(courseSets), [courseSets, sortAndFilterSets])
  const filteredQuickLearn = useMemo(() => sortAndFilterSets(quickLearnSets), [quickLearnSets, sortAndFilterSets])

  if (loadingCourses || loadingQuickLearns){
    return (<AppShell><DashboardLoading></DashboardLoading></AppShell>)
  }

  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display glow-text">Flashcards</h1>
              <p className="text-muted-foreground">Review and practice with your flashcard sets</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search flashcards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[250px] pl-8 rounded-lg border-border/40 bg-muted/40"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[
                    ["title", "Title"],
                    ["cards", "Cards"],
                    ["lastReviewed", "Last Reviewed"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <DropdownMenuItem onClick={() => setSortOption(`${key}_asc` as SortOption)}>
                        {label} ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption(`${key}_desc` as SortOption)}>
                        {label} ↓
                      </DropdownMenuItem>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className={tab === "courses" ? "glow-button w-full sm:w-auto" : "glow-button-pink w-full sm:w-auto"} variant={tab === "courses" ? "default" : "secondary"} onClick={() => router.push(`/flashcards/create?tab=${tab}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Flashcard Set
              </Button>
            </div>
          </div>

          <Tabs defaultValue="courses" onValueChange={setTab} className="space-y-6">
            <TabsList className="inline-flex justify-start items-center px-1 py-6 bg-card border border-border rounded-full mb-6 z-10 relative shadow-sm">
              <TabsTrigger value="courses" className="px-6 py-5 text-base font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-primary/60 data-[state=active]:shadow data-[state=active]:glow-text">
                Course Flashcards
              </TabsTrigger>
              <TabsTrigger value="quick-learn" className="px-6 py-5 text-base font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-secondary/60 data-[state=active]:shadow data-[state=active]:glow-text">
                Quick Learn Flashcards
              </TabsTrigger>
            </TabsList>

            {/* COURSES */}
            <TabsContent value="courses" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-300">
              {loadingCourses ? (
                <LoadingCards />
              ) : (
                <>
                  {filteredCourses.map((set) => (
                    <FlashcardCard key={set.id} set={set} type="course" />
                  ))}
                  <CreateNewSetCard type="course" />
                </>
              )}
            </TabsContent>

            {/* QUICK LEARN */}
            <TabsContent value="quick-learn" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-300">
              {loadingQuickLearns ? (
                <LoadingCards />
              ) : (
                <>
                  {filteredQuickLearn.map((set) => (
                    <FlashcardCard key={set.id} set={set} type="quick-learn" />
                  ))}
                  <CreateNewSetCard type="quick-learn" />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </div>
  )
}

type Flashcard = {
  front: string
  back: string
  trueorfalseq: {
    question: string
    answer: boolean
  }
  multiplechoice: {
    question: string
    choices: string[]
    correct_choice: string
  }
  freeresponse: {
    question: string
    answer: string
  }
  incorrect: number
  correct: number
}

type FlashcardSet = {
  id: string
  title: string
  flashcards: Flashcard[]
  last_accessed: string
  source_type: "course" | "quick-learn"
  still_learning_count: number
  still_studying_count: number
  mastered_count: number
}


function FlashcardCard({ set, type }: { set: FlashcardSet; type: "course" | "quick-learn" }) {
  const Icon = type === "course" ? Layers : Zap
  const color = type === "course" ? "primary" : "secondary"
  const href = `/flashcards/${type}/${set.id}`

  const cardCount = set.flashcards?.length ?? 0

  // ✨ New categorization based on each card's correct/incorrect
  let stillLearning = 0
  let stillStudying = 0
  let mastered = 0

  set.flashcards?.forEach((card) => {
    const correct = card.correct ?? 0
    const incorrect = card.incorrect ?? 0

    const totalAttempts = correct + incorrect

    if (totalAttempts === 0) {
      stillLearning += 1
    } else {
      const accuracy = correct / totalAttempts
      if (accuracy < 0.5) {
        stillLearning += 1
      } else if (accuracy < 0.85) {
        stillStudying += 1
      } else {
        if (correct >= 3) {
          mastered += 1
        } else {
          stillStudying += 1
        }
      }
    }
  })


  return (
    <Card className="border-border/50 card-hover group">
      <CardHeader className="pb-3">
        <div className={`flex items-center gap-2 text-xs text-${color} mb-1.5`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{type === "course" ? "Full Course" : "Quick Learn"}</span>
        </div>
        <CardTitle className={`text-lg group-hover:text-${color} transition-colors line-clamp-1`}>
          {set.title}
        </CardTitle>
        <CardDescription className="mt-1.5">
          Flashcard set for {type} material
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Cards and Last Reviewed */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{cardCount} cards</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {set.last_accessed ? (
                  (() => {
                    const localTime = new Date();
                    const accessedTime = new Date(set.last_accessed);

                    if (accessedTime > localTime) {
                      // It's in the future due to UTC drift, treat as "Just now"
                      return "Just now";
                    }

                    return formatDistanceToNowStrict(accessedTime, { addSuffix: true });
                  })()
                ) : "Just now"}
              </span>
            </div>
          </div>

          {/* Thin Progress Bars */}
          <div className="flex items-center gap-2 text-xs mt-2">
            {/* Red - Still Learning */}
            <div className="h-1.5 bg-red-500/30 rounded-full flex-1 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${cardCount ? (stillLearning / cardCount) * 100 : 0}%` }}
              />
            </div>

            {/* Amber - Still Studying */}
            <div className="h-1.5 bg-amber-500/30 rounded-full flex-1 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${cardCount ? (stillStudying / cardCount) * 100 : 0}%` }}
              />
            </div>

            {/* Green - Mastered */}
            <div className="h-1.5 bg-green-500/30 rounded-full flex-1 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${cardCount ? (mastered / cardCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button className={`w-full ${type === "quick-learn" ? "glow-button-pink bg-secondary hover:bg-secondary/90" : "glow-button"}`} asChild>
          <Link href={href}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Review Flashcards
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function LoadingCards() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-border/50 animate-pulse">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-2/3 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

function CreateNewSetCard({ type }: { type: "course" | "quick-learn" }) {
  const router = useRouter()
  const color = type === "course" ? "primary" : "secondary"
  return (
    <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
      <CardContent className="flex flex-col items-center justify-center h-full py-10">
        <div className={`h-14 w-14 rounded-full bg-${color}/10 flex items-center justify-center mb-4`}>
          <Plus className={`h-7 w-7 text-${color}`} />
        </div>
        <h3 className="text-lg font-medium mb-2">Create Flashcard Set</h3>
        <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
          {type === "course"
            ? "Generate flashcards from your course content"
            : "Generate flashcards from your quick learn session"}
        </p>
        <Button className={type === "course" ? "glow-button" : "glow-button-pink bg-secondary hover:bg-secondary/90"} onClick={() => router.push(`/flashcards/create?tab=${type === "course" ? "courses" : "quick-learn"}`)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Set
        </Button>
      </CardContent>
    </Card>
  )
}

function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-secondary">
        Loading your Flashcards...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}