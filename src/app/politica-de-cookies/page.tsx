import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/site/components/LegalDocumentPage";
import { getPublicLegalDocuments } from "@/features/site/data/legal-documents";
import { getPublicMarketingSettings } from "@/features/site/data/marketing-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicMarketingSettings();

  return {
    alternates: {
      canonical: "/politica-de-cookies",
    },
    description:
      "Política de Cookies do site Frederico & Locatelli, com informações sobre cookies necessários, medição e marketing.",
    openGraph: {
      description:
        "Entenda como cookies necessários e opcionais podem ser utilizados no site.",
      title: "Política de Cookies",
      type: "article",
      url: settings.siteUrl ? `${settings.siteUrl}/politica-de-cookies` : undefined,
    },
    title: "Política de Cookies",
  };
}

export default async function CookiePolicyPage() {
  const documents = await getPublicLegalDocuments();

  return (
    <LegalDocumentPage
      contactEmail={documents.contactEmail}
      content={documents.cookiePolicyContent}
      description="Controle como cookies opcionais de medição e marketing podem ser usados durante a navegação."
      title="Política de Cookies"
      updatedAt={documents.legalDocumentsUpdatedAt}
      version={documents.legalDocumentsVersion}
    />
  );
}
