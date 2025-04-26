"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, BookOpen, Check, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"

export default function FlashcardSetPage({ params }: { params: { type: string; id: string } }) {
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Determine if this is a course or quick learn flashcard set
  const isCourse = params.type === "course"

  // Mock flashcard data
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
  const description = `Review key concepts and test your knowledge - ${flashcards.length} cards`

  return (
    <AppShell title={title} description={description}>
      <div className="space-y-8">
        <div className="mb-8">
          <Link
            href="/flashcards"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flashcards
          </Link>
        </div>

        <div className="space-y-8">
          <div className="md:hidden">
            <div className="flex items-center gap-2 text-sm text-primary mb-2">
              <BookOpen className="h-4 w-4" />
              <span>{isCourse ? "Course Flashcards" : "Quick Learn Flashcards"}</span>
            </div>
            <h1 className="text-3xl font-display glow-text">{title}</h1>
            <p className="text-muted-foreground">Review key concepts and test your knowledge</p>
          </div>

          <div className="relative">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
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
                <X className="h-4 w-4 text-destructive" />
                Need Review
              </Button>
              <Button variant="outline" className="gap-2">
                <Check className="h-4 w-4 text-green-500" />I Know This
              </Button>
            </div>

            <Button onClick={handleNext} disabled={currentCard === flashcards.length - 1} className="glow-button">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
      `}</style>
    </AppShell>
  )
}
