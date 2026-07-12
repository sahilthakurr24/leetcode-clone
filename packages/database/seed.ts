import { db } from "./index";
import { languagesTable } from "./schema";

/**
 * Seeds the Judge0 language catalogue (slug + judge0 language id + Monaco
 * mapping). Everything else — problems, topics, companies — is created by
 * admins through the frontend (problem.createProblem, topic.createTopic,
 * company.createCompany).
 */

//languages configured from judge0

const languages = [
  {
    judge0Id: 71,
    name: "Python (3.8.1)",
    version: "3.8.1",
    slug: "python3",
    monacoLanguage: "python",
  },
  {
    judge0Id: 63,
    name: "JavaScript (Node.js 12.14.0)",
    version: "12.14.0",
    slug: "javascript",
    monacoLanguage: "javascript",
  },
  {
    judge0Id: 74,
    name: "TypeScript (3.7.4)",
    version: "3.7.4",
    slug: "typescript",
    monacoLanguage: "typescript",
  },
  { judge0Id: 54, name: "C++ (GCC 9.2.0)", version: "9.2.0", slug: "cpp", monacoLanguage: "cpp" },
  {
    judge0Id: 62,
    name: "Java (OpenJDK 13.0.1)",
    version: "13.0.1",
    slug: "java",
    monacoLanguage: "java",
  },
  { judge0Id: 50, name: "C (GCC 9.2.0)", version: "9.2.0", slug: "c", monacoLanguage: "c" },
  {
    judge0Id: 51,
    name: "C# (Mono 6.6.0.161)",
    version: "6.6.0",
    slug: "csharp",
    monacoLanguage: "csharp",
  },
  { judge0Id: 60, name: "Go (1.13.5)", version: "1.13.5", slug: "go", monacoLanguage: "go" },
  { judge0Id: 73, name: "Rust (1.40.0)", version: "1.40.0", slug: "rust", monacoLanguage: "rust" },
  {
    judge0Id: 78,
    name: "Kotlin (1.3.70)",
    version: "1.3.70",
    slug: "kotlin",
    monacoLanguage: "kotlin",
  },
  { judge0Id: 72, name: "Ruby (2.7.0)", version: "2.7.0", slug: "ruby", monacoLanguage: "ruby" },
  { judge0Id: 83, name: "Swift (5.2.3)", version: "5.2.3", slug: "swift", monacoLanguage: "swift" },
  { judge0Id: 68, name: "PHP (7.4.1)", version: "7.4.1", slug: "php", monacoLanguage: "php" },
];

async function seed() {
  await db.insert(languagesTable).values(languages).onConflictDoNothing();
  console.log(`Seeded ${languages.length} languages ✅`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
