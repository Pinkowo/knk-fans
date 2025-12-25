"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import MemberProfilePanel from "@/components/members/MemberProfilePanel";
import type { Member } from "@/types/member";

interface MemberModalProps {
  member: Member | null;
  onClose: () => void;
}

export default function MemberModal({ member, onClose }: MemberModalProps) {
  const t = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openingRafRef = useRef<number | null>(null);
  const titleId = member ? `member-modal-title-${member.id}` : undefined;
  const descriptionId = member ? `member-modal-desc-${member.id}` : undefined;
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

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      handleClose();
    }
  };

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
            className={`fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/70 p-4 md:p-6 ${isClosing ? "pointer-events-none" : ""}`}
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
              <MemberProfilePanel
                member={member}
                embedEnabled={!isClosing}
                titleId={titleId}
                descriptionId={descriptionId}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
