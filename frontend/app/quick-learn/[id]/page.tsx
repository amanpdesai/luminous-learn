"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ChevronLeft, ChevronRight, FileText, Lightbulb, MoreHorizontal, Play, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function QuickLearnSessionPage({ params }: { params: { id: string } }) {
  const [activeSection, setActiveSection] = useState(0);
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

  // Mock quick learn session data
  const session = {
    id: params.id,
    title: "JavaScript Promises and Async Programming",
    description:
      "A focused session on understanding JavaScript Promises, async/await syntax, and asynchronous programming patterns.",
    progress: 45,
    totalSections: 5,
    completedSections: 2,
    estimatedTime: "25 minutes",
    lastAccessed: "1 day ago",
    sections: [
      {
        title: "Introduction to Promises",
        completed: true,
        content: `
          <h2>Introduction to Promises</h2>
          <p>Promises are objects that represent the eventual completion (or failure) of an asynchronous operation and its resulting value.</p>
          
          <h3>Why Promises?</h3>
          <p>Before Promises, asynchronous operations in JavaScript were primarily handled with callbacks, which could lead to:</p>
          <ul>
            <li>Callback hell (deeply nested callbacks)</li>
            <li>Inversion of control (handing control flow to another function)</li>
            <li>Error handling challenges</li>
          </ul>
          
          <h3>Promise States</h3>
          <p>A Promise can be in one of three states:</p>
          <ul>
            <li><strong>Pending</strong>: Initial state, neither fulfilled nor rejected</li>
            <li><strong>Fulfilled</strong>: The operation completed successfully</li>
            <li><strong>Rejected</strong>: The operation failed</li>
          </ul>
          
          <h3>Creating a Promise</h3>
          <p>You can create a new Promise using the Promise constructor:</p>
          <pre><code>const myPromise = new Promise((resolve, reject) => {
  // Asynchronous operation
  if (/* operation successful */) {
    resolve(value); // Fulfills the promise with a value
  } else {
    reject(error); // Rejects the promise with an error
  }
});</code></pre>
          
          <h3>Basic Promise Usage</h3>
          <p>Here's a simple example of using a Promise:</p>
          <pre><code>function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = { id: 1, name: 'User' };
      resolve(data);
      // If there was an error: reject(new Error('Failed to fetch data'));
    }, 1000);
  });
}

fetchData()
  .then(data => {
    console.log('Data received:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });</code></pre>
        `,
      },
      {
        title: "Promise Chaining",
        completed: true,
        content: `
          <h2>Promise Chaining</h2>
          <p>One of the most powerful features of Promises is the ability to chain them together for sequential asynchronous operations.</p>
          
          <h3>The Basics of Chaining</h3>
          <p>The <code>.then()</code> method returns a new Promise, allowing you to chain multiple asynchronous operations:</p>
          <pre><code>fetchUser(userId)
  .then(user => fetchUserPosts(user.id))
  .then(posts => {
    console.log('User posts:', posts);
    return posts;
  })
  .then(posts => fetchComments(posts[0].id))
  .then(comments => {
    console.log('Comments:', comments);
  })
  .catch(error => {
    console.error('Error in the chain:', error);
  });</code></pre>
          
          <h3>Returning Values in Chains</h3>
          <p>Each <code>.then()</code> handler can return:</p>
          <ul>
            <li>A value, which is passed to the next <code>.then()</code></li>
            <li>A Promise, which is resolved before the next <code>.then()</code> is called</li>
            <li>A thrown error, which is caught by the next <code>.catch()</code></li>
          </ul>
          
          <h3>Error Handling in Chains</h3>
          <p>Errors propagate down the chain until they encounter a <code>.catch()</code> handler:</p>
          <pre><code>fetchData()
  .then(data => {
    // This will throw an error
    return JSON.parse(data); // Assuming data is not valid JSON
  })
  .then(parsedData => {
    // This won't execute if the previous step fails
    console.log('Parsed data:', parsedData);
  })
  .catch(error => {
    // This will catch the error from JSON.parse
    console.error('Error in the chain:', error);
  });</code></pre>
          
          <h3>Chaining After Catch</h3>
          <p>You can continue the chain after a <code>.catch()</code> to recover from errors:</p>
          <pre><code>fetchData()
  .then(data => {
    return processData(data);
  })
  .catch(error => {
    console.error('Error processing data:', error);
    return defaultData; // Provide fallback data
  })
  .then(result => {
    // This will execute with either the processed data
    // or the fallback data after an error
    console.log('Final result:', result);
  });</code></pre>
        `,
      },
      {
        title: "Promise.all and Promise.race",
        completed: false,
        content: `
          <h2>Promise.all and Promise.race</h2>
          <p>JavaScript provides static methods to work with multiple promises simultaneously.</p>
          
          <h3>Promise.all</h3>
          <p><code>Promise.all()</code> takes an array of promises and returns a new promise that fulfills when all input promises have fulfilled, or rejects if any input promise rejects.</p>
          
          <h4>Use Cases for Promise.all</h4>
          <ul>
            <li>Fetching data from multiple sources in parallel</li>
            <li>Waiting for multiple asynchronous operations to complete</li>
            <li>Aggregating results from multiple promises</li>
          </ul>
          
          <h4>Example</h4>
          <pre><code>const fetchUserPromise = fetchUser(userId);
const fetchPostsPromise = fetchPosts(userId);
const fetchCommentsPromise = fetchComments(userId);

Promise.all([fetchUserPromise, fetchPostsPromise, fetchCommentsPromise])
  .then(([user, posts, comments]) => {
    console.log('User:', user);
    console.log('Posts:', posts);
    console.log('Comments:', comments);
    // Now we have all the data we need
    renderUserProfile(user, posts, comments);
  })
  .catch(error => {
    console.error('One of the requests failed:', error);
  });</code></pre>
          
          <h3>Promise.race</h3>
          <p><code>Promise.race()</code> takes an array of promises and returns a new promise that fulfills or rejects as soon as one of the input promises fulfills or rejects.</p>
          
          <h4>Use Cases for Promise.race</h4>
          <ul>
            <li>Implementing timeouts for asynchronous operations</li>
            <li>Taking the result of the fastest operation</li>
            <li>Fallback mechanisms when one source might be faster than another</li>
          </ul>
          
          <h4>Example with Timeout</h4>
          <pre><code>function fetchWithTimeout(url, timeout) {
  const fetchPromise = fetch(url);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeout);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

fetchWithTimeout('https://api.example.com/data', 5000)
  .then(response => response.json())
  .then(data => {
    console.log('Data received:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });</code></pre>
          
          <h3>Other Promise Combinators</h3>
          <p>ES2020 introduced two additional methods:</p>
          <ul>
            <li><code>Promise.allSettled()</code>: Returns a promise that resolves after all input promises have settled (fulfilled or rejected)</li>
            <li><code>Promise.any()</code>: Returns a promise that resolves as soon as one of the input promises fulfills</li>
          </ul>
        `,
      },
      {
        title: "Async/Await Syntax",
        completed: false,
        content: `
          <h2>Async/Await Syntax</h2>
          <p>Async/await is syntactic sugar built on top of Promises, making asynchronous code look and behave more like synchronous code.</p>
          
          <h3>The async Keyword</h3>
          <p>The <code>async</code> keyword is used to declare an asynchronous function:</p>
          <pre><code>async function fetchData() {
  // Function body
}</code></pre>
          
          <p>An async function always returns a Promise, even if you return a non-Promise value:</p>
          <pre><code>async function greet() {
  return 'Hello'; // Automatically wrapped in a Promise
}

greet().then(message => {
  console.log(message); // 'Hello'
});</code></pre>
          
          <h3>The await Keyword</h3>
          <p>The <code>await</code> keyword can only be used inside an async function. It pauses the execution of the function until the Promise is resolved:</p>
          <pre><code>async function fetchUserData() {
  const response = await fetch('https://api.example.com/user');
  const userData = await response.json();
  return userData;
}</code></pre>
          
          <h3>Error Handling with try/catch</h3>
          <p>With async/await, you can use traditional try/catch blocks for error handling:</p>
          <pre><code>async function fetchUserData() {
  try {
    const response = await fetch('https://api.example.com/user');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Handle the error or rethrow it
    throw error;
  }
}</code></pre>
          
          <h3>Converting Promise Chains to Async/Await</h3>
          <p>Here's how to convert a Promise chain to async/await:</p>
          
          <h4>Promise Chain</h4>
          <pre><code>function processData() {
  return fetchUser(userId)
    .then(user => {
      return fetchPosts(user.id);
    })
    .then(posts => {
      return fetchComments(posts[0].id);
    })
    .then(comments => {
      return {
        user: user,
        posts: posts,
        comments: comments
      };
    })
    .catch(error => {
      console.error('Error:', error);
    });
}</code></pre>
          
          <h4>Async/Await Version</h4>
          <pre><code>async function processData() {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    
    return {
      user,
      posts,
      comments
    };
  } catch (error) {
    console.error('Error:', error);
  }
}</code></pre>
          
          <h3>Parallel Execution with async/await</h3>
          <p>To run promises in parallel with async/await, you can use Promise.all:</p>
          <pre><code>async function fetchAllData() {
  try {
    const [user, settings, notifications] = await Promise.all([
      fetchUser(),
      fetchSettings(),
      fetchNotifications()
    ]);
    
    return { user, settings, notifications };
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}</code></pre>
        `,
      },
      {
        title: "Real-world Patterns and Best Practices",
        completed: false,
        content: `
          <h2>Real-world Patterns and Best Practices</h2>
          <p>Let's explore some common patterns and best practices for working with Promises and async/await in real-world applications.</p>
          
          <h3>Sequential vs Parallel Execution</h3>
          
          <h4>Sequential Execution (When Order Matters)</h4>
          <pre><code>async function processInSequence() {
  const result1 = await step1();
  const result2 = await step2(result1);
  const result3 = await step3(result2);
  return result3;
}</code></pre>
          
          <h4>Parallel Execution (When Order Doesn't Matter)</h4>
          <pre><code>async function processInParallel() {
  const [result1, result2, result3] = await Promise.all([
    step1(),
    step2(),
    step3()
  ]);
  return combineResults(result1, result2, result3);
}</code></pre>
          
          <h3>Error Handling Strategies</h3>
          
          <h4>Global Error Handler</h4>
          <pre><code>async function fetchData() {
  try {
    // Multiple await statements
    const users = await fetchUsers();
    const posts = await fetchPosts();
    return { users, posts };
  } catch (error) {
    // One error handler for all await statements
    handleError(error);
    return defaultData;
  }
}</code></pre>
          
          <h4>Specific Error Handlers</h4>
          <pre><code>async function fetchData() {
  let users = [];
  let posts = [];
  
  try {
    users = await fetchUsers();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    users = defaultUsers;
  }
  
  try {
    posts = await fetchPosts();
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    posts = defaultPosts;
  }
  
  return { users, posts };
}</code></pre>
          
          <h3>Retrying Failed Requests</h3>
          <pre><code>async function fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}</code></pre>
          
          <h3>Cancelling Requests</h3>
          <p>Using the AbortController API:</p>
          <pre><code>async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}</code></pre>
          
          <h3>Handling Multiple Requests with Dependencies</h3>
          <pre><code>async function loadUserDashboard(userId) {
  // First, get the user
  const user = await fetchUser(userId);
  
  // Then fetch multiple resources in parallel
  const [
    posts,
    followers,
    recommendations
  ] = await Promise.all([
    fetchPosts(user.id),
    fetchFollowers(user.id),
    fetchRecommendations(user.preferences)
  ]);
  
  return {
    user,
    posts,
    followers,
    recommendations
  };
}</code></pre>
          
          <h3>Conclusion</h3>
          <p>Promises and async/await provide powerful tools for handling asynchronous operations in JavaScript. By understanding these patterns and best practices, you can write more maintainable, efficient, and robust asynchronous code.</p>
        `,
      },
    ],
  }

  // Current section
  const currentSection = session.sections[activeSection]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Session Structure */}
      <div className="w-64 border-r border-border/50 h-full overflow-auto bg-muted/20">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-display text-lg truncate">{session.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={session.progress} className="h-1.5" />
            <span className="text-xs text-muted-foreground">{session.progress}%</span>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Session Content</h3>
            <ul className="space-y-1 pl-4">
              {session.sections.map((section, sectionIndex) => (
                <li key={sectionIndex}>
                  <button
                    className={`text-xs flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md transition-colors ${
                      activeSection === sectionIndex ? "bg-secondary/10 text-secondary" : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveSection(sectionIndex)}
                  >
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        section.completed
                          ? "bg-secondary text-secondary-foreground"
                          : "border border-muted-foreground/50"
                      }`}
                    >
                      {section.completed && <CheckIcon className="h-2.5 w-2.5" />}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Session Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto py-8 px-6">
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <ChevronRightIcon className="h-4 w-4 mx-1" />
              <Link href="/quick-learn" className="hover:text-foreground transition-colors">
                Quick Learn
              </Link>
              <ChevronRightIcon className="h-4 w-4 mx-1" />
              <span className="truncate">{session.title}</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display">{currentSection.title}</h1>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: currentSection.content || "<p>Content not available</p>" }}
              />

              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <h3 className="font-medium mb-2">Quick Check</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">What is the primary purpose of Promises in JavaScript?</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q1a" name="q1" className="h-4 w-4 text-secondary" />
                        <label htmlFor="q1a" className="text-sm">
                          To make code run faster
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q1b" name="q1" className="h-4 w-4 text-secondary" />
                        <label htmlFor="q1b" className="text-sm">
                          To handle asynchronous operations
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" id="q1c" name="q1" className="h-4 w-4 text-secondary" />
                        <label htmlFor="q1c" className="text-sm">
                          To create global variables
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Check Answer</Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" className="gap-2" disabled={activeSection === 0}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous Section
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
                <Button className="gap-2 glow-button" disabled={activeSection === session.sections.length - 1}>
                  Next Section
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Session Tools */}
      <div className="w-64 border-l border-border/50 h-full overflow-auto bg-muted/20">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-medium text-sm">Session Progress</h3>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Completed</span>
              <span>
                {session.completedSections}/{session.totalSections} sections
              </span>
            </div>
            <Progress value={(session.completedSections / session.totalSections) * 100} className="h-1.5" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Estimated time</span>
              <span>{session.estimatedTime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Last accessed</span>
              <span>{session.lastAccessed}</span>
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
                <p>Add important concepts to your flashcard set for this session.</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create Flashcard Set
              </Button>
            </TabsContent>
            <TabsContent value="quiz" className="mt-4 space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Add questions to your cumulative quiz for this session.</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Play className="h-4 w-4" />
                Start Practice Quiz
              </Button>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Related Resources</h3>
            <div className="space-y-2">
              {[
                { title: "MDN Promise Documentation", icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
                { title: "Async JS Practice Exercises", icon: <BookOpen className="h-4 w-4 text-muted-foreground" /> },
                { title: "Video: Promises Explained", icon: <Play className="h-4 w-4 text-muted-foreground" /> },
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

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
