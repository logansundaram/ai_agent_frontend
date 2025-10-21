// components/model-carousel-client.tsx
"use client";

import { useState } from "react";
import { ModelCarousel, type ModelCardData } from "./carousel";

export default function ModelCarouselClient({ items }: { items: ModelCardData[] }) {
  const [selected, setSelected] = useState<ModelCardData | null>(items[0] ?? null);

  return (
    <div>
      <ModelCarousel
        items={items}
        onChange={(m) => setSelected(m)}
      />
      {selected && (
        <p className="mt-4 text-sm">
          Selected: <span className="font-semibold">{selected.title}</span>
        </p>
      )}
    </div>
  );
}
