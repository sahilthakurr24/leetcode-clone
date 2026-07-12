import type { Metadata } from "next";

import { EditorMock } from "~/components/landing/editor-mock";
import { FeatureCards } from "~/components/landing/feature-cards";
import { HeroCta } from "~/components/landing/hero-cta";
import { LandingFooter } from "~/components/landing/landing-footer";
import { LanguagesShowcase } from "~/components/landing/languages-showcase";
import { Navbar } from "~/components/layout/navbar";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "LeetClone — Practice coding interviews",
  description:
    "Solve coding problems in 13 languages, run your code against real test cases, and track your progress every day.",
};

// Stats come from the live API on every request.
export const dynamic = "force-dynamic";

/** Fetch landing-page stats, tolerating an unreachable API (nulls fall back). */
async function getLandingData() {
  const [problems, languages, topics] = await Promise.allSettled([
    api.problem.listProblems.query({ limit: 1, offset: 0 }),
    api.language.listLanguages.query({}),
    api.topic.listTopics.query(),
  ]);

  return {
    problemCount:
      problems.status === "fulfilled" ? problems.value.total : null,
    languages:
      languages.status === "fulfilled" ? languages.value.languages : null,
    topicCount: topics.status === "fulfilled" ? topics.value.topics.length : null,
  };
}

export default async function Home() {
  const { problemCount, languages, topicCount } = await getLandingData();

  const stats = [
    { value: problemCount, label: "Problems" },
    { value: languages?.length ?? 13, label: "Languages" },
    { value: topicCount, label: "Topics" },
  ].filter((stat) => stat.value !== null && stat.value !== 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Master coding interviews,{" "}
              <span className="text-yellow-600 dark:text-yellow-500">
                one problem at a time
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Solve curated problems in the browser, run your code against real
              test cases, and keep your streak alive — everything you need to
              get interview-ready, in one place.
            </p>
            <HeroCta />
          </div>
          <EditorMock />
        </section>

        {/* Stats */}
        {stats.length > 0 && (
          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border px-4">
              {stats.map((stat) => (
                <div key={stat.label} className="py-8 text-center">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-16 space-y-8 px-4 py-20"
        >
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to get interview-ready
            </h2>
            <p className="text-muted-foreground">
              Not just a problem list — a full practice environment with real
              execution, progress tracking, and a community to learn from.
            </p>
          </div>
          <FeatureCards />
        </section>

        {/* Languages */}
        <section
          id="languages"
          className="border-t border-border scroll-mt-16 bg-muted/40"
        >
          <div className="mx-auto max-w-6xl space-y-8 px-4 py-20">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Solve in the language you love
              </h2>
              <p className="text-muted-foreground">
                Starter code is generated for every problem in every supported
                language — switch anytime.
              </p>
            </div>
            <LanguagesShowcase languages={languages} />
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
