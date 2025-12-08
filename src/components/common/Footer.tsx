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
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-center text-sm text-text-secondary">
        <div className="space-y-1">
          <p>{t("footer.line1")}</p>
          {t.has?.("footer.line1b") ? <p>{t("footer.line1b")}</p> : null}
        </div>
        <p>
          {t("footer.line2Prefix")}
          <a
            className="site-footer__link inline-flex items-center gap-2"
            href={`/${locale}/contact`}
            aria-label={t("footer.contactAria")}
          >
            {t("footer.contactCta")}
          </a>
          {t("footer.line2Suffix")}
        </p>
        <p className="text-xs text-text-secondary/70">{t("footer.line3", { year })}</p>
      </div>
    </footer>
  );
}
