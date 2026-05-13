import "dotenv/config";
import serverless from "serverless-http";
import { createApp } from "../../backend/_core/app";

const app = createApp();

// serverless-http translates Netlify Lambda events to Express req/res.
// The original request path (e.g. /api/trpc/...) is preserved in event.path,
// so Express route matching works exactly as in local dev.
export const handler = serverless(app);
