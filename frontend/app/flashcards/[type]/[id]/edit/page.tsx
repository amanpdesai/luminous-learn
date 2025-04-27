"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen, GripVertical, Save, Sparkles, Trash2, X, Zap } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { supabase } from "@/lib/supabaseClient"

function SortableCard({
  id,
  card,
  onUpdate,
  onDelete,
}: {
  id: string
  card: { front: string; back: string }
  index: number
  onUpdate: (id: string, field: "front" | "back", value: string) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group ${
        !card.front.trim() || !card.back.trim()
          ? "border-destructive/50 ring-1 ring-destructive/30"
          : "border-border/50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div {...listeners} className="pt-2 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Front</label>
              <Textarea
                value={card.front}
                onChange={(e) => onUpdate(id, "front", e.target.value)}
                placeholder="Question or term"
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Back</label>
              <Textarea
                value={card.back}
                onChange={(e) => onUpdate(id, "back", e.target.value)}
                placeholder="Answer or definition"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EditFlashcardsPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const params = useParams() as { type: string; id: string } ;
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [flashcards, setFlashcards] = useState<Array<{ id: string; front: string; back: string }>>([])
  const [isSaving, setIsSaving] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const isCourse = params.type === "course"

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/auth")
    }
    const fetchFlashcardSet = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
      const token = session.access_token
  
      try {
        const res = await fetch(`https://luminous-learn.onrender.com/api/flashcards/${params.type}/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const { flashcard_set } = await res.json()  // <- extract flashcard_set
  
        setTitle(flashcard_set.title || "")
        setDescription(flashcard_set.description || "")
        setFlashcards(flashcard_set.flashcards?.flashcards || [])
      } catch (error) {
        console.error("Error fetching flashcard set:", error)
      }
    }
    checkAuth()
    Promise.all([
      fetchFlashcardSet()
    ]).finally(() => setPageLoading(false));
  }, [params.type, params.id, router])  

  const handleAddCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      front: "",
      back: "",
    }
    setFlashcards((prev) => [...prev, newCard])
  
    // Scroll to bottom to show new card
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    }, 100)
  }  

  const handleDeleteCard = (id: string) => {
    setFlashcards(flashcards.filter((card) => card.id !== id))
  }

  const handleUpdateCard = (id: string, field: "front" | "back", value: string) => {
    setFlashcards(flashcards.map((card) => (card.id === id ? { ...card, [field]: value } : card)))
  }

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = flashcards.findIndex((c) => c.id === active.id)
    const newIndex = flashcards.findIndex((c) => c.id === over.id)
    setFlashcards(arrayMove(flashcards, oldIndex, newIndex))
  }

  const handleSave = async () => {
    setIsSaving(true)
  
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
      const token = session.access_token
  
      const payload = {
        title,
        description,
        flashcards,
      }
  
      await fetch(`https://luminous-learn.onrender.com/api/flashcards/update_set/${params.type}/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
  
      router.push(`/flashcards/${params.type}/${params.id}`)
    } catch (error) {
      console.error("Error saving flashcard set:", error)
    } finally {
      setIsSaving(false)
    }
  }  

  if (pageLoading){
    return (<AppShell><DashboardLoading/></AppShell>)
  }

  return (
    <AppShell>
      <div className="space-y-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 pt-12 pb-24 max-w-5xl mx-auto">
        <div className="mt-8 mb-8">
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
            <h1 className="text-3xl font-display glow-text mb-2">Edit Flashcard Set</h1>
            <p className="text-muted-foreground">Customize your flashcards for optimal learning</p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full w-fit border select-none 
            border-border shadow-sm
            bg-muted/50 text-muted-foreground">
            {isCourse ? (
              <>
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary">Category: Course</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-secondary" />
                <span className="text-secondary">Category: Quick Learn</span>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Flashcard Set Title</label>
              <Input ref={titleInputRef} value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-md" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Description (optional)</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="max-w-md" />
            </div>
          </div>

          <div className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Flashcards</h2>
              <Button onClick={handleAddCard} className={isCourse ? "glow-button" : "glow-button-pink"} variant={isCourse ? "default" : "secondary"}>Add Card</Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={flashcards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {flashcards.map((card, index) => (
                    <SortableCard
                      key={card.id}
                      id={card.id}
                      card={card}
                      index={index}
                      onUpdate={handleUpdateCard}
                      onDelete={handleDeleteCard}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {flashcards.length === 0 && (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  No flashcards yet. Click &ldquo;Add Card&ldquo; to create your first flashcard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border z-5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-end gap-6">
          <Button variant="outline" onClick={() => router.push("/flashcards")} className="gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              flashcards.length === 0 ||
              !title.trim() ||
              flashcards.some((c) => !c.front.trim() || !c.back.trim())
            }
            className={isCourse ? "glow-button gap-2" : "glow-button-secondary gap-2"}
            variant={isCourse ? "default" : "secondary"}
          >
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Flashcards"}
          </Button>
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
        Loading your Edit page...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}