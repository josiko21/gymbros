"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Msg = {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
};

export function HumanChat({
  memberId,
  asTrainer = false,
}: {
  memberId?: string;
  asTrainer?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const qs = memberId ? `?memberId=${memberId}` : "";
    const res = await fetch(`/api/messages${qs}`);
    const data = (await res.json()) as { messages?: Msg[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Error");
      return;
    }
    setMessages(data.messages ?? []);
  }, [memberId]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 8000);
    return () => clearInterval(id);
  }, [load]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content) return;
    setInput("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, memberId }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo enviar");
      return;
    }
    await load();
  }

  return (
    <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-[1.75rem] border border-paper/10 bg-ink-soft">
      <div className="border-b border-paper/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          1:1
        </p>
        <p className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">
          {asTrainer ? "Chat con alumno" : "Chat con coach"}
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-paper/15 px-4 py-8 text-center">
            <p className="font-display text-xl font-bold uppercase text-paper/80">
              Sin mensajes aún
            </p>
            <p className="mt-2 text-sm text-muted">
              {asTrainer
                ? "Escribe al cliente para empezar."
                : "Cuando tengas entrenador asignado, hablad aquí."}
            </p>
          </div>
        ) : null}
        {messages
          .filter((m) => m.sender === "user" || m.sender === "trainer")
          .map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                (asTrainer && m.sender === "trainer") ||
                (!asTrainer && m.sender === "user")
                  ? "ml-auto bg-lime text-ink"
                  : "border border-paper/10 bg-ink text-paper/90"
              }`}
            >
              {m.content}
            </div>
          ))}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
      <form
        onSubmit={onSubmit}
        className="flex gap-2 border-t border-paper/10 bg-ink/40 p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-full border border-paper/15 bg-ink px-4 py-3 text-sm outline-none ring-lime focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
