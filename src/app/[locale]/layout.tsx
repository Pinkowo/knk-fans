import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import PetSettingsPanel from "@/components/pets/PetSettings";
import SitePet from "@/components/pets/SitePet";
import { defaultLocale, locales, type AppLocale } from "@/i18n";

type LayoutParams = { locale: string };

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

  return {
    title: {
      template: `%s | KNK Guide`,
      default: t("guide.hero.title"),
    },
    description: t("guide.hero.subtitle"),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://knk-fans.vercel.app"),
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
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages} timeZone="Asia/Taipei">
      <div className="flex min-h-screen flex-col bg-surface text白">
        <Header locale={resolvedLocale} />
        <main className="flex-1 bg-gradient-to-b from-surface via-surface-muted to-surface">
          {children}
        </main>
        <Footer />
        <SitePet />
        <PetSettingsPanel />
      </div>
    </NextIntlClientProvider>
  );
}
