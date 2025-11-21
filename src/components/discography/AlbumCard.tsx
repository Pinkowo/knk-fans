import Image from "next/image";
import Link from "next/link";

import type { Album } from "@/types/music";

interface AlbumCardProps {
  album: Album;
  locale: string;
  priority?: boolean;
}

export default function AlbumCard({ album, locale, priority = false }: AlbumCardProps) {
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
          priority={priority}
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
          {album.tracks.map((track, index) => {
            const content = (
              <>
                <span className="flex items-center gap-2">
                  <span>{index + 1}.</span>
                  <span className="hover-highlight">{track.title}</span>
                </span>
                {track.duration && <span>{track.duration}</span>}
              </>
            );
            const hoverUnderline =
              "group relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-2 transition hover:bg-white/5 hover:text-white after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-accent-pink after:via-brand-400 after:to-accent-teal after:transition-transform after:duration-300 group-hover:after:scale-x-100";

            return (
              <li key={track.id}>
                {track.songId ? (
                  <Link href={`/${locale}/discography/${track.songId}`} className={hoverUnderline} aria-label={track.title}>
                    {content}
                  </Link>
                ) : (
                  <div className={hoverUnderline} role="presentation" tabIndex={-1}>
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
