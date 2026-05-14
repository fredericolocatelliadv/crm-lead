import "server-only";

import { cache } from "react";

import { createClient } from "@/server/supabase/server";

export type PublicLegalDocuments = {
  contactEmail: string | null;
  cookiePolicyContent: string;
  legalDocumentsUpdatedAt: string | null;
  legalDocumentsVersion: string;
  privacyPolicyContent: string;
  termsOfUseContent: string;
};

const defaultPrivacyPolicy = `## Política de Privacidade

Esta política explica como o escritório trata dados pessoais recebidos pelo site, WhatsApp e demais canais de contato.

### Dados coletados

Podemos coletar nome, telefone, e-mail, cidade, área de interesse, mensagem enviada, preferência de contato e informações técnicas de navegação quando houver consentimento para cookies opcionais.

### Finalidades

Os dados são usados para responder solicitações, organizar o atendimento, avaliar o assunto informado, registrar histórico comercial, melhorar a experiência no site e medir campanhas quando autorizado.

### Direitos do titular

O titular pode solicitar acesso, correção, atualização, eliminação quando aplicável e informações sobre o tratamento de dados pessoais pelos canais oficiais do site.`;

const defaultTermsOfUse = `## Termos de Uso

O conteúdo publicado no site tem finalidade informativa e institucional.

O envio de formulário ou mensagem não cria, por si só, vínculo advogado-cliente nem substitui análise jurídica individualizada pela equipe do escritório.

O usuário deve fornecer informações verdadeiras e atualizadas para que o atendimento inicial seja realizado com segurança.`;

const defaultCookiePolicy = `## Política de Cookies

O site pode usar cookies necessários para funcionamento, segurança e prevenção de abuso.

Quando autorizado pelo visitante, também pode usar cookies opcionais de medição e marketing para entender visitas, campanhas e conversões.

O visitante pode aceitar, recusar ou ajustar suas preferências no aviso de cookies e pelos controles do navegador.`;

export const getPublicLegalDocuments = cache(async (): Promise<PublicLegalDocuments> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select(
      "email,privacy_contact_email,legal_documents_version,legal_documents_updated_at,privacy_policy_content,terms_of_use_content,cookie_policy_content",
    )
    .eq("id", 1)
    .maybeSingle();

  return {
    contactEmail: data?.privacy_contact_email ?? data?.email ?? null,
    cookiePolicyContent: data?.cookie_policy_content ?? defaultCookiePolicy,
    legalDocumentsUpdatedAt: data?.legal_documents_updated_at ?? null,
    legalDocumentsVersion: data?.legal_documents_version ?? "1.0",
    privacyPolicyContent: data?.privacy_policy_content ?? defaultPrivacyPolicy,
    termsOfUseContent: data?.terms_of_use_content ?? defaultTermsOfUse,
  };
});
