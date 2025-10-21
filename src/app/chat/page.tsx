"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import Message from "../components/message";

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  // ---- autoscroll target (after the last message)
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollToEnd = (smooth = true) => {
    endRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
      block: "end",
    });
  };
  useEffect(() => scrollToEnd(), [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userText = inputValue.trim();
    if (!userText) return;

    const userMsg: Msg = { id: Date.now().toString(), role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    const assistId = `${userMsg.id}-assistant`;
    setMessages((prev) => [...prev, { id: assistId, role: "assistant", text: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.concat(userMsg).map((m) => ({
          role: m.role,
          content: m.text,
        })),
      }),
      signal: controller.signal,
    });

    if (!resp.ok || !resp.body) {
      setMessages((prev) =>
        updateById(prev, assistId, (m) => ({ ...m, text: "Error: model failed." }))
      );
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          const delta = json?.message?.content ?? "";
          if (delta) {
            setMessages((prev) =>
              updateById(prev, assistId, (m) => ({ ...m, text: m.text + delta }))
            );
          }
        } catch {
          // ignore partial lines
        }
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <main className="flex flex-col font-mono min-h-screen">
      {/* Messages */}
      <div className="flex flex-col space-y-6 pl-60 pt-10 pb-40">
        {messages.length === 0 ? (
          <p className="text-black/60">write first message to begin</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* keep isUser to style bubble; alignment handled by wrapper */}
              <Message query={m.text} isUser={m.role === "user"} />
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Floating input bar (wider) */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="pl-60 w-full max-w-3xl pointer-events-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 rounded-full border border-black/20 bg-white/80 dark:bg-black/60 backdrop-blur-lg shadow-xl px-5 py-3">
              <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder="Input query here"
                className="flex-1 bg-transparent text-base focus:outline-none placeholder:text-slate-400"
              />
              <input
                type="submit"
                className="shrink-0 rounded-full px-4 py-2 text-sm font-medium bg-black text-white hover:bg-blue-400 transition"
                value="Send"
              />
            </div>
          </form>
          <div className="mt-2 text-left text-xs text-slate-500 pl-2">
            saturday can be wrong. review all info as necessary
          </div>
        </div>
      </div>
    </main>
  );
}

function updateById(list: Msg[], id: string, fn: (m: Msg) => Msg): Msg[] {
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return list;
  const copy = list.slice();
  copy[idx] = fn(copy[idx]);
  return copy;
}
