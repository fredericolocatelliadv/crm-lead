"use client";

import { ErrorState } from "@/shared/components/crm/page-state";

export default function CrmError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
