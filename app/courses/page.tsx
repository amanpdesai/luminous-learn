import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Edit, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"

export default function CoursesPage() {
  // Mock course data
  const courses = [
    {
      id: 1,
      title: "Introduction to Python Programming",
      description: "Learn the basics of Python programming language",
      progress: 65,
      lastAccessed: "2 days ago",
      lessons: 12,
      completed: 8,
    },
    {
      id: 2,
      title: "Web Development Fundamentals",
      description: "HTML, CSS, and JavaScript basics",
      progress: 30,
      lastAccessed: "Yesterday",
      lessons: 15,
      completed: 5,
    },
    {
      id: 3,
      title: "Data Science Essentials",
      description: "Introduction to data analysis and visualization",
      progress: 10,
      lastAccessed: "1 week ago",
      lessons: 20,
      completed: 2,
    },
    {
      id: 4,
      title: "Machine Learning Fundamentals",
      description: "Introduction to machine learning algorithms and concepts",
      progress: 0,
      lastAccessed: "Never",
      lessons: 18,
      completed: 0,
    },
    {
      id: 5,
      title: "Advanced JavaScript",
      description: "Modern JavaScript features and patterns",
      progress: 85,
      lastAccessed: "3 days ago",
      lessons: 10,
      completed: 8,
    },
    {
      id: 6,
      title: "React for Beginners",
      description: "Building user interfaces with React",
      progress: 45,
      lastAccessed: "5 days ago",
      lessons: 14,
      completed: 6,
    },
  ]

  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display glow-text mb-1">My Courses</h1>
              <p className="text-muted-foreground">Manage and continue your learning journey</p>
            </div>
            <div className="sm:ml-auto">
              <Button className="glow-button w-full sm:w-auto" asChild>
                <Link href="/create-course">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="border-border/50 card-hover group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </CardTitle>
                    <Link href={`/courses/${course.id}/edit`}>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <Edit className="h-4 w-4" />
                      </div>
                    </Link>
                  </div>
                  <CardDescription className="mt-1.5 line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className="text-primary font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {course.completed}/{course.lessons} lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{course.lastAccessed}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-3 pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/courses/${course.id}/edit`}>Edit Outline</Link>
                  </Button>
                  <Button size="sm" className="glow-button" asChild>
                    <Link href={`/courses/${course.id}`}>Continue</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}

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
                  <Link href="/create-course">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    </div>
  )
}
