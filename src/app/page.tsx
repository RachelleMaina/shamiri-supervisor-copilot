"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.user.role === "supervisor") {
            router.push("/dashboard");
          }
        },
        onError: (err) => {
          setError(
            err.message || "Login failed. Please check your credentials."
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
  <div className="w-full max-w-md">
 
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-slate-200">
      
 
      <div className="text-center space-y-4">
        <img
          className="mx-auto h-10 w-auto"
          src="https://cdn.prod.website-files.com/69117576ff647ba59211038a/691c1682c21941c34ac32501_One%20Shamiri%20Wordmark%20-%20Color%20Version-p-2000.png"
          alt="Shamiri"
        />

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">
            Supervisor Login
          </h2>
         
        </div>
      </div>

  
      <form className="space-y-5" onSubmit={handleSubmit}>
        
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

      
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-4 rounded-md bg-primary text-white text-sm font-medium py-2.5 hover:bg-primary transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>

   
      </form>
    </div>
  </div>
</div>

  );
}
