"use client";

import { useState } from "react";

import SeriesCard from "@/components/variety/SeriesCard";
import type { VarietySeries } from "@/types/variety";

interface SeriesListProps {
  series: VarietySeries[];
}

export default function SeriesList({ series }: SeriesListProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (seriesId: string) => {
    setOpenId((prev) => (prev === seriesId ? null : seriesId));
  };

  return (
    <div className="mt-10 space-y-6">
      {series.map((item, index) => (
        <SeriesCard
          key={item.id}
          series={item}
          priority={index === 0}
          isOpen={openId === item.id}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
