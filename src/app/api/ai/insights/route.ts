import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type SubscriptionRow = {
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category?: string | null;
};

type TransactionRow = {
  description: string;
  amount: number;
  transaction_date?: string | null;
};

function normalizeCategory(value?: string | null) {
  return (value || "Other").trim();
}

export async function POST(req: Request) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!openaiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY ontbreekt" },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return Response.json(
        { error: "Supabase keys ontbreken" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return Response.json(
        { error: "Geen authorisatie token ontvangen" },
        { status: 401 }
      );
    }

    const authSupabase = createClient(supabaseUrl, anonKey);
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
    const client = new OpenAI({ apiKey: openaiKey });

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json(
        { error: userError?.message ?? "Ongeldige gebruiker" },
        { status: 401 }
      );
    }

    const { data: subscriptions, error: subsError } = await adminSupabase
      .from("subscriptions")
      .select("name, price, billing_cycle, category")
      .eq("user_id", user.id);

    if (subsError) {
      return Response.json({ error: subsError.message }, { status: 500 });
    }

    const { data: transactions, error: txError } = await adminSupabase
      .from("transactions")
      .select("description, amount, transaction_date")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .limit(40);

    if (txError) {
      return Response.json({ error: txError.message }, { status: 500 });
    }

    const safeSubscriptions = (subscriptions ?? []) as SubscriptionRow[];
    const safeTransactions = (transactions ?? []) as TransactionRow[];

    if (safeSubscriptions.length === 0) {
      await adminSupabase.from("ai_insights").upsert(
        {
          user_id: user.id,
          insights: [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      return Response.json({
        success: true,
        insights: [],
      });
    }

    const monthlyTotal = safeSubscriptions.reduce((sum, sub) => {
      if (sub.billing_cycle === "monthly") return sum + Number(sub.price);
      return sum + Number(sub.price) / 12;
    }, 0);

    const yearlyTotal = monthlyTotal * 12;

    const categoryCounts = safeSubscriptions.reduce<Record<string, number>>(
      (acc, sub) => {
        const key = normalizeCategory(sub.category);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const sortedByMonthlyPrice = [...safeSubscriptions].sort((a, b) => {
      const aMonthly =
        a.billing_cycle === "monthly" ? Number(a.price) : Number(a.price) / 12;
      const bMonthly =
        b.billing_cycle === "monthly" ? Number(b.price) : Number(b.price) / 12;
      return bMonthly - aMonthly;
    });

    const mostExpensive = sortedByMonthlyPrice.slice(0, 5).map((sub) => ({
      ...sub,
      monthly_equivalent:
        sub.billing_cycle === "monthly"
          ? Number(sub.price)
          : Number(sub.price) / 12,
    }));

    const prompt = `
Je bent een slimme Nederlandse abonnementen-assistent.

Gebruik UITSLUITEND de meegegeven data.
Verzin NOOIT diensten, bedragen, categorieën of patronen die niet expliciet in de data staan.
Noem NOOIT voorbeelden zoals Ziggo, Spotify of andere merknamen tenzij ze echt in de data voorkomen.

Geef maximaal 5 korte, concrete inzichten in het Nederlands.

Regels:
- Geef ALLEEN geldige JSON terug
- Geen markdown
- Geen uitleg
- Geen code fences
- Elk inzicht moet 1 korte zin zijn
- Gebruik alleen feiten uit de data hieronder
- Als er 2 of meer abonnementen in dezelfde categorie zitten, mag je dat benoemen
- Als er geen overlap is, benoem dat alleen als het echt uit de data volgt
- Gebruik maandbedragen op basis van monthly_equivalent waar relevant

Gebruik exact dit format:
{
  "insights": [
    "Je hebt 2 streamingdiensten tegelijk."
  ]
}

Samenvatting:
- maandtotaal: €${monthlyTotal.toFixed(2)}
- jaartotaal: €${yearlyTotal.toFixed(2)}

Categorie aantallen:
${JSON.stringify(categoryCounts)}

Duurste abonnementen:
${JSON.stringify(mostExpensive)}

Alle abonnementen:
${JSON.stringify(safeSubscriptions)}

Recente transacties:
${JSON.stringify(safeTransactions)}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    let text = completion.choices[0].message.content || "";
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: { insights: string[] };

    try {
      parsed = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "AI output was geen geldige JSON", raw: text },
        { status: 500 }
      );
    }

    const cleanedInsights = Array.isArray(parsed.insights)
      ? parsed.insights
          .filter((x) => typeof x === "string" && x.trim().length > 0)
          .slice(0, 5)
      : [];

    await adminSupabase.from("ai_insights").upsert(
      {
        user_id: user.id,
        insights: cleanedInsights,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return Response.json({
      success: true,
      insights: cleanedInsights,
      meta: {
        monthlyTotal,
        yearlyTotal,
        categoryCounts,
      },
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "AI inzichten mislukt" },
      { status: 500 }
    );
  }
}