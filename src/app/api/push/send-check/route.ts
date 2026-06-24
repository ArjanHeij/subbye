import { NextResponse } from "next/server";
import { firebaseMessaging } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const token = "eggcrYLPQ8i16rkpLZEfPL:APA91bHEzeL3i8POlfy2UbbL765xGNhYQkvfMpWEn_WzNZBMo-_Xxui_CZuuipZB9-arZu47SFbP-Fo44UCew6CoXvKZ7kGMCVOYbvgVLwH19ZNe2LE8fhc";

    const messageId = await firebaseMessaging.send({
      token,
      notification: {
        title: "👀 Gebruik je al je abonnementen nog?",
        body: "Open SubBye en doe een snelle check.",
      },
      data: {
        type: "subscription_check",
      },
    });

    return NextResponse.json({
      ok: true,
      messageId,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message,
      },
      { status: 500 }
    );
  }
}