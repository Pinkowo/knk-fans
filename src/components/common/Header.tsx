"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

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

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isMenuOpen]);

  const activePath = useMemo(() => pathname || "", [pathname]);

  const isActive = (href: string) => {
    if (!activePath) return false;
    const homePath = `/${locale}`;
    if (href === homePath) {
      return activePath === homePath;
    }
    return activePath === href || activePath.startsWith(`${href}/`);
  };

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
          {NAV_LINKS.map((item) => {
            const href = buildHref(locale, item.path);
            return (
              <Link
                className={`transition hover:text-white ${isActive(href) ? "text-white" : ""}`}
                href={href}
                key={item.id}
              >
                {t(item.id)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40 md:hidden"
            onClick={() => setIsMenuOpen(true)}
            aria-label={t("nav.menu")}
            aria-expanded={isMenuOpen}
          >
            <span>{t("nav.menu")}</span>
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-label={t("nav.menu")}>
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label={t("nav.close")}
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 space-y-5 rounded-b-3xl border-b border-white/10 bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">{t("nav.ariaMain")}</span>
              <button
                type="button"
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.close")}
              </button>
            </div>
            <nav className="flex flex-col gap-2" aria-label={t("nav.ariaMain")}>
              {NAV_LINKS.map((item) => {
                const href = buildHref(locale, item.path);
                const active = isActive(href);
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-lg font-semibold transition ${
                      active ? "bg-white/10 text-white shadow-inner" : "text-text-secondary hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {t(item.id)}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2">
              <LanguageSelector />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
