import { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";
import { ScormAgent } from "./presentation/ScormAgent";

const app = new Hono();

// Register the agent middleware
app.use("*", agentsMiddleware());

export { ScormAgent };
export default app;
