import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/site/components/LegalDocumentPage";
import { getPublicLegalDocuments } from "@/features/site/data/legal-documents";
import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicMarketingSettings();

  return {
    alternates: {
      canonical: "/termos-de-uso",
    },
    description:
      "Termos de Uso do site Frederico & Locatelli, com orientações sobre conteúdo, atendimento e responsabilidades.",
    openGraph: {
      description:
        "Conheça as condições de uso do site e os limites do atendimento inicial pelos canais digitais.",
      title: "Termos de Uso",
      type: "article",
      url: settings.siteUrl ? `${settings.siteUrl}/termos-de-uso` : undefined,
    },
    title: "Termos de Uso",
  };
}

export default async function TermsOfUsePage() {
  const documents = await getPublicLegalDocuments();

  return (
    <LegalDocumentPage
      contactEmail={documents.contactEmail}
      content={documents.termsOfUseContent}
      description="Condições de uso do site e limites do atendimento inicial pelos canais digitais."
      title="Termos de Uso"
      updatedAt={documents.legalDocumentsUpdatedAt}
      version={documents.legalDocumentsVersion}
    />
  );
}
