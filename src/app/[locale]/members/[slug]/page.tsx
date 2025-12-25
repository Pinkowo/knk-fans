import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import MemberProfilePanel from "@/components/members/MemberProfilePanel";
import type { AppLocale } from "@/i18n";
import { fetchMemberBySlug, fetchMembers } from "@/lib/notion/members";
import { buildAlternates, buildPageUrl } from "@/lib/seo/metadata";

export const revalidate = 3600;

interface MemberPageParams {
  params: Promise<{ locale: AppLocale; slug: string }>;
}

export async function generateMetadata({ params }: MemberPageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const member = await fetchMemberBySlug(slug, locale);
  const path = `/members/${slug}`;
  const pageUrl = buildPageUrl(locale, path);

  if (!member) {
    const fallbackTitle = t("members.hero.heading");
    const fallbackDescription = t("members.hero.subheading");
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: buildAlternates(locale, path),
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: pageUrl,
      },
    };
  }

  const title = member.name;
  const description = member.bio || t("members.hero.subheading");
  const imageUrl = member.photo || member.cover;

  const metadata: Metadata = {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title,
      description,
      url: pageUrl,
    },
  };

  if (imageUrl) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [{ url: imageUrl, alt: title }],
    };
    metadata.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    };
  }

  return metadata;
}

export default async function MemberPage({ params }: MemberPageParams) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const member = await fetchMemberBySlug(slug, locale);

  if (!member) {
    notFound();
  }

  const path = `/members/${slug}`;
  const pageUrl = buildPageUrl(locale, path);
  const imageUrl = member.photo || member.cover;
  const sameAs = member.links?.map((link) => link.url).filter(Boolean);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    url: pageUrl,
    description: member.bio,
    ...(member.position ? { jobTitle: member.position } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
    memberOf: {
      "@type": "MusicGroup",
      name: "KNK",
    },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-12 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Link className="text-sm text-accent-teal transition hover:text-white" href={`/${locale}/members`}>
        ← {t("members.title")}
      </Link>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <MemberProfilePanel member={member} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const members = await fetchMembers();
  return members.map((member) => ({ slug: member.slug ?? member.id }));
}
