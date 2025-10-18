"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ModelCardData = {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  location?: string;
};

const demoModels: ModelCardData[] = [
  { id: "mixtral-8x7b", title: "Mixtral 8x7B", subtitle: "Sparse MoE • 32k ctx", tag: "MoE", location: "vLLM • GPU" },
  { id: "llama3.1-8b", title: "Llama 3.1 8B", subtitle: "General • 8k ctx • Q4", tag: "LOCAL", location: "Ollama • GPU" },
  { id: "deepseek-r1-32b", title: "DeepSeek-R1 32B", subtitle: "Reasoning • 128k ctx", tag: "REASONING", location: "API • Cloud" },
  { id: "phi-4-mini", title: "Phi-4 Mini", subtitle: "Compact • 4k ctx", tag: "FAST", location: "CPU • Local" },
  { id: "qwen2.5-coder", title: "Qwen2.5 Coder", subtitle: "Code • 32k ctx", tag: "CODE", location: "API • Cloud" },
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function getCardStyle(distance: number) {
  const abs = Math.abs(distance);
  const spacing = 180 + 20 * abs; // tighter spacing
  const translateX = distance * spacing;
  const rotateY = clamp(distance * -8, -16, 16);
  const rotateZ = clamp(distance * 0.6, -2, 2);
  const scale = 1 - Math.min(abs * 0.08, 0.35);
  const y = abs * 6;
  const opacity = 1 - Math.min(abs * 0.18, 0.5);
  const blur = abs >= 3 ? 6 : abs === 2 ? 2 : 0;
  const zIndex = 100 - abs;
  return { translateX, scale, rotateY, rotateZ, y, opacity, blur, zIndex };
}

function ModelCard({ data, isActive }: { data: ModelCardData; isActive: boolean }) {
  return (
    <div
      className={[
        "relative h-[380px] w-[280px] select-none font-mono",
        "rounded-3xl bg-white/60 backdrop-blur-lg",
        "shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300",
        isActive ? "scale-[1.02]" : "",
      ].join(" ")}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/70 via-white/40 to-transparent opacity-70 pointer-events-none" />

      <div className="absolute bottom-4 left-4 right-4 text-black">
        {data.tag && (
          <span className="rounded-full bg-black/10 backdrop-blur px-3 py-1 text-xs font-semibold text-black/80">
            {data.tag}
          </span>
        )}
        <h3 className="text-xl font-semibold mt-3">{data.title}</h3>
        {data.subtitle && <p className="text-black/70 text-sm leading-snug mt-1">{data.subtitle}</p>}
        {data.location && (
          <div className="mt-2 text-xs text-black/60 flex items-center gap-2">
            <span className="i-lucide-cpu" /> {data.location}
          </div>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className="rounded-2xl bg-black/80 text-white text-sm py-2 font-medium hover:bg-black transition">Configure</button>
          <button className="rounded-2xl bg-black/10 text-black text-sm py-2 font-medium hover:bg-black/20 transition">Benchmark</button>
          <button className="rounded-2xl bg-black/10 text-black text-sm py-2 font-medium hover:bg-black/20 transition">Details</button>
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
  useTransform(draggingX, [-300, 0, 300], [1, 0, -1]);

  const goTo = (i: number) => {
    const next = clamp(i, 0, items.length - 1);
    setIndex(next);
    onChange?.(items[next], next);
  };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  // wheel with threshold; prevent clipping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const hx = Math.abs(e.deltaX);
      const hy = Math.abs(e.deltaY);
      if (hx > hy && hx > 40) {
        e.preventDefault();
        e.deltaX > 0 ? next() : prev();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [index]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative mx-auto max-w-7xl h-[420px] perspective-[1600px] overflow-visible touch-pan-y"
      >
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
          <div className="relative w-full h-full overflow-visible">
            {items.map((m, i) => {
              const distance = i - index;
              const { translateX, scale, rotateY, rotateZ, y, opacity, blur, zIndex } = getCardStyle(distance);
              return (
                <motion.div
                  key={m.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
                  style={{
                    zIndex,
                    filter: `blur(${blur}px)`,
                    transformStyle: "preserve-3d",
                  }}
                  animate={{
                    x: translateX,
                    y,
                    rotateY,
                    rotateZ,
                    scale,
                    opacity,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  onClick={() => goTo(i)}
                >
                  <ModelCard data={m} isActive={i === index} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* dots */}
        <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={[
                "h-2 rounded-full transition-all",
                i === index ? "bg-black/90 w-6" : "bg-black/30 w-2",
              ].join(" ")}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>

        {/* arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
          <button
            onClick={prev}
            className="pointer-events-auto m-4 rounded-full p-2 bg-black/10 hover:bg-black/20 text-black"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="pointer-events-auto m-4 rounded-full p-2 bg-black/10 hover:bg-black/20 text-black"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-8 w-full">
      <h1 className="text-left w-full font-medium text-xl">Models</h1>
      <ModelCarousel items={demoModels} />
    </div>
  );
}
