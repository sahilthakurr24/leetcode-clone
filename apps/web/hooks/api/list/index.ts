"use client";

import { trpc } from "~/trpc/client";

export function useMyLists() {
  return trpc.list.getMyLists.useQuery();
}

export function useListById(id: string | undefined) {
  return trpc.list.getListById.useQuery({ id: id! }, { enabled: !!id });
}

export function useMyFavorites() {
  return trpc.list.getMyFavorites.useQuery();
}

export function useCreateList() {
  const utils = trpc.useUtils();

  return trpc.list.createList.useMutation({
    onSuccess: () => utils.list.getMyLists.invalidate(),
  });
}

export function useDeleteList() {
  const utils = trpc.useUtils();

  return trpc.list.deleteList.useMutation({
    onSuccess: () => utils.list.getMyLists.invalidate(),
  });
}

export function useAddProblemToList() {
  const utils = trpc.useUtils();

  return trpc.list.addProblemToList.useMutation({
    onSuccess: (_data, variables) =>
      utils.list.getListById.invalidate({ id: variables.listId }),
  });
}

export function useRemoveProblemFromList() {
  const utils = trpc.useUtils();

  return trpc.list.removeProblemFromList.useMutation({
    onSuccess: (_data, variables) =>
      utils.list.getListById.invalidate({ id: variables.listId }),
  });
}

export function useToggleFavorite() {
  const utils = trpc.useUtils();

  return trpc.list.toggleFavorite.useMutation({
    onSuccess: () => utils.list.getMyFavorites.invalidate(),
  });
}
