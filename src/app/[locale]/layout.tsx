import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import WebVitalsReporter from "@/components/analytics/WebVitalsReporter";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import PetSettingsPanel from "@/components/pets/PetSettings";
import SitePet from "@/components/pets/SitePet";
import MusicPlayer from "@/components/player/MusicPlayer";
import StructuredData from "@/components/seo/StructuredData";
import { defaultLocale, locales, type AppLocale } from "@/i18n";
import { LoadingProvider } from "@/lib/context/LoadingContext";
import { PlayerProvider } from "@/lib/context/PlayerContext";
import { fetchPlayerLibrary } from "@/lib/player/library";

type LayoutParams = { locale: string };

export const dynamic = "force-static";
export const dynamicParams = false;

function resolveLocale(locale: string): AppLocale {
  return locales.includes(locale as AppLocale) ? (locale as AppLocale) : defaultLocale;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: resolvedLocale });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.knk-fans.com";
  const title = t("guide.hero.title");
  const description = t("guide.hero.subtitle");

  return {
    title: {
      template: `%s | KNK Guide`,
      default: title,
    },
    description,
    metadataBase: new URL(siteUrl),
    keywords: ["KNK", "크나큰", "K-pop", "韓國男團", "idol", "케이팝", "팬사이트"],
    authors: [{ name: "Pink" }],
    creator: "Pink",
    publisher: "KNK Fansite",
    openGraph: {
      type: "website",
      locale:
        resolvedLocale === "zh"
          ? "zh_TW"
          : resolvedLocale === "en"
            ? "en_US"
            : resolvedLocale === "ja"
              ? "ja_JP"
              : "ko_KR",
      title,
      description,
      siteName: "KNK Fansite",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "KNK Fansite",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "bf3fb2ed0f535e07",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);

  setRequestLocale(resolvedLocale);
  const messages = await getMessages({ locale: resolvedLocale });
  const t = await getTranslations({ locale: resolvedLocale });
  const playerLibrary = await fetchPlayerLibrary(resolvedLocale);

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages} timeZone="Asia/Taipei">
      <StructuredData locale={resolvedLocale} />
      <LoadingProvider>
        <PlayerProvider>
          <div className="flex min-h-screen flex-col bg-surface text-white">
            <a className="skip-link" href="#main-content">
              {t("layout.skip")}
            </a>
            <Header locale={resolvedLocale} />
            <main id="main-content" className="flex-1 bg-gradient-to-b from-surface via-surface-muted to-surface">
              {children}
            </main>
            <Footer locale={resolvedLocale} />
            <SitePet />
            <PetSettingsPanel />
            <MusicPlayer library={playerLibrary} />
            <WebVitalsReporter />
          </div>
        </PlayerProvider>
      </LoadingProvider>
    </NextIntlClientProvider>
  );
}
