/**
 * Shared, language-agnostic contracts for the per-language code generators.
 * Every `helper/<lang>helper` implements a `Generator` over these types.
 */

export interface FunctionParameter {
  /** The language type as written in the signature, e.g. "vector<int>". */
  type: string;
  /** The leaf element type for containers, e.g. "int" for "vector<int>". */
  elementType: string;
  name: string;
}

export interface ProblemSignature {
  functionName: string;
  parameters: FunctionParameter[];
  returnType: string;
}

export interface Generator {
  /** Assemble the full, compilable source = harness + user body + `main()`. */
  generateSource(signature: ProblemSignature, userCode: string): string;
}

/**
 * Per-type (de)serialization for one language:
 *  - `read(line)`  -> expression parsing one stdin line into the value
 *  - `dump(value)` -> expression printing the value as canonical compact JSON
 */
export interface TypeCodec {
  read: (line: string) => string;
  dump: (value: string) => string;
}
