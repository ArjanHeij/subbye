import { NextResponse } from "next/server";
import { firebaseMessaging } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token) {
      return NextResponse.json(
        { error: "Geen FCM-token meegestuurd." },
        { status: 400 }
      );
    }

    const messageId = await firebaseMessaging.send({
      token,
      notification: {
        title: "👀 Gebruik je je abonnementen nog?",
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
      { error: err?.message ?? "Push versturen mislukt." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Push endpoint werkt",
  });
}