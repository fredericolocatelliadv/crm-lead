"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { signOut } from "@/features/auth/actions";
import type { CurrentProfile } from "@/features/profile/types/profile";
import { roleLabels } from "@/features/users/types/roles";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

function getInitials(profile: CurrentProfile) {
  const source = profile.fullName || profile.email || "Usuário";
  const parts = source
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function ProfileMenu({ profile }: { profile: CurrentProfile }) {
  const displayName = profile.fullName || profile.email || "Usuário";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 px-2.5 sm:px-3"
          aria-label="Abrir perfil do usuário"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-7 w-7 rounded-full border object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {getInitials(profile)}
            </span>
          )}
          <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="block truncate">{displayName}</span>
          <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
            {profile.email || "E-mail não informado"}
          </span>
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {roleLabels[profile.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/crm/perfil">
            <UserRound className="h-4 w-4" />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
