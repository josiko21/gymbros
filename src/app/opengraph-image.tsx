import { ImageResponse } from "next/og";

export const alt =
  "Gymbros — entrenamiento con IA o entrenador real. Suscripción fitness.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0b09",
          color: "#f3ece3",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#d4ff3f",
          }}
        >
          <span>Gymbros</span>
          <span>IA · Humano</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 0.9,
              fontWeight: 800,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Tu actividad física, con sistema.
          </div>
          <div style={{ fontSize: 28, color: "#9a9186", maxWidth: 760 }}>
            Suscripción. Coach IA o entrenador real.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
