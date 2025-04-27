from typing import List

from uagents import Agent, Model, Context

from routes.youtube_simple import fetch_videos


class VideoRequest(Model):
    query: str
    max_results: int = 3


class VideoResponse(Model):
    videos: List[str]  # watch URLs
    query: str


video_agent: Agent = Agent(
    name="video_agent",
    port=8014,
    endpoint=["http://localhost:8014/submit"],
)


@video_agent.on_message(model=VideoRequest)
async def _handle(ctx: Context, msg: VideoRequest):
    ctx.logger.info("video query: %s", msg.query)
    links = fetch_videos(msg.query, msg.max_results)
    ctx.logger.info("found %d videos", len(links))
    await ctx.send(msg.sender, VideoResponse(videos=links, query=msg.query))


@video_agent.on_rest_post("/generate_videos", VideoRequest, VideoResponse)
async def rest(ctx: Context, req: VideoRequest):
    ctx.logger.info("[REST] video query: %s (max_results: %d)", req.query, req.max_results)
    videos = fetch_videos(req.query, req.max_results)
    ctx.logger.info("[REST] Found %d videos for query '%s':", len(videos), req.query)
    for i, video in enumerate(videos):
        ctx.logger.info("  [%d] %s", i+1, video)
    # Return plain dictionary instead of VideoResponse model instance
    return {"videos": videos, "query": req.query}


if __name__ == "__main__":
    print("[VideoAgent] starting on http://localhost:8014 ...")
    video_agent.run()
