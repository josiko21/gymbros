"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useMemo, useState } from "react";

export function AiChat() {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-[1.75rem] border border-paper/10 bg-ink-soft">
      <div className="border-b border-paper/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
          En vivo
        </p>
        <p className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">
          Coach IA
        </p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-paper/15 px-4 py-8 text-center">
            <p className="font-display text-xl font-bold uppercase text-paper/80">
              Empieza la conversación
            </p>
            <p className="mt-2 text-sm text-muted">
              Sustituciones, técnica o cómo ajustar la semana.
            </p>
          </div>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-auto bg-lime text-ink"
                : "border border-paper/10 bg-ink text-paper/90"
            }`}
          >
            {message.parts.map((part, index) =>
              part.type === "text" ? <p key={index}>{part.text}</p> : null,
            )}
          </div>
        ))}
        {error ? <p className="text-sm text-red-300">{error.message}</p> : null}
      </div>
      <form
        onSubmit={onSubmit}
        className="flex gap-2 border-t border-paper/10 bg-ink/40 p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe a tu coach IA…"
          className="flex-1 rounded-full border border-paper/15 bg-ink px-4 py-3 text-sm outline-none ring-lime focus:ring-2"
        />
        <button
          type="submit"
          disabled={status === "streaming" || status === "submitted"}
          className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
