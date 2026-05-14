import { NextResponse } from "next/server";

import {
  captureSiteLead,
  siteLeadCaptureSchema,
} from "@/features/site/server/site-lead-capture";
import {
  RecaptchaVerificationError,
  verifyRecaptchaToken,
} from "@/features/site/server/recaptcha";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Não foi possível ler a solicitação.", ok: false },
      { status: 400 },
    );
  }

  const parsed = siteLeadCaptureSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Revise os dados do agendamento.",
        ok: false,
      },
      { status: 422 },
    );
  }

  try {
    await verifyRecaptchaToken({
      action: parsed.data.source === "site_whatsapp" ? "SITE_WHATSAPP" : "SITE_APPOINTMENT",
      request,
      token: parsed.data.recaptchaToken,
    });
    await captureSiteLead(parsed.data);

    return NextResponse.json({
      message:
        parsed.data.source === "site_whatsapp"
          ? "Contato recebido."
          : "Solicitação de agendamento recebida.",
      ok: true,
    });
  } catch (error) {
    if (error instanceof RecaptchaVerificationError) {
      return NextResponse.json(
        {
          message: "Não foi possível validar o envio. Tente novamente.",
          ok: false,
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        message: "Não foi possível salvar sua solicitação. Tente novamente.",
        ok: false,
      },
      { status: 500 },
    );
  }
}
