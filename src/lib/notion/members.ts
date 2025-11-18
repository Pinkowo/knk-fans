import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints";

import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { Member, MemberStatus } from "@/types/member";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackMembers: Member[] = [
  {
    id: "default-seungjun",
    name: "Seungjun",
    status: "current",
    bio: "主唱與舞者，擅長以沉穩聲線撐起抒情段落，舞台存在感滿分。",
    position: "Main Vocal",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "default-inseong",
    name: "Inseong",
    status: "current",
    bio: "負責高音與清亮 ad-lib，私下是團隊開心果。",
    position: "Lead Vocal",
    photo: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "default-youjin",
    name: "Youjin",
    status: "former",
    bio: "以厚實聲線聞名的前主唱，現專注於個人音樂活動。",
    position: "Former Main Vocal",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
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
    const response = (await notionClient.queryDatabase<QueryDataSourceResponse>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    })) as QueryDataSourceResponse;

    return response.results
      .map((page) => {
        try {
          return mapMember(page as NotionPage<MemberDatabaseProperties>);
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
