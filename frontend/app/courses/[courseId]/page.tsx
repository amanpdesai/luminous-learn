"use client"

import { useState } from "react"
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
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AppShell } from "@/components/layout/app-shell"
import { useParams } from "next/navigation"

export default function CoursePage() {
  const params = useParams()
  // State to track which units are expanded
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({
    0: true, // First unit expanded by default
  })

  // Mock course data based on the Python course example
  const course = {
    id: params.courseId,
    title: "Introduction to Python Programming",
    description:
      "This course is designed for beginners who want to learn the basics of Python programming. Through a series of progressively challenging units, students will gain a foundational understanding of Python syntax, concepts, and the ability to write simple programs.",
    duration: "3 weeks",
    hoursPerWeek: "10 hours/week",
    level: "Beginner",
    prerequisites: "None",
    progress: 0,
    lastAccessed: "2025-03-26T06:22:33.676Z",
    units: [
      {
        id: 1,
        title: "Getting Started with Python",
        progress: 0,
        totalLessons: 5,
        completedModules: 0,
        lessons: [
          {
            id: 1,
            title: "Installing Python and Setting Up the Development Environment",
            type: "lesson",
            duration: "15 min",
            status: "in progress",
          },
          {
            id: 2,
            title: "Installing Python and Understanding the Interpreter",
            type: "video",
            duration: "20 min",
            status: "not started",
          },
          {
            id: 3,
            title: "Python Installation and Environment Setup Quiz",
            type: "quiz",
            duration: "10 min",
            status: "not started",
          },
          {
            id: 4,
            title: "Write Your First Python Script",
            type: "lesson",
            duration: "30 min",
            status: "not started",
          },
          {
            id: 5,
            title: "Video Lecture: Learn Python - Full Course for Beginners",
            type: "video",
            duration: "45 min",
            status: "not started",
          },
        ],
      },
      {
        id: 2,
        title: "Data Types and Variables",
        progress: 0,
        totalLessons: 5,
        completedModules: 0,
        lessons: [
          {
            id: 1,
            title: "Understanding Basic Syntax and Expressions",
            type: "lesson",
            duration: "20 min",
            status: "not started",
          },
          {
            id: 2,
            title: "Variables and Data Types in Python",
            type: "video",
            duration: "25 min",
            status: "not started",
          },
          {
            id: 3,
            title: "Practice with Variables and Data Types",
            type: "exercise",
            duration: "30 min",
            status: "not started",
          },
          {
            id: 4,
            title: "Data Types Quiz",
            type: "quiz",
            duration: "15 min",
            status: "not started",
          },
          {
            id: 5,
            title: "Advanced Data Types",
            type: "lesson",
            duration: "35 min",
            status: "not started",
          },
        ],
      },
      {
        id: 3,
        title: "Control Structures",
        progress: 0,
        totalLessons: 4,
        completedModules: 0,
        lessons: [
          {
            id: 1,
            title: "Conditional Statements (if, elif, else)",
            type: "lesson",
            duration: "25 min",
            status: "not started",
          },
          {
            id: 2,
            title: "Loops in Python (for and while)",
            type: "video",
            duration: "30 min",
            status: "not started",
          },
          {
            id: 3,
            title: "Control Structures Practice",
            type: "exercise",
            duration: "40 min",
            status: "not started",
          },
          {
            id: 4,
            title: "Control Structures Assessment",
            type: "quiz",
            duration: "20 min",
            status: "not started",
          },
        ],
      },
      {
        id: 4,
        title: "Functions and Modules",
        progress: 0,
        totalLessons: 5,
        completedModules: 0,
        lessons: [
          {
            id: 1,
            title: "Creating and Using Functions",
            type: "lesson",
            duration: "30 min",
            status: "not started",
          },
          {
            id: 2,
            title: "Function Parameters and Return Values",
            type: "video",
            duration: "25 min",
            status: "not started",
          },
          {
            id: 3,
            title: "Python Modules and Packages",
            type: "lesson",
            duration: "35 min",
            status: "not started",
          },
          {
            id: 4,
            title: "Functions and Modules Practice",
            type: "exercise",
            duration: "45 min",
            status: "not started",
          },
          {
            id: 5,
            title: "Functions and Modules Assessment",
            type: "quiz",
            duration: "25 min",
            status: "not started",
          },
        ],
      },
    ],
  }

  const totalLessons = course.units.reduce((total, unit) => total + unit.totalLessons, 0)

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
                  <Button variant="default" className="glow-button">
                    Continue Learning
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
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.hoursPerWeek}</span>
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
                  {course.units.length} units • {course.units.reduce((acc, unit) => acc + unit.totalLessons, 0)} lessons
                </span>
                <span>{course.units.reduce((acc, unit) => acc + unit.completedModules, 0)} completed</span>
              </div>
              <Progress value={course.progress} className="h-2 mb-6" />
            </div>

            <div className="space-y-4">
              {course.units.map((unit, unitIndex) => (
                <div key={unitIndex} className="border border-border/50 rounded-lg overflow-hidden">
                  {/* Unit Header */}
                  <button
                    onClick={() => toggleUnit(unitIndex)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {unitIndex + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">{unit.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {unit.lessons.length} lessons • {unit.completedModules} completed
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
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <Link
                          href={`/courses/${course.id}/lesson/${unit.id}/${lesson.id}`}
                          key={lessonIndex}
                          className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors border-b border-border/30 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                              {getModuleIcon(lesson.type)}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{lesson.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground capitalize">{lesson.type}</span>
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                <span
                                  className={`text-xs ${
                                    lesson.status === "completed"
                                      ? "text-green-500"
                                      : lesson.status === "in progress"
                                        ? "text-amber-500"
                                        : "text-muted-foreground"
                                  } capitalize`}
                                >
                                  {lesson.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Play className="h-4 w-4" />
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar with course info and progress */}
          <div className="mt-8 lg:mt-0 lg:w-80">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Progress</h3>
                  <Progress value={course.progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{course.progress}% complete</span>
                    <span>Last accessed {new Date(course.lastAccessed).toLocaleDateString()}</span>
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
                      <dd>{totalLessons}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Level</dt>
                      <dd>{course.level}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Duration</dt>
                      <dd>{course.duration}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Time Commitment</dt>
                      <dd>{course.hoursPerWeek}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Prerequisites</dt>
                      <dd>{course.prerequisites}</dd>
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
