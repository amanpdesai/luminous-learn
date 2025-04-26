"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Check, FileText, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppShell } from "@/components/layout/app-shell"

export default function CreateQuickLearnPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate the generation process with steps
    const steps = [
      "Analyzing Topic",
      "Generating Content Structure",
      "Creating Learning Materials",
      "Finalizing Quick Learn Session",
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++
        setGenerationStep(currentStep)
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsGenerating(false)
          setIsComplete(true)
        }, 1000)
      }
    }, 1200)
  }

  if (isComplete) {
    return <QuickLearnLesson />
  }

  if (isGenerating) {
    return (
      <AppShell title="Quick Learn" description="Creating your personalized learning session">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center animate-pulse">
            <Zap className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-display glow-text-pink">Creating Your Quick Learn Session</h1>
          <div className="w-full space-y-6">
            {[
              "Analyzing Topic",
              "Generating Content Structure",
              "Creating Learning Materials",
              "Finalizing Quick Learn Session",
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    index <= generationStep
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < generationStep ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                </div>
                <span className={index <= generationStep ? "text-foreground" : "text-muted-foreground"}>{step}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground">
            This may take a moment. We&apos;re crafting a personalized learning session for you.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Create Quick Learn" description="Create a single-topic lesson in minutes">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/quick-learn">
                <ArrowLeft className="h-4 w-4" />
                Back to Quick Learn
              </Link>
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-display glow-text-pink">Create Quick Learn</h1>
            <p className="text-muted-foreground">
              Create a single-topic lesson in minutes. Perfect for focused learning sessions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-base">
                      What would you like to learn about?
                    </Label>
                    <Textarea
                      id="topic"
                      placeholder="E.g., JavaScript Promises, CSS Grid Layout, React Hooks..."
                      className="h-24 input-glow resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Difficulty Level</Label>
                    <RadioGroup defaultValue="beginner" className="grid grid-cols-3 gap-2">
                      <Label
                        htmlFor="beginner"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-secondary [&:has([data-state=checked])]:border-secondary"
                      >
                        <RadioGroupItem value="beginner" id="beginner" className="sr-only" />
                        <span>Beginner</span>
                      </Label>
                      <Label
                        htmlFor="intermediate"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-secondary [&:has([data-state=checked])]:border-secondary"
                      >
                        <RadioGroupItem value="intermediate" id="intermediate" className="sr-only" />
                        <span>Intermediate</span>
                      </Label>
                      <Label
                        htmlFor="advanced"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-secondary [&:has([data-state=checked])]:border-secondary"
                      >
                        <RadioGroupItem value="advanced" id="advanced" className="sr-only" />
                        <span>Advanced</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-base">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific aspects you'd like the lesson to cover..."
                      className="h-24 input-glow resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="glow-button-pink bg-secondary hover:bg-secondary/90"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create Quick Lesson
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}

function QuickLearnLesson() {
  const [activeTab, setActiveTab] = useState("content")
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const handleQuizSubmit = () => {
    setQuizSubmitted(true)
  }

  return (
    <AppShell title="JavaScript Promises" description="Quick Learn Session">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Link
              href="/quick-learn"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quick Learn
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Created on April 21, 2025</span>
              <Button variant="outline" size="sm">
                Save to My Courses
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <div className="flex items-center gap-2 text-sm text-secondary mb-2">
              <Zap className="h-4 w-4" />
              <span>Quick Learn</span>
            </div>
            <h1 className="text-3xl font-display glow-text-pink">JavaScript Promises</h1>
            <p className="text-muted-foreground">Understanding asynchronous programming in JavaScript</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="content" className="flex-1">
                Lesson Content
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex-1">
                Practice Quiz
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex-1">
                Flashcards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="animate-in fade-in-50 duration-300">
              <Card className="border-border/50">
                <CardContent className="pt-6 prose prose-invert max-w-none">
                  <h2>Introduction to Promises</h2>
                  <p>
                    JavaScript Promises are objects that represent the eventual completion (or failure) of an
                    asynchronous operation and its resulting value. They were introduced to solve the &quot;callback hell&quot;
                    problem and make asynchronous code more readable and maintainable.
                  </p>

                  <h3>Why Promises?</h3>
                  <p>
                    Before Promises, asynchronous operations in JavaScript were primarily handled using callbacks, which
                    could lead to deeply nested code that was difficult to read and maintain (often called &quot;callback
                    hell&quot; or the &quot;pyramid of doom&quot;).
                  </p>

                  <pre>
                    <code>{`// Callback hell example
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) {
      getYetEvenMoreData(c, function(d) {
        // And so on...
      });
    });
  });
});`}</code>
                  </pre>

                  <p>
                    Promises provide a cleaner way to handle asynchronous operations and make error handling more
                    straightforward.
                  </p>

                  <h3>Promise States</h3>
                  <p>A Promise can be in one of three states:</p>
                  <ul>
                    <li>
                      <strong>Pending</strong>: Initial state, neither fulfilled nor rejected.
                    </li>
                    <li>
                      <strong>Fulfilled</strong>: The operation completed successfully.
                    </li>
                    <li>
                      <strong>Rejected</strong>: The operation failed.
                    </li>
                  </ul>

                  <h3>Creating a Promise</h3>
                  <p>
                    You can create a new Promise using the Promise constructor, which takes a function (called the
                    &quot;executor&quot;) with two parameters: resolve and reject.
                  </p>

                  <pre>
                    <code>{`const myPromise = new Promise((resolve, reject) => {
  // Asynchronous operation
  const success = true;
  
  if (success) {
    resolve('Operation completed successfully!');
  } else {
    reject('Operation failed!');
  }
});`}</code>
                  </pre>

                  <h3>Using Promises</h3>
                  <p>
                    Once you have a Promise, you can use the <code>then()</code> method to specify what should happen
                    when the Promise is fulfilled, and the <code>catch()</code> method to handle rejections.
                  </p>

                  <pre>
                    <code>{`myPromise
  .then((result) => {
    console.log(result); // 'Operation completed successfully!'
  })
  .catch((error) => {
    console.error(error); // This won't run in our example
  });`}</code>
                  </pre>

                  <h3>Chaining Promises</h3>
                  <p>
                    One of the most powerful features of Promises is the ability to chain them together, which allows
                    you to perform a sequence of asynchronous operations in a more readable way.
                  </p>

                  <pre>
                    <code>{`fetchUserData(userId)
  .then(userData => {
    return fetchUserPosts(userData.username);
  })
  .then(posts => {
    return fetchPostComments(posts[0].id);
  })
  .then(comments => {
    console.log(comments);
  })
  .catch(error => {
    console.error('Error in the promise chain:', error);
  });`}</code>
                  </pre>

                  <h3>Promise.all()</h3>
                  <p>
                    <code>Promise.all()</code> takes an array of Promises and returns a new Promise that fulfills when
                    all of the Promises in the array fulfill, or rejects if any of them reject.
                  </p>

                  <pre>
                    <code>{`const promise1 = fetchUserData(1);
const promise2 = fetchUserData(2);
const promise3 = fetchUserData(3);

Promise.all([promise1, promise2, promise3])
  .then(results => {
    console.log(results); // Array of results from all three promises
  })
  .catch(error => {
    console.error('At least one promise rejected:', error);
  });`}</code>
                  </pre>

                  <h3>Async/Await</h3>
                  <p>
                    ES2017 introduced async/await, which is syntactic sugar built on top of Promises, making
                    asynchronous code look and behave more like synchronous code.
                  </p>

                  <pre>
                    <code>{`async function fetchData() {
  try {
    const userData = await fetchUserData(userId);
    const posts = await fetchUserPosts(userData.username);
    const comments = await fetchPostComments(posts[0].id);
    console.log(comments);
  } catch (error) {
    console.error('Error:', error);
  }
}`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="animate-in fade-in-50 duration-300">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Practice Quiz</CardTitle>
                  <CardDescription>Test your understanding of JavaScript Promises</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-medium">1. What is the primary purpose of JavaScript Promises?</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q1a"
                            name="q1"
                            value="a"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q1: "a" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q1a"
                            className={`${quizSubmitted && quizAnswers.q1 === "a" ? "text-red-500" : ""}`}
                          >
                            To make JavaScript code run faster
                          </label>
                          {quizSubmitted && quizAnswers.q1 === "a" && (
                            <span className="text-red-500 text-sm ml-2">Incorrect</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q1b"
                            name="q1"
                            value="b"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q1: "b" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q1b"
                            className={`${quizSubmitted && quizAnswers.q1 === "b" ? "text-green-500" : ""}`}
                          >
                            To handle asynchronous operations more cleanly
                          </label>
                          {quizSubmitted && quizAnswers.q1 === "b" && (
                            <span className="text-green-500 text-sm ml-2">Correct!</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q1c"
                            name="q1"
                            value="c"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q1: "c" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q1c"
                            className={`${quizSubmitted && quizAnswers.q1 === "c" ? "text-red-500" : ""}`}
                          >
                            To create user interfaces
                          </label>
                          {quizSubmitted && quizAnswers.q1 === "c" && (
                            <span className="text-red-500 text-sm ml-2">Incorrect</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">2. Which method is used to handle errors in a Promise?</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q2a"
                            name="q2"
                            value="a"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q2: "a" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q2a"
                            className={`${quizSubmitted && quizAnswers.q2 === "a" ? "text-red-500" : ""}`}
                          >
                            then()
                          </label>
                          {quizSubmitted && quizAnswers.q2 === "a" && (
                            <span className="text-red-500 text-sm ml-2">Incorrect</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q2b"
                            name="q2"
                            value="b"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q2: "b" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q2b"
                            className={`${quizSubmitted && quizAnswers.q2 === "b" ? "text-green-500" : ""}`}
                          >
                            catch()
                          </label>
                          {quizSubmitted && quizAnswers.q2 === "b" && (
                            <span className="text-green-500 text-sm ml-2">Correct!</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q2c"
                            name="q2"
                            value="c"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q2: "c" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q2c"
                            className={`${quizSubmitted && quizAnswers.q2 === "c" ? "text-red-500" : ""}`}
                          >
                            finally()
                          </label>
                          {quizSubmitted && quizAnswers.q2 === "c" && (
                            <span className="text-red-500 text-sm ml-2">Incorrect</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">3. What is the initial state of a Promise?</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q3a"
                            name="q3"
                            value="a"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q3: "a" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q3a"
                            className={`${quizSubmitted && quizAnswers.q3 === "a" ? "text-green-500" : ""}`}
                          >
                            Pending
                          </label>
                          {quizSubmitted && quizAnswers.q3 === "a" && (
                            <span className="text-green-500 text-sm ml-2">Correct!</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q3b"
                            name="q3"
                            value="b"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q3: "b" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q3b"
                            className={`${quizSubmitted && quizAnswers.q3 === "b" ? "text-red-500" : ""}`}
                          >
                            Fulfilled
                          </label>
                          {quizSubmitted && quizAnswers.q3 === "b" && (
                            <span className="text-red-500 text-sm ml-2">Incorrect</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="q3c"
                            name="q3"
                            value="c"
                            className="h-4 w-4 text-secondary"
                            onChange={() => setQuizAnswers({ ...quizAnswers, q3: "c" })}
                            disabled={quizSubmitted}
                          />
                          <label
                            htmlFor="q3c"
                            className={`${quizSubmitted && quizAnswers.q3 === "c" ? "text-red-500" : ""}`}
                          >
                            Rejected
                          </label>
                          {quizSubmitted && quizAnswers.q3 === "c" && (
                            <span className="text-red-500 text-sm ml-2">Incorrect</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {!quizSubmitted ? (
                    <Button
                      className="w-full glow-button-pink bg-secondary hover:bg-secondary/90"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < 3}
                    >
                      Check Answers
                    </Button>
                  ) : (
                    <div className="w-full text-center">
                      <p className="text-lg font-medium mb-2">
                        Your score:{" "}
                        {Object.values(quizAnswers).filter((a) => a === "b" || a === "a" || a === "a").length}/3
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizSubmitted(false)
                          setQuizAnswers({})
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="flashcards" className="animate-in fade-in-50 duration-300">
              <FlashcardViewer />
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" asChild>
              <Link href="/quick-learn">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quick Learn
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Add to Flashcards
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Add to Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function FlashcardViewer() {
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const flashcards = [
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

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setFlipped(false)
    }
  }

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary transition-all duration-300"
            style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>
            Card {currentCard + 1} of {flashcards.length}
          </span>
          <span>{Math.round(((currentCard + 1) / flashcards.length) * 100)}% Complete</span>
        </div>
      </div>

      <div className="relative h-80 w-full cursor-pointer perspective-1000" onClick={handleFlip}>
        <div className={`absolute inset-0 w-full h-full duration-500 preserve-3d ${flipped ? "rotate-y-180" : ""}`}>
          <Card className="absolute inset-0 backface-hidden border-border/50 glow-border">
            <CardContent className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-4">{flashcards[currentCard].front}</h3>
                <p className="text-sm text-muted-foreground">Click to flip</p>
              </div>
            </CardContent>
          </Card>

          <Card className="absolute inset-0 backface-hidden rotate-y-180 border-border/50 glow-border-pink">
            <CardContent className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <div className="whitespace-pre-wrap text-lg">{flashcards[currentCard].back}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentCard === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Check className="h-4 w-4 text-green-500" />I Know This
          </Button>
        </div>

        <Button
          onClick={handleNext}
          disabled={currentCard === flashcards.length - 1}
          className="glow-button-pink bg-secondary hover:bg-secondary/90"
        >
          Next
          <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
        </Button>
      </div>
    </div>
  )
}
