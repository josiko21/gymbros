"use client";

import { FormEvent, useState } from "react";
import type { Profile } from "@/lib/db/schema";
import {
  equipmentOptions,
  goals,
  jobActivityOptions,
  levelOptions,
  sexOptions,
  stressOptions,
} from "@/lib/member-profile";

type Props = {
  initial?: Profile | null;
  submitLabel?: string;
  onSuccess?: () => void;
};

const fieldClass =
  "rounded-2xl border border-paper/15 bg-ink-soft px-4 py-3 outline-none ring-lime focus:ring-2";

export function MemberProfileForm({
  initial,
  submitLabel = "Guardar",
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasHealth, setHasHealth] = useState(initial?.hasHealthConditions ?? false);
  const [equipment, setEquipment] = useState<string[]>(initial?.equipment ?? []);

  function toggleEquipment(item: string) {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      goal: String(form.get("goal") ?? ""),
      experience: String(form.get("experience") ?? ""),
      daysPerWeek: Number(form.get("daysPerWeek")),
      sessionMinutes: form.get("sessionMinutes")
        ? Number(form.get("sessionMinutes"))
        : null,
      sex: form.get("sex") || null,
      birthYear: form.get("birthYear") ? Number(form.get("birthYear")) : null,
      heightCm: form.get("heightCm") ? Number(form.get("heightCm")) : null,
      weightKg: form.get("weightKg") ? Number(form.get("weightKg")) : null,
      equipment,
      availabilityNotes: String(form.get("availabilityNotes") ?? ""),
      hasHealthConditions: hasHealth,
      healthConditions: String(form.get("healthConditions") ?? ""),
      injuries: String(form.get("injuries") ?? ""),
      painAreas: String(form.get("painAreas") ?? ""),
      medications: String(form.get("medications") ?? ""),
      contraindications: String(form.get("contraindications") ?? ""),
      doctorClearance:
        form.get("doctorClearance") === "yes"
          ? true
          : form.get("doctorClearance") === "no"
            ? false
            : null,
      pregnancyOrPostpartum: form.get("pregnancyOrPostpartum") === "on",
      sleepHours: form.get("sleepHours") ? Number(form.get("sleepHours")) : null,
      stressLevel: form.get("stressLevel") || null,
      activityJob: form.get("activityJob") || null,
      notes: String(form.get("notes") ?? ""),
    };

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      onSuccess?.();
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <section className="grid gap-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Entrenamiento
        </h2>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Objetivo</span>
          <select
            name="goal"
            required
            className={fieldClass}
            defaultValue={initial?.goal ?? ""}
          >
            <option value="" disabled>
              Elige uno
            </option>
            {goals.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Nivel en el deporte</span>
          <select
            name="experience"
            required
            className={fieldClass}
            defaultValue={initial?.experience ?? ""}
          >
            <option value="" disabled>
              Elige tu nivel
            </option>
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.hint}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Días por semana</span>
            <input
              name="daysPerWeek"
              type="number"
              min={1}
              max={7}
              required
              defaultValue={initial?.daysPerWeek ?? 3}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Minutos por sesión</span>
            <input
              name="sessionMinutes"
              type="number"
              min={15}
              max={180}
              defaultValue={initial?.sessionMinutes ?? 45}
              className={fieldClass}
            />
          </label>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm text-muted">Material disponible</legend>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((item) => {
              const active = equipment.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleEquipment(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    active
                      ? "border-lime bg-lime/15 text-lime"
                      : "border-paper/20 text-paper/70"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Horarios / disponibilidad</span>
          <textarea
            name="availabilityNotes"
            rows={2}
            className={fieldClass}
            defaultValue={initial?.availabilityNotes ?? ""}
            placeholder="Ej. solo mañanas, no puedo los viernes…"
          />
        </label>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Datos básicos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Sexo</span>
            <select
              name="sex"
              className={fieldClass}
              defaultValue={initial?.sex ?? ""}
            >
              <option value="">Opcional</option>
              {sexOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Año de nacimiento</span>
            <input
              name="birthYear"
              type="number"
              min={1920}
              max={2015}
              className={fieldClass}
              defaultValue={initial?.birthYear ?? ""}
              placeholder="1990"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Altura (cm)</span>
            <input
              name="heightCm"
              type="number"
              min={100}
              max={250}
              className={fieldClass}
              defaultValue={initial?.heightCm ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Peso (kg)</span>
            <input
              name="weightKg"
              type="number"
              min={30}
              max={300}
              className={fieldClass}
              defaultValue={initial?.weightKg ?? ""}
            />
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.5rem] border border-lime/25 bg-ink-soft p-5">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
            Salud y seguridad
          </h2>
          <p className="mt-1 text-sm text-muted">
            Esta información la usan la IA y tu entrenador para no proponerte
            ejercicios peligrosos. No sustituye consejo médico.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={hasHealth}
            onChange={(e) => setHasHealth(e.target.checked)}
            className="h-4 w-4 accent-lime"
          />
          Tengo condiciones de salud relevantes (hipertensión, diabetes, asma…)
        </label>
        {hasHealth ? (
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Describe las condiciones</span>
            <textarea
              name="healthConditions"
              required={hasHealth}
              rows={3}
              className={fieldClass}
              defaultValue={initial?.healthConditions ?? ""}
              placeholder="Diagnósticos, desde cuándo, limitaciones…"
            />
          </label>
        ) : (
          <input type="hidden" name="healthConditions" value="" />
        )}
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Lesiones o cirugías</span>
          <textarea
            name="injuries"
            rows={3}
            className={fieldClass}
            defaultValue={initial?.injuries ?? ""}
            placeholder="Rodilla derecha 2022, hernia, hombro…"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Zonas con dolor actual</span>
          <textarea
            name="painAreas"
            rows={2}
            className={fieldClass}
            defaultValue={initial?.painAreas ?? ""}
            placeholder="Lumbar al flexionar, rodilla al bajar escaleras…"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Medicación relevante (opcional)</span>
          <textarea
            name="medications"
            rows={2}
            className={fieldClass}
            defaultValue={initial?.medications ?? ""}
            placeholder="Solo si afecta al entrenamiento (beta-bloqueantes, etc.)"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Qué debemos evitar</span>
          <textarea
            name="contraindications"
            rows={2}
            className={fieldClass}
            defaultValue={initial?.contraindications ?? ""}
            placeholder="No saltos, no press militar, no carrera…"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">¿Tu médico te ha dado OK para entrenar?</span>
          <select
            name="doctorClearance"
            className={fieldClass}
            defaultValue={
              initial?.doctorClearance === true
                ? "yes"
                : initial?.doctorClearance === false
                  ? "no"
                  : ""
            }
          >
            <option value="">No aplica / no lo sé</option>
            <option value="yes">Sí</option>
            <option value="no">No / pendiente</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="pregnancyOrPostpartum"
            defaultChecked={initial?.pregnancyOrPostpartum ?? false}
            className="h-4 w-4 accent-lime"
          />
          Estoy embarazada o en postparto
        </label>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Estilo de vida
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Horas de sueño</span>
            <input
              name="sleepHours"
              type="number"
              min={0}
              max={14}
              step={1}
              className={fieldClass}
              defaultValue={initial?.sleepHours ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Estrés</span>
            <select
              name="stressLevel"
              className={fieldClass}
              defaultValue={initial?.stressLevel ?? ""}
            >
              <option value="">Opcional</option>
              {stressOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Tipo de trabajo</span>
            <select
              name="activityJob"
              className={fieldClass}
              defaultValue={initial?.activityJob ?? ""}
            >
              <option value="">Opcional</option>
              {jobActivityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Otras notas</span>
          <textarea
            name="notes"
            rows={3}
            className={fieldClass}
            defaultValue={initial?.notes ?? ""}
            placeholder="Preferencias, motivaciones, lo que quieras que sepamos…"
          />
        </label>
      </section>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink disabled:opacity-60"
      >
        {loading ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
