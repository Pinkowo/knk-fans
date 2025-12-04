import type { AppLocale } from "@/i18n";
import { fetchAlbums } from "@/lib/notion/albums";
import { fetchAllSongs } from "@/lib/notion/songs";
import type { SongDetail } from "@/types/music";
import type { PlayerAlbum, PlayerTrack } from "@/types/player";

function extractYouTubeId(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v") ?? undefined;
    }
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1]?.split("/")[0];
    }
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    return pathSegments[pathSegments.length - 1];
  } catch {
    return undefined;
  }
}

function parseDuration(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const [minutes, seconds] = value.split(":").map((segment) => Number.parseInt(segment, 10));
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return undefined;
  }
  return minutes * 60 + seconds;
}

export async function fetchPlayerLibrary(locale: AppLocale): Promise<PlayerAlbum[]> {
  const [albums, songs] = await Promise.all([fetchAlbums(locale), fetchAllSongs(locale)]);
  const songMap = new Map<string, SongDetail>();
  songs.forEach((song) => {
    if (song.slug) {
      songMap.set(song.slug, song);
    } else {
      songMap.set(song.id, song);
    }
  });

  const mappedAlbums = albums
    .map((album) => {
      const mappedTracks = album.tracks
        .map((track) => {
          if (!track.songId) {
            return null;
          }
          const detail = songMap.get(track.songId);
          const videoId = extractYouTubeId(detail?.videoUrl);
          if (!videoId) {
            return null;
          }

          const playerTrack: PlayerTrack = {
            id: track.songId,
            title: track.title,
            artist: detail?.album ?? album.title,
            videoId,
            durationSeconds: parseDuration(track.duration),
          };
          return playerTrack;
        })
        .filter((track): track is PlayerTrack => track !== null);

      if (mappedTracks.length === 0) {
        return null;
      }

      const playerAlbum: PlayerAlbum = {
        id: album.id,
        title: album.title,
        cover: album.cover,
        artist: mappedTracks[0]?.artist,
        tracks: mappedTracks,
      };
      return playerAlbum;
    })
    .filter((album): album is PlayerAlbum => album !== null);

  return mappedAlbums;
}
