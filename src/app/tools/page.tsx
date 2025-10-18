"use client";

import { useMemo, useState } from "react";
import { Play, Settings2, BookOpenText } from "lucide-react";

type ToolKind = "LOCAL" | "API";
type ToolTag = "io" | "net" | "code" | "math" | "rag" | "vision" | "email";

type ToolDef = {
  id: string;
  name: string;
  summary: string;
  model: string;
  kind: ToolKind;
  tags: ToolTag[];
  status?: "healthy" | "degraded" | "offline";
};

const TOOLING: ToolDef[] = [
  {
    id: "search",
    name: "Search",
    summary:
      "Ask questions and retrieve information instantly. Ideal for quick lookups, references, or verifying details.",
    model: "gpt-oss",
    kind: "API",
    tags: ["net", "rag"],
    status: "healthy",
  },
  {
    id: "calculator",
    name: "Calculator",
    summary:
      "Handle math from simple arithmetic to complex equations—fast, precise, and always at hand.",
    model: "gpt-oss",
    kind: "LOCAL",
    tags: ["math"],
    status: "healthy",
  },
  {
    id: "file-manager",
    name: "File Manager",
    summary:
      "Upload, organize, and retrieve files on the fly. Keep your workspace clean and connected to your agent.",
    model: "llama3.1",
    kind: "LOCAL",
    tags: ["io"],
    status: "healthy",
  },
  {
    id: "email-monitor",
    name: "Email Monitor",
    summary:
      "Stay on top of important messages. Summarize, filter, and track emails without leaving your workflow.",
    model: "deepseek-r1",
    kind: "API",
    tags: ["email", "rag"],
    status: "degraded",
  },
];

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const tones = {
    neutral: "bg-black/10 text-black/80",
    green: "bg-emerald-500/10 text-emerald-700",
    amber: "bg-amber-500/10 text-amber-700",
    red: "bg-rose-500/10 text-rose-700",
  } as const;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] ${tones[tone ?? "neutral"]}`}
    >
      {children}
    </span>
  );
}

function ToolCard({
  t,
  onRun,
  onConfigure,
  onDocs,
}: {
  t: ToolDef;
  onRun: () => void;
  onConfigure: () => void;
  onDocs: () => void;
}) {
  const statusTone =
    t.status === "healthy" ? "green" : t.status === "degraded" ? "amber" : "red";

  return (
    <div
      className={[
        "rounded-3xl border border-black/10 bg-white/60 backdrop-blur-sm",
        "shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5",
        "p-5 grid gap-3 w-full",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <div className="text-lg font-semibold">{t.name}</div>
          <p className="text-sm text-black/70 leading-relaxed">{t.summary}</p>
          <div className="text-xs text-black/60">Model: {t.model}</div>
        </div>
        <div className="grid gap-2 justify-items-end">
          <Badge tone={t.kind === "LOCAL" ? "green" : "neutral"}>{t.kind}</Badge>
          {t.status && <Badge tone={statusTone as any}>{t.status}</Badge>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {t.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onRun}
          className="inline-flex items-center gap-2 rounded-2xl bg-black text-white text-sm px-3 py-2 hover:opacity-90 transition"
        >
          <Play className="h-4 w-4" />
          Run
        </button>
        <button
          onClick={onConfigure}
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition"
        >
          <Settings2 className="h-4 w-4" />
          Configure
        </button>
        <button
          onClick={onDocs}
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition"
        >
          <BookOpenText className="h-4 w-4" />
          Docs
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"ALL" | ToolKind>("ALL");
  const [tag, setTag] = useState<"" | ToolTag>("");

  const tools = useMemo(() => {
    return TOOLING.filter((t) => {
      const hitQ =
        !q ||
        (t.name + " " + t.summary + " " + t.model)
          .toLowerCase()
          .includes(q.toLowerCase());
      const hitKind = kind === "ALL" || t.kind === kind;
      const hitTag = !tag || t.tags.includes(tag);
      return hitQ && hitKind && hitTag;
    });
  }, [q, kind, tag]);

  return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-8 w-full">
      <h1 className="text-left w-full font-medium text-xl">Tools</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 w-full justify-start">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tools…"
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm outline-none"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as any)}
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm"
        >
          <option value="ALL">All sources</option>
          <option value="LOCAL">Local</option>
          <option value="API">API</option>
        </select>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as any)}
          className="rounded-2xl border border-black/10 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm"
        >
          <option value="">All tags</option>
          <option value="io">io</option>
          <option value="net">net</option>
          <option value="code">code</option>
          <option value="math">math</option>
          <option value="rag">rag</option>
          <option value="vision">vision</option>
          <option value="email">email</option>
        </select>
      </div>

      {/* Tool Cards */}
      <div className="grid gap-5 w-full sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard
            key={t.id}
            t={t}
            onRun={() => console.log("Run tool:", t.id)}
            onConfigure={() => console.log("Configure tool:", t.id)}
            onDocs={() => console.log("Open docs:", t.id)}
          />
        ))}
      </div>

      {tools.length === 0 && (
        <div className="text-black/60 text-sm mt-4">No tools match your filters.</div>
      )}
    </div>
  );
}
