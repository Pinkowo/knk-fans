import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints";

import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedList, getLocalizedValue } from "@/lib/localization";
import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { GroupCharm, GuideCategory, GuideData, RecommendedItem } from "@/types/guide";
import type {
  NotionFilesProperty,
  NotionMultiSelectProperty,
  NotionNumberProperty,
  NotionPage,
  NotionProperties,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

type LocalizedRichTextKey = `${"Description" | "Title" | "Category"} (${AppLocale})`;

type LocalizedString = Record<AppLocale, string>;
type LocalizedTags = Record<AppLocale, string[]>;

interface LocalizedGuideItem {
  id: string;
  title: string;
  category: GuideCategory;
  link: string;
  thumbnail?: string;
  description: LocalizedString;
  tags: LocalizedTags;
}

interface LocalizedCharmItem {
  id: string;
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
  category: LocalizedString;
}

const guideSongs: LocalizedGuideItem[] = [
  {
    id: "guide-sun-moon-star",
    title: "Sun, Moon, Star (해, 달, 별)",
    category: "song",
    link: "https://www.youtube.com/watch?v=VtqT-rRQj2A",
    thumbnail: "https://i.ytimg.com/vi/VtqT-rRQj2A/maxresdefault.jpg",
    description: {
      zh: "2017 年《Gravity》主打歌，以憂鬱合成器與層疊和聲描寫無限思念，是感受 KNK 聲線最經典的一曲。",
      en: "The 2017 `Gravity` title track surrounds a moody synth ballad with layered harmonies, pouring endless longing and showcasing KNK’s signature vocals.",
      ko: "2017년 `Gravity` 활동의 타이틀곡으로, 우울한 신시사이저와 겹겹이 쌓인 하모니가 끝없는 그리움을 담아 KNK 보컬의 정수를 보여준다.",
      ja: "2017年『Gravity』期のタイトル曲。憂いを帯びたシンセと多層のハーモニーで果てない想いを描き、KNKの歌声を最も感じられる代表曲。",
    },
    tags: {
      zh: ["2017", "抒情", "現場和聲"],
      en: ["2017", "Ballad", "Live Vocal"],
      ko: ["2017", "발라드", "라이브 보컬"],
      ja: ["2017", "バラード", "ライブボーカル"],
    },
  },
  {
    id: "guide-sunset",
    title: "Sunset",
    category: "song",
    link: "https://www.youtube.com/watch?v=R9mW6In2-FY",
    thumbnail: "https://i.ytimg.com/vi/R9mW6In2-FY/maxresdefault.jpg",
    description: {
      zh: "2019 年由成員親自參與作詞，將城市夜景的孤獨拉成戲劇張力，舞台走位完全展現「長腿男團」優勢。",
      en: "Released in 2019 with lyrics penned by the members, it stretches the loneliness of the city skyline into cinematic tension while the blocking flaunts their tall silhouettes.",
      ko: "2019년 멤버들이 직접 작사에 참여해 도시의 밤을 영화 같은 긴장감으로 풀어내며, 긴 팔다리를 살린 동선으로 주목받았다.",
      ja: "2019年、メンバー自作詞で発表されたシングル。都会の夜景の孤独をシネマティックな緊張感に変え、長身を活かしたフォーメーションで魅せる。",
    },
    tags: {
      zh: ["2019", "自作詞", "舞台走位"],
      en: ["2019", "Self-written", "Performance"],
      ko: ["2019", "자가작사", "무대 동선"],
      ja: ["2019", "セルフライティング", "フォーメーション"],
    },
  },
  {
    id: "guide-back-again",
    title: "Back Again",
    category: "song",
    link: "https://www.youtube.com/watch?v=tp34Lfv3OLc",
    thumbnail: "https://i.ytimg.com/vi/tp34Lfv3OLc/maxresdefault.jpg",
    description: {
      zh: "出道作中的招牌舞曲，副歌爆炸力與刁鑽 Formation 讓人立刻記住 KNK 的存在感。",
      en: "Their debut single’s signature dance track, powered by an explosive drop and sharp formations that imprinted KNK’s presence instantly.",
      ko: "데뷔 싱글의 대표 댄스트랙으로, 폭발적인 드롭과 까다로운 포메이션이 KNK의 존재감을 각인시켰다.",
      ja: "デビュー作を象徴するダンストラック。爆発的なドロップと巧妙なフォーメーションでKNKの存在感を刻みつけた。",
    },
    tags: {
      zh: ["2016", "出道曲", "舞曲"],
      en: ["2016", "Debut", "Dance"],
      ko: ["2016", "데뷔", "댄스"],
      ja: ["2016", "デビュー", "ダンス"],
    },
  },
];

const guideShows: LocalizedGuideItem[] = [
  {
    id: "guide-weekly-idol",
    title: "Weekly Idol EP.297 — Random Play Dance",
    category: "stage",
    link: "https://www.youtube.com/watch?v=ylFw1rMjD0I",
    description: {
      zh: "2017 年 4 月播出，KNK 用 187cm 平均身高重現招牌刀群舞，還臨場改編 Limbo 挑戰。",
      en: "A 2017 Weekly Idol episode where the 187 cm lineup reworked Random Play Dance formations and even turned the limbo punishment into comedy.",
      ko: "2017년 4월 방영된 Weekly Idol로, 평균 187cm 라인업이 랜덤 플레이 댄스를 다시 짜고 림보 벌칙마저 웃음으로 채운 회차다.",
      ja: "2017年4月放送回。平均187cmのラインナップがランダムプレーダンスを組み直し、リンボー罰ゲームまでも笑いに変えた。",
    },
    tags: {
      zh: ["綜藝", "Random Play Dance"],
      en: ["Variety", "Random Play Dance"],
      ko: ["예능", "랜덤플레이댄스"],
      ja: ["バラエティ", "ランダムプレーダンス"],
    },
  },
  {
    id: "guide-idol-room",
    title: "Idol Room — Sunset 時期專訪",
    category: "variety",
    link: "https://www.youtube.com/watch?v=8zwvxPucE7Q",
    description: {
      zh: "2019 年宣傳《Sunset》時在 Idol Room 展示對位舞步與個人技，適合看團魂與默契任務。",
      en: "During the 2019 `Sunset` promotions they broke down stage blocking and played the one-second ending fairy challenge—perfect to feel their chemistry.",
      ko: "2019년 `Sunset` 활동 당시 Idol Room에서 동선 해설과 1초 엔딩 요정을 선보이며 팀워크를 보여주는 회차.",
      ja: "2019年『Sunset』期に出演したIdol Room。フォーメーション解説や1秒エンディング妖精チャレンジで団結力が伝わる。",
    },
    tags: {
      zh: ["訪談", "2019"],
      en: ["Interview", "2019"],
      ko: ["인터뷰", "2019"],
      ja: ["インタビュー", "2019"],
    },
  },
  {
    id: "guide-idol-radio",
    title: "Idol Radio Live — Lonely Night Acoustic",
    category: "variety",
    link: "https://www.youtube.com/watch?v=Yc5GlJ9KdKY",
    description: {
      zh: "MBC Idol Radio 版本的《Lonely Night》改編，直接聽見 Inseong 與 Jihun 的聲音控制。",
      en: "The MBC Idol Radio acoustic rendition of “Lonely Night,” spotlighting Inseong and Jihun’s vocal control up close.",
      ko: "MBC Idol Radio에서 들을 수 있는 'Lonely Night' 어쿠스틱 버전으로, 인성과 지훈의 보컬 컨트롤을 가까이서 느낄 수 있다.",
      ja: "MBC Idol Radioでの『Lonely Night』アコースティックバージョン。インソンとジフンのボーカルが際立つ。",
    },
    tags: {
      zh: ["Live", "Radio"],
      en: ["Live", "Radio"],
      ko: ["라이브", "라디오"],
      ja: ["ライブ", "ラジオ"],
    },
  },
];

const guideCharms: LocalizedCharmItem[] = [
  {
    id: "charm-height",
    icon: "📏",
    title: {
      zh: "187 公分的舞台排面",
      en: "187 cm Stage Lines",
      ko: "187cm 라인의 무대",
      ja: "187cmのステージライン",
    },
    description: {
      zh: "成員身高皆在 180cm 以上，是少數以「高層次群舞」聞名的男團。",
      en: "Every member stands over 180 cm, so their choreography leans on long limbs and multi-level formations.",
      ko: "멤버 전원이 180cm 이상이라 긴 팔다리와 고층 포메이션을 살린 군무가 시그니처다.",
      ja: "全員が180cm以上で、長い手足を活かした立体的なフォーメーションが代名詞。",
    },
    category: {
      zh: "舞台存在感",
      en: "Stage Presence",
      ko: "무대 존재감",
      ja: "ステージ",
    },
  },
  {
    id: "charm-vocal",
    icon: "🎙️",
    title: {
      zh: "厚實而立體的和聲",
      en: "Layered Harmonies",
      ko: "입체적인 하모니",
      ja: "重厚なハーモニー",
    },
    description: {
      zh: "Inseong 與 Jihun 領軍堆疊多軌聲線，《Rain》《Lonely Night》都是最佳示範。",
      en: "Inseong and Jihun lead dense, multi-track vocals—ballads like “Rain” and “Lonely Night” are prime examples.",
      ko: "인성과 지훈을 중심으로 다중 트랙 보컬을 쌓아 올려 'Rain', 'Lonely Night' 같은 곡에서 빛난다.",
      ja: "インソンとジフンを中心に多重トラックのボーカルを重ね、『Rain』『Lonely Night』で真価を発揮する。",
    },
    category: {
      zh: "聲線魅力",
      en: "Vocals",
      ko: "보컬",
      ja: "ボーカル",
    },
  },
  {
    id: "charm-self",
    icon: "✍️",
    title: {
      zh: "自作曲與導演感",
      en: "Self-produced Storytelling",
      ko: "셀프 프로듀싱 감각",
      ja: "セルフプロデュース",
    },
    description: {
      zh: "從《Lonely Night》《Sunset》開始親自作詞作曲、規劃 MV，呈現對城市夜景的獨特審美。",
      en: "Starting with “Lonely Night” and “Sunset,” they write, compose, and storyboard to express their cinematic take on city nights.",
      ko: "‘Lonely Night’, ‘Sunset’부터 작사·작곡과 MV 콘티까지 직접 맡아 도시의 밤을 그들만의 감성으로 담아낸다.",
      ja: "『Lonely Night』『Sunset』以降は作詞作曲からMVの演出まで手掛け、都会の夜を独自の感性で描いている。",
    },
    category: {
      zh: "創作力",
      en: "Creative",
      ko: "크리에이티브",
      ja: "クリエイティブ",
    },
  },
];

function buildGuideFallback(locale: AppLocale): GuideData {
  return {
    songs: guideSongs.map((song) => ({
      id: song.id,
      title: song.title,
      category: song.category,
      link: song.link,
      thumbnail: song.thumbnail,
      description: getLocalizedValue(song.description, locale),
      tags: getLocalizedList(song.tags, locale),
    })),
    shows: guideShows.map((show) => ({
      id: show.id,
      title: show.title,
      category: show.category,
      link: show.link,
      thumbnail: show.thumbnail,
      description: getLocalizedValue(show.description, locale),
      tags: getLocalizedList(show.tags, locale),
    })),
    charms: guideCharms.map((charm) => ({
      id: charm.id,
      icon: charm.icon,
      title: getLocalizedValue(charm.title, locale),
      description: getLocalizedValue(charm.description, locale),
      category: getLocalizedValue(charm.category, locale),
    })),
  };
}

type GuideDatabaseProperties = {
  Title: NotionTitleProperty;
  Description: NotionRichTextProperty;
  "Description (zh)"?: NotionRichTextProperty;
  "Description (ko)"?: NotionRichTextProperty;
  "Description (ja)"?: NotionRichTextProperty;
  "Description (en)"?: NotionRichTextProperty;
  Category: NotionSelectProperty;
  Link: NotionUrlProperty;
  Tags: NotionMultiSelectProperty;
  Thumbnail: NotionFilesProperty;
  Order: NotionNumberProperty;
};

type CharmDatabaseProperties = {
  Title: NotionTitleProperty;
  Description: NotionRichTextProperty;
  Category: NotionSelectProperty;
  Icon: NotionRichTextProperty;
  "Title (zh)"?: NotionRichTextProperty;
  "Title (ko)"?: NotionRichTextProperty;
  "Title (ja)"?: NotionRichTextProperty;
  "Title (en)"?: NotionRichTextProperty;
  "Description (zh)"?: NotionRichTextProperty;
  "Description (ko)"?: NotionRichTextProperty;
  "Description (ja)"?: NotionRichTextProperty;
  "Description (en)"?: NotionRichTextProperty;
  "Category (zh)"?: NotionRichTextProperty;
  "Category (ko)"?: NotionRichTextProperty;
  "Category (ja)"?: NotionRichTextProperty;
  "Category (en)"?: NotionRichTextProperty;
};

function getLocalizedRichText(
  properties: Record<string, NotionRichTextProperty | undefined>,
  baseKey: "Description" | "Title" | "Category",
  locale: AppLocale,
): string | undefined {
  const localizedKey = `${baseKey} (${locale})` as LocalizedRichTextKey;
  const defaultKey = `${baseKey} (${defaultLocale})` as LocalizedRichTextKey;
  return (
    getRichTextValue(properties[localizedKey]) ??
    getRichTextValue(properties[defaultKey]) ??
    getRichTextValue(properties[baseKey])
  );
}

function mapGuideItem(page: NotionPage<GuideDatabaseProperties>, locale: AppLocale): RecommendedItem {
  const { properties } = page;
  const categoryValue = properties.Category.select?.name?.toLowerCase() as GuideCategory | undefined;
  const categories: GuideCategory[] = ["song", "stage", "variety"];
  const category = categoryValue && categories.includes(categoryValue) ? categoryValue : "song";

  return {
    id: page.id,
    title: getTitleValue(properties.Title),
    description: getLocalizedRichText(properties, "Description", locale),
    category,
    link: sanitizeUrl(properties.Link?.url ?? undefined),
    thumbnail: getFirstFileUrl(properties.Thumbnail),
    tags: properties.Tags?.multi_select?.map((tag) => tag.name) ?? [],
  };
}

function mapCharmItem(page: NotionPage<CharmDatabaseProperties>, locale: AppLocale): GroupCharm {
  const { properties } = page;
  return {
    id: page.id,
    title: getLocalizedRichText(properties, "Title", locale) || getTitleValue(properties.Title),
    description: getLocalizedRichText(properties, "Description", locale),
    icon: getRichTextValue(properties.Icon) || "✨",
    category:
      getLocalizedRichText(properties, "Category", locale) ?? properties.Category.select?.name ?? "general",
  };
}

async function fetchCharmsFromNotion(locale: AppLocale) {
  const databaseId = process.env.NOTION_CHARMS_DATABASE_ID;
  if (!databaseId) {
    return buildGuideFallback(locale).charms;
  }

  const response = (await notionClient.queryDatabase<QueryDataSourceResponse>({
    database_id: databaseId,
    sorts: [{ property: "Order", direction: "ascending" }],
  })) as QueryDataSourceResponse;

  return response.results
    .map((page) => toNotionPage<CharmDatabaseProperties>(page))
    .filter((page): page is NotionPage<CharmDatabaseProperties> => Boolean(page))
    .map((page) => mapCharmItem(page, locale));
}

export async function fetchGuideData(locale: AppLocale = defaultLocale): Promise<GuideData> {
  const databaseId = process.env.NOTION_GUIDE_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildGuideFallback(locale);
  }

  try {
    const [guideResponse, charms] = await Promise.all([
      notionClient.queryDatabase<QueryDataSourceResponse>({
        database_id: databaseId,
        sorts: [{ property: "Order", direction: "ascending" }],
      }),
      fetchCharmsFromNotion(locale),
    ]);

    const items = guideResponse.results
      .map((page) => toNotionPage<GuideDatabaseProperties>(page))
      .filter((page): page is NotionPage<GuideDatabaseProperties> => Boolean(page))
      .map((page) => mapGuideItem(page, locale));

    if (items.length === 0 && charms.length === 0) {
      console.warn("No guide data found in Notion, using fallback data");
      return buildGuideFallback(locale);
    }

    return {
      songs: items.filter((item) => item.category === "song"),
      shows: items.filter((item) => item.category !== "song"),
      charms,
    };
  } catch (error) {
    console.error("Failed to fetch guide data", error);
    return buildGuideFallback(locale);
  }
}

function isNotionPage<T extends NotionProperties>(page: unknown): page is NotionPage<T> {
  return Boolean(page) && typeof page === "object" && "properties" in (page as Record<string, unknown>);
}

function toNotionPage<T extends NotionProperties>(page: unknown): NotionPage<T> | null {
  return isNotionPage<T>(page) ? (page as NotionPage<T>) : null;
}
