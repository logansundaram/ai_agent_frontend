"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Play, Pause, Download, Camera, ChevronDown, ChevronUp, Bug, Zap, Shield, Clock, Layers, ListFilter, RefreshCw, ArrowLeftRight, Share2} from "lucide-react";

/* ===========================
   Types
=========================== */
type NodeKind =
  | "input" | "planner" | "router" | "rag" | "tool" | "model"
  | "verifier" | "repair" | "synth" | "output" | "cache" | "guardrail" | "custom";

type NodeStatus = "queued" | "running" | "success" | "error" | "cancelled" | "cached";

type VizNode = {
  id: string;
  label: string;
  kind: NodeKind;
  status: NodeStatus;
  lane: number;      // column index
  order: number;     // row index inside lane
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  costUSD?: number;
  score?: number;    // verifier score, routing conf, etc.
  tags?: string[];   // e.g., cache-hit
};

type VizEdge = { id: string; from: string; to: string; weight?: number };

type RunMeta = { id: string; name: string; ts: string; live: boolean };

type EventLevel = "info" | "warn" | "error" | "tool" | "model";
type VizEvent = {
  t: number; level: EventLevel; nodeId?: string; msg: string;
};

/* ===========================
   Color/Chip mapping
=========================== */
const KIND_CHIP: Record<NodeKind, { label: string; cls: string }> = {
  input:     { label: "Input",      cls: "bg-black/10 text-black/80" },
  planner:   { label: "Planner",    cls: "bg-indigo-500/10 text-indigo-700" },
  router:    { label: "Router",     cls: "bg-purple-500/10 text-purple-700" },
  rag:       { label: "RAG",        cls: "bg-emerald-500/10 text-emerald-700" },
  tool:      { label: "Tool",       cls: "bg-green-500/10 text-green-700" },
  model:     { label: "Model",      cls: "bg-sky-500/10 text-sky-700" },
  verifier:  { label: "Verifier",   cls: "bg-amber-500/10 text-amber-700" },
  repair:    { label: "Repair",     cls: "bg-orange-500/10 text-orange-700" },
  synth:     { label: "Synth",      cls: "bg-violet-500/10 text-violet-700" },
  output:    { label: "Output",     cls: "bg-black/10 text-black/80" },
  cache:     { label: "Cache",      cls: "bg-zinc-500/10 text-zinc-700" },
  guardrail: { label: "Guardrail",  cls: "bg-rose-500/10 text-rose-700" },
  custom:    { label: "Custom",     cls: "bg-black/10 text-black/80" },
};

const STATUS_DOT: Record<NodeStatus, string> = {
  queued:    "bg-zinc-400",
  running:   "bg-sky-500 animate-pulse",
  success:   "bg-emerald-500",
  error:     "bg-rose-500",
  cancelled: "bg-amber-500",
  cached:    "bg-zinc-500",
};

/* ===========================
   Demo DAG (you can swap with live data)
=========================== */
const DEMO_NODES: VizNode[] = [
  { id:"n1", label:"User Query", kind:"input",   status:"success", lane:0, order:0 },
  { id:"n2", label:"Planner",    kind:"planner", status:"success", lane:1, order:0, latencyMs:42 },
  { id:"n3", label:"Router",     kind:"router",  status:"success", lane:2, order:0, score:0.82 },
  { id:"n4", label:"Retriever",  kind:"rag",     status:"success", lane:3, order:0, latencyMs:55 },
  { id:"n5", label:"LLM (local)",kind:"model",   status:"success", lane:4, order:0, tokensIn:512, tokensOut:220, costUSD:0, latencyMs:180 },
  { id:"n6", label:"Verifier",   kind:"verifier",status:"success", lane:5, order:0, score:0.74 },
  { id:"n7", label:"Repair",     kind:"repair",  status:"success", lane:3, order:1, latencyMs:60 },
  { id:"n8", label:"LLM (API)",  kind:"model",   status:"success", lane:4, order:1, tokensIn:380, tokensOut:180, costUSD:0.0021, latencyMs:160 },
  { id:"n9", label:"Synth",      kind:"synth",   status:"success", lane:6, order:0, latencyMs:20 },
  { id:"n10",label:"Output",     kind:"output",  status:"success", lane:7, order:0 },
];

const DEMO_EDGES: VizEdge[] = [
  { id:"e1", from:"n1", to:"n2" },
  { id:"e2", from:"n2", to:"n3" },
  { id:"e3", from:"n3", to:"n4" },
  { id:"e4", from:"n4", to:"n5" },
  { id:"e5", from:"n5", to:"n6" },
  { id:"e6", from:"n6", to:"n7" }, // repair loop branch
  { id:"e7", from:"n7", to:"n8" },
  { id:"e8", from:"n8", to:"n9" },
  { id:"e9", from:"n9", to:"n10" },
];

const DEMO_RUNS: RunMeta[] = [
  { id: "run_001", name: "Ask: weekend plan",  ts: "2025-10-17T18:04:00Z", live: false },
  { id: "run_002", name: "RAG deep-dive",      ts: "2025-10-17T19:21:00Z", live: false },
  { id: "run_live", name: "Live session",      ts: new Date().toISOString(), live: true },
];

/* ===========================
   Helpers
=========================== */
function formatUsd(n?: number) { return n == null ? "—" : `$${n.toFixed(4)}`; }
function fmtMs(n?: number)    { return n == null ? "—" : `${n} ms`; }
function fmtTok(n?: number)   { return n == null ? "—" : `${n}`; }
function fmtPct(n?: number)   { return n == null ? "—" : `${Math.round(n * 100)}%`; }

/* ===========================
   Edge SVG with flowing dots
=========================== */
function EdgePath({
  from, to, weight = 1, selected,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  weight?: number;
  selected?: boolean;
}) {
  const id = useMemo(() => `grad-${Math.random().toString(36).slice(2)}`, []);
  const dx = Math.max(60, (to.x - from.x) / 2);
  const d = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"  stopOpacity="0.6" stopColor="#0ea5e9" />
          <stop offset="100%" stopOpacity="0.6" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={`url(#${id})`} strokeWidth={selected ? 3.5 : 2 + weight * 0.5} opacity={0.8} />
      {/* animated dots */}
      <motion.circle
        r={3.2}
        fill="#0ea5e9"
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ offsetPath: `path('${d}')` }}
      />
    </g>
  );
}

/* ===========================
   Node Card
=========================== */
function NodeCard({
  n, selected, onSelect,
}: {
  n: VizNode; selected: boolean; onSelect: (id: string) => void;
}) {
  const chip = KIND_CHIP[n.kind];
  const pulse = n.status === "running";

  return (
    <motion.div
      layout
      onClick={() => onSelect(n.id)}
      className={[
        "rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm",
        "shadow-sm hover:shadow-md transition-all cursor-pointer select-none",
        "w-[220px] p-3",
        selected ? "ring-2 ring-black/30" : "",
      ].join(" ")}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-sm text-black">{n.label}</div>
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[n.status]}`} />
      </div>
      <div className="mt-1 text-[11px]">
        <span className={`px-2 py-0.5 rounded-full ${chip.cls}`}>{chip.label}</span>
        {n.tags?.includes("hit") && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-700">cache</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-[11px] text-black/70">
        <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {fmtMs(n.latencyMs)}</div>
        <div>Cost: {formatUsd(n.costUSD)}</div>
        <div>In: {fmtTok(n.tokensIn)}</div>
        <div>Out: {fmtTok(n.tokensOut)}</div>
        <div>Score: {fmtPct(n.score)}</div>
      </div>
      {pulse && (
        <motion.div
          className="mt-2 h-1 rounded bg-gradient-to-r from-sky-500/30 to-cyan-400/30"
          initial={{ width: "20%" }}
          animate={{ width: ["20%","60%","100%","60%"] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/* ===========================
   Canvas (pan/zoom + layout)
=========================== */
function usePanZoom() {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const next = Math.min(2, Math.max(0.5, scale - e.deltaY * 0.001));
      setScale(next);
    }
  }, [scale]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-panlock='1']")) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setTx(v => v + dx);
    setTy(v => v + dy);
  };
  const onMouseUp = () => { dragging.current = false; };

  return { scale, tx, ty, setScale, setTx, setTy, onWheel, onMouseDown, onMouseMove, onMouseUp };
}

function layoutNodes(nodes: VizNode[]) {
  const laneWidth = 260; // node width + gutter
  const rowHeight = 160;
  return nodes.reduce<Record<string, { x: number; y: number }>>((acc, n) => {
    acc[n.id] = { x: n.lane * laneWidth, y: n.order * rowHeight };
    return acc;
  }, {});
}

function DAGCanvas({
  nodes, edges, selectedId, onSelect,
}: {
  nodes: VizNode[];
  edges: VizEdge[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const { scale, tx, ty, onWheel, onMouseDown, onMouseMove, onMouseUp } = usePanZoom();
  const pos = useMemo(() => layoutNodes(nodes), [nodes]);
  const bbox = useMemo(() => {
    const xs = nodes.map(n => pos[n.id].x);
    const ys = nodes.map(n => pos[n.id].y);
    return {
      minX: Math.min(...xs) - 200,
      minY: Math.min(...ys) - 200,
      maxX: Math.max(...xs) + 400,
      maxY: Math.max(...ys) + 300,
    };
  }, [nodes, pos]);

  return (
    <div
      className="relative w-full h-[520px] rounded-3xl border border-black/10 bg-white/40 backdrop-blur-sm shadow-sm overflow-hidden"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUp}
      onMouseUp={onMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "0 0" }}
      >
        {/* edges */}
        <svg className="absolute inset-0 overflow-visible pointer-events-none" width={bbox.maxX - bbox.minX} height={bbox.maxY - bbox.minY}>
          <g transform={`translate(${200}, ${220})`}>
            {edges.map(e => (
              <EdgePath
                key={e.id}
                from={pos[e.from]}
                to={pos[e.to]}
                weight={e.weight ?? 1}
                selected={e.from === selectedId || e.to === selectedId}
              />
            ))}
          </g>
        </svg>

        {/* nodes */}
        <div className="absolute left-[200px] top-[220px]">
          <div className="relative">
            {nodes.map(n => (
              <div key={n.id} style={{ position: "absolute", left: pos[n.id].x, top: pos[n.id].y }}>
                <NodeCard n={n} selected={n.id === selectedId} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Inspector (right panel)
=========================== */
function Inspector({
  node, open, setOpen,
}: {
  node?: VizNode | null;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [tab, setTab] = useState<"overview"|"prompt"|"io"|"routing"|"tokens"|"logs"|"policies"|"artifacts">("overview");

  useEffect(() => { setTab("overview"); }, [node?.id]);

  return (
    <div className="w-full lg:w-[360px]">
      <div className={[
        "rounded-3xl border border-black/10 bg-white/60 backdrop-blur-sm shadow-sm",
        open ? "p-4" : "p-2"
      ].join(" ")}>
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setOpen(!open)}
        >
          <div className="font-semibold">{node ? node.label : "Inspector"}</div>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
                {["overview","prompt","io","routing","tokens","logs","policies","artifacts"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t as any)}
                    className={[
                      "px-2 py-1 rounded-full border",
                      tab===t ? "bg-black text-white border-black" : "bg-white/70 border-black/10"
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-3 text-sm text-black/80 min-h-[140px]">
                {!node && <div className="text-black/60 text-xs">Select a node to inspect.</div>}
                {node && (
                  <>
                    {tab==="overview" && (
                      <div className="space-y-2">
                        <div className="text-xs text-black/60">Kind: {node.kind}</div>
                        <div className="text-xs text-black/60">Status: {node.status}</div>
                        <div className="text-xs text-black/60">Latency: {fmtMs(node.latencyMs)}</div>
                        <div className="text-xs text-black/60">Tokens In/Out: {fmtTok(node.tokensIn)} / {fmtTok(node.tokensOut)}</div>
                        <div className="text-xs text-black/60">Cost: {formatUsd(node.costUSD)}</div>
                        <div className="text-xs text-black/60">Score: {fmtPct(node.score)}</div>
                      </div>
                    )}
                    {tab==="prompt" && (
                      <div className="text-xs text-black/70">
                        Rendered prompt/code would appear here with diffs across attempts.
                      </div>
                    )}
                    {tab==="io" && (
                      <div className="text-xs text-black/70">Inputs/Outputs (JSON pretty-printed) go here.</div>
                    )}
                    {tab==="routing" && (
                      <div className="text-xs text-black/70">Model/tool candidates with scores & rationale.</div>
                    )}
                    {tab==="tokens" && (
                      <div className="text-xs text-black/70">Per-attempt token/cost breakdown visual.</div>
                    )}
                    {tab==="logs" && (
                      <div className="text-xs text-black/70">stderr/stdout, retry reasons.</div>
                    )}
                    {tab==="policies" && (
                      <div className="text-xs text-black/70">Guardrail triggers & redactions.</div>
                    )}
                    {tab==="artifacts" && (
                      <div className="text-xs text-black/70">Files/images produced with previews.</div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ===========================
   Timeline Console (bottom)
=========================== */
function Timeline({
  events, open, setOpen, onJump,
}: {
  events: VizEvent[]; open: boolean; setOpen: (v: boolean) => void; onJump: (nodeId?: string) => void;
}) {
  const [level, setLevel] = useState<"all"|EventLevel>("all");
  const [q, setQ] = useState("");

  const filtered = events.filter(e => {
    const hitLevel = level==="all" || e.level===level;
    const hitQ = !q || e.msg.toLowerCase().includes(q.toLowerCase());
    return hitLevel && hitQ;
  });

  return (
    <div className="w-full">
      <div className={[
        "rounded-3xl border border-black/10 bg-white/60 backdrop-blur-sm shadow-sm",
        open ? "p-4" : "p-2"
      ].join(" ")}>
        <div className="flex items-center justify-between">
          <div className="font-semibold">Timeline</div>
          <button onClick={() => setOpen(!open)} className="text-xs bg-black/10 rounded-full px-2 py-1">
            {open ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 text-sm">
                  <ListFilter className="h-4 w-4" />
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="rounded-2xl border border-black/10 bg-white/70 px-3 py-1.5 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                    <option value="tool">Tool</option>
                    <option value="model">Model</option>
                  </select>
                </div>
                <input
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  placeholder="Search events…"
                  className="rounded-2xl border border-black/10 bg-white/70 px-3 py-1.5 text-xs outline-none"
                />
              </div>

              <div className="mt-3 max-h-[220px] overflow-auto pr-1" data-panlock="1">
                {filtered.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => onJump(e.nodeId)}
                    className="w-full text-left text-xs text-black/80 hover:bg-black/5 rounded-lg px-2 py-1 grid grid-cols-[80px_1fr] gap-3"
                  >
                    <span className="text-black/50">{new Date(e.t).toLocaleTimeString()}</span>
                    <span>
                      <span className="uppercase tracking-wide text-[10px] mr-2 opacity-70">{e.level}</span>
                      {e.msg}
                    </span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="text-xs text-black/60">No events.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ===========================
   Top Controls
=========================== */
function TopControls({
  runs, selected, setSelected,
  mode, setMode, speed, setSpeed,
}: {
  runs: RunMeta[];
  selected: string;
  setSelected: (id: string) => void;
  mode: "live" | "replay";
  setMode: (m: "live" | "replay") => void;
  speed: number;
  setSpeed: (n: number) => void;
}) {
  return (
    <div className="w-full rounded-3xl border border-black/10 bg-white/60 backdrop-blur-sm shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selected}
          onChange={(e)=>setSelected(e.target.value)}
          className="rounded-2xl border border-black/10 bg-white/70 px-3 py-1.5 text-sm"
        >
          {runs.map(r => (
            <option key={r.id} value={r.id}>{r.name} — {new Date(r.ts).toLocaleTimeString()}</option>
          ))}
        </select>

        <div className="inline-flex items-center gap-2">
          <span className="text-sm">Mode</span>
          <div className="rounded-xl bg-white/70 border border-black/10 overflow-hidden">
            <button
              onClick={()=>setMode("live")}
              className={`px-3 py-1.5 text-sm ${mode==="live" ? "bg-black text-white" : ""}`}
            >Live</button>
            <button
              onClick={()=>setMode("replay")}
              className={`px-3 py-1.5 text-sm ${mode==="replay" ? "bg-black text-white" : ""}`}
            >Replay</button>
          </div>
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="text-sm">Speed</span>
          <select
            value={speed}
            onChange={(e)=>setSpeed(Number(e.target.value))}
            className="rounded-2xl border border-black/10 bg-white/70 px-3 py-1.5 text-sm"
          >
            {[1,2,4,8].map(s => <option key={s} value={s}>{s}×</option>)}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-2xl bg-black text-white text-sm px-3 py-1.5 inline-flex items-center gap-2">
            <Play className="h-4 w-4" /> Record
          </button>
          <button className="rounded-2xl bg-black/10 text-sm px-3 py-1.5 inline-flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="rounded-2xl bg-black/10 text-sm px-3 py-1.5 inline-flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Page
=========================== */
export default function Page() {
  const [runId, setRunId] = useState(DEMO_RUNS[2].id);
  const [mode, setMode]   = useState<"live"|"replay">("live");
  const [speed, setSpeed] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(true);

  // demo live state mutations (mock)
  const [nodes, setNodes] = useState<VizNode[]>(DEMO_NODES);
  const [events, setEvents] = useState<VizEvent[]>([
    { t: Date.now()-4000, level:"info",  nodeId:"n1", msg:"Received user query" },
    { t: Date.now()-3500, level:"model", nodeId:"n5", msg:"Local LLM streaming..." },
    { t: Date.now()-3200, level:"warn",  nodeId:"n6", msg:"Verifier score below threshold (0.74)" },
    { t: Date.now()-2800, level:"tool",  nodeId:"n4", msg:"Retriever fetched 12 chunks" },
    { t: Date.now()-2200, level:"model", nodeId:"n8", msg:"API LLM retry #1 succeeded" },
    { t: Date.now()-1500, level:"info",  nodeId:"n9", msg:"Synthesizer assembling final answer" },
  ]);

  // simple heartbeat to wiggle running state in live mode
  useEffect(() => {
    if (mode !== "live") return;
    const id = setInterval(() => {
      setNodes(prev => prev.map(n => {
        if (n.id === "n5" || n.id === "n8") {
          const jitter = Math.random() < 0.3;
          return jitter ? { ...n, status: n.status === "running" ? "success" : "running" } : n;
        }
        return n;
      }));
      setEvents(prev => [
        ...prev.slice(-80),
        { t: Date.now(), level: Math.random() < 0.1 ? "warn" : "info", nodeId:"n8", msg: "tick..." }
      ]);
    }, 1200 / speed);
    return () => clearInterval(id);
  }, [mode, speed]);

  const edges = DEMO_EDGES;
  const selected = nodes.find(n => n.id === selectedNode) || null;

  const onJumpToNode = (id?: string) => { if (id) setSelectedNode(id); };

  return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-8 w-full">
      <h1 className="text-left w-full font-medium text-xl">Visualizer</h1>

      <TopControls
        runs={DEMO_RUNS}
        selected={runId}
        setSelected={setRunId}
        mode={mode}
        setMode={setMode}
        speed={speed}
        setSpeed={setSpeed}
      />

      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <DAGCanvas
          nodes={nodes}
          edges={edges}
          selectedId={selectedNode}
          onSelect={setSelectedNode}
        />

        <Inspector node={selected} open={inspectorOpen} setOpen={setInspectorOpen} />
      </div>

      <Timeline events={events} open={timelineOpen} setOpen={setTimelineOpen} onJump={onJumpToNode} />
    </div>
  );
}
