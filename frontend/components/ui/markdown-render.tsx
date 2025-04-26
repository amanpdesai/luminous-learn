"use client"

import React, { useState, ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { Copy } from "lucide-react"
import "highlight.js/styles/github-dark.css"

function cleanMarkdown(input: string): string {
  return input
    .replace(/<p>\s*(<pre[\s\S]*?>[\s\S]*?<\/pre>)\s*<\/p>/gi, '$1')
    .replace(/<p>\s*(<code[\s\S]*?>[\s\S]*?<\/code>)\s*<\/p>/gi, '$1')
    .replace(/<\/code>\s*<\/p>\s*<p>\s*<code>/gi, '\n\n')
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
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const cleaned = cleanMarkdown(content)

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }: { children?: ReactNode }) => (
            <div className="my-4">{children}</div>
          ),
          code: CodeBlock,
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  )
}