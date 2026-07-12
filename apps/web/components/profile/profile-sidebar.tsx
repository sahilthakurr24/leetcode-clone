"use client";

import { CalendarDays, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import type { ProfileDetail } from "./types";

export function ProfileSidebar({ user }: { user: ProfileDetail["user"] }) {
  const joined = new Date(user.createdAt).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="py-5">
      <CardContent className="flex flex-col items-center gap-3 px-5 text-center">
        <Avatar className="size-20">
          <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.fullName} />
          <AvatarFallback className="text-xl">
            {user.fullName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold">{user.fullName}</p>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
        </div>

        {user.role === "admin" && (
          <Badge className="rounded-full border-0 bg-blue-500/15 text-blue-400">
            <ShieldCheck className="size-3" /> Admin
          </Badge>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" /> Joined {joined}
        </p>
      </CardContent>
    </Card>
  );
}
