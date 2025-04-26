"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, FileText, Lightbulb, List, Zap } from "lucide-react"
import { useParams } from "next/navigation"
import { MarkdownRenderer } from "@/components/ui/markdown-render"
import TurndownService from "turndown"

export default function QuickLearnPage() {
  const params = useParams()
  const { id } = params
  const [currentSection, setCurrentSection] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  // Mock quick learn session data
  const session = {
    id: id,
    title: "JavaScript Promises and Async Programming",
    description:
      "A focused session on understanding JavaScript Promises, async/await syntax, and asynchronous programming patterns.",
    duration: "25 min",
    progress: 45,
    sections: [
      {
        id: 1,
        title: "Introduction to Promises",
        type: "content",
        duration: "5 min",
        status: "in progress",
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
        id: 2,
        title: "Promise Chaining",
        type: "content",
        duration: "5 min",
        status: "not started",
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
        id: 3,
        title: "Promise.all and Promise.race",
        type: "content",
        duration: "5 min",
        status: "not started",
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
        id: 4,
        title: "Async/Await Syntax",
        type: "content",
        duration: "5 min",
        status: "not started",
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
        id: 5,
        title: "Real-world Patterns and Best Practices",
        type: "content",
        duration: "5 min",
        status: "not started",
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
    resources: [
      {
        title: "MDN Promise Documentation",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
        type: "documentation",
      },
      {
        title: "JavaScript.info: Promises, async/await",
        url: "https://javascript.info/async",
        type: "guide",
      },
      {
        title: "Async JavaScript: From Callbacks to Promises to Async/Await",
        url: "https://tylermcginnis.com/async-javascript-from-callbacks-to-promises-to-async-await/",
        type: "article",
      },
    ],
    quiz: [
      {
        question: "What is the initial state of a Promise?",
        options: ["Fulfilled", "Rejected", "Pending", "Settled"],
        correctAnswer: 2,
      },
      {
        question: "Which method is used to handle errors in a Promise chain?",
        options: [".error()", ".fail()", ".catch()", ".reject()"],
        correctAnswer: 2,
      },
      {
        question: "What does Promise.all() do?",
        options: [
          "Resolves when any of the promises resolves",
          "Resolves when all promises resolve",
          "Rejects all promises",
          "Creates a new promise",
        ],
        correctAnswer: 1,
      },
      {
        question: "Which keyword must be used with 'await'?",
        options: ["function", "async", "static", "promise"],
        correctAnswer: 1,
      },
    ],
  }

  // Current section data
  const currentSectionData = session.sections[currentSection]

  // Convert HTML to Markdown for the renderer
  const turndownService = new TurndownService({
    headingStyle: "atx", // Use # for headers
    codeBlockStyle: "fenced", // Use \`\`\` for code blocks
    bulletListMarker: "-", // Use - for lists
  })

  // Fix code blocks wrapped in <pre><code>
  turndownService.addRule("fencedCodeBlock", {
    filter: (node) =>
      node.nodeName === "PRE" && node.firstChild !== null && (node.firstChild as HTMLElement).nodeName === "CODE", // TS-safe check
    replacement: (content, node) => {
      const code = node.textContent || ""
      return `\n\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`
    },
  })

  const cleanedSectionContent = currentSectionData ? turndownService.turndown(currentSectionData.content) : ""

  // Handle quiz answers
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  const handleAnswerSelection = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const handleQuizSubmit = () => {
    // Calculate score
    let correctCount = 0
    session.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / session.quiz.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    // If score is passing (e.g., 70% or higher), mark section as completed
    if (score >= 70) {
      setIsCompleted(true)
    }
  }

  const markComplete = () => {
    setIsCompleted(true)
    // In a real app, you would save this completion status to your backend
  }

  // Handle next/previous section navigation
  const handleNextSection = () => {
    if (currentSection < session.sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setActiveTab("content") // Reset to content tab when changing sections
    }
  }

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setActiveTab("content") // Reset to content tab when changing sections
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col">
        {/* Module header */}
        <div className="bg-muted/20 border-b border-border/40 py-4">
          <div className="px-4 lg:px-8 py-6 w-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/quick-learn" className="hover:text-foreground transition-colors">
                  Quick Learn
                </Link>
                <span>/</span>
                <span>{session.title}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-display">{currentSectionData.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary" />
                  <span className="text-secondary">Quick Learn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{session.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for the unit */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${((currentSection + 1) / session.sections.length) * 100}%` }}
          ></div>
        </div>

        {/* Main content */}
        <div className="px-4 lg:px-8 py-6 w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar with section navigation */}
            <div className="hidden lg:block lg:w-80 shrink-0">
              <div className="sticky top-24 space-y-4">
                <h3 className="font-medium">Session Sections</h3>
                <ul className="space-y-2">
                  {session.sections.map((section, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setCurrentSection(index)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm w-full text-left ${
                          currentSection === index ? "bg-secondary/10 text-secondary font-medium" : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="h-5 aspect-square rounded-full bg-muted/70 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="whitespace-normal break-words leading-snug">{section.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0 mr-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="ml-8 w-full max-w-lg px-1 py-5 bg-card border border-border rounded-full mb-6 z-10 relative shadow-sm flex gap-1">
                  <TabsTrigger
                    value="content"
                    className="flex-1 px-10 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      [data-state='active']:text-white
                      [data-state='active']:bg-secondary/60
                      [data-state='active']:shadow
                      [data-state='active']:glow-text-pink"
                  >
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="quiz"
                    className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      [data-state='active']:text-white
                      [data-state='active']:bg-secondary/60
                      [data-state='active']:shadow
                      [data-state='active']:glow-text-pink"
                  >
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="flex-1 px-7 py-4 text-base font-medium rounded-full transition-all
                      text-muted-foreground hover:text-foreground
                      [data-state='active']:text-white
                      [data-state='active']:bg-secondary/60
                      [data-state='active']:shadow
                      [data-state='active']:glow-text-pink"
                  >
                    Resources
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="animate-in fade-in-50 duration-300">
                  <div className="w-full ml-8">
                    <div className="prose prose-invert max-w-none mb-8">
                      <MarkdownRenderer content={cleanedSectionContent} />
                    </div>

                    <div className="flex justify-between pt-4 border-t border-border/40">
                      {currentSection > 0 ? (
                        <Button variant="outline" onClick={handlePreviousSection}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous Section
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous Section
                        </Button>
                      )}

                      {isCompleted ? (
                        <Button variant="outline" className="gap-2 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </Button>
                      ) : (
                        <Button
                          onClick={markComplete}
                          className="gap-2 glow-button-pink bg-secondary hover:bg-secondary/90"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}

                      {currentSection < session.sections.length - 1 ? (
                        <Button
                          className="glow-button-pink bg-secondary hover:bg-secondary/90"
                          onClick={handleNextSection}
                        >
                          Next Section
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="glow-button-pink bg-secondary hover:bg-secondary/90">
                          Complete Session
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="animate-in fade-in-50 duration-300">
                  <div className="w-full pl-2 lg:pl-4 space-y-8">
                    <div className="bg-muted/20 p-6 rounded-lg border border-border/40">
                      <h2 className="text-xl font-medium mb-4">Knowledge Check</h2>
                      <p className="mb-6 text-muted-foreground">
                        Test your understanding of the section content with these questions.
                      </p>

                      <div className="space-y-8">
                        {session.quiz.map((question, qIndex) => (
                          <div key={qIndex} className="space-y-4">
                            <h3 className="font-medium">
                              {qIndex + 1}. {question.question}
                            </h3>
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <div
                                  key={oIndex}
                                  className={`
                                  flex items-center p-3 rounded-md border border-border/40
                                  ${!quizSubmitted && quizAnswers[qIndex] === oIndex ? "bg-secondary/10 border-secondary/50" : ""}
                                  ${quizAnswers[qIndex] === oIndex ? "bg-secondary/10 border-secondary/50" : ""}
                                  ${
                                    quizSubmitted && oIndex === question.correctAnswer
                                      ? "bg-green-500/10 border-green-500/50"
                                      : ""
                                  }
                                  ${
                                    quizSubmitted && quizAnswers[qIndex] === oIndex && oIndex !== question.correctAnswer
                                      ? "bg-red-500/10 border-red-500/50"
                                      : ""
                                  }
                                  ${quizSubmitted ? "pointer-events-none" : "cursor-pointer hover:bg-muted/30"}
                                `}
                                  onClick={() => !quizSubmitted && handleAnswerSelection(qIndex, oIndex)}
                                >
                                  <div
                                    className={`
                                    h-5 w-5 rounded-full mr-3 flex items-center justify-center border
                                    ${
                                      !quizSubmitted && quizAnswers[qIndex] === oIndex
                                        ? "border-secondary bg-secondary/20"
                                        : "border-muted-foreground"
                                    }
                                    ${
                                      quizSubmitted && oIndex === question.correctAnswer
                                        ? "border-green-500 bg-green-500/20"
                                        : ""
                                    }
                                    ${
                                      quizSubmitted &&
                                      quizAnswers[qIndex] === oIndex &&
                                      oIndex !== question.correctAnswer
                                        ? "border-red-500 bg-red-500/20"
                                        : ""
                                    }
                                  `}
                                  >
                                    {(!quizSubmitted && quizAnswers[qIndex] === oIndex) ||
                                    (quizSubmitted && oIndex === question.correctAnswer) ? (
                                      <div
                                        className={`h-2 w-2 rounded-full 
                                        ${quizSubmitted ? "bg-green-500" : "bg-secondary"}`}
                                      />
                                    ) : null}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {quizSubmitted ? (
                        <div className="mt-8 p-4 rounded-md bg-muted/30 text-center">
                          <h3 className="text-xl font-medium mb-2">Your Score: {quizScore}%</h3>
                          <p className="mb-4 text-muted-foreground">
                            {quizScore >= 70
                              ? "Great job! You've passed the quiz."
                              : "Review the material and try again to improve your score."}
                          </p>
                          <Button
                            onClick={() => {
                              setQuizAnswers({})
                              setQuizSubmitted(false)
                              setQuizScore(0)
                            }}
                            className="glow-button-pink bg-secondary hover:bg-secondary/90"
                          >
                            Retry Quiz
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="mt-8 w-full glow-button-pink bg-secondary hover:bg-secondary/90"
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < session.quiz.length}
                        >
                          Submit Answers
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="animate-in fade-in-50 duration-300">
                  <div className="w-full pl-2 lg:pl-4">
                    <h2 className="text-xl font-medium mb-6">Additional Resources</h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {session.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <Card className="h-full border-border/50 hover:border-secondary/60 transition-all group-hover:shadow-md card-hover">
                            <CardContent className="p-4 flex flex-col h-full">
                              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                                {resource.type === "documentation" ? (
                                  <FileText className="h-5 w-5 text-secondary" />
                                ) : resource.type === "guide" ? (
                                  <BookOpen className="h-5 w-5 text-secondary" />
                                ) : (
                                  <Lightbulb className="h-5 w-5 text-secondary" />
                                )}
                              </div>
                              <h3 className="font-medium mb-2 group-hover:text-secondary transition-colors">
                                {resource.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-2">
                                External Resource - {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                              </p>
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Mobile navigation footer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 p-4">
          <Button variant="outline" size="sm" className="w-full flex items-center justify-between" asChild>
            <Link href="/quick-learn">
              <List className="h-4 w-4" />
              <span>View All Sections</span>
              <span>
                {currentSection + 1}/{session.sections.length}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}