import { Agent } from "agents";
import { generateScormAsset } from "../application/ScormAssetService";

export class ScormAgent extends Agent {
  async onRequest(request: Request) {
    const url = new URL(request.url);

    // Determine contextId from query or POST body (default: "default")
    let contextId = url.searchParams.get("contextId") || "default";

    // POST /scorm: generate and store zip, return download link
    if (url.pathname === "/scorm" && request.method === "POST") {
      let body: any = {};
      try {
        body = await request.json();
      } catch {}
      if (body.contextId) contextId = body.contextId;

      const { title, content } = body;
      if (!title || !content) {
        return new Response("Missing title or content", { status: 400 });
      }
      // Pass env to generateScormAsset for AI
      const zip = await generateScormAsset({ title, content }, this.env);
      const zipBase64 = Buffer.from(zip).toString("base64");
      // Use this.setState to persist
      const state = this.state || {};
      state[`scorm-zip-${contextId}`] = zipBase64;
      this.setState(state);
      return Response.json({ downloadUrl: `/scorm/download/${contextId}` });
    }

    // GET /scorm/download/:contextId: return stored zip
    const downloadMatch = url.pathname.match(/^\/scorm\/download\/(.+)$/);
    if (downloadMatch && request.method === "GET") {
      const id = downloadMatch[1];
      const state = this.state || {};
      const zipBase64 = state[`scorm-zip-${id}`];
      if (!zipBase64) return new Response("Not found", { status: 404 });
      const zip = Uint8Array.from(Buffer.from(zipBase64, "base64"));
      return new Response(zip, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": "attachment; filename=lesson-scorm.zip",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
