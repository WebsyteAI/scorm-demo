import { Agent } from "agents";
import { generateScormAsset } from "../application/ScormAssetService";

export class ScormAgent extends Agent {
  async onRequest(request: Request) {
    const url = new URL(request.url);

    // POST /scorm: generate and store zip, return download link
    if (url.pathname === "/scorm" && request.method === "POST") {
      const { title, content } = await request.json();
      const zip = await generateScormAsset({ title, content });
      await this.storage.put("scorm-zip", zip);
      return Response.json({ downloadUrl: `/scorm/download/default` });
    }

    // GET /scorm/download/default: return stored zip
    if (url.pathname === "/scorm/download/default" && request.method === "GET") {
      const zip = await this.storage.get<Uint8Array>("scorm-zip");
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
