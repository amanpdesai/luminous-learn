"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSidebar } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"
import { PlusIcon, TrashIcon, Loader2Icon, Sparkles, CheckIcon } from "lucide-react"
import Link from "next/link"
import { Label } from "@radix-ui/react-label"
import { backendUrl } from "@/lib/backendUrl"

interface Lesson {
  lesson: string
  lesson_summary: string
  learning_objectives?: string[]
}  

interface UnitType {
  unit_number: number
  title: string
  unit_description: string
  lesson_outline: Lesson[]
}

interface CourseType {
  title: string
  description: string
  estimated_duration_hours_per_week: number
  estimated_number_of_weeks: number
  level: string
  depth: string
  units: UnitType[]
}

const steps = [
  "Analyzing Syllabus",
  "Confirming Lesson Outlines",
  "Creating Lesson Generating Threads",
  "Generating Lesson Specific Content",
  "Gathering Data",
  "Finalizing Course",
]

export default function CourseOutlineEditor() {
  const [generationStep, setGenerationStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [units, setUnits] = useState<UnitType[]>([])
  const [courseTitle, setCourseTitle] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [hoursPerWeek, setHoursPerWeek] = useState("")
  const [numberOfWeeks, setNumberOfWeeks] = useState("")
  const [courseLevel, setCourseLevel] = useState("")
  const [courseDepth, setCourseDepth] = useState("")
  const originalData = useRef<CourseType | null>(null)

  const router = useRouter()
  const { open: isSidebarOpen } = useSidebar()

  useEffect(() => {
    const fetchDraft = async () => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) router.push("/auth")
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
  
      const raw = localStorage.getItem("draftCourseOutline")
      if (!raw) {
        console.warn("No draft found in localStorage")
        router.push("/courses/create")
        return
      }
  
      let parsedJSON
      try {
        parsedJSON = JSON.parse(raw)
      } catch (err) {
        console.error("Failed to parse draft JSON:", err)
        router.push("/courses/create")
        return
      }
  
      // Try to extract the course data
      const parsed = parsedJSON.course ?? parsedJSON
  
      console.log("Parsed draft course:", parsed)
  
      if (!parsed || !parsed.title || !parsed.units) {
        console.warn("Parsed draft missing required fields:", parsed)
        router.push("/courses/create")
        return
      }
      
      checkAuth()
      originalData.current = parsed as CourseType
      setCourseTitle(parsed.title)
      setCourseDescription(parsed.description)
      setHoursPerWeek(parsed.estimated_duration_hours_per_week.toString())
      setNumberOfWeeks(parsed.estimated_number_of_weeks.toString())
      setUnits(parsed.units || [])
      setCourseLevel(parsed.level)
      setCourseDepth(parsed.depth)
      setIsLoading(false)
    }
  
    fetchDraft()
  }, [router])  

  const handleAddUnit = () => setUnits([...units, { unit_number: units.length + 1, title: "", unit_description: "", lesson_outline: [] }])
  const handleDeleteUnit = (i: number) => setUnits(units.filter((_, idx) => idx !== i))

  const handleAddLesson = (i: number) => {
    const updated = [...units]
    updated[i].lesson_outline.push({ lesson: "", lesson_summary: "" })
    setUnits(updated)
  }

  const handleDeleteLesson = (u: number, l: number) => {
    const updated = [...units]
    updated[u].lesson_outline.splice(l, 1)
    setUnits(updated)
  }

  const updateUnitField = <K extends keyof UnitType>(i: number, field: K, value: UnitType[K]) => {
    const updated = [...units]
    updated[i][field] = value
    setUnits(updated)
  }  

  const updateLessonField = (
    u: number,
    l: number,
    field: Exclude<keyof Lesson, "learning_objectives">,
    value: string
  ) => {
    const updated = [...units]
    const originalLesson = originalData.current?.units?.[u]?.lesson_outline?.[l]

    // Invalidate learning objectives if the field was changed
    if (originalLesson && updated[u].lesson_outline[l].learning_objectives) {
      if (field === "lesson" && value !== originalLesson.lesson) {
        delete updated[u].lesson_outline[l].learning_objectives
      }
      if (field === "lesson_summary" && value !== originalLesson.lesson_summary) {
        delete updated[u].lesson_outline[l].learning_objectives
      }
    }
  
    updated[u].lesson_outline[l][field] = value
    setUnits(updated)
  }  

  const isValidCourse =
    (courseTitle ?? "").trim() !== "" &&
    (courseDescription ?? "").trim() !== "" &&
    units.length > 0 &&
    units.every(unit =>
      unit.title.trim() !== "" &&
      unit.unit_description.trim() !== "" &&
      unit.lesson_outline.length > 0 &&
      unit.lesson_outline.every(lesson =>
        lesson.lesson.trim() !== "" && lesson.lesson_summary.trim() !== ""
      )
    )

    const handleSaveDraft = async () => {
      localStorage.removeItem("draftCourseOutline")
      setIsSaving(true)
    
      try {
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token
        const user = session.data.session?.user
        if (!user || !token) throw new Error("Not logged in")

        units.flatMap(unit =>
          unit.lesson_outline.map(lesson => ({
            unit_number: unit.unit_number,
            lesson: lesson.lesson,
            lesson_summary: lesson.lesson_summary,
            learning_objectives: lesson.learning_objectives || []
          }))
        )
    
        const courseData = {
          title: courseTitle,
          description: courseDescription,
          estimated_duration_hours_per_week: parseInt(hoursPerWeek),
          estimated_number_of_weeks: parseInt(numberOfWeeks),
          level: courseLevel,
          depth: courseDepth,
          units: units.map((unit) => ({
            unit_number: unit.unit_number,
            title: unit.title,
            unit_description: unit.unit_description,
            lesson_outline: unit.lesson_outline,
          })),
          is_draft: true,
          last_accessed: new Date().toISOString(),
          completed: 0, // <-- this is the key addition
        }
    
        const response = await fetch(`${backendUrl}/api/save_draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        })
    
        if (!response.ok) throw new Error("Failed to save draft")
    
        router.push("/courses")
      } catch (err) {
        console.error("Error saving draft:", err)
        alert("Failed to save draft. Please try again.")
      } finally {
        setIsSaving(false)
      }
    }    

    const handlePublish = async () => {
      localStorage.removeItem("draftCourseOutline")
      setIsPublishing(true)
    
      try {
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token
        if (!token) throw new Error("Not authenticated")
    
        const now = new Date().toISOString()
    
        units.flatMap(unit =>
          unit.lesson_outline.map(lesson => ({
            unit_number: unit.unit_number,
            lesson: lesson.lesson,
            lesson_summary: lesson.lesson_summary,
            learning_objectives: lesson.learning_objectives || []
          }))
        )
    
        const draft = {
          title: courseTitle,
          description: courseDescription,
          estimated_duration_hours_per_week: parseInt(hoursPerWeek),
          estimated_number_of_weeks: parseInt(numberOfWeeks),
          level: courseLevel,
          depth: courseDepth,
          units: units.map(unit => ({
            unit_number: unit.unit_number,
            title: unit.title,
            unit_description: unit.unit_description,
            lesson_outline: unit.lesson_outline,
          })),
          is_draft: false,
          last_accessed: now,
          completed: 0
        }
    
        const response = await fetch(`${backendUrl}/api/generate_course`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(draft),
        })

        for (let i = 0; i < steps.length; i++) {
          setGenerationStep(i)
          await new Promise((resolve) => setTimeout(resolve, 1200))
        }
    
        if (!response.ok) throw new Error("Failed to publish course")
        const result = await response.json()
        const generatedCourseId = result[0].id
    
        router.push(`/courses/${generatedCourseId}`)
      } catch (err) {
        console.error("Error publishing course:", err)
        alert("Failed to publish course. Please try again.")
      } finally {
        setIsPublishing(false)
      }
    }    

    if (isLoading) {
      return <AppShell><DashboardLoading /></AppShell>
    }
    
    if (isPublishing){
      return (
        <AppShell>
          <div className="w-full px-6 md:px-12 xl:px-24 max-w-4xl mx-auto mt-24">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-display glow-text">Creating Your Course</h1>
              <div className="w-full max-w-md space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        index <= generationStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < generationStep ? <CheckIcon className="h-5 w-5" /> : <span>{index + 1}</span>}
                    </div>
                    <span className={index <= generationStep ? "text-foreground" : "text-muted-foreground"}>{step}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground">
                This may take a minute. We&apos;re crafting a personalized course structure for you.
              </p>
            </div>
          </div>
        </AppShell>
      )
    }

  return (
    <AppShell>
      <div className="w-full px-6 md:px-12 xl:px-24 mx-auto my-4 space-y-6">
        <h1 className="text-3xl font-display glow-text">Course Outline Customizer</h1>

        <div className="bg-card border border-border/50 rounded-lg p-6 mb-20 space-y-6">
          <div className="space-y-4">
            <Label className="pb-4">Course Title</Label>
            <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />

            <Label>Course Description</Label>
            <Textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hours per Week</Label>
                <Input value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} />
              </div>
              <div>
                <Label>Number of Weeks</Label>
                <Input value={numberOfWeeks} onChange={e => setNumberOfWeeks(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {units.map((unit, i) => (
              <div key={i} className="border border-border/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">{i + 1}</div>
                    <Input value={unit.title} onChange={e => updateUnitField(i, "title", e.target.value)} className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => handleAddLesson(i)}><PlusIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUnit(i)}><TrashIcon className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Textarea value={unit.unit_description} onChange={e => updateUnitField(i, "unit_description", e.target.value)} placeholder="Unit Description" />

                <div className="pl-6 space-y-3">
                  {unit.lesson_outline.map((lesson, j) => (
                    <div key={j} className="border border-border/50 rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs">{j + 1}</div>
                          <Input value={lesson.lesson} onChange={e => updateLessonField(i, j, "lesson", e.target.value)} className="flex-1" />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(i, j)}><TrashIcon className="h-4 w-4" /></Button>
                      </div>
                      <Textarea
                        value={lesson.lesson_summary}
                        onChange={e => updateLessonField(i, j, "lesson_summary", e.target.value)}
                        placeholder="Lesson Summary"
                      />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleAddLesson(i)}><PlusIcon className="mr-2 h-3 w-3" /> Add Lesson</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAddUnit}><PlusIcon className="mr-2 h-4 w-4" /> Add Unit</Button>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/40 p-4">
          <div className="w-full px-6 md:px-12 xl:px-24 mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
            <Button variant="outline" asChild className={cn("transition-all", isSidebarOpen ? "ml-44" : "ml-0")}>
              <Link href="/courses">Cancel</Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? (<><Loader2Icon className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : "Save Draft"}
              </Button>
              <Button className="glow-button" onClick={handlePublish} disabled={isPublishing || !isValidCourse}>
                {isPublishing ? (<><Loader2Icon className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : "Create Course"}
              </Button>
            </div>
          </div>
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
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-primary">
        Loading your Course Editor...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}