import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type DetectedSubscription = {
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: string;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export async function POST() {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!openaiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY ontbreekt" },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Supabase server keys ontbreken" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const client = new OpenAI({ apiKey: openaiKey });

    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers();

    if (usersError) {
      return Response.json({ error: usersError.message }, { status: 500 });
    }

    const user = users[0];

    if (!user) {
      return Response.json(
        { error: "Geen gebruiker gevonden" },
        { status: 400 }
      );
    }

    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("description, amount, transaction_date")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false });

    if (txError) {
      return Response.json({ error: txError.message }, { status: 500 });
    }

    if (!transactions || transactions.length === 0) {
      return Response.json(
        { error: "Geen transacties gevonden" },
        { status: 400 }
      );
    }

    const { data: existingSubscriptions, error: existingError } = await supabase
      .from("subscriptions")
      .select("name")
      .eq("user_id", user.id);

    if (existingError) {
      return Response.json({ error: existingError.message }, { status: 500 });
    }

    const existingNames = new Set(
      (existingSubscriptions ?? []).map((s) => normalizeName(s.name))
    );

    const prompt = `
Je krijgt banktransacties van één gebruiker.
Herken welke transacties waarschijnlijk abonnementen zijn.

Voorbeelden van echte abonnement-transacties:
- NETFLIX.COM
- SPOTIFY AB STOCKHOLM
- APPLE.COM/BILL
- GOOGLE *YOUTUBE
- AMAZON PRIME NL
- DISNEYPLUS
- BASIC-FIT
- ADOBE
- CHATGPT

Geef ALLEEN een JSON array terug in exact dit formaat:

[
  {
    "name": "Netflix",
    "price": 13.99,
    "billing_cycle": "monthly",
    "category": "Streaming"
  }
]

Regels:
- Alleen duidelijke abonnementen
- Gebruik een nette consumentennaam zoals "Netflix" of "Spotify"
- Gebruik alleen "monthly" of "yearly"
- category moet één van deze zijn:
  "Streaming", "Music", "Fitness", "Software", "Other"
- price moet positief zijn
- Geen duplicates
- Geen markdown
- Geen uitleg
- Geen \`\`\`

Transacties:
${JSON.stringify(transactions)}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    let text = completion.choices[0].message.content || "";
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let detected: DetectedSubscription[] = [];

    try {
      detected = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "AI output kon niet worden gelezen", raw: text },
        { status: 500 }
      );
    }

    const cleaned = detected.filter(
      (sub) =>
        sub &&
        typeof sub.name === "string" &&
        typeof sub.price === "number" &&
        Number.isFinite(sub.price) &&
        sub.price > 0 &&
        (sub.billing_cycle === "monthly" || sub.billing_cycle === "yearly") &&
        typeof sub.category === "string"
    );

    const seen = new Set<string>();
    const toInsert = cleaned.filter((sub) => {
      const normalized = normalizeName(sub.name);

      if (seen.has(normalized)) return false;
      if (existingNames.has(normalized)) return false;

      seen.add(normalized);
      return true;
    });

    if (toInsert.length === 0) {
      return Response.json({
        success: true,
        added: 0,
        subscriptions: [],
      });
    }

    const rows = toInsert.map((sub) => ({
      user_id: user.id,
      name: sub.name,
      price: sub.price,
      billing_cycle: sub.billing_cycle,
      category: sub.category || "Other",
    }));

    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert(rows);

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      added: rows.length,
      subscriptions: rows,
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "Detectie mislukt" },
      { status: 500 }
    );
  }
}