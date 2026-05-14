"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { captureMarketingAttribution } from "@/features/site/lib/marketing-attribution";

export function MarketingAttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/crm")) return;

    captureMarketingAttribution();
  }, [pathname]);

  return null;
}
