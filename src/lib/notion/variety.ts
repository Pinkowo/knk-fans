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
import type { Episode, VarietySeries } from "@/types/variety";

type LocalizedEpisode = Omit<Episode, "description"> & {
  description?: Record<AppLocale, string>;
};

type LocalizedSeries = Omit<VarietySeries, "description" | "episodes"> & {
  description: Record<AppLocale, string>;
  episodes: LocalizedEpisode[];
};

const localizedSeries: LocalizedSeries[] = [
  {
    id: "weekly-idol-2017",
    name: "Weekly Idol EP.297",
    description: {
      zh: "2017 年《Sun, Moon, Star》回歸期上 Weekly Idol 的經典集數，隊長 Jihun 臨時改編 Random Play Dance 以符合長腿隊形。",
      en: "A classic 2017 Weekly Idol episode from the “Sun, Moon, Star” era where leader Jihun reworked Random Play Dance formations to fit their tall lineup.",
      ko: "2017년 ‘Sun, Moon, Star’ 활동기에 출연한 Weekly Idol 명장면으로, 리더 지훈이 긴 라인을 살리기 위해 랜덤플레이댄스를 즉석에서 재구성했다.",
      ja: "2017年『Sun, Moon, Star』期のWeekly Idol出演回。リーダーのジフンが長身ラインに合わせてランダムプレーダンスを即席で組み直した名場面。",
    },
    cover: "https://i.ytimg.com/vi/ylFw1rMjD0I/hqdefault.jpg",
    episodes: [
      {
        id: "weekly-idol-rpd",
        title: "Random Play Dance & Limbo Mission",
        episodeNumber: 297,
        videoId: "ylFw1rMjD0I",
        description: {
          zh: "包含招牌 RPD 與搞笑的 90 度鞠躬懲罰，充分展現 KNK 的團魂。",
          en: "Includes their trademark RPD segment and hilarious 90-degree bow punishment, showcasing the group’s teamwork.",
          ko: "대표 랜덤플레이댄스와 90도 절 벌칙이 담겨 있어 KNK의 팀워크를 느낄 수 있다.",
          ja: "名物ランダムプレーダンスと90度お辞儀の罰ゲームが収録され、団結力がよく分かる。",
        },
      },
    ],
  },
  {
    id: "idol-room-sunset",
    name: "Idol Room",
    description: {
      zh: "宣傳《Sunset》時出演 JTBC《Idol Room》，除了 Talk 之外也重現舞台走位與 1 秒 Ending Fairy 挑戰。",
      en: "JTBC Idol Room appearance during the “Sunset” promo era with talk segments plus stage blocking demos and a one-second ending fairy challenge.",
      ko: "‘Sunset’ 활동기 JTBC Idol Room 출연분으로, 토크 외에 동선 시연과 1초 엔딩 요정 챌린지가 담겨 있다.",
      ja: "『Sunset』期に出演したJTBC Idol Room。トークに加えてフォーメーション解説や1秒エンディング妖精チャレンジも楽しめる。",
    },
    cover: "https://i.ytimg.com/vi/8zwvxPucE7Q/hqdefault.jpg",
    episodes: [
      {
        id: "idol-room-choreo",
        title: "Sunset Promotion Clip",
        videoId: "8zwvxPucE7Q",
        description: {
          zh: "以即興舞蹈與問答遊戲介紹單曲《Sunset》，適合快速了解成員性格。",
          en: "Improvised dance and quiz games to introduce “Sunset,” perfect for grasping each member’s personality.",
          ko: "즉흥 댄스와 퀴즈 게임으로 ‘Sunset’을 소개해 멤버 성격을 빠르게 느낄 수 있다.",
          ja: "即興ダンスやクイズゲームで『Sunset』を紹介し、メンバーの個性がよく分かる。",
        },
      },
    ],
  },
  {
    id: "idol-radio-lonely-night",
    name: "Idol Radio Live",
    description: {
      zh: "MBC FM4U 的 Idol Radio 現場表演，KNK 帶來不插電版本的《Lonely Night》以及日常分享。",
      en: "MBC FM4U Idol Radio live performance with an unplugged version of “Lonely Night” and candid stories.",
      ko: "MBC FM4U Idol Radio 라이브로, 언플러그드 버전 ‘Lonely Night’와 일상 토크를 들을 수 있다.",
      ja: "MBC FM4U Idol Radioのライブステージ。『Lonely Night』のアンプラグドバージョンと素のトークが楽しめる。",
    },
    cover: "https://i.ytimg.com/vi/Yc5GlJ9KdKY/hqdefault.jpg",
    episodes: [
      {
        id: "idol-radio-live",
        title: "Lonely Night Acoustic Stage",
        videoId: "Yc5GlJ9KdKY",
        description: {
          zh: "成員各自負責和聲與即興 ad-lib，展現穩定 Live 實力。",
          en: "Each member takes harmony and ad-lib duties, highlighting their stable live vocals.",
          ko: "멤버들이 하모니와 애드리브를 나눠 맡아 안정적인 라이브 실력을 보여준다.",
          ja: "メンバーそれぞれがハーモニーやアドリブを担当し、安定したライブ力を披露する。",
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

function parseEpisodes(raw?: string): Episode[] {
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
        title,
        episodeNumber: Number(episodeNumber) || undefined,
        videoId,
      };
    });
}

function mapSeries(page: NotionPage<SeriesProperties>): VarietySeries {
  const { properties } = page;
  return {
    id: page.id,
    name: getTitleValue(properties.Title),
    description: getRichTextValue(properties.Description) || undefined,
    cover: getFirstFileUrl(properties.Cover) ?? sanitizeUrl(properties.Link?.url ?? undefined),
    episodes: parseEpisodes(getRichTextValue(properties.Episodes)),
  };
}

function buildFallbackSeries(locale: AppLocale): VarietySeries[] {
  return localizedSeries.map((series) => ({
    ...series,
    description: getLocalizedValue(series.description, locale),
    episodes: series.episodes.map((episode) => ({
      ...episode,
      description: episode.description ? getLocalizedValue(episode.description, locale) : undefined,
    })),
  }));
}

export async function fetchVarietySeries(locale: AppLocale = defaultLocale): Promise<VarietySeries[]> {
  const databaseId = process.env.NOTION_VARIETY_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildFallbackSeries(locale);
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<SeriesProperties>>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapSeries(page);
        } catch (error) {
          console.warn("Failed to map variety series", error);
          return null;
        }
      })
      .filter((series): series is VarietySeries => Boolean(series));
  } catch (error) {
    console.error("Failed to fetch variety series", error);
    return buildFallbackSeries(locale);
  }
}
