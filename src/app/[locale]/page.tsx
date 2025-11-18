import { getTranslations } from "next-intl/server";

import GroupCharms from "@/components/guide/GroupCharms";
import RecommendedShows from "@/components/guide/RecommendedShows";
import RecommendedSongs from "@/components/guide/RecommendedSongs";
import { fetchGuideData } from "@/lib/notion/guide";

export default async function GuidePage() {
  const [t, guideData] = await Promise.all([getTranslations(), fetchGuideData()]);

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-6xl px-6 pt-12 text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-pink">
          {t("nav.home")}
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
          {t("guide.hero.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          {t("guide.hero.subtitle")}
        </p>
      </section>
      <RecommendedSongs items={guideData.songs} />
      <RecommendedShows items={guideData.shows} />
      <GroupCharms charms={guideData.charms} />
    </div>
  );
}
