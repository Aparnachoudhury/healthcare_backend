import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { BloodPressureData } from "../../types";

interface Props { data?: BloodPressureData }

const BloodPressure = ({ data }: Props) => {
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h3 style={{ marginBottom: "16px", fontSize: "15px" }}>🩸 Blood Pressure <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>{data.date}</span></h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data.series}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip /><Legend />
          <Line type="monotone" dataKey="systolic" stroke="#ff4d4f" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="diastolic" stroke="#1a6ef5" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
        <div>Average Systolic: <strong>{data.avgSystolic}</strong></div>
        <div style={{ marginTop: "6px" }}>Average Diastolic: <strong>{data.avgDiastolic}</strong></div>
      </div>
      <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
        <strong>Blood pressure warning records</strong>
        {data.warningRecords.length === 0 ? <div style={{ marginTop: "6px" }}>No warning records</div> : data.warningRecords.map((r, i) => <div key={i} style={{ marginTop: "6px" }}>{r.time} - {r.value}</div>)}
      </div>
    </div>
  );
};

export default BloodPressure;
