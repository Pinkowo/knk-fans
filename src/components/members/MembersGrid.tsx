"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import MemberCard from "@/components/members/MemberCard";
import MemberModal from "@/components/members/MemberModal";
import type { Member } from "@/types/member";

interface MembersGridProps {
  current: Member[];
  former: Member[];
}

export default function MembersGrid({ current, former }: MembersGridProps) {
  const t = useTranslations();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const sections = [
    { title: t("members.current"), members: current },
    { title: t("members.former"), members: former },
  ];

  return (
    <div className="space-y-16">
      {sections.map((section, sectionIndex) => {
        const headingId = `members-section-${sectionIndex}`;
        return (
          <section key={section.title} className="space-y-6" aria-labelledby={headingId}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm uppercase tracking-[0.3em] text-accent-teal" id={headingId}>
                {section.title}
              </h2>
              <span className="text-xs font-semibold text-text-secondary">
                {t("members.countLabel", { count: section.members.length })}
              </span>
            </div>
            {section.members.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {section.members.map((member, index) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onSelect={setSelectedMember}
                    priority={index < 3}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-text-secondary">
                {t("members.empty")}
              </p>
            )}
          </section>
        );
      })}

      <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
