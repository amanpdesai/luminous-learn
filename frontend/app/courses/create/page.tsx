"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileUp, Sparkles, Upload } from "lucide-react"
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

export default function CreateCoursePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }

    checkAuth()
  }, [router])

  const simulateLLMCall = async () => {
    const steps = [
      "Analyzing Topic Complexity",
      "Designing Curriculum Structure",
      "Generating Educational Hierarchy",
      "Creating Learning Objectives",
    ]

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i)
      await new Promise((res) => setTimeout(res, 1500))
    }

    // Simulated response from LLM / backend
    const simulatedCourseId = 1
    router.push(`/courses/${simulatedCourseId}/edit`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    simulateLLMCall()
  }

  if (isGenerating) {
    return (
      <AppShell>
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
    <AppShell>
      <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-3xl font-display glow-text">Create a New Course</h1>
            <p className="text-muted-foreground">
              Tell us what you&apos;d like to learn, and we&apos;ll generate a personalized course for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/50">
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Label htmlFor="topic" className="text-base">What would you like to learn?</Label>
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
                        {["beginner", "intermediate", "advanced"].map((level) => (
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
                    <Tabs defaultValue="upload">
                    <TabsList
                      className="inline-flex justify-start items-center px-1 py-5 bg-card border border-border rounded-full shadow-sm w-full max-w-lg mb-2"
                    >
                      <TabsTrigger
                        value="upload"
                        className="px-5 py-4 text-sm font-medium rounded-full transition-all
                          text-muted-foreground hover:text-foreground
                          data-[state=active]:text-white
                          data-[state=active]:bg-primary/60
                          data-[state=active]:shadow
                          data-[state=active]:glow-text"
                      >
                        Upload Files
                      </TabsTrigger>
                      <TabsTrigger
                        value="url"
                        className="px-5 py-4 text-sm font-medium rounded-full transition-all
                          text-muted-foreground hover:text-foreground
                          data-[state=active]:text-white
                          data-[state=active]:bg-primary/60
                          data-[state=active]:shadow
                          data-[state=active]:glow-text"
                      >
                        Add URL
                      </TabsTrigger>
                      <TabsTrigger
                        value="text"
                        className="px-5 py-4 text-sm font-medium rounded-full transition-all
                          text-muted-foreground hover:text-foreground
                          data-[state=active]:text-white
                          data-[state=active]:bg-primary/60
                          data-[state=active]:shadow
                          data-[state=active]:glow-text"
                      >
                        Add Text
                      </TabsTrigger>
                    </TabsList>

                      <TabsContent value="upload">
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

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}