import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import Script from "next/script";
import { MarketingAttributionCapture } from "@/features/site/components/MarketingAttributionCapture";
import { MarketingTags } from "@/features/site/components/MarketingTags";
import {
  defaultSeoDescription,
  defaultSeoTitle,
  getPublicMarketingSettings,
} from "@/features/site/data/marketing-settings";
import { ThemeProvider } from "@/shared/components/theme-provider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicMarketingSettings();
  const title = settings.seoTitle ?? defaultSeoTitle;
  const description = settings.seoDescription ?? defaultSeoDescription;
  const images = settings.seoImageUrl ? [settings.seoImageUrl] : undefined;

  return {
    description,
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
    openGraph: {
      description,
      images,
      locale: "pt_BR",
      siteName: "Frederico & Locatelli",
      title,
      type: "website",
      url: settings.siteUrl ?? undefined,
    },
    other: settings.metaDomainVerification
      ? {
          "facebook-domain-verification": settings.metaDomainVerification,
        }
      : undefined,
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      description,
      images,
      title,
    },
    verification: settings.googleSearchConsoleVerification
      ? {
          google: settings.googleSearchConsoleVerification,
        }
      : undefined,
  };
}

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const marketingSettings = await getPublicMarketingSettings();

  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <MarketingAttributionCapture />
        <MarketingTags settings={marketingSettings} />
        {recaptchaSiteKey ? (
          <Script
            src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />
        ) : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
