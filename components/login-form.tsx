"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/button";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setError("");
    setIsSubmitting(true);

    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password })
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    localStorage.setItem("sbc:user", JSON.stringify(data.user));
    router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <div className="surface mx-auto max-w-xl rounded-lg p-6">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/5 p-1">
        <button className={`rounded-md px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-turf text-pitch" : "text-slate-300"}`} onClick={() => setMode("login")}>Login</button>
        <button className={`rounded-md px-4 py-2 text-sm font-bold ${mode === "register" ? "bg-turf text-pitch" : "text-slate-300"}`} onClick={() => setMode("register")}>Register</button>
      </div>
      <div className="mt-6 space-y-4">
        {mode === "register" ? <label><span className="mb-2 block text-sm font-bold text-slate-300">Name</span><input className="field" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label> : null}
        <label><span className="mb-2 block text-sm font-bold text-slate-300">Email</span><input className="field" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="player@example.com" type="email" /></label>
        <label><span className="mb-2 block text-sm font-bold text-slate-300">Password</span><input className="field" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password123" type="password" /></label>
      </div>
      {error ? <p className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
      <Button className="mt-6 w-full" onClick={submit} disabled={isSubmitting}>{mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}{isSubmitting ? "Please wait..." : mode === "login" ? "Continue" : "Create account"}</Button>
      <p className="mt-4 text-center text-sm text-slate-400">Accounts will save to the live database once DATABASE_URL is connected in Vercel.</p>
    </div>
  );
}
