import { getTranslations } from "next-intl/server";

import type { AppLocale } from "@/i18n";

interface FooterProps {
  locale: AppLocale;
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale });
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-white">{t("footer.byline")}</p>
          <p>{t("footer.aiNotice")}</p>
          <p>{t("footer.rights")}</p>
        </div>
        <div className="space-y-2 text-right md:text-left">
          <p>{t("footer.contactHint")}</p>
          <a
            className="site-footer__link inline-flex items-center gap-2"
            href={`/${locale}/contact`}
            aria-label={t("footer.contactAria")}
          >
            {t("footer.contactCta")}
            <span aria-hidden>↗</span>
          </a>
          <p className="text-xs text-text-secondary/70">{t("footer.copyright", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
