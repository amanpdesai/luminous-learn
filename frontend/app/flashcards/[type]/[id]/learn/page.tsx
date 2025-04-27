"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, Loader2, Sparkles, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type QuestionType = "multiple-choice" | "typed-response" | "true-false"

interface Flashcard {
  id: string
  multiplechoice: {
    question: string
    correct_choice: string
    choices: string[]
  }
  freeresponse: {
    question: string
    answer: string
  }
  trueorfalseq: {
    question: string
    answer: boolean
  }
}


interface Question {
  cardId: string
  type: QuestionType
  question: string
  answer: string
  options?: string[]
  userAnswer?: string
  isCorrect?: boolean
  isSkipped?: boolean
}

export default function LearnViewPage() {
  const [pageLoading, setPageLoading] = useState(true)
  const params = useParams() as { type: string; id: string }
  const { type, id } = params
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [userInput, setUserInput] = useState("")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, skipped: 0, total: 0 })

  function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5)
  }

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }

      const token = session.access_token

      try {
        const res = await fetch(`https://luminous-learn.onrender.com/api/flashcards/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to fetch flashcard set")

        const data = await res.json()

        const flashcards = data.flashcard_set?.flashcards?.flashcards || []

        const generated: Question[] = flashcards.map((card: Flashcard) => {
          const availableTypes = [
            { type: "multiple-choice" as QuestionType, available: !!card.multiplechoice?.question },
            { type: "typed-response" as QuestionType, available: !!card.freeresponse?.question },
            { type: "true-false" as QuestionType, available: !!card.trueorfalseq?.question },
          ].filter(t => t.available)

          if (availableTypes.length === 0) return null

          const picked = availableTypes[Math.floor(Math.random() * availableTypes.length)].type

          if (picked === "multiple-choice") {
            return {
              cardId: String(card.id),
              type: "multiple-choice",
              question: card.multiplechoice.question,
              answer: card.multiplechoice.correct_choice,
              options: card.multiplechoice.choices,
            }
          }
          if (picked === "true-false") {
            return {
              cardId: String(card.id),
              type: "true-false",
              question: card.trueorfalseq.question,
              answer: card.trueorfalseq.answer ? "True" : "False",
              options: ["True", "False"],
            }
          }
          return {
            cardId: String(card.id),
            type: "typed-response",
            question: card.freeresponse.question,
            answer: card.freeresponse.answer,
          }
        }).filter(Boolean) as Question[]

        setQuestions(shuffleArray(generated))
        setSessionStats({ correct: 0, incorrect: 0, skipped: 0, total: generated.length })
      } catch (error) {
        console.error("Error loading learn session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    Promise.all([
      fetchQuestions()
    ]).finally(() => setPageLoading(false));
    
  }, [id, type, router])

  const current = questions[currentQuestionIndex]

  const checkAnswer = () => {
    if (!current) return
    const updated = [...questions]
    const q = updated[currentQuestionIndex]
    let correct = false

    if (q.type === "multiple-choice" || q.type === "true-false") {
      correct = selectedOption === q.answer
      q.userAnswer = selectedOption || ""
    } else {
      correct = userInput.toLowerCase().includes(q.answer.toLowerCase().slice(0, 10))
      q.userAnswer = userInput
    }

    q.isCorrect = correct
    setIsCorrect(correct)
    setIsAnswered(true)
    setQuestions(updated)

    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1)
    }))
  }

  const updateFlashcardsInDatabase = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const token = session.access_token

    const cardUpdates = questions.reduce((acc, q) => {
      if (!q.cardId) return acc
      if (!acc[q.cardId]) acc[q.cardId] = { correct: 0, incorrect: 0 }

      if (q.isSkipped) return acc

      if (q.isCorrect) acc[q.cardId].correct += 1
      else acc[q.cardId].incorrect += 1

      return acc
    }, {} as Record<string, { correct: number; incorrect: number }>)

    console.log(cardUpdates)

    for (const [cardId, counts] of Object.entries(cardUpdates)) {
      await fetch(`https://luminous-learn.onrender.com/api/flashcards/update_card_progress/${type}/${id}/${cardId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(counts),
      })
    }

    await fetch(`https://luminous-learn.onrender.com/api/flashcards/update_flashcard_set_progress/${type}/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessions_completed_delta: 1,
        // optional: still_learning_count / still_studying_count / mastered_count later
      }),
    })
  }

  const skipQuestion = () => {
    const updated = [...questions]
    updated[currentQuestionIndex].isSkipped = true
    setQuestions(updated)
    setIsAnswered(true)
    setIsCorrect(false)
    setSessionStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }))
  }

  const markAsCorrect = () => {
    const updated = [...questions]
    updated[currentQuestionIndex].isCorrect = true
    setQuestions(updated)
    setIsCorrect(true)
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + 1,
      incorrect: prev.incorrect - 1
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1)
      setIsAnswered(false)
      setSelectedOption(null)
      setUserInput("")
    } else {
      setSessionComplete(true)
      updateFlashcardsInDatabase()
    }
  }

  if (pageLoading){
    return (<AppShell><DashboardLoading/></AppShell>)
  }

  return (
    <AppShell>
      <div className="space-y-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 pt-12 pb-24">
        <div className="mb-4">
          <Link href={`/flashcards/${type}/${id}`} className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Flashcards
          </Link>
        </div>

        <div className="space-y-6 w-full">
          <div>
            <h1 className="text-4xl font-display glow-text">Learn</h1>
            <p className="text-muted-foreground text-lg">Adaptive learning session</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading...</span>
            </div>
          ) : sessionComplete ? (
            <div className="flex flex-col items-center space-y-8 w-full">
              <h2 className="text-4xl font-display glow-text">Session Complete</h2>

              <Card className="w-full border-border/50">
                <CardContent className="p-6 space-y-8">
                  {/* Top counters */}
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-muted/30 rounded-md space-y-2">
                      <p className="text-3xl font-bold text-green-500">{sessionStats.correct}</p>
                      <p className="text-sm text-muted-foreground">Correct</p>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-700"
                          style={{ width: `${(sessionStats.correct / sessionStats.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-md space-y-2">
                      <p className="text-3xl font-bold text-red-500">{sessionStats.incorrect}</p>
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-700"
                          style={{ width: `${(sessionStats.incorrect / sessionStats.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-md space-y-2">
                      <p className="text-3xl font-bold text-yellow-400">{sessionStats.skipped}</p>
                      <p className="text-sm text-muted-foreground">Skipped</p>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-700"
                          style={{ width: `${(sessionStats.skipped / sessionStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Learning progress bars */}
                  <div className="space-y-6 mt-8">
                    <div>
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>Still Learning</span>
                        <span>{Math.round((sessionStats.incorrect / sessionStats.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-red-500/30 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-red-500 transition-all duration-700 ease-in-out"
                          style={{ width: `${(sessionStats.incorrect / sessionStats.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground pt-2">
                        <span>Still Studying</span>
                        <span>{Math.round((sessionStats.skipped / sessionStats.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-amber-500/30 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-amber-500 transition-all duration-700 ease-in-out"
                          style={{ width: `${(sessionStats.skipped / sessionStats.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground pt-2">
                        <span>Mastered</span>
                        <span>{Math.round((sessionStats.correct / sessionStats.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-green-500/30 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-green-500 transition-all duration-700 ease-in-out"
                          style={{ width: `${(sessionStats.correct / sessionStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/flashcards/${type}/${id}`)}
                      className="w-full sm:w-auto"
                    >
                      Return to Flashcard Set
                    </Button>
                    <Button
                      className="glow-button w-full sm:w-auto"
                      onClick={() => {
                        setCurrentQuestionIndex(0)
                        setIsAnswered(false)
                        setIsCorrect(false)
                        setSelectedOption(null)
                        setUserInput("")
                        setSessionComplete(false)
                        setQuestions(shuffleArray(questions))
                        setSessionStats({ correct: 0, incorrect: 0, skipped: 0, total: questions.length })
                      }}
                    >
                      Restart Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
              </div>

              {/* Question Card */}
              <Card className="w-full border-border/50">
                <CardContent className="p-8 space-y-8">
                  {current && (
                    <>
                      <h3 className="text-xl font-medium">{current.question}</h3>

                      {current.type === "multiple-choice" || current.type === "true-false" ? (
                        <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} disabled={isAnswered} className="space-y-3">
                          {current.options?.map((opt, i) => (
                            <div key={i} className={`p-3 rounded-md border flex items-center space-x-2 ${isAnswered && opt === current.answer ? "border-green-500 bg-green-500/10" : isAnswered && opt === selectedOption ? "border-red-500 bg-red-500/10" : "border-border"}`}>
                              <RadioGroupItem value={opt} id={`opt-${i}`} />
                              <Label htmlFor={`opt-${i}`} className="flex-1">{opt}</Label>
                              {isAnswered && opt === current.answer && <Check className="text-green-500 h-4 w-4" />}
                              {isAnswered && opt === selectedOption && opt !== current.answer && <X className="text-red-500 h-4 w-4" />}
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <>
                          <Input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type your answer..." disabled={isAnswered} className={isAnswered ? isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10" : ""} />

                          {isAnswered && !isCorrect && (
                            <div className="bg-red-500/10 p-4 rounded-md space-y-2">
                              <p className="text-red-400 text-sm">Incorrect</p>
                              <p className="text-sm">Your answer: {userInput}</p>
                              <p className="text-sm">Correct: {current.answer}</p>
                              <Button variant="outline" onClick={markAsCorrect} size="sm">Mark as correct anyway</Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </CardContent>

                <CardFooter className="flex justify-end gap-4 p-6">
                  {!isAnswered ? (
                    <>
                      <Button variant="outline" onClick={skipQuestion}>Skip</Button>
                      <Button onClick={checkAnswer} className="glow-button" disabled={!current || (current.type === "typed-response" ? !userInput.trim() : !selectedOption)}>Check Answer</Button>
                    </>
                  ) : (
                    <Button onClick={nextQuestion} className="glow-button">{currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Session"}</Button>
                  )}
                </CardFooter>
              </Card>
            </>
          )}
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
        Loading your Learn...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}