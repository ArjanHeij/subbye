"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditSubscriptionPage({ params }: any) {
  const router = useRouter();
  const id = params.id;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setName(data.name);
        setPrice(String(data.price));
        setBillingCycle(data.billing_cycle);
        setCategory(data.category ?? "Other");
      }

      setLoading(false);
    }

    loadSubscription();
  }, [id]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    await supabase
      .from("subscriptions")
      .update({
        name,
        price: Number(price),
        billing_cycle: billingCycle,
        category,
      })
      .eq("id", id);

    router.push("/dashboard");
  }

  if (loading) {
    return <main className="p-4">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Edit abonnement</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Naam</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Prijs</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
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

        <button className="w-full rounded-xl bg-black p-3 text-white">
          Opslaan
        </button>
      </form>
    </main>
  );
}