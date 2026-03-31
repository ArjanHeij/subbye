import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY ontbreekt" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const serviceName =
      typeof body?.serviceName === "string" ? body.serviceName.trim() : "";

    if (!serviceName) {
      return Response.json(
        { error: "Missing serviceName" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: openaiKey });

    const prompt = `
Je bent een Nederlandse assistent die een korte, nette opzegmail schrijft.

Schrijf een zakelijke maar vriendelijke opzegmail voor dit abonnement:
${serviceName}

Regels:
- Schrijf in het Nederlands
- Houd het kort en duidelijk
- Vermeld dat de gebruiker het abonnement wil opzeggen
- Vraag om een bevestiging van de opzegging
- Verzin geen klantnummers of persoonlijke gegevens
- Geef ALLEEN geldige JSON terug
- Geen markdown
- Geen code fences
- Geen uitleg

Gebruik exact dit format:
{
  "subject": "Opzegging van ${serviceName}",
  "body": "Beste heer/mevrouw,\\n\\nHierbij wil ik mijn abonnement op ${serviceName} opzeggen. Ik ontvang graag een bevestiging van de opzegging.\\n\\nMet vriendelijke groet,"
}
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

    let parsed: { subject?: string; body?: string };

    try {
      parsed = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "AI output was geen geldige JSON", raw: text },
        { status: 500 }
      );
    }

    const subject =
      typeof parsed.subject === "string" ? parsed.subject.trim() : "";
    const emailBody =
      typeof parsed.body === "string" ? parsed.body.trim() : "";

    if (!subject || !emailBody) {
      return Response.json(
        { error: "AI output mist subject of body" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      subject,
      body: emailBody,
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "Cancel email generatie mislukt" },
      { status: 500 }
    );
  }
}