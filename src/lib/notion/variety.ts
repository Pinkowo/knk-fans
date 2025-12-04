import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedValue } from "@/lib/localization";
import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";
import type { VarietyCardItem } from "@/types/ui-ux";

interface NotionEpisode {
  id: string;
  title: string;
  videoId?: string;
  description?: string;
}

interface NotionVarietySeries {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  episodes: NotionEpisode[];
}

type LocalizedEpisode = {
  id: string;
  title: string;
  videoId: string;
  description?: Record<AppLocale, string>;
};

type LocalizedSeries = {
  id: string;
  name: string;
  description: Record<AppLocale, string>;
  cover?: string;
  episodes: LocalizedEpisode[];
};

const FALLBACK_THUMBNAIL = "/images/guide/why-height.svg";

const localizedSeries: LocalizedSeries[] = [
  {
    id: "weekly-idol-2017",
    name: "Weekly Idol EP.297",
    description: {
      zh: "2017 年《Sun, Moon, Star》回歸期的 Weekly Idol，領隊現場改編 Random Play Dance 展現長腿群舞。",
      en: "Weekly Idol during the 2017 “Sun, Moon, Star” era where the leader reworked Random Play Dance for their tall lineup.",
      ko: "2017년 ‘Sun, Moon, Star’ 활동기 주간아이돌로, 리더가 즉석에서 랜덤플레이댄스를 재구성한 명장면.",
      ja: "2017年『Sun, Moon, Star』期のWeekly Idol。リーダーが長身ライン向けにランダムプレーダンスを組み直した回。",
    },
    cover: "https://i.ytimg.com/vi/ylFw1rMjD0I/hqdefault.jpg",
    episodes: [
      {
        id: "weekly-idol-rpd",
        title: "Random Play Dance & Limbo Mission",
        videoId: "ylFw1rMjD0I",
        description: {
          zh: "包含招牌 RPD 與 90 度懲罰，充分展現 KNK 團魂。",
          en: "Features their trademark RPD segment and the hilarious 90-degree bow punishment.",
          ko: "랜덤플레이댄스와 90도 절 벌칙이 포함되어 KNK의 팀워크를 느낄 수 있다.",
          ja: "名物ランダムプレーダンスと90度お辞儀罰ゲームで団結力が伝わる。",
        },
      },
    ],
  },
  {
    id: "idol-room-sunset",
    name: "Idol Room",
    description: {
      zh: "宣傳《Sunset》時出演 JTBC《Idol Room》，包含走位解析與 Ending Fairy 挑戰。",
      en: "JTBC Idol Room appearance during the “Sunset” promo era with stage blocking demos and the ending fairy challenge.",
      ko: "‘Sunset’ 활동기의 JTBC Idol Room 출연분으로, 동선 해설과 엔딩요정 챌린지가 담겨 있다.",
      ja: "『Sunset』期に出演したJTBC Idol Room。フォーメーション解説やエンディング妖精チャレンジが楽しめる。",
    },
    cover: "https://i.ytimg.com/vi/8zwvxPucE7Q/hqdefault.jpg",
    episodes: [
      {
        id: "idol-room-choreo",
        title: "Sunset Promotion Clip",
        videoId: "8zwvxPucE7Q",
        description: {
          zh: "即興舞蹈與問答遊戲介紹單曲《Sunset》，快速了解成員性格。",
          en: "Improvised dances and quiz games that showcase each member while promoting “Sunset.”",
          ko: "즉흥 댄스와 퀴즈로 멤버 개성을 빠르게 느낄 수 있다.",
          ja: "即興ダンスやクイズでメンバーの個性を知れる。",
        },
      },
    ],
  },
  {
    id: "idol-radio-lonely-night",
    name: "Idol Radio Live",
    description: {
      zh: "MBC Idol Radio 現場帶來《Lonely Night》不插電版本與日常分享。",
      en: "MBC Idol Radio live acoustic rendition of “Lonely Night” plus candid talk.",
      ko: "MBC Idol Radio에서 선보인 'Lonely Night' 어쿠스틱 버전과 일상 토크.",
      ja: "MBC Idol Radio の『Lonely Night』アコースティックとトークを収録。",
    },
    cover: "https://i.ytimg.com/vi/Yc5GlJ9KdKY/hqdefault.jpg",
    episodes: [
      {
        id: "idol-radio-live",
        title: "Lonely Night Acoustic Stage",
        videoId: "Yc5GlJ9KdKY",
        description: {
          zh: "成員分配和聲與 ad-lib，展現穩定的 Live 實力。",
          en: "Each member handles harmonies and ad-libs, highlighting their live control.",
          ko: "멤버들이 하모니와 애드리브를 나눠 맡아 안정적인 라이브를 보여준다.",
          ja: "メンバーがハモやアドリブを分担し、安定したライブ力を披露。",
        },
      },
    ],
  },
];

interface SeriesProperties {
  Title: NotionTitleProperty;
  Description?: NotionRichTextProperty;
  Cover?: NotionFilesProperty;
  Episodes?: NotionRichTextProperty;
  Link?: NotionUrlProperty;
}

function parseEpisodes(raw?: string): NotionEpisode[] {
  if (!raw) {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, meta] = line.split("|").map((part) => part.trim());
      const [episodeNumber, videoId] = (meta || "").split(",").map((part) => part.trim());
      return {
        id: `${title}-${index}`,
        title: title || `Episode ${index + 1}`,
        videoId,
        description: episodeNumber ? `EP ${episodeNumber}` : undefined,
      };
    });
}

function mapSeries(page: NotionPage<SeriesProperties>): NotionVarietySeries {
  const { properties } = page;
  return {
    id: page.id,
    name: getTitleValue(properties.Title),
    description: getRichTextValue(properties.Description) || undefined,
    cover: getFirstFileUrl(properties.Cover) ?? sanitizeUrl(properties.Link?.url ?? undefined),
    episodes: parseEpisodes(getRichTextValue(properties.Episodes)),
  };
}

function flattenSeries(series: NotionVarietySeries[]): VarietyCardItem[] {
  const cards: VarietyCardItem[] = [];
  series.forEach((seriesItem, index) => {
    seriesItem.episodes.forEach((episode, episodeIndex) => {
      if (!episode.videoId) {
        return;
      }
      const safeUrl = sanitizeUrl(`https://www.youtube.com/watch?v=${episode.videoId}`);
      if (!safeUrl) {
        return;
      }
      cards.push({
        id: `${seriesItem.id}-${episode.id ?? `${index}-${episodeIndex}`}`,
        title: episode.title || seriesItem.name,
        description: episode.description ?? seriesItem.description,
        thumbnail: seriesItem.cover ?? FALLBACK_THUMBNAIL,
        externalUrl: safeUrl,
        tags: [seriesItem.name],
      });
    });
  });
  return cards;
}

function buildFallbackCards(locale: AppLocale): VarietyCardItem[] {
  const cards: VarietyCardItem[] = [];
  localizedSeries.forEach((series) => {
    series.episodes.forEach((episode) => {
      if (!episode.videoId) {
        return;
      }
      const safeUrl = sanitizeUrl(`https://www.youtube.com/watch?v=${episode.videoId}`);
      if (!safeUrl) {
        return;
      }

      cards.push({
        id: episode.id,
        title: episode.title,
        description:
          (episode.description ? getLocalizedValue(episode.description, locale) : undefined) ||
          getLocalizedValue(series.description, locale),
        thumbnail: series.cover ?? FALLBACK_THUMBNAIL,
        externalUrl: safeUrl,
        tags: [series.name],
      });
    });
  });
  return cards;
}

export async function fetchVarietyCards(locale: AppLocale = defaultLocale): Promise<VarietyCardItem[]> {
  const databaseId = process.env.NOTION_VARIETY_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildFallbackCards(locale);
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<SeriesProperties>>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    if (response.results.length === 0) {
      return buildFallbackCards(locale);
    }

    const series = response.results
      .map((page) => {
        try {
          return mapSeries(page);
        } catch (error) {
          console.warn("Failed to map variety series", error);
          return null;
        }
      })
      .filter((series): series is NotionVarietySeries => Boolean(series));

    const cards = flattenSeries(series);
    return cards.length > 0 ? cards : buildFallbackCards(locale);
  } catch (error) {
    console.error("Failed to fetch variety data", error);
    return buildFallbackCards(locale);
  }
}
