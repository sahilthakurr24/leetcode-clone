"use client";

import { trpc } from "~/trpc/client";

export function useLanguages(includeInactive = false) {
  return trpc.language.listLanguages.useQuery({ includeInactive });
}
