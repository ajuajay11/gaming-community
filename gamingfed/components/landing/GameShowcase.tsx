"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRevealOnScroll } from "@/components/landing/ScrollReveal";

interface Game {
  key: "gta" | "pubg" | "football" | "valorant" | "freeFire";
  img: string;
  className: string;
  dir: "left" | "right";
}

const GAMES: Game[] = [
  { key: "gta", img: "/images/gta_v_character.png", className: "gta-v", dir: "left" },
  { key: "pubg", img: "/images/pubg_character.png", className: "pubg", dir: "right" },
  {
    key: "football",
    img: "/images/messi_ronaldo_neymar_gaming_style.png",
    className: "football",
    dir: "left",
  },
  { key: "valorant", img: "/images/fortnite_character.png", className: "valorant", dir: "left" },
  {
    key: "freeFire",
    img: "/images/free_fire_character.png",
    className: "free-fire",
    dir: "right",
  },
];

const DEFAULT_EXPANDED_INDEX = Math.max(
  0,
  GAMES.findIndex((g) => g.className === "football"),
);

function ShowcaseColumn({
  name,
  g,
  idx,
  expandedIndex,
  onHover,
}: {
  name: string;
  g: Game;
  idx: number;
  expandedIndex: number;
  onHover: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRevealOnScroll(ref, {
    variant: g.dir === "left" ? "slide-left" : "slide-right",
    delay: idx * 0.07,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "game-item",
        g.className,
        expandedIndex === idx && "game-item--expanded",
      )}
      onMouseEnter={() => onHover(idx)}
    >
      <div className="glow" aria-hidden />
      <span className="game-name">{name}</span>
      <div className="game-item-media">
        <Image
          src={g.img}
          alt={`${name} character`}
          fill
          sizes="(min-width: 768px) 22vw, 100vw"
          className={cn(
            "game-thumb",
            g.className === "football" && "game-thumb--poster",
          )}
          priority={idx === 0 || idx === DEFAULT_EXPANDED_INDEX}
        />
      </div>
    </div>
  );
}

export function GameShowcase() {
  const t = useTranslations("showcase");
  const [expandedIndex, setExpandedIndex] = useState(DEFAULT_EXPANDED_INDEX);

  return (
    <div
      className="games-container games-container--accordion"
      onMouseLeave={() => setExpandedIndex(DEFAULT_EXPANDED_INDEX)}
    >
      {GAMES.map((g, idx) => (
        <ShowcaseColumn
          key={g.key}
          name={t(g.key)}
          g={g}
          idx={idx}
          expandedIndex={expandedIndex}
          onHover={setExpandedIndex}
        />
      ))}
    </div>
  );
}
