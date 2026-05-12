import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createCheckoutSession, retrieveSession } from "../payments";
import { sendInvoiceEmail } from "../email";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // ── Stripe: create checkout session ────────────────────────────────────────
  app.post("/api/stripe/create-session", async (req, res) => {
    try {
      const { items, customer, successUrl, cancelUrl } = req.body as {
        items: { name: string; price: string; quantity: number; imageUrl?: string }[];
        customer: { name: string; email: string; address: string };
        successUrl: string;
        cancelUrl: string;
      };
      const url = await createCheckoutSession(items, customer, successUrl, cancelUrl);
      res.json({ url });
    } catch (err: any) {
      console.error("[Stripe] create-session error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Stripe: verify payment + send invoice email ─────────────────────────────
  app.post("/api/stripe/verify-session", async (req, res) => {
    try {
      const { sessionId } = req.body as { sessionId: string };
      const session = await retrieveSession(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const lineItems = session.line_items?.data ?? [];
      const items = lineItems.map((li) => {
        const prod = li.price?.product as any;
        return {
          name: prod?.name ?? li.description ?? "Item",
          quantity: li.quantity ?? 1,
          unitPrice: (li.price?.unit_amount ?? 0) / 100,
        };
      });

      const shippingCost = (session.shipping_cost?.amount_total ?? 599) / 100;
      const total = (session.amount_total ?? 0) / 100;
      const orderNumber = session.id.slice(-8).toUpperCase();
      const customerEmail = session.customer_email ?? "";
      const customerName = (session.metadata?.customerName as string) ?? "";
      const customerAddress = (session.metadata?.customerAddress as string) ?? "";

      await sendInvoiceEmail({
        orderNumber,
        customerName,
        customerEmail,
        customerAddress,
        items,
        shippingCost,
        total,
        currency: session.currency ?? "usd",
      });

      res.json({ success: true, orderNumber, customerEmail, total, items });
    } catch (err: any) {
      console.error("[Stripe] verify-session error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        console.error(`[tRPC Error] ${path}:`, error);
      },
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "5000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Global Error]:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });
}

startServer().catch(console.error);
