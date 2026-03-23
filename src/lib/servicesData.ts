export type ServiceGuide = {
  slug: string;
  name: string;
  category: "streaming" | "fitness" | "news" | "software" | "other";
  difficulty: 1 | 2 | 3 | 4 | 5;
  cancelUrl?: string;
  steps: string[];
  contactEmail?: string;
};

export const serviceGuides: ServiceGuide[] = [
  {
    slug: "netflix",
    name: "Netflix",
    category: "streaming",
    difficulty: 2,
    cancelUrl: "https://www.netflix.com/cancelplan",
    steps: [
      "Log in op Netflix.",
      "Ga naar Account.",
      "Klik op 'Abonnement opzeggen'.",
      "Bevestig de opzegging.",
      "Maak een screenshot van de bevestiging.",
    ],
  },
  {
    slug: "spotify",
    name: "Spotify",
    category: "streaming",
    difficulty: 2,
    cancelUrl: "https://www.spotify.com/account/subscription/",
    steps: [
      "Log in op je Spotify account in de browser.",
      "Ga naar 'Subscription' / 'Abonnement'.",
      "Klik 'Change plan' en scroll naar 'Cancel Premium'.",
      "Bevestig de opzegging.",
    ],
  },
  {
    slug: "basic-fit",
    name: "Basic-Fit",
    category: "fitness",
    difficulty: 4,
    steps: [
      "Check je contracttype en opzegtermijn.",
      "Ga naar je My Basic-Fit account (of app).",
      "Zoek 'Membership' / 'Lidmaatschap' instellingen.",
      "Volg de stappen om op te zeggen of neem contact op met support.",
      "Bewaar bevestiging en let op einddatum/termijn.",
    ],
    contactEmail: "service@basic-fit.com",
  },
];
export function findGuideSlugByName(name: string) {
  const normalized = name.trim().toLowerCase();

  const match = serviceGuides.find(
    (guide) =>
      guide.name.toLowerCase() === normalized ||
      normalized.includes(guide.name.toLowerCase()) ||
      guide.name.toLowerCase().includes(normalized)
  );

  return match?.slug ?? null;
}