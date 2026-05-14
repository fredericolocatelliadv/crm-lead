"use client";

import { usePathname } from "next/navigation";

import { getNavigationItem } from "@/features/dashboard/data/crm-navigation";

export function CrmPageHeading() {
  const pathname = usePathname();
  const current = getNavigationItem(pathname);

  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-base font-semibold leading-tight text-foreground sm:text-lg">
        {current.label}
      </p>
    </div>
  );
}
