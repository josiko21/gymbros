export const site = {
  name: "Gymbros",
  legalName: "Gymbros",
  tagline: "Tu actividad física, con sistema",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gymbros.app",
  locale: "es_ES",
  language: "es",
  email: "hola@gymbros.app",
  instagram: "https://instagram.com/gymbros.app",
  instagramHandle: "@gymbros.app",
} as const;

export const seo = {
  title: "Gymbros | Entrenamiento con IA o entrenador real",
  titleTemplate: "%s | Gymbros",
  description:
    "Suscripción para llevar tu actividad física. Elige coach con IA (DeepSeek) o un entrenador personal real. Planes, seguimiento y chat en una sola app.",
  keywords: [
    "entrenamiento con IA",
    "entrenador personal online",
    "suscripción fitness",
    "coach IA DeepSeek",
    "plan de entrenamiento personalizado",
    "Gymbros",
    "actividad física",
    "pérdida de grasa",
  ],
};

export const nav = [
  { href: "#caminos", label: "Caminos" },
  { href: "#planes", label: "Planes" },
  { href: "#metodo", label: "Método" },
  { href: "#faq", label: "FAQ" },
] as const;

export const paths = [
  {
    id: "ai",
    number: "01",
    title: "Coach IA",
    description:
      "Planes semanales y chat 24/7 con un coach potenciado por DeepSeek. Ideal si quieres velocidad, precio accesible y un sistema que se adapta cada semana.",
  },
  {
    id: "human",
    number: "02",
    title: "Entrenador real",
    description:
      "Te asignamos un entrenador personal certificado. Mensajería, ajustes humanos y el mismo dashboard de progreso. Cuando quieres criterio humano de verdad.",
  },
] as const;

export const plans = [
  {
    id: "ai",
    name: "Coach IA",
    price: "19",
    period: "/mes",
    badge: "Empieza aquí",
    description: "Plan semanal, check-ins y chat con IA.",
    features: [
      "Onboarding y plan a medida",
      "Chat ilimitado con coach IA",
      "Ajustes semanales automáticos",
      "Seguimiento de sesiones",
    ],
    cta: "Empezar con IA",
    href: "/registro/alumno?plan=ai",
    highlighted: false,
  },
  {
    id: "human",
    name: "Entrenador real",
    price: "79",
    period: "/mes",
    badge: "Más humano",
    description: "Coach humano + dashboard Gymbros.",
    features: [
      "Todo lo del plan IA",
      "Entrenador personal asignado",
      "Mensajería 1:1",
      "Revisiones y ajustes manuales",
    ],
    cta: "Quiero entrenador",
    href: "/registro/alumno?plan=human",
    highlighted: true,
  },
] as const;

export const method = [
  {
    step: "01",
    title: "Elige camino",
    text: "IA o entrenador real. Misma app, distinto tipo de coaching. Puedes cambiar de plan cuando quieras.",
  },
  {
    step: "02",
    title: "Cuéntanos tu semana",
    text: "Objetivo, nivel y días disponibles. Sin formularios eternos: lo justo para construir un plan que cabe en tu vida.",
  },
  {
    step: "03",
    title: "Entrena y reporta",
    text: "Sesiones claras, check-ins y chat. La IA o tu entrenador ajustan volumen y carga según lo que cumplas.",
  },
  {
    step: "04",
    title: "Progresa con datos",
    text: "Cada semana miramos adherencia y sensaciones. El plan cambia contigo, no al revés.",
  },
] as const;

export const stats = [
  { value: "2", suffix: "", label: "caminos: IA o humano" },
  { value: "7", suffix: " días", label: "planes que se renuevan" },
  { value: "24", suffix: "/7", label: "chat con coach IA" },
  { value: "1", suffix: " app", label: "para todo el seguimiento" },
] as const;

export const testimonials = [
  {
    quote:
      "La IA me armó un plan realista para tres días. En un mes ya no improvisaba en el gym.",
    name: "Marcos V.",
    role: "Plan Coach IA · 29 años",
  },
  {
    quote:
      "Pasé al entrenador real cuando me lesioné. El chat con mi coach y el dashboard juntos son un acierto.",
    name: "Elena R.",
    role: "Plan Entrenador · 36 años",
  },
  {
    quote:
      "Suscripción clara, sin contratos raros. Cancelé un mes, volví y el plan se regeneró en minutos.",
    name: "Javi P.",
    role: "Plan Coach IA · 41 años",
  },
] as const;

export const faqs = [
  {
    question: "¿Qué es Gymbros?",
    answer:
      "Una suscripción para llevar tu actividad física. Eliges coaching con inteligencia artificial (DeepSeek) o un entrenador personal real. En ambos casos tienes plan semanal, seguimiento y chat dentro de la app.",
  },
  {
    question: "¿Cómo funciona el coach IA?",
    answer:
      "Tras el onboarding, generamos un plan semanal con DeepSeek según tu objetivo y disponibilidad. Puedes chatear para dudas, sustituciones de ejercicios y ajustes. No sustituye consejo médico.",
  },
  {
    question: "¿Y el entrenador real?",
    answer:
      "Te asignamos un entrenador de la red Gymbros. Habláis por mensajería en la app y él revisa tu plan y tus check-ins. Ideal si quieres criterio humano o tienes lesiones/historial complejo.",
  },
  {
    question: "¿Puedo cambiar de plan?",
    answer:
      "Sí. Puedes pasar de IA a entrenador real (o al revés) desde el portal de suscripción. El cambio se aplica en el siguiente ciclo de facturación según Stripe.",
  },
  {
    question: "¿Necesito experiencia en el gimnasio?",
    answer:
      "No. El onboarding pregunta tu nivel. Empezamos por patrones básicos o partimos de tu fuerza actual. El plan se adapta tanto si nunca has tocado una barra como si llevas años.",
  },
  {
    question: "¿Hay compromiso de permanencia?",
    answer:
      "No. Suscripción mensual cancelable desde el portal de cliente. Sin permanencia ni letras pequeñas.",
  },
] as const;

export const images = {
  hero: {
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1600&q=80",
    alt: "Persona entrenando con seguimiento digital Gymbros",
  },
  about: {
    src: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1400&q=80",
    alt: "Entrenamiento de fuerza en un gimnasio moderno",
  },
  session: {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80",
    alt: "Sesión de entrenamiento con barra",
  },
} as const;
