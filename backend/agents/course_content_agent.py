from typing import Any, Dict

from uagents import Agent, Model, Context

from agents.helpers import generate_full_course


class FullCourseRequest(Model):
    syllabus_json: Dict[str, Any]


class FullCourseResponse(Model):
    course_json: Dict[str, Any]


# port/endpoint
course_content_agent: Agent = Agent(
    name="course_content_agent",
    port=8012,
    endpoint=["http://localhost:8012/submit"],
)


@course_content_agent.on_message(model=FullCourseRequest)
async def _handle(ctx: Context, msg: FullCourseRequest):
    ctx.logger.info("Full course generation request")
    result = generate_full_course(msg.syllabus_json)
    await ctx.send(msg.sender, FullCourseResponse(course_json=result))


# REST handler
@course_content_agent.on_rest_post(
    "/generate_full_course", FullCourseRequest, FullCourseResponse
)
async def rest_full(ctx: Context, req: FullCourseRequest):
    ctx.logger.info("[REST] full course")
    result = generate_full_course(req.syllabus_json)
    return {"course_json": result}


if __name__ == "__main__":
    print("[CourseContentAgent] starting on http://localhost:8012 ...")
    course_content_agent.run()
