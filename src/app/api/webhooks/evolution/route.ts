import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { processEvolutionWebhook } from "@/features/whatsapp/server/evolution-webhook";
import { createAdminClient } from "@/server/supabase/admin";

export const runtime = "nodejs";

function isValidSecret(received: string | null) {
  const expected = process.env.EVOLUTION_WEBHOOK_SECRET?.trim();

  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const receivedSecret = request.headers.get("x-webhook-secret") ?? url.searchParams.get("secret");

  if (!isValidSecret(receivedSecret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await processEvolutionWebhook(createAdminClient(), payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
