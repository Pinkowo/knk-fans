import type { AppLocale } from "@/i18n";
import MemberModalRoute from "@/components/members/MemberModalRoute";
import { fetchMemberBySlug } from "@/lib/notion/members";

interface MemberModalPageParams {
  params: Promise<{ locale: AppLocale; slug: string }>;
}

export default async function MemberModalPage({ params }: MemberModalPageParams) {
  const { locale, slug } = await params;
  const member = await fetchMemberBySlug(slug, locale);

  if (!member) {
    return null;
  }

  return <MemberModalRoute member={member} />;
}
