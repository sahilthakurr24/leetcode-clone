"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Code2, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { ModeToggle } from "~/components/layout/mode-toggle";
import { useMe } from "~/hooks/api/auth";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

const NAV_LINKS = [{ label: "Problems", href: "/problemset" }];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, error } = useMe();

  const user = error ? null : data?.user;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Code2 className="size-5 text-yellow-500" />
          <span>LeetClone</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(link.href) && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {isLoading ? (
            <Skeleton className="size-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-ring focus-visible:ring-2">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={user.profileImageUrl ?? undefined}
                      alt={user.fullName}
                    />
                    <AvatarFallback>
                      {user.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user.fullName}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.username ?? user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" variant="secondary" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
