"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Sparkles, Zap } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { backendUrl } from "@/lib/backendUrl"

interface SourceItem {
  id: string
  title: string
  completed: number
  last_accessed: string
  unit_lessons?: { length: number }[]
}


export default function CreateFlashcardsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedContext, setSelectedContext] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(15)
  const [contentScope, setContentScope] = useState("All Lessons")
  const [learningGoal, setLearningGoal] = useState("deep-understanding")
  const [isGenerating, setIsGenerating] = useState(false)
  const [tab, setTab] = useState(searchParams.get("tab") || "courses")
  const [courses, setCourses] = useState<SourceItem[]>([])
  const [quickLearns, setQuickLearns] = useState<SourceItem[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingQuickLearns, setLoadingQuickLearns] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth")
          return
        }
        const token = session.access_token
  
        setLoadingCourses(true)
        const resCourses = await fetch(`${backendUrl}/api/get_user_courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const coursesData: SourceItem[] = await resCourses.json()
        setCourses(coursesData ?? [])

        setLoadingQuickLearns(true)
        
        const resQuickLearns = await fetch(`${backendUrl}/api/quick_learns`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const quickLearnsData: SourceItem[] = await resQuickLearns.json()
        setQuickLearns(quickLearnsData ?? [])
        
      } catch (error) {
        console.error("Error fetching:", error)
      } finally{
        setLoadingCourses(false)
        setLoadingQuickLearns(false)
      }
    }
  
    fetchData()
  }, [router])

  const handleGenerateFlashcards = async () => {
    if (!selectedContext) return
    setIsGenerating(true)
  
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
      const token = session.access_token

      console.log({
        source_type: tab === "courses" ? "course" : "quick-learn",
        source_id: selectedContext,
        card_count: cardCount,
        content_scope: contentScope,
        learning_goal: learningGoal,
      })
  
      const response = await fetch(`${backendUrl}/api/create_flashcard_set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          source_type: tab === "courses" ? "course" : "quick-learn",
          source_id: selectedContext,
          card_count: cardCount,
          content_scope: contentScope,
          learning_goal: learningGoal,
        }),
      })
  
      if (!response.ok) {
        console.error("Failed to create flashcards")
        return
      }
  
      const data = await response.json()
      const flashcardSetId = data.flashcard_set_id
  
      router.push(`/flashcards/${tab === "courses" ? "course" : "quick-learn"}/${flashcardSetId}`)
    } catch (error) {
      console.error("Error generating flashcards:", error)
    } finally {
      setIsGenerating(false)
    }
  }  

  const data = tab === "courses" ? courses : quickLearns
  
  if (loadingCourses || loadingQuickLearns){
    return (<AppShell><DashboardLoading></DashboardLoading></AppShell>)
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-32 overflow-x-hidden">
        <div className="mb-4">
          <Link href="/flashcards" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flashcards
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-display glow-text mb-2">Create Flashcards</h1>
          <p className="text-muted-foreground">Generate flashcards from your courses or quick learn sessions</p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 sm:p-8">
            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
              <TabsList className="flex w-full max-w-3xl mx-auto justify-center px-1 py-5 bg-card border border-border rounded-full shadow-sm mb-2">
                <TabsTrigger
                  value="courses"
                  className="px-6 py-4 text-sm font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-primary/60 data-[state=active]:shadow data-[state=active]:glow-text"
                >
                  Courses
                </TabsTrigger>
                <TabsTrigger
                  value="quick-learn"
                  className="px-6 py-4 text-sm font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-secondary/60 data-[state=active]:shadow data-[state=active]:glow-text"
                >
                  Quick Learn
                </TabsTrigger>
              </TabsList>

              <TabsContent value={tab} className="space-y-8 w-full">
                <div>
                  <h2 className="text-lg font-medium mb-4">Select a source</h2>
                    <div className="w-full">
                      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {data.map((item) => {
                        const isCourse = tab === "courses"
                        const isSelected = selectedContext === item.id
                        const icon = isCourse
                          ? <BookOpen className="h-5 w-5 text-primary" />
                          : <Zap className="h-5 w-5 text-secondary" />
                        const iconBg = isCourse ? "bg-primary/10" : "bg-secondary/10"
                        const borderColor = isSelected
                          ? isCourse
                            ? "border-primary glow-border"
                            : "border-secondary glow-border-pink"
                          : ""

                        return (
                          <Card
                            key={item.id}
                            className={`min-h-[160px] flex flex-col justify-between border-border/50 transition-all hover:shadow-md hover:border-primary/40 dark:hover:border-primary/60 ${
                              isSelected
                                ? isCourse
                                  ? "border-primary glow-border"
                                  : "border-secondary glow-border-pink"
                                : ""
                            }`}
                            onClick={() => setSelectedContext(item.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                                  {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                    <span>
                                      {(item.unit_lessons && item.unit_lessons.length > 0) 
                                        ? `${Math.round((item.completed / item.unit_lessons.length) * 100)}% complete`
                                        : "0% complete"}
                                    </span>
                                    <span>{new Date(item.last_accessed).toLocaleDateString()}</span>
                                  </div>
                                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${isCourse ? "bg-primary" : "bg-secondary"}`}
                                      style={{ width: `${(item.unit_lessons?.length || 0) > 0
                                        ? (item.completed / (item.unit_lessons?.length || 0)) * 100
                                        : 0}%` }}                                      
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {selectedContext !== null && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full w-fit border select-none 
                      border-border shadow-sm
                      bg-muted/50 text-muted-foreground">
                      {tab === "courses" ? (
                        <>
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          <span className="text-primary">Category: Course</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-secondary">Category: Quick Learn</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium block">Number of flashcards: {cardCount}</label>
                      <Slider
                        value={[cardCount]}
                        min={5}
                        max={50}
                        step={1}
                        onValueChange={(value) => setCardCount(value[0])}
                        className="w-full"
                        rangeClassName={tab === "courses" ? "bg-primary" : "bg-secondary"}
                        thumbClassName={tab === "courses" ? "border-primary" : "border-secondary"}
                      />
                    <div className="flex justify-between text-xs text-muted-foreground"><span>5</span><span>50</span></div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Content Scope</label>
                    <div className="flex gap-3">
                      {["All Lessons", "Completed Lessons"].map((scope) => (
                        <Button
                          key={scope}
                          variant={contentScope === scope ? (tab === "courses" ? "default" : "secondary") : "outline"}
                          className={contentScope === scope ? (tab === "courses" ? "glow-button" : "glow-button-pink") : ""}
                          onClick={() => setContentScope(scope)}
                        >
                          {scope}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Learning goal</label>
                    <div className="flex flex-wrap gap-3">
                      {["memorization", "deep-understanding", "rapid-review"].map((goal) => (
                        <Button
                          key={goal}
                          variant={learningGoal === goal ? (tab === "courses" ? "default" : "secondary") : "outline"}
                          className={learningGoal === goal ? (tab === "courses" ? "glow-button" : "glow-button-pink") : ""}
                          onClick={() => setLearningGoal(goal)}
                        >
                          {goal.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={() => router.push("/flashcards")}>Cancel</Button>
          <Button
            className={tab === "courses" ? "glow-button" : "glow-button-pink"}
            variant={tab === "courses" ? "default" : "secondary"}
            disabled={!selectedContext || isGenerating}
            onClick={handleGenerateFlashcards}
          >
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-secondary">
        Loading your Create page...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}