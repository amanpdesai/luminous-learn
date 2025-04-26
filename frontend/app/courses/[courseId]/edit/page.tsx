"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSidebar } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"
import { PlusIcon, TrashIcon, Loader2Icon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"

interface Lesson {
  title: string
  description: string
}

interface UnitType {
  title: string
  lessons: Lesson[]
}

interface CourseType {
  id: string
  title: string
  description: string
  units: UnitType[]
  is_draft: boolean
  estimated_duration_hours_per_week?: number
  estimated_number_of_weeks?: number
  prerequisites?: string[]
  final_exam_description?: string
  level?: string
  depth?: string
  unit_lessons?: any[]
  user_id: string
}

// Simple notification component as we don't have a toast component
const Notification = ({ message, type }: { message: string, type: 'success' | 'error' }) => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!show) return null;
  
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md px-4 py-2 shadow-md transition-all ${
      type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
    }`}>
      {type === 'success' ? (
        <CheckCircleIcon className="h-5 w-5 text-white" />
      ) : (
        <AlertCircleIcon className="h-5 w-5 text-white" />
      )}
      <span className="text-sm text-white">{message}</span>
    </div>
  );
};

export default function CourseOutlineEditor() {
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [units, setUnits] = useState<UnitType[]>([])
  const [courseTitle, setCourseTitle] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [courseData, setCourseData] = useState<CourseType | null>(null)
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null)
  
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string
  const { open: isSidebarOpen } = useSidebar()

  useEffect(() => {
    const fetchCourseDraft = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth")
          return
        }
        
        const token = session.access_token
        
        // Fetch the course draft from the database
        const response = await fetch(`http://localhost:8080/api/get_user_course?course_id=${courseId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch course data")
        }
        
        const data = await response.json()
        
        if (!data || !data.id) {
          throw new Error("Course not found or invalid data")
        }
        
        // Check if it's a draft
        if (!data.is_draft) {
          setError("This course is already published and cannot be edited as a draft.")
          setIsLoading(false)
          return
        }
        
        // Set course data
        setCourseData(data)
        setCourseTitle(data.title || "")
        setCourseDescription(data.description || "")
        
        // Parse units from data (if available)
        if (data.units && Array.isArray(data.units)) {
          setUnits(data.units)
        } else {
          // Default empty structure
          setUnits([])
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching course:", error)
        setError("Failed to load course data. Please try again.")
        setIsLoading(false)
      }
    }
    
    if (courseId) {
      fetchCourseDraft()
    }
  }, [courseId, router])

  const isValidCourse = useMemo(() => {
    return courseTitle.trim() !== "" &&
      courseDescription.trim() !== "" &&
      units.length > 0 &&
      units.every(unit =>
        unit.title.trim() !== "" &&
        unit.lessons.length > 0 &&
        unit.lessons.every(lesson => lesson.title.trim() !== "" && lesson.description.trim() !== "")
      )
  }, [courseTitle, courseDescription, units])

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true)
      
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
      
      const token = session.access_token
      
      // Prepare data to save
      const draftData = {
        title: courseTitle,
        description: courseDescription,
        units: units,
        is_draft: true,
      }
      
      // Make API request to update the draft
      const response = await fetch(`http://localhost:8080/api/update_draft/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(draftData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save draft")
      }
      
      // Show success notification
      setNotification({
        message: "Draft saved successfully",
        type: "success"
      })
      
      // Show notification before navigating
      setTimeout(() => {
        router.push("/courses")
      }, 1500)
    } catch (error) {
      console.error("Error saving draft:", error)
      // Show error notification
      setNotification({
        message: error instanceof Error ? error.message : "Failed to save draft",
        type: "error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
      
      const token = session.access_token
      
      // Prepare data for publishing (mark as not a draft)
      const publishData = {
        title: courseTitle,
        description: courseDescription,
        units: units,
        is_draft: false,
      }
      
      // Make API request to update and publish the course
      const response = await fetch(`http://localhost:8080/api/update_draft/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(publishData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to publish course")
      }
      
      // After publishing, generate the course content
      const generateResponse = await fetch(`http://localhost:8080/api/generate_course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId }),
      })
      
      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || "Failed to generate course content")
      }
      
      // Show success notification
      setNotification({
        message: "Course published successfully",
        type: "success"
      })
      
      // Show notification before navigating
      setTimeout(() => {
        router.push("/courses")
      }, 1500)
    } catch (error) {
      console.error("Error publishing course:", error)
      // Show error notification
      setNotification({
        message: error instanceof Error ? error.message : "Failed to publish course",
        type: "error"
      })
    } finally {
      setIsPublishing(false)
    }
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
  const handleDeleteUnit = (i: number) => {
    if (units.length > 1 || window.confirm("Are you sure you want to delete the only unit?")) {
      setUnits(units.filter((_, idx) => idx !== i))
    }
  }
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

  // Make sure we clear loading state if there's an issue with courseId
  useEffect(() => {
    if (!courseId) {
      setIsLoading(false)
      setError("Invalid course ID. Please select a valid course.")
    }
  }, [courseId])

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading course data...</p>
          </div>
        </div>
      </AppShell>
    )
  }
  
  if (error) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center space-y-4 max-w-md p-6 bg-card rounded-lg border border-border/50">
            <AlertCircleIcon className="h-8 w-8 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/courses">Go Back to Courses</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
        />
      )}
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
              <Button 
                className="glow-button" 
                onClick={handlePublish} 
                disabled={isPublishing || !isValidCourse}
                title={!isValidCourse ? "Complete all course sections before publishing" : "Publish this course"}
              >
                {isPublishing ? (
                  <><Loader2Icon className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}