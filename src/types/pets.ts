export interface Pet {
  id: string;
  name: string;
  color: string;
  spriteRow: number;
  spriteSheet?: string;
  columns?: number;
  rows?: number;
  directionalRows?: {
    leftDown?: number;
    rightDown?: number;
    left?: number;
    right?: number;
    up?: number;
    default?: number;
  };
}

export interface PetSettings {
  enabled: boolean;
  activePets: Record<string, boolean>;
}

export const DEFAULT_PETS: Pet[] = [
  { id: "beta", name: "Beta", color: "#ff7ac3", spriteRow: 0 },
  { id: "gamma", name: "Gamma", color: "#ffd166", spriteRow: 1 },
  {
    id: "dongwon",
    name: "Dongwon",
    color: "#83e0ff",
    spriteRow: 2,
    spriteSheet: "/sprites/dongwon.png",
    columns: 3,
    rows: 5,
    directionalRows: {
      leftDown: 0,
      rightDown: 1,
      left: 2,
      right: 3,
      up: 4,
      default: 3,
    },
  },
  {
    id: "inseong",
    name: "Inseong",
    color: "#ff9f43",
    spriteRow: 1,
    spriteSheet: "/sprites/inseong.png",
    columns: 3,
    rows: 5,
    directionalRows: {
      leftDown: 0,
      rightDown: 1,
      left: 2,
      right: 3,
      up: 4,
      default: 3,
    },
  },
];

export const defaultPetSettings: PetSettings = {
  enabled: true,
  activePets: DEFAULT_PETS.reduce<Record<string, boolean>>((acc, pet) => {
    acc[pet.id] = true;
    return acc;
  }, {}),
};
