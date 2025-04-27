"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Sparkles, Plus, BookOpen, Clock, Filter } from "lucide-react"
import { parseISO, formatDistanceToNowStrict } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AppShell } from "@/components/layout/app-shell"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"

type Course = {
  id: string
  title: string
  description: string
  progress: number
  lastAccessed: string
  lessons: number
  completed: number
  currentUnit: number
  currentLesson: number
}

type RawCourse = {
  id: string
  title?: string
  description?: string
  created_at?: string
  last_accessed?: string
  completed?: number
  is_draft?: boolean
  unit_lessons?: {
    lesson: string
    unit_number: number
    status: string
  }[]
  units?: {
    unit_number: number
    lesson_outline: {
      lesson: string
    }[]
  }[]
}

type SortOption = "progress_asc" | "progress_desc" | "lessons_asc" | "lessons_desc" | "lastAccessed_asc" | "lastAccessed_desc"

export default function CoursesPage() {
  const [pageLoading, setPageLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("lastAccessed_desc")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/auth")
    }
    
    const fetchData = async () => {
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
    
      try {
        const response = await fetch("http://localhost:8080/api/get_user_courses", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
    
        if (!response.ok) {
          console.error("Failed to fetch courses")
          return
        }
    
        const rawCourses = await response.json()
    
        const shapedCourses = (rawCourses as RawCourse[]).map((course) => {
          const totalLessons = course.unit_lessons?.length ?? 0
          const completedLessons = course.completed ?? 0
          const isDraft = course.is_draft === true
          
          // Determine current lesson and unit based on progress
          let currentUnit = 1
          let currentLesson = 0
          
          // If we have unit_lessons, find the first incomplete lesson
          if (Array.isArray(course.unit_lessons) && course.unit_lessons.length > 0) {
            const incompleteLesson = course.unit_lessons.find(
              (lesson: NonNullable<RawCourse["unit_lessons"]>[number]) => lesson.status !== "completed"
            )            
            
            if (incompleteLesson) {
              // Use the first incomplete lesson
              currentUnit = incompleteLesson.unit_number || 1
              
              // Find the index of this lesson within its unit
              if (Array.isArray(course.units)) {
                const unitIndex = course.units.findIndex(
                  (unit: NonNullable<RawCourse["units"]>[number]) => unit.unit_number === currentUnit
                )                
                
                if (unitIndex >= 0 && Array.isArray(course.units[unitIndex]?.lesson_outline)) {
                  const lessonIndex = course.units[unitIndex].lesson_outline.findIndex(
                    (outline: NonNullable<RawCourse["units"]>[number]["lesson_outline"][number]) => outline.lesson === incompleteLesson.lesson
                  )                  
                  
                  if (lessonIndex >= 0) {
                    currentLesson = lessonIndex
                  }
                }
              }
            }
          }
        
          return {
            id: course.id,
            title: isDraft 
              ? `DRAFT: ${course.title ?? "Untitled Course"}`
              : course.title ?? "Untitled Course",
            description: course.description ?? "No description provided.",
            progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            lastAccessed: course.last_accessed ?? course.created_at ?? new Date().toISOString(),
            lessons: totalLessons,
            completed: completedLessons,
            currentUnit,
            currentLesson,
          }
        })        
    
        setCourses(shapedCourses)
      } catch (err) {
        console.error("Error fetching courses:", err)
      }
    }    
  
    checkAuth();
    Promise.all([
      fetchData()
    ]).finally(() => setPageLoading(false));
  }, [router])  

  const handleDeleteCourse = async (courseId: string) => {
    setIsDeleting(true);
    setDeleteTarget(courseId);
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("You must be logged in to delete a course");
      }
      
      const response = await fetch(`http://localhost:8080/api/delete_course/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete course");
      }
      
      // Remove the course from the state
      setCourses(courses.filter(course => course.id !== courseId));
      
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  
    const [key, direction] = sortOption.split("_")
    filtered.sort((a, b) => {
      if (key === "lastAccessed") {
        const dateA = new Date(a.lastAccessed).getTime()
        const dateB = new Date(b.lastAccessed).getTime()
        return direction === "asc" ? dateA - dateB : dateB - dateA
      } else {
        const valA = a[key as keyof Course] as number
        const valB = b[key as keyof Course] as number
        return direction === "asc" ? valA - valB : valB - valA
      }
    })
  
    return filtered
  }, [courses, searchTerm, sortOption])  
  
  if (pageLoading) {
    
    return (<div className="flex-1 w-full mx-auto">
      <AppShell>
        <DashboardLoading />
      </AppShell>
        </div>)
  }

  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display glow-text mb-1">My Courses</h1>
              <p className="text-muted-foreground">Manage and continue your learning journey</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="w-[250px] pl-8 rounded-lg border-border/40 bg-muted/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[
                    ["progress", "Progress"],
                    ["lessons", "Lessons"],
                    ["lastAccessed", "Last Accessed"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <DropdownMenuItem onClick={() => setSortOption(`${key}_asc` as SortOption)}>
                        {label} ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption(`${key}_desc` as SortOption)}>
                        {label} ↓
                      </DropdownMenuItem>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="glow-button w-full sm:w-auto" asChild>
                <Link href="/courses/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedCourses.map((course) => {
              const isDraft = course.title.startsWith("DRAFT:")
              const cleanTitle = isDraft ? course.title.replace(/^DRAFT:\s*/, "") : course.title

              return (
                <Card key={course.id} className="border-border/50 card-hover group">
                  <CardHeader className="pb-3">
                  {isDraft ? (
                    <span className="text-[10px] uppercase text-yellow-500 font-semibold tracking-widest mb-1 block">
                      Draft
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-primary mb-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Course</span>
                    </div>
                  )}
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {cleanTitle}
                    </CardTitle>
                    <CardDescription className="mt-1.5 line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-4">
                      {!isDraft && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span className="text-primary font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{course.lessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDistanceToNowStrict(parseISO(course.lastAccessed), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-3 pt-3">
                    {isDraft ? (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}/edit`}>Edit Outline</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCourse(course.id)}
                          disabled={isDeleting && deleteTarget === course.id}
                        >
                          {isDeleting && deleteTarget === course.id ? 'Deleting...' : 'Delete Outline'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}`}>View Syllabus</Link>
                        </Button>
                        <Button size="sm" className="glow-button" asChild>
                          <Link href={`/courses/${course.id}/lesson/${course.currentUnit ?? 1}/${course.currentLesson ?? 0}`}>Continue</Link>
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              )
            })}

            {/* Always Visible Create Card */}
            <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
              <CardContent className="flex flex-col items-center justify-center h-full py-10">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Create New Course</h3>
                <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
                  Generate a personalized learning experience with AI-powered course creation
                </p>
                <Button className="glow-button" asChild>
                  <Link href="/courses/create">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-primary">
        Loading your Courses...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}