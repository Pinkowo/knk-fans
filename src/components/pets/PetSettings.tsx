"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { usePetSettings } from "@/lib/hooks/usePetSettings";
import { DEFAULT_PETS } from "@/types/pets";
import { MUSIC_PLAYER_COLLAPSE_EVENT, PET_PANEL_CLOSE_EVENT } from "@/lib/constants/panels";

export default function PetSettingsPanel() {
  const t = useTranslations();
  const { settings, toggleEnabled, togglePet } = usePetSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => setOpen(false);

    window.addEventListener(PET_PANEL_CLOSE_EVENT, handleClose);
    return () => {
      window.removeEventListener(PET_PANEL_CLOSE_EVENT, handleClose);
    };
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }
    window.dispatchEvent(new Event(MUSIC_PLAYER_COLLAPSE_EVENT));
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40"
          aria-expanded={open}
        >
          {open ? t("pets.hide") : t("pets.show")}
        </button>
        {open && (
          <div className="absolute bottom-[calc(100%+12px)] right-0 w-72 space-y-4 rounded-3xl border border-white/15 bg-black/70 p-5 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{t("pets.globalToggle")}</span>
              <button
                type="button"
                onClick={toggleEnabled}
                aria-pressed={settings.enabled}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${settings.enabled ? "bg-accent-teal text-black" : "bg-white/10 text-text-secondary"}`}
              >
                {settings.enabled ? t("pets.enabled") : t("pets.disabled")}
              </button>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">{t("pets.characters")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {DEFAULT_PETS.map((pet) => {
                  const isActive = Boolean(settings.activePets?.[pet.id]);
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => togglePet(pet.id)}
                      aria-pressed={isActive}
                      className={`rounded-2xl border px-3 py-2 transition ${isActive ? "border-accent-pink text-white shadow-[0_0_15px_rgba(255,113,174,0.45)]" : "border-white/15 text-text-secondary hover:border-white/30 hover:text-white"}`}
                    >
                      {pet.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
