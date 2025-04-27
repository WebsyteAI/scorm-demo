import { Agent, getAgentByName, routeAgentRequest } from "agents";
import { ScormAgent } from "./presentation/ScormAgent";

export { ScormAgent };

interface Env {
  ScormAgent: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Try routed addressing first (e.g., /agents/ScormAgent/:name)
    const routed = await routeAgentRequest(request, env);
    if (routed) return routed;

    // Optionally, support named addressing (e.g., /scorm)
    if (new URL(request.url).pathname === "/scorm") {
      const agent = await getAgentByName<Env, ScormAgent>(env.ScormAgent, "default");
      return agent.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};
