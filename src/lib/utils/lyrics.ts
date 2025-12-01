import type { LyricsContent } from "@/types/music";

export type LyricsDisplayMode = "line" | "paragraph";

const LANGUAGE_FIELD_MAP: Record<string, keyof LyricsContent> = {
  ko: "ko",
  zh: "zh",
  ja: "ja",
  en: "en",
  ro: "romanization",
};

export function formatLyrics(lines: string[] = [], mode: LyricsDisplayMode = "line"): string[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    return [];
  }

  return lines;
}

export function getLyricsLines(lyrics: Partial<LyricsContent>, language: string): string[] {
  const key = (LANGUAGE_FIELD_MAP[language] ?? (language as keyof LyricsContent)) as keyof LyricsContent;
  const value = lyrics[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((line) => typeof line === "string" && line.trim().length > 0);
}

export function mergeLyricsByLanguage(lyrics: Partial<LyricsContent>, languages: string[]) {
  return languages
    .map((lang) => ({ lang, lines: getLyricsLines(lyrics, lang) }))
    .filter((entry) => entry.lines.length > 0);
}
