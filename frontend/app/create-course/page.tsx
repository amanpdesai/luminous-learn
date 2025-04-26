"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, FileUp, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AppShell } from "@/components/layout/app-shell"

export default function CreateCoursePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [showOutlineEditor, setShowOutlineEditor] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate the generation process
    const steps = [
      "Analyzing Topic Complexity",
      "Designing Curriculum Structure",
      "Generating Educational Hierarchy",
      "Creating Learning Objectives",
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++
        setGenerationStep(currentStep)
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsGenerating(false)
          setShowOutlineEditor(true)
        }, 1000)
      }
    }, 1500)
  }

  if (showOutlineEditor) {
    return <CourseOutlineEditor />
  }

  if (isGenerating) {
    return (
      <AppShell title="Creating Course" description="Generating your personalized course structure">
        <div className="w-full px-6 md:px-12 xl:px-24 max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display glow-text">Creating Your Course</h1>
            <div className="w-full max-w-md space-y-6">
              {[
                "Analyzing Topic Complexity",
                "Designing Curriculum Structure",
                "Generating Educational Hierarchy",
                "Creating Learning Objectives",
              ].map((step, index) => (
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
    <AppShell title="Create a New Course" description="Generate a personalized learning experience">
      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
          <div className="md:hidden">
            <h1 className="text-3xl font-display glow-text">Create a New Course</h1>
            <p className="text-muted-foreground">
              Tell us what you&apos;d like to learn, and we&apos;ll generate a personalized course for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-base">
                      What would you like to learn?
                    </Label>
                    <Textarea
                      id="topic"
                      placeholder="E.g., Introduction to Python, History of Renaissance, Digital Marketing Basics..."
                      className="h-24 input-glow resize-none"
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-base">Difficulty Level</Label>
                      <RadioGroup defaultValue="beginner" className="grid grid-cols-3 gap-2">
                        <Label
                          htmlFor="beginner"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="beginner" id="beginner" className="sr-only" />
                          <span>Beginner</span>
                        </Label>
                        <Label
                          htmlFor="intermediate"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="intermediate" id="intermediate" className="sr-only" />
                          <span>Intermediate</span>
                        </Label>
                        <Label
                          htmlFor="advanced"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="advanced" id="advanced" className="sr-only" />
                          <span>Advanced</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="depth" className="text-base">
                        Course Depth
                      </Label>
                      <Select defaultValue="standard">
                        <SelectTrigger id="depth" className="input-glow">
                          <SelectValue placeholder="Select depth" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overview">Brief Overview (1-2 hours)</SelectItem>
                          <SelectItem value="standard">Standard (5-10 hours)</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive (15+ hours)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base">Optional Materials</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload any materials you&apos;d like to include in your course. This helps us create more personalized
                      content.
                    </p>

                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upload">Upload Files</TabsTrigger>
                        <TabsTrigger value="url">Add URL</TabsTrigger>
                        <TabsTrigger value="text">Add Text</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="space-y-4">
                        <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <FileUp className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Drag and drop files here, or click to browse</p>
                            <p className="text-xs text-muted-foreground">
                              Supports PDF, DOCX, PPT, JPG, PNG (max 10MB)
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Upload className="mr-2 h-4 w-4" />
                              Browse Files
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="url" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="url">Website or Video URL</Label>
                          <Input id="url" placeholder="https://..." className="input-glow" />
                          <p className="text-xs text-muted-foreground">
                            Add links to articles, videos, or other resources related to your topic
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Add URL
                        </Button>
                      </TabsContent>
                      <TabsContent value="text" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes or Additional Context</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any notes or specific areas you'd like the course to cover..."
                            className="h-24 input-glow resize-none"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" className="glow-button">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Course
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}

function CourseOutlineEditor() {
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const router = useRouter()

  const handleSaveDraft = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  const handlePublish = () => {
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      router.push("/courses")
    }, 2000)
  }

  return (
    <AppShell title="Course Outline Editor" description="Review and customize your course structure">
      <div className="w-full px-6 md:px-12 xl:px-24 mx-auto">
        <div className="space-y-6">
          <div className="md:hidden">
            <h1 className="text-3xl font-display glow-text">Course Outline Customizer</h1>
            <p className="text-muted-foreground">Review and customize your course structure before finalizing</p>
          </div>

          <div className="bg-card border border-border/50 rounded-lg p-6">
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  Course Title
                </Label>
                <Input
                  id="title"
                  defaultValue="Introduction to Python Programming"
                  className="text-lg font-medium input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Course Description
                </Label>
                <Textarea
                  id="description"
                  defaultValue="A comprehensive introduction to Python programming language, covering basic syntax, data structures, control flow, and practical applications."
                  className="h-24 input-glow resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Getting Started with Python",
                  lessons: [
                    {
                      title: "Introduction to Programming Concepts",
                      description: "Basic programming concepts and why Python is a great first language",
                    },
                    {
                      title: "Setting Up Your Python Environment",
                      description: "Installing Python and setting up your development environment",
                    },
                    {
                      title: "Your First Python Program",
                      description: "Writing and running a simple 'Hello World' program",
                    },
                  ],
                },
                {
                  title: "Python Basics",
                  lessons: [
                    {
                      title: "Variables and Data Types",
                      description: "Understanding different data types and how to use variables",
                    },
                    {
                      title: "Operators and Expressions",
                      description: "Working with arithmetic, comparison, and logical operators",
                    },
                    { title: "Input and Output", description: "Getting user input and displaying output" },
                    {
                      title: "Control Flow: Conditionals",
                      description: "Using if, elif, and else statements for decision making",
                    },
                  ],
                },
                {
                  title: "Data Structures",
                  lessons: [
                    { title: "Lists and Tuples", description: "Working with ordered collections of items" },
                    { title: "Dictionaries and Sets", description: "Using key-value pairs and unordered collections" },
                    { title: "String Manipulation", description: "Methods for working with text data" },
                  ],
                },
              ].map((unit, unitIndex) => (
                <div key={unitIndex} className="border border-border/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {unitIndex + 1}
                      </div>
                      <Input
                        defaultValue={unit.title}
                        className="text-base font-medium border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 input-glow"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <PlusIcon className="h-4 w-4" />
                        <span className="sr-only">Add lesson</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete unit</span>
                      </Button>
                    </div>
                  </div>

                  <div className="pl-8 space-y-3">
                    {unit.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="border border-border/50 rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs">
                              {lessonIndex + 1}
                            </div>
                            <Input
                              defaultValue={lesson.title}
                              className="text-sm font-medium border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 input-glow"
                            />
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <TrashIcon className="h-3 w-3" />
                            <span className="sr-only">Delete lesson</span>
                          </Button>
                        </div>
                        <div className="pl-7">
                          <Textarea
                            defaultValue={lesson.description}
                            className="text-xs border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 input-glow resize-none min-h-[60px]"
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="ml-7">
                      <PlusIcon className="mr-2 h-3 w-3" />
                      Add Lesson
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Unit
              </Button>

              <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" className="gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  AI Suggest
                </Button>
                <div className="text-sm text-muted-foreground">Let AI suggest additional content or improvements</div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/40 p-4">
            <div className="w-full px-6 md:px-12 xl:px-24 mx-auto flex justify-between items-center">
              <Button variant="outline" asChild>
                <Link href="/courses">Cancel</Link>
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </Button>
                <Button className="glow-button" onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Course"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
    </svg>
  )
}

function Loader2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
