import { routeAgentRequest } from "agents";
import { ScormAgent } from "./presentation/ScormAgent";

export { ScormAgent };

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;
    return new Response("Not found", { status: 404 });
  },
};
