"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { usePetSettings } from "@/lib/hooks/usePetSettings";
import { DEFAULT_PETS } from "@/types/pets";

export default function PetSettingsPanel() {
  const t = useTranslations();
  const { settings, toggleEnabled, togglePet, toggleInteractions } = usePetSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40"
        aria-expanded={open}
      >
        {open ? t("pets.hide") : t("pets.show")}
      </button>
      {open && (
        <div className="mt-3 w-72 space-y-4 rounded-3xl border border-white/15 bg-black/70 p-5 text-white shadow-xl">
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
              {DEFAULT_PETS.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => togglePet(pet.id)}
                  aria-pressed={settings.activePets[pet.id]}
                  className={`rounded-2xl border px-3 py-2 ${settings.activePets[pet.id] ? "border-accent-pink text-white" : "border-white/15 text-text-secondary"}`}
                >
                  {pet.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("pets.interactions")}</span>
            <button
              type="button"
              onClick={toggleInteractions}
              aria-pressed={settings.interactions}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${settings.interactions ? "bg-accent-teal text-black" : "bg-white/10 text-text-secondary"}`}
            >
              {settings.interactions ? t("pets.enabled") : t("pets.disabled")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
