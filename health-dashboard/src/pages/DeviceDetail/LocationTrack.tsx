import type { LocationData } from "../../types";

interface Props { data?: LocationData }

const LocationTrack = (_props: Props) => (
  <div>
    <h3 style={{ marginBottom: "16px", fontSize: "15px" }}>
      📍 Historical track <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "12px" }}>2026-05-11</span>
    </h3>
    <div style={{ display: "flex", gap: "0", marginBottom: "12px", border: "1px solid var(--border)", borderRadius: "4px", width: "fit-content" }}>
      {["Map", "Satellite"].map((m, i) => (
        <button key={m} style={{ padding: "6px 16px", border: "none", cursor: "pointer", fontSize: "13px", background: i === 0 ? "#fff" : "#f0f0f0", color: i === 0 ? "var(--text-primary)" : "var(--text-muted)", borderRight: i === 0 ? "1px solid var(--border)" : "none" }}>{m}</button>
      ))}
    </div>
    <div style={{ height: "400px", borderRadius: "8px", background: "#e8f0e8", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
      <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🗺️</div>
        <div style={{ fontSize: "13px" }}>No data</div>
        <div style={{ fontSize: "11px", marginTop: "4px" }}>Location track will appear here</div>
      </div>
      <div style={{ position: "absolute", bottom: "12px", right: "12px", display: "flex", gap: "12px", background: "#fff", padding: "6px 10px", borderRadius: "4px", fontSize: "11px" }}>
        <span>🔵 Wifi</span><span>🟠 Base station</span><span>🟡 Satellite</span>
      </div>
    </div>
  </div>
);

export default LocationTrack;
