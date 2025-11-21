"use client";

import Image from "next/image";

import type { Member } from "@/types/member";

interface MemberCardProps {
  member: Member;
  onSelect: (member: Member) => void;
  priority?: boolean;
}

export default function MemberCard({ member, onSelect, priority = false }: MemberCardProps) {
  const label = member.position ? `${member.name} · ${member.position}` : member.name;

  return (
    <button
      type="button"
      onClick={() => onSelect(member)}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition hover:-translate-y-1 hover:border-white/20"
      aria-label={label}
    >
      {member.status === "former" ? (
        <></>
      ) : (
        <div className="relative h-80 w-full overflow-hidden">
          <Image
            src={
              member.photo ||
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80"
            }
            alt={member.name}
            fill
            sizes="(min-width: 768px) 25vw, 100vw"
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-105"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMyMjIyMzMnIC8+PC9zdmc+"
          />
        </div>
      )}
      <div className="relative flex flex-1 flex-col gap-2 p-6">
        <span className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {member.status === "current" ? "ACTIVE" : "FORMER"}
        </span>
        <p className="text-sm text-text-secondary">{member.position}</p>
        <h3 className="text-xl font-semibold text-white">{member.name}</h3>
        <p className="line-clamp-2 text-sm text-text-secondary/80">{member.bio}</p>
      </div>
    </button>
  );
}
