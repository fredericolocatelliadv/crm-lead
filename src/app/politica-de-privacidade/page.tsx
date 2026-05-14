import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/site/components/LegalDocumentPage";
import { getPublicLegalDocuments } from "@/features/site/data/legal-documents";
import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicMarketingSettings();

  return {
    alternates: {
      canonical: "/politica-de-privacidade",
    },
    description:
      "Política de Privacidade do escritório Frederico & Locatelli, com informações sobre tratamento de dados pessoais.",
    openGraph: {
      description:
        "Entenda como os dados enviados pelo site e canais de contato são tratados pelo escritório.",
      title: "Política de Privacidade",
      type: "article",
      url: settings.siteUrl ? `${settings.siteUrl}/politica-de-privacidade` : undefined,
    },
    title: "Política de Privacidade",
  };
}

export default async function PrivacyPolicyPage() {
  const documents = await getPublicLegalDocuments();

  return (
    <LegalDocumentPage
      contactEmail={documents.contactEmail}
      content={documents.privacyPolicyContent}
      description="Entenda como os dados enviados pelo site, WhatsApp e formulários são tratados no atendimento inicial."
      title="Política de Privacidade"
      updatedAt={documents.legalDocumentsUpdatedAt}
      version={documents.legalDocumentsVersion}
    />
  );
}
