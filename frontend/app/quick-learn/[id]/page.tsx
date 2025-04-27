"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock, FileText, Lightbulb, Sparkles, Zap } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { MarkdownRenderer } from "@/components/ui/markdown-render"
import TurndownService from "turndown"
import { supabase } from "@/lib/supabaseClient"
import { backendUrl } from "@/lib/backendUrl"

// --- Types ---
interface QuickLearnSection {
  id: string;
  status: string;
  title: string;
  content: string;
  videos?: string[];
<!--   readings: string;
  examples: string;
  additional_resources: QuickLearnResource[]; -->
        
}

interface QuickLearnQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuickLearnAssessment {
  title: string;
  instructions?: string;
  questions: QuickLearnQuestion[];
}

interface QuickLearnResource {
  unit_title: string;
  text: string;  
  url: string;
}

interface QuickLearnData {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  sections: QuickLearnSection[];
  completed: number;  // ✅ Add this
  assessment?: QuickLearnAssessment;
  resources?: QuickLearnResource[];
  createdAt?: string;
  userId?: string;
  estimated_duration_minutes?: number;
}

// --- Component ---
export default function QuickLearnPage() {
  const [pageLoading, setPageLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { id } = params as { id: string }
  const [currentSection, setCurrentSection] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [session, setSession] = useState<QuickLearnData | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  useEffect(() => {
    setIsCompleted(false)
    setQuizAnswers({})
    setQuizSubmitted(false)
    setQuizScore(0)
  }, [currentSection])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }
    const fetchQuickLearn = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth")
          return
        }
    
        const token = session.access_token
    
        const response = await fetch(`${backendUrl}/api/quick_learn/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          console.error(`API error: ${errorData?.error || response.statusText}`)
          return
        }
    
        const data = await response.json()
    
        if (!data || !data.title || !data.sections) {
          console.error('Invalid data format received from server', data)
          return
        }
    
        setSession({
          id: data.id,
          title: data.title,
          topic: data.topic,
          difficulty: data.difficulty,
          sections: data.sections || [],
          completed: data.completed || 0,
          assessment: data.assessment,
          resources: data.resources,
          createdAt: data.created_at,
          userId: data.user_id,
          estimated_duration_minutes: data.estimated_duration_minutes
        })

        const firstIncompleteIndex = (data.sections || []).findIndex((section: any) => section.status !== "completed")
        if (firstIncompleteIndex !== -1) {
          setCurrentSection(firstIncompleteIndex)
        } else {
          setCurrentSection(0)  // fallback if all are completed
        }
      } catch (err) {
        console.error('Error fetching quick learn:', err)
      }
    }    
    checkAuth()
    Promise.all([
      fetchQuickLearn()
    ]).finally(() => setPageLoading(false));
  }, [id, router])

  const sections = session?.sections || []
  const currentSectionData = sections[currentSection] || null
  const additionalResources = session?.sections?.[currentSection]?.additional_resources || []

  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-"
  })

  turndownService.addRule("fencedCodeBlock", {
    filter: (node) =>
      node.nodeName === "PRE" && node.firstChild !== null && (node.firstChild as HTMLElement).nodeName === "CODE",
    replacement: (content, node) => {
      const code = node.textContent || ""
      return `\n\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`
    },
  })


  const handleAnswerSelection = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const handleQuizSubmit = () => {
    if (!session?.assessment || !session.assessment.questions.length) {
      return
    }

    let correctCount = 0
    session.assessment.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / session.assessment.questions.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    markComplete()
  }

  const markComplete = async () => {
    if (isCompleted || !session) return;
    try {
      const sesh = await supabase.auth.getSession();
      const token = sesh.data.session?.access_token;
      const user = sesh.data.session?.user;
      if (!user || !token) throw new Error("Not logged in");
  
      // Clone the unit_lessons array
      const updatedData = session.sections.map((section) => {
        if (section.id === session.sections[currentSection].id) {
          // Update the matching lesson's status
          return { ...section, status: "completed" };
        }
        return section;
      });
  
      const courseData = {
        unit_lessons: updatedData,
      };
  
      const response = await fetch(`${backendUrl}/api/update_quick_learn/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
  
      if (!response.ok) throw new Error("Failed to update lesson");

      session.sections[currentSection].status = "completed";
  
      // Optional: Update local course state if needed
      // setCourse(prev => prev ? { ...prev, unit_lessons: updatedLessons } : null);
  
      console.log("Lesson marked as completed!");
      setIsCompleted(true);
    } catch (err) {
      console.error("Error marking lesson as complete:", err);
      alert("Failed to update lesson. Please try again.");
    }
  };

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setActiveTab("content")
    }
  }

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setActiveTab("content")
    }
  }

  if (pageLoading || !session) {
    return (
      <AppShell>
        <DashboardLoading />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col">
        {/* Module header */}
        <div className="bg-muted/20 border-b border-border/40 py-4">
          <div className="px-4 lg:px-8 py-6 w-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Link href="/quick-learn" className="hover:text-foreground transition-colors">
                  Quick Learn
                </Link>
                <span>/</span>
                <span>{session?.title}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-display mb-3">{currentSectionData?.title || 'Loading...'}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary" />
                  <span className="text-secondary">Quick Learn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{session?.estimated_duration_minutes ? `${session.estimated_duration_minutes} min` : 'Unknown duration'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for the unit */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          ></div>
        </div>

        {/* Main content */}
        <div className="px-4 lg:px-8 py-6 w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar with section navigation */}
            <div className="hidden lg:block lg:w-80 shrink-0">
              <div className="sticky top-24 space-y-4">
                <h3 className="font-medium">Session Sections</h3>
                <ul className="space-y-2">
                  {sections.map((section, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setCurrentSection(index)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm w-full text-left ${
                          currentSection === index ? "bg-secondary/10 text-secondary font-medium" : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="h-5 aspect-square rounded-full flex items-center justify-center text-xs font-medium bg-muted/70">
                          {section.status === "completed" ? <Check className="h-4 w-4 text-green-400" /> : <>{index + 1}</>}
                        </span>
                        <span className="whitespace-normal break-words leading-snug">{section.title}</span>
                      </button>
                    </li>
                  ))}
                  <li key="assessment">
                    <button
                      onClick={() => setCurrentSection(sections.length)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm w-full text-left ${
                        currentSection === sections.length ? "bg-secondary/10 text-secondary font-medium" : "hover:bg-muted/50"
                      }`}
                    >
                    <span className="h-5 aspect-square rounded-full flex items-center justify-center text-xs font-medium bg-muted/70">
                      {sections.length + 1}
                    </span>
                    <span className="whitespace-normal break-words leading-snug">Assessment</span>
                  </button>
                </li>
                </ul>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0 mr-12">
              {currentSection == sections.length ? 
              <div className="w-full pl-2 lg:pl-4 space-y-8">
              <div className="bg-muted/20 p-6 rounded-lg border border-border/40">
                <h2 className="text-xl font-medium mb-4">Knowledge Check</h2>
                <p className="mb-6 text-muted-foreground">
                  Test your understanding of the section content with these questions.
                </p>

                <div className="space-y-8">
                  {session.assessment?.questions?.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                      <h3 className="font-medium">
                        {qIndex + 1}. {question.question}
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`
                              flex items-center p-3 rounded-md border border-border/40
                              ${!quizSubmitted && quizAnswers[qIndex] === oIndex ? "bg-secondary/10 border-secondary/50" : ""}
                              ${quizAnswers[qIndex] === oIndex ? "bg-secondary/10 border-secondary/50" : ""}
                              ${
                                quizSubmitted && oIndex === question.correctAnswer
                                  ? "bg-green-500/10 border-green-500/50"
                                  : ""
                              }
                              ${
                                quizSubmitted && quizAnswers[qIndex] === oIndex && oIndex !== question.correctAnswer
                                  ? "bg-red-500/10 border-red-500/50"
                                  : ""
                              }
                              ${quizSubmitted ? "pointer-events-none" : "cursor-pointer hover:bg-muted/30"}
                            `}
                            onClick={() => !quizSubmitted && handleAnswerSelection(qIndex, oIndex)}
                          >
                            <div
                              className={`
                                h-5 w-5 rounded-full mr-3 flex items-center justify-center border
                                ${
                                  !quizSubmitted && quizAnswers[qIndex] === oIndex
                                    ? "border-secondary bg-secondary/20"
                                    : "border-muted-foreground"
                                }
                                ${
                                  quizSubmitted && oIndex === question.correctAnswer
                                    ? "border-green-500 bg-green-500/20"
                                    : ""
                                }
                                ${
                                  quizSubmitted &&
                                  quizAnswers[qIndex] === oIndex &&
                                  oIndex !== question.correctAnswer
                                    ? "border-red-500 bg-red-500/20"
                                    : ""
                                }
                              `}
                            >
                              {(!quizSubmitted && quizAnswers[qIndex] === oIndex) ||
                                (quizSubmitted && oIndex === question.correctAnswer) ? (
                                <div
                                  className={`h-2 w-2 rounded-full 
                                    ${quizSubmitted ? "bg-green-500" : "bg-secondary"}`}
                                />
                              ) : null}
                            </div>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
                      className="glow-button-pink bg-secondary hover:bg-secondary/90"
                    >
                      Retry Quiz
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="mt-8 w-full glow-button-pink bg-secondary hover:bg-secondary/90"
                    onClick={handleQuizSubmit}
                  >
                    Submit Answers
                  </Button>
                )}
              </div>
            </div>
              :  
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="ml-8 w-full max-w-lg px-1 py-5 bg-muted/20 border border-border rounded-full mb-6 z-10 relative shadow-sm flex gap-1">
                    <TabsTrigger
                      value="content"
                      className="flex-1 px-10 py-4 text-base font-medium rounded-full transition-all
                        text-muted-foreground hover:text-foreground
                        data-[state=active]:text-white
                        data-[state=active]:bg-secondary
                        data-[state=active]:shadow
                        data-[state=active]:glow-text"
                    >
                      Content"
                    </TabsTrigger>

                    <TabsTrigger
                      value="examples"
                      className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                        text-muted-foreground hover:text-foreground
                        data-[state=active]:text-white
                        data-[state=active]:bg-secondary
                        data-[state=active]:shadow
                        data-[state=active]:glow-text"
                    >
                      Examples
                    </TabsTrigger>

                    <TabsTrigger
                      value="resources"
                      className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                        text-muted-foreground hover:text-foreground
                        data-[state=active]:text-white
                        data-[state=active]:bg-secondary
                        data-[state=active]:shadow
                        data-[state=active]:glow-text"
                    >
                      Resources
                    </TabsTrigger>
                  </TabsList>
                <TabsContent value="content" className="animate-in fade-in-50 duration-300">
                  <div className="w-full ml-8">
                    <div className="prose prose-invert max-w-none mb-8">
                      <MarkdownRenderer 
                        content={cleanedSectionContent} 
                        videos={currentSectionData?.videos || []} 
                      />
                    </div>

                    <div className="flex justify-between pt-4 border-t border-border/40">
                      {currentSection > 0 ? (
                        <Button variant="outline" onClick={handlePreviousSection}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous Section
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous Section
                        </Button>
                      )}

                      {isCompleted ? (
                        <Button variant="outline" className="gap-2 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </Button>
                      ) : (
                        <Button
                          onClick={markComplete}
                          className="gap-2 glow-button-pink bg-secondary hover:bg-secondary/90"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}

                      {currentSection < sections.length - 1 ? (
                        <Button
                          className="glow-button-pink bg-secondary hover:bg-secondary/90"
                          onClick={handleNextSection}
                        >
                          Next Section
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="glow-button-pink bg-secondary hover:bg-secondary/90">
                          Complete Session
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="examples" className="animate-in fade-in-50 duration-300">
                  <div className="w-full ml-8">
                    <div className="prose prose-invert max-w-none mb-8">
                      <MarkdownRenderer content={currentSectionData?.examples} />
                    </div>
                  </div>
                  {/*<div className="w-full pl-2 lg:pl-4 space-y-8">
                    <div className="bg-muted/20 p-6 rounded-lg border border-border/40">
                      <h2 className="text-xl font-medium mb-4">Knowledge Check</h2>
                      <p className="mb-6 text-muted-foreground">
                        Test your understanding of the section content with these questions.
                      </p>

                      <div className="space-y-8">
                        {session.assessment?.questions?.map((question, qIndex) => (
                          <div key={qIndex} className="space-y-4">
                            <h3 className="font-medium">
                              {qIndex + 1}. {question.question}
                            </h3>
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <div
                                  key={oIndex}
                                  className={`
                                    flex items-center p-3 rounded-md border border-border/40
                                    ${!quizSubmitted && quizAnswers[qIndex] === oIndex ? "bg-secondary/10 border-secondary/50" : ""}
                                    ${quizAnswers[qIndex] === oIndex ? "bg-secondary/10 border-secondary/50" : ""}
                                    ${
                                      quizSubmitted && oIndex === question.correctAnswer
                                        ? "bg-green-500/10 border-green-500/50"
                                        : ""
                                    }
                                    ${
                                      quizSubmitted && quizAnswers[qIndex] === oIndex && oIndex !== question.correctAnswer
                                        ? "bg-red-500/10 border-red-500/50"
                                        : ""
                                    }
                                    ${quizSubmitted ? "pointer-events-none" : "cursor-pointer hover:bg-muted/30"}
                                  `}
                                  onClick={() => !quizSubmitted && handleAnswerSelection(qIndex, oIndex)}
                                >
                                  <div
                                    className={`
                                      h-5 w-5 rounded-full mr-3 flex items-center justify-center border
                                      ${
                                        !quizSubmitted && quizAnswers[qIndex] === oIndex
                                          ? "border-secondary bg-secondary/20"
                                          : "border-muted-foreground"
                                      }
                                      ${
                                        quizSubmitted && oIndex === question.correctAnswer
                                          ? "border-green-500 bg-green-500/20"
                                          : ""
                                      }
                                      ${
                                        quizSubmitted &&
                                        quizAnswers[qIndex] === oIndex &&
                                        oIndex !== question.correctAnswer
                                          ? "border-red-500 bg-red-500/20"
                                          : ""
                                      }
                                    `}
                                  >
                                    {(!quizSubmitted && quizAnswers[qIndex] === oIndex) ||
                                      (quizSubmitted && oIndex === question.correctAnswer) ? (
                                      <div
                                        className={`h-2 w-2 rounded-full 
                                          ${quizSubmitted ? "bg-green-500" : "bg-secondary"}`}
                                      />
                                    ) : null}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
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
                            className="glow-button-pink bg-secondary hover:bg-secondary/90"
                          >
                            Retry Quiz
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="mt-8 w-full glow-button-pink bg-secondary hover:bg-secondary/90"
                          onClick={handleQuizSubmit}
                        >
                          Submit Answers
                        </Button>
                      )}
                    </div>
                  </div>*/}
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="animate-in fade-in-50 duration-300">
                  <div className="w-full pl-2 lg:pl-4">
                    <h2 className="text-xl font-medium mb-6">Additional Resources</h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {additionalResources?.map((resource: QuickLearnResource, index: number) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <Card className="h-full border-border/50 hover:border-secondary/60 transition-all group-hover:shadow-md card-hover">
                            <CardContent className="p-4 flex flex-col h-full">
                              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                                <FileText className="h-5 w-5 text-secondary" />
                              </div>
                              <h3 className="font-medium mb-2 group-hover:text-secondary transition-colors">
                                {resource.text}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-2">
                                External Resource - Documentation
                              </p>
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
                }
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
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10">
        <Sparkles className="h-10 w-10 text-secondary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-secondary">
        Loading your Quick Learn...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}