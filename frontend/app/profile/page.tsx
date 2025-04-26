import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, Edit, FileText, Layers, Medal, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"

export default function ProfilePage() {
  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 border-4 border-border">
                <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                <AvatarFallback className="text-2xl">JD</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="md:hidden">
                  <h1 className="text-3xl font-display">John Doe</h1>
                  <p className="text-muted-foreground">john.doe@example.com</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold">12</span>
                  <span className="text-sm text-muted-foreground">Courses Created</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold">87</span>
                  <span className="text-sm text-muted-foreground">Lessons Completed</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold">32</span>
                  <span className="text-sm text-muted-foreground">Hours Learned</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="activity" className="flex-1">
                Activity
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-1">
                Achievements
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">
                Learning Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your learning activity from the past month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="grid grid-cols-7 gap-1 flex-1">
                        {Array.from({ length: 28 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-8 rounded-md ${
                              [3, 5, 8, 9, 12, 15, 16, 19, 22, 26].includes(i)
                                ? "bg-primary/80"
                                : [1, 6, 10, 17, 24].includes(i)
                                  ? "bg-primary/40"
                                  : "bg-muted"
                            }`}
                            title={`${[3, 5, 8, 9, 12, 15, 16, 19, 22, 26].includes(i) ? "Multiple activities" : [1, 6, 10, 17, 24].includes(i) ? "One activity" : "No activity"}`}
                          />
                        ))}
                      </div>
                      <div className="space-y-2 w-32">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-primary/80 rounded-sm" />
                          <span className="text-xs">High activity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-primary/40 rounded-sm" />
                          <span className="text-xs">Medium activity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-muted rounded-sm" />
                          <span className="text-xs">No activity</span>
                        </div>
                      </div>
                    </div>

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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Course Creator",
                    description: "Created your first course",
                    icon: <Sparkles className="h-6 w-6 text-yellow-500" />,
                    date: "Apr 15, 2023",
                    unlocked: true,
                  },
                  {
                    title: "Quick Learner",
                    description: "Completed 10 Quick Learn sessions",
                    icon: <Zap className="h-6 w-6 text-secondary" />,
                    date: "May 2, 2023",
                    unlocked: true,
                  },
                  {
                    title: "Flashcard Master",
                    description: "Reviewed 100 flashcards",
                    icon: <BookOpen className="h-6 w-6 text-primary" />,
                    date: "Jun 10, 2023",
                    unlocked: true,
                  },
                  {
                    title: "Course Completer",
                    description: "Finished your first full course",
                    icon: <Medal className="h-6 w-6 text-yellow-500" />,
                    date: "Jul 22, 2023",
                    unlocked: true,
                  },
                  {
                    title: "Learning Streak",
                    description: "Learned for 7 consecutive days",
                    icon: <Calendar className="h-6 w-6 text-primary" />,
                    date: "Aug 5, 2023",
                    unlocked: true,
                  },
                  {
                    title: "Python Expert",
                    description: "Complete all Python-related courses",
                    icon: <FileText className="h-6 w-6 text-muted-foreground" />,
                    date: "Not unlocked yet",
                    unlocked: false,
                  },
                ].map((achievement, index) => (
                  <Card key={index} className={`border-border/50 ${achievement.unlocked ? "card-hover" : "opacity-60"}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <div
                          className={`h-10 w-10 rounded-full ${achievement.unlocked ? "bg-primary/20" : "bg-muted"} flex items-center justify-center`}
                        >
                          {achievement.icon}
                        </div>
                      </div>
                      <CardDescription className="mt-1.5">{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{achievement.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>Your overall course completion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Introduction to Python</span>
                          <span className="text-primary">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Web Development Fundamentals</span>
                          <span className="text-primary">30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Data Science Essentials</span>
                          <span className="text-primary">10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Advanced JavaScript</span>
                          <span className="text-primary">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Learning Distribution</CardTitle>
                    <CardDescription>Time spent by subject area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="h-48 flex items-end gap-4 justify-around">
                        {[
                          { label: "Python", value: 45, color: "bg-primary" },
                          { label: "JavaScript", value: 30, color: "bg-secondary" },
                          { label: "HTML/CSS", value: 15, color: "bg-primary/60" },
                          { label: "Data Science", value: 10, color: "bg-secondary/60" },
                        ].map((item, index) => (
                          <div key={index} className="flex flex-col items-center gap-2">
                            <div
                              className={`w-16 ${item.color} rounded-t-md`}
                              style={{ height: `${item.value * 1.5}px` }}
                            />
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                            <span className="text-xs font-medium">{item.value}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Learning Time</p>
                            <p className="text-xl font-bold">32 hours</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Avg. Session Length</p>
                            <p className="text-xl font-bold">45 minutes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button asChild>
                  <Link href="/courses">
                    <Layers className="mr-2 h-4 w-4" />
                    Continue Learning
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
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
