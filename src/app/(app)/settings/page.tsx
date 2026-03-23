"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const router = useRouter();

  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
          router.replace("/login");
          return;
        }

        setEmail(user.email ?? "");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_premium, plan")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        const premium =
          Boolean(profile?.is_premium) || profile?.plan === "premium";

        setIsPremium(premium);
      } catch (err: any) {
        setError(err?.message ?? "Settings laden mislukt");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-28">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Beheer je account en voorkeuren
          </p>
        </div>

        {isPremium ? (
          <div className="rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800">
            ⭐ Premium
          </div>
        ) : (
          <Link
            href="/premium"
            className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm"
          >
            Upgrade
          </Link>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-400">
          Account
        </div>

        <div className="mt-3">
          <div className="text-sm text-gray-500">Ingelogd als</div>
          <div className="mt-1 text-base font-medium text-gray-900">
            {email || "Geen e-mailadres gevonden"}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Plan status
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {isPremium
                ? "Je hebt toegang tot alle premium functies."
                : "Je gebruikt momenteel het free plan."}
            </div>
          </div>

          {isPremium ? (
            <div className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800">
              Onbeperkt
            </div>
          ) : (
            <Link
              href="/premium"
              className="rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm"
            >
              Upgrade
            </Link>
          )}
        </div>

        {!isPremium && (
          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <div className="text-sm font-medium text-gray-900">
              Ontgrendel Premium
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Krijg onbeperkt abonnementen, AI-inzichten en slimmere detectie.
            </div>

            <Link
              href="/premium"
              className="mt-4 inline-block rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900"
            >
              Bekijk Premium
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">
          Account & support
        </div>

        <div className="mt-4 space-y-3">
          <Link
            href="/privacy"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            <span>🔒 Privacybeleid</span>
            <span className="text-gray-400">›</span>
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            <span>📩 Contact</span>
            <span className="text-gray-400">›</span>
          </Link>

          {!isPremium && (
            <Link
              href="/premium"
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
            >
              <span>🚀 Upgrade naar Premium</span>
              <span className="text-gray-400">›</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-red-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">
          Gevaarzone
        </div>

        <div className="mt-1 text-sm text-gray-500">
          Log uit op dit apparaat.
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          Uitloggen
        </button>
      </div>
    </main>
  );
}