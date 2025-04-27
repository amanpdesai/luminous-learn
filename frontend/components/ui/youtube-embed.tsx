"use client"

import React from 'react'

interface YouTubeEmbedProps {
  videos: string[]
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videos }) => {
  // Filter out invalid URLs and Rick Roll videos
  const validVideoIds = videos
    ?.map(url => {
      if (!url || typeof url !== 'string') return null;
      
      // More robust YouTube URL parsing
      const match = url.match(/(?:youtube\.com\/(?:.*[?&]v=|embed\/)|youtu\.be\/)([^&?\n/]+)/);
      return match?.[1] || null;
    })
    .filter(id => {
      // Filter out null values (invalid URLs)
      if (!id || id.trim() === '') return false;
      
      // Filter out Rick Roll video IDs (most common Rick Roll video)
      const rickRollIds = ['dQw4w9WgXcQ', 'oHg5SJYRHA0'];
      return !rickRollIds.includes(id);
    }) || [];
  
  // Don't render anything if there are no valid videos
  if (!validVideoIds.length) {
    return null;
  }
  
  // Function to handle iframe errors
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>, index: number) => {
    // Hide the iframe if there's an error loading the video
    const iframe = e.currentTarget;
    if (iframe) {
      iframe.style.display = 'none';
      
      // Show error message in parent container
      const container = iframe.parentElement;
      if (container) {
        container.classList.add('video-unavailable');
      }
    }
  };
  
  return (
    <div className="mt-6 mb-8">
      <h3 className="text-xl font-semibold mb-3 text-white">Related Videos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validVideoIds.map((videoId, index) => (
          <div key={index} className="aspect-video-container">
            <iframe
              className="aspect-video-iframe"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`Video ${index + 1}`}
              frameBorder="0"
              onError={(e) => handleIframeError(e, index)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ))}
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
      
      /* Style for containers with unavailable videos */
      .video-unavailable {
        display: none; /* Don't display containers with unavailable videos */
      }
    `
    document.head.appendChild(style)
  }
}
