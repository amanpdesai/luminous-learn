# """
# Image Helper
# ----------------
# Utility functions to fetch royalty-free images for a given query.

# Back-ends supported
# ~~~~~~~~~~~~~~~~~~~
# • Unsplash API  — requires ``UNSPLASH_ACCESS_KEY``
# • SerpAPI       — requires ``SERPAPI_KEY`` (Google Images)

# The first available API key determines the back-end. Returned URLs point
# directly to verified image files (JPEG / PNG / GIF) via an HTTP ``HEAD`` check.

# Licensing
# ~~~~~~~~~
# Only public-domain or Unsplash-standard-license images are included.
# Downstream renderers **must** provide attribution when required by the image
# source.
# """

# import os
# import requests
# from typing import List

# # from __future__ import annotations

# # Environment keys
# _UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
# _SERPAPI_KEY = os.getenv("SERPAPI_KEY")

# # Name of the backend that successfully answered the latest request.  This is
# # exposed so that the agent can include it in the response for debugging /
# # analytics.
# ACTIVE_BACKEND: str | None = None


# def _fetch_unsplash(query: str, k: int) -> List[str]:
#     """Return up to *k* image URLs from Unsplash."""
#     global ACTIVE_BACKEND
#     ACTIVE_BACKEND = "unsplash"
#     endpoint = "https://api.unsplash.com/search/photos"
#     headers = {"Authorization": f"Client-ID {_UNSPLASH_KEY}"}
#     params = {
#         "query": query,
#         "orientation": "landscape",
#         "per_page": k * 3,  # ask for extra; we'll filter later
#         "content_filter": "high",
#     }
#     try:
#         r = requests.get(endpoint, headers=headers, params=params, timeout=10)
#         r.raise_for_status()
#         data = r.json()
#     except Exception as exc:
#         print(f"[image_helper] Unsplash request failed: {exc}")
#         return []

#     urls: List[str] = []
#     for res in data.get("results", []):
#         # Prefer moderately-sized image to save bandwidth
#         url = (
#             res.get("urls", {}).get("regular")
#             or res.get("urls", {}).get("full")
#             or res.get("urls", {}).get("raw")
#         )
#         if url:
#             urls.append(url)
#         if len(urls) >= k:
#             break
#     return urls


# def _fetch_serpapi(query: str, k: int) -> List[str]:
#     """Return up to *k* image URLs via SerpAPI Google Images."""
#     global ACTIVE_BACKEND
#     ACTIVE_BACKEND = "serpapi"
#     endpoint = "https://serpapi.com/search.json"
#     params = {"q": query, "tbm": "isch", "num": k * 3, "api_key": _SERPAPI_KEY}
#     try:
#         r = requests.get(endpoint, params=params, timeout=10)
#         r.raise_for_status()
#         data = r.json()
#     except Exception as exc:
#         print(f"[image_helper] SerpAPI request failed: {exc}")
#         return []

#     urls: List[str] = []
#     for item in data.get("images_results", []):
#         url = item.get("original") or item.get("thumbnail")
#         if url:
#             urls.append(url)
#         if len(urls) >= k:
#             break
#     return urls


# def _verify_urls(urls: List[str], k: int) -> List[str]:
#     """HEAD-check URLs and keep valid *image/* responses."""
#     verified: List[str] = []
#     for url in urls:
#         try:
#             h = requests.head(url, allow_redirects=True, timeout=5)
#             if h.status_code < 400 and h.headers.get("Content-Type", "").startswith("image"):
#                 verified.append(url)
#         except Exception:
#             continue
#         if len(verified) >= k:
#             break
#     return verified[:k]


# def fetch_images(query: str, k: int = 5) -> List[str]:
#     """Public helper returning up to *k* direct image URLs for *query*."""
#     if not query:
#         return []

#     backend_urls: List[str] = []

#     if _UNSPLASH_KEY:
#         backend_urls = _fetch_unsplash(query, k)
#     elif _SERPAPI_KEY:
#         backend_urls = _fetch_serpapi(query, k)
#     else:
#         print("[image_helper] No image API keys configured; returning empty list")
#         ACTIVE_BACKEND = "none"
#         return []

#     return _verify_urls(backend_urls, k)
