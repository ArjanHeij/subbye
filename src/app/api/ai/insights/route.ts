import { NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY ontbreekt");
  }

  return new OpenAI({ apiKey: openaiKey });
}

export async function POST() {
  try {
    const client = getOpenAIClient();

    // jouw bestaande logica hier
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "AI insights mislukt" },
      { status: 500 }
    );
  }
}