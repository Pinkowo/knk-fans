export const notionRevalidate = {
  guide: 60 * 60 * 6, // 6 hours
  members: 60 * 5, // 5 minutes
  discography: 60 * 60 * 24 * 7,
  songs: 60 * 10,
  variety: 60 * 60 * 24,
  links: 60 * 60 * 24 * 7,
} as const;

export const rateLimitPerSecond = 3;
export const maxNotionRetries = 3;
