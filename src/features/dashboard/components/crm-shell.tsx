"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { signOut } from "@/features/auth/actions";
import { CrmNavLinks } from "@/features/dashboard/components/crm-nav-link";
import { CrmPageHeading } from "@/features/dashboard/components/crm-page-heading";
import { ProfileMenu } from "@/features/profile/components/profile-menu";
import type { CurrentProfile } from "@/features/profile/types/profile";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

const SIDEBAR_STORAGE_KEY = "crm_sidebar_collapsed";

function SidebarContent({
  closeOnSelect = false,
  collapsed = false,
  onToggleCollapsed,
}: {
  closeOnSelect?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div
        className={cn(
          "relative flex h-16 items-center gap-2 px-4",
          collapsed ? "justify-center px-3" : "justify-between",
        )}
      >
        <Link
          href="/crm"
          aria-label={collapsed ? "CRM Jurídico" : undefined}
          title={collapsed ? "CRM Jurídico" : undefined}
          className={cn(
            "flex min-w-0 flex-col",
            collapsed && "h-10 w-10 items-center justify-center rounded-md border bg-card",
          )}
        >
          {collapsed ? (
            <span className="text-xs font-semibold tracking-widest text-foreground">CRM</span>
          ) : (
            <>
              <span className="text-sm font-semibold text-foreground">CRM Jurídico</span>
              <span className="text-xs text-muted-foreground">Frederico & Locatelli</span>
            </>
          )}
        </Link>

      </div>

      <Separator />

      <nav className={cn("flex-1 space-y-1 p-3", collapsed && "px-2")}>
        {onToggleCollapsed ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onToggleCollapsed}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "mb-2 hidden w-full justify-start text-muted-foreground lg:flex",
              collapsed && "h-11 justify-center px-0",
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            <span className={cn(collapsed && "sr-only")}>
              {collapsed ? "Expandir menu" : "Recolher menu"}
            </span>
          </Button>
        ) : null}
        <CrmNavLinks closeOnSelect={closeOnSelect} collapsed={collapsed} />
      </nav>

      <div className={cn("border-t p-4", collapsed && "px-2")}>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            title={collapsed ? "Sair" : undefined}
            aria-label={collapsed ? "Sair" : undefined}
            className={cn(
              "w-full justify-start text-muted-foreground",
              collapsed && "h-11 justify-center px-0",
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className={cn(collapsed && "sr-only")}>Sair</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

export function CrmShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: CurrentProfile;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r bg-background transition-[width] duration-200 lg:block",
          sidebarCollapsed ? "w-20" : "w-72",
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} onToggleCollapsed={toggleSidebar} />
      </aside>

      <div
        className={cn(
          "transition-[padding] duration-200",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72",
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu principal do CRM</SheetTitle>
              <SidebarContent closeOnSelect />
            </SheetContent>
          </Sheet>

          <CrmPageHeading />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu profile={profile} />
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
