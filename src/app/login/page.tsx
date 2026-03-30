"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [loadingMagic, setLoadingMagic] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // 🔹 MAGIC LINK
  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoadingMagic(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErr(error.message);
      } else {
        setMsg("Check je email voor de login link.");
      }
    } catch (err: any) {
      setErr(err?.message ?? "Er ging iets mis");
    } finally {
      setLoadingMagic(false);
    }
  }

  // 🔹 PASSWORD LOGIN (voor Play Store)
  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoadingPassword(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErr(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setErr(err?.message ?? "Login mislukt");
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Inloggen</h1>
      <p className="mt-1 text-gray-600">
        Log in met magic link of wachtwoord
      </p>

      {/* 🔹 MAGIC LINK */}
      <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="jij@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          disabled={loadingMagic}
          className="w-full rounded-xl bg-black p-3 text-white disabled:opacity-60"
        >
          {loadingMagic ? "Versturen..." : "Magic link sturen"}
        </button>
      </form>

      {/* 🔹 Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OF</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* 🔹 PASSWORD LOGIN */}
      <form onSubmit={signInWithPassword} className="space-y-3">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded-xl border p-3"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loadingPassword}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 font-medium text-gray-900 disabled:opacity-60"
        >
          {loadingPassword ? "Inloggen..." : "Login met wachtwoord"}
        </button>
      </form>

      {/* 🔹 Feedback */}
      {err && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {err}
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-600">
          {msg}
        </div>
      )}
    </main>
  );
}