"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!password.trim() || !confirmPassword.trim()) {
      setErr("Vul je nieuwe wachtwoord twee keer in.");
      return;
    }

    if (password.length < 6) {
      setErr("Je wachtwoord moet minimaal 6 tekens lang zijn.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErr(error.message);
        return;
      }

      setMsg("Je wachtwoord is aangepast. Je kunt nu inloggen.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.replace("/login");
      }, 1500);
    } catch (error: any) {
      setErr(error?.message ?? "Wachtwoord aanpassen mislukt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-950">
          Nieuw wachtwoord instellen
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Kies hieronder een nieuw wachtwoord voor je SubBye-account.
        </p>

        <form onSubmit={updatePassword} className="mt-6 space-y-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-gray-200 bg-white p-3 pr-24 outline-none focus:border-black"
              placeholder="Nieuw wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-black"
            >
              {showPassword ? "Verberg" : "Toon"}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none focus:border-black"
            placeholder="Herhaal nieuw wachtwoord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            disabled={loading || !password.trim() || !confirmPassword.trim()}
            className="w-full rounded-2xl bg-black p-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Opslaan..." : "Wachtwoord opslaan"}
          </button>
        </form>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {msg && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}