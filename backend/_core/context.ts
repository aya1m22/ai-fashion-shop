import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

import { getUserByOpenId, upsertUser } from "../db";

// Stable numeric ID derived from email so each user gets a consistent ID
// even when the database is unavailable.
function emailToId(email: string): number {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = (Math.imul(31, h) + email.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  const email = opts.req.headers["x-user-email"] as string;

  if (email) {
    try {
      let u = await getUserByOpenId(email);
      if (!u) {
        await upsertUser({ openId: email, email, name: email.split("@")[0] });
        u = await getUserByOpenId(email);
      }
      if (u) {
        user = u;
      } else {
        // DB unavailable or tables not yet created — create a transient user
        // so protectedProcedure + AI features still work without a database.
        user = {
          id: emailToId(email),
          openId: email,
          email,
          name: email.split("@")[0],
          role: email === ENV.ownerOpenId ? "admin" : null,
          createdAt: null,
          lastSignedIn: null,
          loginMethod: null,
        } as unknown as User;
      }
    } catch (error) {
      console.warn("[Context] DB lookup failed, using transient user:", error);
      user = {
        id: emailToId(email),
        openId: email,
        email,
        name: email.split("@")[0],
        role: email === ENV.ownerOpenId ? "admin" : null,
        createdAt: null,
        lastSignedIn: null,
        loginMethod: null,
      } as unknown as User;
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
