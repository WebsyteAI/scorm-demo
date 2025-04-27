import { Agent, getAgentByName, routeAgentRequest } from "agents";
import { ScormAgent } from "./presentation/ScormAgent";

export { ScormAgent };

interface Env {
  ScormAgent: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Route /scorm and /scorm/download/default to the named agent "default"
    if (
      (url.pathname === "/scorm" && request.method === "POST") ||
      (url.pathname === "/scorm/download/default" && request.method === "GET")
    ) {
      const agent = await getAgentByName<Env, ScormAgent>(env.ScormAgent, "default");
      return agent.fetch(request);
    }

    // Default: routed addressing
    const routed = await routeAgentRequest(request, env);
    if (routed) return routed;

    return new Response("Not found", { status: 404 });
  },
};
