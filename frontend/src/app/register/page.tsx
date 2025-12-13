"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import type { Role } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("applicant");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register({
        name,
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
      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div>
          <label className="text-sm font-medium text-zinc-800">Name</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-800">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-800">Role</label>
          <select
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
          >
            <option value="applicant">Applicant</option>
            <option value="employer">Employer</option>
          </select>
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
