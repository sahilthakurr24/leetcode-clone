import type { Generator } from "./types";
import { cppGenerator } from "./cpp/generator";
import { jsGenerator } from "./javascript/generator";
import { pythonGenerator } from "./python/generator";
import { goGenerator } from "./go/generator";
import { javaGenerator } from "./java/generator";
import { cGenerator } from "./c/generator";
import { rustGenerator } from "./rust/generator";

export * from "./types";
export {
  UnsupportedTypeError,
  serializeStdin,
  serializeExpected,
} from "./helper/shared";
export {
  CANONICAL_TYPES,
  isCanonicalType,
  asCanonicalType,
  type CanonicalType,
} from "./helper/canonical";

export class UnsupportedLanguageError extends Error {
  constructor(slug: string) {
    super(`No code generator for language slug: "${slug}"`);
    this.name = "UnsupportedLanguageError";
  }
}

/** Maps `languages.slug` (see packages/database/seed.ts) to its generator. */
const GENERATORS: Record<string, Generator> = {
  cpp: cppGenerator,
  javascript: jsGenerator,
  python3: pythonGenerator,
  go: goGenerator,
  java: javaGenerator,
  c: cGenerator,
  rust: rustGenerator,
};

export function getGenerator(slug: string): Generator {
  const generator = GENERATORS[slug];
  if (!generator) throw new UnsupportedLanguageError(slug);
  return generator;
}
