"use client";

import { useState } from "react";
import Link from "next/link";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Checkout mislukt");
      }

      if (!data?.url) {
        throw new Error("Geen checkout URL ontvangen");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message ?? "Er ging iets mis");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
        Upgrade naar Premium
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Ontgrendel alle slimme functies van SubBye en krijg meer grip op je abonnementen.
      </p>

      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">
          Wat je krijgt
        </div>

        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            ✅ Onbeperkt abonnementen toevoegen
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            🤖 AI bespaar inzichten
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            🔎 Slimmere detectie uit transacties
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            💌 AI hulp bij opzeggen
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-black p-5 text-white shadow-sm">
        <div className="text-sm text-white/70">Premium plan</div>

        <div className="mt-2 text-3xl font-semibold tracking-tight">
          €4,99
          <span className="ml-1 text-base font-medium text-white/70">/ maand</span>
        </div>

        <div className="mt-2 text-sm text-white/70">
          Elke maand opzegbaar
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={startCheckout}
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-medium text-black shadow-sm disabled:opacity-60"
        >
          {loading ? "Doorsturen..." : "Upgrade nu"}
        </button>
      </div>

      <Link
        href="/dashboard"
        className="mt-4 block text-center text-sm text-gray-500"
      >
        Terug naar dashboard
      </Link>
    </main>
  );
}