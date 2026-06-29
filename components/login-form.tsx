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

  function submit() {
    const role = email.toLowerCase().includes("admin") ? "ADMIN" : "USER";
    localStorage.setItem(
      "sbc:user",
      JSON.stringify({
        name: name || (role === "ADMIN" ? "Salzburg Admin" : "Demo Player"),
        email: email || "player@example.com",
        role
      })
    );
    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <div className="surface mx-auto max-w-xl rounded-lg p-6">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/5 p-1">
        <button
          className={`rounded-md px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-turf text-pitch" : "text-slate-300"}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-bold ${mode === "register" ? "bg-turf text-pitch" : "text-slate-300"}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {mode === "register" ? (
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-300">Name</span>
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>
        ) : null}
        <label>
          <span className="mb-2 block text-sm font-bold text-slate-300">Email</span>
          <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="player@example.com" type="email" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-slate-300">Password</span>
          <input className="field" placeholder="password123" type="password" />
        </label>
      </div>

      <Button className="mt-6 w-full" onClick={submit}>
        {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
        {mode === "login" ? "Continue" : "Create account"}
      </Button>
      <p className="mt-4 text-center text-sm text-slate-400">Use an email containing admin to enter the admin dashboard.</p>
    </div>
  );
}
