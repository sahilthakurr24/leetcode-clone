"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ProfileDetail } from "./types";

export function LanguagesCard({ languages }: { languages: ProfileDetail["languages"] }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Languages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        {languages.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No accepted submissions yet.
          </p>
        ) : (
          languages.map((lang) => (
            <div key={lang.slug} className="flex items-center justify-between text-sm">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                {lang.name}
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{lang.solved}</span>{" "}
                problem{lang.solved === 1 ? "" : "s"} solved
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
