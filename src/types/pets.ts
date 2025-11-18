export interface Pet {
  id: string;
  name: string;
  color: string;
  spriteRow: number;
}

export interface PetSettings {
  enabled: boolean;
  activePets: Record<string, boolean>;
  interactions: boolean;
}

export const DEFAULT_PETS: Pet[] = [
  { id: "beta", name: "Beta", color: "#ff7ac3", spriteRow: 0 },
  { id: "gamma", name: "Gamma", color: "#ffd166", spriteRow: 1 },
  { id: "delta", name: "Delta", color: "#83e0ff", spriteRow: 2 },
  { id: "epsilon", name: "Epsilon", color: "#b694ff", spriteRow: 3 },
];

export const defaultPetSettings: PetSettings = {
  enabled: true,
  activePets: DEFAULT_PETS.reduce<Record<string, boolean>>((acc, pet) => {
    acc[pet.id] = true;
    return acc;
  }, {}),
  interactions: true,
};
