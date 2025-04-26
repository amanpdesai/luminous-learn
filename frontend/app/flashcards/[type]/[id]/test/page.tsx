"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Check, ChevronLeft, Clock, X } from "lucide-react"
import Link from "next/link"

type QuestionType = "multiple-choice" | "written" | "true-false"

interface Question {
  id: number
  type: QuestionType
  question: string
  answer: string
  options?: string[]
  userAnswer?: string
  isCorrect?: boolean
}

export default function TestViewPage() {
  const params = useParams() as { type: string; id: string } ;
  const { type, id } = params
  const router = useRouter()
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [testResults, setTestResults] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    score: 0,
  })

  // Test configuration
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["multiple-choice", "written", "true-false"])
  const [sourceFilter, setSourceFilter] = useState("all")
  const [displayMode, setDisplayMode] = useState<"sequence" | "all">("sequence")

  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive])

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartTest = () => {
    // Generate questions from flashcards
    const flashcards = isCourse
      ? [
          {
            front: "What is a variable in Python?",
            back: "A variable is a named location in memory that stores a value. In Python, variables are created when you assign a value to them.",
          },
          {
            front: "What is the difference between a list and a tuple in Python?",
            back: "Lists are mutable (can be changed after creation) while tuples are immutable (cannot be changed after creation). Lists use square brackets [] and tuples use parentheses ().",
          },
          {
            front: "What is a function in Python?",
            back: "A function is a block of organized, reusable code that performs a specific task. Functions are defined using the 'def' keyword.",
          },
          {
            front: "What is object-oriented programming?",
            back: "Object-oriented programming (OOP) is a programming paradigm based on the concept of 'objects', which can contain data and code. Data in the form of fields (attributes), and code in the form of procedures (methods).",
          },
          {
            front: "What is inheritance in OOP?",
            back: "Inheritance is a mechanism where a new class (child class) is derived from an existing class (parent class). The child class inherits attributes and methods from the parent class.",
          },
        ]
      : [
          {
            front: "What is a Promise in JavaScript?",
            back: "A Promise is an object representing the eventual completion or failure of an asynchronous operation and its resulting value.",
          },
          {
            front: "What are the three states of a Promise?",
            back: "Pending: initial state, neither fulfilled nor rejected\nFulfilled: operation completed successfully\nRejected: operation failed",
          },
          {
            front: "How do you create a new Promise?",
            back: "Using the Promise constructor:\n\nconst myPromise = new Promise((resolve, reject) => {\n  // Asynchronous operation\n});",
          },
          {
            front: "What is the purpose of the .then() method?",
            back: "The .then() method is used to specify what should happen when a Promise is fulfilled. It returns a new Promise, allowing for method chaining.",
          },
          {
            front: "What is the purpose of the .catch() method?",
            back: "The .catch() method is used to handle errors in a Promise chain. It catches any rejections that occur in the preceding Promises.",
          },
        ]

    // Generate test questions based on configuration
    const generatedQuestions: Question[] = []

    // Limit to the number of questions requested
    const numQuestions = Math.min(questionCount, flashcards.length)

    for (let i = 0; i < numQuestions; i++) {
      const card = flashcards[i]

      // Determine question type based on selected types
      const questionType = selectedTypes[i % selectedTypes.length]

      const question: Question = {
        id: i,
        type: questionType,
        question: card.front,
        answer: card.back,
      }

      // Add options for multiple choice
      if (questionType === "multiple-choice") {
        // Generate distractors (in a real app, these would be more sophisticated)
        const distractors = [
          "This is an incorrect option 1",
          "This is an incorrect option 2",
          "This is an incorrect option 3",
        ]

        // Shuffle options including the correct answer
        const options = [...distractors, card.back].sort(() => Math.random() - 0.5)

        question.options = options
      }

      // Add options for true/false
      if (questionType === "true-false") {
        question.options = ["True", "False"]
      }

      generatedQuestions.push(question)
    }

    setQuestions(generatedQuestions)
    setTestStarted(true)
    setTimerActive(true)
    setTimeElapsed(0)
  }

  const handleAnswerChange = (answer: string, index: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [index]: answer,
    }))
  }    

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = () => {
    setTimerActive(false)

    // Calculate results
    let correct = 0
    const gradedQuestions = questions.map((question, index) => {
      const userAnswer = userAnswers[index] || ""
      let isCorrect = false

      if (question.type === "multiple-choice" || question.type === "true-false") {
        if (question.type === "true-false") {
          // For true/false, "True" is always correct in this mock
          isCorrect = userAnswer === "True"
        } else {
          // For multiple choice, check if selected option matches the answer
          isCorrect = userAnswer === question.answer
        }
      } else if (question.type === "written") {
        // For written response, do a simple check
        const simplifiedInput = userAnswer.toLowerCase().trim()
        const simplifiedAnswer = question.answer.toLowerCase().trim()
        isCorrect = simplifiedInput.includes(simplifiedAnswer.substring(0, 10))
      }

      if (isCorrect) correct++

      return {
        ...question,
        userAnswer,
        isCorrect,
      }
    })

    setQuestions(gradedQuestions)
    setTestResults({
      correct,
      incorrect: questions.length - correct,
      total: questions.length,
      score: Math.round((correct / questions.length) * 100),
    })

    setTestCompleted(true)
  }

  const renderQuestion = (question: Question, index: number) => {
    const userAnswer = userAnswers[index] || ""

    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium">{question.question}</h3>

            <RadioGroup
              value={userAnswers[index] || ""}
              onValueChange={(value) => handleAnswerChange(value, index)}              
              className="space-y-3"
              disabled={testCompleted}
            >
              {question.options?.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center space-x-2 p-3 rounded-md border ${
                    testCompleted && option === question.answer
                      ? "border-green-500 bg-green-500/10"
                      : testCompleted && option === userAnswer && option !== question.answer
                        ? "border-red-500 bg-red-500/10"
                        : "border-border"
                  }`}
                >
                  <RadioGroupItem
                    value={option}
                    id={`question-${index}-option-${optIndex}`}
                    className={testCompleted && option === question.answer ? "text-green-500" : ""}
                  />
                  <Label
                    htmlFor={`question-${index}-option-${optIndex}`}
                    className={`flex-1 cursor-pointer ${
                      testCompleted && option === question.answer ? "text-green-500" : ""
                    }`}
                  >
                    {option}
                  </Label>
                  {testCompleted && option === question.answer && <Check className="h-4 w-4 text-green-500" />}
                  {testCompleted && option === userAnswer && option !== question.answer && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "written":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium">{question.question}</h3>

            <div>
              <Input
                value={userAnswer}
                onChange={(e) => handleAnswerChange(e.target.value, index)}
                placeholder="Type your answer here..."
                className="w-full"
                disabled={testCompleted}
              />
            </div>

            {testCompleted && (
              <div className={`p-4 rounded-md ${question.isCorrect ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <div className="flex items-start gap-2">
                  {question.isCorrect ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${question.isCorrect ? "text-green-500" : "text-red-500"}`}>
                      {question.isCorrect ? "Correct!" : "Incorrect"}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Your answer:</span> {userAnswer || "(empty)"}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Correct answer:</span> {question.answer}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case "true-false":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium">{question.question}</h3>
            <p className="text-muted-foreground">Is the following statement true?</p>
            <div className="p-4 bg-muted/30 rounded-md border border-border">
              <p>{question.answer}</p>
            </div>

            <div className="flex gap-4 pt-2">
              {question.options?.map((option, optIndex) => (
                <Button
                  key={optIndex}
                  variant={userAnswer === option ? "default" : "outline"}
                  className={`flex-1 ${
                    testCompleted && option === "True"
                      ? "border-green-500 text-green-500"
                      : testCompleted && option === userAnswer && option !== "True"
                        ? "border-red-500 text-red-500"
                        : ""
                  }`}
                  onClick={() => !testCompleted && handleAnswerChange(option, index)}
                  disabled={testCompleted}
                >
                  {option}
                </Button>
              ))}
            </div>

            {testCompleted && (
              <div className={`p-4 rounded-md ${question.isCorrect ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <div className="flex items-start gap-2">
                  {question.isCorrect ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <p className={`font-medium ${question.isCorrect ? "text-green-500" : "text-red-500"}`}>
                    {question.isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const renderTestResults = () => {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <h2 className="text-2xl font-display glow-text">Test Results</h2>
          <p className="text-muted-foreground">
            You scored {testResults.score}% ({testResults.correct} out of {testResults.total} correct)
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/30 rounded-md">
              <div className="text-3xl font-bold text-green-500">{testResults.correct}</div>
              <div className="text-sm text-muted-foreground mt-1">Correct</div>
            </div>

            <div className="p-4 bg-muted/30 rounded-md">
              <div className="text-3xl font-bold text-red-500">{testResults.incorrect}</div>
              <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
            </div>

            <div className="p-4 bg-muted/30 rounded-md">
              <div className="text-3xl font-bold">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-muted-foreground mt-1">Time Taken</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score</span>
              <span>{testResults.score}%</span>
            </div>
            <Progress value={testResults.score} className="h-2 bg-muted [&>div]:bg-primary" />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Question Review</h3>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border border-border rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Question {index + 1}</span>
                    <span className={`text-sm font-medium ${question.isCorrect ? "text-green-500" : "text-red-500"}`}>
                      {question.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="mb-2">{question.question}</p>
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Your answer:</span> {userAnswers[index] || "(not answered)"}
                    </p>
                    <p>
                      <span className="font-medium">Correct answer:</span> {question.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push(`/flashcards/${params.type}/${params.id}`)}
          >
            Return to Flashcard Set
          </Button>

          <Button
            className="w-full sm:w-auto glow-button"
            onClick={() => {
              setTestStarted(false)
              setTestCompleted(false)
              setCurrentQuestionIndex(0)
              setUserAnswers({})
              setTimeElapsed(0)
            }}
          >
            Take Another Test
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderTestConfiguration = () => {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <h2 className="text-2xl font-display glow-text">Configure Your Test</h2>
          <p className="text-muted-foreground">Customize your test settings</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Number of Questions</label>
              <div className="flex gap-2">
                {[3, 5, 10, "All"].map((num) => (
                  <Button
                    key={num}
                    variant={questionCount === (num === "All" ? 100 : Number(num)) ? "default" : "outline"}
                    className={questionCount === (num === "All" ? 100 : Number(num)) ? "glow-button" : ""}
                    onClick={() => setQuestionCount(num === "All" ? 100 : Number(num))}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Question Types</label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiple-choice"
                    checked={selectedTypes.includes("multiple-choice")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTypes([...selectedTypes, "multiple-choice"])
                      } else {
                        setSelectedTypes(selectedTypes.filter((t) => t !== "multiple-choice"))
                      }
                    }}
                  />
                  <label htmlFor="multiple-choice" className="text-sm cursor-pointer">
                    Multiple Choice
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="written"
                    checked={selectedTypes.includes("written")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTypes([...selectedTypes, "written"])
                      } else {
                        setSelectedTypes(selectedTypes.filter((t) => t !== "written"))
                      }
                    }}
                  />
                  <label htmlFor="written" className="text-sm cursor-pointer">
                    Written
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="true-false"
                    checked={selectedTypes.includes("true-false")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTypes([...selectedTypes, "true-false"])
                      } else {
                        setSelectedTypes(selectedTypes.filter((t) => t !== "true-false"))
                      }
                    }}
                  />
                  <label htmlFor="true-false" className="text-sm cursor-pointer">
                    True/False
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Source</label>
              <div className="flex gap-2">
                <Button
                  variant={sourceFilter === "all" ? "default" : "outline"}
                  className={sourceFilter === "all" ? "glow-button" : ""}
                  onClick={() => setSourceFilter("all")}
                >
                  All Cards
                </Button>
                <Button
                  variant={sourceFilter === "learning" ? "default" : "outline"}
                  className={sourceFilter === "learning" ? "glow-button" : ""}
                  onClick={() => setSourceFilter("learning")}
                >
                  Still Learning
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Display Mode</label>
              <div className="flex gap-2">
                <Button
                  variant={displayMode === "sequence" ? "default" : "outline"}
                  className={displayMode === "sequence" ? "glow-button" : ""}
                  onClick={() => setDisplayMode("sequence")}
                >
                  One at a Time
                </Button>
                <Button
                  variant={displayMode === "all" ? "default" : "outline"}
                  className={displayMode === "all" ? "glow-button" : ""}
                  onClick={() => setDisplayMode("all")}
                >
                  All Questions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full glow-button" onClick={handleStartTest} disabled={selectedTypes.length === 0}>
            Start Test
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderTestInProgress = () => {
    if (displayMode === "sequence") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display glow-text">Test in Progress</h2>
              <p className="text-muted-foreground">Answer each question to the best of your ability</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-md">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          <div className="relative">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
            </div>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6">
              {questions[currentQuestionIndex] && renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)}
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border p-6">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button className="glow-button" onClick={handleSubmitTest}>
                    Submit Test
                  </Button>
                ) : (
                  <Button className="glow-button" onClick={handleNextQuestion}>
                    Next
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      )
    } else {
      // All questions at once view
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display glow-text">Test in Progress</h2>
              <p className="text-muted-foreground">Answer all questions to complete the test</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-md">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Question {index + 1}</h3>
                </CardHeader>
                <CardContent className="p-6 pt-0">{renderQuestion(question, index)}</CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button className="glow-button" onClick={handleSubmitTest}>
              Submit Test
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <AppShell>
      <div className="space-y-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 pt-12 pb-24 max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/flashcards/${params.type}/${params.id}`}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {title}
          </Link>
        </div>

        <div className="space-y-8">
          {!testStarted ? (
            <>
              <div>
                <h1 className="text-4xl font-display glow-text">Test</h1>
                <p className="text-muted-foreground text-lg">Quiz yourself on the material</p>
              </div>

              {renderTestConfiguration()}
            </>
          ) : !testCompleted ? (
            renderTestInProgress()
          ) : (
            <>
              <div>
                <h1 className="text-4xl font-display glow-text">Test Complete</h1>
                <p className="text-muted-foreground text-lg">Review your results</p>
              </div>

              {renderTestResults()}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}