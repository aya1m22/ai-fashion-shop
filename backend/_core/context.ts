import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

import { getUserByOpenId, upsertUser } from "../db";

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
      if (u) user = u;
    } catch (error) {
      console.warn("[Context] DB lookup failed for email auth, continuing as unauthenticated:", error);
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
