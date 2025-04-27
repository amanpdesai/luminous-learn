"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Book,
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  FolderOpen,
  Lightbulb,
  Play,
  Sparkles,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AppShell } from "@/components/layout/app-shell"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

// Outline lesson (from units.lesson_outline)
type LessonOutline = {
  lesson: string
  lesson_summary: string
  learning_objectives: string[]
}

// Complete lesson (from unit_lessons)
type LessonComplete = {
  unit_number: number
  lesson: string
  lesson_summary: string
  learning_objectives: string[]
  readings: string
  examples: string
  exercises: string
  assessments: string
  additional_resources: Array<{unit_title: string, text: string, url: string}>
  duration_in_min: string
  status: string
}

type Unit = {
  unit_number: number
  title: string
  unit_description: string
  lesson_outline: LessonOutline[]
  progress?: number
  totalLessons?: number
  completedModules?: number
}

type Course = {
  id: string
  title: string
  description: string
  estimated_duration_hours_per_week: number
  estimated_number_of_weeks: number
  prerequisites: string[]
  final_exam_description?: string
  level: string
  depth: string
  units: Unit[]
  unit_lessons: LessonComplete[]
  is_draft: boolean
  last_accessed: string
  completed: number
  user_id: string
  // Calculated fields for UI display
  progress?: number
  duration?: string
  hoursPerWeek?: string
}


export default function CoursePage() {
  const [pageLoading, setPageLoading] = useState(true)
  const params = useParams()
  // State to track which units are expanded
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({
    0: true, // First unit expanded by default
  })
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/auth")
    }
    const fetchCourse = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
  
      const token = session.access_token
      if (!token) {
        console.error("Not authenticated")
        return
      }
  
      if (!params.courseId) {
        console.error("Missing course ID")
        return
      }
  
      try {
        const response = await fetch(`https://luminous-learn.onrender.com/api/get_user_course?course_id=${params.courseId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
  
        if (!response.ok) {
          console.error("Failed to fetch course")
          return
        }
  
        const rawCourse = await response.json()
  
        if (!rawCourse || rawCourse.error) {
          console.error("Course not found or unauthorized")
          return
        }
        console.log("Fetched course:", rawCourse)
        setCourse(rawCourse)
      } catch (err) {
        console.error("Error fetching course:", err)
      }
    }
    checkAuth()
    Promise.all([
      fetchCourse()
    ]).finally(() => setPageLoading(false));
  }, [params.courseId, router])
  

  // Calculate total lessons from lesson_outline count
  const totalLessons = course?.units?.reduce((total, unit) => {
    return total + (unit.lesson_outline ? unit.lesson_outline.length : 0);
  }, 0) || 0
  
  // Format duration and hours per week for display
  const duration = course ? `${course.estimated_number_of_weeks} weeks` : ''
  const hoursPerWeek = course ? `${course.estimated_duration_hours_per_week} hours/week` : ''
  
  // Calculate progress percentage
  const progressPercentage = course ? (course.completed / totalLessons) * 100 : 0

  // Find the current lesson based on progress
  const getCurrentLessonLink = () => {
    // Default to first unit, first lesson
    let currentUnit = 1;
    let currentLesson = 0;
    
    if (!course) return `${currentUnit}/${currentLesson}`;
    
    // If we have unit_lessons, find the first incomplete lesson
    if (Array.isArray(course.unit_lessons) && course.unit_lessons.length > 0) {
      const incompleteLesson = course.unit_lessons.find(
        lesson => lesson.status !== "completed"
      );
      
      if (incompleteLesson) {
        // Use the first incomplete lesson
        currentUnit = incompleteLesson.unit_number || 1;
        
        // Find the index of this lesson within its unit
        if (Array.isArray(course.units)) {
          const unitIndex = course.units.findIndex(
            unit => unit.unit_number === currentUnit
          );
          
          if (unitIndex >= 0 && Array.isArray(course.units[unitIndex]?.lesson_outline)) {
            const lessonIndex = course.units[unitIndex].lesson_outline.findIndex(
              outline => outline.lesson === incompleteLesson.lesson
            );
            
            if (lessonIndex >= 0) {
              currentLesson = lessonIndex;
            }
          }
        }
      }
    }
    
    return `${currentUnit}/${currentLesson}`;
  };
  
  const toggleUnit = (unitIndex: number) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitIndex]: !prev[unitIndex],
    }))
  }

  // Function to get the appropriate icon for lesson type
  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-red-400" />
      case "quiz":
        return <FileText className="h-4 w-4 text-purple-400" />
      case "exercise":
        return <BookOpen className="h-4 w-4 text-green-400" />
      case "lesson":
      default:
        return <Book className="h-4 w-4 text-blue-400" />
    }
  }

  if (pageLoading || !course){
    return (<AppShell><DashboardLoading></DashboardLoading></AppShell>)
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen">
        {/* Course Header Section */}
        <div className="bg-primary/10 dark:bg-primary/5 border-b border-border/40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-2">
              <Link
                href="/courses"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Link>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-2 bg-secondary/10 border-secondary/30 text-secondary"
                  >
                    {course.level}
                  </Button>
                  <h1 className="text-2xl md:text-3xl font-display glow-text mb-2">{course.title}</h1>
                  <p className="text-muted-foreground max-w-3xl">{course.description}</p>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  <Button variant="default" className="glow-button" asChild>
                    <Link href={`/courses/${course.id}/lesson/${getCurrentLessonLink()}`}>
                      Continue Learning
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{course.units.length} units</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{hoursPerWeek}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="flex-1 container mx-auto px-4 py-8 lg:flex lg:gap-8">
          {/* Main content area - Course units and lessons */}
          <div className="lg:flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-display mb-4">Course Content</h2>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  {course.units.length} units • {course.units.reduce((acc, unit) => acc + (unit.lesson_outline?.length || 0), 0)} lessons
                </span>
                <span>{course.unit_lessons?.filter(lesson => lesson.status === "completed").length || 0} completed</span>
              </div>
              <Progress value={course.progress} className="h-2 mb-6" />
            </div>

            <div className="space-y-4">
              {course.units?.map((unit, unitIndex) => {
                // Find lessons for this unit
                const unitLessons = course.unit_lessons.filter(
                  completeLesson => completeLesson.unit_number === unit.unit_number
                );
                
                // Count completed lessons
                const completedLessons = unitLessons.filter(
                  lesson => lesson.status === "completed"
                ).length;
                
                return (
                  <div key={unitIndex} className="border border-border/50 rounded-lg overflow-hidden">
                    {/* Unit Header */}
                    <button
                      onClick={() => toggleUnit(unitIndex)}
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {unit.unit_number}
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">{unit.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {unit.lesson_outline?.length || 0} lessons • {completedLessons} completed
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${expandedUnits[unitIndex] ? "rotate-180" : ""}`}
                      />
                    </button>
  
                    {/* Unit Modules (conditionally rendered) */}
                    {expandedUnits[unitIndex] && (
                      <div className="border-t border-border/30">
                        {unit.lesson_outline?.map((outlineLesson, lessonIndex) => {
                          // Try to find the complete lesson data
                          const completeLesson = unitLessons.find(complete => 
                            complete.lesson === outlineLesson.lesson
                          );
                          
                          // Default lesson type is "lesson"
                          const lessonType = "lesson";
                          
                          // Calculate duration from minutes to a human-readable format
                          const duration = completeLesson?.duration_in_min 
                            ? `${completeLesson.duration_in_min} min` 
                            : "30 min";
                          
                          return (
                            <Link
                              href={`/courses/${course.id}/lesson/${unit.unit_number}/${lessonIndex}`}
                              key={lessonIndex}
                              className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors border-b border-border/30 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                                  {getModuleIcon(lessonType)}
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">{outlineLesson.lesson || 'Untitled Lesson'}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-muted-foreground capitalize">{lessonType}</span>
                                    <span className="text-xs text-muted-foreground">{duration}</span>
                                    <span
                                      className={`text-xs ${
                                        completeLesson?.status === "completed"
                                          ? "text-green-500"
                                          : completeLesson?.status === "in progress"
                                            ? "text-amber-500"
                                            : "text-muted-foreground"
                                      } capitalize`}
                                    >
                                      {completeLesson && typeof completeLesson.status === 'string' 
                                        ? completeLesson.status.replace("_", " ") 
                                        : completeLesson?.status || "not started"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Play className="h-4 w-4" />
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar with course info and progress */}
          <div className="mt-8 lg:mt-0 lg:w-80">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Progress</h3>
                  <Progress value={progressPercentage} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{Math.round(progressPercentage)}% complete</span>
                    <span>Last accessed {new Date(course.last_accessed).toLocaleDateString()}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Course Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Units</dt>
                      <dd>{course.units.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Lessons</dt>
                      <dd>{totalLessons.toString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Level</dt>
                      <dd>{course.level}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Duration</dt>
                      <dd>{duration}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Time Commitment</dt>
                      <dd>{hoursPerWeek}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Prerequisites</dt>
                      <dd>{course.prerequisites?.join(', ') || 'None'}</dd>
                    </div>
                  </dl>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Concept Proficiency</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete quizzes and practice exercises to see your concept proficiency.
                  </p>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span className="text-sm">Take a quiz to gauge your understanding</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
        Loading your Course...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}