"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Play, Download, Trash2, Clock, Filter } from "lucide-react";

type HistoryItem = {
  id: string;
  title: string;
  summary: string;
  model: string;
  createdAt: string;   // ISO string
  durationSec?: number;
  tags?: string[];
};

const HISTORY: HistoryItem[] = [
  {
    id: "s-001",
    title: "Starting with AI agents",
    summary:
      "Exploring the fundamentals of building an AI agent, covering initial setup and core components.",
    model: "gpt-oss",
    createdAt: "2025-10-16T23:04:00Z",
    durationSec: 420,
    tags: ["intro", "agents"],
  },
  {
    id: "s-002",
    title: "Intro to RAG agents",
    summary:
      "Designing a retrieval-augmented generation agent, integrating search with model reasoning.",
    model: "gpt-oss",
    createdAt: "2025-10-17T03:12:00Z",
    durationSec: 690,
    tags: ["rag", "search"],
  },
  {
    id: "s-003",
    title: "Comparing different models",
    summary:
      "Experimenting with model variations, including llama3.1, to evaluate differences in output and performance.",
    model: "llama3.1",
    createdAt: "2025-10-17T18:29:00Z",
    durationSec: 540,
    tags: ["eval", "models"],
  },
];

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatDur(s?: number) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/10 text-black/80">
      {children}
    </span>
  );
}

function HistoryCard({
  item,
  onOpen,
  onResume,
  onExport,
  onDelete,
}: {
  item: HistoryItem;
  onOpen: () => void;
  onResume: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-5 w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <div className="text-lg font-semibold">{item.title}</div>
          <p className="text-sm text-black/70 leading-relaxed">{item.summary}</p>
          <div className="text-xs text-black/60">Model: {item.model}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/60">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatDate(item.createdAt)}
            </span>
            <span>·</span>
            <span>{formatDur(item.durationSec)}</span>
            {item.tags?.length ? (
              <>
                <span>·</span>
                <div className="flex gap-1">
                  {item.tags.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2 justify-items-end">
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-black text-white hover:opacity-90"
          >
            Open <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={onResume}
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition"
        >
          <Play className="h-4 w-4" /> Resume
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition"
        >
          <Download className="h-4 w-4" /> Export
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition text-rose-700"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  // controls
  const [q, setQ] = useState("");
  const [model, setModel] = useState<string>("ALL");
  const [sort, setSort] = useState<"new" | "old" | "long" | "short">("new");

  const models = useMemo(
    () => Array.from(new Set(HISTORY.map((h) => h.model))),
    []
  );

  const items = useMemo(() => {
    let arr = HISTORY.filter((h) => {
      const hitQ =
        !q ||
        (h.title + " " + h.summary + " " + h.model)
          .toLowerCase()
          .includes(q.toLowerCase());
      const hitModel = model === "ALL" || h.model === model;
      return hitQ && hitModel;
    });
    arr = arr.sort((a, b) => {
      if (sort === "new") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sort === "old") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (sort === "long") return (b.durationSec ?? 0) - (a.durationSec ?? 0);
      return (a.durationSec ?? 0) - (b.durationSec ?? 0);
    });
    return arr;
  }, [q, model, sort]);

  return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-8 w-full">
      <h1 className="text-left w-full font-medium text-xl">History</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 w-full items-center">
        <div className="inline-flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles and summaries…"
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm outline-none"
        />
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm"
        >
          <option value="ALL">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm"
        >
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
          <option value="long">Longest</option>
          <option value="short">Shortest</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid w-full gap-5">
        {items.map((h) => (
          <HistoryCard
            key={h.id}
            item={h}
            onOpen={() => console.log("open", h.id)}
            onResume={() => console.log("resume", h.id)}
            onExport={() => console.log("export", h.id)}
            onDelete={() => console.log("delete", h.id)}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-black/60 text-sm mt-4">No sessions match your filters.</div>
      )}
    </div>
  );
}
