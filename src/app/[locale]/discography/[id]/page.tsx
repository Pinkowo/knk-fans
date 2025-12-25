import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import LyricsDisplay from "@/components/lyrics/LyricsDisplay";
import YouTubeEmbed from "@/components/music/YouTubeEmbed";
import type { AppLocale } from "@/i18n";
import { fetchSongIds } from "@/lib/notion/albums";
import { fetchSongById } from "@/lib/notion/songs";
import { buildAlternates, buildPageUrl } from "@/lib/seo/metadata";

interface SongPageParams {
  params: Promise<{ locale: AppLocale; id: string }>;
}

function extractYouTubeId(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v") ?? undefined;
    }
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1]?.split("/")[0];
    }
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    return pathSegments[pathSegments.length - 1];
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: SongPageParams): Promise<Metadata> {
  const { locale, id } = await params;
  const [t, song] = await Promise.all([getTranslations({ locale }), fetchSongById(id, locale)]);
  const path = `/discography/${id}`;
  const url = buildPageUrl(locale, path);

  if (!song) {
    const fallbackTitle = t("discography.hero.heading");
    const fallbackDescription = t("discography.hero.subheading");
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: buildAlternates(locale, path),
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url,
      },
    };
  }

  const title = song.title;
  const description = song.description ?? t("discography.hero.subheading");
  const youtubeId = extractYouTubeId(song.videoUrl);
  const thumbnailUrl = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined;

  const metadata: Metadata = {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title,
      description,
      url,
    },
  };

  if (thumbnailUrl) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [{ url: thumbnailUrl, width: 480, height: 360, alt: title }],
    };
    metadata.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [thumbnailUrl],
    };
  }

  return metadata;
}

export default async function SongPage({ params }: SongPageParams) {
  const { locale, id } = await params;
  const [t, song] = await Promise.all([getTranslations({ locale }), fetchSongById(id, locale)]);

  if (!song) {
    notFound();
  }

  const youtubeId = extractYouTubeId(song.videoUrl);
  const path = `/discography/${id}`;
  const pageUrl = buildPageUrl(locale, path);
  const thumbnailUrl = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined;

  const musicRecordingSchema = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: song.title,
    url: pageUrl,
    byArtist: {
      "@type": "MusicGroup",
      name: "KNK",
    },
    ...(song.album ? { inAlbum: { "@type": "MusicAlbum", name: song.album } } : {}),
    ...(song.description ? { description: song.description } : {}),
    ...(song.videoUrl ? { sameAs: song.videoUrl } : {}),
  };

  const videoObjectSchema =
    youtubeId && song.videoUrl
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: song.title,
          description: song.description ?? t("discography.hero.subheading"),
          thumbnailUrl: thumbnailUrl ? [thumbnailUrl] : undefined,
          embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
          contentUrl: song.videoUrl,
        }
      : null;

  return (
    <div className="text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(musicRecordingSchema) }}
      />
      {videoObjectSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }}
        />
      ) : null}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link className="text-sm text-accent-teal transition hover:text-white" href={`/${locale}/discography`}>
          ← {t("discography.back")}
        </Link>
        <div className="mt-4 space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-accent-yellow">{song.album}</p>
          <h1 className="text-4xl font-bold">{song.title}</h1>
          {song.description && <p className="text-text-secondary">{song.description}</p>}
        </div>
        {youtubeId && (
          <div className="mt-8">
            <YouTubeEmbed videoId={youtubeId} title={song.title} />
          </div>
        )}
      </div>
      <div className="mt-10">
        <LyricsDisplay lyrics={song.lyrics} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const ids = await fetchSongIds();
  return ids.map((id) => ({ id }));
}
