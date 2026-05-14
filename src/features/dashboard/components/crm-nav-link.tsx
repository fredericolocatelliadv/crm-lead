"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  crmNavigation,
  isNavigationItemActive,
} from "@/features/dashboard/data/crm-navigation";
import { SheetClose } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

type CrmNavLinksProps = {
  closeOnSelect?: boolean;
};

export function CrmNavLinks({ closeOnSelect = false }: CrmNavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {crmNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = isNavigationItemActive(pathname, item.href);

        const link = (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );

        return closeOnSelect ? (
          <SheetClose key={item.href} asChild>
            {link}
          </SheetClose>
        ) : (
          link
        );
      })}
    </>
  );
}
