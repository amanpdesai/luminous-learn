"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Check, Edit, Layers, Sparkles, Zap } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { format } from "date-fns"
import { backendUrl } from "@/lib/backendUrl"

// Types
interface Flashcard {
  id: string
  front: string
  back: string
  correct: number
  incorrect: number
}

interface FlashcardSet {
  id: string
  title: string
  created_at: string
  sessions_completed: number
  last_test_score: number
  flashcards: {
    flashcards: Flashcard[]
  } | null
}

interface FetchFlashcardSetResponse {
  flashcard_set: FlashcardSet
}

export default function FlashcardSetPage() {
  const [pageLoading, setPageLoading] = useState(true)
  const params = useParams() as { type: string; id: string }
  const router = useRouter()
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null)

  const isCourse = params.type === "course"

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          console.error("[No active session]")
          router.push("/auth") // or wherever your login page is
          return
        }

        const token = session.access_token

        const url = `${backendUrl}/api/flashcards/${params.type}/${params.id}`
        console.log("Fetching flashcards:", url)

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch flashcards. Status: ${res.status}`)
        }

        const data: FetchFlashcardSetResponse = await res.json()

        Promise.all([
          setFlashcards(data.flashcard_set.flashcards?.flashcards || []),
          setFlashcardSet(data.flashcard_set)
        ]).finally(() => setPageLoading(false));
      } catch (err) {
        console.error("[Error fetching flashcards]", err)
      }
    }

    fetchFlashcards()
  }, [params.type, params.id, router])
  
  let stillLearning = 0
  let stillStudying = 0
  let mastered = 0

  flashcards.forEach((card) => {
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

const progressData = {
  stillLearning,
  stillStudying,
  mastered,
  total: flashcards.length,
}


  if (pageLoading) {
    return (
      <AppShell>
        <DashboardLoading/>
      </AppShell>
    )
  }  

  return (
    <AppShell>
      <div className="space-y-10 max-w-5xl mx-auto mb-20 px-6 w-full"> 
        <div className="mb-6 mt-12">
          <Link
            href="/flashcards"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flashcards
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary mb-2">
                {isCourse ? (
                  <>
                    <BookOpen className="h-4 w-4" />
                    <span>Course Flashcards</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-secondary" />
                    <span className="text-secondary">Quick Learn Flashcards</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-display glow-text">{flashcardSet?.title}</h1>
              <p className="text-muted-foreground mt-1">
                Created on {flashcardSet?.created_at ? format(new Date(flashcardSet.created_at), "PPP") : "Unknown"}
              </p>
            </div>

            <Button
              variant="outline"
              className="gap-2 md:self-start"
              onClick={() => router.push(`/flashcards/${params.type}/${params.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
              Edit Set
            </Button>
          </div>

          {/* 3 Main Action Buttons */}
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              className={`h-auto py-6 glow-button${isCourse ? "" : "-pink"} flex flex-col items-center justify-center gap-2`}
              variant={isCourse ? "default" : "secondary"}
              onClick={() => router.push(`/flashcards/${params.type}/${params.id}/flashcards`)}
            >
              <Layers className="h-6 w-6 mb-1" />
              <span className="text-lg font-medium">Flashcards</span>
              <span className="text-xs font-normal opacity-80">Review cards one by one</span>
            </Button>

            <Button
              className={`h-auto py-6 glow-button${isCourse ? "" : "-pink"} flex flex-col items-center justify-center gap-2`}
              variant={isCourse ? "default" : "secondary"}
              onClick={() => router.push(`/flashcards/${params.type}/${params.id}/learn`)}
            >
              <BookOpen className="h-6 w-6 mb-1" />
              <span className="text-lg font-medium">Learn</span>
              <span className="text-xs font-normal opacity-80">Adaptive learning session</span>
            </Button>

            <Button
              className={`h-auto py-6 glow-button${isCourse ? "" : "-pink"} flex flex-col items-center justify-center gap-2`}
              variant={isCourse ? "default" : "secondary"}
              onClick={() => router.push(`/flashcards/${params.type}/${params.id}/test`)}
            >
              <Zap className="h-6 w-6 mb-1" />
              <span className="text-lg font-medium">Test</span>
              <span className="text-xs font-normal opacity-80">Quiz yourself on the material</span>
            </Button>
          </div>

          {/* Set Stats */}
          <Card className="border-border/50 w-full">
            <CardContent className="space-y-8">
              <h2 className="text-lg font-medium mb-4">Set Stats</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/30 rounded-md">
                  <div className="flex items-center justify-center gap-2 text-foreground text-lg font-semibold">
                    <Layers className="h-5 w-5" />
                    {progressData.total}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Total Flashcards</div>
                </div>

                <div className="p-4 bg-muted/30 rounded-md">
                  <div className="flex items-center justify-center gap-2 text-blue-500 text-lg font-semibold">
                    <BookOpen className="h-5 w-5" />
                    {flashcardSet?.sessions_completed ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Learns Completed</div>
                </div>

                <div className="p-4 bg-muted/30 rounded-md">
                  <div className="flex items-center justify-center gap-2 text-green-500 text-lg font-semibold">
                    <Check className="h-5 w-5" />
                    {flashcardSet?.last_test_score ?? 0}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Last Test Score</div>
                </div>
              </div>

              <h2 className="text-lg font-medium mb-4">Progress Breakdown</h2>

              {/* Progress Bars */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Still Learning</span>
                    <span>{progressData.stillLearning} cards</span>
                  </div>
                  <Progress
                    value={(progressData.stillLearning / progressData.total) * 100}
                    className="h-2 [&>div]:bg-destructive bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Still Studying</span>
                    <span>{progressData.stillStudying} cards</span>
                  </div>
                  <Progress
                    value={(progressData.stillStudying / progressData.total) * 100}
                    className="h-2 [&>div]:bg-amber-500 bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mastered</span>
                    <span>{progressData.mastered} cards</span>
                  </div>
                  <Progress
                    value={(progressData.mastered / progressData.total) * 100}
                    className="h-2 [&>div]:bg-green-500 bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms in this Set */}
          <Card className="border-border/50 w-full">
            <CardContent className="space-y-4">
              <h2 className="text-lg font-medium mb-4">Terms in this Set ({flashcards.length})</h2>

              {Array.isArray(flashcards) && flashcards.length > 0 ? (
                flashcards.map((card, index) => (
                  <div
                    key={card.id || index}
                    className="flex flex-col md:flex-row md:items-stretch md:justify-start gap-6 border border-border rounded-lg bg-muted/30 p-6"
                  >
                    <div className="flex-1 pr-6 border-r border-border">
                      <div className="font-semibold text-foreground text-base whitespace-pre-line">
                        {card.front}
                      </div>
                    </div>
                    <div className="flex-1 pl-6">
                      <div className="text-foreground text-base whitespace-pre-line">
                        {card.back}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No flashcards created yet.</p>
              )}
            </CardContent>
          </Card>
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
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-primary">
        Loading your Flashcard Set...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}