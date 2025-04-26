import Link from "next/link"
import { Clock, ExternalLink, FileText, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AppShell } from "@/components/layout/app-shell"

export default function QuickLearnOverviewPage() {
  // Mock quick learn sessions data
  const quickLearnSessions = [
    {
      id: 1,
      title: "JavaScript Promises",
      description: "Understanding asynchronous programming",
      date: "2 days ago",
      duration: "15 min",
    },
    {
      id: 2,
      title: "CSS Grid Layout",
      description: "Modern web layouts with CSS Grid",
      date: "Last week",
      duration: "10 min",
    },
    {
      id: 3,
      title: "React Hooks",
      description: "Using useState and useEffect",
      date: "Yesterday",
      duration: "20 min",
    },
    {
      id: 4,
      title: "Python List Comprehensions",
      description: "Concise way to create lists in Python",
      date: "4 days ago",
      duration: "8 min",
    },
  ]

  return (
    <AppShell title="Quick Learn" description="Fast, focused learning on specific topics">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="md:hidden">
            <h1 className="text-3xl font-display glow-text-pink">Quick Learn</h1>
            <p className="text-muted-foreground">Fast, focused learning on specific topics</p>
          </div>
          <div className="sm:ml-auto">
            <Button className="glow-button-pink bg-secondary hover:bg-secondary/90 w-full sm:w-auto" asChild>
              <Link href="/quick-learn">
                <Zap className="mr-2 h-4 w-4" />
                New Quick Learn Session
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickLearnSessions.map((session) => (
            <Card key={session.id} className="border-border/50 card-hover group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-xs text-secondary mb-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Quick Learn</span>
                </div>
                <CardTitle className="text-lg group-hover:text-secondary transition-colors truncate">
                  {session.title}
                </CardTitle>
                <CardDescription className="mt-1.5 line-clamp-2">{session.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{session.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{session.date}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/quick-learn/${session.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Session
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Card className="border-border/50 border-dashed bg-muted/50 card-hover">
            <CardContent className="flex flex-col items-center justify-center h-full py-10">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Plus className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Start Quick Learn</h3>
              <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
                Create a focused learning session on a specific topic in minutes
              </p>
              <Button className="glow-button-pink bg-secondary hover:bg-secondary/90" asChild>
                <Link href="/quick-learn">
                  <Zap className="mr-2 h-4 w-4" />
                  Start
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
