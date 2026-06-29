import { ImageResponse } from "next/og";

export const alt = "Aryan Sharma — Quantitative Research & Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated OG/Twitter card — dark, editorial, on-brand (no fabricated data). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b0f12",
          padding: "72px",
          color: "#e6edf3",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#7c8c9a",
            fontSize: "24px",
            letterSpacing: "5px",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              backgroundColor: "#2dd4bf",
            }}
          />
          Quantitative research · Systems · Judgment
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "62px",
            fontWeight: 600,
            lineHeight: 1.12,
            maxWidth: "960px",
            letterSpacing: "-1px",
          }}
        >
          I build quantitative systems, understand markets, and want the training
          to scale that.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "26px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                width: "56px",
                height: "56px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                border: "1px solid rgba(230,237,243,0.25)",
                color: "#2dd4bf",
                fontSize: "24px",
              }}
            >
              AS
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#e6edf3" }}>Aryan Sharma</span>
              <span style={{ fontSize: "20px", color: "#7c8c9a" }}>
                Self-taught high-school quant · Washington, D.C.
              </span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: "22px", color: "#7c8c9a" }}>
            github.com/aaasharma870-art
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
