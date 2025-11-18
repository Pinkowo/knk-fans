"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { LyricsDisplayMode } from "@/lib/utils/lyrics";

interface LyricsControlsProps {
  availableLanguages: string[];
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  mode: LyricsDisplayMode;
  onModeChange: (mode: LyricsDisplayMode) => void;
}

export default function LyricsControls({
  availableLanguages,
  selectedLanguages,
  onLanguagesChange,
  mode,
  onModeChange,
}: LyricsControlsProps) {
  const t = useTranslations();

  const normalizedAvailable = useMemo(() => availableLanguages.filter(Boolean), [availableLanguages]);

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      onLanguagesChange(selectedLanguages.filter((item) => item !== language));
    } else {
      onLanguagesChange([...selectedLanguages, language]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">{t("lyrics.language")}</span>
        {normalizedAvailable.map((language) => (
          <button
            key={language}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              selectedLanguages.includes(language)
                ? "border-accent-teal text-accent-teal"
                : "border-white/15 text-text-secondary"
            }`}
            onClick={() => toggleLanguage(language)}
          >
            {language}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-secondary">
        {t("lyrics.mode")}
        <button
          type="button"
          onClick={() => onModeChange("line")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === "line" ? "bg-accent-teal text-black" : "bg-white/10 text-text-secondary"}`}
        >
          {t("lyrics.lineMode")}
        </button>
        <button
          type="button"
          onClick={() => onModeChange("paragraph")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === "paragraph" ? "bg-accent-teal text-black" : "bg-white/10 text-text-secondary"}`}
        >
          {t("lyrics.paragraphMode")}
        </button>
      </div>
    </div>
  );
}
