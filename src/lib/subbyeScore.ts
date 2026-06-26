export type SubByeScoreResult = {
  score: number;
  level: string;
  emoji: string;
  message: string;
  positives: string[];
  improvements: string[];
};

type SubscriptionForScore = {
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category?: string;
};

function getMonthlyPrice(item: SubscriptionForScore) {
  return item.billing_cycle === "monthly"
    ? Number(item.price)
    : Number(item.price) / 12;
}

export function calculateSubByeScore(
  subscriptions: SubscriptionForScore[]
): SubByeScoreResult {
  let score = 100;
  const positives: string[] = [];
  const improvements: string[] = [];

  const monthlyTotal = subscriptions.reduce(
    (sum, item) => sum + getMonthlyPrice(item),
    0
  );

  const expensiveSubscriptions = subscriptions.filter(
    (item) => getMonthlyPrice(item) > 20
  );

  const streamingCount = subscriptions.filter(
    (item) => (item.category ?? "").toLowerCase() === "streaming"
  ).length;

  if (subscriptions.length <= 5) {
    positives.push("Je houdt je abonnementen overzichtelijk");
  } else {
    score -= Math.min((subscriptions.length - 5) * 4, 20);
    improvements.push("Je hebt relatief veel abonnementen actief");
  }

  if (monthlyTotal <= 50) {
    positives.push("Je maandelijkse kosten blijven netjes onder controle");
  } else {
    score -= Math.min(Math.round((monthlyTotal - 50) / 5), 20);
    improvements.push(`Je betaalt ongeveer €${monthlyTotal.toFixed(2)} per maand`);
  }

  if (expensiveSubscriptions.length === 0) {
    positives.push("Je hebt geen abonnementen boven €20 per maand");
  } else {
    score -= Math.min(expensiveSubscriptions.length * 6, 18);
    improvements.push(
      `${expensiveSubscriptions.length} abonnement(en) kosten meer dan €20 per maand`
    );
  }

  if (streamingCount <= 2) {
    positives.push("Je hebt niet te veel streamingdiensten tegelijk");
  } else {
    score -= Math.min((streamingCount - 2) * 5, 15);
    improvements.push(`Je hebt ${streamingCount} streamingdiensten tegelijk`);
  }

  score = Math.max(0, Math.min(100, score));

  let level = "Starter";
  let emoji = "🥉";
  let message = "Er is nog veel ruimte om abonnementen slimmer te beheren.";

  if (score >= 90) {
    level = "SubBye Legend";
    emoji = "💎";
    message = "Je abonnementen zijn uitstekend onder controle.";
  } else if (score >= 75) {
    level = "Budget Master";
    emoji = "🥇";
    message = "Je bent goed bezig met je abonnementen.";
  } else if (score >= 60) {
    level = "Slimme Bespaarder";
    emoji = "🥈";
    message = "Je hebt al goed overzicht, maar er liggen nog kansen.";
  } else if (score >= 40) {
    level = "Starter";
    emoji = "🥉";
    message = "Een snelle check kan waarschijnlijk geld besparen.";
  } else {
    level = "Opruimmodus";
    emoji = "🧹";
    message = "Er liggen duidelijke bespaarkansen klaar.";
  }

  return {
    score,
    level,
    emoji,
    message,
    positives: positives.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
}