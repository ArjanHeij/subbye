import { supabase } from "@/lib/supabaseClient";

export type BillingCycle = "monthly" | "yearly";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  created_at: string;
};

export async function listSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SubscriptionRow[];
}

export async function createSubscription(input: {
  name: string;
  price: number;
  billing_cycle: BillingCycle;
}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user) throw new Error("Niet ingelogd");

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: session.user.id,
        name: input.name,
        price: input.price,
        billing_cycle: input.billing_cycle,
      },
    ])
    .select("*")
    .single();

  if (error) throw error;
  return data as SubscriptionRow;
}

export async function removeSubscription(id: string) {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);
  if (error) throw error;
}

export function totals(items: Array<{ price: number; billing_cycle: BillingCycle }>) {
  const monthly = items.reduce((sum, item) => {
    return sum + (item.billing_cycle === "monthly" ? item.price : item.price / 12);
  }, 0);

  return {
    monthly,
    yearly: monthly * 12,
  };
}