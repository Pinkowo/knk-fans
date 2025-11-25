import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedValue } from "@/lib/localization";
import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { Album, TrackSummary } from "@/types/music";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

type LocalizedAlbum = Omit<Album, "description"> & {
  description?: Record<AppLocale, string>;
};

export const fallbackAlbums: LocalizedAlbum[] = [
  {
    id: "album-awake",
    title: "Awake",
    releaseDate: "2016-06-02",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/f9/KNK(%ED%81%AC%EB%82%98%ED%81%B0)-Awake_EP.jpg",
    description: {
      zh: "KNK 出道後第一張迷你專輯，由製作人 Kim Tae-joo 全權操刀，呈現既成熟又戲劇化的聲音敘事。",
      en: "KNK’s first mini album after debut, produced entirely by Kim Tae-joo, blending dramatic storytelling with a surprisingly mature tone.",
      ko: "프로듀서 김태주가 전곡을 맡아 데뷔 직후의 KNK가 성숙하고 드라마틱한 사운드를 들려준 첫 미니앨범.",
      ja: "プロデューサーKim Tae-jooが全曲を手掛け、デビュー直後とは思えない成熟したドラマ性を響かせた初のミニアルバム。",
    },
    tracks: [
      { id: "track-gone", title: "Gone", duration: "1:45", songId: "song-gone" },
      { id: "track-back-again", title: "Back Again", duration: "3:28", songId: "song-back-again" },
      { id: "track-i-remember", title: "I Remember", duration: "3:28", songId: "song-i-remember" },
      { id: "track-day-night", title: "Day N Night", duration: "3:29", songId: "song-day-n-night" },
      { id: "track-angel-heart", title: "Angel Heart", duration: "3:28", songId: "song-angel-heart" },
    ],
  },
  {
    id: "album-gravity-completed",
    title: "Gravity, Completed",
    releaseDate: "2017-07-20",
    cover: "https://upload.wikimedia.org/wikipedia/en/7/73/KNK_-_Gravity%2C_Completed.jpg",
    description: {
      zh: "《Gravity》的再版 EP，以主打〈Rain〉延伸單戀與雨夜意象，並收錄粉絲最愛的〈Sun, Moon, Star〉。",
      en: "The repackage of `Gravity` built around title track “Rain,” expanding its rainy-night longing and featuring fan favorite “Sun, Moon, Star.”",
      ko: "타이틀곡 ‘Rain’을 중심으로 한 `Gravity` 리패키지 EP로, 비 내리는 밤의 짝사랑 감성을 확장하며 팬들이 사랑하는 ‘Sun, Moon, Star’를 수록했다.",
      ja: "『Gravity』のリパッケージEP。タイトル曲「Rain」で雨の夜と片思いの世界を広げ、ファン人気曲「Sun, Moon, Star」も収録。",
    },
    tracks: [
      { id: "track-rain", title: "Rain", duration: "3:43", songId: "song-rain" },
      { id: "track-think-about-you", title: "Think About You", duration: "3:33", songId: "song-think-about-you" },
      { id: "track-love-you", title: "Love You", duration: "3:12", songId: "song-love-you" },
      { id: "track-sun-moon-star", title: "Sun, Moon, Star", duration: "3:37", songId: "song-sun-moon-star" },
      { id: "track-good-night", title: "Good Night", duration: "2:30", songId: "song-good-night" },
    ],
  },
  {
    id: "album-airline",
    title: "KNK Airline",
    releaseDate: "2020-09-17",
    cover: "https://i.scdn.co/image/ab67616d0000b2732d0bbd10b473c6c14e2d26be",
    description: {
      zh: "以「搭乘專屬航空」為概念的 3.5 代迷你專輯，《Ride》與〈Highway〉體現團體成熟而都會的合成器音色。",
      en: "A concept mini-album that invites you onto KNK Airline; songs like “Ride” and “Highway” reveal their sleek synth-based city sound.",
      ko: "‘KNK Airline’에 탑승한다는 콘셉트의 미니앨범으로, ‘Ride’와 ‘Highway’가 성숙한 신스 사운드를 들려준다.",
      ja: "「KNK Airline」に搭乗するというコンセプトのミニアルバム。『Ride』『Highway』が大人っぽいシンセサウンドを描く。",
    },
    tracks: [
      { id: "track-ride", title: "Ride", duration: "3:20", songId: "song-ride" },
      { id: "track-what-do-you-think", title: "What Do You Think?", duration: "3:08", songId: "song-what-do-you-think" },
      { id: "track-highway", title: "Highway", duration: "3:14", songId: "song-highway" },
      { id: "track-understand", title: "Understand", duration: "3:42", songId: "song-understand" },
      { id: "track-ground", title: "Ground", duration: "3:41", songId: "song-ground" },
    ],
  },
  {
    id: "album-lonely-night",
    title: "Lonely Night",
    releaseDate: "2019-01-07",
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    description: {
      zh: "KNK 加入 220 Entertainment 後的第一張單曲專輯，由成員親自參與作詞作曲，主打展現城市夜晚的孤寂。",
      en: "The first single album after joining 220 Entertainment, self-written to capture the lonely glow of a city night.",
      ko: "220엔터테인먼트 합류 후 발표한 첫 싱글 앨범으로, 멤버들이 직접 작사·작곡해 도시의 외로운 밤을 그려냈다.",
      ja: "220 Entertainmentに移籍後初のシングルアルバム。メンバーが自作詞・作曲し、都会の孤独な夜を描き出す。",
    },
    tracks: [
      { id: "track-lonely-night", title: "Lonely Night", duration: "3:46", songId: "song-lonely-night" },
      { id: "track-day-by-day", title: "Day by Day", duration: "3:50", songId: "song-day-by-day" },
    ],
  },
  {
    id: "album-sunset",
    title: "KNK S/S Collection (Sunset)",
    releaseDate: "2019-07-15",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    description: {
      zh: "以夏夜霞光為靈感的單曲〈Sunset〉，由成員親自參與製作，搭配 cinematic MV 展現 KNK 成熟的城市感。",
      en: "A single inspired by summer dusk, co-produced by the members; the cinematic MV for “Sunset” highlights KNK’s sophisticated city aesthetic.",
      ko: "여름 노을에서 영감을 받은 싱글 ‘Sunset’을 멤버들이 직접 프로듀싱해 시네마틱한 무드와 도시적인 감각을 보여 준다.",
      ja: "夏の夕焼けをモチーフにメンバーが制作したシングル『Sunset』。シネマティックなMVで成熟した都会感を演出する。",
    },
    tracks: [
      { id: "track-sunset", title: "Sunset", duration: "3:20", songId: "song-sunset" },
      { id: "track-we-are-the-night", title: "We Are The Night", duration: "3:22", songId: "song-we-are-the-night" },
    ],
  },
];

interface AlbumProperties {
  Title: NotionTitleProperty;
  ReleaseDate?: NotionRichTextProperty;
  Cover?: NotionFilesProperty;
  Description?: NotionRichTextProperty;
  Tracks?: NotionRichTextProperty;
  Link?: NotionUrlProperty;
}

function mapTrackList(raw: string | undefined): TrackSummary[] {
  if (!raw) {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, duration] = line.split("|").map((part) => part.trim());
      return {
        id: `${title}-${index}`,
        title,
        duration,
      };
    });
}

function mapAlbum(page: NotionPage<AlbumProperties>): Album {
  const { properties } = page;
  return {
    id: page.id,
    title: getTitleValue(properties.Title),
    releaseDate: getRichTextValue(properties.ReleaseDate) || undefined,
    cover: getFirstFileUrl(properties.Cover) ?? sanitizeUrl(properties.Link?.url ?? undefined),
    description: getRichTextValue(properties.Description) || undefined,
    tracks: mapTrackList(getRichTextValue(properties.Tracks)),
  };
}

function buildFallbackAlbums(locale: AppLocale): Album[] {
  return fallbackAlbums.map((album) => ({
    ...album,
    description: album.description ? getLocalizedValue(album.description, locale) : undefined,
  }));
}

export async function fetchAlbums(locale: AppLocale = defaultLocale): Promise<Album[]> {
  const databaseId = process.env.NOTION_ALBUMS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildFallbackAlbums(locale);
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<AlbumProperties>>({
      database_id: databaseId,
      sorts: [{ property: "ReleaseDate", direction: "descending" }],
    });

    if (response.results.length === 0) {
      console.warn("No albums found in Notion, using fallback data");
      return buildFallbackAlbums(locale);
    }

    const albums = response.results
      .map((page) => {
        try {
          return mapAlbum(page as NotionPage<AlbumProperties>);
        } catch (error) {
          console.warn("Failed to map album", error);
          return null;
        }
      })
      .filter((album): album is Album => Boolean(album));

    if (albums.length === 0) {
      console.warn("No valid albums after mapping, using fallback data");
      return buildFallbackAlbums(locale);
    }

    return albums;
  } catch (error) {
    console.error("Failed to fetch albums", error);
    return buildFallbackAlbums(locale);
  }
}

export async function fetchSongIds(): Promise<string[]> {
  const albums = await fetchAlbums();
  const ids = albums
    .flatMap((album) => album.tracks)
    .map((track) => track.songId)
    .filter((id): id is string => Boolean(id));
  return ids.length ? ids : fallbackAlbums.flatMap((album) => album.tracks.map((track) => track.songId)).filter((id): id is string => Boolean(id));
}
