import { Braces, CalendarCheck, MessagesSquare, Zap } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const FEATURES = [
  {
    icon: Zap,
    title: "Real code execution",
    description:
      "Every submission runs against real test cases on an isolated Judge0 sandbox — no mocked output, actual verdicts.",
  },
  {
    icon: Braces,
    title: "Solve in your language",
    description:
      "Pick from 13 languages with generated starter code — C++, Java, Python, Go, Rust, and more.",
  },
  {
    icon: CalendarCheck,
    title: "Track your streak",
    description:
      "A daily attendance calendar and per-problem progress keep your interview prep consistent.",
  },
  {
    icon: MessagesSquare,
    title: "Learn from the community",
    description:
      "Read editorials, browse voted community solutions, and discuss approaches in the comments.",
  },
] as const;

export function FeatureCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature) => (
        <Card key={feature.title}>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <feature.icon className="size-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <CardTitle className="text-base">{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
