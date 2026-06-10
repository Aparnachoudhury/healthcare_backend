import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useParams } from "react-router-dom";
import { getUricAcid } from "../../api/api";
import type { SimpleSeriesData } from "../../types";

const UricAcid = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData]       = useState<SimpleSeriesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUricAcid(id!).then(setData).catch(err => console.log(err)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data)   return <div>No uric acid data available</div>;

  return (
    <div>
      <h3 style={{ marginBottom: "16px", fontSize: "15px" }}>🧬 Uric Acid <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "12px" }}>{data.date}</span></h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data.series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} interval={3} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#eb2f96" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: "16px" }}>
        <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "6px" }}>Average: {data.average} {data.unit}</p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>● Male Standard: {data.maleStandard}</p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>● Female Standard: {data.femaleStandard}</p>
      </div>
    </div>
  );
};

export default UricAcid;
