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

export const crmNavigation = [
  {
    label: "Dashboard",
    href: "/crm",
    icon: LayoutDashboard,
    description: "Indicadores comerciais para acompanhar captação e conversão.",
  },
  {
    label: "Leads",
    href: "/crm/leads",
    icon: Users,
    description: "Contatos em acompanhamento comercial.",
  },
  {
    label: "Pipeline",
    href: "/crm/pipeline",
    icon: Workflow,
    description: "Etapas do fluxo de conversão.",
  },
  {
    label: "Conversas",
    href: "/crm/conversas",
    icon: MessageSquare,
    description: "Atendimentos e histórico de mensagens.",
  },
  {
    label: "WhatsApp",
    href: "/crm/whatsapp",
    icon: Smartphone,
    description: "Conexão do número usado no atendimento.",
  },
  {
    label: "IA",
    href: "/crm/ia",
    icon: Bot,
    description: "Configuração da assistente de atendimento.",
  },
  {
    label: "Clientes",
    href: "/crm/clientes",
    icon: Building2,
    description: "Leads convertidos em clientes.",
  },
  {
    label: "Blog",
    href: "/crm/blog",
    icon: BookOpen,
    description: "Notícias e conteúdos do site.",
  },
  {
    label: "Relatórios",
    href: "/crm/relatorios",
    icon: BarChart3,
    description: "Visão gerencial da operação comercial.",
  },
  {
    label: "Usuários",
    href: "/crm/usuarios",
    icon: UserCog,
    description: "Acessos e permissões internas.",
  },
  {
    label: "Configurações",
    href: "/crm/configuracoes",
    icon: Settings,
    description: "Ajustes essenciais do CRM.",
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
