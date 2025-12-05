import { defaultLocale, type AppLocale } from "@/i18n";
import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue } from "@/lib/notion/utils";
import type {
  NotionFilesProperty,
  NotionNumberProperty,
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";
import type {
  GuideCategory,
  GuideContentByCategory,
  GuideContentItem,
  GuideContentResolvedItem,
} from "@/types/ui-ux";

export const GUIDE_CATEGORY_ORDER: GuideCategory[] = ["why-knk", "stage", "song", "variety"];

const FALLBACK_THUMBNAIL = "/images/guide/why-height.svg";

const guideContent: GuideContentItem[] = [
  {
    id: "why-height",
    category: "why-knk",
    title: {
      zh: "186 公分的舞台排面",
      en: "186 cm Stage Lines",
      ko: "186cm 라인의 무대",
      ja: "186cmのステージライン",
    },
    description: {
      zh: "成員身高皆在 180cm 以上，群舞展現錯落的線條與刀群舞張力。",
      en: "Every member stands over 180 cm which allows multilevel choreography and razor-sharp blocking.",
      ko: "멤버 전원이 180cm 이상으로 다층 포메이션과 칼군무를 압도적인 비율로 보여준다.",
      ja: "全員 180cm 以上の長身を活かし、立体的なフォーメーションと鋭い群舞で魅せる。",
    },
    thumbnail: "/images/guide/why-height.svg",
    videoId: "ylFw1rMjD0I",
    displayOrder: 1,
  },
  {
    id: "why-vocals",
    category: "why-knk",
    title: {
      zh: "厚實立體的和聲",
      en: "Layered Harmonies",
      ko: "입체적인 하모니",
      ja: "重厚なハーモニー",
    },
    description: {
      zh: "Inseong 與 Jihun 領軍堆疊多軌聲線，《Rain》《Lonely Night》都是最佳示範。",
      en: "Inseong and Jihun lead dense multi-track vocals—ballads like “Rain” and “Lonely Night” show their control.",
      ko: "인성과 지훈을 중심으로 다중 트랙 보컬을 쌓아올려 'Rain', 'Lonely Night'에서 빛난다.",
      ja: "インソンとジフンを中心に多重トラックのボーカルを重ね、『Rain』『Lonely Night』で真価を発揮。",
    },
    thumbnail: "/images/guide/why-vocal.svg",
    videoId: "Yc5GlJ9KdKY",
    displayOrder: 2,
  },
  {
    id: "why-creative",
    category: "why-knk",
    title: {
      zh: "自作曲與導演感",
      en: "Self-produced Storytelling",
      ko: "셀프 프로듀싱 감각",
      ja: "セルフプロデュース",
    },
    description: {
      zh: "從《Lonely Night》《Sunset》開始親自作詞作曲、規劃 MV，呈現城市夜景的獨特審美。",
      en: "Since “Lonely Night” and “Sunset,” they have written, composed, and storyboarded their own cinematic narratives.",
      ko: "'Lonely Night', 'Sunset'부터 작사·작곡과 MV 콘티까지 맡아 도시의 밤을 그들만의 감성으로 담아낸다.",
      ja: "『Lonely Night』『Sunset』以降は作詞・作曲・MV演出まで手掛け、都会の夜を独自の感性で描く。",
    },
    thumbnail: "/images/guide/why-creative.svg",
    videoId: "tp34Lfv3OLc",
    displayOrder: 3,
  },
  {
    id: "stage-weekly-idol",
    category: "stage",
    title: {
      zh: "Weekly Idol Random Play Dance",
      en: "Weekly Idol Random Play Dance",
      ko: "주간아이돌 랜덤플레이댄스",
      ja: "Weekly Idol ランダムプレーダンス",
    },
    description: {
      zh: "2017 年 4 月播出，KNK 用 186cm 平均身高重現招牌刀群舞，還臨場改編 Limbo 挑戰。",
      en: "The 2017 Weekly Idol episode where the 186 cm lineup reworked Random Play Dance formations and even improvised the limbo game.",
      ko: "2017년 주간아이돌 출연 회차로, 평균 186cm 라인이 랜덤플레이댄스를 재구성하고 림보 벌칙까지 웃음으로 채웠다.",
      ja: "2017年放送回。平均186cmのラインナップがランダムプレーダンスを再構成し、リンボ罰ゲームまで笑いに変えた。",
    },
    thumbnail: "https://i.ytimg.com/vi/ylFw1rMjD0I/maxresdefault.jpg",
    videoId: "ylFw1rMjD0I",
    displayOrder: 1,
  },
  {
    id: "stage-sunset",
    category: "stage",
    title: {
      zh: "Sunset 打歌舞台",
      en: "Sunset comeback stage",
      ko: "Sunset 컴백 무대",
      ja: "Sunset カムバックステージ",
    },
    description: {
      zh: "2019 年《Sunset》宣傳舞台，成員自行作詞的戲劇張力搭配立體走位，完全展現長腿男團優勢。",
      en: "During the 2019 “Sunset” promotions they paired self-written lyrics with cinematic blocking that flaunts their tall silhouettes.",
      ko: "2019년 'Sunset' 활동 당시 자작 가사와 시네마틱한 동선으로 긴 팔다리를 극대화했다.",
      ja: "2019年『Sunset』期の打歌舞台。自作詞のドラマ性と長身を活かしたフォーメーションが魅力。",
    },
    thumbnail: "https://i.ytimg.com/vi/R9mW6In2-FY/maxresdefault.jpg",
    videoId: "R9mW6In2-FY",
    displayOrder: 2,
  },
  {
    id: "song-sun-moon-star",
    category: "song",
    title: {
      zh: "Sun, Moon, Star (해, 달, 별)",
      en: "Sun, Moon, Star",
      ko: "해, 달, 별",
      ja: "Sun, Moon, Star",
    },
    description: {
      zh: "2017 年《Gravity》主打歌，以憂鬱合成器與層疊和聲描寫無限思念，是感受 KNK 聲線最經典的一曲。",
      en: "The 2017 `Gravity` title track surrounds a moody synth ballad with layered harmonies and endless yearning.",
      ko: "2017년 'Gravity' 활동의 타이틀곡으로, 우울한 신시사이저와 층층이 쌓인 하모니가 끝없는 그리움을 담았다.",
      ja: "2017年『Gravity』期のタイトル曲。憂いを帯びたシンセと多重ハーモニーで果てない想いを描く。",
    },
    thumbnail: "https://i.ytimg.com/vi/VtqT-rRQj2A/maxresdefault.jpg",
    videoId: "VtqT-rRQj2A",
    displayOrder: 1,
  },
  {
    id: "song-sunset",
    category: "song",
    title: {
      zh: "Sunset",
      en: "Sunset",
      ko: "Sunset",
      ja: "Sunset",
    },
    description: {
      zh: "2019 年由成員親自參與作詞，將城市夜景的孤獨拉成戲劇張力，舞台走位完全展現「長腿男團」優勢。",
      en: "Released in 2019 with lyrics penned by the members, it turns city loneliness into cinematic tension while flaunting their tall formation.",
      ko: "2019년 멤버들이 직접 작사에 참여해 도시의 밤을 영화 같은 긴장감으로 풀어냈다.",
      ja: "2019年、メンバー自作詞のシングル。都会の孤独をシネマティックな緊張感に変える。",
    },
    thumbnail: "https://i.ytimg.com/vi/R9mW6In2-FY/maxresdefault.jpg",
    videoId: "R9mW6In2-FY",
    displayOrder: 2,
  },
  {
    id: "song-back-again",
    category: "song",
    title: {
      zh: "Back Again",
      en: "Back Again",
      ko: "Back Again",
      ja: "Back Again",
    },
    description: {
      zh: "出道作中的招牌舞曲，副歌爆炸力與刁鑽 Formation 讓人立刻記住 KNK 的存在感。",
      en: "Their debut single’s signature dance track with an explosive drop and sharp formations that imprint KNK’s presence.",
      ko: "데뷔 싱글의 대표 댄스트랙으로 폭발적인 드롭과 까다로운 포메이션이 KNK의 존재감을 각인시킨다.",
      ja: "デビューを象徴するダンストラック。爆発的なドロップと巧妙なフォーメーションで記憶に残る。",
    },
    thumbnail: "https://i.ytimg.com/vi/tp34Lfv3OLc/maxresdefault.jpg",
    videoId: "tp34Lfv3OLc",
    displayOrder: 3,
  },
  {
    id: "variety-idol-room",
    category: "variety",
    title: {
      zh: "Idol Room Sunset 時期專訪",
      en: "Idol Room — Sunset Era Interview",
      ko: "아이돌룸 ‘Sunset’ 활동 인터뷰",
      ja: "Idol Room『Sunset』期インタビュー",
    },
    description: {
      zh: "2019 年宣傳《Sunset》時在 Idol Room 展示對位舞步與個人技，適合看團魂與默契任務。",
      en: "During the 2019 `Sunset` promotions they broke down stage blocking and played one-second ending fairy games—perfect for sensing their chemistry.",
      ko: "2019년 'Sunset' 활동 당시 동선 해설과 1초 엔딩요정을 선보이며 팀워크를 보여준 회차.",
      ja: "2019年『Sunset』期出演回。フォーメーション解説や一秒エンディング妖精チャレンジで団結力が伝わる。",
    },
    thumbnail: "https://i.ytimg.com/vi/8zwvxPucE7Q/maxresdefault.jpg",
    videoId: "8zwvxPucE7Q",
    displayOrder: 1,
  },
  {
    id: "variety-idol-radio",
    category: "variety",
    title: {
      zh: "Idol Radio Acoustic Session",
      en: "Idol Radio — Acoustic Session",
      ko: "아이돌라디오 어쿠스틱",
      ja: "Idol Radio アコースティック",
    },
    description: {
      zh: "MBC Idol Radio 版本的《Lonely Night》改編，直接聽見 Inseong 與 Jihun 的聲音控制。",
      en: "The MBC Idol Radio acoustic rendition of “Lonely Night,” spotlighting Inseong and Jihun’s vocal control.",
      ko: "MBC Idol Radio에서 들을 수 있는 'Lonely Night' 어쿠스틱 버전으로 보컬 컨트롤을 가까이서 느낄 수 있다.",
      ja: "MBC Idol Radio での『Lonely Night』アコースティック版。インソンとジフンの歌声が際立つ。",
    },
    thumbnail: "https://i.ytimg.com/vi/Yc5GlJ9KdKY/maxresdefault.jpg",
    videoId: "Yc5GlJ9KdKY",
    displayOrder: 2,
  },
];

type LocalizedTitleKey = `Title (${AppLocale})`;
type LocalizedDescriptionKey = `Description (${AppLocale})`;

type GuideLocalizedKey = LocalizedTitleKey | LocalizedDescriptionKey;

type GuideProperties = {
  Title: NotionTitleProperty;
  Category?: NotionSelectProperty;
  Description?: NotionRichTextProperty;
  Thumbnail?: NotionFilesProperty;
  Link?: NotionUrlProperty;
  Order?: NotionNumberProperty;
  VideoId?: NotionRichTextProperty;
} & Partial<Record<GuideLocalizedKey, NotionRichTextProperty>>;

function resolveLocalizedValue(locale: AppLocale, value?: Record<AppLocale, string>) {
  if (!value) {
    return undefined;
  }

  return value[locale] ?? value[defaultLocale];
}

function sortGuideItems(items: GuideContentResolvedItem[]): GuideContentResolvedItem[] {
  return [...items].sort((a, b) => {
    const categoryDiff =
      GUIDE_CATEGORY_ORDER.indexOf(a.category) - GUIDE_CATEGORY_ORDER.indexOf(b.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }
    return a.displayOrder - b.displayOrder;
  });
}

function getLocalizedTitle(properties: GuideProperties, locale: AppLocale) {
  const key = `Title (${locale})` as LocalizedTitleKey;
  const defaultKey = `Title (${defaultLocale})` as LocalizedTitleKey;
  return (
    getRichTextValue(properties[key]) ||
    getRichTextValue(properties[defaultKey]) ||
    getTitleValue(properties.Title)
  );
}

function getLocalizedDescription(properties: GuideProperties, locale: AppLocale) {
  const key = `Description (${locale})` as LocalizedDescriptionKey;
  const defaultKey = `Description (${defaultLocale})` as LocalizedDescriptionKey;
  return (
    getRichTextValue(properties[key]) ||
    getRichTextValue(properties[defaultKey]) ||
    getRichTextValue(properties.Description) ||
    undefined
  );
}

function normalizeGuideCategory(value?: string | null): GuideCategory | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
  if (normalized === "why" || normalized === "why-knk") {
    return "why-knk";
  }
  if (GUIDE_CATEGORY_ORDER.includes(normalized as GuideCategory)) {
    return normalized as GuideCategory;
  }
  return null;
}

function extractYouTubeVideoId(rawUrl?: string | null) {
  if (!rawUrl) {
    return undefined;
  }

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).trim();
      return id || undefined;
    }
    if (host.endsWith("youtube.com")) {
      const searchId = url.searchParams.get("v");
      if (searchId) {
        return searchId.trim();
      }
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length >= 2 && ["embed", "shorts", "live"].includes(segments[0])) {
        return segments[1].trim();
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function mapGuidePage(
  page: NotionPage<GuideProperties>,
  locale: AppLocale,
): GuideContentResolvedItem | null {
  const { properties } = page;
  const category = normalizeGuideCategory(properties.Category?.select?.name);
  if (!category) {
    return null;
  }

  const title = getLocalizedTitle(properties, locale);
  if (!title) {
    return null;
  }

  const description = getLocalizedDescription(properties, locale);
  const explicitVideoId = getRichTextValue(properties.VideoId)?.trim();
  const videoId = explicitVideoId || extractYouTubeVideoId(properties.Link?.url) || undefined;

  if (!videoId && category !== "why-knk") {
    return null;
  }

  const thumbnail =
    getFirstFileUrl(properties.Thumbnail) ??
    (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : FALLBACK_THUMBNAIL);
  const displayOrder = typeof properties.Order?.number === "number" ? properties.Order.number : 999;

  return {
    id: page.id,
    category,
    title,
    description,
    thumbnail,
    videoId: videoId ?? "placeholder-video",
    displayOrder,
  };
}

function resolveFallbackGuideContent(locale: AppLocale): GuideContentResolvedItem[] {
  const resolved = guideContent.map<GuideContentResolvedItem>((item) => ({
    id: item.id,
    category: item.category,
    title: item.title[locale] ?? item.title[defaultLocale],
    description: resolveLocalizedValue(locale, item.description),
    thumbnail: item.thumbnail,
    videoId: item.videoId,
    displayOrder: item.displayOrder,
  }));
  return sortGuideItems(resolved);
}

function mergeFallbackForMissingCategories(
  items: GuideContentResolvedItem[],
  locale: AppLocale,
): GuideContentResolvedItem[] {
  const missingCategories = GUIDE_CATEGORY_ORDER.filter(
    (category) => !items.some((item) => item.category === category),
  );

  if (missingCategories.length === 0) {
    return items;
  }

  const fallbackItems = resolveFallbackGuideContent(locale).filter((item) =>
    missingCategories.includes(item.category),
  );

  const deduped = fallbackItems.map((fallbackItem) => {
    if (items.some((item) => item.id === fallbackItem.id)) {
      return { ...fallbackItem, id: `fallback-${fallbackItem.id}` };
    }
    return fallbackItem;
  });

  return sortGuideItems([...items, ...deduped]);
}

async function fetchGuideContentFromNotion(
  locale: AppLocale,
): Promise<GuideContentResolvedItem[] | null> {
  const databaseId = process.env.NOTION_GUIDE_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return null;
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<GuideProperties>>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    if (!response.results.length) {
      console.warn("No guide entries found in Notion, falling back to static content");
      return null;
    }

    const items = response.results
      .map((page) => {
        try {
          return mapGuidePage(page, locale);
        } catch (error) {
          console.warn("Failed to map guide item", error);
          return null;
        }
      })
      .filter((item): item is GuideContentResolvedItem => Boolean(item));

    if (!items.length) {
      console.warn(
        "Guide entries returned by Notion contained no valid cards, using fallback content",
      );
      return null;
    }

    return mergeFallbackForMissingCategories(items, locale);
  } catch (error) {
    console.error("Failed to fetch guide content from Notion", error);
    return null;
  }
}

export async function getGuideContent(
  locale: AppLocale = defaultLocale,
): Promise<GuideContentResolvedItem[]> {
  const notionItems = await fetchGuideContentFromNotion(locale);
  if (notionItems) {
    return notionItems;
  }
  return resolveFallbackGuideContent(locale);
}

export async function getGuideContentSections(
  locale: AppLocale = defaultLocale,
): Promise<GuideContentByCategory> {
  const items = await getGuideContent(locale);
  return GUIDE_CATEGORY_ORDER.reduce((sections, category) => {
    sections[category] = items.filter((item) => item.category === category);
    return sections;
  }, {} as GuideContentByCategory);
}
