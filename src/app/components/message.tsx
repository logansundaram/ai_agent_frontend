interface MessageProp{
  query: string;
  isUser?: boolean;
};

export default function Message({ query, isUser = false }: MessageProp) {
  return (
    <div
      className={[
        "max-w-[60ch] rounded-2xl px-4 py-3",
        isUser
          ? "bg-white/70 backdrop-blur border border-black/10 text-black"
          : "bg-black text-white"
      ].join(" ")}
    >
      {query}
    </div>
  );
}
