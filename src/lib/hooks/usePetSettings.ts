"use client";

import { useCallback, useEffect } from "react";

import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { PetSettings } from "@/types/pets";
import { DEFAULT_PETS, defaultPetSettings } from "@/types/pets";

const STORAGE_KEY = "knk-pet-settings";

export function usePetSettings() {
  const [settings, setSettings] = useLocalStorage<PetSettings>(STORAGE_KEY, defaultPetSettings);

  useEffect(() => {
    setSettings((prev) => {
      const validIds = new Set(DEFAULT_PETS.map((pet) => pet.id));
      const baseActive = prev.activePets ?? defaultPetSettings.activePets;
      const nextActive = { ...baseActive };
      let changed = false;

      validIds.forEach((id) => {
        if (typeof nextActive[id] !== "boolean") {
          nextActive[id] = defaultPetSettings.activePets[id];
          changed = true;
        }
      });

      Object.keys(nextActive).forEach((id) => {
        if (!validIds.has(id)) {
          delete nextActive[id];
          changed = true;
        }
      });

      if (!changed && prev.activePets) {
        return prev;
      }

      return { ...prev, activePets: nextActive };
    });
  }, [setSettings]);

  const toggleEnabled = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, [setSettings]);

  const togglePet = useCallback(
    (petId: string) => {
      setSettings((prev) => {
        const nextActive = prev.activePets ?? defaultPetSettings.activePets;
        return {
          ...prev,
          activePets: {
            ...nextActive,
            [petId]: !nextActive[petId],
          },
        };
      });
    },
    [setSettings],
  );

  return { settings, setSettings, toggleEnabled, togglePet };
}
