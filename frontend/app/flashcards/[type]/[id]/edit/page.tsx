"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, GripVertical, Save, Trash2, X } from "lucide-react"
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

function SortableCard({
  id,
  card,
  index,
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
  const params = useParams() as { type: string; id: string } ;
  const { type, id } = params
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [flashcards, setFlashcards] = useState<Array<{ id: string; front: string; back: string }>>([])
  const [isSaving, setIsSaving] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const isCourse = params.type === "course"

  useEffect(() => {
    if (isCourse) {
      setTitle(
        params.id === "1"
          ? "Introduction to Python Programming"
          : params.id === "2"
          ? "Web Development Fundamentals"
          : "Data Science Essentials"
      )
      setDescription("Flashcards for course material")
    } else {
      setTitle(
        params.id === "1"
          ? "JavaScript Promises"
          : params.id === "2"
          ? "CSS Grid Layout"
          : params.id === "3"
          ? "React Hooks"
          : "Python List Comprehensions"
      )
      setDescription("Flashcards for quick learning session")
    }

    const mockFlashcards = isCourse
      ? [
          {
            id: "1",
            front: "What is a variable in Python?",
            back: "A variable is a named location in memory that stores a value. In Python, variables are created when you assign a value to them.",
          },
          {
            id: "2",
            front: "What is the difference between a list and a tuple in Python?",
            back: "Lists are mutable (can be changed after creation) while tuples are immutable (cannot be changed after creation). Lists use square brackets [] and tuples use parentheses ().",
          },
          {
            id: "3",
            front: "What is a function in Python?",
            back: "A function is a block of organized, reusable code that performs a specific task. Functions are defined using the 'def' keyword.",
          },
          {
            id: "4",
            front: "What is object-oriented programming?",
            back: "Object-oriented programming (OOP) is a paradigm based on the concept of 'objects', which can contain data and code.",
          },
          {
            id: "5",
            front: "What is inheritance in OOP?",
            back: "Inheritance allows a new class (child) to inherit attributes and methods from an existing class (parent).",
          },
        ]
      : [
          {
            id: "1",
            front: "What is a Promise in JavaScript?",
            back: "A Promise is an object representing the eventual completion or failure of an async operation.",
          },
          {
            id: "2",
            front: "What are the three states of a Promise?",
            back: "Pending, Fulfilled, Rejected.",
          },
          {
            id: "3",
            front: "How do you create a new Promise?",
            back: "Using new Promise((resolve, reject) => { ... })",
          },
          {
            id: "4",
            front: "What is the purpose of the .then() method?",
            back: ".then() specifies what to do when the Promise is fulfilled.",
          },
          {
            id: "5",
            front: "What is the purpose of the .catch() method?",
            back: ".catch() handles errors in the Promise chain.",
          },
        ]

    setFlashcards(mockFlashcards)
    titleInputRef.current?.focus()
  }, [isCourse, params.id])

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

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      router.push(`/flashcards/${params.type}/${params.id}`)
    }, 1000)
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
              <Button onClick={handleAddCard} className="glow-button">Add Card</Button>
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
                  No flashcards yet. Click "Add Card" to create your first flashcard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-end gap-4">
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
            className="glow-button gap-2"
          >
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Flashcards"}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}