"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, FileText, Lightbulb, List, Sparkles, Video } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { MarkdownRenderer } from "@/components/ui/markdown-render"
import TurndownService from "turndown"
import { supabase } from "@/lib/supabaseClient"
import { backendUrl } from "@/lib/backendUrl"

// Type definitions for the course data structure
type Resource = {
  unit_title: string
  text: string
  url: string
}

interface Question {
  question: string;
  answer_choices: string[];
  correctAnswer: number;
}

interface Assessment {
  title: string;
  instructions?: string;
  questions: Question[];
}

type LessonComplete = {
  unit_number: number
  lesson: string
  lesson_summary: string
  learning_objectives: string[]
  readings: string
  examples: string
  exercises: string
  assessments: QuizQuestion
  additional_resources: Resource[]
  duration_in_min: string
  status: string
}

type LessonOutline = {
  lesson: string
  lesson_summary: string
  learning_objectives: string[]
}

type Unit = {
  unit_number: number
  title: string
  unit_description: string
  lesson_outline: LessonOutline[]
  unit_assessment: Assessment
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
}

// Type for quiz questions
type QuizQuestion = {
  question: string
  answer_choices: string[]
  answer: string
}

// Type for fallback lesson data
type FallbackLesson = {
  id: number
  title: string
  type: string
  duration: string
  status: string
}

// Type for the lesson data structure used in the UI
type LessonData = {
  id: string | number
  title: string
  type: string
  duration: string
  course: {
    id: string | string[]
    title: string
  }
  unit: {
    id: string | string[]
    title: string
    lessons: (LessonComplete | FallbackLesson)[]
  }
  content: string
  video: {
    url: string
    title: string
  }
  resources: {
    title: string
    url: string
    type: string
  }[]
  quiz: QuizQuestion
}

export default function ModulePage() {
  const [pageLoading, setPageLoading] = useState(true)
  const params = useParams()
  const [isMarkComplete, setIsMarkComplete] = useState(false)
  const router = useRouter()
  // Convert params to strings to prevent type errors
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId || ""
  const unitId = Array.isArray(params.unitId) ? params.unitId[0] : params.unitId || ""
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId || ""
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [unitLessons, setUnitLessons] = useState<LessonComplete[]>([])
  const [currentLessonData, setCurrentLessonData] = useState<LessonComplete | null>(null)

  // Fetch course and lesson data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }
    }
    const fetchCourseAndLesson = async () => {
      setLoading(true)
      
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
        // Fetch the course data
        const response = await fetch(`${backendUrl}/api/get_user_course?course_id=${courseId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          console.error("Failed to fetch course")
          return
        }
        
        const courseData = await response.json() as Course
        setCourse(courseData)
        
        // Get current unit
        const currentUnit = courseData.units.find(unit => unit.unit_number.toString() === unitId)
        
        if (!currentUnit) {
          console.error("Unit not found")
          return
        }
        
        // Get lessons for this unit from unit_lessons
        const lessonsForUnit = courseData.unit_lessons.filter(
          lesson => lesson.unit_number.toString() === unitId
        )
        
        setUnitLessons(lessonsForUnit)
        
        // Get the specific lesson data
        const lessonIndex = parseInt(lessonId as string)
        const lessonData = lessonsForUnit[lessonIndex] || null
        
        if (lessonData) {
          setCurrentLessonData(lessonData)
          // Check if lesson is already completed
          setIsCompleted(lessonData.status === "completed")
        }
      } catch (error) {
        console.error("Error fetching course or lesson:", error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
    Promise.all([
        fetchCourseAndLesson()
    ]).finally(() => setPageLoading(false));
  }, [courseId, unitId, lessonId, router])

  // Mock lessons data for fallback
  const [fallbackLessons] = useState<FallbackLesson[]>([
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
  ])

  // Generate lesson object from fetched data or use fallback
  const getLessonData = (): LessonData => {
    if (loading || !currentLessonData || !course || !unitLessons.length) {
      // Return fallback data if still loading or no data
      const currentFallbackLesson = fallbackLessons.find(
        (l) => l.id === Number.parseInt(lessonId as string)
      );
      
      return {
        id: lessonId || 0,
        title: currentFallbackLesson?.title || "Lesson",
        type: "lesson",
        duration: "15 min",
        course: {
          id: courseId || "",
          title: course?.title || "Course",
        },
        unit: {
          id: unitId || "",
          title: course?.units?.find(u => u.unit_number.toString() === unitId)?.title || "Unit",
          lessons: fallbackLessons,
        },
        content: currentLessonData?.readings || `<h2>Loading lesson content...</h2>`, // Use readings as content
        video: {
          url: "https://www.youtube.com/embed/YYXdXT2l-Gg", // Default video
          title: "Tutorial",
        },
        resources: currentLessonData?.additional_resources
          ? currentLessonData.additional_resources.map((resource: Resource) => ({
              title: resource.text.split(':')[0] || resource.text,
              url: resource.url,
              type: "documentation",
            }))
          : [
              {
                title: "Loading Resources...",
                url: "#",
                type: "documentation",
              },
            ],
        quiz: {
          question: "Which of the following statements about this lesson is true?",
          answer_choices: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A",
        },
      };
    } else {
      const currentUnit = course.units.find(u => u.unit_number.toString() === unitId);
      if (!currentUnit) {
        throw new Error("Unit not found");
      }
  
      return {
        id: currentLessonData.lesson || lessonId,
        title: currentLessonData.lesson || "Lesson",
        type: "lesson",
        duration: currentLessonData.duration_in_min ? `${currentLessonData.duration_in_min} min` : "15 min",
        course: {
          id: courseId,
          title: course.title,
        },
        unit: {
          id: unitId,
          title: currentUnit.title,
          lessons: unitLessons,
        },
        content: currentLessonData.readings || "",
        video: {
          url: "https://www.youtube.com/embed/YYXdXT2l-Gg",
          title: currentLessonData.lesson || "Tutorial",
        },
        resources: (currentLessonData.additional_resources || []).map((resource: Resource) => ({
          title: resource.text.split(':')[0] || resource.text,
          url: resource.url,
          type: "documentation",
        })),
        quiz: currentLessonData.assessments || {
          question: "Which of the following statements about this lesson is true?",
          answer_choices: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 1,
        },
      };
    }
  };
  
  const lesson = getLessonData();

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  })

  turndownService.addRule("fencedCodeBlock", {
    filter: (node) =>
      node.nodeName === "PRE" && node.firstChild !== null && (node.firstChild as HTMLElement).nodeName === "CODE",
    replacement: (content, node) => {
      const code = node.textContent || ""
      return `\n\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`
    },
  })

  const cleanedLessonContent = lesson.content || ""

  const handleAnswerSelection = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const handleQuizSubmit = () => {
    if (!currentLessonData?.assessments) {
      return
    }

    let correctCount = 0
    console.log("QUIZ ANSWERS")
    console.log(quizAnswers)
    if (currentLessonData.assessments.answer_choices[quizAnswers[0]] === currentLessonData.assessments.answer) {
      correctCount++
    }

    const score = correctCount === 1 ? 100 : 0;
    setQuizScore(score)
    setQuizSubmitted(true)
  }

  const markComplete = async (lessonTitle: string) => {
    if (isCompleted || !course) return;
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const user = session.data.session?.user;
      if (!user || !token) throw new Error("Not logged in");
  
      // Clone the unit_lessons array
      const updatedLessons = course.unit_lessons.map((lesson) => {
        if (lesson.lesson === lessonTitle) {
          // Update the matching lesson's status
          return { ...lesson, status: "completed" };
        }
        return lesson;
      });
  
      const courseData = {
        unit_lessons: updatedLessons,
        completed: course.completed + 1
      };
  
      const response = await fetch(`${backendUrl}/api/update_draft/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
  
      if (!response.ok) throw new Error("Failed to update lesson");

      setIsMarkComplete(true)
  
      // Optional: Update local course state if needed
      // setCourse(prev => prev ? { ...prev, unit_lessons: updatedLessons } : null);
  
      console.log("Lesson marked as completed!");
      setIsCompleted(true);
    } catch (err) {
      console.error("Error marking lesson as complete:", err);
      alert("Failed to update lesson. Please try again.");
    }
  };

  // Calculate current lesson index and navigation links
  const currentLessonIndex = parseInt(lessonId as string)
  const totalLessons = unitLessons.length || fallbackLessons.length

  let getCompletedRemaining = (course: Course | null, unitIndex: number) => {
    if (!course) return 0;
  
    const totalCompleted = course.completed || 0;
  
    // Sum up the lessons in all previous units
    const lessonsBeforeThisUnit = course.units
      .slice(0, unitIndex) // Take all units before this one
      .reduce((sum, unit) => sum + (unit.lesson_outline?.length || 0), 0);
  
    // Completed remaining for this unit
    const completedRemaining = totalCompleted - lessonsBeforeThisUnit;
  
    // It can't be negative (if somehow more completed than exist)
    return Math.max(0, completedRemaining);
  };
  

  let completedRemaining = getCompletedRemaining(course, parseInt(unitId) - 1);
  
  // Previous and next module links
  const prevModule = currentLessonIndex > 0 ? { id: currentLessonIndex - 1 } : null
  const nextModule = currentLessonIndex < totalLessons - 1 ? { id: currentLessonIndex + 1 } : null

  if (pageLoading){
    return (<AppShell><DashboardLoading></DashboardLoading></AppShell>);
  }
  console.log(lesson.quiz)

  return (
    <AppShell>
      <div className="flex flex-col">
        {/* Module header */}
        <div className="bg-muted/20 border-b border-border/40 py-4">
          <div className="px-4 lg:px-8 py-6 w-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Link href={`/courses/${courseId}`} className="hover:text-foreground transition-colors">
                  {lesson.course.title}
                </Link>
                <span>/</span>
                <span>{lesson.unit.title}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-display mb-3">{lesson.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  {lesson.type === "video" ? (
                    <Video className="h-4 w-4 text-red-400" />
                  ) : lesson.type === "quiz" ? (
                    <FileText className="h-4 w-4 text-purple-400" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="capitalize">{lesson.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{lesson.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for the unit - using exact same implementation as QuickLearn */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentLessonIndex + 1) / totalLessons) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="px-4 lg:px-8 py-6 w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar with lesson navigation */}
            <div className="hidden lg:block lg:w-80 shrink-0">
              <div className="sticky top-24 space-y-4">
                <h3 className="font-medium">Unit Lessons</h3>
                <ul className="space-y-2">
                  {(unitLessons.length > 0 ? unitLessons : fallbackLessons).map((m: LessonComplete | FallbackLesson, index: number) => (
                    <li key={index}>
                      <Link
                        href={`/courses/${params.courseId}/lesson/${params.unitId}/${index}`}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm ${
                          index === Number.parseInt(lessonId as string)
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="h-5 w-5 rounded-full bg-muted/70 flex items-center justify-center text-xs font-medium">
                          {completedRemaining >= index + 1 || (isMarkComplete && index === parseInt(lessonId)) ? <Check className="h-4 w-4 text-green-400" /> : <>{index + 1}</>}
                        </span>
                        <span className="whitespace-normal break-words leading-snug">
                          {'lesson' in m ? m.lesson : m.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0 mr-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="ml-8 w-full max-w-lg px-1 py-5 bg-muted/20 border border-border rounded-full mb-6 z-10 relative shadow-sm flex gap-1">
                  <TabsTrigger
                    value="content"
                    className="flex-1 px-10 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      data-[state=active]:text-white
                      data-[state=active]:bg-primary
                      data-[state=active]:shadow
                      data-[state=active]:glow-text"
                  >
                    {lesson.type === "video" ? "Video" : "Content"}
                  </TabsTrigger>

                  <TabsTrigger
                    value="quiz"
                    className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      data-[state=active]:text-white
                      data-[state=active]:bg-primary
                      data-[state=active]:shadow
                      data-[state=active]:glow-text"
                  >
                    Quiz
                  </TabsTrigger>

                  <TabsTrigger
                    value="resources"
                    className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      data-[state=active]:text-white
                      data-[state=active]:bg-primary
                      data-[state=active]:shadow
                      data-[state=active]:glow-text"
                  >
                    Resources
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="animate-in fade-in-50 duration-300">
                  <div className="w-full ml-8">
                    {lesson.type === "video" ? (
                      <div className="aspect-video mb-8">
                        <iframe
                          src={lesson.video.url}
                          title={lesson.video.title}
                          className="w-full h-full rounded-lg border border-border/50"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none mb-8">
                        <MarkdownRenderer content={cleanedLessonContent} />
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-border/40">
                      {prevModule ? (
                        <Button variant="outline" asChild>
                          <Link href={`/courses/${params.courseId}/lesson/${params.unitId}/${prevModule.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous Module
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous Module
                        </Button>
                      )}

                      {isCompleted ? (
                        <Button variant="outline" className="gap-2 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </Button>
                      ) : (
                        <Button onClick={() => markComplete(lesson.title)} className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}

                      {nextModule ? (
                        <Button className="glow-button" asChild>
                          <Link href={`/courses/${params.courseId}/lesson/${params.unitId}/${nextModule.id}`}>
                            Next Module
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        parseInt(params.unitId as string) < (course?.units.length || 0) - 1 ? (
                          <Button
                            className="glow-button"
                            onClick={() =>
                              router.push(`/courses/${params.courseId}/lesson/${(parseInt(params.unitId as string) + 1).toString()}/0`)
                            }
                          >
                            Next Unit
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            className="glow-button"
                            onClick={() => router.push("/courses")}
                          >
                            Back to Courses
                            <ArrowLeft className="ml-2 h-4 w-4" />
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="animate-in fade-in-50 duration-300">
                  <div className="w-full pl-2 lg:pl-4 space-y-8">
                    <div className="bg-muted/20 p-6 rounded-lg border border-border/40">
                      <h2 className="text-xl font-medium mb-4">Knowledge Check</h2>
                      <p className="mb-6 text-muted-foreground">
                        Test your understanding of the section content with this question.
                      </p>
      
                      <div className="space-y-8">
                      {lesson.quiz && (
                          <div className="space-y-4">
                            <h3 className="font-medium">
                              1. {lesson.quiz.question}
                            </h3>
                            <div className="space-y-2">
                            {lesson.quiz.answer_choices.map((option, oIndex) => {
                              const isUserSelected = quizAnswers[0] === oIndex
                              const isCorrectAnswer = lesson.quiz.answer_choices[oIndex] === lesson.quiz.answer
                              const isWrongSelected = isUserSelected && !isCorrectAnswer

                              return (
                                <div
                                  key={oIndex}
                                  className={`flex items-center p-3 rounded-md border border-border/40 gap-3
                                    ${quizSubmitted && isCorrectAnswer ? "bg-green-500/10 border-green-500/50" : ""}
                                    ${quizSubmitted && isWrongSelected ? "bg-red-500/10 border-red-500/50" : ""}
                                    ${!quizSubmitted && isUserSelected ? "bg-primary/10 border-primary/50" : ""}
                                    ${quizSubmitted ? "pointer-events-none" : "cursor-pointer hover:bg-muted/30"}
                                  `}
                                  onClick={() => !quizSubmitted && handleAnswerSelection(0, oIndex)}
                                >
                                  {/* bubble */}
                                  <div
                                    className={`
                                      flex items-center justify-center rounded-full
                                      h-5 w-5 min-w-[1.25rem] min-h-[1.25rem]
                                      border
                                      ${quizSubmitted && isCorrectAnswer
                                        ? "border-green-500 bg-green-500/20"
                                        : quizSubmitted && isWrongSelected
                                        ? "border-red-500 bg-red-500/20"
                                        : !quizSubmitted && isUserSelected
                                        ? "border-primary bg-primary/20"
                                        : "border-muted-foreground"
                                      }
                                    `}
                                  >
                                    {(quizSubmitted && isCorrectAnswer) || (!quizSubmitted && isUserSelected) ? (
                                      <div className={`h-2 w-2 rounded-full ${
                                        quizSubmitted && isCorrectAnswer ? "bg-green-500" : "bg-primary"
                                      }`} />
                                    ) : null}
                                  </div>

                                  {/* text */}
                                  <span className="text-sm leading-snug break-words">{option}</span>
                                </div>
                              )
                            })}
                            </div>
                          </div>
                        )}

                      </div>
      
                      {quizSubmitted ? (
                        <div className="mt-8 p-4 rounded-md bg-muted/30 text-center">
                          <h3 className="text-xl font-medium mb-2">Your Score: {quizScore}%</h3>
                          <p className="mb-4 text-muted-foreground">
                            {"Great job on completing the quiz!"}
                          </p>
                          <Button
                            onClick={() => {
                              setQuizAnswers({})
                              setQuizSubmitted(false)
                              setQuizScore(0)
                            }}
                            className="glow-button bg-primary hover:bg-primary/90"
                          >
                            Retry Quiz
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="mt-8 w-full glow-button bg-primary hover:bg-primary/90"
                          onClick={handleQuizSubmit}
                        >
                          Submit Answers
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="animate-in fade-in-50 duration-300">
                  <div className="w-full pl-2 lg:pl-4">
                    <h2 className="text-xl font-medium mb-6">Additional Resources</h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {lesson.resources.map((resource: {title: string, url: string, type: string}, index: number) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <Card className="h-full border-border/50 hover:border-primary/60 transition-all group-hover:shadow-md card-hover">
                            <CardContent className="p-4 flex flex-col h-full">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                {resource.type === "documentation" ? (
                                  <FileText className="h-5 w-5 text-primary" />
                                ) : resource.type === "guide" ? (
                                  <BookOpen className="h-5 w-5 text-primary" />
                                ) : (
                                  <Lightbulb className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
                                {resource.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-2">
                                External Resource - {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                              </p>
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 p-4">
        <Button variant="outline" size="sm" className="w-full flex items-center justify-between" asChild>
          <Link href={`/courses/${params.courseId}`}>
            <List className="h-4 w-4" />
            <span>View All Lessons</span>
            <span>
              {currentLessonIndex + 1}/{totalLessons}
            </span>
          </Link>
        </Button>
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
        Loading your Lesson...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}