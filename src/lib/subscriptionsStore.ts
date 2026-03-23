export type BillingCycle = "monthly" | "yearly";

export type Subscription = {
  id: string;
  name: string;
  price: number; // in euros
  billingCycle: BillingCycle;
  createdAt: string;
};

const KEY = "subbye.subscriptions.v1";

export function loadSubscriptions(): Subscription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveSubscriptions(items: Subscription[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addSubscription(input: Omit<Subscription, "id" | "createdAt">) {
  const current = loadSubscriptions();
  const next: Subscription = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  const updated = [next, ...current];
  saveSubscriptions(updated);
  return next;
}

export function deleteSubscription(id: string) {
  const current = loadSubscriptions();
  const updated = current.filter((s) => s.id !== id);
  saveSubscriptions(updated);
  return updated;
}

export function totals(items: Subscription[]) {
  const monthly = items.reduce((sum, s) => {
    const m = s.billingCycle === "monthly" ? s.price : s.price / 12;
    return sum + m;
  }, 0);
  return {
    monthly,
    yearly: monthly * 12,
  };
}