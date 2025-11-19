"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import type { Member } from "@/types/member";

interface MemberModalProps {
  member: Member | null;
  onClose: () => void;
}

export default function MemberModal({ member, onClose }: MemberModalProps) {
  const t = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = member ? `member-modal-title-${member.id}` : undefined;
  const descriptionId = member ? `member-modal-desc-${member.id}` : undefined;

  useEffect(() => {
    if (!member) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-surface-muted text-white"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={member?.bio ? descriptionId : undefined}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-sm font-semibold text-white"
              aria-label={t("members.close")}
              ref={closeButtonRef}
            >
              {t("members.close")}
            </button>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative h-80 w-full">
                <Image
                  src={
                    member.photo ||
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMxNjIyMzMnIC8+PC9zdmc+"
                />
              </div>
              <div className="flex flex-col gap-4 p-8">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-yellow">
                  {member.status === "current"
                    ? t("members.status.current")
                    : t("members.status.former")}
                </span>
                <h3 className="text-3xl font-bold text-white" id={titleId}>
                  {member.name}
                </h3>
                {member.position && (
                  <p className="text-sm text-accent-pink">{member.position}</p>
                )}
                <p className="text-sm text-text-secondary" id={descriptionId}>
                  {member.bio}
                </p>
                {member.links && member.links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {member.links.map((link) => (
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
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
