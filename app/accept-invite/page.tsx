"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";

/**
 * Where an invite link (from POST /carriers/{id}/invite on the admin side)
 * lands: ?token=... in the URL. Deliberately outside the (app) route group
 * — there's no session yet at this point, so the auth-guarded layout would
 * just bounce here to /login.
 */
function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { setSession } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { access_token } = await api.acceptInvite(token, password);
      await setSession(access_token);
      router.push("/loads");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        This invite link is missing its token. Ask for a fresh invite link.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-card">
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      )}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Choose a password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Setting up your account…" : "Activate my account"}
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-900">
            <span className="text-lg font-bold text-brand-500">R</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Welcome to Recon</h1>
          <p className="text-sm text-gray-500">Set a password to activate your carrier account</p>
        </div>
        <Suspense fallback={null}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
