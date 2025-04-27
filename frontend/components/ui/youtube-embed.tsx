"use client"

import React from 'react'

interface YouTubeEmbedProps {
  videos: string[]
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videos }) => {
  console.log('YouTubeEmbed received videos:', videos);
  
  if (!videos || videos.length === 0) {
    console.log('No videos available to render');
    return (
      <div className="mt-6 mb-8 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-md">
        <h3 className="text-xl font-semibold mb-3 text-white">Videos Debug View</h3>
        <p className="text-yellow-400">No videos were provided to the component. If you expected videos, check the backend response.</p>
      </div>
    );
  }

  // Count valid and invalid URLs
  const validVideos = videos.filter(url => url.match(/[?&]v=([^&]+)/)?.[1]).length;
  
  return (
    <div className="mt-6 mb-8">
      <h3 className="text-xl font-semibold mb-3 text-white">Related Videos ({validVideos}/{videos.length} valid)</h3>
      
      {/* Debug information */}
      <div className="mb-4 p-3 border border-blue-500/30 bg-blue-500/10 rounded-md">
        <details>
          <summary className="cursor-pointer text-blue-400 font-semibold">Debug: Video URLs</summary>
          <div className="mt-2 p-2 bg-zinc-900 rounded text-xs">
            <pre>
              {JSON.stringify(videos, null, 2)}
            </pre>
          </div>
        </details>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((url, index) => {
          // Extract video ID from YouTube URL
          const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
          
          if (!videoId) {
            return (
              <div key={index} className="p-3 border border-red-500/30 bg-red-500/10 rounded-md">
                <p className="text-red-400 text-sm">Invalid YouTube URL: {url}</p>
              </div>
            );
          }

          return (
            <div key={index} className="aspect-video-container">
              <iframe
                className="aspect-video-iframe"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`Video ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Add some styles to the document head
if (typeof window !== 'undefined') {
  // Add the styles only on the client side
  if (!document.getElementById('youtube-embed-styles')) {
    const style = document.createElement('style')
    style.id = 'youtube-embed-styles'
    style.innerHTML = `
      .aspect-video-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
        height: 0;
        overflow: hidden;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        background-color: #18181b;
      }
      
      .aspect-video-iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    `
    document.head.appendChild(style)
  }
}
