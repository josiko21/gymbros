import { z } from "zod";
import type { Profile } from "@/lib/db/schema";

export const equipmentOptions = [
  "Gimnasio completo",
  "Mancuernas",
  "Barras / racks",
  "Bandas elásticas",
  "Máquinas",
  "Peso corporal / casa",
  "Cardio (bici, cinta…)",
] as const;

export const goals = [
  "Perder grasa",
  "Ganar músculo",
  "Fuerza y rendimiento",
  "Mantener hábitos",
  "Rehabilitación / volver a moverme",
  "Salud general",
] as const;

export const levels = ["Principiante", "Intermedio", "Avanzado"] as const;

export const levelOptions = [
  {
    value: "Principiante",
    label: "Principiante",
    hint: "Empiezo o llevo poco tiempo. Necesito técnica y bases.",
  },
  {
    value: "Intermedio",
    label: "Intermedio",
    hint: "Entreno con regularidad y conozco los movimientos básicos.",
  },
  {
    value: "Avanzado",
    label: "Avanzado",
    hint: "Llevo años, manejo cargas y quiero rendimiento.",
  },
] as const;

export function normalizeLevel(
  value: string | null | undefined,
): (typeof levels)[number] | null {
  if (!value) return null;
  const match = levels.find(
    (level) => level.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? null;
}

export const sexOptions = [
  { value: "female", label: "Mujer" },
  { value: "male", label: "Hombre" },
  { value: "other", label: "Otro" },
  { value: "prefer_not", label: "Prefiero no decirlo" },
] as const;

export const stressOptions = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
] as const;

export const jobActivityOptions = [
  { value: "sedentary", label: "Sedentario (oficina)" },
  { value: "light", label: "Ligero / de pie a ratos" },
  { value: "active", label: "Activo / físico" },
] as const;

export const memberProfileSchema = z.object({
  goal: z.string().min(2),
  experience: z.string().min(2),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  sessionMinutes: z.coerce.number().int().min(15).max(180).optional().nullable(),
  sex: z.enum(["female", "male", "other", "prefer_not"]).optional().nullable(),
  birthYear: z.coerce.number().int().min(1920).max(2015).optional().nullable(),
  heightCm: z.coerce.number().min(100).max(250).optional().nullable(),
  weightKg: z.coerce.number().min(30).max(300).optional().nullable(),
  equipment: z.array(z.string()).default([]),
  availabilityNotes: z.string().max(2000).optional().nullable(),
  hasHealthConditions: z.boolean().default(false),
  healthConditions: z.string().max(4000).optional().nullable(),
  injuries: z.string().max(4000).optional().nullable(),
  painAreas: z.string().max(2000).optional().nullable(),
  medications: z.string().max(2000).optional().nullable(),
  contraindications: z.string().max(4000).optional().nullable(),
  doctorClearance: z.boolean().optional().nullable(),
  pregnancyOrPostpartum: z.boolean().default(false),
  sleepHours: z.coerce.number().min(0).max(14).optional().nullable(),
  stressLevel: z.enum(["low", "medium", "high"]).optional().nullable(),
  activityJob: z.enum(["sedentary", "light", "active"]).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export type MemberProfileInput = z.infer<typeof memberProfileSchema>;

export function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Texto compacto para prompts de IA y contexto de coaches. */
export function formatProfileContext(profile: Profile | null | undefined): string {
  if (!profile) return "Sin perfil de alumno.";

  const age = profile.birthYear
    ? new Date().getFullYear() - profile.birthYear
    : null;

  const lines = [
    `Objetivo: ${profile.goal ?? "n/d"}`,
    `Experiencia: ${profile.experience ?? "n/d"}`,
    `Días/semana: ${profile.daysPerWeek ?? "n/d"}`,
    `Minutos/sesión: ${profile.sessionMinutes ?? "n/d"}`,
    `Sexo: ${profile.sex ?? "n/d"}`,
    `Edad aprox.: ${age ?? "n/d"}`,
    `Altura: ${profile.heightCm ? `${profile.heightCm} cm` : "n/d"}`,
    `Peso: ${profile.weightKg ? `${profile.weightKg} kg` : "n/d"}`,
    `Material: ${(profile.equipment ?? []).join(", ") || "n/d"}`,
    `Disponibilidad: ${profile.availabilityNotes ?? "n/d"}`,
    `Trabajo/actividad: ${profile.activityJob ?? "n/d"}`,
    `Sueño (h): ${profile.sleepHours ?? "n/d"}`,
    `Estrés: ${profile.stressLevel ?? "n/d"}`,
    `--- SALUD (prioridad) ---`,
    `Condiciones de salud declaradas: ${profile.hasHealthConditions ? "SÍ" : "NO"}`,
    `Condiciones: ${profile.healthConditions ?? "ninguna"}`,
    `Lesiones / historial: ${profile.injuries ?? "ninguna"}`,
    `Zonas con dolor: ${profile.painAreas ?? "ninguna"}`,
    `Medicación relevante: ${profile.medications ?? "ninguna"}`,
    `Contraindicaciones / evitar: ${profile.contraindications ?? "ninguna"}`,
    `Alta médica / OK médico: ${
      profile.doctorClearance === true
        ? "sí"
        : profile.doctorClearance === false
          ? "no / no indicado"
          : "n/d"
    }`,
    `Embarazo o postparto: ${profile.pregnancyOrPostpartum ? "SÍ" : "no"}`,
    `Notas del alumno: ${profile.notes ?? "ninguna"}`,
    `Notas del coach: ${profile.coachNotes ?? "ninguna"}`,
    `Flags: ${(profile.healthFlags ?? []).join(", ") || "ninguno"}`,
  ];

  return lines.join("\n");
}

export function deriveHealthFlags(input: MemberProfileInput): string[] {
  const flags: string[] = [];
  if (input.hasHealthConditions) flags.push("health_conditions");
  if (input.injuries?.trim()) flags.push("injuries");
  if (input.painAreas?.trim()) flags.push("pain");
  if (input.medications?.trim()) flags.push("medications");
  if (input.contraindications?.trim()) flags.push("contraindications");
  if (input.pregnancyOrPostpartum) flags.push("pregnancy_postpartum");
  if (input.doctorClearance === false) flags.push("no_doctor_clearance");
  return flags;
}

export function profileUpdateFromInput(input: MemberProfileInput) {
  return {
    goal: input.goal,
    experience: input.experience,
    daysPerWeek: input.daysPerWeek,
    sessionMinutes: input.sessionMinutes ?? null,
    sex: input.sex ?? null,
    birthYear: input.birthYear ?? null,
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    equipment: input.equipment ?? [],
    availabilityNotes: emptyToNull(input.availabilityNotes),
    hasHealthConditions: input.hasHealthConditions,
    healthConditions: emptyToNull(input.healthConditions),
    injuries: emptyToNull(input.injuries),
    painAreas: emptyToNull(input.painAreas),
    medications: emptyToNull(input.medications),
    contraindications: emptyToNull(input.contraindications),
    doctorClearance: input.doctorClearance ?? null,
    pregnancyOrPostpartum: input.pregnancyOrPostpartum,
    sleepHours: input.sleepHours ?? null,
    stressLevel: input.stressLevel ?? null,
    activityJob: input.activityJob ?? null,
    notes: emptyToNull(input.notes),
    healthFlags: deriveHealthFlags(input),
    updatedAt: new Date(),
  };
}
