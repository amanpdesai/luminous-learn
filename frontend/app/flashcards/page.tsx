"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Calendar, ExternalLink, Filter, Layers, Plus, Search, Zap } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNowStrict, parseISO } from "date-fns"

export default function FlashcardsPage() {
  const router = useRouter()
  const [tab, setTab] = useState("courses")

  const courseSets = useMemo(() => [
    {
      id: 1,
      title: "Introduction to Python Programming",
      cardCount: 42,
      lastReviewed: "2025-04-23T02:29:56.254Z",
      courseType: "Full Course",
      progress: { stillLearning: 10, stillStudying: 12, mastered: 20 },
    },
    {
      id: 2,
      title: "Web Development Fundamentals",
      cardCount: 36,
      lastReviewed: "2025-04-24T02:29:56.254Z",
      courseType: "Full Course",
      progress: { stillLearning: 5, stillStudying: 15, mastered: 16 },
    },
    {
      id: 3,
      title: "Data Science Essentials",
      cardCount: 28,
      lastReviewed: "2025-04-18T02:29:56.254Z",
      courseType: "Full Course",
      progress: { stillLearning: 8, stillStudying: 10, mastered: 10 },
    },
  ], [])
  
  const quickLearnSets = useMemo(() => [
    {
      id: 1,
      title: "JavaScript Promises",
      cardCount: 12,
      lastReviewed: "2025-04-22T02:29:56.254Z",
      duration: "15 min",
      progress: { stillLearning: 3, stillStudying: 4, mastered: 5 },
    },
    {
      id: 2,
      title: "CSS Grid Layout",
      cardCount: 8,
      lastReviewed: "2025-04-20T02:29:56.254Z",
      duration: "10 min",
      progress: { stillLearning: 2, stillStudying: 3, mastered: 3 },
    },
    {
      id: 3,
      title: "React Hooks",
      cardCount: 15,
      lastReviewed: "2025-04-24T02:29:56.254Z",
      duration: "20 min",
      progress: { stillLearning: 4, stillStudying: 6, mastered: 5 },
    },
    {
      id: 4,
      title: "Python List Comprehensions",
      cardCount: 6,
      lastReviewed: "2025-04-21T02:29:56.254Z",
      duration: "8 min",
      progress: { stillLearning: 1, stillStudying: 2, mastered: 3 },
    },
  ], [])  

  const [searchTerm, setSearchTerm] = useState("")
  type SortOption = "title_asc" | "title_desc" | "cards_asc" | "cards_desc" | "lastReviewed_asc" | "lastReviewed_desc"
  const [sortOption, setSortOption] = useState<SortOption>("title_asc")

  const sortAndFilterSets = useCallback(
    (sets: typeof courseSets | typeof quickLearnSets) => {
      return [...sets]
        .filter((set) => set.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          const [key, dir] = sortOption.split("_")
          if (key === "cards") {
            return dir === "asc" ? a.cardCount - b.cardCount : b.cardCount - a.cardCount
          }
          if (key === "lastReviewed") {
            const dateA = new Date(a.lastReviewed).getTime()
            const dateB = new Date(b.lastReviewed).getTime()
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
              <TabsTrigger value="courses" className="px-6 py-5 text-base font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-primary/60 data-[state=active]:shadow data-[state=active]:glow-text">Course Flashcards</TabsTrigger>
              <TabsTrigger value="quick-learn" className="px-6 py-5 text-base font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-secondary/60 data-[state=active]:shadow data-[state=active]:glow-text">Quick Learn Flashcards</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-300">
              {filteredCourses.map((set) => (
                <FlashcardCard key={set.id} set={set} type="course" />
              ))}
              <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
                <CardContent className="flex flex-col items-center justify-center h-full py-10">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Create Flashcard Set</h3>
                  <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
                    Generate flashcards from your courses to help with memorization
                  </p>
                  <Button className="glow-button" onClick={() => router.push(`/flashcards/create?tab=${tab}`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Set
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quick-learn" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-300">
              {filteredQuickLearn.map((set) => (
                <FlashcardCard key={set.id} set={set} type="quick-learn" />
              ))}
              <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
                <CardContent className="flex flex-col items-center justify-center h-full py-10">
                  <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Plus className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Create Quick Learn Set</h3>
                  <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
                    Generate flashcards from your quick learn sessions
                  </p>
                  <Button
                    className="glow-button-pink bg-secondary hover:bg-secondary/90"
                    onClick={() => router.push(`/flashcards/create?tab=${tab}`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Set
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </div>
  )
}

type FlashcardSet = {
  id: number
  title: string
  cardCount: number
  lastReviewed: string
  courseType?: string
  duration?: string
  progress: {
    stillLearning: number
    stillStudying: number
    mastered: number
  }
}

function FlashcardCard({ set, type }: { set: FlashcardSet; type: "course" | "quick-learn" }) {
  const Icon = type === "course" ? Layers : Zap
  const color = type === "course" ? "primary" : "secondary"
  const href = `/flashcards/${type}/${set.id}`

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
        <CardDescription className="mt-1.5">Flashcard set for {type} material</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{set.cardCount} cards</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              {<Calendar />}
              <span className="text-muted-foreground">{formatDistanceToNowStrict(parseISO(set.lastReviewed), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
          {["red", "amber", "green"].map((color, i) => {
            const val = Object.values(set.progress)[i] as number
            return (
              <div key={color} className={`h-1.5 bg-${color}-500/30 rounded-full flex-1`}>
                <div
                  className={`h-full bg-${color}-500 rounded-full`}
                  style={{ width: `${(val / set.cardCount) * 100}%` }}
                />
              </div>
            )
          })}
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