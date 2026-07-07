import { env } from "../env";

/**
 * Minimal Judge0 batch client. Submits one entry per test case
 * (base64-encoded), then polls the batch until every entry finishes.
 * Status ids: 1 In Queue, 2 Processing, 3 Accepted, 4 Wrong Answer,
 * 5 TLE, 6 Compilation Error, 7-12 Runtime Error, 13 Internal Error,
 * 14 Exec Format Error.
 */

export interface Judge0BatchEntry {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface Judge0Result {
  token: string;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
}

export type SubmissionStatus =
  | "pending"
  | "judging"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "output_limit_exceeded"
  | "runtime_error"
  | "compilation_error"
  | "internal_error";

export function mapJudge0Status(id: number): SubmissionStatus {
  if (id === 1 || id === 2) return "judging";
  if (id === 3) return "accepted";
  if (id === 4) return "wrong_answer";
  if (id === 5) return "time_limit_exceeded";
  if (id === 6) return "compilation_error";
  if (id >= 7 && id <= 12) return "runtime_error";
  return "internal_error";
}

const encode = (s: string) => Buffer.from(s, "utf8").toString("base64");
const decode = (s: string | null) =>
  s ? Buffer.from(s, "base64").toString("utf8") : null;

const RESULT_FIELDS =
  "token,status,stdout,stderr,compile_output,time,memory";

class Judge0Client {
  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (env.JUDGE0_AUTH_TOKEN) headers["X-Auth-Token"] = env.JUDGE0_AUTH_TOKEN;
    return headers;
  }

  public async createBatch(entries: Judge0BatchEntry[]): Promise<string[]> {
    const response = await fetch(
      `${env.JUDGE0_BASE_URL}/submissions/batch?base64_encoded=true&wait=false`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          submissions: entries.map((entry) => ({
            ...entry,
            source_code: encode(entry.source_code),
            stdin: encode(entry.stdin),
            expected_output: encode(entry.expected_output),
          })),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Judge0 batch create failed: ${response.status}`);
    }

    const tokens = (await response.json()) as { token: string }[];
    return tokens.map((t) => t.token);
  }

  public async getBatch(tokens: string[]): Promise<Judge0Result[]> {
    const response = await fetch(
      `${env.JUDGE0_BASE_URL}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true&fields=${RESULT_FIELDS}`,
      { headers: this.headers() },
    );

    if (!response.ok) {
      throw new Error(`Judge0 batch fetch failed: ${response.status}`);
    }

    const body = (await response.json()) as { submissions: Judge0Result[] };
    return body.submissions.map((result) => ({
      ...result,
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
    }));
  }

  /** Submit a batch and poll until every entry has finished judging. */
  public async runBatch(
    entries: Judge0BatchEntry[],
    { maxAttempts = 40, intervalMs = 500 } = {},
  ): Promise<Judge0Result[]> {
    const tokens = await this.createBatch(entries);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const results = await this.getBatch(tokens);
      const allDone = results.every((r) => r.status.id >= 3);
      if (allDone) return results;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("Judge0 polling timed out");
  }
}

export const judge0Client = new Judge0Client();
