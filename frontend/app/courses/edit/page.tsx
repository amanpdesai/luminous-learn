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
import { PlusIcon, TrashIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import { Label } from "@radix-ui/react-label"
import tempData from "../../../../backend/temp/test_course.json"

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

export default function CourseOutlineEditor() {
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
          })),
          is_draft: true,
          last_accessed: new Date().toISOString(),
          completed: 0, // <-- this is the key addition
        }
    
        const response = await fetch("http://localhost:8080/api/save_draft", {
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
    
        const unitLessons = units.flatMap(unit =>
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
    
        const response = await fetch("http://localhost:8080/api/generate_course", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(draft),
        })
    
        if (!response.ok) throw new Error("Failed to publish course")
    
        router.push("/courses")
      } catch (err) {
        console.error("Error publishing course:", err)
        alert("Failed to publish course. Please try again.")
      } finally {
        setIsPublishing(false)
      }
    }    

  if (isLoading) return <div className="text-center text-muted-foreground py-12">Loading course data...</div>

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