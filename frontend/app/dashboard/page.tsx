"use client";
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Edit, ExternalLink, FileText, Plus, Sparkles, Zap, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function DashboardPage() {
  const router = useRouter();
      
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Welcome back, John</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
        <div className="flex gap-3">
          <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
            <Link href="/quick-learn">
              <Zap className="mr-2 h-4 w-4" />
              Quick Learn
            </Link>
          </Button>
          <Button className="glow-button" asChild>
            <Link href="/create-course">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Courses Created", value: "12", icon: <FileText className="h-4 w-4 text-primary" /> },
          { title: "Lessons Completed", value: "87", icon: <BookOpen className="h-4 w-4 text-primary" /> },
          { title: "Hours Learned", value: "32", icon: <Clock className="h-4 w-4 text-primary" /> },
          { title: "Quick Learn Sessions", value: "24", icon: <Zap className="h-4 w-4 text-primary" /> },
        ].map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
      <div className="-ml-1"> {/* adjust margin here as needed */}
      <TabsList className="inline-flex justify-center items-center px-1 py-5 bg-card border border-border rounded-full mb-6 z-10 relative shadow-sm w-fit mx-auto">
      <TabsTrigger
        value="courses"
        className="px-7 py-4 text-base font-medium rounded-full transition-all
          text-muted-foreground hover:text-foreground
          data-[state=active]:text-white
          data-[state=active]:bg-primary/60
          data-[state=active]:shadow
          data-[state=active]:glow-text"
      >
        My Courses
      </TabsTrigger>
      <TabsTrigger
        value="quick-learn"
        className="px-7 py-4 text-base font-medium rounded-full transition-all
          text-muted-foreground hover:text-foreground
          data-[state=active]:text-white
          data-[state=active]:bg-primary/60
          data-[state=active]:shadow
          data-[state=active]:glow-text"
      >
        Quick Learn
      </TabsTrigger>
      </TabsList>
      </div>
        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Introduction to Python Programming",
                description: "Learn the basics of Python programming language",
                progress: 65,
                lastAccessed: "2 days ago",
                lessons: 12,
                completed: 8,
              },
              {
                title: "Web Development Fundamentals",
                description: "HTML, CSS, and JavaScript basics",
                progress: 30,
                lastAccessed: "Yesterday",
                lessons: 15,
                completed: 5,
              },
              {
                title: "Data Science Essentials",
                description: "Introduction to data analysis and visualization",
                progress: 10,
                lastAccessed: "1 week ago",
                lessons: 20,
                completed: 2,
              },
            ].map((course, index) => (
              <Card key={index} className="border-border/50 card-hover">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                      <Edit className="h-4 w-4" />
                    </div>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className="text-primary">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {course.completed}/{course.lessons} lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{course.lastAccessed}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Continue Learning
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">Create New Course</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Generate a personalized learning experience
                </p>
                <Button className="glow-button" asChild>
                  <Link href="/create-course">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="quick-learn" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "JavaScript Promises",
                description: "Understanding asynchronous programming",
                date: "2 days ago",
                duration: "15 min",
              },
              {
                title: "CSS Grid Layout",
                description: "Modern web layouts with CSS Grid",
                date: "Last week",
                duration: "10 min",
              },
              {
                title: "React Hooks",
                description: "Using useState and useEffect",
                date: "Yesterday",
                duration: "20 min",
              },
            ].map((session, index) => (
              <Card key={index} className="border-border/50 card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{session.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{session.date}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Session
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-medium mb-1">Quick Learn</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create a single-topic lesson in minutes
                </p>
                <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
                  <Link href="/quick-learn/create">
                    <Zap className="mr-2 h-4 w-4" />
                    Start Quick Learn
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your learning activity from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Completed Lesson",
                  description: "Variables and Data Types in Python",
                  time: "2 hours ago",
                  icon: <CheckIcon className="h-4 w-4 text-green-500" />,
                },
                {
                  title: "Created Flashcards",
                  description: "JavaScript Fundamentals",
                  time: "Yesterday",
                  icon: <BookOpen className="h-4 w-4 text-primary" />,
                },
                {
                  title: "Quick Learn Session",
                  description: "CSS Flexbox Layout",
                  time: "2 days ago",
                  icon: <Zap className="h-4 w-4 text-secondary" />,
                },
                {
                  title: "Created Course",
                  description: "Data Science Essentials",
                  time: "1 week ago",
                  icon: <Sparkles className="h-4 w-4 text-primary" />,
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    {activity.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Suggested Topics</CardTitle>
            <CardDescription>Based on your learning history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Machine Learning Basics",
                  description: "Introduction to ML algorithms and concepts",
                  icon: <Brain className="h-4 w-4 text-primary" />,
                },
                {
                  title: "Advanced CSS Techniques",
                  description: "Animations, transitions, and modern layouts",
                  icon: <Sparkles className="h-4 w-4 text-secondary" />,
                },
                {
                  title: "React State Management",
                  description: "Context API, Redux, and other state solutions",
                  icon: <Zap className="h-4 w-4 text-primary" />,
                },
                {
                  title: "Python Data Analysis",
                  description: "Using pandas and numpy for data manipulation",
                  icon: <FileText className="h-4 w-4 text-secondary" />,
                },
              ].map((topic, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    {topic.icon}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{topic.title}</p>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add topic</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Suggestions
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
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
