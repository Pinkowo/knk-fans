"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-6 text-center text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-accent-pink">{t("errors.generic")}</p>
      <h1 className="text-3xl font-bold">{t("errorPage.title")}</h1>
      <p className="text-sm text-text-secondary">{t("errorPage.subtitle")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-white/40"
      >
        {t("errorPage.retry")}
      </button>
    </div>
  );
}
