"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listSubscriptions } from "@/lib/subscriptionsApi";
import { supabase } from "@/lib/supabaseClient";
import LogoImage from "@/components/LogoImage";

type Subscription = {
  id: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category?: string;
};

export default function DashboardPage() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState("");
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUpdatedAt, setAiUpdatedAt] = useState<string | null>(null);

  const FREE_LIMIT = 5;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const subs = await listSubscriptions();
        setItems(subs as Subscription[]);

        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_premium, plan")
            .eq("id", user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          setIsPremium(
            Boolean(profile?.is_premium) || profile?.plan === "premium"
          );
        }
      } catch (err: any) {
        setError(err?.message ?? "Dashboard laden mislukt");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (items.length > 0 && isPremium) {
      loadSavedAiInsights();
    }
  }, [items.length, isPremium]);

  const monthlyTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.billing_cycle === "monthly") {
        return sum + Number(item.price);
      }
      return sum + Number(item.price) / 12;
    }, 0);
  }, [items]);

  const yearlyTotal = monthlyTotal * 12;

  const chartData = useMemo(() => {
    const values = items.map((item) =>
      item.billing_cycle === "monthly"
        ? Number(item.price)
        : Number(item.price) / 12
    );

    const max = Math.max(...values, 1);

    return items.map((item) => {
      const monthlyValue =
        item.billing_cycle === "monthly"
          ? Number(item.price)
          : Number(item.price) / 12;

      return {
        id: item.id,
        name: item.name,
        value: monthlyValue,
        height: Math.max((monthlyValue / max) * 120, 16),
      };
    });
  }, [items]);

  const topSubscriptions = useMemo(() => {
    return [...items]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 3);
  }, [items]);

  const potentialSavingsMonthly = useMemo(() => {
    const sorted = [...items].sort((a, b) => Number(b.price) - Number(a.price));
    const topTwo = sorted.slice(0, 2);

    return topTwo.reduce((sum, item) => {
      if (item.billing_cycle === "monthly") {
        return sum + Number(item.price);
      }
      return sum + Number(item.price) / 12;
    }, 0);
  }, [items]);

  const potentialSavingsYearly = potentialSavingsMonthly * 12;

  const savingsCandidates = useMemo(() => {
    return [...items]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 2);
  }, [items]);

  const insights = useMemo(() => {
    const result: string[] = [];

    if (items.length === 0) return result;

    const expensive = items.filter((i) => Number(i.price) > 15);
    if (expensive.length > 0) {
      result.push(`Je hebt ${expensive.length} dure abonnement(en) boven €15`);
    }

    const hasSpotify = items.some((i) =>
      i.name.toLowerCase().includes("spotify")
    );
    const hasAppleMusic = items.some((i) =>
      i.name.toLowerCase().includes("apple music")
    );

    if (hasSpotify && hasAppleMusic) {
      result.push("Je hebt mogelijk dubbele muziek abonnementen");
    }

    const streamingCount = items.filter(
      (i) => (i.category ?? "").toLowerCase() === "streaming"
    ).length;

    if (streamingCount >= 2) {
      result.push(`Je hebt ${streamingCount} streaming abonnementen tegelijk`);
    }

    if (monthlyTotal > 50) {
      result.push(`Je geeft ongeveer €${monthlyTotal.toFixed(2)} per maand uit`);
    }

    return result;
  }, [items, monthlyTotal]);

  function formatDate(dateString: string | null) {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleString("nl-NL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadSavedAiInsights() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Niet ingelogd");
      }

      const res = await fetch("/api/ai/insights/read", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Opgeslagen inzichten laden mislukt");
      }

      setAiInsights(Array.isArray(data?.insights) ? data.insights : []);
      setAiUpdatedAt(data?.updated_at ?? null);
    } catch (err: any) {
      setError(err?.message ?? "Opgeslagen inzichten laden mislukt");
    }
  }

  async function loadAiInsights() {
    try {
      setAiLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Niet ingelogd");
      }

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "AI inzichten laden mislukt");
      }

      setAiInsights(Array.isArray(data?.insights) ? data.insights : []);
      setAiUpdatedAt(new Date().toISOString());
    } catch (err: any) {
      setError(err?.message ?? "AI inzichten laden mislukt");
    } finally {
      setAiLoading(false);
    }
  }

  async function deleteSubscription(id: string) {
    try {
      setError("");

      const res = await fetch("/api/subscriptions/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Verwijderen mislukt");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));

      if (isPremium) {
        await loadAiInsights();
      }
    } catch (err: any) {
      setError(err?.message ?? "Verwijderen mislukt");
    }
  }

  async function scanTransactions() {
    try {
      setScanLoading(true);
      setError("");

      const res = await fetch("/api/ai/detect-subscriptions", {
        method: "POST",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Scannen mislukt");
      }

      if (isPremium) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          await fetch("/api/ai/insights", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        }
      }

      window.location.reload();
    } catch (err: any) {
      setError(err?.message ?? "Scannen mislukt");
      setScanLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md p-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Dashboard laden...</p>
        </div>
      </main>
    );
  }

  const remainingFreeSlots = Math.max(FREE_LIMIT - items.length, 0);

  return (
    <main className="mx-auto max-w-md p-4 pb-32">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            💸 Je geeft €{monthlyTotal.toFixed(2)} / maand uit
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Dat is ongeveer €{yearlyTotal.toFixed(2)} per jaar aan abonnementen
          </p>
        </div>

        {isPremium ? (
          <div className="rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 px-3 py-1.5 text-xs font-semibold text-black shadow-sm">
            ✨ Premium
          </div>
        ) : (
          <Link
            href="/premium"
            className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Upgrade
          </Link>
        )}
      </div>

      <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
        {isPremium ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Premium actief
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Je hebt onbeperkte abonnementen en slimme AI-inzichten.
              </div>
            </div>

            <div className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800">
              Onbeperkt
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Free plan
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Je gebruikt {items.length}/{FREE_LIMIT} abonnementen
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Nog {remainingFreeSlots} plek(ken) beschikbaar
              </div>
            </div>

            <Link
              href="/premium"
              className="rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              Upgrade
            </Link>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-green-900">
                💸 Mogelijke besparing
              </h2>
              <div className="mt-2 text-4xl font-bold tracking-tight text-green-700">
                €{potentialSavingsMonthly.toFixed(2)}
                <span className="ml-1 text-base font-medium text-green-700">
                  / maand
                </span>
              </div>
              <div className="mt-1 text-sm text-green-700">
                ≈ €{potentialSavingsYearly.toFixed(2)} per jaar
              </div>
            </div>

            <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
              Grootste impact
            </div>
          </div>

          {savingsCandidates.length > 0 && (
            <div className="mt-4 space-y-2">
              {savingsCandidates.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <LogoImage
                      name={item.name}
                      className="h-8 w-8 rounded-lg"
                      alt={item.name}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.category ?? "Other"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-700">
                      €{Number(item.price).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-green-600/70">
                      {item.billing_cycle === "monthly" ? "per maand" : "per jaar"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(insights.length > 0 || aiInsights.length > 0) && (
        <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                💡 Slimme inzichten
              </h2>

              {aiUpdatedAt && (
                <div className="mt-1 text-xs text-gray-500">
                  Laatste update: {formatDate(aiUpdatedAt)}
                </div>
              )}
            </div>

            {isPremium ? (
              <button
                onClick={loadAiInsights}
                disabled={aiLoading}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                {aiLoading ? "Laden..." : "Ververs"}
              </button>
            ) : (
              <Link
                href="/premium"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 transition hover:bg-gray-50"
              >
                AI = Premium
              </Link>
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            {insights.map((insight, index) => (
              <div
                key={`basic-${index}`}
                className="rounded-2xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
              >
                💡 {insight}
              </div>
            ))}

            {aiInsights.map((insight, index) => (
              <div
                key={`ai-${index}`}
                className="rounded-2xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
              >
                ✨ {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-black p-5 text-white shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="text-xs uppercase tracking-wide text-white/70">
            Totale kosten
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight">
            €{monthlyTotal.toFixed(2)}
          </div>

          <div className="mt-1 text-sm text-white/70">
            ≈ €{yearlyTotal.toFixed(2)} per jaar
          </div>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="text-xs uppercase tracking-wide text-green-700">
            Abonnementen
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight text-green-700">
            {items.length}
          </div>

          <div className="mt-1 text-sm text-green-700/80">
            Actieve diensten
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Monthly spending
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Je duurste abonnementen in beeld
            </p>
          </div>

          <div className="text-sm font-medium text-gray-700">
            €{monthlyTotal.toFixed(2)}
          </div>
        </div>

        <div className="mt-5 flex h-36 items-end gap-3 overflow-x-auto pb-1">
          {chartData.length === 0 ? (
            <div className="text-sm text-gray-500">Nog geen data.</div>
          ) : (
            chartData.map((item) => (
              <div
                key={item.id}
                className="flex min-w-[56px] flex-col items-center"
              >
                <div className="mb-2 text-xs text-gray-500">
                  €{item.value.toFixed(0)}
                </div>

                <div
                  className="w-10 rounded-t-2xl bg-black transition-all duration-200"
                  style={{ height: `${item.height}px` }}
                />

                <div className="mt-2 text-center text-[11px] text-gray-500">
                  {item.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Top 3 duurste abonnementen
          </h2>
          <span className="text-xs text-gray-500">Meeste impact</span>
        </div>

        {topSubscriptions.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Nog geen abonnementen.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {topSubscriptions.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 transition hover:bg-gray-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  {index + 1}
                </div>

                <LogoImage
                  name={item.name}
                  className="h-8 w-8 rounded-md"
                  alt={item.name}
                />

                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.category ?? "Other"}
                  </div>
                </div>

                <div className="text-sm font-semibold text-gray-900">
                  €{Number(item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/import"
          className="rounded-2xl border border-gray-200 bg-white p-3 text-center text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
        >
          ⬆ CSV import
        </Link>

        <button
          onClick={scanTransactions}
          disabled={scanLoading}
          className="rounded-2xl bg-black p-3 text-sm font-medium text-white shadow-sm transition hover:opacity-95 hover:shadow-md disabled:opacity-60"
        >
          {scanLoading ? "Scannen..." : "🔎 Scan transacties"}
        </button>
      </div>

      <div className="mt-5">
        {items.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="text-4xl">🚀</div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Welkom bij SubBye
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Laten we beginnen met het inzicht krijgen in je abonnementen
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  1
                </div>
                <div className="text-sm text-gray-700">
                  Voeg handmatig een abonnement toe
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  2
                </div>
                <div className="text-sm text-gray-700">
                  Of importeer je transacties (sneller)
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/add"
                className="rounded-2xl bg-black py-3 text-center text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              >
                ➕ Start met abonnement toevoegen
              </Link>

              <Link
                href="/import"
                className="rounded-2xl border border-gray-200 bg-white py-3 text-center text-sm font-medium text-gray-900 transition hover:bg-gray-50"
              >
                ⬆ Import transacties
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <LogoImage
                      name={item.name}
                      className="h-10 w-10 rounded-xl"
                      alt={item.name}
                    />

                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {item.category ?? "Other"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-semibold text-gray-900">
                      €{Number(item.price).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.billing_cycle === "monthly" ? "/ maand" : "/ jaar"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/cancel/${encodeURIComponent(item.name)}`}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                  >
                    Cancel
                  </Link>

                  <Link
                    href={`/edit/${item.id}`}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    ✏ Edit
                  </Link>

                  <button
                    onClick={() => deleteSubscription(item.id)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/add"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
      >
        <span className="text-lg leading-none">+</span>
        <span>Toevoegen</span>
      </Link>
    </main>
  );
}