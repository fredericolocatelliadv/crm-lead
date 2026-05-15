import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Smartphone,
  UserCog,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";

import {
  rolePermissions,
  type Permission,
  type UserRole,
} from "@/features/users/types/roles";

export const crmNavigation = [
  {
    label: "Dashboard",
    href: "/crm",
    icon: LayoutDashboard,
    description: "Indicadores comerciais para acompanhar captação e conversão.",
    permissions: ["crm:read"],
  },
  {
    label: "Leads",
    href: "/crm/leads",
    icon: Users,
    description: "Contatos em acompanhamento comercial.",
    permissions: ["leads:read"],
  },
  {
    label: "Pipeline",
    href: "/crm/pipeline",
    icon: Workflow,
    description: "Etapas do fluxo de conversão.",
    permissions: ["pipeline:read"],
  },
  {
    label: "Conversas",
    href: "/crm/conversas",
    icon: MessageSquare,
    description: "Atendimentos e histórico de mensagens.",
    permissions: ["conversations:read"],
  },
  {
    label: "WhatsApp",
    href: "/crm/whatsapp",
    icon: Smartphone,
    description: "Conexão do número usado no atendimento.",
    permissions: ["whatsapp:read"],
  },
  {
    label: "IA",
    href: "/crm/ia",
    icon: Bot,
    description: "Configuração da assistente de atendimento.",
    permissions: ["ai:manage"],
  },
  {
    label: "Clientes",
    href: "/crm/clientes",
    icon: Building2,
    description: "Leads convertidos em clientes.",
    permissions: ["customers:read"],
  },
  {
    label: "Blog",
    href: "/crm/blog",
    icon: BookOpen,
    description: "Notícias e conteúdos do site.",
    permissions: ["blog:read"],
  },
  {
    label: "Relatórios",
    href: "/crm/relatorios",
    icon: BarChart3,
    description: "Visão gerencial da operação comercial.",
    permissions: ["reports:read"],
  },
  {
    label: "Usuários",
    href: "/crm/usuarios",
    icon: UserCog,
    description: "Acessos e permissões internas.",
    permissions: ["users:manage"],
  },
  {
    label: "Configurações",
    href: "/crm/configuracoes",
    icon: Settings,
    description: "Ajustes essenciais do CRM.",
    permissions: ["settings:manage", "marketing:manage"],
  },
] as const;

const crmAuxiliaryNavigation = [
  {
    label: "Meu perfil",
    href: "/crm/perfil",
    icon: UserRound,
    description: "Dados de identificação do usuário logado.",
  },
] as const;

type NavigationItem = (typeof crmNavigation)[number];

export function canAccessNavigationItem(role: UserRole, item: NavigationItem) {
  return item.permissions.some((permission) =>
    rolePermissions[role].includes(permission as Permission),
  );
}

export function getAccessibleNavigation(role: UserRole) {
  return crmNavigation.filter((item) => canAccessNavigationItem(role, item));
}

export function getNavigationItem(pathname: string) {
  return (
    [...crmNavigation, ...crmAuxiliaryNavigation]
      .filter((item) => isNavigationItemActive(pathname, item.href))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? crmNavigation[0]
  );
}

export function isNavigationItemActive(pathname: string, href: string) {
  if (href === "/crm") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
