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

  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState<Record<string, any>>({});

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [category, setCategory] = useState("Other");

  useEffect(() => {
    async function loadSubscription() {
      setLoading(true);
      setError("");

      try {
        const nextDebug: Record<string, any> = {
          params,
          extractedId: id,
        };

        if (!id) {
          nextDebug.step = "no-id";
          setDebug(nextDebug);
          throw new Error("Geen geldig abonnement ID in de URL");
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        nextDebug.user = user ?? null;
        nextDebug.userError = userError?.message ?? null;

        if (userError) {
          setDebug(nextDebug);
          throw new Error(`Auth fout: ${userError.message}`);
        }

        if (!user) {
          setDebug(nextDebug);
          throw new Error("Niet ingelogd");
        }

        const { data, error: subError } = await supabase
          .from("subscriptions")
          .select("id, user_id, name, price, billing_cycle, category")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        nextDebug.queryResult = data ?? null;
        nextDebug.queryError = subError?.message ?? null;

        setDebug(nextDebug);

        if (subError) {
          throw new Error(`Supabase fout: ${subError.message}`);
        }

        const sub = data as Subscription;

        setName(sub.name ?? "");
        setPrice(sub.price != null ? String(sub.price) : "");
        setBillingCycle(sub.billing_cycle ?? "monthly");
        setCategory(sub.category ?? "Other");
      } catch (err: any) {
        setError(err?.message ?? "Abonnement laden mislukt");
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [id, params]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!id) {
        throw new Error("Geen geldig abonnement ID");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Auth fout: ${userError.message}`);
      }

      if (!user) {
        throw new Error("Niet ingelogd");
      }

      const parsedPrice = Number(price.replace(",", "."));

      if (!name.trim()) {
        throw new Error("Naam is verplicht");
      }

      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Voer een geldige prijs in");
      }

      const { data, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          name: name.trim(),
          price: parsedPrice,
          billing_cycle: billingCycle,
          category,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (!data || data.length === 0) {
        throw new Error("Geen abonnement bijgewerkt");
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
        Abonnement bewerken
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Pas je abonnement aan en sla je wijzigingen op
      </p>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
        <div><strong>URL id:</strong> {id || "(leeg)"}</div>
        <div><strong>Name state:</strong> {name || "(leeg)"}</div>
        <div><strong>Price state:</strong> {price || "(leeg)"}</div>
      </div>

      {Object.keys(debug).length > 0 && (
        <pre className="mt-4 overflow-auto rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
          {JSON.stringify(debug, null, 2)}
        </pre>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Abonnement laden...</p>
        </div>
      ) : (
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
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="Bijv. 13,99"
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
              onClick={() => router.replace("/dashboard")}
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
      )}
    </main>
  );
}