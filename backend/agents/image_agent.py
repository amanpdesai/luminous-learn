# from typing import List

# from uagents import Agent, Model, Context

# from agents.image_helper import fetch_images, ACTIVE_BACKEND


# class ImageRequest(Model):
#     query: str
#     max_results: int = 5


# class ImageResponse(Model):
#     images: List[str]
#     source: str


# image_agent: Agent = Agent(
#     name="image_agent",
#     port=8013,
#     endpoint=["http://localhost:8013/submit"],
# )


# @image_agent.on_message(model=ImageRequest)
# async def _handle(ctx: Context, msg: ImageRequest):
#     ctx.logger.info(f"image request: {msg.query}")
#     urls = fetch_images(msg.query, msg.max_results)
#     ctx.logger.info(f"found {len(urls)} images via {ACTIVE_BACKEND}")
#     await ctx.send(msg.sender, ImageResponse(images=urls, source=ACTIVE_BACKEND or "unknown"))


# @image_agent.on_rest_post("/generate_images", ImageRequest, ImageResponse)
# async def rest_images(ctx: Context, req: ImageRequest) -> ImageResponse:
#     urls = fetch_images(req.query, req.max_results)
#     return ImageResponse(images=urls, source=ACTIVE_BACKEND or "unknown")


# if __name__ == "__main__":
#     print("[ImageAgent] starting on http://localhost:8013 ...")
#     image_agent.run()
