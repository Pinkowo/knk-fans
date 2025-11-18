"use client";

import { useTranslations } from "next-intl";
import { memo, useMemo, useState } from "react";

import LyricsControls from "@/components/lyrics/LyricsControls";
import type { LyricsDisplayMode } from "@/lib/utils/lyrics";
import { formatLyrics, mergeLyricsByLanguage } from "@/lib/utils/lyrics";
import type { LyricsContent } from "@/types/music";

interface LyricsDisplayProps {
  lyrics: LyricsContent;
}

const DEFAULT_LANGUAGES = ["ko", "zh", "ja", "en"];

function LyricsDisplayInner({ lyrics }: LyricsDisplayProps) {
  const t = useTranslations();
  const [mode, setMode] = useState<LyricsDisplayMode>("line");
  const initialLanguage = lyrics.ko && lyrics.ko.length > 0 ? ["ko"] : DEFAULT_LANGUAGES;
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguage);

  const mergedLyrics = useMemo(
    () => mergeLyricsByLanguage(lyrics as Record<string, string[] | undefined>, selectedLanguages),
    [lyrics, selectedLanguages],
  );

  return (
    <div className="space-y-6" style={{ contain: "content" }}>
      <LyricsControls
        availableLanguages={DEFAULT_LANGUAGES}
        selectedLanguages={selectedLanguages}
        onLanguagesChange={(languages) => setSelectedLanguages(languages.length ? languages : initialLanguage)}
        mode={mode}
        onModeChange={setMode}
      />
      {mergedLyrics.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-text-secondary">
          {t("lyrics.empty")}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mergedLyrics.map((entry) => (
            <div key={entry.lang} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">{entry.lang}</p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-white">
                {formatLyrics(entry.lines, mode).map((line, index) => (
                  <p key={`${entry.lang}-${index}`}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(LyricsDisplayInner);
