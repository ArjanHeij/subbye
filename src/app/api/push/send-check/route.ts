import { NextResponse } from "next/server";
import { firebaseMessaging } from "@/lib/firebaseAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const messages = [
  {
    title: "👀 Gebruik je al je abonnementen nog?",
    body: "Open SubBye en doe een snelle check.",
  },
  {
    title: "💸 Tijd om geld te besparen",
    body: "Misschien betaal je voor iets dat je niet meer gebruikt.",
  },
  {
    title: "🤔 Welk abonnement mis je het minst?",
    body: "Dat is vaak de makkelijkste besparing.",
  },
  {
    title: "📊 Snelle abonnementen-check",
    body: "Bekijk waar je geld elke maand naartoe gaat.",
  },
  {
    title: "😅 Zit er iets tussen dat je vergeten bent?",
    body: "Open SubBye en loop je abonnementen kort na.",
  },
];

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    if (secret !== process.env.PUSH_API_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: tokens, error } = await supabaseAdmin
      .from("push_tokens")
      .select("token");

    if (error) {
      throw error;
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        ok: false,
        message: "Geen push tokens gevonden.",
      });
    }

    const notification = getRandomMessage();

    const results = await Promise.allSettled(
      tokens.map((item) =>
        firebaseMessaging.send({
          token: item.token,
          notification,
          data: {
            type: "subscription_check",
          },
        })
      )
    );

    return NextResponse.json({
      ok: true,
      notification,
      total: tokens.length,
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Push versturen mislukt.",
      },
      { status: 500 }
    );
  }
}