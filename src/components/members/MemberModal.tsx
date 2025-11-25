"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Member } from "@/types/member";

interface MemberModalProps {
  member: Member | null;
  onClose: () => void;
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M16.5 3h-9A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 16.5 3zm3 12.5A3.5 3.5 0 0 1 16 19H8a3.5 3.5 0 0 1-3.5-3.5V7.5A3.5 3.5 0 0 1 8 4h8a3.5 3.5 0 0 1 3.5 3.5v7zm-7-7.25A4.75 4.75 0 1 0 17.25 13 4.76 4.76 0 0 0 12.5 8.25zm0 7.5A2.75 2.75 0 1 1 15.25 13 2.75 2.75 0 0 1 12.5 15.75zm4.88-8.88a1.12 1.12 0 1 0-1.12-1.12 1.13 1.13 0 0 0 1.12 1.12z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function MemberModal({ member, onClose }: MemberModalProps) {
  const t = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openingRafRef = useRef<number | null>(null);
  const titleId = member ? `member-modal-title-${member.id}` : undefined;
  const descriptionId = member ? `member-modal-desc-${member.id}` : undefined;
  const [latestPost, setLatestPost] = useState<{ handle: string; url: string | null } | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    if (closingTimeoutRef.current) {
      clearTimeout(closingTimeoutRef.current);
    }
    closingTimeoutRef.current = setTimeout(() => {
      setIsClosing(false);
    }, 400);
    onClose();
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!member) {
      if (openingRafRef.current !== null) {
        cancelAnimationFrame(openingRafRef.current);
        openingRafRef.current = null;
      }
      return;
    }

    openingRafRef.current = requestAnimationFrame(() => {
      setIsClosing(false);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      if (openingRafRef.current !== null) {
        cancelAnimationFrame(openingRafRef.current);
        openingRafRef.current = null;
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [member, handleClose]);

  const { instagramHandle, profileEmbedUrl, instagramLinkUrl } = useMemo(() => {
    if (!member) {
      return { instagramHandle: null, profileEmbedUrl: null, instagramLinkUrl: null };
    }
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
  }, [member]);

  useEffect(() => {
    if (!instagramHandle) {
      return;
    }

    let cancelled = false;

    const loadLatest = async () => {
      try {
        // indicate loading for this handle
        setLatestPost((prev) => (prev?.handle === instagramHandle ? prev : { handle: instagramHandle, url: null }));

        const response = await fetch(`/api/instagram/latest/${instagramHandle}`);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { embedUrl?: string };
        if (!cancelled) {
          setLatestPost({ handle: instagramHandle, url: data.embedUrl ?? null });
        }
      } catch (error) {
        console.warn("Failed to load instagram embed", error);
        if (!cancelled) {
          setLatestPost({ handle: instagramHandle, url: null });
        }
      }
    };

    void loadLatest();

    return () => {
      cancelled = true;
    };
  }, [instagramHandle]);

  const embedSrc = useMemo(() => {
    if (!instagramHandle) {
      return null;
    }
    const latestForHandle = latestPost?.handle === instagramHandle ? latestPost.url : null;
    return latestForHandle ?? profileEmbedUrl ?? null;
  }, [instagramHandle, latestPost, profileEmbedUrl]);

  const activeEmbedSrc = !isClosing ? embedSrc : null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      handleClose();
    }
  };

  const otherLinks = useMemo(() => {
    if (!member?.links) {
      return [];
    }
    return member.links.filter((link) => !link.url.includes("instagram.com"));
  }, [member]);

  return (
    <>
      {isClosing && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur"
          aria-hidden="true"
        >
          <div className="animate-pulse text-lg font-semibold text-gradient">{t("members.loading")}</div>
        </div>
      )}
      <AnimatePresence>
        {member ? (
          <motion.div
            ref={overlayRef}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 md:p-6 ${isClosing ? "pointer-events-none" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
          >
            <motion.div
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-surface-muted text-white md:min-h-[640px]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={member?.bio ? descriptionId : undefined}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-sm font-semibold text-white"
                aria-label={t("members.close")}
                ref={closeButtonRef}
              >
                {t("members.close")}
              </button>
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
                  <div className="flex flex-wrap gap-3">
                    {instagramHandle && instagramLinkUrl ? (
                      <a
                        href={instagramLinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white"
                      >
                        <InstagramIcon className="h-4 w-4" />
                        <span>@{instagramHandle}</span>
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
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
