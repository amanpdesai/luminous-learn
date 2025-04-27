"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { parseISO, formatDistanceToNowStrict } from "date-fns"
import {
  BookOpen,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Zap,
  Layers,
  PcCase,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaseClient"
import { backendUrl } from "@/lib/backendUrl"

type CourseType = {
  id: string
  title: string
  completed: number
  lessons: number
  last_accessed: string
}

type QuickLearnType = {
  id: string
  title: string
  completed: number
  duration: string
  last_accessed: string
}

export default function DashboardPage() {
  const [pageLoading, setPageLoading] = useState(true)

  const router = useRouter()

  const [userData, setUserData] = useState<{ email: string | null; name: string | null; avatarUrl: string | null }>({
    email: null,
    name: null,
    avatarUrl: null,
  })

  const [courses, setCourses] = useState<CourseType[]>([])
  const [quickLearns, setQuickLearns] = useState<QuickLearnType[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingQuickLearns, setLoadingQuickLearns] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/auth")
    }

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserData({
          email: user.email || null,
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.username ||
            "User",
          avatarUrl: user.user_metadata?.avatar_url || null,
        })
      }
    }

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const token = session.access_token
        const res = await fetch(`${backendUrl}/api/get_user_courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setCourses(data || [])
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoadingCourses(false)
      }
    }

    const fetchQuickLearns = async () => {
      try {
        setLoadingQuickLearns(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const token = session.access_token
        const res = await fetch(`${backendUrl}/api/quick_learns`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setQuickLearns(data || [])
      } catch (error) {
        console.error("Error fetching quick learns:", error)
      } finally {
        setLoadingQuickLearns(false)
      }
    }

    checkAuth();
    Promise.all([
      fetchUser(),
      fetchCourses(),
      fetchQuickLearns()
    ]).finally(() => setPageLoading(false));
  }, [router])

  if (pageLoading) {
    return <DashboardLoading />
  }
  

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display">Welcome back, {userData.name}</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
        <div className="flex gap-3">
          <Button className="glow-button" asChild>
            <Link href="/courses"><Layers className="mr-2 h-4 w-4" /> My Courses</Link>
          </Button>
          <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
            <Link href="/quick-learn"><Zap className="mr-2 h-4 w-4" /> Quick Learn</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Courses Created", value: courses.length, icon: <PcCase className="h-4 w-4 text-primary" /> },
          { title: "Quick Learn Sessions", value: quickLearns.length, icon: <Zap className="h-4 w-4 text-primary" /> },
          { title: "Lessons Completed", value: courses.reduce((sum, c) => sum + (c.completed || 0), 0), icon: <BookOpen className="h-4 w-4 text-primary" /> },
          { title: "Hours Learned", value: (courses.length * 2) + (quickLearns.length * 0.5), icon: <Clock className="h-4 w-4 text-primary" /> },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof stat.value === "number" ? Math.floor(stat.value) : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <div className="-ml-1">
          <TabsList className="inline-flex justify-center items-center px-1 py-5 bg-card border border-border rounded-full mb-6 z-10 relative shadow-sm w-fit mx-auto">
            <TabsTrigger value="courses" className="px-7 py-4 text-base font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-primary/60 data-[state=active]:shadow data-[state=active]:glow-text">My Courses</TabsTrigger>
            <TabsTrigger value="quick-learn" className="px-7 py-4 text-base font-medium rounded-full transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-secondary/60 data-[state=active]:shadow data-[state=active]:glow-text">Quick Learn</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="courses" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingCourses ? (
            <LoadingCards />
          ) : (
            <>
              {courses.length > 0 ? (
                courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))
      ) : null}
      <CreateNewCourseCard />
    </>
  )}
</TabsContent>

        {/* Quick Learn Tab */}
        <TabsContent value="quick-learn" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loadingQuickLearns ? (
            <LoadingCards />
          ) : (
            <>
              {quickLearns.length > 0 ? (
                quickLearns.map((ql) => (
          <QuickLearnCard key={ql.id} session={ql} />
        ))
      ) : null}
      <CreateNewQuickLearnCard />
    </>
  )}
</TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] animate-fade-in">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary animate-spin-slow" />
      </div>
      <h2 className="mt-6 text-2xl font-display font-semibold text-center text-primary">
        Loading your Dashboard...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Preparing your learning journey ✨
      </p>
    </div>
  )
}


function LoadingCards() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/50 animate-pulse">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-2/3 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

function CourseCard({ course }: { course: CourseType }) {
  return (
    <Card className="border-border/50 card-hover group">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-xs text-primary mb-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Course</span>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
          {course.title}
        </CardTitle>
        <CardDescription className="mt-1.5">
          Flashcard set for course material
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span className="text-primary font-medium">{course.completed || 0}%</span>
          </div>
          <Progress value={course.completed || 0} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{course.lessons || 0} lessons</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {formatDistanceToNowStrict(parseISO(course.last_accessed), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button className="glow-button w-full" asChild>
          <Link href={`/courses/${course.id}`}>Continue</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function QuickLearnCard({ session }: { session: QuickLearnType }) {
  return (
    <Card className="border-border/50 card-hover group">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-xs text-secondary mb-1.5">
          <Zap className="h-3.5 w-3.5" />
          <span>Quick Learn</span>
        </div>
        <CardTitle className="text-lg group-hover:text-secondary transition-colors truncate">
          {session.title}
        </CardTitle>
        <CardDescription className="mt-1.5">
          Flashcard set for quick learn topic
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span className="text-secondary font-medium">{session.completed || 0}%</span>
          </div>
          <Progress value={session.completed || 0} className="h-2 bg-secondary/10 [&>div]:bg-secondary" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{session.duration || "10 min"}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {formatDistanceToNowStrict(parseISO(session.last_accessed), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button className="glow-button-pink w-full" asChild>
          <Link href={`/quick-learn/${session.id}`}>Continue</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function CreateNewCourseCard() {
  return (
    <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
      <CardContent className="flex flex-col items-center justify-center h-full py-10">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Plus className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Create New Course</h3>
        <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
          Generate a personalized learning experience with AI-powered course creation
        </p>
        <Button className="glow-button" asChild>
          <Link href="/courses/create">
            <Sparkles className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function CreateNewQuickLearnCard() {
  return (
    <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
      <CardContent className="flex flex-col items-center justify-center h-full py-10">
        <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
          <Zap className="h-7 w-7 text-secondary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Quick Learn</h3>
        <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
          Create a focused single-topic lesson in minutes
        </p>
        <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
          <Link href="/quick-learn/create">
            <Zap className="mr-2 h-4 w-4" />
            Start Quick Learn
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}