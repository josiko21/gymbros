"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClaimClientButton({
  assignmentId,
  trainerId,
}: {
  assignmentId: string;
  trainerId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function claim() {
    setLoading(true);
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, trainerId }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={claim}
      disabled={loading}
      className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep disabled:opacity-60"
    >
      {loading ? "…" : "Tomar cliente"}
    </button>
  );
}
