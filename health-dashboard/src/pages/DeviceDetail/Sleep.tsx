import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SleepData } from "../../types";

interface Props { data?: SleepData }

const Sleep = ({ data }: Props) => {
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h3 style={{ marginBottom: "16px", fontSize: "15px" }}>🌙 Sleep <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>{data.date}</span></h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data.series}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey="stage" stroke="#1a6ef5" fill="#e6f0ff" />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
        <div>Total Sleep Time: <strong>{data.totalMinutes} min</strong></div>
        <div style={{ marginTop: "6px" }}>Deep Sleep: <strong>{data.deepSleepMinutes} min</strong></div>
        <div style={{ marginTop: "6px" }}>Light Sleep: <strong>{data.lightSleepMinutes} min</strong></div>
        <div style={{ marginTop: "6px" }}>Sleep Score: <strong>{data.sleepScore}</strong></div>
      </div>
    </div>
  );
};

export default Sleep;
