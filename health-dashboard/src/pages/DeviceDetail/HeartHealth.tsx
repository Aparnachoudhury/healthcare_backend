import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHeartHealth } from "../../api/api";
import type { HeartHealthData } from "../../types";

const HeartHealth = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData]       = useState<HeartHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHeartHealth(id!).then(setData).catch(err => console.log(err)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data)   return <div>No heart health data available</div>;

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
