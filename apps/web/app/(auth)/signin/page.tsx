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

const signInSchema = z.object({
  email: z.string().min(1, "This field is required.").email("Enter a valid e-mail."),
  password: z.string().min(1, "This field is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

const inputClass =
  "h-11 rounded-md border-transparent bg-neutral-100 text-neutral-800 placeholder:text-neutral-400 focus-visible:border-neutral-300 focus-visible:bg-white focus-visible:ring-0";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Unable to sign in. Please try again.");
      return;
    }
    toast.success("Signed in");
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="Username or E-mail"
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
                      autoComplete="current-password"
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
              Sign In
            </Button>
          </form>
        </Form>

        <div className="flex items-center justify-between text-[13px] text-neutral-500">
          <button type="button" className="hover:text-neutral-800">
            Forgot Password?
          </button>
          <Link href="/signup" className="hover:text-neutral-800">
            Sign Up
          </Link>
        </div>

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
