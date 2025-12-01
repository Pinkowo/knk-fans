"use client";

import { useTranslations } from "next-intl";
import { memo, useEffect, useMemo, useState } from "react";

import LyricsControls from "@/components/lyrics/LyricsControls";
import type { LyricsDisplayMode } from "@/lib/utils/lyrics";
import { formatLyrics, getLyricsLines, mergeLyricsByLanguage } from "@/lib/utils/lyrics";
import type { LyricsContent } from "@/types/music";

interface LyricsDisplayProps {
  lyrics: LyricsContent;
}

const LANGUAGE_OPTIONS = [
  { key: "ko", label: "KO", color: "text-white" },
  { key: "zh", label: "ZH", color: "text-amber-200" },
  { key: "ja", label: "JA", color: "text-pink-200" },
  { key: "en", label: "EN", color: "text-accent-teal" },
  { key: "ro", label: "RO", color: "text-indigo-200" },
];

function getLanguageMeta(key: string) {
  return LANGUAGE_OPTIONS.find((option) => option.key === key);
}

function LyricsDisplayInner({ lyrics }: LyricsDisplayProps) {
  const t = useTranslations();
  const [mode, setMode] = useState<LyricsDisplayMode>("line");
  const availableLanguageOptions = useMemo(
    () => LANGUAGE_OPTIONS.filter((option) => getLyricsLines(lyrics, option.key).length > 0),
    [lyrics],
  );

  const fallbackSelection = useMemo(() => {
    if (availableLanguageOptions.some((option) => option.key === "ko")) {
      return ["ko"];
    }
    return availableLanguageOptions.length ? [availableLanguageOptions[0].key] : [];
  }, [availableLanguageOptions]);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(fallbackSelection);

  useEffect(() => {
    setSelectedLanguages((previous) => {
      const filtered = previous.filter((lang) => availableLanguageOptions.some((option) => option.key === lang));
      if (filtered.length === previous.length && filtered.every((lang, index) => lang === previous[index])) {
        return previous;
      }
      if (filtered.length > 0) {
        return filtered;
      }
      return fallbackSelection;
    });
  }, [availableLanguageOptions, fallbackSelection]);

  const mergedLyrics = useMemo(
    () => mergeLyricsByLanguage(lyrics, mode === "paragraph" ? selectedLanguages : selectedLanguages.slice(0, 1)),
    [lyrics, selectedLanguages, mode],
  );

  const lineGroups = useMemo(() => {
    if (mode !== "line" || selectedLanguages.length === 0) {
      return [];
    }
    const languageLines = selectedLanguages
      .map((lang) => ({ lang, lines: getLyricsLines(lyrics, lang) }))
      .filter((entry) => entry.lines.length > 0);
    if (languageLines.length === 0) {
      return [];
    }
    const maxLines = Math.max(...languageLines.map((entry) => entry.lines.length));
    return Array.from({ length: maxLines }, (_, lineIndex) =>
      languageLines
        .map((entry) => ({ lang: entry.lang, text: entry.lines[lineIndex] }))
        .filter((segment) => segment.text && segment.text.trim().length > 0),
    ).filter((group) => group.length > 0);
  }, [lyrics, selectedLanguages, mode]);

  const hasLyrics = availableLanguageOptions.length > 0;
  const isSingleColumn = mode === "line" || selectedLanguages.length <= 1;
  const handleLanguagesChange = (languages: string[]) => {
    if (languages.length === 0) {
      setSelectedLanguages(fallbackSelection);
    } else {
      setSelectedLanguages(languages);
    }
  };

  return (
    <div
      className={`${isSingleColumn ? "mx-auto max-w-4xl" : "w-full"} space-y-6 px-6`}
      style={{ contain: "content" }}
    >
      <LyricsControls
        availableLanguages={availableLanguageOptions}
        selectedLanguages={selectedLanguages}
        onLanguagesChange={handleLanguagesChange}
        mode={mode}
        onModeChange={setMode}
      />
      {!hasLyrics ? (
        <p className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-text-secondary">
          {t("lyrics.empty")}
        </p>
      ) : mode === "paragraph" ? (
        mergedLyrics.length > 0 ? (
          isSingleColumn ? (
            mergedLyrics.map((entry) => {
              const meta = getLanguageMeta(entry.lang);
              return (
                <div
                  key={entry.lang}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">
                    {meta?.label ?? entry.lang.toUpperCase()}
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-white whitespace-pre-line">
                    {formatLyrics(entry.lines, mode).map((line, index) => (
                      <p key={`${entry.lang}-${index}`}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="mx-auto flex w-fit max-w-full flex-col items-center gap-4 px-6 md:flex-row md:flex-nowrap md:items-stretch md:overflow-x-auto md:pb-2">
              {mergedLyrics.map((entry) => {
                const meta = getLanguageMeta(entry.lang);
                return (
                  <div
                    key={entry.lang}
                    className="min-w-[420px] max-w-[420px] rounded-3xl border border-white/10 bg-white/5 p-6"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">
                      {meta?.label ?? entry.lang.toUpperCase()}
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-white whitespace-pre-line">
                      {formatLyrics(entry.lines, mode).map((line, index) => (
                        <p key={`${entry.lang}-${index}`}>{line}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <p className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-text-secondary">
            {t("lyrics.empty")}
          </p>
        )
      ) : lineGroups.length > 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-4">
            {lineGroups.map((group, lineIndex) => (
              <div key={`line-${lineIndex}`} className="space-y-1">
                {group.map((segment, segmentIndex) => {
                  const meta = getLanguageMeta(segment.lang);
                  return (
                    <p
                      key={`${segment.lang}-${lineIndex}-${segmentIndex}`}
                      className={`text-sm leading-relaxed ${meta?.color ?? "text-white"}`}
                    >
                      <span className="mr-2 inline-flex items-center rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/70">
                        {meta?.label ?? segment.lang.toUpperCase()}
                      </span>
                      {segment.text}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-text-secondary">
          {t("lyrics.empty")}
        </p>
      )}
    </div>
  );
}

export default memo(LyricsDisplayInner);
