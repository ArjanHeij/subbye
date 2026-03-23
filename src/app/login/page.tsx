"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      console.log("OTP RESULT", data, error);

      if (error) {
        alert(error.message);
        setErr(error.message);
      } else {
        alert("Magic link verstuurd");
        setMsg("Check je email voor de login link.");
      }
    } catch (err: any) {
      console.error("OTP CATCH ERROR", err);
      alert(err?.message ?? "Failed to fetch");
      setErr(err?.message ?? "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Inloggen</h1>
      <p className="mt-1 text-gray-600">Ontvang een magic link via email.</p>

      <form onSubmit={sendMagicLink} className="mt-4 space-y-3">
        <input
          className="w-full rounded-xl border bg-white p-3"
          placeholder="jij@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {msg}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black p-3 text-white disabled:opacity-60"
          type="submit"
        >
          {loading ? "Versturen..." : "Stuur magic link"}
        </button>
      </form>
    </main>
  );
}