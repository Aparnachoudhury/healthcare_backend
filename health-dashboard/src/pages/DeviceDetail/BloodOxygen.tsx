import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useParams } from "react-router-dom";
import { getBloodOxygen } from "../../api/api";
import type { BloodOxygenData } from "../../types";

const BloodOxygen = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BloodOxygenData>({ deviceId: "", date: "", series: [], average: 0, max: 0, min: 0, warningRecords: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBloodOxygen(id!).then(setData).catch(err => console.log(err)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3 style={{ marginBottom: "16px", fontSize: "15px" }}>💧 Blood Oxygen <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>{data.date}</span></h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data.series}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis domain={[90, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#1a6ef5" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "24px", marginTop: "16px" }}>
        {[{ label: "Average oxygen needed", value: `${data.average}%` }, { label: "Maximum oxygen needed", value: `${data.max}%` }, { label: "Minimum oxygen needed", value: `${data.min}%` }].map(item => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a6ef5" }}>{item.value}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "16px", fontSize: "12px" }}>
        <strong>Blood oxygen warning records</strong>
        {data.warningRecords.length === 0 ? <div style={{ marginTop: "6px" }}>No warning records</div> : data.warningRecords.map((r, i) => <div key={i} style={{ marginTop: "6px" }}>{r.time} - {r.value}%</div>)}
      </div>
    </div>
  );
};

export default BloodOxygen;
