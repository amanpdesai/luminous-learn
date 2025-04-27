from uagents import Agent, Model, Context

from agents.helpers import generate_quick_learn


class GenerateQuickLearn(Model):
    topic: str
    difficulty: str


class QuickLearnResponse(Model):
    data: dict


# Port/endpoint config
quick_learn_agent: Agent = Agent(
    name="quick_learn_agent",
    port=8011,
    endpoint=["http://localhost:8011/submit"],
)


@quick_learn_agent.on_message(model=GenerateQuickLearn)
async def _handle(ctx: Context, msg: GenerateQuickLearn):
    ctx.logger.info("QuickLearn %s/%s", msg.topic, msg.difficulty)
    result = generate_quick_learn(msg.topic, msg.difficulty)
    await ctx.send(msg.sender, QuickLearnResponse(data=result))


# REST endpoint
@quick_learn_agent.on_rest_post(
    "/generate_quick_learn", GenerateQuickLearn, QuickLearnResponse
)
async def rest_ql(ctx: Context, req: GenerateQuickLearn):
    ctx.logger.info("[REST] quick learn %s/%s", req.topic, req.difficulty)
    data = generate_quick_learn(req.topic, req.difficulty)
    return {"data": data}


# Entry-point
if __name__ == "__main__":
    print("[QuickLearnAgent] starting on http://localhost:8011 ...")
    quick_learn_agent.run()
