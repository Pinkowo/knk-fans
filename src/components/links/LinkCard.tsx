import type { ExternalLink } from "@/types/links";

interface LinkCardProps {
  link: ExternalLink;
}

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-pink">{link.platform}</p>
        <h3 className="text-2xl font-semibold text-white">{link.description}</h3>
        <p className="text-sm text-text-secondary">{link.url}</p>
      </div>
      <span className="text-2xl">{link.icon ?? "↗"}</span>
    </a>
  );
}
