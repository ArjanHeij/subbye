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

    const { data: subscriptions, error: subsError } = await supabase
      .from("subscriptions")
      .select("name, price, billing_cycle, category")
      .eq("user_id", user.id);

    if (subsError) {
      return Response.json({ error: subsError.message }, { status: 500 });
    }

    const { data: transactions, error: txError } = await supabase
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
      await supabase.from("ai_insights").upsert(
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
        const key = (sub.category || "Other").trim();
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const sortedByPrice = [...safeSubscriptions].sort(
      (a, b) => Number(b.price) - Number(a.price)
    );

    const mostExpensive = sortedByPrice.slice(0, 5);

    const prompt = `
Je bent een slimme Nederlandse abonnementen-assistent.

Geef maximaal 5 korte, concrete bespaarinzichten in het Nederlands.
Focus op:
- hoge maandelijkse kosten
- overlap tussen diensten
- meerdere abonnementen in dezelfde categorie
- opvallend dure abonnementen
- mogelijke jaarlijkse besparing
- opvallende patronen in transacties

Belangrijk:
- geef ALLEEN JSON terug
- geen markdown
- geen uitleg
- geen code fences
- elk inzicht moet 1 korte zin zijn

Gebruik exact dit format:
{
  "insights": [
    "Je geeft ongeveer €42 per maand uit aan streaming."
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
      temperature: 0.3,
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

    await supabase.from("ai_insights").upsert(
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