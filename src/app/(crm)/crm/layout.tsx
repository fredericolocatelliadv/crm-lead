import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM | Frederico & Locatelli",
  description: "CRM comercial para atendimento e conversão de leads jurídicos.",
};

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
