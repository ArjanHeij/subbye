"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Subscription = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category?: string | null;
};

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [category, setCategory] = useState("Other");

  useEffect(() => {
    async function loadSubscription() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Niet ingelogd");
        }

        if (!id) {
          throw new Error("Geen abonnement ID gevonden");
        }

        const { data, error: subError } = await supabase
          .from("subscriptions")
          .select("id, user_id, name, price, billing_cycle, category")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (subError) {
          throw new Error(`Supabase fout: ${subError.message}`);
        }

        if (!data) {
          throw new Error(`Geen abonnement gevonden voor id: ${id}`);
        }

        const sub = data as Subscription;

        setName(sub.name ?? "");
        setPrice(String(sub.price ?? ""));
        setBillingCycle(sub.billing_cycle ?? "monthly");
        setCategory(sub.category ?? "Other");
      } catch (err: any) {
        setError(err?.message ?? "Abonnement laden mislukt");
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Niet ingelogd");
      }

      const parsedPrice = Number(price);

      if (!name.trim()) {
        throw new Error("Naam is verplicht");
      }

      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Voer een geldige prijs in");
      }

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          name: name.trim(),
          price: parsedPrice,
          billing_cycle: billingCycle,
          category,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
        Abonnement bewerken
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Pas je abonnement aan en sla je wijzigingen op
      </p>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="text-sm font-medium text-gray-900">Naam</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Bijv. Netflix"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Prijs</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Bijv. 9.99"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Frequentie</label>
          <select
            value={billingCycle}
            onChange={(e) =>
              setBillingCycle(e.target.value as "monthly" | "yearly")
            }
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="monthly">Maandelijks</option>
            <option value="yearly">Jaarlijks</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Categorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="Streaming">Streaming</option>
            <option value="Music">Music</option>
            <option value="Fitness">Fitness</option>
            <option value="Software">Software</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-900"
          >
            Annuleren
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-black py-3 text-sm font-medium text-white shadow-sm disabled:opacity-60"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </form>
    </main>
  );
}