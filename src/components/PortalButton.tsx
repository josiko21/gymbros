"use client";

import { useState } from "react";

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className="rounded-full border border-paper/20 px-5 py-3 text-sm font-semibold transition-colors hover:border-lime hover:text-lime disabled:opacity-60"
    >
      {loading ? "Abriendo…" : "Gestionar suscripción"}
    </button>
  );
}
