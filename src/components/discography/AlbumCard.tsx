import Image from "next/image";
import Link from "next/link";

import type { Album } from "@/types/music";

interface AlbumCardProps {
  album: Album;
  locale: string;
  trackLinkLabel: (title: string) => string;
}

export default function AlbumCard({ album, locale, trackLinkLabel }: AlbumCardProps) {

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="relative h-64 w-full">
        <Image
          src={
            album.cover ||
            "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=900&q=80"
          }
          alt={album.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMwZTIzMzYnIC8+PC9zdmc+"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent-yellow">{album.releaseDate}</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{album.title}</h3>
          {album.description && <p className="mt-1 text-sm text-text-secondary">{album.description}</p>}
        </div>
        <ul className="space-y-1 text-sm text-text-secondary">
          {album.tracks.map((track, index) => (
            <li className="flex items-center justify-between" key={track.id}>
              <span>
                {index + 1}. {track.title}
              </span>
              {track.duration && <span>{track.duration}</span>}
            </li>
          ))}
        </ul>
        {album.tracks.some((track) => track.songId) && (
          <div className="mt-auto flex flex-wrap gap-2 text-sm">
            {album.tracks
              .filter((track) => track.songId)
              .map((track) => (
                <Link
                  key={track.songId}
                  href={`/${locale}/discography/${track.songId}`}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/60"
                >
                  {trackLinkLabel(track.title)}
                </Link>
              ))}
          </div>
        )}
      </div>
    </article>
  );
}
