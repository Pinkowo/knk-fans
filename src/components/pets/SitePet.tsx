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
}

const SPRITE_SIZE = 64;
const SPRITE_SHEET = "/sprites/pets.png";

export default function SitePet() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  const petsRef = useRef<PetSprite[]>([]);
  const spriteImage = useRef<HTMLImageElement | null>(null);
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

    if (!spriteImage.current) {
      spriteImage.current = new Image();
      spriteImage.current.src = SPRITE_SHEET;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const initializePets = () => {
      const activePets = DEFAULT_PETS.filter((pet) => settings.activePets[pet.id]);
      petsRef.current = activePets.map((pet) => ({
        id: pet.id,
        x: Math.random() * (canvas.width - SPRITE_SIZE),
        y: Math.random() * (canvas.height - SPRITE_SIZE),
        vx: Math.random() * 0.6 + 0.2,
        vy: Math.random() * 0.6 + 0.2,
        frame: 0,
        spriteRow: pet.spriteRow,
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

        pet.frame = (pet.frame + 0.2) % 4;

        if (spriteImage.current?.complete) {
          ctx.drawImage(
            spriteImage.current,
            Math.floor(pet.frame) * SPRITE_SIZE,
            pet.spriteRow * SPRITE_SIZE,
            SPRITE_SIZE,
            SPRITE_SIZE,
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
      cancelAnimationFrame(animationRef.current!);
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
