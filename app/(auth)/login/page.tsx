"use client";

import { useActionState } from "react";
import { loginAction } from "./login-action";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-[#0a0a23] p-6">
          <h1 className="text-2xl font-bold text-[#0a0a23] mb-6">Sign In</h1>
          {error && (
            <div className="bg-[#dc3545] text-white p-3 mb-4 text-sm">
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
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-[#6b7280]">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold underline hover:text-[#0a0a23]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
