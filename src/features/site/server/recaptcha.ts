import "server-only";

import type { RecaptchaAction } from "@/features/site/lib/recaptcha";

type RecaptchaAssessmentResponse = {
  riskAnalysis?: {
    score?: number;
  };
  tokenProperties?: {
    action?: string;
    valid?: boolean;
  };
};

export class RecaptchaVerificationError extends Error {
  constructor(message = "Falha na validação de segurança.") {
    super(message);
    this.name = "RecaptchaVerificationError";
  }
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return forwardedFor?.split(",")[0]?.trim() ?? null;
}

function getMinimumScore() {
  const raw = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

  return Number.isFinite(raw) ? raw : 0.5;
}

function assertConfig() {
  const apiKey = process.env.RECAPTCHA_API_KEY?.trim();
  const projectId = process.env.RECAPTCHA_PROJECT_ID?.trim();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();

  if (!apiKey || !projectId || !siteKey) {
    throw new RecaptchaVerificationError("reCAPTCHA não configurado.");
  }

  return { apiKey, projectId, siteKey };
}

export async function verifyRecaptchaToken(params: {
  action: RecaptchaAction;
  request: Request;
  token: string | null | undefined;
}) {
  if (!params.token) {
    throw new RecaptchaVerificationError();
  }

  const { apiKey, projectId, siteKey } = assertConfig();
  const response = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments?key=${encodeURIComponent(apiKey)}`,
    {
      body: JSON.stringify({
        event: {
          expectedAction: params.action,
          siteKey,
          token: params.token,
          userAgent: params.request.headers.get("user-agent") ?? undefined,
          userIpAddress: getClientIp(params.request) ?? undefined,
        },
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new RecaptchaVerificationError();
  }

  const assessment = (await response.json()) as RecaptchaAssessmentResponse;
  const valid = assessment.tokenProperties?.valid === true;
  const actionMatches = assessment.tokenProperties?.action === params.action;
  const score = assessment.riskAnalysis?.score ?? 0;

  if (!valid || !actionMatches || score < getMinimumScore()) {
    throw new RecaptchaVerificationError();
  }
}
