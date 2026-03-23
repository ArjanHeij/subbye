"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { subscriptionCatalog } from "@/lib/subscriptionCatalog";
import { getLogo } from "@/lib/getLogo";

type Suggestion = {
  name: string;
  price: number;
};

export default function AddSubscriptionPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [category, setCategory] = useState("Other");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const FREE_LIMIT = 5;

  useEffect(() => {
    async function loadPlanAndCount() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium")
          .eq("id", user.id)
          .single();

        setIsPremium(Boolean(profile?.is_premium));

        const { count } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        setSubscriptionCount(count ?? 0);
      } catch (err: any) {
        setError(err?.message ?? "Kon plan niet laden");
      }
    }

    loadPlanAndCount();
  }, []);

  function detectCategory(serviceName: string) {
    const n = serviceName.toLowerCase();

    if (
      n.includes("netflix") ||
      n.includes("disney") ||
      n.includes("hbo") ||
      n.includes("youtube") ||
      n.includes("amazon prime")
    ) {
      return "Streaming";
    }

    if (
      n.includes("spotify") ||
      n.includes("apple music") ||
      n.includes("audible")
    ) {
      return "Music";
    }

    if (n.includes("basic-fit") || n.includes("peloton")) {
      return "Fitness";
    }

    if (
      n.includes("adobe") ||
      n.includes("notion") ||
      n.includes("dropbox") ||
      n.includes("microsoft") ||
      n.includes("google one") ||
      n.includes("canva") ||
      n.includes("chatgpt") ||
      n.includes("midjourney")
    ) {
      return "Software";
    }

    return "Other";
  }

  function searchSubscriptions(value: string) {
    setName(value);
    setCategory(detectCategory(value));

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    const results = subscriptionCatalog.filter((sub: any) =>
      sub.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(results.slice(0, 5));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        throw new Error("Niet ingelogd");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();

      const premium = Boolean(profile?.is_premium);

      const { count } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const currentCount = count ?? 0;

      if (!premium && currentCount >= FREE_LIMIT) {
        throw new Error(
          `Free gebruikers kunnen maximaal ${FREE_LIMIT} abonnementen toevoegen. Upgrade naar Premium voor onbeperkt.`
        );
      }

      const { error } = await supabase.from("subscriptions").insert({
  user_id: user.id,
  name,
  price: Number(price),
  billing_cycle: billingCycle,
  category,
});

if (error) throw error;

// AI inzichten automatisch vernieuwen
await fetch("/api/ai/insights", {
  method: "POST",
});

router.push("/dashboard");
router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Opslaan mislukt");
      setLoading(false);
    }
  }

  const remaining = Math.max(FREE_LIMIT - subscriptionCount, 0);

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Nieuw abonnement</h1>
          <p className="mt-1 text-gray-500">Voeg een abonnement toe</p>
        </div>

        {isPremium ? (
          <div className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold">
            ⭐ Premium
          </div>
        ) : (
          <div className="rounded-full bg-black px-3 py-1 text-xs text-white">
            Free
          </div>
        )}
      </div>

      {!isPremium && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm font-semibold text-blue-700">
            Free plan
          </div>
          <div className="mt-1 text-sm text-blue-600">
            Je gebruikt {subscriptionCount}/{FREE_LIMIT} abonnementen.
          </div>
          <div className="mt-1 text-xs text-blue-600">
            Nog {remaining} over. Upgrade naar Premium voor onbeperkt.
          </div>

          <button
            onClick={() => router.push("/premium")}
            className="mt-3 rounded-xl bg-black px-4 py-2 text-sm text-white"
            type="button"
          >
            Upgrade naar Premium
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Naam</label>

          <input
            type="text"
            placeholder="Bijv. Netflix"
            value={name}
            onChange={(e) => searchSubscriptions(e.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
            required
          />

          {suggestions.length > 0 && (
            <div className="mt-2 rounded-xl border bg-white">
              {suggestions.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => {
                    setName(sub.name);
                    setPrice(String(sub.price));
                    setCategory(detectCategory(sub.name));
                    setSuggestions([]);
                  }}
                  className="flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-50"
                >
                  <img
                    src={getLogo(sub.name)}
                    className="h-6 w-6"
                    alt={sub.name}
                  />

                  <div className="flex-1 text-sm">{sub.name}</div>

                  <div className="text-xs text-gray-500">€{sub.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Prijs</label>

          <input
            type="number"
            step="0.01"
            placeholder="12.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Frequentie</label>

          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
          >
            <option value="monthly">Maandelijks</option>
            <option value="yearly">Jaarlijks</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Categorie</label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
          >
            <option value="Streaming">Streaming</option>
            <option value="Music">Music</option>
            <option value="Fitness">Fitness</option>
            <option value="Software">Software</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black p-3 text-white disabled:opacity-60"
        >
          {loading ? "Opslaan..." : "Abonnement toevoegen"}
        </button>
      </form>
    </main>
  );
}