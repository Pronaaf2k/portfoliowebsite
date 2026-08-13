import { ImageResponse } from "next/og";

export const alt = "Samiyeel Alim Binaaf — Full-stack and AI/ML developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#090b0d",
        color: "#f0eee8",
        fontFamily: "Arial, sans-serif",
        borderTop: "6px solid #e95f4f",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 22,
            color: "#63d8e8",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <span style={{ display: "flex", width: 8, height: 8, borderRadius: 99, background: "#63d8e8" }} />
          AVAILABLE FOR WORK · DHAKA
        </div>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 900, lineHeight: 0.92, letterSpacing: -5 }}>
          <span style={{ display: "flex" }}>SAMIYEEL ALIM&nbsp;</span>
          <span style={{ display: "flex", color: "#e95f4f" }}>BINAAF</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 25,
            color: "#aeb8bd",
            fontSize: 18,
          }}
        >
          I build things that leave localhost.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 31 }}>
          {[["GH", "/Pronaaf2k"], ["in", "/samiyeelalimbinaaf"], ["ST", "/Samiyeel"], ["IG", "/samiyeel"], ["@", "benaaf2000"]].map(([mark, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 8px 8px", color: "#aeb8bd", background: "#121619", border: "1px solid #263036", borderRadius: 99, fontSize: 9, fontWeight: 700 }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 19, height: 19, color: "#090b0d", background: "#f0eee8", borderRadius: 99, fontSize: 8, fontWeight: 900 }}>{mark}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
