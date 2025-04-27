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
      const zip = await generateScormAsset({ title, content });
      await this.state.put(`scorm-zip-${contextId}`, zip);
      return Response.json({ downloadUrl: `/scorm/download/${contextId}` });
    }

    // GET /scorm/download/:contextId: return stored zip
    const downloadMatch = url.pathname.match(/^\/scorm\/download\/(.+)$/);
    if (downloadMatch && request.method === "GET") {
      const id = downloadMatch[1];
      const zip = await this.state.get<Uint8Array>(`scorm-zip-${id}`);
      if (!zip) return new Response("Not found", { status: 404 });
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
