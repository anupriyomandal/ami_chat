"use client";

import { useActionState } from "react";
import { signupAction } from "./signup-action";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function SignupPage() {
  const [error, formAction, isPending] = useActionState(async (prev: string | null, formData: FormData) => {
    const result = await signupAction(formData);
    return result?.error ?? null;
  }, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f8] p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="px-2.5 py-1 rounded-lg bg-[#0a0a23] text-white text-lg font-black tracking-tight">AMI</div>
          <span className="text-xl font-bold text-[#0a0a23]">Chat</span>
        </div>
        <div className="bg-white border border-[#e4e4e7] rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-[#0a0a23] mb-6">Create Account</h1>
          {error && (
            <div className="bg-red-50 text-[#dc3545] border border-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0a0a23] mb-1">
                Email
              </label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0a0a23] mb-1">
                Password
              </label>
              <Input id="password" name="password" type="password" required placeholder="Min 8 characters" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#0a0a23] mb-1">
                Confirm Password
              </label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="Repeat password" />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-[#6b7280]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold underline hover:text-[#0a0a23]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
