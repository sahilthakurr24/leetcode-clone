import type { IncomingMessage } from "node:http";
import { auth, fromNodeHeaders } from "@repo/auth";

export async function createContext({ req }: { req: IncomingMessage }) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  return {
    session,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
