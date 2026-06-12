import { useEffect, useState } from "react";
import { getAlarms } from "../api/api";
import type { AlarmRow } from "../types";

const AlarmList = () => {
  const [alarms, setAlarms]   = useState<AlarmRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadAlarms() {
      getAlarms()
        .then(d => setAlarms(d))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
    loadAlarms();
    const timer = setInterval(loadAlarms, 30_000);
    return () => clearInterval(timer);
  }, []);

  const typeBadge = (type: string): { background: string; color: string } => {
    if (type === "Sleep") return { background: "#D1FAE5", color: "#065F46" };
    if (type === "SOS")   return { background: "#FEE2E2", color: "#991B1B" };
    return                       { background: "#FEF3C7", color: "#92400E" };
  };

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Alarm List</h1>
      </div>
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#F0FDF4" }}>
                {["Serial number","Nickname","Device ID","Alarm type","Alarm time","Geographic location","Alarm content","Device homepage"].map(h => (
                  <th key={h} style={{ padding: "11px 13px", textAlign: "left", fontWeight: 600, fontSize: "12px", color: "#065F46", whiteSpace: "nowrap", borderBottom: "1px solid #BBF7D0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading…</td></tr>}
              {!loading && alarms.length === 0 && <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No alarms found</td></tr>}
              {!loading && alarms.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F0FDF4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 13px" }}>{i + 1}</td>
                  <td style={{ padding: "12px 13px", fontWeight: 500 }}>{a.nickname}</td>
                  <td style={{ padding: "12px 13px", fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>{a.deviceId}</td>
                  <td style={{ padding: "12px 13px" }}>
                    <span style={{ ...typeBadge(a.type), padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>{a.type}</span>
                  </td>
                  <td style={{ padding: "12px 13px", whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>{a.time}</td>
                  <td style={{ padding: "12px 13px" }}>{a.location}</td>
                  <td style={{ padding: "12px 13px", color: "var(--text-secondary)" }}>{a.content}</td>
                  <td style={{ padding: "12px 13px" }}>
                    <span style={{ color: "#10B981", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>Enter</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlarmList;
