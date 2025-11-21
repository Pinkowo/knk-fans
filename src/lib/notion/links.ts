import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedValue } from "@/lib/localization";
import { notionClient } from "@/lib/notion/client";
import { getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { ExternalLink } from "@/types/links";
import type {
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

type LocalizedLink = Omit<ExternalLink, "description"> & {
  description?: Record<AppLocale, string>;
};

const localizedLinks: LocalizedLink[] = [
  {
    id: "instagram",
    platform: "Instagram",
    url: "https://www.instagram.com/knk_official_knk/",
    description: {
      zh: "官方 IG，更新行程、概念照與 Hyunjong 入隊公告。",
      en: "Official Instagram with schedules, concept photos, and Hyunjong’s joining announcement.",
      ko: "공식 인스타그램으로 스케줄과 컨셉 사진, 현종 합류 소식을 확인할 수 있다.",
      ja: "公式Instagram。スケジュールやコンセプト写真、ヒョンジョン加入のお知らせを更新。",
    },
    icon: "📸",
  },
  {
    id: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/@knk_official",
    description: {
      zh: "크나큰 KNK 官方頻道，收看 MV、練習室與 vlog。",
      en: "Official KNK channel for music videos, practice clips, and vlogs.",
      ko: "KNK 공식 유튜브 채널로 MV와 연습 영상, 브이로그를 볼 수 있다.",
      ja: "KNK公式YouTubeチャンネル。MVや練習動画、Vlogをチェックできる。",
    },
    icon: "▶️",
  },
  {
    id: "twitter",
    platform: "X (Twitter)",
    url: "https://twitter.com/KNKOFFICIAL220",
    description: {
      zh: "即時公告、巡演行程與粉絲活動資訊。",
      en: "Real-time announcements, tour schedules, and fan event updates.",
      ko: "실시간 공지와 투어 일정, 팬 이벤트 소식을 전한다.",
      ja: "リアルタイムなお知らせ、ツアースケジュール、ファンイベント情報を発信。",
    },
    icon: "🐦",
  },
  {
    id: "fancafe",
    platform: "Daum Fan Cafe",
    url: "https://cafe.daum.net/knkofficial",
    description: {
      zh: "韓國官方 Fan Cafe，可查閱公告、行程與成員手寫信。",
      en: "Official Korean fan café with announcements, schedules, and handwritten letters.",
      ko: "공식 팬카페로 공지, 일정, 멤버 자필 편지 등을 확인할 수 있다.",
      ja: "韓国公式ファンカフェ。告知やスケジュール、メンバーの直筆メッセージを閲覧できる。",
    },
    icon: "💌",
  },
  {
    id: "spotify",
    platform: "Spotify",
    url: "https://open.spotify.com/artist/6tr0GrHnO8V9E1oSxYwJ8y",
    description: {
      zh: "串流 KNK 全部專輯與新單曲。",
      en: "Stream KNK’s entire discography and new singles.",
      ko: "KNK의 모든 앨범과 신곡을 스트리밍할 수 있다.",
      ja: "KNKの全ディスコグラフィーと新曲をストリーミング。",
    },
    icon: "🎧",
  },
];

interface LinkProperties {
  Title: NotionTitleProperty;
  URL: NotionUrlProperty;
  Description?: NotionRichTextProperty;
  Icon?: NotionRichTextProperty;
}

function mapLink(page: NotionPage<LinkProperties>): ExternalLink {
  const { properties } = page;
  return {
    id: page.id,
    platform: getTitleValue(properties.Title),
    url: sanitizeUrl(properties.URL?.url ?? undefined) ?? "#",
    description: getRichTextValue(properties.Description) || undefined,
    icon: getRichTextValue(properties.Icon) || undefined,
  };
}

function buildFallbackLinks(locale: AppLocale): ExternalLink[] {
  return localizedLinks.map((link) => ({
    ...link,
    description: link.description ? getLocalizedValue(link.description, locale) : undefined,
  }));
}

export async function fetchExternalLinks(locale: AppLocale = defaultLocale): Promise<ExternalLink[]> {
  const databaseId = process.env.NOTION_LINKS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildFallbackLinks(locale);
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<LinkProperties>>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapLink(page);
        } catch (error) {
          console.warn("Failed to map external link", error);
          return null;
        }
      })
      .filter((link): link is ExternalLink => Boolean(link));
  } catch (error) {
    console.error("Failed to fetch external links", error);
    return buildFallbackLinks(locale);
  }
}
