"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSidebar } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"
import { PlusIcon, TrashIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import { Label } from "@radix-ui/react-label"

interface Lesson {
  title: string
  description: string
}

interface UnitType {
  title: string
  lessons: Lesson[]
}

export default function CourseOutlineEditor() {
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [units, setUnits] = useState<UnitType[]>([])
  const [courseTitle, setCourseTitle] = useState("Introduction to Python Programming")
  const [courseDescription, setCourseDescription] = useState("A comprehensive introduction to Python programming language, covering basic syntax, data structures, control flow, and practical applications.")
  const router = useRouter()
  const { open: isSidebarOpen } = useSidebar()

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push("/auth")

      // Simulated fetch
      setUnits([
        {
          title: "Getting Started with Python",
          lessons: [
            { title: "Introduction to Programming Concepts", description: "Basic programming concepts and why Python is a great first language" },
            { title: "Setting Up Your Python Environment", description: "Installing Python and setting up your development environment" },
            { title: "Your First Python Program", description: "Writing and running a simple 'Hello World' program" },
          ],
        },
        {
          title: "Python Basics",
          lessons: [
            { title: "Variables and Data Types", description: "Understanding different data types and how to use variables" },
            { title: "Operators and Expressions", description: "Working with arithmetic, comparison, and logical operators" },
            { title: "Input and Output", description: "Getting user input and displaying output" },
            { title: "Control Flow: Conditionals", description: "Using if, elif, and else statements for decision making" },
          ],
        },
        {
          title: "Data Structures",
          lessons: [
            { title: "Lists and Tuples", description: "Working with ordered collections of items" },
            { title: "Dictionaries and Sets", description: "Using key-value pairs and unordered collections" },
            { title: "String Manipulation", description: "Methods for working with text data" },
          ],
        },
      ])
      setIsLoading(false)
    }

    checkAuthAndFetch()
  }, [router])

  const isValidCourse =
    courseTitle.trim() !== "" &&
    courseDescription.trim() !== "" &&
    units.length > 0 &&
    units.every(unit =>
      unit.title.trim() !== "" &&
      unit.lessons.length > 0 &&
      unit.lessons.every(lesson => lesson.title.trim() !== "" && lesson.description.trim() !== "")
    )

  const handleSaveDraft = () => {
    setIsSaving(true)
    setTimeout(() => {
        setIsSaving(false)
        router.push("/courses")
    }, 1500)
  }

  const handlePublish = () => {
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      router.push("/courses")
    }, 2000)
  }

  const updateUnitTitle = (i: number, title: string) => {
    const updated = [...units]
    updated[i].title = title
    setUnits(updated)
  }

  const updateLessonTitle = (u: number, l: number, title: string) => {
    const updated = [...units]
    updated[u].lessons[l].title = title
    setUnits(updated)
  }

  const updateLessonDesc = (u: number, l: number, desc: string) => {
    const updated = [...units]
    updated[u].lessons[l].description = desc
    setUnits(updated)
  }

  const handleAddUnit = () => setUnits([...units, { title: "", lessons: [] }])
  const handleDeleteUnit = (i: number) => setUnits(units.filter((_, idx) => idx !== i))
  const handleAddLesson = (i: number) => {
    const updated = [...units]
    updated[i].lessons.push({ title: "", description: "" })
    setUnits(updated)
  }
  const handleDeleteLesson = (u: number, l: number) => {
    const updated = [...units]
    updated[u].lessons.splice(l, 1)
    setUnits(updated)
  }

  if (isLoading) return <div className="text-center text-muted-foreground py-12">Loading course data...</div>

  return (
    <AppShell>
      <div className="w-full px-6 md:px-12 xl:px-24 mx-auto my-4 space-y-6">
        <div className="md:hidden">
          <h1 className="text-3xl font-display glow-text">Course Outline Customizer</h1>
          <p className="text-muted-foreground">Review and customize your course structure before finalizing</p>
        </div>

        <div className="bg-card border border-border/50 rounded-lg p-6 mb-20">
          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Course Title</Label>
              <Input id="title" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="text-lg font-medium input-glow" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Course Description</Label>
              <Textarea id="description" value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className="h-24 input-glow resize-none" />
            </div>
          </div>

          <div className="space-y-6">
            {units.map((unit, i) => (
              <div key={i} className="border border-border/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">{i + 1}</div>
                    <Input value={unit.title} onChange={e => updateUnitTitle(i, e.target.value)} className="flex-1 text-base font-medium border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 input-glow" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAddLesson(i)}><PlusIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteUnit(i)}><TrashIcon className="h-4 w-4" /></Button>
                  </div>
                </div>

                <div className="pl-8 space-y-3">
                  {unit.lessons.map((lesson, j) => (
                    <div key={j} className="border border-border/50 rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs">{j + 1}</div>
                          <Input
                            value={lesson.title}
                            onChange={e => updateLessonTitle(i, j, e.target.value)}
                            className="flex-1 text-sm font-medium border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 input-glow"
                          />
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-2" onClick={() => handleDeleteLesson(i, j)}><TrashIcon className="h-3 w-3" /></Button>
                      </div>
                      <div className="pl-7">
                        <Textarea
                          value={lesson.description}
                          onChange={e => updateLessonDesc(i, j, e.target.value)}
                          className="text-xs border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 input-glow resize-none min-h-[60px]"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="ml-7" onClick={() => handleAddLesson(i)}><PlusIcon className="mr-2 h-3 w-3" /> Add Lesson</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAddUnit}><PlusIcon className="mr-2 h-4 w-4" /> Add Unit</Button>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/40 p-4">
          <div className="w-full px-6 md:px-12 xl:px-24 mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
            <Button variant="outline" asChild className={cn("transition-all", isSidebarOpen ? "ml-44" : "ml-0")}><Link href="/courses">Cancel</Link></Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>{isSaving ? (<><Loader2Icon className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : "Save Draft"}</Button>
              <Button className="glow-button" onClick={handlePublish} disabled={isPublishing || !isValidCourse}>{isPublishing ? (<><Loader2Icon className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : "Create Course"}</Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}