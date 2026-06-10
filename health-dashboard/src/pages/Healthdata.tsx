import { useEffect, useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { getHealthData } from "../api/api";
import type { DeviceRow } from "../types";

interface SearchState { deviceId: string; nickname: string; phone: string; }

const Healthdata = () => {
  const navigate = useNavigate();
  const [raw,     setRaw]     = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState<SearchState>({ deviceId: "", nickname: "", phone: "" });
  const [applied, setApplied] = useState<SearchState>({ deviceId: "", nickname: "", phone: "" });
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getHealthData();
        setRaw(response);
      } catch (err) {
        console.error("API ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = raw.filter(d =>
    (d.deviceId || "").toLowerCase().includes(applied.deviceId.toLowerCase()) &&
    (d.nickname || "").toLowerCase().includes(applied.nickname.toLowerCase()) &&
    (d.phone || "").includes(applied.phone)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => { setApplied({ ...search }); setPage(1); };
  const handleReset  = () => { const e: SearchState = { deviceId: "", nickname: "", phone: "" }; setSearch(e); setApplied(e); setPage(1); };

  const pageNums = () => totalPages <= 4 ? Array.from({ length: totalPages }, (_, i) => i + 1) : [1, 2, 3, 4];

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Health Data</h1>
      </div>
      <div style={card}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <label style={labelSt}>Device ID</label>
          <input placeholder="Please enter the device ID" value={search.deviceId} onChange={e => setSearch({ ...search, deviceId: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSearch()} style={inputSt} />
          <label style={labelSt}>Nickname</label>
          <input placeholder="Please enter the nickname" value={search.nickname} onChange={e => setSearch({ ...search, nickname: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSearch()} style={inputSt} />
          <label style={labelSt}>Phone number</label>
          <input placeholder="Please enter a number" value={search.phone} onChange={e => setSearch({ ...search, phone: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSearch()} style={inputSt} />
          <button style={btnPrimary} onClick={handleSearch}>Search</button>
          <button style={btnGhost}   onClick={handleReset}>Reset</button>
          <button style={{ ...btnPrimary, marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 6l3 3 3-3M1 10v1.5A1.5 1.5 0 0 0 2.5 13h8A1.5 1.5 0 0 0 12 11.5V10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#F0FDF4" }}>
                {["Serial number","Nickname","Device model","Device ID","Device status","Steps","Heart rate (bpm)","Blood oxygen (%)","Body temperature (°C)","Phone number","Update time","Operation","Details"].map(h =>
                  <th key={h} style={thSt}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={13} style={emptyCell}>Loading...</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={13} style={emptyCell}>No data found</td></tr>}
              {!loading && rows.map((d, i) => (
                <tr key={d.id}>
                  <td style={tdSt}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={{ ...tdSt, fontWeight: 500 }}>{d.nickname || "N/A"}</td>
                  <td style={tdSt}>{d.model || "N/A"}</td>
                  <td style={{ ...tdSt, fontFamily: "monospace" }}>{d.deviceId || d.id}</td>
                  <td style={tdSt}>{d.status || "Unknown"}</td>
                  <td style={tdSt}>{d.steps || "N/A"}</td>
                  <td style={tdSt}>{d.heartRate || "N/A"}</td>
                  <td style={tdSt}>{d.bloodOxygen || "N/A"}</td>
                  <td style={tdSt}>{d.bodyTemp || "N/A"}</td>
                  <td style={tdSt}>{d.phone || "N/A"}</td>
                  <td style={{ ...tdSt, fontSize: "12px" }}>{d.updateTime || "N/A"}</td>
                  <td style={tdSt}><span style={actionSt}>Edit</span></td>
                  <td style={tdSt}><span style={actionSt} onClick={() => navigate(`/device/${d.id}`)}>View</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
          <button style={pgBtn(false)} disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
          {pageNums().map(n => <button key={n} style={pgBtn(n === page)} onClick={() => setPage(n)}>{n}</button>)}
          {totalPages > 4 && <><span style={{ padding: "0 2px", color: "var(--text-muted)", fontSize: "14px" }}>•••</span><button style={pgBtn(page === totalPages)} onClick={() => setPage(totalPages)}>{totalPages}</button></>}
          <button style={pgBtn(false)} disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
          <select style={selectSt}><option>10 / page</option><option>20 / page</option><option>50 / page</option></select>
        </div>
      </div>
    </div>
  );
};

const card: CSSProperties = { background: "#fff", borderRadius: "10px", border: "1px solid var(--border)", overflow: "hidden" };
const labelSt: CSSProperties = { fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap", fontWeight: 500, flexShrink: 0 };
const inputSt: CSSProperties = { padding: "7px 11px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13px", width: "175px", outline: "none", color: "var(--text-primary)", background: "#fff" };
const btnPrimary: CSSProperties = { padding: "7px 18px", background: "#10B981", color: "#022C22", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };
const btnGhost: CSSProperties = { padding: "7px 18px", background: "#fff", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" };
const thSt: CSSProperties = { padding: "11px 13px", textAlign: "left", fontWeight: 600, fontSize: "12px", color: "#065F46", whiteSpace: "nowrap", borderBottom: "1px solid #BBF7D0" };
const tdSt: CSSProperties = { padding: "12px 13px", color: "var(--text-primary)" };
const actionSt: CSSProperties = { color: "#10B981", cursor: "pointer", fontSize: "13px", fontWeight: 600 };
const emptyCell: CSSProperties = { padding: "40px", textAlign: "center", color: "var(--text-muted)" };
const pgBtn = (active: boolean): CSSProperties => ({ width: "30px", height: "30px", border: active ? "none" : "1px solid var(--border)", borderRadius: "6px", background: active ? "#10B981" : "#fff", color: active ? "#022C22" : "var(--text-primary)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: active ? 700 : 400 });
const selectSt: CSSProperties = { marginLeft: "8px", padding: "5px 8px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", color: "var(--text-secondary)", background: "#fff", cursor: "pointer" };

export default Healthdata;
