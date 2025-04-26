"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Brain,
  ChevronRight,
  FileUp,
  History,
  Layers,
  Lightbulb,
  Loader2,
  MoreHorizontal,
  Send,
  X,
  Zap,
  Check,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function TutorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI tutor. How can I help you with your learning today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [contextPanelOpen, setContextPanelOpen] = useState(true)
  const [selectedContexts, setSelectedContexts] = useState<SelectedContext[]>([])
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([
    {
      id: 1,
      title: "Python Variables Discussion",
      date: "2 days ago",
      preview: "We discussed Python variable scoping and best practices",
    },
    {
      id: 2,
      title: "JavaScript Promises",
      date: "Yesterday",
      preview: "Explanation of async/await and Promise chains",
    },
    { id: 3, title: "CSS Grid Layout", date: "4 hours ago", preview: "How to create responsive layouts with CSS Grid" },
  ])
  const [showChatHistory, setShowChatHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const suggestedPrompts = [
    "Explain JavaScript Promises",
    "How do Python list comprehensions work?",
    "What are React Hooks?",
    "Explain CSS Grid layout",
  ]

  // Auto-scroll to bottom of messages
  useEffect(() => {
    const checkAuthAndScroll = async () => {
      const { data: { session } } = await supabase.auth.getSession()
  
      if (!session) {
        router.push("/auth")
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }
  
    checkAuthAndScroll()
  }, [messages, router])

  const handleSelectCourse = (course: Course) => {
    // Check if this course is already selected
    const isAlreadySelected = selectedContexts.some((ctx) => ctx.type === "course" && ctx.title === course.title)

    if (isAlreadySelected) {
      // If already selected, remove it
      setSelectedContexts(selectedContexts.filter((ctx) => !(ctx.type === "course" && ctx.title === course.title)))
    } else {
      // If not selected, add it
      setSelectedContexts([
        ...selectedContexts,
        {
          type: "course",
          title: course.title,
          progress: course.progress,
          icon: <Layers className="h-4 w-4 text-primary" />,
        },
      ])
    }
  }

  const handleSelectFlashcardSet = (set: FlashcardSet) => {
    // Check if this set is already selected
    const isAlreadySelected = selectedContexts.some((ctx) => ctx.type === "flashcardSet" && ctx.title === set.title)

    if (isAlreadySelected) {
      // If already selected, remove it
      setSelectedContexts(selectedContexts.filter((ctx) => !(ctx.type === "flashcardSet" && ctx.title === set.title)))
    } else {
      // If not selected, add it
      setSelectedContexts([
        ...selectedContexts,
        {
          type: "flashcardSet",
          title: set.title,
          cardCount: set.cardCount,
          icon: <BookOpen className="h-4 w-4 text-secondary" />,
        },
      ])
    }
  }

  const handleClearContext = (contextToRemove?: SelectedContext) => {
    if (contextToRemove) {
      // Remove specific context
      setSelectedContexts(
        selectedContexts.filter((ctx) => !(ctx.type === contextToRemove.type && ctx.title === contextToRemove.title)),
      )
    } else {
      // Clear all contexts
      setSelectedContexts([])
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      contexts: selectedContexts.length > 0 ? [...selectedContexts] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses: { [key: string]: string } = {
        "javascript promises":
          "JavaScript Promises are objects that represent the eventual completion (or failure) of an asynchronous operation and its resulting value. They're used to handle asynchronous operations in a more synchronous, readable manner.\n\nHere's a simple example:\n```javascript\nconst myPromise = new Promise((resolve, reject) => {\n  // Asynchronous operation\n  const success = true;\n  \n  if (success) {\n    resolve('Operation completed successfully!');\n  } else {\n    reject('Operation failed!');\n  }\n});\n\nmyPromise\n  .then(result => console.log(result))\n  .catch(error => console.error(error));\n```\n\nWould you like me to explain any specific aspect of Promises in more detail?",
        "python list comprehension":
          "List comprehensions in Python provide a concise way to create lists based on existing lists or other iterable objects.\n\nThe basic syntax is:\n```python\n[expression for item in iterable if condition]\n```\n\nHere are some examples:\n\n1. Create a list of squares:\n```python\nsquares = [x**2 for x in range(10)]\n# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n```\n\n2. Filter even numbers:\n```python\neven_numbers = [x for x in range(10) if x % 2 == 0]\n# [0, 2, 4, 6, 8]\n```\n\n3. Create a list of tuples:\n```python\ncoordinates = [(x, y) for x in range(3) for y in range(2)]\n# [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0), (2, 1)]\n```\n\nList comprehensions are more concise and often faster than equivalent for loops. Would you like to see more examples or have questions about a specific use case?",
        "react hooks":
          "React Hooks are functions that let you use state and other React features in functional components instead of writing class components.\n\nThe most commonly used hooks are:\n\n1. **useState**: Lets you add state to functional components\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n2. **useEffect**: Lets you perform side effects in functional components\n```jsx\nuseEffect(() => {\n  document.title = `You clicked ${count} times`;\n}, [count]); // Only re-run if count changes\n```\n\n3. **useContext**: Lets you subscribe to React context without introducing nesting\n```jsx\nconst theme = useContext(ThemeContext);\n```\n\n4. **useRef**: Lets you create a mutable ref object that persists for the lifetime of the component\n```jsx\nconst inputRef = useRef(null);\n```\n\nWould you like me to explain any specific hook in more detail?",
        "css grid":
          "CSS Grid Layout is a two-dimensional layout system designed for the web. It lets you lay out items in rows and columns.\n\nHere's a basic example:\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr; /* Three equal columns */\n  grid-template-rows: 100px 200px; /* Two rows with specific heights */\n  gap: 10px; /* Gap between grid items */\n}\n```\n\nSome key concepts:\n\n1. **Grid Container**: The element with `display: grid`\n2. **Grid Items**: Direct children of the grid container\n3. **Grid Lines**: The dividing lines that make up the grid\n4. **Grid Tracks**: The space between two adjacent grid lines (rows or columns)\n5. **Grid Cell**: The intersection of a row and column\n6. **Grid Area**: Multiple grid cells together\n\nCSS Grid is powerful for creating complex layouts that were difficult with older CSS methods. Would you like to know more about specific Grid properties or see more examples?",
        help: "I'm your AI tutor, here to help with your learning journey! Here are some ways I can assist you:\n\n- **Explain concepts**: Ask me to explain any topic you're learning about\n- **Answer questions**: I can answer questions about your coursework\n- **Provide examples**: I can give examples to illustrate concepts\n- **Quiz you**: I can create practice questions to test your knowledge\n- **Simplify complex ideas**: I can break down difficult concepts\n- **Suggest resources**: I can recommend additional learning materials\n\nFeel free to ask about any topic you're studying, and I'll do my best to help!",
      }

      // Check if the user's message contains any of the keywords
      const lowerCaseInput = userMessage.content.toLowerCase()
      let responseContent =
        "I'm not sure I understand. Could you please provide more details about what you'd like to learn?"

      for (const [keyword, response] of Object.entries(aiResponses)) {
        if (lowerCaseInput.includes(keyword)) {
          responseContent = response
          break
        }
      }

      // If there are selected contexts, add contextual responses
      if (selectedContexts.length > 0) {
        const contextIntro =
          selectedContexts.length === 1
            ? `Based on your "${selectedContexts[0].title}" ${selectedContexts[0].type === "course" ? "course" : "flashcard set"}:\n\n`
            : `Based on your selected learning materials (${selectedContexts.length} items):\n\n`

        responseContent = contextIntro + responseContent
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleStartNewChat = () => {
    // Save current chat to history if it has more than just the welcome message
    if (messages.length > 1) {
      const newChatSession: ChatSession = {
        id: chatHistory.length + 1,
        title: `Chat ${chatHistory.length + 1}`,
        date: "Just now",
        preview: messages[messages.length - 2].content.substring(0, 50) + "...",
      }
      setChatHistory([newChatSession, ...chatHistory])
    }

    // Reset the current chat
    setMessages([
      {
        role: "assistant",
        content: "Hi there! I'm your AI tutor. How can I help you with your learning today?",
        timestamp: new Date(),
      },
    ])
    setSelectedContexts([]) // Clear all contexts
  }

  const handleLoadChatSession = (sessionId: number) => {
    // In a real app, we would load the actual messages from this session
    // For now, we'll just simulate loading a previous chat
    setMessages([
      {
        role: "assistant",
        content: "Hi there! I'm your AI tutor. How can I help you with your learning today?",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        role: "user",
        content: "Can you explain " + chatHistory.find((s) => s.id === sessionId)?.title,
        timestamp: new Date(Date.now() - 3590000),
      },
      {
        role: "assistant",
        content: chatHistory.find((s) => s.id === sessionId)?.preview + " Would you like to know more?",
        timestamp: new Date(Date.now() - 3580000),
      },
    ])
    setShowChatHistory(false)
  }

  return (
    <div className="flex-1 w-full mx-auto">
      <AppShell title="AI Tutor" description="Get personalized learning assistance">
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          {/* Main chat area */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Chat header with controls */}
            <div className="border-b border-border/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowChatHistory(!showChatHistory)}
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">Chat History</span>
                  </Button>
                </div>

                <div className="flex items-center gap-8 px-8">
                  <Button variant="outline" size="sm" onClick={handleStartNewChat}>
                    New Chat
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setContextPanelOpen(!contextPanelOpen)}>
                        {contextPanelOpen ? "Hide" : "Show"} Learning Context
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleStartNewChat}>Start New Chat</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowChatHistory(true)}>View Chat History</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {!contextPanelOpen && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setContextPanelOpen(true)}
                      className="top-20 h-8 glow-button"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      <span>Learning Context</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat history panel (conditionally shown) */}
            {showChatHistory && (
              <div className="border-b border-border/40 bg-muted/20">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Chat History</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowChatHistory(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {chatHistory.map((session) => (
                      <Card
                        key={session.id}
                        className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleLoadChatSession(session.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-medium">{session.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{session.preview}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{session.date}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className="flex">
                    <div
                      className={cn(
                        "max-w-full rounded-lg p-4 w-fit",
                        message.role === "user"
                          ? "ml-auto bg-primary/10 text-foreground glow-border"
                          : "mr-auto bg-muted text-foreground glow-border-pink",
                        "animate-in slide-in-from-bottom-5 fade-in-50 duration-300"
                      )}
                    >
                      {message.contexts && message.contexts.length > 0 && (
                        <div className="mb-2 pb-2 border-b border-border/40">
                          <div className="text-xs text-muted-foreground mb-1">
                            Using {message.contexts.length} learning context{message.contexts.length > 1 ? "s" : ""}:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.contexts.map((context, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-muted/30 rounded px-2 py-1">
                                <div className="flex-shrink-0">{context.icon}</div>
                                <span className="text-xs font-medium">{context.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted text-foreground glow-border-pink animate-in fade-in-50 duration-300">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-border/40 p-4">
              <div className="px-14 space-y-3">
                {selectedContexts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-3">
                    {selectedContexts.map((context, index) => (
                      <Card key={index} className="border-border/50 bg-muted/30">
                        <CardContent className="p-2 flex items-center gap-2">
                          <div className="flex-shrink-0">{context.icon}</div>
                          <div className="text-sm truncate">
                            <span className="font-medium">{context.title}</span>
                            <div className="text-xs text-muted-foreground">
                              {context.type === "course" ? `${context.progress}% complete` : `${context.cardCount} cards`}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => handleClearContext(context)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove context</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedContexts.length > 1 && (
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleClearContext()}>
                        Clear All
                      </Button>
                    )}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask your AI tutor anything..."
                    className="flex-1 input-glow h-11"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="glow-button h-11 w-11"
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>

                <div className="overflow-x-auto pb-1">
                  <div className="flex gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap animate-in fade-in-50 duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => setInputValue(prompt)}
                      >
                        <Lightbulb className="mr-2 h-3.5 w-3.5 text-secondary" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Ask about course concepts, request explanations, or get help with difficult topics.
                </p>
              </div>
            </div>
          </div>

          {/* Context panel */}
          <div
            className={`border-l border-border/40 transition-all duration-300 ease-in-out ${
              contextPanelOpen ? "w-80" : "w-0"
            } overflow-hidden`}
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border/40 flex items-center justify-between">
                <h3 className="font-medium">Learning Context</h3>
                <Button variant="ghost" size="icon" onClick={() => setContextPanelOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close panel</span>
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Tabs defaultValue="courses">
                  <TabsList className="inline-flex justify-center items-center px-1 py-5 bg-card border border-border rounded-full mb-6 z-10 relative shadow-sm">
                    <TabsTrigger
                      value="courses"
                      className="px-3 py-4 text-base font-medium rounded-full transition-all
                        text-muted-foreground hover:text-foreground
                        data-[state=active]:text-white
                        data-[state=active]:bg-primary/60
                        data-[state=active]:shadow
                        data-[state=active]:glow-text"
                    >
                      Courses
                    </TabsTrigger>
                    <TabsTrigger
                      value="flashcards"
                      className="px-3 py-4 text-base font-medium rounded-full transition-all
                        text-muted-foreground hover:text-foreground
                        data-[state=active]:text-white
                        data-[state=active]:bg-primary/60
                        data-[state=active]:shadow
                        data-[state=active]:glow-text"
                    >
                      Flashcards
                    </TabsTrigger>
                    <TabsTrigger
                      value="upload"
                      className="px-3 py-4 text-base font-medium rounded-full transition-all
                        text-muted-foreground hover:text-foreground
                        data-[state=active]:text-white
                        data-[state=active]:bg-primary/60
                        data-[state=active]:shadow
                        data-[state=active]:glow-text"
                    >
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="courses" className="mt-4 space-y-4 animate-in fade-in-50 duration-300">
                    <p className="text-sm text-muted-foreground">Select a course to provide context for your questions</p>

                    {[
                      {
                        id: 1,
                        title: "Introduction to Python",
                        progress: 65,
                        icon: <Layers className="h-4 w-4 text-primary" />,
                      },
                      {
                        id: 2,
                        title: "Web Development Fundamentals",
                        progress: 30,
                        icon: <Layers className="h-4 w-4 text-primary" />,
                      },
                      {
                        id: 3,
                        title: "JavaScript Promises",
                        progress: 100,
                        icon: <Zap className="h-4 w-4 text-secondary" />,
                      },
                    ].map((course, index) => {
                      const isSelected = selectedContexts.some(
                        (ctx) => ctx.type === "course" && ctx.title === course.title,
                      )
                      return (
                        <Card
                          key={index}
                          className={`border-border/50 cursor-pointer hover:border-primary/50 transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => handleSelectCourse(course)}
                        >
                          <CardHeader className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">{course.icon}</div>
                              <div className="flex-1">
                                <CardTitle className="text-sm">{course.title}</CardTitle>
                                <CardDescription className="text-xs">{course.progress}% complete</CardDescription>
                              </div>
                              {isSelected && (
                                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-primary" />
                                </div>
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </TabsContent>

                  <TabsContent value="flashcards" className="mt-4 space-y-4 animate-in fade-in-50 duration-300">
                    <p className="text-sm text-muted-foreground">Select a flashcard set to provide context</p>

                    <div className="space-y-2">
                      {[
                        {
                          id: 1,
                          title: "JavaScript Promises",
                          cardCount: 12,
                          icon: <BookOpen className="h-4 w-4 text-secondary" />,
                        },
                        {
                          id: 2,
                          title: "Python Basics",
                          cardCount: 24,
                          icon: <BookOpen className="h-4 w-4 text-secondary" />,
                        },
                        {
                          id: 3,
                          title: "React Hooks",
                          cardCount: 15,
                          icon: <BookOpen className="h-4 w-4 text-secondary" />,
                        },
                        {
                          id: 4,
                          title: "CSS Grid Layout",
                          cardCount: 8,
                          icon: <BookOpen className="h-4 w-4 text-secondary" />,
                        },
                      ].map((set, index) => {
                        const isSelected = selectedContexts.some(
                          (ctx) => ctx.type === "flashcardSet" && ctx.title === set.title,
                        )
                        return (
                          <Card
                            key={index}
                            className={`border-border/50 cursor-pointer hover:border-primary/50 transition-colors ${
                              isSelected ? "border-secondary bg-secondary/5" : ""
                            }`}
                            onClick={() => handleSelectFlashcardSet(set)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div>{set.icon}</div>
                                  <div>
                                    <div className="text-sm font-medium">{set.title}</div>
                                    <div className="text-xs text-muted-foreground">{set.cardCount} cards</div>
                                  </div>
                                </div>
                                {isSelected ? (
                                  <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-secondary" />
                                  </div>
                                ) : (
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View All Flashcards
                    </Button>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4 space-y-4 animate-in fade-in-50 duration-300">
                    <p className="text-sm text-muted-foreground">Upload materials for the AI tutor to reference</p>

                    <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <FileUp className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-muted-foreground">Supports PDF, DOCX, TXT, JPG, PNG (max 10MB)</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="p-4 border-t border-border/40">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Suggested Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "JavaScript Promises", icon: <Lightbulb className="h-3 w-3" /> },
                      { label: "Python Lists", icon: <Lightbulb className="h-3 w-3" /> },
                      { label: "CSS Grid", icon: <Lightbulb className="h-3 w-3" /> },
                    ].map((topic, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setInputValue(`Tell me about ${topic.label}`)}
                      >
                        {topic.icon}
                        <span className="ml-1">{topic.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </div>
  )
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  contexts?: SelectedContext[]
}

interface SelectedContext {
  type: "course" | "flashcardSet"
  title: string
  progress?: number
  cardCount?: number
  icon: React.ReactNode
}

interface Course {
  id: number
  title: string
  progress: number
  icon: React.ReactNode
}

interface FlashcardSet {
  id: number
  title: string
  cardCount: number
  icon: React.ReactNode
}

interface ChatSession {
  id: number
  title: string
  date: string
  preview: string
}
