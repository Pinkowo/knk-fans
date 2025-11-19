import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function LocaleNotFound() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-6 text-center text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-accent-yellow">404</p>
      <h1 className="text-3xl font-bold">{t("notFound.title")}</h1>
      <p className="text-text-secondary">{t("notFound.subtitle")}</p>
      <Link
        href="/"
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-white/40"
      >
        {t("notFound.back")}
      </Link>
    </div>
  );
}
