/**
 * Runtime helpers shared by every language generator. These are host-side
 * (TypeScript) and language-agnostic; each language harness must mirror the
 * same wire format (one JSON argument per stdin line; compact-JSON output).
 */

export class UnsupportedTypeError extends Error {
  constructor(type: string) {
    super(`Unsupported type: "${type}"`);
    this.name = "UnsupportedTypeError";
  }
}

/** Serialize the ordered argument list to stdin — one JSON value per line. */
export function serializeStdin(input: unknown[]): string {
  return input.map((arg) => JSON.stringify(arg)).join("\n");
}

/** Canonical expected stdout Judge0 compares against (compact JSON). */
export function serializeExpected(expected: unknown): string {
  return JSON.stringify(expected);
}
