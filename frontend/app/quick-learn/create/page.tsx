"use client"

import { useEffect, useState } from "react"
import { Check, Zap, ArrowLeft, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"

export default function CreateQuickLearnPage() {
  const [pageLoading, setPageLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('Beginner')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }

    checkAuth()
    setPageLoading(false)
  }, [router])

  const steps = [
    "Analyzing Topic Complexity",
    "Designing Unit Structure",
    "Generating Lessons and Descriptions",
    "Creating Learning Objectives",
  ]

  const generateQuickLearn = async () => {
    try {
      setError('')
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      
      const token = session.access_token
      
      // Call the API to generate quick learn content
      const response = await fetch('http://localhost:8080/api/generate_quick_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: topic,
          difficulty: difficulty,
          // Include notes if needed by backend (could expand API to handle this)
          notes: notes
        })
      })
      
      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i)
        await new Promise((resolve) => setTimeout(resolve, 1200))
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create quick learn content')
      }
      
      // Get the response data
      setGenerationStep(2)
      const data = await response.json()
      
      // The data is already saved to the database by the API
      // Extract the ID from the response to navigate to the correct page
      const quickLearnId = data[0]?.id
      
      setGenerationStep(3)
      
      // Navigate to the quick learn content page with the ID
      setTimeout(() => {
        if (quickLearnId) {
          router.push(`/quick-learn/${quickLearnId}`)
        } else {
          router.push('/quick-learn')
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error generating quick learn:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate quick learn')
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    if (!topic.trim()) {
      setError('Please enter a topic to learn about')
      return
    }
    
    setIsGenerating(true)
    generateQuickLearn()
  }

  if (pageLoading){
    return (<AppShell><DashboardLoading></DashboardLoading></AppShell>)
  }

  if (isGenerating) {
    return (
      <AppShell>
        <div className="w-full px-6 md:px-12 xl:px-24 max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            {error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
                <p>{error}</p>
                <Button onClick={() => setIsGenerating(false)} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center animate-pulse">
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
                <h1 className="text-3xl font-display glow-text-pink">Creating Your Quick Learn Session</h1>
              </>
            )}
            <div className="w-full max-w-md space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      index <= generationStep ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < generationStep ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                  </div>
                  <span className={index <= generationStep ? "text-foreground" : "text-muted-foreground"}>{step}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground">
              This may take a moment. We&apos;re crafting a personalized learning session for you.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-32 overflow-x-hidden">
        <div className="mb-4">
          <Link href="/quick-learn" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quick Learn
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-display glow-text-pink mb-2">Create a Quick Learn Session</h1>
          <p className="text-muted-foreground">
            Focus on a single topic and generate a quick lesson for rapid learning.
          </p>
        </div>

        <Card className="border-border/50 w-full">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="topic" className="text-base">What would you like to learn?</Label>
                <Textarea
                  id="topic"
                  placeholder="E.g., JavaScript Promises, CSS Grid, React Hooks..."
                  className="h-24 input-glow resize-none"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Difficulty Level</Label>
                <RadioGroup 
                  value={difficulty} 
                  onValueChange={setDifficulty} 
                  className="grid grid-cols-3 gap-2">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <Label
                      key={level}
                      htmlFor={level}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-secondary [&:has([data-state=checked])]:border-secondary"
                    >
                      <RadioGroupItem value={level} id={level} className="sr-only" />
                      <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any specific points you'd like the session to focus on..."
                  className="h-24 input-glow resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
                <Button variant="outline" onClick={() => router.push("/quick-learn")}>Cancel</Button>
                <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" type="submit" disabled={isGenerating}>
                  {isGenerating ? "Creating..." : "Quick Learn"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
        Loading your Create page...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}