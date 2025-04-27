import { Agent, getAgentByName, routeAgentRequest } from "agents";
import { ScormAgent } from "./presentation/ScormAgent";

export { ScormAgent };

interface Env {
  ScormAgent: DurableObjectNamespace;
}

// In-memory store for demo purposes (not persistent across worker restarts)
const zipStore = new Map<string, Uint8Array>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Named addressing for /scorm
    if (url.pathname === "/scorm" && request.method === "POST") {
      const agent = await getAgentByName<Env, ScormAgent>(env.ScormAgent, "default");
      const zipResp = await agent.fetch(request);
      const zipData = new Uint8Array(await zipResp.arrayBuffer());
      const id = crypto.randomUUID();
      zipStore.set(id, zipData);
      return Response.json({ downloadUrl: `/scorm/download/${id}` });
    }

    // Download endpoint
    if (url.pathname.startsWith("/scorm/download/") && request.method === "GET") {
      const id = url.pathname.split("/").pop()!;
      const zip = zipStore.get(id);
      if (!zip) return new Response("Not found", { status: 404 });
      return new Response(zip, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": "attachment; filename=lesson-scorm.zip",
        },
      });
    }

    // Default: routed addressing
    const routed = await routeAgentRequest(request, env);
    if (routed) return routed;

    return new Response("Not found", { status: 404 });
  },
};
