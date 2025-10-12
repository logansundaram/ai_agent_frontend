// app/api/chat/route.ts
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages, options } = await req.json();

  const upstream = await fetch(`${process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434"}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "gpt-oss:20b",
      messages,
      stream: true,
      options,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Ollama request failed", { status: 500 });
  }

  // Just forward the readable stream
  return new Response(upstream.body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
