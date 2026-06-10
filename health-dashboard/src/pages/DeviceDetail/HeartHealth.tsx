import type { HeartHealthData } from "../../types";

interface Props { data?: HeartHealthData }

const HeartHealth = ({ data }: Props) => {
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h3 style={{ marginBottom: "16px", fontSize: "15px" }}>❤️ Heart Health <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>{data.date}</span></h3>
      <div style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: 600, marginBottom: "8px", color: "#52c41a" }}>Diagnosis conclusion</div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {data.diagnosis}<br /><br />
          Atrial fibrillation risk: <strong>{data.afibRisk}</strong><br /><br />
          HRV Score: <strong>{data.hrvScore}</strong>
        </p>
      </div>
      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Open the phone historical diagnosis. No data for now. Please wait for the diagnosis results.</p>
    </div>
  );
};

export default HeartHealth;
