"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import YouTube, { type YouTubeProps } from "react-youtube";

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
}

export default function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const t = useTranslations("guide.embed");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const options = useMemo<YouTubeProps["opts"]>(
    () => ({
      playerVars: {
        autoplay: 0,
        rel: 0,
        modestbranding: 1,
      },
    }),
    [],
  );

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
        <p>{t("error")}</p>
        <a
          className="mt-2 inline-flex items-center text-accent-pink underline"
          href={`https://www.youtube.com/watch?v=${videoId}`}
          rel="noreferrer"
          target="_blank"
        >
          {t("openExternally")}
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
          {t("loading")}
        </div>
      )}
      <YouTube
        className="absolute inset-0"
        opts={options}
        title={title}
        videoId={videoId}
        iframeClassName="absolute inset-0 h-full w-full"
        onError={() => setStatus("error")}
        onReady={() => setStatus("ready")}
      />
    </div>
  );
}
