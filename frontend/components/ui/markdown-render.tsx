"use client"

import React, { useState, useEffect, ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import { YouTubeEmbed } from "./youtube-embed"
import { Copy } from "lucide-react"
import { Element } from "hast"

import "highlight.js/styles/github-dark.css"
import "katex/dist/katex.min.css"

const mathStyles = `
  .math-content .math-display, 
  .math-content .math-inline {
    display: block;
    overflow-x: auto;
    max-width: 100%;
  }
  .math-text {
    font-style: italic;
  }
  .katex {
    font-size: 1.1em;
  }
  .katex-display {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.5em 0;
  }
`

// Inspect HAST node tree to see if it contains **any** block-level element that
// would be invalid as a child of <p>.  We primarily look for <pre />, but also
// guard against <div>, <table>, lists, etc.  This prevents React from
// rendering <p><pre/></p> or <p><div/></p> which violates the HTML spec and
// triggers hydration warnings.
const containsBlockElement = (node: unknown): boolean => {
  if (!node || typeof node !== "object" || !("type" in node)) return false

  const n = node as Element
  // Elements that are **not** allowed inside <p>
  const disallowed = new Set([
    "pre",
    "div",
    "table",
    "ul",
    "ol",
    "dl",
    "blockquote",
  ])

  if (disallowed.has(n.tagName)) return true
  if (Array.isArray(n.children)) {
    return n.children.some((child) => containsBlockElement(child))
  }
  return false
}

interface CodeProps {
  inline?: boolean
  className?: string
  children?: ReactNode
}

const CodeBlock: React.FC<CodeProps> = ({ inline, className, children }) => {
  const code = String(children ?? "").trim()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (inline) {
    return (
      <code className="bg-zinc-800 text-white rounded px-1.5 py-[2px] text-[0.925em] font-mono">
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-xs text-white border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Copy className="h-3 w-3" />
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre
        className={`rounded-md overflow-auto bg-zinc-900 text-white border border-zinc-700 px-4 py-3 shadow-sm ${className || ""}`}
        style={{ fontSize: "0.925rem", lineHeight: "1.5" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

interface MarkdownRendererProps {
  content: string
  videos?: string[]
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, videos = [] }) => {
  
  useEffect(() => {
    if (!document.getElementById('math-renderer-styles')) {
      const styleEl = document.createElement('style')
      styleEl.id = 'math-renderer-styles'
      styleEl.innerHTML = mathStyles
      document.head.appendChild(styleEl)

      return () => {
        const existing = document.getElementById('math-renderer-styles')
        if (existing) document.head.removeChild(existing)
      }
    }
  }, [])

  return (
    <>
      <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-400 prose-img:rounded-lg prose-strong:font-bold prose-strong:text-white prose-em:italic prose-p:whitespace-pre-wrap math-content">
        <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, [rehypeKatex, { throwOnError: false }]]}
        components={{
          code: CodeBlock,
          p: ({ node, children, ...props }) => {
            if (containsBlockElement(node)) {
              return <>{children}</>; // Don't wrap in <p> if inside a <pre>
            }
          
            // NEW: Check if paragraph ONLY contains a code element
            if (
              node?.children?.length === 1 &&
              (node.children[0] as Element)?.tagName === "code"
            ) {
              return <>{children}</>; // Directly render code without <p> wrapper
            }
          
            // Otherwise normal paragraph
            return (
              <p className="mb-4 whitespace-pre-wrap" {...props}>
                {children}
              </p>
            );
          },
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">{children}</blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse border border-zinc-700">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-zinc-700 bg-zinc-800 px-4 py-2">{children}</th>,
          td: ({ children }) => <td className="border border-zinc-700 px-4 py-2">{children}</td>,
          br: () => <br className="my-2" />,
        } as Components}
      >
        {content}
      </ReactMarkdown>
      </div>
      {videos && videos.length > 0 && <YouTubeEmbed videos={videos} />}
    </>
  )
}