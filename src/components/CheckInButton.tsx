"use client";

import { useState } from "react";

export function CheckInButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function onClick() {
    setStatus("loading");
    try {
      const res = await fetch("/api/check-in", { method: "POST" });
      if (!res.ok) throw new Error("fail");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "loading" || status === "done"}
      className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink/80 disabled:opacity-60"
    >
      {status === "done"
        ? "Hecho ✓"
        : status === "loading"
          ? "Guardando…"
          : status === "error"
            ? "Reintentar"
            : "Marcar sesión hecha"}
    </button>
  );
}
