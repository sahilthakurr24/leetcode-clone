"use client";

import { trpc } from "~/trpc/client";

export function useCompanies() {
  return trpc.company.listCompanies.useQuery();
}

// ---- admin ----

export function useCreateCompany() {
  const utils = trpc.useUtils();

  return trpc.company.createCompany.useMutation({
    onSuccess: () => utils.company.listCompanies.invalidate(),
  });
}
