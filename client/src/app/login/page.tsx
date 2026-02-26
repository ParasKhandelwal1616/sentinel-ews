"use client";
import { useState } from "react";
import { useAuth } from "@/src/context/Auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err:any) {
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    }
  };
  const handleGoogleLogin = () => {
  // Direct browser redirect to the backend OAuth trigger
  window.location.href = "http://localhost:5000/api/auth/google";
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-tight">SENTINEL</h1>
          <p className="mt-2 text-slate-400">Early Warning System Dashboard</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              placeholder="paras@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 py-3 font-bold text-white hover:bg-red-700 transition-all active:scale-[0.98]"
          >
            Authenticate
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New volunteer?{" "}
          <Link href="/register" className="text-red-500 hover:underline">
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
}