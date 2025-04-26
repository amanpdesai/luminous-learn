"use client"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Check, Edit, Layers, Zap } from "lucide-react"
import Link from "next/link"

export default function FlashcardSetPage() {
  const params = useParams() as { type: string; id: string } ;
  const { type, id } = params
  const router = useRouter()

  // Determine if this is a course or quick learn flashcard set
  const isCourse = params.type === "course"

  // Get title based on type and ID
  const getTitle = () => {
    if (isCourse) {
      return params.id === "1"
        ? "Introduction to Python Programming"
        : params.id === "2"
          ? "Web Development Fundamentals"
          : "Data Science Essentials"
    } else {
      return params.id === "1"
        ? "JavaScript Promises"
        : params.id === "2"
          ? "CSS Grid Layout"
          : params.id === "3"
            ? "React Hooks"
            : "Python List Comprehensions"
    }
  }

  const title = getTitle()

  // Mock progress data
  const progressData = {
    stillLearning: 2,
    stillStudying: 1,
    mastered: 2,
    total: 5,
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-display glow-text">{title}</h1>
              <p className="text-muted-foreground mt-1">Created on April 24, 2025</p>
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

          <div className="grid gap-4 md:grid-cols-3">
            <Button
              className="h-auto py-6 glow-button flex flex-col items-center justify-center gap-2"
              onClick={() => router.push(`/flashcards/${params.type}/${params.id}/flashcards`)}
            >
              <Layers className="h-6 w-6 mb-1" />
              <span className="text-lg font-medium">Flashcards</span>
              <span className="text-xs font-normal opacity-80">Review cards one by one</span>
            </Button>

            <Button
              className="h-auto py-6 glow-button flex flex-col items-center justify-center gap-2"
              onClick={() => router.push(`/flashcards/${params.type}/${params.id}/learn`)}
            >
              <BookOpen className="h-6 w-6 mb-1" />
              <span className="text-lg font-medium">Learn</span>
              <span className="text-xs font-normal opacity-80">Adaptive learning session</span>
            </Button>

            <Button
              className="h-auto py-6 glow-button flex flex-col items-center justify-center gap-2"
              onClick={() => router.push(`/flashcards/${params.type}/${params.id}/test`)}
            >
              <Zap className="h-6 w-6 mb-1" />
              <span className="text-lg font-medium">Test</span>
              <span className="text-xs font-normal opacity-80">Quiz yourself on the material</span>
            </Button>
          </div>

          <Card className="border-border/50">
            <CardContent className="space-y-8">
              <h2 className="text-lg font-medium mb-4">Set Stats</h2>
              {/* Stats Row */}
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
                    3
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Learns Completed</div>
                </div>

                <div className="p-4 bg-muted/30 rounded-md">
                  <div className="flex items-center justify-center gap-2 text-green-500 text-lg font-semibold">
                    <Check className="h-5 w-5" />
                    80%
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
          <Card className="border-border/50">
            <CardContent className="space-y-4">
              <h2 className="text-lg font-medium mb-4">Terms in this Set ({progressData.total})</h2>
              
              {/* Replace with dynamic list later */}
              {[
                { term: "Design", definition: "making useful and usable things for people" },
                { term: "Interface", definition: "user-facing layer that allows them to interact with computers, allow people to accomplish tasks" },
                { term: "Is the user always right?", definition: "No" },
                { term: "Design as a process", definition: "1. Needfinding (observing people, understanding problem, defining constraints)\n2. Ideating (creating list of solutions)\n3. Prototyping (low-fi, digital, app)\n4. Testing (user evaluations)" },
                { term: "Design principles", definition: "10 Principles of Good Design (Dieter Rams), 8 Golden Rules of Interface Design (Ben Schneiderman), 10 Usability Heuristics for UI Design (Norman Nielsen Group)" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border border-border rounded-md bg-muted/40 p-4"
                >
                  {/* Front (term) */}
                  <div className="sm:w-1/3 font-medium text-sm text-muted-foreground">
                    {item.term}
                  </div>

                  {/* Separator */}
                  <div className="hidden sm:block w-px bg-border h-full" />

                  {/* Back (definition) */}
                  <div className="sm:w-2/3 text-foreground text-sm whitespace-pre-line">
                    {item.definition}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}