import type { LyricsContent } from "@/types/music";

export type LyricsDisplayMode = "line" | "paragraph";

export function formatLyrics(lines: string[] = [], mode: LyricsDisplayMode = "line"): string[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    return [];
  }

  if (mode === "paragraph") {
    return [lines.join(" ")];
  }

  return lines;
}

export function mergeLyricsByLanguage(lyrics: Partial<LyricsContent>, languages: string[]) {
  return languages
    .map((lang) => {
      const key = lang as keyof LyricsContent;
      return { lang, lines: lyrics[key] ?? [] };
    })
    .filter((entry) => entry.lines.length > 0);
}
