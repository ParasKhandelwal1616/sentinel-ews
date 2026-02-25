"use client";
import { useState } from "react";
import { useAuth } from "@/src/context/Auth";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth(); // We will add register to useAuth in a second

  const handleGoogleLogin = () => {
    // Logic: Redirect to your backend Google Auth route
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Register function from hook:", register); // Should NOT be undefined
  try {
    console.log("Sending data to backend...");
    await register(formData);
    console.log("Success!");
  } catch (err: any) {
    console.log("Catch block triggered:", err);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">JOIN <span className="text-red-600">SENTINEL</span></h1>
          <p className="mt-2 text-slate-400">Create your operator account</p>
        </div>

        {/* GOOGLE BUTTON */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition mb-6"
        >
          <img src="https://www.svgrepo.com/show/355037/google-icon.svg" className="w-5 h-5" alt="G" />
          Continue with Google
        </button>

        <div className="relative mb-6 text-center">
          <span className="bg-slate-900 px-4 text-slate-500 text-sm uppercase">Or manual entry</span>
          <div className="absolute inset-y-1/2 w-full border-t border-slate-800 -z-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Full Name" required
            className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="email" placeholder="Email Address" required
            className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password" placeholder="Create Password" required
            className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className="w-full rounded-lg bg-red-600 py-3 font-bold text-white hover:bg-red-700 transition">
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-red-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}