"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useCompanies } from "~/hooks/api/company";

export function TrendingCompanies() {
  const { data, isLoading } = useCompanies();
  const [search, setSearch] = useState("");

  const companies = (data?.companies ?? []).filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Trending Companies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a company..."
            className="h-8 rounded-full bg-secondary pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))
            : companies.map((company) => (
                <Badge
                  key={company.id}
                  variant="secondary"
                  className="cursor-default rounded-full px-3 py-1 font-normal"
                >
                  {company.name}
                </Badge>
              ))}
          {!isLoading && companies.length === 0 && (
            <p className="text-xs text-muted-foreground">No companies found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
