"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { subscriptionCatalog } from "@/lib/subscriptionCatalog";
import LogoImage from "@/components/LogoImage";

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
    }

    loadPlanAndCount();
  }, []);

  function detectCategory(serviceName: string) {
    const n = serviceName.toLowerCase();

    if (n.includes("netflix") || n.includes("disney") || n.includes("hbo") || n.includes("youtube"))
      return "Streaming";

    if (n.includes("spotify") || n.includes("apple music"))
      return "Music";

    if (n.includes("basic-fit")) return "Fitness";

    if (n.includes("adobe") || n.includes("notion") || n.includes("chatgpt"))
      return "Software";

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
      if (!user) throw new Error("Niet ingelogd");

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

      if (!premium && (count ?? 0) >= FREE_LIMIT) {
        throw new Error(`Max ${FREE_LIMIT} abonnementen op Free plan`);
      }

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        name,
        price: Number(price),
        billing_cycle: billingCycle,
        category,
      });

      if (error) throw error;

      await fetch("/api/ai/insights", { method: "POST" });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Opslaan mislukt");
      setLoading(false);
    }
  }

  const remaining = Math.max(FREE_LIMIT - subscriptionCount, 0);

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <h1 className="text-2xl font-semibold">Nieuw abonnement</h1>

      {!isPremium && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm font-semibold text-blue-700">
            {subscriptionCount}/{FREE_LIMIT} gebruikt
          </div>
          <div className="text-xs text-blue-600">
            Nog {remaining} beschikbaar
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* NAME */}
        <div>
          <label className="text-sm font-medium">Naam</label>

          <input
            value={name}
            onChange={(e) => searchSubscriptions(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
            placeholder="Netflix, Spotify..."
          />

          {suggestions.length > 0 && (
            <div className="mt-2 rounded-2xl border bg-white shadow-sm">
              {suggestions.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => {
                    setName(sub.name);
                    setPrice(String(sub.price));
                    setCategory(detectCategory(sub.name));
                    setSuggestions([]);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <LogoImage
                    name={sub.name}
                    className="h-7 w-7 rounded-md"
                  />

                  <div className="flex-1 text-sm font-medium">
                    {sub.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    €{sub.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRICE */}
        <div>
          <label className="text-sm font-medium">Prijs</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </div>

        {/* BILLING */}
        <div>
          <label className="text-sm font-medium">Frequentie</label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          >
            <option value="monthly">Maandelijks</option>
            <option value="yearly">Jaarlijks</option>
          </select>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="text-sm font-medium">Categorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          >
            <option value="Streaming">Streaming</option>
            <option value="Music">Music</option>
            <option value="Fitness">Fitness</option>
            <option value="Software">Software</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-black py-3 text-white"
        >
          {loading ? "Opslaan..." : "Toevoegen"}
        </button>
      </form>
    </main>
  );
}