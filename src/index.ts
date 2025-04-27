import { Agent, getAgentByName, routeAgentRequest } from "agents";
import { ScormAgent } from "./presentation/ScormAgent";
import { serveStatic } from "hono/cloudflare-workers";

export { ScormAgent };

interface Env {
  ScormAgent: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Serve the UI at the root
    if (url.pathname === "/" && request.method === "GET") {
      return serveStatic({ root: "./src/presentation" })(request, { env, ctx });
    }
    if (url.pathname === "/index.html" && request.method === "GET") {
      return serveStatic({ root: "./src/presentation" })(request, { env, ctx });
    }

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
