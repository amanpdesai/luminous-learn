"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Zap } from "lucide-react"
import Link from "next/link"

export default function CreateFlashcardsPage() {
  const router = useRouter()
  const [selectedContext, setSelectedContext] = useState<number | null>(null)
  const [cardCount, setCardCount] = useState(15)
  const [difficulty, setDifficulty] = useState("intermediate")
  const [learningGoal, setLearningGoal] = useState("deep-understanding")
  const [isGenerating, setIsGenerating] = useState(false)
  const [tab, setTab] = useState("courses")

  const courses = [
    { id: 1, title: "Introduction to Python Programming", progress: 75, lastAccessed: "2 days ago" },
    { id: 2, title: "Web Development Fundamentals", progress: 42, lastAccessed: "Yesterday" },
    { id: 3, title: "Data Science Essentials", progress: 28, lastAccessed: "1 week ago" },
    { id: 4, title: "Machine Learning Basics", progress: 15, lastAccessed: "3 days ago" },
  ]

  const quickLearnSessions = [
    { id: 1, title: "JavaScript Promises", progress: 60, lastAccessed: "3 days ago" },
    { id: 2, title: "CSS Grid Layout", progress: 45, lastAccessed: "5 days ago" },
    { id: 3, title: "React Hooks", progress: 70, lastAccessed: "Yesterday" },
    { id: 4, title: "Python List Comprehensions", progress: 80, lastAccessed: "4 days ago" },
  ]

  const handleGenerateFlashcards = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const type = tab === "courses" ? "course" : "quick-learn"
      router.push(`/flashcards/${type}/${selectedContext}/edit`)
    }, 1500)
  }

  const data = tab === "courses" ? courses : quickLearnSessions

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
            <Tabs defaultValue="courses" onValueChange={setTab} className="space-y-6">
              <TabsList className="inline-flex justify-start items-center px-1 py-5 bg-card border border-border rounded-full shadow-sm w-full max-w-lg mb-2">
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

              <TabsContent value={tab} className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium mb-4">Select a source</h2>
                  <div className="overflow-x-auto hide-scrollbar">
                    <div className="flex gap-6 pb-2 min-w-fit">
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
                            className={`min-w-[280px] sm:min-w-[320px] max-w-[320px] border-border/50 cursor-pointer transition-all hover:border-border/70 ${borderColor}`}
                            onClick={() => setSelectedContext(item.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                                  {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="text-xs text-muted-foreground">{item.progress}% complete</div>
                                    <div className="text-xs text-muted-foreground">{item.lastAccessed}</div>
                                  </div>
                                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${isCourse ? "bg-primary" : "bg-secondary"}`}
                                      style={{ width: `${item.progress}%` }}
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
                    />
                    <div className="flex justify-between text-xs text-muted-foreground"><span>5</span><span>50</span></div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Difficulty level</label>
                    <div className="flex gap-3">
                      {["beginner", "intermediate", "advanced"].map((level) => (
                        <Button
                          key={level}
                          variant={difficulty === level ? "default" : "outline"}
                          className={difficulty === level ? "glow-button" : ""}
                          onClick={() => setDifficulty(level)}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
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
                          variant={learningGoal === goal ? "default" : "outline"}
                          className={learningGoal === goal ? "glow-button" : ""}
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
            className="glow-button"
            disabled={!selectedContext || isGenerating}
            onClick={handleGenerateFlashcards}
          >
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .glow-border {
          box-shadow: 0 0 10px 1px rgba(124, 58, 237, 0.2);
        }
        .glow-border-pink {
          box-shadow: 0 0 10px 1px rgba(236, 72, 153, 0.2);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AppShell>
  )
}