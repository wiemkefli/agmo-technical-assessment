"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import type { Role } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();
  const [primaryField, setPrimaryField] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("applicant");
  const [clientError, setClientError] = useState<string | null>(null);

  const passwordMismatch =
    passwordConfirmation.trim().length > 0 && password !== passwordConfirmation;

  const validate = (): string | null => {
    const trimmedPrimary = primaryField.trim();
    if (trimmedPrimary.length < 2) {
      return selectedRole === "employer"
        ? "Company name must be at least 2 characters."
        : "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      return "Email is required.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password !== passwordConfirmation) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setClientError(null);

    const validationError = validate();
    if (validationError) {
      setClientError(validationError);
      return;
    }

    try {
      const trimmedPrimary = primaryField.trim();
      await register({
        name: trimmedPrimary,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: selectedRole,
      });
      const currentRole = useAuthStore.getState().role;
      router.push(currentRole === "employer" ? "/employer/jobs" : "/jobs");
    } catch {
      // store error already set
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-7 text-zinc-900 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Register</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4">
          Login
        </Link>
      </p>
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {clientError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {clientError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div>
          <label className="text-sm font-medium text-zinc-800">Role</label>
          <select
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={selectedRole}
            onChange={(e) => {
              const nextRole = e.target.value as Role;
              setSelectedRole(nextRole);
            }}
          >
            <option value="applicant">Applicant</option>
            <option value="employer">Employer</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-800">
            {selectedRole === "employer" ? "Company name" : "Name"}
          </label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={primaryField}
            onChange={(e) => setPrimaryField(e.target.value)}
            placeholder={selectedRole === "employer" ? "Acme Inc." : "Jane Doe"}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-800">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-800">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-800">Confirm Password</label>
            <input
              type="password"
              className={[
                "mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
                passwordMismatch
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500/20",
              ].join(" ")}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
            {passwordMismatch && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
            )}
          </div>
        </div>
        <button
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}
