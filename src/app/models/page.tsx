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

/* ===== Mini models grid (glassy, hover lift, with buttons) ===== */

function ModelMiniCard({
  m,
  onConfigure,
  onBenchmark,
  onDetails,
}: {
  m: ModelCardData;
  onConfigure?: (m: ModelCardData) => void;
  onBenchmark?: (m: ModelCardData) => void;
  onDetails?: (m: ModelCardData) => void;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm p-5",
        "shadow-sm transition-all transform-gpu",
        "hover:shadow-md hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-black">{m.title}</div>
        {m.tag && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/10 text-black/80">
            {m.tag}
          </span>
        )}
      </div>
      {m.subtitle && <p className="text-sm text-black/70 mt-1">{m.subtitle}</p>}
      {m.location && <div className="text-xs text-black/60 mt-2">Location: {m.location}</div>}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => onConfigure?.(m)}
          className="rounded-2xl bg-black text-white text-sm py-2 font-medium hover:opacity-90 transition"
        >
          Configure
        </button>
        <button
          onClick={() => onBenchmark?.(m)}
          className="rounded-2xl bg-black/10 text-sm py-2 font-medium hover:bg-black/15 transition"
        >
          Benchmark
        </button>
        <button
          onClick={() => onDetails?.(m)}
          className="rounded-2xl bg-black/10 text-sm py-2 font-medium hover:bg-black/15 transition"
        >
          Details
        </button>
      </div>
    </div>
  );
}

function ModelsGrid({
  items,
  preselect,
}: {
  items: ModelCardData[];
  preselect?: string | null;
}) {
  const [q, setQ] = useState("");
  const tags = Array.from(new Set(items.map((i) => i.tag).filter(Boolean))) as string[];
  const [tag, setTag] = useState<string>(preselect ?? "");

  useEffect(() => {
    if (preselect) setTag("");
  }, [preselect]);

  const filtered = items.filter((i) => {
    const hitQ =
      !q ||
      (i.title + " " + (i.subtitle ?? "") + " " + (i.location ?? "") + " " + (i.tag ?? ""))
        .toLowerCase()
        .includes(q.toLowerCase());
    const hitTag = !tag || i.tag === tag;
    return hitQ && hitTag;
  });

  // demo handlers (swap for real actions)
  const handleConfigure = (m: ModelCardData) => console.log("configure", m.id);
  const handleBenchmark = (m: ModelCardData) => console.log("benchmark", m.id);
  const handleDetails = (m: ModelCardData) => console.log("details", m.id);

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search models…"
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-3 py-1.5 text-sm outline-none"
        />
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-3 py-1.5 text-sm"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* 2 columns */}
      <div className="grid gap-5 w-full sm:grid-cols-2">
        {filtered.map((m) => (
          <ModelMiniCard
            key={m.id}
            m={m}
            onConfigure={handleConfigure}
            onBenchmark={handleBenchmark}
            onDetails={handleDetails}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-black/60 text-sm">No models match your filters.</div>
      )}
    </section>
  );
}

export default function Page() {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-8 w-full overflow-hidden">
      <h1 className="text-left w-full font-medium text-xl">Models</h1>

      <ModelCarousel
        items={demoModels}
        onChange={(m) => setSelectedTitle(m.title)}
      />

      {/* New models grid (glassy mini cards with actions) */}
      <div className="w-full">
        <ModelsGrid items={demoModels} preselect={selectedTitle} />
      </div>
    </div>
  );
}
