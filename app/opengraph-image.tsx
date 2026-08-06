import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#F2EEE7",
          padding: "80px",
          color: "#2C2A28",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#5E7C5A",
          }}
        >
          P²
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#2C2A28",
          }}
        >
          The Long Way Home
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            fontSize: 34,
            lineHeight: 1.5,
            color: "#6F665D",
          }}
        >
          <span>Building thoughtful software,</span>
          <span>writing about books, mountains and ideas.</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 24,
            color: "#8A7D6F",
          }}
        >
          thelongwayhome.dev
        </div>
      </div>
    ),
    size
  );
}