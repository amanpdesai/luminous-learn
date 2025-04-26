"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, ExternalLink, Layers, Plus, Search, Zap } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"

export default function FlashcardsPage() {
  const router = useRouter()

  // Mock flashcard sets data
  const courseSets = [
    {
      id: 1,
      title: "Introduction to Python Programming",
      cardCount: 42,
      lastReviewed: "2 days ago",
      courseType: "Full Course",
      progress: {
        stillLearning: 10,
        stillStudying: 12,
        mastered: 20,
      },
    },
    {
      id: 2,
      title: "Web Development Fundamentals",
      cardCount: 36,
      lastReviewed: "Yesterday",
      courseType: "Full Course",
      progress: {
        stillLearning: 5,
        stillStudying: 15,
        mastered: 16,
      },
    },
    {
      id: 3,
      title: "Data Science Essentials",
      cardCount: 28,
      lastReviewed: "1 week ago",
      courseType: "Full Course",
      progress: {
        stillLearning: 8,
        stillStudying: 10,
        mastered: 10,
      },
    },
  ]

  const quickLearnSets = [
    {
      id: 1,
      title: "JavaScript Promises",
      cardCount: 12,
      lastReviewed: "3 days ago",
      duration: "15 min",
      progress: {
        stillLearning: 3,
        stillStudying: 4,
        mastered: 5,
      },
    },
    {
      id: 2,
      title: "CSS Grid Layout",
      cardCount: 8,
      lastReviewed: "5 days ago",
      duration: "10 min",
      progress: {
        stillLearning: 2,
        stillStudying: 3,
        mastered: 3,
      },
    },
    {
      id: 3,
      title: "React Hooks",
      cardCount: 15,
      lastReviewed: "Yesterday",
      duration: "20 min",
      progress: {
        stillLearning: 4,
        stillStudying: 6,
        mastered: 5,
      },
    },
    {
      id: 4,
      title: "Python List Comprehensions",
      cardCount: 6,
      lastReviewed: "4 days ago",
      duration: "8 min",
      progress: {
        stillLearning: 1,
        stillStudying: 2,
        mastered: 3,
      },
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<"title_asc" | "title_desc" | "cards_asc" | "cards_desc">("title_asc")

  const filteredAndSortedCourseSets = useMemo(() => {
    return [...courseSets]
      .filter((set) => set.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const [key, dir] = sortOption.split("_")
        if (key === "cards") {
          return dir === "asc" ? a.cardCount - b.cardCount : b.cardCount - a.cardCount
        }
        return dir === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      })
  }, [searchTerm, sortOption, courseSets])

  const filteredAndSortedQuickLearnSets = useMemo(() => {
    return [...quickLearnSets]
      .filter((set) => set.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const [key, dir] = sortOption.split("_")
        if (key === "cards") {
          return dir === "asc" ? a.cardCount - b.cardCount : b.cardCount - a.cardCount
        }
        return dir === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      })
  }, [searchTerm, sortOption, quickLearnSets])

  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display glow-text">Flashcards</h1>
              <p className="text-muted-foreground">Review and practice with your flashcard sets</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search flashcards..."
                  className="w-[250px] pl-8 rounded-lg border-border/40 bg-muted/40"
                />
              </div>
              <Button className="glow-button w-full sm:w-auto" onClick={() => router.push("/flashcards/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Flashcard Set
              </Button>
            </div>
          </div>

          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList className="inline-flex justify-start items-center px-1 py-6 bg-card border border-border rounded-full mb-6 z-10 relative shadow-sm">
              <TabsTrigger
                value="courses"
                className="px-6 py-5 text-base font-medium rounded-full transition-all
                text-muted-foreground hover:text-foreground
                data-[state=active]:text-white
                data-[state=active]:bg-primary/60
                data-[state=active]:shadow
                data-[state=active]:glow-text"
              >
                Course Flashcards
              </TabsTrigger>
              <TabsTrigger
                value="quick-learn"
                className="px-6 py-5 text-base font-medium rounded-full transition-all
                text-muted-foreground hover:text-foreground
                data-[state=active]:text-white
                data-[state=active]:bg-secondary/60
                data-[state=active]:shadow
                data-[state=active]:glow-text"
              >
                Quick Learn Flashcards
              </TabsTrigger>
            </TabsList>
            <TabsContent value="courses" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courseSets.map((set) => (
                  <Card key={set.id} className="border-border/50 card-hover group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{set.courseType}</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {set.title}
                      </CardTitle>
                      <CardDescription className="mt-1.5">Flashcard set for course material</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{set.cardCount} cards</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{set.lastReviewed}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-1.5 bg-red-500/30 rounded-full flex-1">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${(set.progress.stillLearning / set.cardCount) * 100}%` }}
                            />
                          </div>
                          <div className="h-1.5 bg-amber-500/30 rounded-full flex-1">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${(set.progress.stillStudying / set.cardCount) * 100}%` }}
                            />
                          </div>
                          <div className="h-1.5 bg-green-500/30 rounded-full flex-1">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(set.progress.mastered / set.cardCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3">
                      <Button className="w-full glow-button" asChild>
                        <Link href={`/flashcards/course/${set.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Review Flashcards
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
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
                    <Button className="glow-button" onClick={() => router.push("/flashcards/create")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Set
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quick-learn" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quickLearnSets.map((set) => (
                  <Card key={set.id} className="border-border/50 card-hover group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 text-xs text-secondary mb-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        <span>Quick Learn</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-secondary transition-colors line-clamp-1">
                        {set.title}
                      </CardTitle>
                      <CardDescription className="mt-1.5">Flashcard set for quick session</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{set.cardCount} cards</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{set.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-1.5 bg-red-500/30 rounded-full flex-1">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${(set.progress.stillLearning / set.cardCount) * 100}%` }}
                            />
                          </div>
                          <div className="h-1.5 bg-amber-500/30 rounded-full flex-1">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${(set.progress.stillStudying / set.cardCount) * 100}%` }}
                            />
                          </div>
                          <div className="h-1.5 bg-green-500/30 rounded-full flex-1">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(set.progress.mastered / set.cardCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3">
                      <Button className="w-full glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
                        <Link href={`/flashcards/quick-learn/${set.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Review Flashcards
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
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
                      onClick={() => router.push("/flashcards/create")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Set
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </div>
  )
}