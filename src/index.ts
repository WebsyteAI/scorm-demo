import { Hono } from "hono";
import { jsx } from "hono/jsx";
import { Agent, getAgentByName, routeAgentRequest } from "agents";
import { ScormAgent } from "./presentation/ScormAgent";

export { ScormAgent };

interface Env {
  ScormAgent: DurableObjectNamespace;
}

const app = new Hono<Env>();

app.get("/", (c) => {
  return c.html(
    <html>
      <head>
        <title>SCORM Generator</title>
      </head>
      <body>
        <h1>SCORM Asset Generator</h1>
        <form method="POST" action="/scorm">
          <label>
            Lesson Title:
            <input type="text" name="title" required />
          </label>
          <br />
          <label>
            Lesson Content:
            <textarea name="content" required></textarea>
          </label>
          <br />
          <button type="submit">Generate SCORM</button>
        </form>
      </body>
    </html>
  );
});

app.post("/scorm", async (c) => {
  const body = await c.req.parseBody();
  const title = body["title"] as string;
  const content = body["content"] as string;

  const agent = await getAgentByName<Env, ScormAgent>(c.env.ScormAgent, "default");
  const resp = await agent.fetch(
    new Request("http://dummy/scorm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, content }),
    })
  );
  const { downloadUrl } = await resp.json();

  return c.html(
    <html>
      <head>
        <title>SCORM Generator</title>
      </head>
      <body>
        <h1>SCORM Asset Generator</h1>
        <p>SCORM package generated!</p>
        <a href={downloadUrl}>Download SCORM Package</a>
        <br />
        <a href="/">Back</a>
      </body>
    </html>
  );
});

app.get("/scorm/download/:contextId", async (c) => {
  const agent = await getAgentByName<Env, ScormAgent>(c.env.ScormAgent, "default");
  return agent.fetch(c.req.raw);
});

app.all("*", async (c) => {
  const routed = await routeAgentRequest(c.req.raw, c.env);
  if (routed) return routed;
  return c.text("Not found", 404);
});

export default app;
