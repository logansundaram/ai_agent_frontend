"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userText = inputValue.trim();
    if (!userText) return;

    // Add user message
    const userMsg: Msg = { id: Date.now().toString(), role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Add placeholder assistant message
    const assistId = `${userMsg.id}-assistant`;
    setMessages((prev) => [...prev, { id: assistId, role: "assistant", text: "" }]);

    // Send to backend
    const controller = new AbortController();
    abortRef.current = controller;

   const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        // omit model so the backend uses process.env.OLLAMA_MODEL
        messages: messages
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.text })),
    }),
    signal: controller.signal,
    });

    if (!resp.ok || !resp.body) {
      setMessages((prev) =>
        updateById(prev, assistId, (m) => ({ ...m, text: "Error: model failed." }))
      );
      return;
    }

    // Stream in NDJSON chunks
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
      <div className="flex flex-col space-y-10 pl-60 pt-10">
        {messages.length === 0 ? (
          <p>write first message to begin</p>
        ) : (
          messages.map((m) => <Message key={m.id} query={m.text} />)
        )}
      </div>

      <div className="fixed bottom-4 inset-x-0 flex justify-center px-4 pl-35">
        <div className="w-full max-w-2xl">
          <div className="mb-2 text-left text-sm font-medium text-slate-600">
            get some work done
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 rounded-full border border-black/20 bg-white/80 backdrop-blur shadow-lg px-4 py-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder="Input query here"
                className="flex-1 bg-transparent text-base focus:outline-none placeholder:text-slate-400"
              />
              <input
                type="submit"
                className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-black text-white hover:bg-blue-400"
                value="Send"
              />
            </div>
          </form>

          <div className="mt-2 text-center text-xs text-slate-500">
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
