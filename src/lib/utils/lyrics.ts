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

export function mergeLyricsByLanguage(lyrics: Record<string, string[] | undefined>, languages: string[]) {
  return languages
    .map((lang) => ({ lang, lines: lyrics[lang] ?? [] }))
    .filter((entry) => entry.lines.length > 0);
}
