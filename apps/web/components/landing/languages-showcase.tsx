import { Badge } from "~/components/ui/badge";

/** Names shown if the API was unreachable at render time (mirrors the seed). */
const FALLBACK_LANGUAGES = [
  "Python",
  "JavaScript",
  "TypeScript",
  "C++",
  "Java",
  "C",
  "C#",
  "Go",
  "Rust",
  "Kotlin",
  "Ruby",
  "Swift",
  "PHP",
];

/** Strip the trailing version parenthetical, e.g. "C++ (GCC 9.2.0)" → "C++". */
function displayName(name: string) {
  return name.replace(/\s*\(.*\)\s*$/, "");
}

export function LanguagesShowcase({
  languages,
}: {
  languages: { slug: string; name: string }[] | null;
}) {
  const names = languages?.length
    ? languages.map((language) => displayName(language.name))
    : FALLBACK_LANGUAGES;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {names.map((name) => (
        <Badge
          key={name}
          variant="secondary"
          className="px-3 py-1.5 font-mono text-sm"
        >
          {name}
        </Badge>
      ))}
    </div>
  );
}
