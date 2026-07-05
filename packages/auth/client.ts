// Client entry — safe to import from browser / "use client" code. This must
// NOT pull in the server `auth` instance (DB connection + secret), so it only
// re-exports better-auth's React client helpers and client-side plugins.
export * from "better-auth/react";
export { inferAdditionalFields } from "better-auth/client/plugins";

// Type-only re-export (erased at build time — no server code reaches the
// client) so the client can infer the server's additional user fields.
export type { Auth } from "./lib/auth";
