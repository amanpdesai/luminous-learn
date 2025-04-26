"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, FileText, Lightbulb, List, Video } from "lucide-react"
import { useParams } from "next/navigation"
import { MarkdownRenderer } from "@/components/ui/markdown-render"
import TurndownService from "turndown"

export default function ModulePage() {
  const params = useParams()
  const { courseId, unitId, lessonId } = params
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  const [lessons, setLessons] = useState([
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

  const currentLesson = lessons.find((l) => l.id === Number.parseInt(lessonId as string))

  const lesson = {
    id: lessonId,
    title: currentLesson?.title || "Lesson",
    type: currentLesson?.type || "lesson",
    duration: currentLesson?.duration || "15 min",
    course: {
      id: courseId,
      title: "Introduction to Python Programming",
    },
    unit: {
      id: unitId,
      title: "Getting Started with Python",
      lessons,
    },
    content: `<h2>Installing Python and Setting Up the Development Environment</h2>
      <p>Before you can start writing Python code, you need to set up your development environment. This lesson will guide you through installing Python and setting up a code editor.</p>

      <h3>Step 1: Download Python</h3>
      <p>Visit <a href="https://python.org" target="_blank">python.org</a> and download the latest stable version of Python for your operating system.</p>

      <h4>For Windows:</h4>
      <ul>
        <li>Download the Windows installer from the Python website</li>
        <li>Run the installer</li>
        <li>Make sure to check the box that says "Add Python to PATH"</li>
        <li>Click "Install Now"</li>
      </ul>

      <h4>For macOS:</h4>
      <ul>
        <li>Download the macOS installer from the Python website</li>
        <li>Run the installer package</li>
        <li>Follow the installation instructions</li>
      </ul>

      <h4>For Linux:</h4>
      <p>Many Linux distributions come with Python pre-installed. To check if Python is installed, open a terminal and type:</p>
      <pre><code>python3 --version</code></pre>
      <p>If Python is not installed, you can install it using your distribution's package manager:</p>
      <pre><code>sudo apt-get install python3    # For Ubuntu/Debian
sudo dnf install python3      # For Fedora
sudo pacman -S python         # For Arch Linux</code></pre>

      <h3>Step 2: Verify Installation</h3>
      <p>After installation, open a command prompt (Windows) or terminal (macOS/Linux) and type:</p>
      <pre><code>python --version</code></pre>
      <p>or</p>
      <pre><code>python3 --version</code></pre>
      <p>You should see the Python version number displayed, confirming that Python is installed correctly.</p>

      <h3>Step 3: Choose a Code Editor</h3>
      <p>While you can write Python code in any text editor, using a specialized code editor or IDE (Integrated Development Environment) will make your coding experience more productive. Here are some popular options:</p>

      <h4>Visual Studio Code</h4>
      <p>A lightweight but powerful source code editor with excellent Python support.</p>
      <ul>
        <li>Download from <a href="https://code.visualstudio.com/" target="_blank">code.visualstudio.com</a></li>
        <li>Install the Python extension from the Extensions marketplace</li>
      </ul>

      <h4>PyCharm</h4>
      <p>A full-featured Python IDE with a set of tools for productive Python development.</p>
      <ul>
        <li>Download from <a href="https://www.jetbrains.com/pycharm/" target="_blank">jetbrains.com/pycharm</a></li>
        <li>Community Edition is free and great for beginners</li>
      </ul>

      <h4>IDLE</h4>
      <p>A simple IDE that comes bundled with Python. It's good for beginners and simple projects.</p>
      <ul>
        <li>Already installed with Python</li>
        <li>Provides basic editing and interactive features</li>
      </ul>

      <h3>Step 4: Create Your First Python File</h3>
      <p>Once you have Python and a code editor installed, create a new file with the .py extension (e.g., hello.py) and write your first Python code:</p>
      <pre><code>print("Hello, World!")</code></pre>
      <p>Save the file and run it to see your first Python program in action!</p>

      <h3>Conclusion</h3>
      <p>Now that you have Python installed and a code editor set up, you're ready to start writing Python code. In the next lesson, we'll explore basic Python syntax and write our first program.</p>`, // Keep your long HTML lesson content here
    video: {
      url: "https://www.youtube.com/embed/YYXdXT2l-Gg",
      title: "Python Tutorial: Installing Python & PyCharm",
    },
    resources: [
      {
        title: "Python Official Documentation",
        url: "https://docs.python.org/3/",
        type: "documentation",
      },
      {
        title: "Visual Studio Code Setup Guide",
        url: "https://code.visualstudio.com/docs/python/python-tutorial",
        type: "guide",
      },
      {
        title: "PyCharm Getting Started",
        url: "https://www.jetbrains.com/help/pycharm/quick-start-guide.html",
        type: "guide",
      },
    ],
    quiz: [
      {
        question: "Which command can you use to check your Python version?",
        options: ["python --check-version", "python --version", "python -v", "python -version"],
        correctAnswer: 1,
      },
      {
        question: "Which of the following is NOT a Python IDE or code editor mentioned in the lesson?",
        options: ["Visual Studio Code", "PyCharm", "IDLE", "Eclipse"],
        correctAnswer: 3,
      },
      {
        question: "When installing Python on Windows, what important option should you check?",
        options: ["Install for all users", "Add Python to PATH", "Install Python Launcher", "Create shortcuts"],
        correctAnswer: 1,
      },
      {
        question: "Which file extension is used for Python files?",
        options: [".pyt", ".py", ".python", ".pyth"],
        correctAnswer: 1,
      },
    ],
  }

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

  const cleanedLessonContent = turndownService.turndown(lesson.content)

  const handleAnswerSelection = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const handleQuizSubmit = () => {
    let correctCount = 0
    lesson.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / lesson.quiz.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    if (score >= 70) {
      markComplete()
    }
  }

  const markComplete = () => {
    setIsCompleted(true)
    const currentLessonIndex = lessons.findIndex((l) => l.id === Number.parseInt(lessonId as string))
    if (currentLessonIndex !== -1) {
      const updatedLessons = [...lessons]
      updatedLessons[currentLessonIndex] = {
        ...updatedLessons[currentLessonIndex],
        status: "completed",
      }
      setLessons(updatedLessons)
    }
  }

  const currentModuleIndex = lessons.findIndex((m) => m.id === Number.parseInt(lessonId as string))
  const prevModule = currentModuleIndex > 0 ? lessons[currentModuleIndex - 1] : null
  const nextModule = currentModuleIndex < lessons.length - 1 ? lessons[currentModuleIndex + 1] : null

  const totalLessons = lessons.length

  return (
    <AppShell>
      <div className="flex flex-col">
        {/* Module header */}
        <div className="bg-muted/20 border-b border-border/40 py-4">
          <div className="px-4 lg:px-8 py-6 w-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href={`/courses/${courseId}`} className="hover:text-foreground transition-colors">
                  {lesson.course.title}
                </Link>
                <span>/</span>
                <span>{lesson.unit.title}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-display">{lesson.title}</h1>
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
            style={{ width: `${((currentModuleIndex + 1) / totalLessons) * 100}%` }}
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
                  {lesson.unit.lessons.map((m, index) => (
                    <li key={index}>
                      <Link
                        href={`/courses/${params.courseId}/lesson/${params.unitId}/${m.id}`}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm ${
                          m.id === Number.parseInt(lessonId as string)
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="h-5 aspect-square rounded-full bg-muted/70 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="whitespace-normal break-words leading-snug">{m.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0 mr-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="ml-8 w-full max-w-lg px-1 py-5 bg-card border border-border rounded-full mb-6 z-10 relative shadow-sm flex gap-1">
                  <TabsTrigger
                    value="content"
                    className="flex-1 px-10 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      [data-state='active']:text-white
                      [data-state='active']:bg-primary/60
                      [data-state='active']:shadow
                      [data-state='active']:glow-text"
                  >
                    {lesson.type === "video" ? "Video" : "Content"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="quiz"
                    className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      [data-state='active']:text-white
                      [data-state='active']:bg-primary/60
                      [data-state='active']:shadow
                      [data-state='active']:glow-text"
                  >
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      [data-state='active']:text-white
                      [data-state='active']:bg-primary/60
                      [data-state='active']:shadow
                      [data-state='active']:glow-text"
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
                        <Button onClick={markComplete} className="gap-2">
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
                        <Button className="glow-button">
                          Complete Unit
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="animate-in fade-in-50 duration-300">
                  <div className="w-full pl-2 lg:pl-4 space-y-8">
                    <div className="bg-muted/20 p-6 rounded-lg border border-border/40">
                      <h2 className="text-xl font-medium mb-4">Knowledge Check</h2>
                      <p className="mb-6 text-muted-foreground">
                        Test your understanding of the lesson content with these questions.
                      </p>

                      <div className="space-y-8">
                        {lesson.quiz.map((question, qIndex) => (
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
                                  ${!quizSubmitted && quizAnswers[qIndex] === oIndex ? "bg-primary/10 border-primary/50" : ""}
                                  ${quizSubmitted && oIndex === question.correctAnswer ? "bg-green-500/10 border-green-500/50" : ""}
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
                                        ? "border-primary bg-primary/20"
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
                                        ${quizSubmitted ? "bg-green-500" : "bg-primary"}`}
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
                            {quizScore >= 70
                              ? "Great job! You've passed the quiz."
                              : "Review the material and try again to improve your score."}
                          </p>
                          <Button
                            onClick={() => {
                              setQuizAnswers({})
                              setQuizSubmitted(false)
                              setQuizScore(0)
                            }}
                          >
                            Retry Quiz
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="mt-8 w-full glow-button"
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
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
                      {lesson.resources.map((resource, index) => (
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
              {currentModuleIndex + 1}/{lesson.unit.lessons.length}
            </span>
          </Link>
        </Button>
      </div>
    </AppShell>
  )
}