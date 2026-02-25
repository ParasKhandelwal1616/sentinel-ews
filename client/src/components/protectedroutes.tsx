"use client";
import { useAuth} from "../context/Auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse text-xl font-bold text-red-600">Verifying Sentinel Access...</div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}