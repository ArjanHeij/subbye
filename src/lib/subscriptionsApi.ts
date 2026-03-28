import { supabase } from "@/lib/supabaseClient";

export type BillingCycle = "monthly" | "yearly";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  category?: string | null;
  created_at: string;
};

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Niet ingelogd");

  return user;
}

export async function listSubscriptions() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SubscriptionRow[];
}

export async function getSubscriptionById(id: string) {
  const user = await requireUser();

  if (!id) {
    throw new Error("Geen abonnement ID ontvangen");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data as SubscriptionRow;
}

export async function createSubscription(input: {
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  category?: string | null;
}) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: user.id,
        name: input.name,
        price: input.price,
        billing_cycle: input.billing_cycle,
        category: input.category ?? "Other",
      },
    ])
    .select("*")
    .single();

  if (error) throw error;
  return data as SubscriptionRow;
}

export async function updateSubscription(
  id: string,
  input: {
    name: string;
    price: number;
    billing_cycle: BillingCycle;
    category?: string | null;
  }
) {
  const user = await requireUser();

  if (!id) {
    throw new Error("Geen abonnement ID ontvangen");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      name: input.name,
      price: input.price,
      billing_cycle: input.billing_cycle,
      category: input.category ?? "Other",
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as SubscriptionRow;
}

export async function removeSubscription(id: string) {
  const user = await requireUser();

  if (!id) {
    throw new Error("Geen abonnement ID ontvangen");
  }

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export function totals(
  items: Array<{ price: number; billing_cycle: BillingCycle }>
) {
  const monthly = items.reduce((sum, item) => {
    return sum + (item.billing_cycle === "monthly" ? item.price : item.price / 12);
  }, 0);

  return {
    monthly,
    yearly: monthly * 12,
  };
}