"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          window.location.replace("/dashboard");
          return;
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        window.location.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function resetFeedback() {
    setErr(null);
    setMsg(null);
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
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
        setMsg("Check je e-mail voor de magic link.");
      }
    } catch (err: any) {
      setErr(err?.message ?? "Er ging iets mis");
    } finally {
      setLoadingMagic(false);
    }
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    setLoadingPassword(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErr(error.message);
      } else {
        window.location.replace("/dashboard");
      }
    } catch (err: any) {
      setErr(err?.message ?? "Login mislukt");
    } finally {
      setLoadingPassword(false);
    }
  }

  async function signUpWithPassword(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    setLoadingSignup(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErr(error.message);
      } else {
        setMsg(
          "Account aangemaakt. Je kunt nu inloggen met je wachtwoord of je e-mail controleren als bevestiging aan staat."
        );
        setMode("login");
      }
    } catch (err: any) {
      setErr(err?.message ?? "Account aanmaken mislukt");
    } finally {
      setLoadingSignup(false);
    }
  }

  async function resetPassword() {
    resetFeedback();

    if (!email.trim()) {
      setErr("Vul eerst je e-mailadres in.");
      return;
    }

    setLoadingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setErr(error.message);
      } else {
        setMsg("Wachtwoord reset link verstuurd naar je e-mail.");
      }
    } catch (err: any) {
      setErr(err?.message ?? "Reset mislukt");
    } finally {
      setLoadingReset(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="mx-auto max-w-md p-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Sessie controleren...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-950">
          {mode === "login" ? "Inloggen" : "Account aanmaken"}
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          {mode === "login"
            ? "Log in met magic link of met je e-mailadres en wachtwoord."
            : "Maak een account aan met je e-mailadres en wachtwoord."}
        </p>

        <div className="mt-5 flex rounded-2xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              resetFeedback();
              setMode("login");
            }}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-white text-gray-950 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Inloggen
          </button>

          <button
            type="button"
            onClick={() => {
              resetFeedback();
              setMode("signup");
            }}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-white text-gray-950 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Account maken
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none focus:border-black"
            placeholder="jij@email.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-2xl border border-gray-200 bg-white p-3 pr-24 outline-none focus:border-black"
              placeholder="Wachtwoord"
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
        </div>

        {mode === "login" ? (
          <>
            <form onSubmit={signInWithPassword} className="mt-4">
              <button
                disabled={loadingPassword || !email.trim() || !password.trim()}
                className="w-full rounded-2xl bg-black p-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {loadingPassword ? "Inloggen..." : "Login met wachtwoord"}
              </button>
            </form>

            <button
              type="button"
              onClick={resetPassword}
              disabled={loadingReset || !email.trim()}
              className="mt-3 text-sm font-medium text-gray-600 underline-offset-4 hover:underline disabled:opacity-60"
            >
              {loadingReset ? "Bezig..." : "Wachtwoord vergeten?"}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">OF</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={sendMagicLink}>
              <button
                disabled={loadingMagic || !email.trim()}
                className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-900 disabled:opacity-60"
              >
                {loadingMagic ? "Versturen..." : "Magic link sturen"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={signUpWithPassword} className="mt-4">
            <button
              disabled={loadingSignup || !email.trim() || !password.trim()}
              className="w-full rounded-2xl bg-black p-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loadingSignup ? "Account maken..." : "Account aanmaken"}
            </button>
          </form>
        )}

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

        <p className="mt-5 text-xs leading-6 text-gray-500">
          Zodra je bent ingelogd, onthoudt de app je sessie automatisch op je
          telefoon totdat je uitlogt.
        </p>
      </div>
    </main>
  );
}