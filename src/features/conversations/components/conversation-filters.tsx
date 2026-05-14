"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ConversationFilters } from "@/features/conversations/types/conversation";
import {
  conversationStatuses,
  conversationStatusLabels,
  priorityLabels,
} from "@/features/conversations/types/conversation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type ConversationFiltersProps = {
  filters: ConversationFilters;
};

export function ConversationFilters({ filters }: ConversationFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mine, setMine] = useState(filters.mine);
  const [priority, setPriority] = useState(filters.priority ?? "all");
  const [query, setQuery] = useState(filters.query ?? "");
  const [status, setStatus] = useState(filters.status ?? "all");
  const latestStateRef = useRef({
    mine: filters.mine,
    priority: filters.priority ?? "all",
    query: filters.query ?? "",
    status: filters.status ?? "all",
  });
  const latestNavigationRef = useRef({
    pathname,
    search: searchParams.toString(),
  });
  const mountedRef = useRef(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    syncingRef.current = true;
    latestStateRef.current = {
      mine: filters.mine,
      priority: filters.priority ?? "all",
      query: filters.query ?? "",
      status: filters.status ?? "all",
    };
    setMine(filters.mine);
    setPriority(filters.priority ?? "all");
    setQuery(filters.query ?? "");
    setStatus(filters.status ?? "all");

    const frame = window.requestAnimationFrame(() => {
      syncingRef.current = false;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [filters.mine, filters.priority, filters.query, filters.status]);

  useEffect(() => {
    latestStateRef.current = { mine, priority, query, status };
  }, [mine, priority, query, status]);

  useEffect(() => {
    latestNavigationRef.current = {
      pathname,
      search: searchParams.toString(),
    };
  }, [pathname, searchParams]);

  const replaceFilters = useCallback(
    (nextFilters: {
      mine?: boolean;
      priority?: string;
      query?: string;
      status?: string;
    }) => {
      const navigation = latestNavigationRef.current;
      const params = new URLSearchParams(navigation.search);
      const currentFilters = latestStateRef.current;
      const nextMine = nextFilters.mine ?? currentFilters.mine;
      const nextPriority = nextFilters.priority ?? currentFilters.priority;
      const nextQuery = nextFilters.query ?? currentFilters.query;
      const nextStatus = nextFilters.status ?? currentFilters.status;

      if (nextQuery.trim()) params.set("busca", nextQuery.trim());
      else params.delete("busca");

      if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
      else params.delete("status");

      if (nextPriority && nextPriority !== "all") params.set("prioridade", nextPriority);
      else params.delete("prioridade");

      if (nextMine) params.set("meus", "1");
      else params.delete("meus");

      const queryString = params.toString();
      const targetPath = navigation.pathname || "/crm/conversas";

      startTransition(() => {
        router.replace(queryString ? `${targetPath}?${queryString}` : targetPath, {
          scroll: false,
        });
      });
    },
    [router],
  );

  useEffect(() => {
    if (syncingRef.current) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      replaceFilters({ query });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [query, replaceFilters]);

  return (
    <div
      aria-busy={isPending}
      className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-2 xl:grid-cols-5"
    >
      <div className="md:col-span-2 xl:col-span-2">
        <label htmlFor="conversation-search" className="mb-2 block text-sm font-medium">
          Buscar
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="conversation-search"
            name="busca"
            placeholder="Nome, telefone, e-mail ou área"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <FilterSelect
        label="Status"
        name="status"
        value={status}
        onChange={(value) => {
          setStatus(value);
          replaceFilters({ status: value });
        }}
      >
        <option value="all">Todos</option>
        {conversationStatuses.map((item) => (
          <option key={item} value={item}>
            {conversationStatusLabels[item]}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Prioridade"
        name="prioridade"
        value={priority}
        onChange={(value) => {
          setPriority(value);
          replaceFilters({ priority: value });
        }}
      >
        <option value="all">Todas</option>
        <option value="high">{priorityLabels.high}</option>
        <option value="medium">{priorityLabels.medium}</option>
        <option value="low">{priorityLabels.low}</option>
      </FilterSelect>

      <div className="flex items-end">
        <label className="flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm shadow-sm">
          <input
            type="checkbox"
            name="meus"
            value="1"
            checked={mine}
            onChange={(event) => {
              const checked = event.target.checked;
              setMine(checked);
              replaceFilters({ mine: checked });
            }}
            className="h-4 w-4 rounded border-input"
          />
          Meus atendimentos
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-5">
        <Button type="button" variant="outline" asChild>
          <Link href="/crm/conversas">Limpar filtros</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/crm/conversas?status=unanswered">Não respondidas</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/crm/conversas?prioridade=high">Urgentes</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/crm/conversas?status=waiting_client">Aguardando cliente</Link>
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({
  children,
  label,
  name,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
    </div>
  );
}
