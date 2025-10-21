"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ModelCardData = {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  location?: string;
  imageUrl?: string;
};

const demoModels: ModelCardData[] = [
  {
    id: "mixtral-8x7b",
    title: "Mixtral 8x7B",
    subtitle: "Sparse MoE • 32k ctx",
    tag: "MoE",
    location: "vLLM • GPU",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "llama3.1-8b",
    title: "Llama 3.1 8B",
    subtitle: "General • 8k ctx • Q4",
    tag: "LOCAL",
    location: "Ollama • GPU",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "deepseek-r1-32b",
    title: "DeepSeek-R1 32B",
    subtitle: "Reasoning • 128k ctx",
    tag: "REASONING",
    location: "API • Cloud",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "phi-4-mini",
    title: "Phi-4 Mini",
    subtitle: "Cheap • 4k ctx",
    tag: "FAST",
    location: "CPU • Local",
    imageUrl: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "qwen2.5-coder",
    title: "Qwen2.5 Coder",
    subtitle: "Code • 32k ctx",
    tag: "CODE",
    location: "API • Cloud",
    imageUrl: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop",
  },
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function getCardStyle(distance: number) {
  const abs = Math.abs(distance);
  const translateX = distance * 240;
  const scale = 1 - Math.min(abs * 0.08, 0.35);
  const rotateY = clamp(distance * -16, -36, 36);
  const rotateZ = clamp(distance * 1.5, -6, 6);
  const y = abs * 6;
  const opacity = 1 - Math.min(abs * 0.18, 0.6);
  const blur = abs >= 3 ? 6 : abs === 2 ? 2 : 0;
  const zIndex = 100 - abs;
  return { translateX, scale, rotateY, rotateZ, y, opacity, blur, zIndex };
}

function ModelCard({ data, isActive }: { data: ModelCardData; isActive: boolean }) {
  return (
    <div
      className={[
        "relative h-[380px] w-[300px] select-none",
        "rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm bg-white/30 font-mono",
        isActive ? "ring-2 ring-black/40" : "ring-1 ring-black/10",
      ].join(" ")}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${data.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.05)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/40 to-transparent" />

      <div className="absolute left-4 right-4 top-4 flex items-center gap-2">
        {data.tag && (
          <span className="rounded-full bg-black/10 backdrop-blur px-3 py-1 text-xs font-semibold text-black/80">
            {data.tag}
          </span>
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-black">
        <h3 className="text-xl font-semibold drop-shadow-sm">{data.title}</h3>
        {data.subtitle && (
          <p className="text-black/70 text-sm leading-snug mt-1">{data.subtitle}</p>
        )}
        {data.location && (
          <div className="mt-2 text-xs text-black/60 flex items-center gap-2">
            <span className="i-lucide-cpu" /> {data.location}
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className="rounded-2xl bg-black/80 text-white text-sm py-2 font-medium hover:bg-black transition">
            Configure
          </button>
          <button className="rounded-2xl bg-black/20 text-black text-sm py-2 font-medium hover:bg-black/30 transition">
            Benchmark
          </button>
          <button className="rounded-2xl bg-black/20 text-black text-sm py-2 font-medium hover:bg-black/30 transition">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModelCarousel({
  items = demoModels,
  initialIndex = 2,
  onChange,
}: {
  items?: ModelCardData[];
  initialIndex?: number;
  onChange?: (active: ModelCardData, index: number) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingX = useMotionValue(0);
  const dragX = useTransform(draggingX, [-300, 0, 300], [1, 0, -1]);

  const goTo = (i: number) => {
    const next = clamp(i, 0, items.length - 1);
    setIndex(next);
    onChange?.(items[next], next);
  };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 0) next();
        else prev();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [index]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl">
      </div>

      <div ref={containerRef} className="relative mx-auto max-w-6xl h-[420px] perspective-[1600px]">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={(e, info) => draggingX.set(info.offset.x)}
          onDragEnd={(e, info) => {
            const vx = info.velocity.x;
            const dx = info.offset.x;
            if (dx < -80 || vx < -500) next();
            else if (dx > 80 || vx > 500) prev();
            draggingX.set(0);
          }}
          style={{ cursor: "grab" }}
        >
          <div className="relative w-full h-full">
            {items.map((m, i) => {
              const distance = i - index;
              const { translateX, scale, rotateY, rotateZ, y, opacity, blur, zIndex } = getCardStyle(distance);
              return (
                <motion.div
                  key={m.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ zIndex, filter: `blur(${blur}px)`, transformStyle: "preserve-3d" }}
                  animate={{ x: translateX, y, rotateY, rotateZ, scale, opacity }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  onClick={() => goTo(i)}
                >
                  <ModelCard data={m} isActive={i === index} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={["h-2 w-2 rounded-full", i === index ? "bg-black/90 w-6" : "bg-black/40", "transition-all"].join(" ")}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DemoModelCarousel() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white/70 via-gray-100/60 to-gray-200/70 p-6">
      <ModelCarousel items={demoModels} />
    </div>
  );
}
