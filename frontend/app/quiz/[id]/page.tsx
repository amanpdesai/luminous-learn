"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AppShell } from "@/components/layout/app-shell"
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function QuizPage({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining] = useState(1800) // 30 minutes in seconds

  // Mock quiz data
  const quiz = {
    id: params.id,
    title: "Python Fundamentals",
    description: "Test your knowledge of Python basics",
    course: "Introduction to Python Programming",
    totalQuestions: 10,
    timeLimit: "30 minutes",
    questions: [
      {
        id: 1,
        text: "What is the correct way to create a variable in Python?",
        options: [
          { id: 1, text: "var x = 5" },
          { id: 2, text: "x = 5" },
          { id: 3, text: "int x = 5" },
          { id: 4, text: "let x = 5" },
        ],
        correctAnswer: 2,
      },
      {
        id: 2,
        text: "Which of the following is NOT a valid data type in Python?",
        options: [
          { id: 1, text: "int" },
          { id: 2, text: "float" },
          { id: 3, text: "char" },
          { id: 4, text: "bool" },
        ],
        correctAnswer: 3,
      },
      {
        id: 3,
        text: "What will be the output of the following code?\n\nx = 5\ny = 2\nprint(x // y)",
        options: [
          { id: 1, text: "2.5" },
          { id: 2, text: "2" },
          { id: 3, text: "2.0" },
          { id: 4, text: "Error" },
        ],
        correctAnswer: 2,
      },
      {
        id: 4,
        text: "Which of the following is used to define a function in Python?",
        options: [
          { id: 1, text: "function" },
          { id: 2, text: "def" },
          { id: 3, text: "func" },
          { id: 4, text: "define" },
        ],
        correctAnswer: 2,
      },
      {
        id: 5,
        text: "What is the correct way to create a list in Python?",
        options: [
          { id: 1, text: "list = (1, 2, 3)" },
          { id: 2, text: "list = [1, 2, 3]" },
          { id: 3, text: "list = {1, 2, 3}" },
          { id: 4, text: "list = <1, 2, 3>" },
        ],
        correctAnswer: 2,
      },
      {
        id: 6,
        text: "Which method is used to add an element to the end of a list?",
        options: [
          { id: 1, text: "append()" },
          { id: 2, text: "add()" },
          { id: 3, text: "insert()" },
          { id: 4, text: "extend()" },
        ],
        correctAnswer: 1,
      },
      {
        id: 7,
        text: "What is the output of the following code?\n\nprint('Hello'[::-1])",
        options: [
          { id: 1, text: "Hello" },
          { id: 2, text: "olleH" },
          { id: 3, text: "H" },
          { id: 4, text: "Error" },
        ],
        correctAnswer: 2,
      },
      {
        id: 8,
        text: "Which of the following is NOT a valid loop in Python?",
        options: [
          { id: 1, text: "for loop" },
          { id: 2, text: "while loop" },
          { id: 3, text: "do-while loop" },
          { id: 4, text: "nested loop" },
        ],
        correctAnswer: 3,
      },
      {
        id: 9,
        text: "What is the correct way to import a module in Python?",
        options: [
          { id: 1, text: "import module" },
          { id: 2, text: "include module" },
          { id: 3, text: "using module" },
          { id: 4, text: "require module" },
        ],
        correctAnswer: 1,
      },
      {
        id: 10,
        text: "Which of the following is used to handle exceptions in Python?",
        options: [
          { id: 1, text: "try-catch" },
          { id: 2, text: "try-except" },
          { id: 3, text: "try-error" },
          { id: 4, text: "try-finally" },
        ],
        correctAnswer: 2,
      },
    ],
  }

  const currentQuestionData = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.totalQuestions) * 100

  const handleSelectAnswer = (questionId: number, optionId: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correctCount = 0
    quiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })
    return {
      score: correctCount,
      total: quiz.totalQuestions,
      percentage: Math.round((correctCount / quiz.totalQuestions) * 100),
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const score = calculateScore()

  return (
    <AppShell title={quiz.title} description={quiz.description}>
      <div className="w-full px-6 md:px-12 xl:px-24 py-8">
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/quizzes">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Quizzes</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display">{quiz.title}</h1>
              <p className="text-muted-foreground text-sm">
                From: {quiz.course} • {quiz.totalQuestions} questions • {quiz.timeLimit}
              </p>
            </div>
          </div>

          {!showResults ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Question {currentQuestion + 1} of {quiz.totalQuestions}
                  </span>
                  <Progress value={progress} className="w-32 h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">{currentQuestionData.text}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentQuestionData.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer transition-colors ${
                        selectedAnswers[currentQuestionData.id] === option.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelectAnswer(currentQuestionData.id, option.id)}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border ${
                          selectedAnswers[currentQuestionData.id] === option.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        } flex items-center justify-center`}
                      >
                        {selectedAnswers[currentQuestionData.id] === option.id && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span>{option.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswers[currentQuestionData.id]}
                  className="glow-button"
                >
                  {currentQuestion === quiz.totalQuestions - 1 ? "Finish Quiz" : "Next"}
                  {currentQuestion !== quiz.totalQuestions - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">Quiz Results</CardTitle>
                      <CardDescription>You&apos;ve completed the {quiz.title} quiz</CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-5xl font-bold mb-2">{score.percentage}%</div>
                    <p className="text-muted-foreground">
                      You got {score.score} out of {score.total} questions correct
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Question Summary</h3>
                    <div className="space-y-3">
                      {quiz.questions.map((question, index) => {
                        const isCorrect = selectedAnswers[question.id] === question.correctAnswer
                        return (
                          <div
                            key={question.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isCorrect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-6 w-6 rounded-full ${
                                  isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                                } flex items-center justify-center`}
                              >
                                {isCorrect ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <span className="text-sm">Question {index + 1}</span>
                            </div>
                            {!isCorrect && (
                              <div className="text-xs text-muted-foreground">
                                Correct answer:{" "}
                                {question.options.find((opt) => opt.id === question.correctAnswer)?.text}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Link href="/quizzes">
                  <Button variant="outline">Back to Quizzes</Button>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline">Review Answers</Button>
                  <Button className="glow-button">Retake Quiz</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
