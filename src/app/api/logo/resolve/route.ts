import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { normalizeLogoName } from "@/lib/getLogo";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY ontbreekt");
  }

  return new OpenAI({ apiKey });
}

function guessKnownDomain(name: string) {
  const n = normalizeLogoName(name);

  const known: Record<string, string> = {
    netflix: "netflix.com",
    spotify: "spotify.com",
    "disney plus": "disneyplus.com",
    disney: "disneyplus.com",
    youtube: "youtube.com",
    "youtube premium": "youtube.com",
    amazon: "amazon.com",
    "amazon prime": "primevideo.com",
    "prime video": "primevideo.com",
    hbo: "hbo.com",
    "hbo max": "max.com",
    max: "max.com",
    notion: "notion.so",
    adobe: "adobe.com",
    "apple music": "music.apple.com",
    "apple tv": "tv.apple.com",
    apple: "apple.com",
    "basic fit": "basic-fit.com",
    basicfit: "basic-fit.com",
    canva: "canva.com",
    dropbox: "dropbox.com",
    google: "google.com",
    microsoft: "microsoft.com",
    soundcloud: "soundcloud.com",
    steam: "steampowered.com",
    xbox: "xbox.com",
    playstation: "playstation.com",
    chatgpt: "openai.com",
  };

  if (known[n]) {
    return known[n];
  }

  for (const [key, domain] of Object.entries(known)) {
    if (n.includes(key)) {
      return domain;
    }
  }

  return null;
}

async function detectDomainWithAI(name: string) {
  const client = getOpenAIClient();

  const prompt = `
Je krijgt de naam van een consumentenmerk of abonnement.
Geef alleen het meest waarschijnlijke officiële hoofddomein terug.
Geen uitleg, geen markdown, alleen het domein.

Voorbeelden:
Netflix -> netflix.com
Disney+ -> disneyplus.com
Spotify AB Stockholm -> spotify.com
ChatGPT -> openai.com

Naam:
${name}
`.trim();

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const domain =
    response.choices[0]?.message?.content?.trim().toLowerCase() || "";

  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return null;
  }

  return domain;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawName = String(body?.name ?? "").trim();

    if (!rawName) {
      return NextResponse.json({ error: "Naam ontbreekt" }, { status: 400 });
    }

    const normalizedName = normalizeLogoName(rawName);

    const { data: cached, error: cacheError } = await supabase
      .from("logo_cache")
      .select("domain")
      .eq("normalized_name", normalizedName)
      .maybeSingle();

    if (cacheError) {
      return NextResponse.json({ error: cacheError.message }, { status: 500 });
    }

    if (cached?.domain) {
      return NextResponse.json({ domain: cached.domain, source: "cache" });
    }

    let domain = guessKnownDomain(rawName);

    if (!domain) {
      domain = await detectDomainWithAI(rawName);
    }

    await supabase.from("logo_cache").upsert(
      {
        normalized_name: normalizedName,
        domain,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "normalized_name" }
    );

    return NextResponse.json({
      domain: domain ?? null,
      source: domain ? "detected" : "fallback",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Logo detectie mislukt" },
      { status: 500 }
    );
  }
}