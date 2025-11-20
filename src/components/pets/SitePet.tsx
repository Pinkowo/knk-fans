"use client";

import { useEffect, useRef } from "react";

import { usePetSettings } from "@/lib/hooks/usePetSettings";
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
}

const SPRITE_SIZE = 64;
const DEFAULT_SPRITE_SHEET = "/sprites/pets.png";
const DEFAULT_COLUMNS = 4;
const DEFAULT_ROWS = 4;

export default function SitePet() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const petsRef = useRef<PetSprite[]>([]);
  const spriteCache = useRef<Record<string, HTMLImageElement>>({});
  const { settings } = usePetSettings();
  const targetRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
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
      activePets.forEach((pet) => {
        const sheetPath = pet.spriteSheet ?? DEFAULT_SPRITE_SHEET;
        if (!spriteCache.current[sheetPath]) {
          const image = new Image();
          image.src = sheetPath;
          spriteCache.current[sheetPath] = image;
        }
      });

      petsRef.current = activePets.map((pet) => ({
        id: pet.id,
        x: Math.random() * (canvas.width - SPRITE_SIZE),
        y: Math.random() * (canvas.height - SPRITE_SIZE),
        vx: Math.random() * 0.6 + 0.2,
        vy: Math.random() * 0.6 + 0.2,
        frame: 0,
        spriteRow: pet.spriteRow,
        spriteSheet: pet.spriteSheet ?? DEFAULT_SPRITE_SHEET,
        columns: pet.columns ?? DEFAULT_COLUMNS,
        rows: pet.rows ?? DEFAULT_ROWS,
      }));
    };

    initializePets();

    const update = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      petsRef.current.forEach((pet) => {
        if (settings.interactions && targetRef.current) {
          const dx = targetRef.current.x - pet.x;
          const dy = targetRef.current.y - pet.y;
          const distance = Math.hypot(dx, dy) || 1;
          pet.vx += (dx / distance) * 0.02;
          pet.vy += (dy / distance) * 0.02;
        }

        pet.x += pet.vx;
        pet.y += pet.vy;

        if (pet.x <= 0 || pet.x >= width - SPRITE_SIZE) {
          pet.vx *= -1;
        }
        if (pet.y <= 0 || pet.y >= height - SPRITE_SIZE) {
          pet.vy *= -1;
        }

        pet.frame = (pet.frame + 0.2) % pet.columns;

        const image = spriteCache.current[pet.spriteSheet];
        if (image?.complete) {
          const frameWidth = image.width / pet.columns || SPRITE_SIZE;
          const frameHeight = image.height / pet.rows || SPRITE_SIZE;
          const rowIndex = Math.min(pet.spriteRow, pet.rows - 1);

          ctx.drawImage(
            image,
            Math.floor(pet.frame) * frameWidth,
            rowIndex * frameHeight,
            frameWidth,
            frameHeight,
            pet.x,
            pet.y,
            SPRITE_SIZE,
            SPRITE_SIZE,
          );
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
  }, [settings]);

  useEffect(() => {
    if (!settings.interactions) {
      targetRef.current = null;
      return;
    }

    const handleClick = (event: MouseEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [settings.interactions]);

  if (!settings.enabled) {
    return null;
  }

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" width={1024} height={768} />;
}
