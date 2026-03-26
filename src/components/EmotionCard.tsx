"use client";

import Link from "next/link";
import type { Emotion } from "@/data/emotions";

interface EmotionCardProps {
  emotion: Emotion;
  index: number;
}

// Subtle vertical offsets for organic stagger — cycles through a pattern
const offsets = [0, 2, -1, 3, -2, 1, -3, 2, 0, -2, 3, -1, 2, -3, 1];

export default function EmotionCard({ emotion, index }: EmotionCardProps) {
  const baseDelay = 400 + index * 50;
  const offset = offsets[index % offsets.length];

  return (
    <Link
      href={`/carry/${emotion.slug}`}
      className="
        group inline-flex items-center
        h-[38px] px-4
        rounded-full
        border border-olive/20
        bg-cream-light/80
        backdrop-blur-[2px]
        transition-all duration-400 ease-in-out
        hover:border-olive/40 hover:bg-olive-faint
        active:scale-[0.97]
        animate-reveal
      "
      style={{
        animationDelay: `${baseDelay}ms`,
        transform: `translateY(${offset}px)`,
      }}
    >
      <span className="font-[family-name:var(--font-nunito)] text-[0.82rem] font-medium text-title-brown group-hover:text-olive transition-colors duration-400 ease-in-out whitespace-nowrap">
        {emotion.label}
      </span>
    </Link>
  );
}
