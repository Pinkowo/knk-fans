import { getTranslations } from "next-intl/server";

interface AboutMePageParams {
  params: Promise<{ locale: string }>;
}

export default async function AboutMePage({ params }: AboutMePageParams) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-white">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-yellow">{t("aboutMe.title")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{t("aboutMe.heading")}</h1>
        <p className="text-base text-text-secondary">{t("aboutMe.subheading")}</p>
      </header>
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">{t("aboutMe.sections.story.title")}</h2>
        <p className="text-sm text-text-secondary">{t("aboutMe.sections.story.body")}</p>
      </section>
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">{t("aboutMe.sections.services.title")}</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-text-secondary">
          <li>{t("aboutMe.sections.services.items.showcase")}</li>
          <li>{t("aboutMe.sections.services.items.community")}</li>
          <li>{t("aboutMe.sections.services.items.localization")}</li>
        </ul>
      </section>
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">{t("aboutMe.sections.contact.title")}</h2>
        <p className="text-sm text-text-secondary">{t("aboutMe.sections.contact.body")}</p>
        <div className="flex flex-col gap-1 text-sm">
          <a className="text-accent-teal" href="mailto:hello@knkfansite.tw">hello@knkfansite.tw</a>
          <a className="text-accent-pink" href="https://instagram.com/knkfansite" target="_blank" rel="noopener noreferrer">
            {t("aboutMe.sections.contact.instagram")}
          </a>
        </div>
      </section>
    </div>
  );
}
