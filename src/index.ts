import { Hono } from "hono";
import { ScormAgent } from "./presentation/ScormAgent";
import { agents } from "agents";

const app = new Hono();

// Register the agent(s) at /agents/ScormAgent
app.route("/agents", agents({ ScormAgent }));

export { ScormAgent };
export default app;
