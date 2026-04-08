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

  const streamingCount = useMemo(() => {
    return items.filter(
      (i) => (i.category ?? "").toLowerCase() === "streaming"
    ).length;
  }, [items]);

  const softwareCount = useMemo(() => {
    return items.filter(
      (i) => (i.category ?? "").toLowerCase() === "software"
    ).length;
  }, [items]);

  const expensiveCount = useMemo(() => {
    return items.filter((i) => {
      const monthlyValue =
        i.billing_cycle === "monthly"
          ? Number(i.price)
          : Number(i.price) / 12;

      return monthlyValue > 15;
    }).length;
  }, [items]);

  const quickInsights = useMemo(() => {
    const result: string[] = [];

    if (items.length === 0) return result;

    if (streamingCount >= 2) {
      result.push(`Je hebt ${streamingCount} streamingdiensten tegelijk`);
    }

    if (softwareCount >= 2) {
      result.push(`Je betaalt voor ${softwareCount} software abonnementen`);
    }

    if (expensiveCount > 0) {
      result.push(`Je hebt ${expensiveCount} abonnement(en) boven €15 per maand`);
    }

    if (monthlyTotal > 50) {
      result.push(`Je vaste lasten via abonnementen zijn €${monthlyTotal.toFixed(2)} per maand`);
    }

    if (topSubscriptions[0]) {
      result.push(
        `${topSubscriptions[0].name} is nu je duurste abonnement`
      );
    }

    return result.slice(0, 4);
  }, [items, streamingCount, softwareCount, expensiveCount, monthlyTotal, topSubscriptions]);

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
          <div className="text-sm font-medium text-gray-500">SubBye</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            Je geeft €{monthlyTotal.toFixed(2)} per maand uit
          </h1>
          <p className="mt-2 text-sm text-gray-500">
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

      <div className="mt-5 rounded-[28px] bg-black p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/60">
              Potentiële besparing
            </div>
            <div className="mt-2 text-4xl font-bold tracking-tight">
              €{potentialSavingsMonthly.toFixed(2)}
              <span className="ml-1 text-base font-medium text-white/80">
                / maand
              </span>
            </div>
            <div className="mt-1 text-sm text-white/70">
              ≈ €{potentialSavingsYearly.toFixed(2)} per jaar
            </div>
          </div>

          <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            Grootste kans
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={scanTransactions}
            disabled={scanLoading}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-95 disabled:opacity-60"
          >
            {scanLoading ? "Bezig..." : "🔎 Vind abonnementen"}
          </button>

          <Link
            href="/add"
            className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/5"
          >
            + Voeg abonnement toe
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        {isPremium ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Premium actief
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Onbeperkte abonnementen en AI-inzichten zonder limiet.
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

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {quickInsights.length > 0 && (
        <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                💡 Direct gezien
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Snel overzicht van je grootste aandachtspunten
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {quickInsights.map((insight, index) => (
              <div
                key={`quick-${index}`}
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {(aiInsights.length > 0 || items.length > 0) && (
        <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                ✨ Slimme inzichten
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Door AI gegenereerde suggesties op basis van jouw data
              </p>

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
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, index) => (
                <div
                  key={`ai-${index}`}
                  className="rounded-2xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
                >
                  {insight}
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Nog geen AI-inzichten beschikbaar. Klik op verversen om ze te genereren.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
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

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Jaarlijks
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            €{yearlyTotal.toFixed(0)}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            Totale vaste kosten
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Je duurste abonnementen
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Hier zit meestal de grootste besparing
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

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Grootste kostenposten
          </h2>
          <span className="text-xs text-gray-500">Top 3</span>
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
          ⬆ Importeer transacties
        </Link>

        <Link
          href="/add"
          className="rounded-2xl bg-black p-3 text-center text-sm font-medium text-white shadow-sm transition hover:opacity-95 hover:shadow-md"
        >
          + Bespaar geld
        </Link>
      </div>

      <div className="mt-5">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="text-4xl">💸</div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Stop met geld verliezen aan abonnementen
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Voeg je eerste abonnement toe of scan je transacties en ontdek direct
                hoeveel je maandelijks uitgeeft.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  1
                </div>
                <div className="text-sm text-gray-700">
                  Voeg 1 abonnement toe en zie meteen je maandtotaal
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  2
                </div>
                <div className="text-sm text-gray-700">
                  Of laat SubBye automatisch abonnementen vinden
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/add"
                className="rounded-2xl bg-black py-3 text-center text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              >
                + Voeg eerste abonnement toe
              </Link>

              <button
                onClick={scanTransactions}
                disabled={scanLoading}
                className="rounded-2xl border border-gray-200 bg-white py-3 text-center text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
              >
                {scanLoading ? "Bezig..." : "🔎 Vind abonnementen"}
              </button>
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