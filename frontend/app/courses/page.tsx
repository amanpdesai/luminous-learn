"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Sparkles, Plus, Edit, BookOpen, Clock, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AppShell } from "@/components/layout/app-shell"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

type Course = {
  id: number
  title: string
  description: string
  progress: number
  lastAccessed: string
  lessons: number
  completed: number
}

type SortOption = "progress_asc" | "progress_desc" | "lessons_asc" | "lessons_desc" | "lastAccessed_asc" | "lastAccessed_desc"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("lastAccessed_asc")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/auth")
    }

    const fetchCourses = async () => {
      // Simulated fetch
      setCourses([
        { id: 1, title: "DRAFT: Python Basics", description: "Learn Python fundamentals", progress: 50, lastAccessed: "2 days ago", lessons: 10, completed: 5 },
        { id: 2, title: "Web Development Fundamentals", description: "HTML, CSS, and JS", progress: 90, lastAccessed: "Yesterday", lessons: 15, completed: 14 },
        { id: 3, title: "React for Beginners", description: "Learn React quickly", progress: 20, lastAccessed: "1 week ago", lessons: 8, completed: 2 },
      ])
    }

    checkAuth()
    fetchCourses()
  }, [router])

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses].filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortOption) {
      const [key, direction] = sortOption.split("_")
      result.sort((a, b) => {
        if (key === "lastAccessed") {
          return direction === "asc"
            ? a.lastAccessed.localeCompare(b.lastAccessed)
            : b.lastAccessed.localeCompare(a.lastAccessed)
        } else {
          const valA = a[key as keyof Course] as number
          const valB = b[key as keyof Course] as number
          return direction === "asc" ? valA - valB : valB - valA
        }
      })
    }

    return result
  }, [courses, searchTerm, sortOption])

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
                    ["lastAccessed", "Last Accessed"]
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
                <Link href="/create-course">
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
                    {isDraft && (
                      <span className="text-[10px] uppercase text-yellow-500 font-semibold tracking-widest mb-1 block">
                        Draft
                      </span>
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
                          <span className="text-muted-foreground">{course.lastAccessed}</span>
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}/edit`}>Delete Outline</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}`}>View Syllabus</Link>
                        </Button>
                        <Button size="sm" className="glow-button" asChild>
                          <Link href={`/courses/${course.id}`}>Continue</Link>
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
                  <Link href="/create-course">
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