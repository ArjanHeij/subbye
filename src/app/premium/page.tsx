"use client";

import { useState } from "react";
import Link from "next/link";
import { Purchases } from "@revenuecat/purchases-capacitor";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    try {
      setLoading(true);
      setError("");

      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        throw new Error("Geen premium aanbod gevonden.");
      }

      const monthlyPackage =
        currentOffering.monthly ?? currentOffering.availablePackages[0];

      if (!monthlyPackage) {
        throw new Error("Geen abonnement gevonden.");
      }

      const purchaseResult = await Purchases.purchasePackage({
        aPackage: monthlyPackage,
      });

      const isPremium =
        purchaseResult.customerInfo.entitlements.active["premium"];

      if (isPremium) {
        window.location.href = "/dashboard";
        return;
      }

      throw new Error("Aankoop gelukt, maar Premium is nog niet actief.");
    } catch (err: any) {
      if (err?.userCancelled) {
        setError("");
      } else {
        setError(err?.message ?? "Er ging iets mis met upgraden.");
      }

      setLoading(false);
    }
  }

  async function restorePurchases() {
    try {
      setLoading(true);
      setError("");
const restoreResult = await Purchases.restorePurchases();

const isPremium =
  restoreResult.customerInfo.entitlements.active["premium"];

      if (isPremium) {
        window.location.href = "/dashboard";
        return;
      }

      throw new Error("Geen actieve Premium aankoop gevonden.");
    } catch (err: any) {
      setError(err?.message ?? "Herstellen mislukt.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
        Upgrade naar Premium
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Ontgrendel alle slimme functies van SubBye en krijg meer grip op je
        abonnementen.
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
          €3,99
          <span className="ml-1 text-base font-medium text-white/70">
            / maand
          </span>
        </div>

        <div className="mt-2 text-sm text-white/70">
          Betaling veilig via Google Play. Elke maand opzegbaar.
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
          {loading ? "Openen..." : "Upgrade via Google Play"}
        </button>

        <button
          onClick={restorePurchases}
          disabled={loading}
          className="mt-3 w-full rounded-2xl border border-white/20 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          Aankoop herstellen
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