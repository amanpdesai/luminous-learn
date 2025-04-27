"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileUp, Sparkles, Upload, ArrowLeft } from "lucide-react"
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
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { backendUrl } from "@/lib/backendUrl"

export default function CreateCoursePage() {
  const [pageLoading, isPageLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const router = useRouter()
  const [topicInput, setTopicInput] = useState("")
  const [difficultyInput, setDifficultyInput] = useState("Beginner")
  const [depthInput, setDepthInput] = useState("Standard (5–10 hours)")

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }

    checkAuth()
    isPageLoading(false)
  }, [router])

  const steps = [
    "Analyzing Topic Complexity",
    "Designing Units Outline",
    "Generating Lessons and Descriptions",
    "Creating Learning Objectives",
  ]

  const simulateLLMCall = async (topic: string, difficulty: string, depth: string) => {
    try {
      const apiCall = fetch(`${backendUrl}/api/generate_syllabus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, depth }),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to generate syllabus")
        return res.json()
      })
  
      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i)
        await new Promise((resolve) => setTimeout(resolve, 1200))
      }
  
      const data = await apiCall
      data.course.level = difficultyInput
      data.course.depth = depthInput
      console.log(data)
      localStorage.setItem("draftCourseOutline", JSON.stringify(data))
      router.push(`/courses/edit`)
    } catch (error) {
      console.error(error)
      alert("Failed to generate course. Please try again.")
      setIsGenerating(false)
    }
  }  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    simulateLLMCall(topicInput, difficultyInput, depthInput)
  }

  if (pageLoading) {
    return (<AppShell><DashboardLoading></DashboardLoading></AppShell>)
  }

  if (isGenerating) {
    return (
      <AppShell>
        <div className="w-full px-6 md:px-12 xl:px-24 max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display glow-text">Creating Your Syllabus</h1>
            <div className="w-full max-w-md space-y-6">
              {steps.map((step, index) => (
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
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-32 overflow-x-hidden">
        <div className="mb-4">
          <Link href="/courses" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-display glow-text mb-2">Create a New Course</h1>
          <p className="text-muted-foreground">Tell us what you&apos;d like to learn, and we&apos;ll generate a personalized course for you.</p>
        </div>

        <Card className="border-border/50">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="topic" className="text-base">What would you like to learn?</Label>
                <Textarea
                  id="topic"
                  placeholder="E.g., Introduction to Python, History of Renaissance, Digital Marketing Basics..."
                  className="h-24 input-glow resize-none"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-base">Difficulty Level</Label>
                  <RadioGroup value={difficultyInput} onValueChange={setDifficultyInput} className="grid grid-cols-3 gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <Label
                        key={level}
                        htmlFor={level}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem value={level} id={level} className="sr-only" />
                        <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth" className="text-base">Course Depth</Label>
                  <Select value={depthInput} onValueChange={setDepthInput}>
                    <SelectTrigger id="depth" className="input-glow">
                      <SelectValue placeholder="Select depth" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brief Overview (1–2 hours)">Brief Overview (1–2 hours)</SelectItem>
                      <SelectItem value="Standard (5–10 hours)">Standard (5–10 hours)</SelectItem>
                      <SelectItem value="Comprehensive (15+ hours)">Comprehensive (15+ hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base">Optional Materials</Label>
                <Tabs defaultValue="upload">
                  <TabsList className="inline-flex justify-start items-center px-1 py-5 bg-card border border-border rounded-full shadow-sm w-full max-w-lg mb-2">
                    {["upload", "url", "text"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="px-5 py-4 text-sm font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-primary/60 data-[state=active]:shadow data-[state=active]:glow-text"
                      >
                        {tab === "upload" ? "Upload Files" : tab === "url" ? "Add URL" : "Add Text"}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="upload">
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <FileUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-muted-foreground">Supports PDF, DOCX, PPT, JPG, PNG (max 10MB)</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Upload className="mr-2 h-4 w-4" />
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <Label htmlFor="url">Website or Video URL</Label>
                    <Input id="url" placeholder="https://..." className="input-glow" />
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <Label htmlFor="notes">Notes or Additional Context</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes or specific areas you'd like the course to cover..."
                      className="h-24 input-glow resize-none"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
                <Button variant="outline" onClick={() => router.push("/courses")}>Cancel</Button>
                <Button className="glow-button" type="submit" disabled={isGenerating || !topicInput.trim() || !difficultyInput.trim() || !depthInput.trim()}>
                  {isGenerating ? "Generating..." : "Generate Course"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-primary">
        Loading your Create page...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}