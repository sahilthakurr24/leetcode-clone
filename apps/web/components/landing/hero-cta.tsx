"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useMe } from "~/hooks/api/auth";

/** Hero call-to-action buttons, personalized for signed-in users. */
export function HeroCta() {
  const { data, error } = useMe();
  const user = error ? null : data?.user;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="lg" asChild>
        <Link href="/problemset">
          {user ? "Continue solving" : "Start solving"}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
      {!user && (
        <Button size="lg" variant="outline" asChild>
          <Link href="/signup">Create a free account</Link>
        </Button>
      )}
    </div>
  );
}
