import { routeAgentRequest } from "agents";
import type { ExecutionContext } from "@cloudflare/workers-types";
import { Chat, agentContext } from "./agent";

export { Chat, agentContext };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const agentResponse = await routeAgentRequest(request as any, env);
    if (agentResponse) {
      return agentResponse;
    }
    return new Response("Not found", { status: 404 });
  },
};
