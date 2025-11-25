import { getTranslations } from "next-intl/server";

import type { AppLocale } from "@/i18n";

interface FooterProps {
  locale: AppLocale;
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale });
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-surface-muted/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
        <p>{t("footer.byline")}</p>
        <p>{t("footer.copyright", { year })}</p>
      </div>
    </footer>
  );
}
