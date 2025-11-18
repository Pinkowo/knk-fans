"use client";

import { useCallback } from "react";

import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { PetSettings } from "@/types/pets";
import { defaultPetSettings } from "@/types/pets";

const STORAGE_KEY = "knk-pet-settings";

export function usePetSettings() {
  const [settings, setSettings] = useLocalStorage<PetSettings>(STORAGE_KEY, defaultPetSettings);

  const toggleEnabled = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, [setSettings]);

  const togglePet = useCallback(
    (petId: string) => {
      setSettings((prev) => ({
        ...prev,
        activePets: { ...prev.activePets, [petId]: !prev.activePets[petId] },
      }));
    },
    [setSettings],
  );

  const toggleInteractions = useCallback(() => {
    setSettings((prev) => ({ ...prev, interactions: !prev.interactions }));
  }, [setSettings]);

  return { settings, setSettings, toggleEnabled, togglePet, toggleInteractions };
}
