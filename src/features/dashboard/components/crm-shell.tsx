"use client";

import Link from "next/link";
import { LogOut, PanelLeft } from "lucide-react";

import { signOut } from "@/features/auth/actions";
import { CrmNavLinks } from "@/features/dashboard/components/crm-nav-link";
import { CrmPageHeading } from "@/features/dashboard/components/crm-page-heading";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";

function SidebarContent({ closeOnSelect = false }: { closeOnSelect?: boolean }) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-16 items-center px-5">
        <Link href="/crm" className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-foreground">CRM Jurídico</span>
          <span className="text-xs text-muted-foreground">Frederico & Locatelli</span>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3">
        <CrmNavLinks closeOnSelect={closeOnSelect} />
      </nav>

      <div className="border-t p-4">
        <form action={signOut}>
          <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}

export function CrmShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-background lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-72">
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

          <ThemeToggle />
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
