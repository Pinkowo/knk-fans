"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";

import type { AppLocale } from "@/i18n";
import { LOCALE_LABELS } from "@/lib/constants/locales";

interface LoadingOverlayProps {
  isVisible: boolean;
  targetLocale: AppLocale | null;
}

export default function LoadingOverlay({ isVisible, targetLocale }: LoadingOverlayProps) {
  const t = useTranslations("loadingOverlay");
  const overlayRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!isVisible) {
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
      previouslyFocused.current = null;
      return;
    }

    previouslyFocused.current = document.activeElement;
    overlayRef.current?.focus();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        overlayRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  const localeLabel = useMemo(() => {
    if (!targetLocale) {
      return t("defaultLocaleLabel");
    }

    return LOCALE_LABELS[targetLocale] ?? targetLocale.toUpperCase();
  }, [t, targetLocale]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ opacity: 1 }}
          className="loading-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="status"
          aria-live="assertive"
        >
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-3xl border border-white/10 bg-surface-muted/90 p-8 text-center shadow-2xl"
            exit={{ scale: 0.95, opacity: 0 }}
            initial={{ scale: 0.95, opacity: 0 }}
            ref={overlayRef}
            tabIndex={-1}
            aria-label={t("ariaLabel", { locale: localeLabel })}
          >
            <div className="mb-4 flex flex-col gap-2 text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-200">
                {t("title")}
              </p>
              <p className="text-2xl font-semibold">{localeLabel}</p>
            </div>
            <p className="text-sm text-text-secondary">{t("description", { locale: localeLabel })}</p>
            <div className="mt-6 flex justify-center">
              <motion.span
                animate={{ scale: [1, 1.12, 1] }}
                className="inline-block h-10 w-10 rounded-full border-2 border-white/25 border-t-white"
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
