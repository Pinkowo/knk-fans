import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedValue } from "@/lib/localization";
import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { Member, MemberStatus } from "@/types/member";
import type {
  NotionDateProperty,
  NotionFilesProperty,
  NotionNumberProperty,
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

type LocalizedRichTextKey =
  `${"Bio" | "Position" | "Favorite Food" | "Disliked Food" | "Alcohol Tolerance" | "Hobbies" | "Special Skills" | "Solo Activities"} (${AppLocale})`;

type LocalizedMember = Omit<
  Member,
  "bio" | "position" | "favoriteFood" | "dislikedFood" | "alcoholTolerance" | "hobbies" | "specialSkills" | "soloActivities"
> & {
  bio: Record<AppLocale, string>;
  position?: Record<AppLocale, string>;
  favoriteFood?: Record<AppLocale, string>;
  dislikedFood?: Record<AppLocale, string>;
  alcoholTolerance?: Record<AppLocale, string>;
  hobbies?: Record<AppLocale, string>;
  specialSkills?: Record<AppLocale, string>;
  soloActivities?: Record<AppLocale, string>;
};

type ZodiacSign =
  | "capricorn"
  | "aquarius"
  | "pisces"
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius";

const ZODIAC_RANGES: Array<{
  id: ZodiacSign;
  start: [number, number];
  end: [number, number];
}> = [
  { id: "capricorn", start: [12, 22], end: [1, 19] },
  { id: "aquarius", start: [1, 20], end: [2, 18] },
  { id: "pisces", start: [2, 19], end: [3, 20] },
  { id: "aries", start: [3, 21], end: [4, 19] },
  { id: "taurus", start: [4, 20], end: [5, 20] },
  { id: "gemini", start: [5, 21], end: [6, 21] },
  { id: "cancer", start: [6, 22], end: [7, 22] },
  { id: "leo", start: [7, 23], end: [8, 22] },
  { id: "virgo", start: [8, 23], end: [9, 22] },
  { id: "libra", start: [9, 23], end: [10, 23] },
  { id: "scorpio", start: [10, 24], end: [11, 21] },
  { id: "sagittarius", start: [11, 22], end: [12, 21] },
];

const ZODIAC_LABELS: Record<AppLocale, Record<ZodiacSign, string>> = {
  zh: {
    capricorn: "摩羯座",
    aquarius: "水瓶座",
    pisces: "雙魚座",
    aries: "牡羊座",
    taurus: "金牛座",
    gemini: "雙子座",
    cancer: "巨蟹座",
    leo: "獅子座",
    virgo: "處女座",
    libra: "天秤座",
    scorpio: "天蠍座",
    sagittarius: "射手座",
  },
  en: {
    capricorn: "Capricorn",
    aquarius: "Aquarius",
    pisces: "Pisces",
    aries: "Aries",
    taurus: "Taurus",
    gemini: "Gemini",
    cancer: "Cancer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Scorpio",
    sagittarius: "Sagittarius",
  },
  ko: {
    capricorn: "염소자리",
    aquarius: "물병자리",
    pisces: "물고기자리",
    aries: "양자리",
    taurus: "황소자리",
    gemini: "쌍둥이자리",
    cancer: "게자리",
    leo: "사자자리",
    virgo: "처녀자리",
    libra: "천칭자리",
    scorpio: "전갈자리",
    sagittarius: "사수자리",
  },
  ja: {
    capricorn: "山羊座",
    aquarius: "水瓶座",
    pisces: "魚座",
    aries: "牡羊座",
    taurus: "牡牛座",
    gemini: "双子座",
    cancer: "蟹座",
    leo: "獅子座",
    virgo: "乙女座",
    libra: "天秤座",
    scorpio: "蠍座",
    sagittarius: "射手座",
  },
};

const AGE_SUFFIX: Record<AppLocale, string> = {
  zh: "歲",
  ko: "세",
  ja: "歳",
  en: "",
};

const localizedMembers: LocalizedMember[] = [
  {
    id: "inseong",
    name: "Inseong (허인성)",
    status: "current",
    bio: {
      zh: "1994 年 7 月 1 日出生，主唱兼聲樂指導。以寬廣音域與穩定高音著稱，參與〈Lonely Night〉、〈Sunset〉作詞，並活躍於音樂劇《Midnight Sun》《On Air》。",
      en: "Born July 1, 1994. Main vocal and vocal director with a wide range and steady high notes, co-wrote “Lonely Night” and “Sunset,” and appears in musicals such as Midnight Sun and On Air.",
      ko: "1994년 7월 1일생 메인보컬 겸 보컬 디렉터. 넓은 음역과 안정적인 고음으로 알려져 있으며 ‘Lonely Night’, ‘Sunset’ 작사에 참여했고 뮤지컬 ‘Midnight Sun’, ‘On Air’에 출연했다.",
      ja: "1994年7月1日生まれ。メインボーカル兼ボーカルディレクター。広い音域と安定した高音で知られ、『Lonely Night』『Sunset』の作詞に参加し、ミュージカル『Midnight Sun』『On Air』にも出演している。",
    },
    position: {
      zh: "主唱 / 聲樂指導",
      en: "Main Vocal / Vocal Director",
      ko: "메인보컬 / 보컬 디렉터",
      ja: "メインボーカル／ボーカルディレクター",
    },
    photo: "/images/members/inseong.jpg",
    links: [{ label: "Instagram", url: "https://www.instagram.com/in_ddoni/" }],
  },
  {
    id: "jihun",
    name: "Jihun (김지훈)",
    status: "current",
    bio: {
      zh: "1995 年 2 月 20 日出生的隊長，主力舞者兼副唱。以細膩表情與精準走位著名，是〈Gone〉、〈Ride〉舞台的編舞顧問，現役公益兵服役中。",
      en: "Leader born on February 20, 1995. Main dancer and vocalist known for expressive faces and precise blocking, choreo advisor for “Gone” and “Ride,” currently serving public service duty.",
      ko: "1995년 2월 20일생 리더이자 메인댄서. 섬세한 표정과 정확한 동선으로 사랑받으며 ‘Gone’, ‘Ride’ 무대의 안무 자문을 맡았고 현재 사회복무요원으로 복무 중이다.",
      ja: "1995年2月20日生まれのリーダー。メインダンサー兼ボーカルで、繊細な表情と正確なフォーメーションで知られ、『Gone』『Ride』の振付アドバイザーを務め、現在は公益勤務中。",
    },
    position: {
      zh: "隊長 / 主舞",
      en: "Leader / Main Dancer",
      ko: "리더 / 메인댄서",
      ja: "リーダー／メインダンサー",
    },
    photo: "/images/members/jihun.jpg",
    links: [{ label: "Instagram", url: "https://www.instagram.com/hvlf__00/" }],
  },
  {
    id: "dongwon",
    name: "Dongwon (이동원)",
    status: "current",
    bio: {
      zh: "1994 年 1 月 1 日出生，2018 年加入 KNK 的主唱。以磁性中低音補強團體厚度，負責〈Lonely Night〉中段的說唱段落，私下也是團隊音樂製作幫手。",
      en: "Born January 1, 1994 and joined KNK in 2018. A lead vocal with a magnetic mid-low tone who handles the rap-like section in “Lonely Night” and often assists with production.",
      ko: "1994년 1월 1일생으로 2018년에 합류한 보컬. 자성 같은 중저음으로 팀의 두께를 채우며 ‘Lonely Night’ 중반 랩 파트를 맡고, 비하인드에서는 음악 작업을 돕는다.",
      ja: "1994年1月1日生まれ。2018年にKNKへ加入したボーカル。磁力のような中低音で厚みを加え、『Lonely Night』中盤のラップパートも担当し、裏では制作も支える。",
    },
    position: {
      zh: "主唱",
      en: "Lead Vocal",
      ko: "리드보컬",
      ja: "リードボーカル",
    },
    photo: "/images/members/dongwon.jpg",
    links: [{ label: "Instagram", url: "https://www.instagram.com/2_dongwon_/" }],
  },
  {
    id: "hyunjong",
    name: "Hyunjong (김현종)",
    status: "current",
    bio: {
      zh: "1994 年 9 月 17 日出生，2023 年 12 月宣布加入。曾以藝名 Hyunkyung 活動於 ROMEO，是 KNK 最新的主唱與副舞者，也參與《MIXNINE》節目並拿下 17 名。",
      en: "Born September 17, 1994 and announced as a new member in December 2023. Previously promoted as Hyunkyung in ROMEO, now KNK’s newest vocal and performer who also ranked 17th on MIXNINE.",
      ko: "1994년 9월 17일생으로 2023년 12월 새 멤버로 합류했다. 과거 ROMEO에서 현경이라는 예명으로 활동했고, 믹스나인에서 17위를 기록한 보컬 겸 퍼포머다.",
      ja: "1994年9月17日生まれ。2023年12月に新メンバーとして合流。かつてROMEOでヒョンギョンとして活動し、MIXNINEでは17位を獲得したボーカル兼パフォーマー。",
    },
    position: {
      zh: "主唱 / 副舞者",
      en: "Vocal / Performer",
      ko: "보컬 / 퍼포머",
      ja: "ボーカル／パフォーマー",
    },
    photo: "/images/members/hyunjong.jpg",
    links: [{ label: "Instagram", url: "https://www.instagram.com/kimhyunzzong/" }],
  },
  {
    id: "seoham",
    name: "Seoham (박서함)",
    status: "former",
    bio: {
      zh: "1993 年生，藝名 Seoham，本名 Park Seung-jun。曾為 KNK 最顯眼的副唱與 Rapper，2018 年開始專注演戲並在《語意錯誤》中爆紅。",
      en: "Born in 1993; stage name Seoham (Park Seung-jun). A standout vocalist and rapper in KNK who left in 2018 to focus on acting and later rose to fame through “Semantic Error.”",
      ko: "1993년생으로 예명은 서함, 본명은 박승준. KNK에서 눈에 띄는 보컬 겸 래퍼였으며 2018년 연기에 집중하기 위해 팀을 떠난 뒤 드라마 ‘시맨틱 에러’로 큰 인기를 얻었다.",
      ja: "1993年生まれ。芸名ソハム（本名パク・スンジュン）。KNKで目立つボーカル兼ラッパーだったが2018年に演技へ専念するため脱退し、『セマンティックエラー』でブレイクした。",
    },
    position: {
      zh: "前任 副唱 / Rapper",
      en: "Former Vocal / Rapper",
      ko: "전 멤버 보컬 / 래퍼",
      ja: "元メンバー ボーカル／ラッパー",
    },
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/parkseoham/" }],
  },
  {
    id: "heejun",
    name: "Heejun (오희준)",
    status: "former",
    bio: {
      zh: "1996 年生，KNK 的 Rapper 與吉他手，參與多首 B-side 作詞，2022 年離團後投入個人音樂與漫畫創作。",
      en: "Born in 1996. KNK’s rapper and guitarist who penned several B-sides; left in 2022 to focus on solo music and comic work.",
      ko: "1996년생으로 KNK의 래퍼이자 기타리스트. 여러 수록곡 작사에 참여했고 2022년 팀을 떠나 개인 음악과 만화 작업을 이어가고 있다.",
      ja: "1996年生まれ。KNKのラッパー兼ギタリストで、多くのB面曲の作詞に参加。2022年に脱退後はソロ音楽と漫画制作に専念している。",
    },
    position: {
      zh: "前任 Rapper / 吉他手",
      en: "Former Rapper / Guitar",
      ko: "전 멤버 래퍼 / 기타",
      ja: "元メンバー ラッパー／ギタリスト",
    },
    photo:
      "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/imwoowow/" }],
  },
  {
    id: "youjin",
    name: "Youjin (김유진)",
    status: "former",
    bio: {
      zh: "KNK 初期的主唱，以厚實音色著稱。2018 年因健康離開團體，現專注於聲樂教學與個人音樂計畫。",
      en: "Original main vocal known for his rich tone; left in 2018 for health reasons and now focuses on vocal coaching and solo music projects.",
      ko: "KNK 초창기의 메인보컬로 묵직한 음색이 특징. 2018년 건강상의 이유로 탈퇴한 뒤 현재는 보컬 트레이닝과 개인 음악 활동에 집중하고 있다.",
      ja: "KNK初期のメインボーカルで、厚みのある声が魅力。2018年に健康上の理由で脱退し、現在はボーカルトレーニングやソロ音楽活動に専念している。",
    },
    position: {
      zh: "前任 主唱",
      en: "Former Main Vocal",
      ko: "전 멤버 메인보컬",
      ja: "元メンバー メインボーカル",
    },
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/k_yu.jin/" }],
  },
];

interface MemberDatabaseProperties {
  Name: NotionTitleProperty;
  Status: NotionSelectProperty;
  Slug?: NotionRichTextProperty;
  Bio?: NotionRichTextProperty;
  Position?: NotionRichTextProperty;
  Birthday?: NotionDateProperty;
  "Blood Type"?: NotionSelectProperty;
  MBTI?: NotionSelectProperty;
  Height?: NotionNumberProperty;
  "Representative Animal"?: NotionRichTextProperty;
  "Favorite Food"?: NotionRichTextProperty;
  "Disliked Food"?: NotionRichTextProperty;
  "Alcohol Tolerance"?: NotionRichTextProperty;
  Hobbies?: NotionRichTextProperty;
  "Special Skills"?: NotionRichTextProperty;
  "Solo Activities"?: NotionRichTextProperty;
  "Join Date"?: NotionDateProperty;
  "Leave Date"?: NotionDateProperty;
  "Bio (zh)"?: NotionRichTextProperty;
  "Bio (ko)"?: NotionRichTextProperty;
  "Bio (ja)"?: NotionRichTextProperty;
  "Bio (en)"?: NotionRichTextProperty;
  "Position (zh)"?: NotionRichTextProperty;
  "Position (ko)"?: NotionRichTextProperty;
  "Position (ja)"?: NotionRichTextProperty;
  "Position (en)"?: NotionRichTextProperty;
  "Favorite Food (zh)"?: NotionRichTextProperty;
  "Favorite Food (ko)"?: NotionRichTextProperty;
  "Favorite Food (ja)"?: NotionRichTextProperty;
  "Favorite Food (en)"?: NotionRichTextProperty;
  "Disliked Food (zh)"?: NotionRichTextProperty;
  "Disliked Food (ko)"?: NotionRichTextProperty;
  "Disliked Food (ja)"?: NotionRichTextProperty;
  "Disliked Food (en)"?: NotionRichTextProperty;
  "Alcohol Tolerance (zh)"?: NotionRichTextProperty;
  "Alcohol Tolerance (ko)"?: NotionRichTextProperty;
  "Alcohol Tolerance (ja)"?: NotionRichTextProperty;
  "Alcohol Tolerance (en)"?: NotionRichTextProperty;
  "Hobbies (zh)"?: NotionRichTextProperty;
  "Hobbies (ko)"?: NotionRichTextProperty;
  "Hobbies (ja)"?: NotionRichTextProperty;
  "Hobbies (en)"?: NotionRichTextProperty;
  "Special Skills (zh)"?: NotionRichTextProperty;
  "Special Skills (ko)"?: NotionRichTextProperty;
  "Special Skills (ja)"?: NotionRichTextProperty;
  "Special Skills (en)"?: NotionRichTextProperty;
  "Solo Activities (zh)"?: NotionRichTextProperty;
  "Solo Activities (ko)"?: NotionRichTextProperty;
  "Solo Activities (ja)"?: NotionRichTextProperty;
  "Solo Activities (en)"?: NotionRichTextProperty;
  Photo?: NotionFilesProperty;
  Profile?: NotionUrlProperty;
}

function getDateValue(property?: NotionDateProperty): string | undefined {
  return property?.date?.start ?? undefined;
}

function normalizeMemberSlug(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const base = value.split("(")[0]?.trim() ?? "";
  if (!base) {
    return undefined;
  }

  const slug = base
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || undefined;
}

function isWithinRange(
  month: number,
  day: number,
  [startMonth, startDay]: [number, number],
  [endMonth, endDay]: [number, number],
) {
  if (startMonth > endMonth || (startMonth === endMonth && startDay > endDay)) {
    return (
      month > startMonth ||
      (month === startMonth && day >= startDay) ||
      month < endMonth ||
      (month === endMonth && day <= endDay)
    );
  }
  if (month < startMonth || month > endMonth) {
    return false;
  }
  if (month === startMonth && day < startDay) {
    return false;
  }
  if (month === endMonth && day > endDay) {
    return false;
  }
  return true;
}

function getZodiacLabel(birthday?: string, locale: AppLocale = defaultLocale): string | undefined {
  if (!birthday) {
    return undefined;
  }
  const date = new Date(birthday);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const sign =
    ZODIAC_RANGES.find((range) => isWithinRange(month, day, range.start, range.end))?.id ?? "capricorn";
  return ZODIAC_LABELS[locale][sign];
}

function getAgeLabel(birthday?: string, locale: AppLocale = defaultLocale): string | undefined {
  if (!birthday) {
    return undefined;
  }
  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) {
    return undefined;
  }
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  if (!hasHadBirthday) {
    age -= 1;
  }
  if (age < 0) {
    return undefined;
  }
  const suffix = AGE_SUFFIX[locale] ?? "";
  return suffix ? `${age}${suffix}` : String(age);
}

function getLocalizedRichText(
  properties: MemberDatabaseProperties,
  baseKey:
    | "Bio"
    | "Position"
    | "Favorite Food"
    | "Disliked Food"
    | "Alcohol Tolerance"
    | "Hobbies"
    | "Special Skills"
    | "Solo Activities",
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

function mapMember(page: NotionPage<MemberDatabaseProperties>, locale: AppLocale): Member {
  const { properties } = page;
  const status = (properties.Status.select?.name?.toLowerCase() as MemberStatus) || "current";

  const profileLink = sanitizeUrl(properties.Profile?.url ?? undefined);
  const birthday = getDateValue(properties.Birthday);
  const name = getTitleValue(properties.Name);
  const rawSlug = getRichTextValue(properties.Slug) || name;
  const slug = normalizeMemberSlug(rawSlug) ?? page.id;

  return {
    id: page.id,
    slug,
    name,
    status,
    bio: getLocalizedRichText(properties, "Bio", locale) || "",
    position: getLocalizedRichText(properties, "Position", locale) || undefined,
    photo: getFirstFileUrl(properties.Photo) ?? profileLink,
    birthday,
    age: getAgeLabel(birthday, locale),
    zodiac: getZodiacLabel(birthday, locale),
    bloodType: properties["Blood Type"]?.select?.name ?? undefined,
    mbti: properties.MBTI?.select?.name ?? undefined,
    height: typeof properties.Height?.number === "number" ? `${properties.Height.number} cm` : undefined,
    representativeAnimal: getRichTextValue(properties["Representative Animal"]) || undefined,
    favoriteFood: getLocalizedRichText(properties, "Favorite Food", locale) || undefined,
    dislikedFood: getLocalizedRichText(properties, "Disliked Food", locale) || undefined,
    alcoholTolerance: getLocalizedRichText(properties, "Alcohol Tolerance", locale) || undefined,
    hobbies: getLocalizedRichText(properties, "Hobbies", locale) || undefined,
    specialSkills: getLocalizedRichText(properties, "Special Skills", locale) || undefined,
    soloActivities: getLocalizedRichText(properties, "Solo Activities", locale) || undefined,
    joinDate: getDateValue(properties["Join Date"]),
    leaveDate: getDateValue(properties["Leave Date"]),
    links: profileLink ? [{ label: "Profile", url: profileLink }] : undefined,
  };
}

function buildFallbackMembers(locale: AppLocale): Member[] {
  return localizedMembers.map((member) => ({
    ...member,
    slug: normalizeMemberSlug(member.name) ?? member.id,
    bio: getLocalizedValue(member.bio, locale),
    position: member.position ? getLocalizedValue(member.position, locale) : undefined,
    favoriteFood: member.favoriteFood ? getLocalizedValue(member.favoriteFood, locale) : undefined,
    dislikedFood: member.dislikedFood ? getLocalizedValue(member.dislikedFood, locale) : undefined,
    alcoholTolerance: member.alcoholTolerance
      ? getLocalizedValue(member.alcoholTolerance, locale)
      : undefined,
    hobbies: member.hobbies ? getLocalizedValue(member.hobbies, locale) : undefined,
    specialSkills: member.specialSkills ? getLocalizedValue(member.specialSkills, locale) : undefined,
    soloActivities: member.soloActivities ? getLocalizedValue(member.soloActivities, locale) : undefined,
  }));
}

export async function fetchMembers(locale: AppLocale = defaultLocale): Promise<Member[]> {
  const databaseId = process.env.NOTION_MEMBERS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildFallbackMembers(locale);
  }

  try {
    const response = await notionClient.queryDatabase<
      NotionQueryResponse<MemberDatabaseProperties>
    >({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    if (response.results.length === 0) {
      console.warn("No members found in Notion, using fallback data");
      return buildFallbackMembers(locale);
    }

    return response.results
      .map((page) => {
        try {
          return mapMember(page, locale);
        } catch (error) {
          console.warn("Failed to map member", error);
          return null;
        }
      })
      .filter((member): member is Member => Boolean(member));
  } catch (error) {
    console.error("Failed to fetch members", error);
    return buildFallbackMembers(locale);
  }
}

export async function fetchMemberById(
  id: string,
  locale: AppLocale = defaultLocale,
): Promise<Member | null> {
  const members = await fetchMembers(locale);
  return members.find((member) => member.id === id) ?? null;
}

export async function fetchMemberBySlug(
  slug: string,
  locale: AppLocale = defaultLocale,
): Promise<Member | null> {
  const members = await fetchMembers(locale);
  return members.find((member) => member.slug === slug || member.id === slug) ?? null;
}
