import Link from "next/link";
import { getTranslations } from "next-intl/server";

import LanguageSelector from "@/components/common/LanguageSelector";
import type { AppLocale } from "@/i18n";

type NavPath = "" | "/members" | "/discography" | "/variety" | "/about";

const NAV_LINKS: Array<{ id: string; path: NavPath }> = [
  { id: "nav.home", path: "" },
  { id: "nav.members", path: "/members" },
  { id: "nav.discography", path: "/discography" },
  { id: "nav.variety", path: "/variety" },
  { id: "nav.about", path: "/about" },
];

interface HeaderProps {
  locale: AppLocale;
}

function buildHref(locale: AppLocale, path: NavPath) {
  if (!path) {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}

export default async function Header({ locale }: HeaderProps) {
  const t = await getTranslations({ locale });

  return (
    <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link className="text-lg font-semibold tracking-wide text-gradient" href={`/${locale}`}>
          KNK GUIDE
        </Link>
        <nav
          aria-label={t("nav.ariaMain")}
          className="hidden gap-6 text-sm font-medium text-text-secondary md:flex"
          role="navigation"
        >
          {NAV_LINKS.map((item) => (
            <Link
              className="transition hover:text-white"
              href={buildHref(locale, item.path)}
              key={item.id}
            >
              {t(item.id)}
            </Link>
          ))}
        </nav>
        <LanguageSelector />
      </div>
    </header>
  );
}
