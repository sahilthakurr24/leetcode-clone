"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { authClient } from "~/lib/auth-client";
import { LeetCodeLogo } from "~/components/leetcode-logo";
import { SocialButtons } from "~/components/auth/social-buttons";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(50, "Username is too long."),
  email: z.string().min(1, "This field is required.").email("Enter a valid e-mail."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignUpValues = z.infer<typeof signUpSchema>;

const inputClass =
  "h-11 rounded-md border-transparent bg-neutral-100 text-neutral-800 placeholder:text-neutral-400 focus-visible:border-neutral-300 focus-visible:bg-white focus-visible:ring-0";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  async function onSubmit(values: SignUpValues) {
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      // `name` is required by better-auth; LeetCode signup has no full name,
      // so we seed it from the username.
      name: values.username,
      username: values.username,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Unable to sign up. Please try again.");
      return;
    }
    toast.success("Account created");
    router.push("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-[400px] rounded-lg border-neutral-200 bg-white shadow-sm">
      <CardContent className="flex flex-col gap-6 px-8 py-9">
        <div className="flex justify-center">
          <LeetCodeLogo />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      autoComplete="username"
                      placeholder="Username"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="E-mail Address"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Password"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-md bg-[#2db55d] text-[15px] font-medium text-white hover:bg-[#28a651]"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>

        <p className="text-center text-[13px] text-neutral-500">
          Have an account?{" "}
          <Link href="/signin" className="text-neutral-700 hover:text-neutral-900">
            Sign In
          </Link>
        </p>

        <div className="relative flex items-center justify-center">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-neutral-200" />
          <span className="relative bg-white px-3 text-[13px] text-neutral-400">
            or
          </span>
        </div>

        <SocialButtons />
      </CardContent>
    </Card>
  );
}
