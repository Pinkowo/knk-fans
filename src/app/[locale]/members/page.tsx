import { getTranslations } from "next-intl/server";

import MembersGrid from "@/components/members/MembersGrid";
import { fetchMembers } from "@/lib/notion/members";

export const revalidate = 60 * 60; // 1 小時重新驗證

export default async function MembersPage() {
  const [t, members] = await Promise.all([getTranslations(), fetchMembers()]);

  const current = members.filter((member) => member.status === "current");
  const former = members.filter((member) => member.status === "former");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-teal">{t("members.title")}</p>
        <h1 className="text-4xl font-bold text-white md:text-5xl">{t("members.hero.heading")}</h1>
        <p className="text-base text-text-secondary">{t("members.hero.subheading")}</p>
      </header>
      <div className="mt-10">
        <MembersGrid current={current} former={former} />
      </div>
    </div>
  );
}
