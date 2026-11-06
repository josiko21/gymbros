# Gymbros

Suscripción para llevar tu actividad física con **coach IA (DeepSeek)** o **entrenador real**.

## Stack

- Next.js 16 + Tailwind
- Clerk (auth)
- Neon Postgres + Drizzle
- Stripe (suscripciones)
- DeepSeek vía Vercel AI SDK

## Setup

```bash
pnpm install
cp .env.example .env.local
# Rellena Clerk, DATABASE_URL, Stripe y DEEPSEEK_API_KEY
pnpm db:push
pnpm dev
```

Aplica el SQL de `drizzle/0000_gymbros_init.sql` en Neon si prefieres no usar `db:push`.

### Roles

- **member** — usuario con suscripción
- **trainer** — actualizar `users.role = 'trainer'` para su `clerk_id`
- **admin** — IDs de Clerk en `ADMIN_CLERK_IDS`

### Stripe

Crea dos precios mensuales y ponlos en `STRIPE_PRICE_AI` y `STRIPE_PRICE_HUMAN`.  
Webhook: `POST /api/webhooks/stripe` (eventos `checkout.session.completed`, `customer.subscription.*`).

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing marketing |
| `/registro` | Elegir alumno o entrenador |
| `/sign-up` `/sign-in` | Auth Clerk |
| `/post-auth` | Redirección según rol |
| `/checkout` | Stripe Checkout (alumnos) |
| `/app` | Panel alumno · rutina de hoy |
| `/app/onboarding` | Perfil inicial + plan IA |
| `/app/chat` | Chat DeepSeek |
| `/app/messages` | Chat con entrenador |
| `/trainer` | Panel entrenador · clientes |
| `/trainer/onboarding` | Perfil del entrenador |
| `/admin` | Asignar trainers |

Tras cambios de schema: `pnpm db:push` o aplica `drizzle/0001_roles_and_exercise_logs.sql`.
