"use client";

import Link from "next/link";

import { CreateProblemForm } from "~/components/admin/create-problem-form";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { useMe } from "~/hooks/api/auth";

/** Rendered for signed-out visitors and non-admins alike — the admin area
 * presents itself as a nonexistent page (the API enforces FORBIDDEN anyway). */
function NotFoundState() {
  return (
    <Empty className="h-[60vh] border border-dashed">
      <EmptyHeader>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>
          This page doesn&apos;t exist.{" "}
          <Link href="/problemset" className="text-blue-400 hover:underline">
            Back to problems
          </Link>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default function CreateProblemPage() {
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
        <Skeleton className="h-10 w-56 shrink-0" />
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-full" />
          <Skeleton className="h-full" />
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  if (isError || data?.user.role !== "admin") {
    return <NotFoundState />;
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold">Create Problem</h1>
        <p className="text-sm text-muted-foreground">
          Starter code for all supported languages is generated automatically
          from the function signature.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <CreateProblemForm />
      </div>
    </div>
  );
}
