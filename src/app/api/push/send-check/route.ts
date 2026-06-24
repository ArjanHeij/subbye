import { NextResponse } from "next/server";
import { firebaseMessaging } from "@/lib/firebaseAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
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

    const results = await Promise.allSettled(
      tokens.map((item) =>
        firebaseMessaging.send({
          token: item.token,
          notification: {
            title: "👀 Gebruik je al je abonnementen nog?",
            body: "Open SubBye en doe een snelle check.",
          },
          data: {
            type: "subscription_check",
          },
        })
      )
    );

    return NextResponse.json({
      ok: true,
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