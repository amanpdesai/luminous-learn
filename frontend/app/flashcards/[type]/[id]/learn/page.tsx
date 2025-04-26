"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Check, HelpCircle, Loader2, X } from "lucide-react"

type QuestionType = "multiple-choice" | "typed-response" | "true-false"

interface Question {
  id: number
  type: QuestionType
  question: string
  answer: string
  options?: string[]
  userAnswer?: string
  isCorrect?: boolean
  isSkipped?: boolean
}

export default function LearnViewPage() {
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

  const isCourse = type === "course"

  const getTitle = () => {
    if (isCourse) {
      return id === "1"
        ? "Introduction to Python Programming"
        : id === "2"
        ? "Web Development Fundamentals"
        : "Data Science Essentials"
    } else {
      return id === "1"
        ? "JavaScript Promises"
        : id === "2"
        ? "CSS Grid Layout"
        : id === "3"
        ? "React Hooks"
        : "Python List Comprehensions"
    }
  }

  const title = getTitle()

  useEffect(() => {
    setIsLoading(true)

    const flashcards = isCourse
      ? [
          { front: "What is a variable in Python?", back: "A variable is a named location in memory..." },
          { front: "Difference between a list and a tuple?", back: "Lists are mutable, tuples are not..." },
          { front: "What is a function in Python?", back: "A reusable block of code defined with 'def'." },
          { front: "What is object-oriented programming?", back: "A paradigm based on 'objects' containing data and behavior." },
          { front: "What is inheritance in OOP?", back: "When a child class inherits properties from a parent class." }
        ]
      : [
          { front: "What is a Promise in JavaScript?", back: "An object for async completion or failure." },
          { front: "Three states of a Promise?", back: "Pending, Fulfilled, Rejected" },
          { front: "Creating a Promise?", back: "new Promise((resolve, reject) => {...})" },
          { front: "Purpose of .then()?", back: "Handles successful resolution." },
          { front: "Purpose of .catch()?", back: "Handles rejections in a chain." }
        ]

    const generated = flashcards.map((card, i) => {
      const type: QuestionType = i % 3 === 0 ? "multiple-choice" : i % 3 === 1 ? "typed-response" : "true-false"
      const options = type === "multiple-choice" ? [
        "Incorrect A", "Incorrect B", "Incorrect C", card.back
      ].sort(() => Math.random() - 0.5) : type === "true-false" ? ["True", "False"] : undefined

      return { id: i, type, question: card.front, answer: card.back, options }
    })

    setQuestions(generated)
    setSessionStats({ correct: 0, incorrect: 0, skipped: 0, total: generated.length })

    setTimeout(() => setIsLoading(false), 400)
  }, [isCourse, type, id])

  const current = questions[currentQuestionIndex]

  const checkAnswer = () => {
    if (!current) return
    const updated = [...questions]
    const q = updated[currentQuestionIndex]
    let correct = false

    if (q.type === "multiple-choice" || q.type === "true-false") {
      correct = q.type === "true-false" ? selectedOption === "True" : selectedOption === q.answer
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
      setCurrentQuestionIndex((i) => i + 1)
      setIsAnswered(false)
      setSelectedOption(null)
      setUserInput("")
    } else setSessionComplete(true)
  }

  return (
    <AppShell>
  <div className="space-y-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 pt-12 pb-24">
    <div className="mb-4">
      <Link href={`/flashcards/${type}/${id}`} className="flex items-center text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to {title}
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
        <Card className="w-full border-border/50">
            <CardHeader>
                <h2 className="text-2xl font-display glow-text">Session Complete</h2>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                {/* Correct */}
                <div className="p-4 bg-muted/30 rounded-md space-y-2">
                    <p className="text-3xl font-bold text-green-500">{sessionStats.correct}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-700"
                        style={{
                        width: `${
                            sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0
                        }%`,
                        }}
                    />
                    </div>
                </div>

                {/* Incorrect */}
                <div className="p-4 bg-muted/30 rounded-md space-y-2">
                    <p className="text-3xl font-bold text-red-500">{sessionStats.incorrect}</p>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-red-500 transition-all duration-700"
                        style={{
                        width: `${
                            sessionStats.total > 0 ? (sessionStats.incorrect / sessionStats.total) * 100 : 0
                        }%`,
                        }}
                    />
                    </div>
                </div>

                {/* Skipped */}
                <div className="p-4 bg-muted/30 rounded-md space-y-2">
                    <p className="text-3xl font-bold text-yellow-500">{sessionStats.skipped}</p>
                    <p className="text-sm text-muted-foreground">Skipped</p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-yellow-500 transition-all duration-700"
                        style={{
                        width: `${
                            sessionStats.total > 0 ? (sessionStats.skipped / sessionStats.total) * 100 : 0
                        }%`,
                        }}
                    />
                    </div>
                </div>
                </div>

                <div className="space-y-4 mt-8">
                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>Still Learning</span>
                        <span>25%</span>
                    </div>
                    <div className="h-2 bg-red-500/30 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-red-500 transition-all duration-700 ease-in-out"
                        style={{ width: "25%" }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground pt-2">
                        <span>Still Studying</span>
                        <span>35%</span>
                    </div>
                    <div className="h-2 bg-amber-500/30 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-amber-500 transition-all duration-700 ease-in-out"
                        style={{ width: "35%" }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground pt-2">
                        <span>Mastered</span>
                        <span>40%</span>
                    </div>
                    <div className="h-2 bg-green-500/30 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-green-500 transition-all duration-700 ease-in-out"
                        style={{ width: "40%" }}
                        />
                    </div>
                    </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4">
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
                    setSessionComplete(false)
                    setCurrentQuestionIndex(0)
                    setQuestions((q) =>
                    q.map((x) => ({ ...x, isCorrect: undefined, isSkipped: undefined, userAnswer: undefined }))
                    )
                    setSessionStats({ correct: 0, incorrect: 0, skipped: 0, total: questions.length })
                    setIsAnswered(false)
                    setSelectedOption(null)
                    setUserInput("")
                }}
                >
                Restart Session
                </Button>
            </CardFooter>
            </Card>
      ) : (
        <>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>

          <Card className="w-full border-border/50">
            <CardContent className="p-8 space-y-8">
                  {current && (
                    current.type === "multiple-choice" ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-medium">{current.question}</h3>
                        <RadioGroup
                          value={selectedOption || ""}
                          onValueChange={setSelectedOption}
                          disabled={isAnswered}
                          className="space-y-3"
                        >
                          {current.options?.map((opt, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-md border flex items-center space-x-2 ${
                                isAnswered && opt === current.answer
                                  ? "border-green-500 bg-green-500/10"
                                  : isAnswered && opt === selectedOption
                                  ? "border-red-500 bg-red-500/10"
                                  : "border-border"
                              }`}
                            >
                              <RadioGroupItem value={opt} id={`opt-${i}`} />
                              <Label htmlFor={`opt-${i}`} className="flex-1">{opt}</Label>
                              {isAnswered && opt === current.answer && <Check className="text-green-500 h-4 w-4" />}
                              {isAnswered && opt === selectedOption && opt !== current.answer && <X className="text-red-500 h-4 w-4" />}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ) : current.type === "typed-response" ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-medium">{current.question}</h3>
                        <Input
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Type your answer here..."
                          disabled={isAnswered}
                        />
                        {isAnswered && (
                          <div className={`p-4 rounded-md ${isCorrect ? "bg-green-500/10" : "bg-red-500/10"}`}>
                            <div className="flex gap-2 items-start">
                              {isCorrect ? <Check className="text-green-500 h-5 w-5" /> : <X className="text-red-500 h-5 w-5" />}
                              <div>
                                <p className={`font-medium ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                                  {isCorrect ? "Correct!" : "Incorrect"}
                                </p>
                                <p className="text-sm mt-1"><span className="font-medium">Your answer:</span> {userInput}</p>
                                <p className="text-sm"><span className="font-medium">Correct:</span> {current.answer}</p>
                                {!isCorrect && (
                                  <Button onClick={markAsCorrect} variant="outline" size="sm" className="mt-2 text-xs">
                                    Mark as correct anyway
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-xl font-medium">{current.question}</h3>
                        <div className="p-4 rounded-md border border-border bg-muted/30">
                          <p>{current.answer}</p>
                        </div>
                        <div className="flex gap-4 pt-2">
                          {current.options?.map((opt, i) => (
                            <Button
                              key={i}
                              className={`flex-1 ${isAnswered && opt === "True" ? "border-green-500 text-green-500" : ""} ${
                                isAnswered && opt === selectedOption && opt !== "True" ? "border-red-500 text-red-500" : ""
                              }`}
                              variant={selectedOption === opt ? "default" : "outline"}
                              disabled={isAnswered}
                              onClick={() => !isAnswered && setSelectedOption(opt)}
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 border-t border-border p-6">
                  {!isAnswered ? (
                    <>
                      <Button variant="outline" onClick={skipQuestion} className="w-full sm:w-auto gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Don&apos;t Know
                      </Button>
                      <Button
                        className="glow-button w-full sm:w-auto gap-2"
                        onClick={checkAnswer}
                        disabled={!current || (current.type === "typed-response" ? !userInput.trim() : !selectedOption)}
                      >
                        <Check className="h-4 w-4" />
                        Check Answer
                      </Button>
                    </>
                  ) : (
                    <Button className="glow-button w-full sm:w-auto ml-auto gap-2" onClick={nextQuestion}>
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Complete Session
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
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