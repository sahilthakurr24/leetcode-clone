import Link from "next/link";
import { Code2 } from "lucide-react";

const LINK_GROUPS = [
  {
    title: "Platform",
    links: [
      { label: "Problems", href: "/problemset" },
      { label: "Features", href: "/#features" },
      { label: "Languages", href: "/#languages" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/signin" },
      { label: "Create account", href: "/signup" },
    ],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-sm space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold">
              <Code2 className="size-5 text-yellow-500" />
              <span>LeetClone</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A practice environment for coding interviews — curated problems,
              real code execution in 13 languages, and daily progress tracking.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LeetClone. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Code execution powered by Judge0
          </p>
        </div>
      </div>
    </footer>
  );
}
