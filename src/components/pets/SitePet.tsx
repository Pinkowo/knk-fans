"use client";

import { useEffect, useRef } from "react";

import { usePetSettings } from "@/lib/hooks/usePetSettings";
import { randomAngle, randomFloat } from "@/lib/utils/random";
import { DEFAULT_PETS } from "@/types/pets";

interface PetSprite {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  frame: number;
  spriteRow: number;
  spriteSheet: string;
  columns: number;
  rows: number;
  directionalRows?:
    | {
        leftDown?: number;
        rightDown?: number;
        left?: number;
        right?: number;
        up?: number;
        default?: number;
      }
    | undefined;
  isMoving: boolean;
  stateUntil: number;
  lastRow: number;
}

const SPRITE_SIZE = 64;
const DEFAULT_SPRITE_SHEET = "/sprites/pets.png";
const DEFAULT_COLUMNS = 4;
const DEFAULT_ROWS = 4;
const VELOCITY_THRESHOLD = 0.08;
const BASE_SPEED = 0.35;
const MAX_SPEED = 0.7;
const MOVE_DURATION = { min: 2000, max: 4000 };
const PAUSE_DURATION = { min: 800, max: 1800 };

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function randomDuration(range: { min: number; max: number }) {
  return randomFloat(range.min, range.max);
}

function randomVelocity() {
  const angle = randomAngle();
  return {
    vx: Math.cos(angle) * BASE_SPEED,
    vy: Math.sin(angle) * BASE_SPEED,
  };
}

function clampVelocity(pet: PetSprite) {
  const magnitude = Math.hypot(pet.vx, pet.vy);
  if (magnitude > MAX_SPEED && magnitude > 0) {
    const scale = MAX_SPEED / magnitude;
    pet.vx *= scale;
    pet.vy *= scale;
  }
}

function resolveSpriteRow(pet: PetSprite) {
  const mapping = pet.directionalRows;
  if (!mapping) {
    return Math.min(pet.spriteRow, pet.rows - 1);
  }

  const vx = pet.vx;
  const vy = pet.vy;
  const movingLeft = vx < -VELOCITY_THRESHOLD;
  const movingRight = vx > VELOCITY_THRESHOLD;
  const movingDown = vy > VELOCITY_THRESHOLD;
  const movingUp = vy < -VELOCITY_THRESHOLD;
  const nearlyHorizontal = Math.abs(vy) <= VELOCITY_THRESHOLD;

  if (movingLeft && movingDown && mapping.leftDown !== undefined) {
    return mapping.leftDown;
  }

  if (movingRight && movingDown && mapping.rightDown !== undefined) {
    return mapping.rightDown;
  }

  if (movingLeft && nearlyHorizontal && mapping.left !== undefined) {
    return mapping.left;
  }

  if (movingRight && nearlyHorizontal && mapping.right !== undefined) {
    return mapping.right;
  }

  if (movingUp && mapping.up !== undefined) {
    return mapping.up;
  }

  if (mapping.default !== undefined) {
    return mapping.default;
  }

  return Math.min(pet.spriteRow, pet.rows - 1);
}

export default function SitePet() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const petsRef = useRef<PetSprite[]>([]);
  const spriteCache = useRef<Record<string, HTMLImageElement>>({});
  const { settings } = usePetSettings();

  useEffect(() => {
    if (!settings.enabled) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      petsRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const initializePets = () => {
      const activePets = DEFAULT_PETS.filter((pet) => settings.activePets[pet.id]);
      const existing = new Map(petsRef.current.map((pet) => [pet.id, pet]));

      activePets.forEach((pet) => {
        const sheetPath = pet.spriteSheet ?? DEFAULT_SPRITE_SHEET;
        if (!spriteCache.current[sheetPath]) {
          const image = new Image();
          image.src = sheetPath;
          spriteCache.current[sheetPath] = image;
        }
      });

      petsRef.current = activePets.map((pet) => {
        const sheetPath = pet.spriteSheet ?? DEFAULT_SPRITE_SHEET;
        const columns = pet.columns ?? DEFAULT_COLUMNS;
        const rows = pet.rows ?? DEFAULT_ROWS;
        const existingPet = existing.get(pet.id);

        if (existingPet) {
          existingPet.spriteSheet = sheetPath;
          existingPet.columns = columns;
          existingPet.rows = rows;
          existingPet.directionalRows = pet.directionalRows;
          existingPet.spriteRow = pet.spriteRow;
          existingPet.x = Math.min(existingPet.x, canvas.width - SPRITE_SIZE);
          existingPet.y = Math.min(existingPet.y, canvas.height - SPRITE_SIZE);
          return existingPet;
        }

        const initialVelocity = randomVelocity();
        return {
          id: pet.id,
          x: Math.random() * (canvas.width - SPRITE_SIZE),
          y: Math.random() * (canvas.height - SPRITE_SIZE),
          vx: initialVelocity.vx,
          vy: initialVelocity.vy,
          frame: 0,
          spriteRow: pet.spriteRow,
          spriteSheet: sheetPath,
          columns,
          rows,
          directionalRows: pet.directionalRows,
          isMoving: true,
          stateUntil: nowMs() + randomDuration(MOVE_DURATION),
          lastRow: pet.spriteRow,
        };
      });
    };

    initializePets();

    const update = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const currentTime = nowMs();
      petsRef.current.forEach((pet) => {
        if (currentTime >= pet.stateUntil) {
          pet.isMoving = !pet.isMoving;
          if (pet.isMoving) {
            const velocity = randomVelocity();
            pet.vx = velocity.vx;
            pet.vy = velocity.vy;
            pet.stateUntil = currentTime + randomDuration(MOVE_DURATION);
          } else {
            pet.vx = 0;
            pet.vy = 0;
            pet.stateUntil = currentTime + randomDuration(PAUSE_DURATION);
          }
        }
        clampVelocity(pet);

        pet.x += pet.vx;
        pet.y += pet.vy;

        if (pet.x <= 0 || pet.x >= width - SPRITE_SIZE) {
          pet.vx *= -1;
        }
        clampVelocity(pet);
        if (pet.y <= 0 || pet.y >= height - SPRITE_SIZE) {
          pet.vy *= -1;
        }

        const image = spriteCache.current[pet.spriteSheet];
        if (image?.complete) {
          const frameWidth = image.width / pet.columns || SPRITE_SIZE;
          const frameHeight = image.height / pet.rows || SPRITE_SIZE;
          const computedRow = resolveSpriteRow(pet);
          if (pet.isMoving) {
            pet.lastRow = computedRow;
          }
          const rowIndex = pet.isMoving ? computedRow : pet.lastRow;
          const columnIndex = pet.isMoving ? Math.floor(pet.frame) : Math.min(1, pet.columns - 1);

          ctx.drawImage(
            image,
            columnIndex * frameWidth,
            rowIndex * frameHeight,
            frameWidth,
            frameHeight,
            pet.x,
            pet.y,
            SPRITE_SIZE,
            SPRITE_SIZE,
          );

          if (pet.isMoving) {
            pet.frame = (pet.frame + 0.2) % pet.columns;
          } else {
            pet.frame = columnIndex;
          }
        }
      });

      animationRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [settings.enabled, settings.activePets]);

  if (!settings.enabled) {
    return null;
  }

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" width={1024} height={768} />;
}
