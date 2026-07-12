import { db, eq, inArray } from "./index";
import {
  languagesTable,
  topicsTable,
  companiesTable,
  problemsTable,
  problemTopicsTable,
  problemCompaniesTable,
} from "./schema";

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

const topics = [
  { name: "Array", slug: "array" },
  { name: "String", slug: "string" },
  { name: "Hash Table", slug: "hash-table" },
  { name: "Dynamic Programming", slug: "dynamic-programming" },
  { name: "Math", slug: "math" },
  { name: "Sorting", slug: "sorting" },
  { name: "Greedy", slug: "greedy" },
  { name: "Depth-First Search", slug: "depth-first-search" },
  { name: "Breadth-First Search", slug: "breadth-first-search" },
  { name: "Tree", slug: "tree" },
  { name: "Binary Search", slug: "binary-search" },
  { name: "Linked List", slug: "linked-list" },
];

const companies = [
  { name: "Google", slug: "google" },
  { name: "Amazon", slug: "amazon" },
  { name: "Meta", slug: "meta" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Apple", slug: "apple" },
  { name: "Netflix", slug: "netflix" },
  { name: "Uber", slug: "uber" },
  { name: "Adobe", slug: "adobe" },
];

/** problem slug → topic slugs / company slugs to link (skipped if absent). */
const problemTopicLinks: Record<string, string[]> = {
  "two-sum": ["array", "hash-table"],
  "reverse-linked-list": ["linked-list"],
  "add-two-numbers": ["linked-list", "math"],
};

const problemCompanyLinks: Record<string, string[]> = {
  "two-sum": ["google", "amazon", "meta", "microsoft"],
  "reverse-linked-list": ["amazon", "apple"],
  "add-two-numbers": ["amazon", "microsoft", "adobe"],
};

async function linkProblems() {
  const problemSlugs = Object.keys({ ...problemTopicLinks, ...problemCompanyLinks });
  const problems = await db
    .select({ id: problemsTable.id, slug: problemsTable.slug })
    .from(problemsTable)
    .where(inArray(problemsTable.slug, problemSlugs));
  const problemBySlug = new Map(problems.map((p) => [p.slug, p.id]));

  const allTopics = await db
    .select({ id: topicsTable.id, slug: topicsTable.slug })
    .from(topicsTable);
  const topicBySlug = new Map(allTopics.map((t) => [t.slug, t.id]));

  const allCompanies = await db
    .select({ id: companiesTable.id, slug: companiesTable.slug })
    .from(companiesTable);
  const companyBySlug = new Map(allCompanies.map((c) => [c.slug, c.id]));

  const topicRows = Object.entries(problemTopicLinks).flatMap(([problemSlug, topicSlugs]) => {
    const problemId = problemBySlug.get(problemSlug);
    if (!problemId) return [];
    return topicSlugs
      .map((slug) => topicBySlug.get(slug))
      .filter((id): id is string => !!id)
      .map((topicId) => ({ problemId, topicId }));
  });

  const companyRows = Object.entries(problemCompanyLinks).flatMap(
    ([problemSlug, companySlugs]) => {
      const problemId = problemBySlug.get(problemSlug);
      if (!problemId) return [];
      return companySlugs
        .map((slug) => companyBySlug.get(slug))
        .filter((id): id is string => !!id)
        .map((companyId) => ({ problemId, companyId }));
    },
  );

  if (topicRows.length > 0) {
    await db.insert(problemTopicsTable).values(topicRows).onConflictDoNothing();
  }
  if (companyRows.length > 0) {
    await db.insert(problemCompaniesTable).values(companyRows).onConflictDoNothing();
  }

  return { topicLinks: topicRows.length, companyLinks: companyRows.length };
}

async function seed() {
  await db.insert(languagesTable).values(languages).onConflictDoNothing();
  console.log(`Seeded ${languages.length} languages ✅`);

  await db.insert(topicsTable).values(topics).onConflictDoNothing();
  console.log(`Seeded ${topics.length} topics ✅`);

  await db.insert(companiesTable).values(companies).onConflictDoNothing();
  console.log(`Seeded ${companies.length} companies ✅`);

  const { topicLinks, companyLinks } = await linkProblems();
  console.log(`Linked ${topicLinks} problem-topics, ${companyLinks} problem-companies ✅`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
