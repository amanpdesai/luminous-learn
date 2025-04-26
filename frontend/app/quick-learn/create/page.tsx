"use client"

import { useEffect, useState } from "react"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { AppShell } from "@/components/layout/app-shell"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function CreateQuickLearnPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }

    checkAuth()
  }, [router])

  const simulateLLMCall = async () => {
    const steps = [
      "Analyzing Topic",
      "Generating Content Structure",
      "Creating Learning Materials",
      "Finalizing Quick Learn Session",
    ]

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i)
      await new Promise((res) => setTimeout(res, 1500))
    }

    router.push("/quick-learn/1") // Example redirect after generation
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
            <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center animate-pulse">
              <Zap className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-display glow-text-pink">Creating Your Quick Learn Session</h1>
            <div className="w-full max-w-md space-y-6">
              {["Analyzing Topic", "Generating Content Structure", "Creating Learning Materials", "Finalizing Quick Learn Session"].map((step, index) => (
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
      <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-3xl font-display glow-text-pink">Create a Quick Learn Session</h1>
            <p className="text-muted-foreground">
              Focus on a single topic and generate a quick lesson for rapid learning.
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
                      placeholder="E.g., JavaScript Promises, CSS Grid, React Hooks..."
                      className="h-24 input-glow resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Difficulty Level</Label>
                    <RadioGroup defaultValue="beginner" className="grid grid-cols-3 gap-2">
                      {["beginner", "intermediate", "advanced"].map((level) => (
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="glow-button-pink bg-secondary hover:bg-secondary/90"
                disabled={isGenerating}
              >
                <Zap className="mr-2 h-4 w-4" />
                Create Quick Lesson
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}