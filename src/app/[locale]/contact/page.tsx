import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ContactForm from "@/components/contact/ContactForm";
import type { AppLocale } from "@/i18n";

interface ContactPageParams {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: ContactPageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("hero.title"),
    description: t("hero.subtitle"),
  };
}

export default async function ContactPage({ params }: ContactPageParams) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 text-white">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-teal">{t("hero.eyebrow")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{t("hero.title")}</h1>
        <p className="text-base text-text-secondary">{t("hero.subtitle")}</p>
      </header>
      <ContactForm />
    </div>
  );
}
