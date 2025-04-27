from uagents import Agent, Model, Context

from agents.helpers import generate_syllabus


class GenerateSyllabus(Model):
    topic: str
    difficulty: str
    depth: str = "comprehensive"


class SyllabusResponse(Model):
    json_text: str


# Provide message-endpoint for agent registration
# Set a unique port for this agent; Bureau will run unified but port helps local tests
syllabus_agent: Agent = Agent(
    name="syllabus_agent",
    port=8010,
    endpoint=["http://localhost:8010/submit"],
)


@syllabus_agent.on_message(model=GenerateSyllabus)
async def _handle(ctx: Context, msg: GenerateSyllabus):
    ctx.logger.info("Syllabus request %s/%s", msg.topic, msg.difficulty)
    result = generate_syllabus(msg.topic, msg.difficulty, msg.depth)
    await ctx.send(msg.sender, SyllabusResponse(json_text=result))

# REST endpoint so external clients can call directly
@syllabus_agent.on_rest_post("/generate_syllabus", GenerateSyllabus, SyllabusResponse)
async def rest_generate(ctx: Context, req: GenerateSyllabus) -> SyllabusResponse:
    ctx.logger.info("[REST] syllabus for %s/%s", req.topic, req.difficulty)
    text = generate_syllabus(req.topic, req.difficulty, req.depth)
    return SyllabusResponse(json_text=text)


if __name__ == "__main__":
    print("[SyllabusAgent] starting on http://localhost:8010 ...")
    syllabus_agent.run()
