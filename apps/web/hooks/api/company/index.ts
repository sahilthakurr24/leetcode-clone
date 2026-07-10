"use client";

import { trpc } from "~/trpc/client";

export function useCompanies() {
  return trpc.company.listCompanies.useQuery();
}
