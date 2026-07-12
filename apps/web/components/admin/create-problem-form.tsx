"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { CANONICAL_TYPES } from "@repo/judge0";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { RouterInputs } from "@repo/trpc/client";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useCompanies, useCreateCompany } from "~/hooks/api/company";
import { useCreateProblem } from "~/hooks/api/problem";
import { useCreateTopic, useTopics } from "~/hooks/api/topic";

/** A required field holding one JSON value (e.g. `[2,7,11,15]`, `9`, `"abc"`). */
const jsonValueSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .superRefine((value, ctx) => {
    try {
      JSON.parse(value);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid JSON value" });
    }
  });

const optionalIntString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || (/^\d+$/.test(value) && +value >= min && +value <= max),
      { message: `Must be a number between ${min} and ${max}` },
    );

const formSchema = z.object({
  displayId: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, "Positive number"),
  title: z.string().trim().min(1, "Required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Required")
    .max(160)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  description: z.string().trim().min(1, "Required"),
  constraints: z.string().optional(),

  functionName: z
    .string()
    .trim()
    .min(1, "Required")
    .max(100)
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Must be a valid identifier"),
  returnType: z.enum(CANONICAL_TYPES),
  params: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "Required")
          .max(60)
          .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Must be a valid identifier"),
        type: z.enum(CANONICAL_TYPES),
      }),
    )
    .min(1, "At least one parameter"),

  testCases: z
    .array(
      z.object({
        inputs: z.array(jsonValueSchema),
        expectedOutput: jsonValueSchema,
        isSample: z.boolean(),
        explanation: z.string().optional(),
      }),
    )
    .min(1, "At least one test case"),

  hints: z.array(z.object({ value: z.string().trim().min(1, "Empty hint") })),

  topicIds: z.array(z.string()),
  companyIds: z.array(z.string()),

  timeLimitMs: optionalIntString(100, 20000),
  memoryLimitKb: optionalIntString(16000, 1024000),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const EMPTY_TEST_CASE: FormValues["testCases"][number] = {
  inputs: [],
  expectedOutput: "",
  isSample: true,
  explanation: "",
};

function kebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Toggleable badge list with an inline "create new" row (topics/companies). */
function TagPicker({
  label,
  items,
  isLoading,
  selectedIds,
  onToggle,
  onCreate,
  isCreating,
}: {
  label: string;
  items: { id: string; name: string }[] | undefined;
  isLoading: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  isCreating: boolean;
}) {
  const [newName, setNewName] = useState("");

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await onCreate(name);
    setNewName("");
  }

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div className="flex flex-wrap gap-1.5">
        {isLoading && (
          <span className="text-xs text-muted-foreground">Loading…</span>
        )}
        {items?.map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <Badge
              key={item.id}
              asChild
              variant={selected ? "default" : "outline"}
            >
              <button type="button" onClick={() => onToggle(item.id)}>
                {item.name}
              </button>
            </Badge>
          );
        })}
        {items?.length === 0 && (
          <span className="text-xs text-muted-foreground">
            None yet — add one below.
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={newName}
          placeholder={`New ${label.toLowerCase().replace(/s$/, "")}…`}
          className="h-8 text-xs"
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleCreate();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isCreating || !newName.trim()}
          onClick={handleCreate}
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>
    </div>
  );
}

export function CreateProblemForm() {
  const router = useRouter();
  const createProblem = useCreateProblem();
  const topicsQuery = useTopics();
  const companiesQuery = useCompanies();
  const createTopic = useCreateTopic();
  const createCompany = useCreateCompany();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayId: "",
      title: "",
      slug: "",
      difficulty: "easy",
      description: "",
      constraints: "",
      functionName: "",
      returnType: "int",
      params: [{ name: "", type: "int" }],
      testCases: [EMPTY_TEST_CASE],
      hints: [],
      topicIds: [],
      companyIds: [],
      timeLimitMs: "",
      memoryLimitKb: "",
      isPublished: true,
    },
  });

  const params = useFieldArray({ control: form.control, name: "params" });
  const testCases = useFieldArray({ control: form.control, name: "testCases" });
  const hints = useFieldArray({ control: form.control, name: "hints" });

  const watchedParams = form.watch("params");
  const selectedTopicIds = form.watch("topicIds");
  const selectedCompanyIds = form.watch("companyIds");

  function toggleId(field: "topicIds" | "companyIds", id: string) {
    const current = form.getValues(field);
    form.setValue(
      field,
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  async function handleCreateTopic(name: string) {
    try {
      const { topic } = await createTopic.mutateAsync({
        name,
        slug: kebabCase(name),
      });
      form.setValue("topicIds", [...form.getValues("topicIds"), topic.id]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create the topic.",
      );
    }
  }

  async function handleCreateCompany(name: string) {
    try {
      const { company } = await createCompany.mutateAsync({
        name,
        slug: kebabCase(name),
      });
      form.setValue("companyIds", [
        ...form.getValues("companyIds"),
        company.id,
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create the company.",
      );
    }
  }

  function handleTitleChange(title: string) {
    form.setValue("title", title);
    if (!form.getFieldState("slug").isDirty) {
      form.setValue("slug", kebabCase(title));
    }
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      displayId: Number(values.displayId),
      slug: values.slug,
      title: values.title,
      description: values.description,
      constraints: values.constraints?.trim() ? values.constraints : undefined,
      difficulty: values.difficulty,
      functionName: values.functionName,
      returnType: values.returnType,
      params: values.params,
      testCases: values.testCases.map((testCase) => ({
        // Inputs are entered one-per-param; stale slots from removed params are dropped.
        input: testCase.inputs
          .slice(0, values.params.length)
          .map((value) => JSON.parse(value) as unknown),
        expectedOutput: JSON.parse(testCase.expectedOutput) as unknown,
        isSample: testCase.isSample,
        explanation: testCase.explanation?.trim() ? testCase.explanation : undefined,
      })),
      hints: values.hints.map((hint) => hint.value),
      topicIds: values.topicIds,
      companyIds: values.companyIds,
      timeLimitMs: values.timeLimitMs ? Number(values.timeLimitMs) : undefined,
      memoryLimitKb: values.memoryLimitKb ? Number(values.memoryLimitKb) : undefined,
      isPublished: values.isPublished,
    } satisfies RouterInputs["problem"]["createProblem"];

    try {
      await createProblem.mutateAsync(payload);
      toast.success(`Problem "${values.title}" created`);
      router.push(`/problems/${values.slug}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create the problem.";
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 lg:h-full lg:min-h-0 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)_auto]"
      >
        {/* ---------- Details (left column, spans both rows) ---------- */}
        <Card className="gap-4 py-4 lg:row-span-2 lg:min-h-0 lg:overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <FormField
                control={form.control}
                name="displayId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Two Sum"
                        {...field}
                        onChange={(e) => handleTitleChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="two-sum" {...field} />
                    </FormControl>
                    <FormDescription>Used in the problem URL.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder="Problem statement…" {...field} />
                  </FormControl>
                  <FormDescription>
                    Markdown supported (inline code with backticks, lists, bold…).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Constraints (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={"`1 <= nums.length <= 10^4`"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TagPicker
              label="Topics"
              items={topicsQuery.data?.topics}
              isLoading={topicsQuery.isLoading}
              selectedIds={selectedTopicIds}
              onToggle={(id) => toggleId("topicIds", id)}
              onCreate={handleCreateTopic}
              isCreating={createTopic.isPending}
            />

            <TagPicker
              label="Companies"
              items={companiesQuery.data?.companies}
              isLoading={companiesQuery.isLoading}
              selectedIds={selectedCompanyIds}
              onToggle={(id) => toggleId("companyIds", id)}
              onCreate={handleCreateCompany}
              isCreating={createCompany.isPending}
            />
          </CardContent>
        </Card>

        {/* ---------- Signature (middle column, top) ---------- */}
        <Card className="gap-4 py-4 lg:min-h-0 lg:overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Function signature</CardTitle>
            <CardDescription>
              Starter code and the judging harness are generated from this.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="functionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Function name</FormLabel>
                    <FormControl>
                      <Input placeholder="twoSum" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full font-mono text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-none">
                        {CANONICAL_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="font-mono text-xs">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel>Parameters (in order)</FormLabel>
              {params.fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`params.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="nums" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`params.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-44">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full font-mono text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-none">
                            {CANONICAL_TYPES.map((type) => (
                              <SelectItem
                                key={type}
                                value={type}
                                className="font-mono text-xs"
                              >
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove parameter"
                    disabled={params.fields.length === 1}
                    onClick={() => params.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => params.append({ name: "", type: "int" })}
              >
                <Plus className="size-4" /> Add parameter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Test cases (right column, top) ---------- */}
        <Card className="gap-4 py-4 lg:min-h-0 lg:overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Test cases</CardTitle>
            <CardDescription>
              Values are JSON: <code>[2,7,11,15]</code>, <code>9</code>,{" "}
              <code>&quot;abc&quot;</code>, <code>true</code>. Sample cases are shown
              on the problem page and used by Run.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {testCases.fields.map((field, caseIndex) => (
              <div key={field.id} className="space-y-3 rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Case {caseIndex + 1}</p>
                  <div className="flex items-center gap-3">
                    <FormField
                      control={form.control}
                      name={`testCases.${caseIndex}.isSample`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormLabel className="text-xs font-normal text-muted-foreground">
                            Sample
                          </FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove test case"
                      disabled={testCases.fields.length === 1}
                      onClick={() => testCases.remove(caseIndex)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {watchedParams.map((param, paramIndex) => (
                  <FormField
                    key={paramIndex}
                    control={form.control}
                    name={`testCases.${caseIndex}.inputs.${paramIndex}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs">
                          {param.name || `param ${paramIndex + 1}`}: {param.type}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="font-mono text-xs"
                            placeholder={param.type.includes("[]") ? "[1,2,3]" : "1"}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name={`testCases.${caseIndex}.expectedOutput`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs">expected output</FormLabel>
                      <FormControl>
                        <Input className="font-mono text-xs" placeholder="[0,1]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`testCases.${caseIndex}.explanation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Explanation (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Because nums[0] + nums[1] == 9…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => testCases.append(EMPTY_TEST_CASE)}
            >
              <Plus className="size-4" /> Add test case
            </Button>
          </CardContent>
        </Card>

        {/* ---------- Hints (middle column, bottom) ---------- */}
        <Card className="gap-4 py-4 lg:max-h-72 lg:min-h-0 lg:overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Hints (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {hints.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`hints.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Hint ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove hint"
                  onClick={() => hints.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => hints.append({ value: "" })}
            >
              <Plus className="size-4" /> Add hint
            </Button>
          </CardContent>
        </Card>

        {/* ---------- Limits & publish (right column, bottom) ---------- */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <CardTitle className="text-base">Limits &amp; publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="timeLimitMs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time limit (ms)</FormLabel>
                    <FormControl>
                      <Input placeholder="2000" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormDescription>Empty = default 2000.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memoryLimitKb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory limit (KB)</FormLabel>
                    <FormControl>
                      <Input placeholder="256000" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormDescription>Empty = default 256000.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-3">
                  <div>
                    <FormLabel>Publish immediately</FormLabel>
                    <FormDescription>
                      Unpublished problems are hidden from the problem list.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createProblem.isPending}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {createProblem.isPending ? "Creating…" : "Create problem"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
