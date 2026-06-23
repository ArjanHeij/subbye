import { NextResponse } from "next/server";
import { firebaseMessaging } from "@/lib/firebaseAdmin";

export async function GET() {
  return NextResponse.json({
    status: "send-check route werkt",
  });
}