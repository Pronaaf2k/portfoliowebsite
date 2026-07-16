import { ImageResponse } from "next/og";

export const alt =
  "Samiyeel Alim Binaaf, also known as Pronaaf2k - full-stack and AI/ML developer";
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
        justifyContent: "space-between",
        background: "#090b0d",
        color: "#f0eee8",
        padding: "54px 64px 48px",
        fontFamily: "Arial, sans-serif",
        borderTop: "14px solid #e95f4f",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            width: 68,
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0eee8",
            color: "#090b0d",
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          S/AB
        </div>
        <div style={{ display: "flex", color: "#63d8e8", fontSize: 18 }}>
          DHAKA / FULL-STACK + AI/ML
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 800, lineHeight: 0.92 }}>
          Samiyeel Alim
        </div>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 800, lineHeight: 0.92 }}>
          Binaaf
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            color: "#f4c95d",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          ONLINE AS PRONAAF2K
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #364047",
          paddingTop: 22,
          color: "#aeb8bd",
          fontSize: 17,
        }}
      >
        <div style={{ display: "flex" }}>SYSTEMS / INTERFACES / MUSIC / ML</div>
        <div style={{ display: "flex" }}>SAMIYEELALIM.COM</div>
      </div>
    </div>,
    size,
  );
}
