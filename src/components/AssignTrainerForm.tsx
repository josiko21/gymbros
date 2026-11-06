"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AssignTrainerForm({
  assignmentId,
  trainers,
}: {
  assignmentId: string;
  trainers: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        trainerId: form.get("trainerId"),
      }),
    });
    router.refresh();
    setLoading(false);
  }

  if (trainers.length === 0) {
    return (
      <p className="text-sm text-muted">
        No hay trainers en la base de datos todavía.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
      <select
        name="trainerId"
        required
        className="rounded-full border border-paper/15 bg-ink px-4 py-2 text-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Elegir trainer
        </option>
        {trainers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
      >
        Asignar
      </button>
    </form>
  );
}
