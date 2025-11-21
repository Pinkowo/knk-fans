"use client";

interface YouTubeEmbedProps {
  title: string;
  videoId?: string;
  playlistId?: string;
}

export default function YouTubeEmbed({ videoId, playlistId, title }: YouTubeEmbedProps) {
  const src = playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}`
    : videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : null;

  if (!src) {
    return null;
  }

  return (
    <div className="relative h-0 w-full overflow-hidden rounded-3xl pb-[56.25%]">
      <iframe
        title={title}
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
