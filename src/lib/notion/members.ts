import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { Member, MemberStatus } from "@/types/member";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackMembers: Member[] = [
  {
    id: "inseong",
    name: "Inseong (허인성)",
    status: "current",
    bio: "1994 年 7 月 1 日出生，主唱兼聲樂指導。以寬廣音域與穩定高音著稱，參與〈Lonely Night〉、〈Sunset〉作詞，並活躍於音樂劇《Midnight Sun》《On Air》。",
    position: "Main Vocal / Vocal Director",
    photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/in_ddoni/" }],
  },
  {
    id: "jihun",
    name: "Jihun (김지훈)",
    status: "current",
    bio: "1995 年 2 月 20 日出生的隊長，主力舞者兼副唱。以細膩表情與精準走位著名，是〈Gone〉、〈Ride〉舞台的編舞顧問，現役公益兵服役中。",
    position: "Leader / Main Dancer",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/hvlf__00/" }],
  },
  {
    id: "dongwon",
    name: "Dongwon (이동원)",
    status: "current",
    bio: "1994 年 1 月 1 日出生，2018 年加入 KNK 的主唱。以磁性中低音補強團體厚度，負責〈Lonely Night〉中段的說唱段落，私下也是團隊音樂製作幫手。",
    position: "Lead Vocal",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/2_dongwon_/" }],
  },
  {
    id: "hyunjong",
    name: "Hyunjong (김현종)",
    status: "current",
    bio: "1994 年 9 月 17 日出生，2023 年 12 月宣布加入。曾以藝名 Hyunkyung 活動於 ROMEO，是 KNK 最新的主唱與副舞者，也參與《MIXNINE》節目並拿下 17 名。",
    position: "Vocal / Performer",
    photo: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/kimhyunzzong/" }],
  },
  {
    id: "seoham",
    name: "Seoham (박서함)",
    status: "former",
    bio: "1993 年生，藝名 Seoham，本名 Park Seung-jun。曾為 KNK 最顯眼的副唱與 Rapper，2018 年開始專注演戲並在《語意錯誤》中爆紅。",
    position: "Former Vocal / Rapper",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/parkseoham/" }],
  },
  {
    id: "heejun",
    name: "Heejun (오희준)",
    status: "former",
    bio: "1996 年生，KNK 的 Rapper 與吉他手，參與多首 B-side 作詞，2022 年離團後投入個人音樂與漫畫創作。",
    position: "Former Rapper / Guitar",
    photo: "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=640&q=80",
    links: [{ label: "Instagram", url: "https://www.instagram.com/imwoowow/" }],
  },
  {
    id: "youjin",
    name: "Youjin (김유진)",
    status: "former",
    bio: "KNK 初期的主唱，以厚實音色著稱。2018 年因健康離開團體，現專注於聲樂教學與個人音樂計畫。",
    position: "Former Main Vocal",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80",
  },
];

interface MemberDatabaseProperties {
  Name: NotionTitleProperty;
  Status: NotionSelectProperty;
  Bio?: NotionRichTextProperty;
  Position?: NotionRichTextProperty;
  Photo?: NotionFilesProperty;
  Profile?: NotionUrlProperty;
}

function mapMember(page: NotionPage<MemberDatabaseProperties>): Member {
  const { properties } = page;
  const status = (properties.Status.select?.name?.toLowerCase() as MemberStatus) || "current";

  const profileLink = sanitizeUrl(properties.Profile?.url ?? undefined);

  return {
    id: page.id,
    name: getTitleValue(properties.Name),
    status,
    bio: getRichTextValue(properties.Bio) || "",
    position: getRichTextValue(properties.Position) || undefined,
    photo: getFirstFileUrl(properties.Photo) ?? profileLink,
    links: profileLink ? [{ label: "Profile", url: profileLink }] : undefined,
  };
}

export async function fetchMembers(): Promise<Member[]> {
  const databaseId = process.env.NOTION_MEMBERS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallbackMembers;
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<MemberDatabaseProperties>>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapMember(page);
        } catch (error) {
          console.warn("Failed to map member", error);
          return null;
        }
      })
      .filter((member): member is Member => Boolean(member));
  } catch (error) {
    console.error("Failed to fetch members", error);
    return fallbackMembers;
  }
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const members = await fetchMembers();
  return members.find((member) => member.id === id) ?? null;
}
