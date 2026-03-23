import type { BillingCycle } from "@/lib/subscriptionsApi";

export type CatalogItem = {
  name: string;
  slug?: string;
  price: number;
  billingCycle: BillingCycle;
  category: string;
  logo: string;
};

export const subscriptionCatalog: CatalogItem[] = [
  {
    name: "Netflix",
    slug: "netflix",
    price: 13.99,
    billingCycle: "monthly",
    category: "Streaming",
    logo: "🎬",
  },
  {
    name: "Spotify",
    slug: "spotify",
    price: 10.99,
    billingCycle: "monthly",
    category: "Music",
    logo: "🎵",
  },
  {
    name: "Basic-Fit",
    slug: "basic-fit",
    price: 24.99,
    billingCycle: "monthly",
    category: "Fitness",
    logo: "🏋️",
  },
  {
    name: "Disney+",
    price: 10.99,
    billingCycle: "monthly",
    category: "Streaming",
    logo: "✨",
  },
  {
    name: "YouTube Premium",
    price: 13.99,
    billingCycle: "monthly",
    category: "Video",
    logo: "▶️",
  },
  {
    name: "Amazon Prime",
    price: 4.99,
    billingCycle: "monthly",
    category: "Shopping",
    logo: "📦",
  },
  {
    name: "Adobe Creative Cloud",
    price: 66.49,
    billingCycle: "monthly",
    category: "Software",
    logo: "🎨",
  },
  {
    name: "Microsoft 365",
    price: 99.0,
    billingCycle: "yearly",
    category: "Software",
    logo: "💼",
  },
];

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return [];

  return subscriptionCatalog
    .filter((item) => {
      const name = item.name.toLowerCase();
      return name.includes(normalized) || normalized.includes(name);
    })
    .slice(0, 5);
}

export function findCatalogItemByName(name: string) {
  const normalized = name.trim().toLowerCase();

  return (
    subscriptionCatalog.find(
      (item) =>
        item.name.toLowerCase() === normalized ||
        normalized.includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(normalized)
    ) ?? null
  );
}