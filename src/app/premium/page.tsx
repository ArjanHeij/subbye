"use client";

import Link from "next/link";

export default function PremiumPage() {
  return (
    <main className="mx-auto max-w-md p-4">

      <h1 className="text-2xl font-semibold">
        🚀 Upgrade naar Premium
      </h1>

      <p className="mt-1 text-gray-500">
        Haal alles uit SubBye en bespaar meer geld
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">

        <h2 className="text-lg font-semibold">
          Wat krijg je?
        </h2>

        <ul className="mt-4 space-y-3 text-sm text-gray-700">

          <li>✅ Onbeperkt abonnementen</li>
          <li>🤖 AI bespaar inzichten</li>
          <li>🔎 Automatische detectie</li>
          <li>💡 Slimme bespaar tips</li>

        </ul>

      </div>

      <div className="mt-6 rounded-2xl bg-black p-5 text-white text-center">

        <div className="text-sm text-white/70">
          Premium plan
        </div>

        <div className="mt-2 text-3xl font-bold">
          €4,99 / maand
        </div>

        <button
          onClick={async () => {
            const res = await fetch("/api/stripe/checkout", {
              method: "POST",
            });

            const data = await res.json();

            if (data.url) {
              window.location.href = data.url;
            }
          }}
          className="mt-5 w-full rounded-xl bg-white py-3 text-black font-medium"
        >
          Upgrade nu
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