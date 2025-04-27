import { Agent } from "agents";
import { generateScormAsset } from "../application/ScormAssetService";

export class ScormAgent extends Agent {
  async onRequest(request: Request) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    const { title, content } = data;
    if (!title || !content) {
      return new Response("Missing title or content", { status: 400 });
    }
    const zip = await generateScormAsset({ title, content });
    return new Response(zip, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=lesson-scorm.zip`,
      },
    });
  }
}
