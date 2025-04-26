"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Sparkles } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

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

export default function FlashcardsViewPage() {
  const [pageLoading, setPageLoading] = useState(true)
  const params = useParams() as { type: string; id: string }
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [hideAnswers, setHideAnswers] = useState(false)
  const [autoProgress, setAutoProgress] = useState(true)

  const router = useRouter()

  const isCourse = params.type === "course"

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
      const token = session.access_token
  
      try {
        const res = await fetch(`http://localhost:8080/api/flashcards/${params.type}/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data: FetchFlashcardSetResponse = await res.json()
        setFlashcards(data.flashcard_set.flashcards?.flashcards || [])
        setTitle(data.flashcard_set.title || "Untitled Flashcard Set")
      } catch (error) {
        console.error("Error fetching flashcard set:", error)
      } finally {
        setLoading(false)
      }
    }
  
    Promise.all([
      fetchFlashcardSet()
    ]).finally(() => setPageLoading(false));
  }, [params.type, params.id, router])  


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

  const toggleShuffle = () => {
    setShuffled(!shuffled)
  }

  const handleRestart = () => {
    setCurrentCard(0)
    setFlipped(false)
  }

  if (pageLoading){
    return (<AppShell><DashboardLoading/></AppShell>)
  }

  return (
    <AppShell>
      <div className="space-y-14 max-w-6xl px-8 sm:px-12 lg:px-20 xl:px-28 pt-8 pb-36">
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

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <p className="text-muted-foreground">Loading flashcards...</p>
            </div>
          ) : flashcards.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <p className="text-muted-foreground">No flashcards found for this set.</p>
            </div>
          ) : (<>
          <div className="space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full bg-${isCourse? "primary" : "secondary"} transition-all duration-300`}
                style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Card {currentCard + 1} of {flashcards.length}</span>
              <span>{Math.round(((currentCard + 1) / flashcards.length) * 100)}% Complete</span>
            </div>
          </div>

          <div className="relative w-full max-w-6xl mx-auto aspect-[5/3] sm:aspect-[16/9] cursor-pointer perspective-1000" onClick={handleFlip}>
            <div className={`absolute inset-0 w-full h-full duration-500 preserve-3d ${flipped ? "rotate-y-180" : ""}`}>
              <Card className={`absolute inset-0 backface-hidden border-border/50 glow-border${isCourse? "" : "-pink"}`}>
                <CardContent className="flex items-center justify-center h-full p-12 sm:p-16 lg:p-20">                  <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-semibold mb-6">{flashcards[currentCard].front}</h3>
                    <p className="text-sm text-muted-foreground">Click to flip</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={`absolute inset-0 backface-hidden rotate-y-180 border-border/50 glow-border${isCourse? "" : "-pink"}`}>
              <CardContent className="flex items-center justify-center h-full p-12 sm:p-16 lg:p-20">
                <div className="text-center whitespace-pre-wrap text-2xl sm:text-3xl font-semibold">
                    {hideAnswers ? "[Answer hidden]" : flashcards[currentCard].back}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div></>)}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="lg" onClick={handlePrevious} disabled={currentCard === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              <Button
                size="lg"
                className={isCourse ? "glow-button" : "glow-button-pink"}
                variant={isCourse ? "default" : "secondary"}
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
              <Switch color={isCourse ? "default" : "secondary"} id="hide-answers" checked={hideAnswers} onCheckedChange={setHideAnswers} />
              <label htmlFor="hide-answers" className="text-sm cursor-pointer">
                Hide answers
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch color={isCourse ? "default" : "secondary"} id="auto-progress" checked={autoProgress} onCheckedChange={setAutoProgress} />
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

function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-secondary">
        Loading your Flashcards...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}