"use client"

import React, { useState, ReactNode, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import { Copy } from "lucide-react"
import "highlight.js/styles/github-dark.css"
import "katex/dist/katex.min.css"

// Add additional CSS for math rendering
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
`;

/**
 * Process content that contains HTML tags directly
 */
function processContentWithHtml(input: string): string {
  if (!input) return "";
  
  // Detect math expressions patterns in the content
  const hasMathExpressions = /\$(?!\$).*?\$|\$\$.*?\$\$|\\\(.*?\\\)|\\\[.*?\\\]/.test(input);
  
  // Process the input with appropriate transformations
  let processed = input
    // First, handle HTML entities that need decoding
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    
    // Fix common issues with HTML tags seen in the screenshot
    .replace(/<em><\/em>/g, '')
    .replace(/<\/em><em>/g, '')
    .replace(/<em>\s*<\/em>/g, '')
    
    // Clean up other empty tags
    .replace(/<([a-z][^>]*)>\s*<\/\1>/gi, '')
    
    // Make sure all <br> tags are properly closed
    .replace(/<br\s*>/gi, '<br/>')
    
    // Fix specific patterns seen in the screenshot with math expressions
    .replace(/\b(in|to|times|mathbb|seq|sqrt|sum|leq|infty|ell)\b(?![\w\(])/g, '<span class="math-text">$1</span>')
    
    // Special case for handling math expressions inside text
    .replace(/([a-zA-Z]),([a-zA-Z])/g, '$1, $2') // Add space after commas
    
    // Process LaTeX formatting consistently
    .replace(/\\\[(.*?)\\\]/g, '$$$$1$$')
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')
    
    // Fix common math notation issues
    .replace(/\$\s*\$/g, '') // Empty math expressions
    .replace(/\$\$(\s*\$\$)+/g, '$$') // Multiple adjacent math delimiters
    
    // Normalize math delimiters to ensure they have spaces around them when needed
    .replace(/([^\s])\$\$/g, '$1 $$')
    .replace(/\$\$([^\s])/g, '$$ $1')
    
    // Ensure proper spacing for inline math
    .replace(/([^\s])\$/g, '$1 $')
    .replace(/\$([^\s])/g, '$ $1')
    
    // Fix special case for complex numbers rendering
    .replace(/\\begin\{cases}/g, '\\begin{cases} ')
    .replace(/\\end\{cases}/g, ' \\end{cases}')
    
    // Convert proper markdown headers to HTML
    .replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>')
    
    // Ensure new lines have proper HTML structure (for readability)
    .replace(/\n\n+/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  // Special handling for math expressions to ensure KaTeX can render them
  if (hasMathExpressions) {
    // Create a safer environment for KaTeX by wrapping math expressions
    processed = processed
      // Wrap display math expressions to protect them
      .replace(/\$\$(.*?)\$\$/g, '<div class="math-display">$$$$1$$</div>')
      // Wrap inline math expressions to protect them
      .replace(/\$([^\$\n]+?)\$/g, '<span class="math-inline">$$$1$$</span>');
  }
  
  return processed;
}

/**
 * Process markdown content that doesn't contain HTML
 */
function cleanMarkdown(input: string): string {
  if (!input) return ""
  
  // First, check if we have math expressions
  const hasMathExpressions = /\$(?!\$).*?\$|\$\$.*?\$\$|\\\(.*?\\\)|\\\[.*?\\\]/.test(input);
  
  let processed = input
    // Handle HTML entities (decode them for processing)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    
    // Ensure LaTeX delimiters have proper spacing
    .replace(/\$\$(\S)/g, '\$\$ $1')
    .replace(/(\S)\$\$/g, '$1 \$\$')
    .replace(/([^\s])\$/g, '$1 $')
    .replace(/\$([^\s])/g, '$ $1')
    
    // Convert markdown-style LaTeX to standard LaTeX for better rendering
    .replace(/\\\[(.*?)\\\]/g, '\$\$$1\$\$')
    .replace(/\\\((.*?)\\\)/g, '\$$1\$')
    
    // Fix mismatched or invalid LaTeX
    .replace(/\$([^\$]*?[^\\])\$/g, '$$$1$$') // Ensure inline math expressions are valid
    
    // Better handling of code blocks
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_, lang, code) => {
      return `\n\n\`\`\`${lang || ''}\n${code.trim()}\n\`\`\`\n\n`;
    })
    
    // Handle markdown patterns that might not render correctly with ReactMarkdown
    .replace(/\n/g, '  \n'); // Ensure line breaks are preserved (two spaces before newline)
  
  // No converting markdown to HTML here, we'll let ReactMarkdown handle that
  return processed;
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
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [renderStrategy, setRenderStrategy] = useState<'html' | 'markdown'>('markdown');
  
  // Add math styles to the document head
  useEffect(() => {
    // Only inject styles once
    if (!document.getElementById('math-renderer-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'math-renderer-styles';
      styleEl.innerHTML = mathStyles;
      document.head.appendChild(styleEl);
      
      return () => {
        const styleEl = document.getElementById('math-renderer-styles');
        if (styleEl) document.head.removeChild(styleEl);
      };
    }
  }, []);

  useEffect(() => {
    if (!content) {
      setRenderedContent("");
      setRenderStrategy('markdown');
      return;
    }

    // Autodetect the best rendering strategy based on content analysis
    const hasHtmlTags = /<\/?[a-z][^>]*>/i.test(content);
    const hasMathDelimiters = /\$\$[\s\S]*?\$\$|\$(?!\$)[\s\S]*?\$(?!\$)/i.test(content);
    const hasRawHtmlEntities = /&[a-z]{2,6};/i.test(content);
    
    // If we see a lot of HTML or we detect certain patterns that don't render well with ReactMarkdown
    const contentHasComplexPatterns = hasHtmlTags || hasRawHtmlEntities || 
      // Check for patterns that would break ReactMarkdown
      (hasMathDelimiters && (/<em>|<strong>|<code>/i.test(content)));
    
    if (contentHasComplexPatterns) {
      // Use the HTML processing approach for complex content
      const htmlProcessed = processContentWithHtml(content);
      setRenderedContent(htmlProcessed);
      setRenderStrategy('html');
    } else {
      // Use ReactMarkdown for standard markdown content
      const cleaned = cleanMarkdown(content);
      setRenderedContent(cleaned);
      setRenderStrategy('markdown');
    }
  }, [content]);

  // If we detected HTML and processed it separately
  if (renderStrategy === 'html') {
    return (
      <div 
        className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-400 prose-img:rounded-lg prose-strong:font-bold prose-strong:text-white prose-em:italic prose-p:whitespace-pre-wrap math-content"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  }

  // Otherwise use ReactMarkdown for standard markdown
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-400 prose-img:rounded-lg prose-strong:font-bold prose-strong:text-white prose-em:italic prose-p:whitespace-pre-wrap">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, [rehypeKatex, { throwOnError: false, output: 'html' }]]}
        skipHtml={false}
        unwrapDisallowed={false}
        components={{
          pre: ({ children }: { children?: ReactNode }) => (
            <div className="my-4">{children}</div>
          ),
          code: CodeBlock,
          // Improve paragraph rendering - whitespace-pre-wrap is important for preserving spaces
          p: ({ children, ...props }: { children?: ReactNode } & any) => (
            <p className="mb-4 whitespace-pre-wrap" {...props}>{children}</p>
          ),
          // Enhance strong (bold) rendering
          strong: ({ children }: { children?: ReactNode }) => (
            <strong className="font-bold text-white">{children}</strong>
          ),
          // Enhance em (italic) rendering
          em: ({ children }: { children?: ReactNode }) => (
            <em className="italic text-gray-300">{children}</em>
          ),
          // Handle basic headings with proper styling
          h1: ({ children }: { children?: ReactNode }) => (
            <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }: { children?: ReactNode }) => (
            <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }: { children?: ReactNode }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
          ),
          // Custom styling for blockquotes
          blockquote: ({ children }: { children?: ReactNode }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">{children}</blockquote>
          ),
          // Custom styling for tables
          table: ({ children }: { children?: ReactNode }) => (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse border border-zinc-700">{children}</table>
            </div>
          ),
          th: ({ children }: { children?: ReactNode }) => (
            <th className="border border-zinc-700 bg-zinc-800 px-4 py-2">{children}</th>
          ),
          td: ({ children }: { children?: ReactNode }) => (
            <td className="border border-zinc-700 px-4 py-2">{children}</td>
          ),
          // Ensure lists are properly spaced
          ul: ({ children }: { children?: ReactNode }) => (
            <ul className="list-disc pl-6 mb-4">{children}</ul>
          ),
          ol: ({ children }: { children?: ReactNode }) => (
            <ol className="list-decimal pl-6 mb-4">{children}</ol>
          ),
          // Better rendering for line breaks
          br: () => <br className="my-2" />,
        }}
      >
        {renderedContent}
      </ReactMarkdown>
    </div>
  )
}