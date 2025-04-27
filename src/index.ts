import { routeAgentRequest } from "agents";
import type { ExecutionContext } from "@cloudflare/workers-types";
import { ScormAgent } from "./presentation/ScormAgent";

// Optionally, define agentContext if needed for env bindings
export { ScormAgent };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const agentResponse = await routeAgentRequest(request as any, env);
    if (agentResponse) {
      return agentResponse;
    }
    return new Response("Not found", { status: 404 });
  },
};
