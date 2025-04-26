import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BookOpen, Brain, CheckCircle, ChevronRight, FileText, Lightbulb, Sparkles, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm fixed w-full z-50">
        <div className="w-full px-6 md:px-12 xl:px-24 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-display">Luminous</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm hover:text-primary transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/auth?tab=signup">
              <Button size="sm" className="glow-button">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse-slow" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full px-6 md:px-12 xl:px-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-display glow-text gradient-text">
              Turn your ideas into full courses
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Create personalized learning experiences with AI-generated courses. Upload your materials, customize the
              structure, and learn at your own pace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth?tab=signup">
                <Button size="lg" className="glow-button-pink bg-secondary hover:bg-secondary/90 w-full sm:w-auto">
                  Try It Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="aspect-video rounded-xl overflow-hidden border border-border/50 shadow-xl">
              <div className="bg-card h-full w-full p-6 flex flex-col">
                <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="ml-4 text-sm text-muted-foreground">Luminous - Course Creator</div>
                </div>
                <div className="flex-1 flex mt-4">
                  <div className="w-64 border-r border-border/50 p-4">
                    <div className="space-y-4">
                      <div className="h-8 bg-muted rounded-md w-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse" />
                        <div className="h-6 bg-muted rounded-md w-5/6 animate-pulse" />
                        <div className="h-6 bg-muted rounded-md w-4/5 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="space-y-6">
                      <div className="h-10 bg-primary/20 rounded-md w-3/4 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded-md w-5/6 animate-pulse" />
                      </div>
                      <div className="h-32 bg-muted/30 rounded-md w-full border border-border/50 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-primary/90 text-white px-6 py-3 rounded-full text-sm font-medium glow-button">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>AI-powered course generation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/20">
        <div className="w-full px-6 md:px-12 xl:px-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display mb-4 glow-text">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create personalized learning experiences in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-10 w-10 text-primary" />,
                title: "Input",
                description: "Enter your topic or upload existing materials like PDFs, videos, or notes.",
              },
              {
                icon: <Sparkles className="h-10 w-10 text-secondary" />,
                title: "Customize",
                description: "Edit and refine the AI-generated course structure to match your learning goals.",
              },
              {
                icon: <Brain className="h-10 w-10 text-primary" />,
                title: "Learn",
                description: "Study at your own pace with interactive lessons, quizzes, and flashcards.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border/50 card-hover">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-display mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="w-full px-6 md:px-12 xl:px-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display mb-4 glow-text">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create and learn from personalized courses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FileText className="h-6 w-6 text-primary" />,
                title: "Upload PDFs & Videos",
                description: "Import your existing materials to enhance your courses.",
              },
              {
                icon: <Sparkles className="h-6 w-6 text-secondary" />,
                title: "AI-Generated Lesson Plans",
                description: "Get intelligent course structures based on your topic.",
              },
              {
                icon: <CheckCircle className="h-6 w-6 text-primary" />,
                title: "Practice Quizzes",
                description: "Test your knowledge with auto-generated questions.",
              },
              {
                icon: <Zap className="h-6 w-6 text-secondary" />,
                title: "Quick Learn",
                description: "Create single-topic lessons for fast learning sessions.",
              },
              {
                icon: <BookOpen className="h-6 w-6 text-primary" />,
                title: "Flashcards",
                description: "Review key concepts with spaced repetition.",
              },
              {
                icon: <Lightbulb className="h-6 w-6 text-secondary" />,
                title: "Smart Suggestions",
                description: "Get AI recommendations to improve your learning.",
              },
              {
                icon: <Brain className="h-6 w-6 text-primary" />,
                title: "Progress Tracking",
                description: "Monitor your learning journey with detailed analytics.",
              },
              {
                icon: <Sparkles className="h-6 w-6 text-secondary" />,
                title: "Customizable Structure",
                description: "Rearrange and edit your course content easily.",
              },
            ].map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border/50 card-hover">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-display mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/20">
        <div className="w-full px-6 md:px-12 xl:px-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-display mb-4 glow-text">
              Ready to transform your learning experience?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of learners who are creating personalized courses with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth?tab=signup">
                <Button size="lg" className="glow-button-pink bg-secondary hover:bg-secondary/90 w-full sm:w-auto">
                  Get Started Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="w-full px-6 md:px-12 xl:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-display">Luminous</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered educational platform for personalized learning experiences.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Luminous. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
