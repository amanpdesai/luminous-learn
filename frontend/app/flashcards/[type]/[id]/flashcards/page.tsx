"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, ArrowRight, Check, ChevronLeft, RotateCcw, Shuffle, X } from "lucide-react"
import Link from "next/link"

interface Flashcard {
  front: string
  back: string
}

export default function FlashcardsViewPage() {
  const params = useParams() as { type: string; id: string }
  const { type, id } = params
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [hideAnswers, setHideAnswers] = useState(false)
  const [autoProgress, setAutoProgress] = useState(true)
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set())
  const router = useRouter()

  const isCourse = params.type === "course"

  const flashcards: Flashcard[] = isCourse
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

  const handleFlip = () => setFlipped(!flipped)

  const toggleKnown = () => {
    const updated = new Set(knownCards)
    knownCards.has(currentCard) ? updated.delete(currentCard) : updated.add(currentCard)
    setKnownCards(updated)
  }

  const toggleShuffle = () => {
    setShuffled(!shuffled)
  }

  const handleRestart = () => {
    setCurrentCard(0)
    setFlipped(false)
  }

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

  return (
    <AppShell>
      <div className="space-y-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 pt-12 pb-32">
        <div className="mb-4">
          <Link
            href={`/flashcards/${params.type}/${params.id}`}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {title}
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display glow-text">Flashcards</h1>
            <p className="text-muted-foreground">Review cards one by one</p>
          </div>

          <div className="space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Card {currentCard + 1} of {flashcards.length}</span>
              <span>{Math.round(((currentCard + 1) / flashcards.length) * 100)}% Complete</span>
            </div>
          </div>

          <div className="relative w-full max-w-5xl mx-auto aspect-[4/3] sm:aspect-[5/3] cursor-pointer perspective-1000" onClick={handleFlip}>
            <div className={`absolute inset-0 w-full h-full duration-500 preserve-3d ${flipped ? "rotate-y-180" : ""}`}>
              <Card className="absolute inset-0 backface-hidden border-border/50 glow-border">
                <CardContent className="flex items-center justify-center h-full p-10 sm:p-12 lg:p-16">
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-4">{flashcards[currentCard].front}</h3>
                    <p className="text-sm text-muted-foreground">Click to flip</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="absolute inset-0 backface-hidden rotate-y-180 border-border/50 glow-border-pink">
              <CardContent className="flex items-center justify-center h-full p-10 sm:p-12 lg:p-16">
                <div className="text-center whitespace-pre-wrap text-lg">
                    {hideAnswers ? "[Answer hidden]" : flashcards[currentCard].back}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentCard === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              <Button
                className="glow-button"
                onClick={handleNext}
                disabled={currentCard === flashcards.length - 1}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={handleRestart}
                disabled={currentCard !== flashcards.length - 1}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 md:ml-auto">
              <Button
                variant="outline"
                className={`gap-2 ${knownCards.has(currentCard) ? "bg-green-500/10 text-green-500" : ""}`}
                onClick={toggleKnown}
              >
                {knownCards.has(currentCard) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {knownCards.has(currentCard) ? "I Know This" : "Don't Know"}
              </Button>

              <Button
                variant="outline"
                className={`gap-2 ${shuffled ? "bg-primary/10 text-primary" : ""}`}
                onClick={toggleShuffle}
              >
                <Shuffle className="h-4 w-4" />
                {shuffled ? "Shuffled" : "Shuffle"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 pt-6 mt-8 border-t border-border">
            <div className="flex items-center space-x-2">
              <Switch id="hide-answers" checked={hideAnswers} onCheckedChange={setHideAnswers} />
              <label htmlFor="hide-answers" className="text-sm cursor-pointer">
                Hide answers
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-progress" checked={autoProgress} onCheckedChange={setAutoProgress} />
              <label htmlFor="auto-progress" className="text-sm cursor-pointer">
                Track progress automatically
              </label>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .glow-border {
          box-shadow: 0 0 10px 1px rgba(124, 58, 237, 0.2);
        }
        .glow-border-pink {
          box-shadow: 0 0 10px 1px rgba(236, 72, 153, 0.2);
        }
      `}</style>
    </AppShell>
  )
}