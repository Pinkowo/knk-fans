"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { SVGProps } from "react";

import type { Member } from "@/types/member";

type ProfileFieldKey =
  | "birthday"
  | "age"
  | "zodiac"
  | "bloodType"
  | "mbti"
  | "height"
  | "representativeAnimal"
  | "favoriteFood"
  | "dislikedFood"
  | "alcoholTolerance"
  | "hobbies"
  | "specialSkills"
  | "soloActivities"
  | "joinDate"
  | "leaveDate";

type ProfileFieldTranslationKey = `members.profileFields.${ProfileFieldKey}`;

interface MemberProfilePanelProps {
  member: Member;
  embedEnabled?: boolean;
  titleId?: string;
  descriptionId?: string;
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M16.5 3h-9A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 16.5 3zm3 12.5A3.5 3.5 0 0 1 16 19H8a3.5 3.5 0 0 1-3.5-3.5V7.5A3.5 3.5 0 0 1 8 4h8a3.5 3.5 0 0 1 3.5 3.5v7zm-7-7.25A4.75 4.75 0 1 0 17.25 13 4.76 4.76 0 0 0 12.5 8.25zm0 7.5A2.75 2.75 0 1 1 15.25 13 2.75 2.75 0 0 1 12.5 15.75zm4.88-8.88a1.12 1.12 0 1 0-1.12-1.12 1.13 1.13 0 0 0 1.12 1.12z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function MemberProfilePanel({
  member,
  embedEnabled = true,
  titleId,
  descriptionId,
}: MemberProfilePanelProps) {
  const t = useTranslations();

  const { instagramHandle, profileEmbedUrl, instagramLinkUrl } = useMemo(() => {
    const instagramLink = member.links?.find((link) => link.url.includes("instagram.com"));
    if (!instagramLink) {
      return { instagramHandle: null, profileEmbedUrl: null, instagramLinkUrl: null };
    }

    try {
      const url = new URL(instagramLink.url);
      const [handle] = url.pathname.split("/").filter(Boolean);
      if (!handle) {
        return { instagramHandle: null, profileEmbedUrl: null, instagramLinkUrl: null };
      }
      return {
        instagramHandle: handle,
        profileEmbedUrl: `https://www.instagram.com/${handle}/embed`,
        instagramLinkUrl: instagramLink.url,
      };
    } catch {
      return { instagramHandle: null, profileEmbedUrl: null, instagramLinkUrl: null };
    }
  }, [member.links]);

  const activeEmbedSrc = embedEnabled && instagramHandle ? profileEmbedUrl : null;

  const otherLinks = useMemo(() => {
    if (!member.links) {
      return [];
    }
    return member.links.filter((link) => !link.url.includes("instagram.com"));
  }, [member.links]);

  const profileDetails = useMemo<Array<{ key: ProfileFieldKey; value: string }>>(() => {
    const entries: Array<[ProfileFieldKey, string | undefined]> = [
      ["birthday", member.birthday],
      ["age", member.age],
      ["zodiac", member.zodiac],
      ["bloodType", member.bloodType],
      ["mbti", member.mbti],
      ["height", member.height],
      ["representativeAnimal", member.representativeAnimal],
      ["favoriteFood", member.favoriteFood],
      ["dislikedFood", member.dislikedFood],
      ["alcoholTolerance", member.alcoholTolerance],
      ["hobbies", member.hobbies],
      ["specialSkills", member.specialSkills],
      ["soloActivities", member.soloActivities],
      ["joinDate", member.joinDate],
      ["leaveDate", member.leaveDate],
    ];
    return entries.filter(([, value]) => Boolean(value)).map(([key, value]) => ({ key, value: value as string }));
  }, [member]);

  return (
    <div className="grid gap-0 md:grid-cols-2 md:min-h-[640px]">
      <div className="relative hidden h-full w-full overflow-hidden bg-black/30 md:block">
        <div className="absolute inset-0">
          {activeEmbedSrc ? (
            <iframe
              key={activeEmbedSrc}
              src={activeEmbedSrc}
              title={`${member.name} Instagram`}
              className="h-full w-full"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-muted via-surface to-black text-center text-sm font-semibold text-text-secondary">
              {t("members.instagram")}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-yellow">
          {member.status === "current" ? t("members.status.current") : t("members.status.former")}
        </span>
        <h3 className="text-3xl font-bold text-white" id={titleId}>
          {member.name}
        </h3>
        {member.position && <p className="text-sm text-accent-pink">{member.position}</p>}
        <p className="text-sm text-text-secondary" id={descriptionId}>
          {member.bio}
        </p>
        {profileDetails.length > 0 && (
          <ul className="space-y-1 text-sm text-white/90">
            {profileDetails.map(({ key, value }) => (
              <li key={`${member.id}-${key}`} className="flex items-start gap-2">
                <span className="text-accent-yellow">•</span>
                <span>
                  <span className="font-semibold text-white/80">
                    {t(`members.profileFields.${key}` as ProfileFieldTranslationKey)}
                  </span>
                  {": "}
                  <span>{value}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          {instagramHandle && instagramLinkUrl ? (
            <a
              href={instagramLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white"
            >
              <InstagramIcon className="h-4 w-4" />
              <span>{instagramHandle}</span>
            </a>
          ) : null}
          {otherLinks.map((link) => (
            <a
              key={`${member.id}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
