"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppShell } from "@/components/layout/app-shell"
import { FileText, Plus, Search } from "lucide-react"
import Link from "next/link"

export default function QuizzesPage() {
  // Mock quiz data
  const quizzes = [
    {
      id: "1",
      title: "Python Fundamentals",
      description: "Test your knowledge of Python basics",
      questions: 15,
      lastAttempt: "2 days ago",
      score: "85%",
      course: "Introduction to Python Programming",
    },
    {
      id: "2",
      title: "JavaScript Promises",
      description: "Quiz on asynchronous JavaScript",
      questions: 10,
      lastAttempt: "1 week ago",
      score: "70%",
      course: "Advanced JavaScript",
    },
    {
      id: "3",
      title: "CSS Grid & Flexbox",
      description: "Test your layout skills",
      questions: 12,
      lastAttempt: "3 days ago",
      score: "92%",
      course: "Web Development Fundamentals",
    },
    {
      id: "4",
      title: "React Hooks",
      description: "Understanding React's hook system",
      questions: 20,
      lastAttempt: "Yesterday",
      score: "78%",
      course: "React Masterclass",
    },
  ]

  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display">Quizzes</h1>
                <p className="text-muted-foreground mt-1">Test your knowledge and track your progress</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search quizzes..."
                    className="w-[250px] pl-8 rounded-lg border-border/40 bg-muted/40"
                  />
                </div>
                <Link href="/quizzes/create">
                  <Button className="gap-2 glow-button">
                    <Plus className="h-4 w-4" />
                    Create Quiz
                  </Button>
                </Link>
              </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="bg-muted/40 p-1">
                <TabsTrigger value="all" className="rounded-md">
                  All Quizzes
                </TabsTrigger>
                <TabsTrigger value="recent" className="rounded-md">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="course" className="rounded-md">
                  By Course
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="block">
                      <Card className="h-full border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{quiz.title}</CardTitle>
                              <CardDescription className="mt-1">{quiz.description}</CardDescription>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="text-sm text-muted-foreground">
                            <p>From: {quiz.course}</p>
                            <p>{quiz.questions} questions</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-border/40 pt-3">
                          <div className="text-xs text-muted-foreground">Last attempt: {quiz.lastAttempt}</div>
                          <div className="text-xs font-medium">Score: {quiz.score}</div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}

                  <Card className="h-full border-dashed border-border/50 hover:border-primary/50 transition-colors bg-muted/20">
                    <Link href="/quizzes/create">
                      <CardContent className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-xl mb-2">Create New Quiz</CardTitle>
                        <CardDescription>Build a custom quiz to test your knowledge</CardDescription>
                      </CardContent>
                    </Link>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recent" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.slice(0, 2).map((quiz) => (
                    <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="block">
                      <Card className="h-full border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{quiz.title}</CardTitle>
                              <CardDescription className="mt-1">{quiz.description}</CardDescription>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="text-sm text-muted-foreground">
                            <p>From: {quiz.course}</p>
                            <p>{quiz.questions} questions</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-border/40 pt-3">
                          <div className="text-xs text-muted-foreground">Last attempt: {quiz.lastAttempt}</div>
                          <div className="text-xs font-medium">Score: {quiz.score}</div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="course" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="block">
                      <Card className="h-full border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{quiz.title}</CardTitle>
                              <CardDescription className="mt-1">{quiz.description}</CardDescription>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="text-sm text-muted-foreground">
                            <p>From: {quiz.course}</p>
                            <p>{quiz.questions} questions</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-border/40 pt-3">
                          <div className="text-xs text-muted-foreground">Last attempt: {quiz.lastAttempt}</div>
                          <div className="text-xs font-medium">Score: {quiz.score}</div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AppShell>
    </div>
  )
}
