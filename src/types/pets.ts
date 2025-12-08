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

const DIRECTIONAL_ROWS = {
  leftDown: 0,
  rightDown: 1,
  left: 0,
  right: 1,
  up: 2,
  default: 0,
} as const;

export const DEFAULT_PETS: Pet[] = [
  {
    id: "jihun",
    name: "Jihun",
    color: "#ff7ac3",
    spriteRow: 0,
    spriteSheet: "/sprites/jihun.png",
    columns: 3,
    rows: 3,
    directionalRows: DIRECTIONAL_ROWS,
  },
  {
    id: "hyunjong",
    name: "Hyunjong",
    color: "#ffd166",
    spriteRow: 0,
    spriteSheet: "/sprites/hyunjong.png",
    columns: 3,
    rows: 3,
    directionalRows: DIRECTIONAL_ROWS,
  },
  {
    id: "dongwon",
    name: "Dongwon",
    color: "#83e0ff",
    spriteRow: 0,
    spriteSheet: "/sprites/dongwon.png",
    columns: 3,
    rows: 3,
    directionalRows: DIRECTIONAL_ROWS,
  },
  {
    id: "inseong",
    name: "Inseong",
    color: "#ff9f43",
    spriteRow: 0,
    spriteSheet: "/sprites/inseong.png",
    columns: 3,
    rows: 3,
    directionalRows: DIRECTIONAL_ROWS,
  },
];

export const defaultPetSettings: PetSettings = {
  enabled: true,
  activePets: DEFAULT_PETS.reduce<Record<string, boolean>>((acc, pet) => {
    acc[pet.id] = true;
    return acc;
  }, {}),
};
