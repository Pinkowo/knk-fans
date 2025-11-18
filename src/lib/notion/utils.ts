import type { NotionFilesProperty, NotionRichText, NotionRichTextProperty, NotionTitleProperty } from "@/types/notion";

export function richTextToPlainText(nodes?: NotionRichText[]): string {
  if (!nodes) {
    return "";
  }

  return nodes.map((node) => node.plain_text).join("").trim();
}

export function getTitleValue(property: NotionTitleProperty | undefined): string {
  if (!property) {
    return "";
  }

  return richTextToPlainText(property.title);
}

export function getRichTextValue(property: NotionRichTextProperty | undefined): string {
  if (!property) {
    return "";
  }

  return richTextToPlainText(property.rich_text);
}

export function getFirstFileUrl(property?: NotionFilesProperty): string | undefined {
  if (!property || property.files.length === 0) {
    return undefined;
  }

  const file = property.files[0];
  return file.type === "file" ? file.file?.url : file.external?.url;
}

export function sanitizeUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) {
      return undefined;
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
}
