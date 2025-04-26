"use client";
import type React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ChevronLeft, ChevronRight, FileText, Lightbulb, MoreHorizontal, Play, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Lesson = {
  title: string;
  completed: boolean;
  content?: string; // Mark it optional
};

type Unit = {
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  lastAccessed: string;
  units: Unit[];
};

export default function CoursePage() {
  const [activeLesson, setActiveLesson] = useState(0)

  const params = useParams();
  const id: string = Array.isArray(params.id) ? params.id[0] : params.id!;

  // Mock course data
  const course: Course = {
    id: id,
    title: "Introduction to Python Programming",
    description:
      "A comprehensive introduction to Python programming language, covering basic syntax, data structures, control flow, and practical applications.",
    progress: 35,
    totalLessons: 12,
    completedLessons: 4,
    estimatedTime: "8 hours",
    lastAccessed: "2 days ago",
    units: [
      {
        title: "Getting Started with Python",
        lessons: [
          {
            title: "Introduction to Programming Concepts",
            completed: true,
            content: `
              <h2>Introduction to Programming Concepts</h2>
              <p>Programming is the process of creating a set of instructions that tell a computer how to perform a task. These instructions can be written in various programming languages, each with its own syntax and rules.</p>
              
              <h3>Why Learn Programming?</h3>
              <ul>
                <li>Problem-solving skills development</li>
                <li>Career opportunities in tech</li>
                <li>Automation of repetitive tasks</li>
                <li>Building software and applications</li>
              </ul>
              
              <h3>Why Python?</h3>
              <p>Python is one of the most popular programming languages in the world, known for its simplicity and readability. It's an excellent first language for beginners because:</p>
              
              <ul>
                <li>Simple, readable syntax</li>
                <li>Versatile - used in web development, data science, AI, automation, and more</li>
                <li>Large community and extensive libraries</li>
                <li>High demand in the job market</li>
              </ul>
              
              <h3>Basic Programming Concepts</h3>
              
              <h4>Variables</h4>
              <p>Variables are containers for storing data values. In Python, you don't need to declare a variable's type:</p>
              <pre><code>name = "John"
age = 30
height = 5.9</code></pre>
              
              <h4>Data Types</h4>
              <p>Python has several built-in data types:</p>
              <ul>
                <li>Strings: Text data</li>
                <li>Integers: Whole numbers</li>
                <li>Floats: Decimal numbers</li>
                <li>Booleans: True/False values</li>
                <li>Lists: Ordered collections</li>
                <li>Dictionaries: Key-value pairs</li>
              </ul>
              
              <h4>Control Flow</h4>
              <p>Control flow statements allow you to control the order in which your code executes:</p>
              <ul>
                <li>Conditionals (if, else, elif)</li>
                <li>Loops (for, while)</li>
                <li>Functions</li>
              </ul>
            `,
          },
          {
            title: "Setting Up Your Python Environment",
            completed: true,
            content: `
              <h2>Setting Up Your Python Environment</h2>
              <p>Before you can start writing Python code, you need to set up your development environment. This lesson will guide you through installing Python and choosing an editor.</p>
              
              <h3>Installing Python</h3>
              <p>Visit <a href="https://python.org" target="_blank">python.org</a> and download the latest version of Python for your operating system.</p>
              
              <h4>Windows Installation</h4>
              <ol>
                <li>Run the installer</li>
                <li>Check "Add Python to PATH"</li>
                <li>Click "Install Now"</li>
              </ol>
              
              <h4>macOS Installation</h4>
              <ol>
                <li>Run the installer package</li>
                <li>Follow the installation wizard</li>
              </ol>
              
              <h4>Linux Installation</h4>
              <p>Most Linux distributions come with Python pre-installed. If not, you can install it using your package manager:</p>
              <pre><code>sudo apt-get install python3    # Ubuntu/Debian
sudo dnf install python3      # Fedora
sudo pacman -S python         # Arch Linux</code></pre>
              
              <h3>Choosing a Code Editor</h3>
              <p>You'll need a code editor or IDE (Integrated Development Environment) to write Python code. Here are some popular options:</p>
              
              <h4>Visual Studio Code</h4>
              <p>A lightweight, powerful code editor with excellent Python support through extensions.</p>
              <ul>
                <li>Download from <a href="https://code.visualstudio.com/" target="_blank">code.visualstudio.com</a></li>
                <li>Install the Python extension</li>
              </ul>
              
              <h4>PyCharm</h4>
              <p>A full-featured Python IDE with advanced tools for professional developers.</p>
              <ul>
                <li>Download from <a href="https://www.jetbrains.com/pycharm/" target="_blank">jetbrains.com/pycharm</a></li>
                <li>Community Edition is free and sufficient for beginners</li>
              </ul>
              
              <h4>IDLE</h4>
              <p>Python's built-in editor and interactive environment, installed automatically with Python.</p>
              
              <h3>Verifying Your Installation</h3>
              <p>Open a terminal or command prompt and type:</p>
              <pre><code>python --version</code></pre>
              <p>or</p>
              <pre><code>python3 --version</code></pre>
              
              <p>You should see the Python version number if the installation was successful.</p>
            `,
          },
          {
            title: "Your First Python Program",
            completed: true,
            content: `
              <h2>Your First Python Program</h2>
              <p>Now that you have Python installed, let's write your first program!</p>
              
              <h3>The Classic "Hello, World!"</h3>
              <p>Traditionally, the first program in any language is one that outputs "Hello, World!" to the screen.</p>
              
              <h4>Using the Python Interactive Shell</h4>
              <ol>
                <li>Open a terminal or command prompt</li>
                <li>Type <code>python</code> or <code>python3</code> to start the interactive shell</li>
                <li>Type the following and press Enter:</li>
              </ol>
              <pre><code>print("Hello, World!")</code></pre>
              <p>You should see "Hello, World!" displayed on the screen.</p>
              
              <h4>Creating a Python File</h4>
              <ol>
                <li>Open your code editor</li>
                <li>Create a new file called <code>hello.py</code></li>
                <li>Type the following code:</li>
              </ol>
              <pre><code># My first Python program
print("Hello, World!")
print("Welcome to Python programming!")</code></pre>
              <li>Save the file</li>
              <li>Run the program from the terminal:</li>
              <pre><code>python hello.py</code></pre>
              
              <h3>Understanding the Code</h3>
              <p>Let's break down what's happening in our simple program:</p>
              
              <ul>
                <li><code># My first Python program</code> - This is a comment. Comments start with # and are ignored by Python. They're used to explain code.</li>
                <li><code>print("Hello, World!")</code> - The print() function displays text to the screen. Text strings are enclosed in quotes.</li>
              </ul>
              
              <h3>Experimenting with Your Program</h3>
              <p>Try modifying your program to personalize it:</p>
              
              <pre><code>name = "Your Name"
print("Hello, " + name + "!")
print("Welcome to Python programming!")</code></pre>
              
              <p>This introduces a variable called 'name' that stores your name, and then uses string concatenation (joining strings with +) to create a personalized greeting.</p>
              
              <h3>Next Steps</h3>
              <p>Congratulations! You've written your first Python program. In the next lessons, we'll explore more Python concepts and start building more complex programs.</p>
            `,
          },
          {
            title: "Variables and Data Types",
            completed: true,
            content: `
              <h2>Variables and Data Types</h2>
              <p>In this lesson, we'll explore variables and the different data types available in Python.</p>
              
              <h3>Variables</h3>
              <p>Variables are containers for storing data values. In Python, you create a variable by assigning a value to it:</p>
              
              <pre><code>message = "Hello, Python!"
count = 10
price = 9.99
is_available = True</code></pre>
              
              <p>Python variable naming rules:</p>
              <ul>
                <li>Can contain letters, numbers, and underscores</li>
                <li>Must start with a letter or underscore</li>
                <li>Cannot start with a number</li>
                <li>Case-sensitive (age and Age are different variables)</li>
                <li>Cannot use reserved words (like if, for, while, etc.)</li>
              </ul>
              
              <h3>Basic Data Types</h3>
              
              <h4>Strings</h4>
              <p>Strings are sequences of characters, enclosed in quotes:</p>
              <pre><code>first_name = "John"
last_name = 'Doe'
message = """This is a
multi-line
string."""</code></pre>
              
              <p>String operations:</p>
              <pre><code>full_name = first_name + " " + last_name  # Concatenation
greeting = f"Hello, {first_name}!"       # f-string (formatted string)
length = len(first_name)                 # String length
uppercase = first_name.upper()           # Convert to uppercase</code></pre>
              
              <h4>Numbers</h4>
              <p>Python has several numeric types:</p>
              
              <p>Integers (whole numbers):</p>
              <pre><code>age = 30
count = -5</code></pre>
              
              <p>Floats (decimal numbers):</p>
              <pre><code>price = 19.99
temperature = -2.5</code></pre>
              
              <p>Complex numbers:</p>
              <pre><code>complex_num = 3 + 4j</code></pre>
              
              <p>Numeric operations:</p>
              <pre><code>sum = 10 + 5        # Addition
difference = 10 - 5  # Subtraction
product = 10 * 5     # Multiplication
quotient = 10 / 5    # Division
remainder = 10 % 3   # Modulus
power = 10 ** 2      # Exponentiation</code></pre>
              
              <h4>Booleans</h4>
              <p>Boolean values represent truth values: True or False</p>
              <pre><code>is_active = True
is_completed = False</code></pre>
              
              <p>Boolean operations:</p>
              <pre><code>result1 = True and False  # Logical AND
result2 = True or False   # Logical OR
result3 = not True        # Logical NOT</code></pre>
              
              <h3>Type Conversion</h3>
              <p>You can convert between data types:</p>
              <pre><code>age_str = "30"
age_int = int(age_str)      # Convert string to integer

price = 19.99
price_int = int(price)      # Convert float to integer (truncates decimal)

count = 5
count_float = float(count)  # Convert integer to float

is_active = 1
is_active_bool = bool(is_active)  # Convert to boolean (0 is False, non-zero is True)</code></pre>
              
              <h3>Checking Data Types</h3>
              <p>You can check the type of a variable using the type() function:</p>
              <pre><code>name = "John"
age = 30
price = 19.99
is_active = True

print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
print(type(price))      # <class 'float'>
print(type(is_active))  # <class 'bool'></code></pre>
            `,
          },
        ],
      },
      {
        title: "Python Basics",
        lessons: [
          { title: "Operators and Expressions", completed: false },
          { title: "Input and Output", completed: false },
          { title: "Control Flow: Conditionals", completed: false },
          { title: "Control Flow: Loops", completed: false },
        ],
      },
      {
        title: "Data Structures",
        lessons: [
          { title: "Lists and Tuples", completed: false },
          { title: "Dictionaries and Sets", completed: false },
          { title: "String Manipulation", completed: false },
        ],
      },
    ],
  }

  // Flatten lessons for easy navigation
  const allLessons = course.units.flatMap((unit) => unit.lessons)
  const currentLesson = allLessons[activeLesson]

  // Find the unit that contains the current lesson
  //const currentUnitIndex = course.units.findIndex((unit) =>
  //  unit.lessons.some((lesson) => lesson.title === currentLesson.title),
  //)

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
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Course Structure */}
      <div className="w-64 border-r border-border/50 h-full overflow-auto bg-muted/20">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-display text-lg truncate">{course.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={course.progress} className="h-1.5" />
            <span className="text-xs text-muted-foreground">{course.progress}%</span>
          </div>
        </div>

        <div className="p-4">
          {course.units.map((unit, unitIndex) => (
            <div key={unitIndex} className="mb-4">
              <h3 className="font-medium text-sm mb-2">{unit.title}</h3>
              <ul className="space-y-1 pl-4">
                {unit.lessons.map((lesson, lessonIndex) => {
                  // Calculate the global lesson index
                  const globalLessonIndex =
                    course.units.slice(0, unitIndex).reduce((acc, u) => acc + u.lessons.length, 0) + lessonIndex

                  return (
                    <li key={lessonIndex}>
                      <button
                        className={`text-xs flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md transition-colors ${
                          activeLesson === globalLessonIndex ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        }`}
                        onClick={() => setActiveLesson(globalLessonIndex)}
                      >
                        <div
                          className={`h-4 w-4 rounded-full flex items-center justify-center ${
                            lesson.completed
                              ? "bg-primary text-primary-foreground"
                              : "border border-muted-foreground/50"
                          }`}
                        >
                          {lesson.completed && <CheckIcon className="h-2.5 w-2.5" />}
                        </div>
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {unitIndex < course.units.length - 1 && (
                <div className="my-4 pl-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-4 w-4 rounded-full bg-secondary/20 flex items-center justify-center">
                    <FileText className="h-2.5 w-2.5 text-secondary" />
                  </div>
                  <span>Checkpoint Quiz</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Lesson Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto py-8 px-6">
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href="/dashboard/courses" className="hover:text-foreground transition-colors">
                Courses
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="truncate">{course.title}</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display">{currentLesson.title}</h1>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: currentLesson.content || "<p>Content not available</p>" }}
              />

              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <h3 className="font-medium mb-2">Quick Check</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">What is the primary purpose of variables in Python?</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q1a" name="q1" className="h-4 w-4 text-primary" />
                        <label htmlFor="q1a" className="text-sm">
                          To make the code more colorful
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q1b" name="q1" className="h-4 w-4 text-primary" />
                        <label htmlFor="q1b" className="text-sm">
                          To store data values
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q1c" name="q1" className="h-4 w-4 text-primary" />
                        <label htmlFor="q1c" className="text-sm">
                          To create functions
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">Which of the following is a valid variable name in Python?</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q2a" name="q2" className="h-4 w-4 text-primary" />
                        <label htmlFor="q2a" className="text-sm">
                          2variable
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q2b" name="q2" className="h-4 w-4 text-primary" />
                        <label htmlFor="q2b" className="text-sm">
                          my-variable
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q2c" name="q2" className="h-4 w-4 text-primary" />
                        <label htmlFor="q2c" className="text-sm">
                          my_variable
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Check Answers</Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" className="gap-2" disabled={activeLesson === 0}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous Lesson
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Add to Flashcards
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Add to Quiz
                  </Button>
                </div>
                <Button className="gap-2 glow-button" disabled={activeLesson === allLessons.length - 1}>
                  Next Lesson
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Course Tools */}
      <div className="w-64 border-l border-border/50 h-full overflow-auto bg-muted/20">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-medium text-sm">Course Progress</h3>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Completed</span>
              <span>
                {course.completedLessons}/{course.totalLessons} lessons
              </span>
            </div>
            <Progress value={(course.completedLessons / course.totalLessons) * 100} className="h-1.5" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Estimated time</span>
              <span>{course.estimatedTime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Last accessed</span>
              <span>{course.lastAccessed}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="flashcards">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            <TabsContent value="flashcards" className="mt-4 space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Add important concepts to your flashcard set for this course.</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create Flashcard Set
              </Button>

              {/* New Cumulative Flashcards Button */}
              <Link href={`/flashcards/course/${params.id}`}>
                <Button variant="secondary" className="w-full gap-2 mt-2">
                  <BookOpen className="h-4 w-4" />
                  Cumulative Flashcards
                </Button>
              </Link>
            </TabsContent>
            <TabsContent value="quiz" className="mt-4 space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Add questions to your cumulative quiz for this course.</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Play className="h-4 w-4" />
                Start Practice Quiz
              </Button>

              {/* New Cumulative Quiz Button */}
              <Link href={`/quiz/course/${params.id}`}>
                <Button variant="secondary" className="w-full gap-2 mt-2">
                  <FileText className="h-4 w-4" />
                  Cumulative Quiz
                </Button>
              </Link>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Related Resources</h3>
            <div className="space-y-2">
              {[
                { title: "Python Documentation", icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
                { title: "Practice Exercises", icon: <BookOpen className="h-4 w-4 text-muted-foreground" /> },
                { title: "Video Tutorial", icon: <Play className="h-4 w-4 text-muted-foreground" /> },
              ].map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm p-2 hover:bg-muted rounded-md cursor-pointer"
                >
                  {resource.icon}
                  <span>{resource.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
