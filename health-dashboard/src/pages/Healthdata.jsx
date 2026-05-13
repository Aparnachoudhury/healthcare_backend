import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealthData } from '../api/api';

const STATUS_COLOR = {
  Online:  '#10B981',
  Offline: '#EF4444',
  Unknown: '#F59E0B',
};

const Healthdata = () => {
  const navigate = useNavigate();

  const [raw,     setRaw]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState({ deviceId: '', nickname: '', phone: '' });
  const [applied, setApplied] = useState({ deviceId: '', nickname: '', phone: '' });
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    getHealthData()
      .then(d => setRaw(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = raw.filter(d =>
    d.deviceId.toLowerCase().includes(applied.deviceId.toLowerCase()) &&
    d.nickname.toLowerCase().includes(applied.nickname.toLowerCase()) &&
    d.phone.includes(applied.phone)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => { setApplied({ ...search }); setPage(1); };
  const handleReset  = () => {
    const empty = { deviceId: '', nickname: '', phone: '' };
    setSearch(empty); setApplied(empty); setPage(1);
  };

  const pageNums = () =>
    totalPages <= 4
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [1, 2, 3, 4];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Health Data</h1>
      </div>

      <div style={card}>

        {/* ── Search bar ──────────────────── */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          gap: '10px', flexWrap: 'wrap',
        }}>
          <label style={labelSt}>Device ID</label>
          <input
            placeholder="Please enter the device ID"
            value={search.deviceId}
            onChange={e => setSearch({ ...search, deviceId: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={inputSt}
          />

          <label style={labelSt}>Nickname</label>
          <input
            placeholder="Please enter the nickname"
            value={search.nickname}
            onChange={e => setSearch({ ...search, nickname: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={inputSt}
          />

          <label style={labelSt}>Phone number</label>
          <input
            placeholder="Please enter a number"
            value={search.phone}
            onChange={e => setSearch({ ...search, phone: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={inputSt}
          />

          <button style={btnPrimary} onClick={handleSearch}>Search</button>
          <button style={btnGhost}   onClick={handleReset}>Reset</button>

          <button style={{ ...btnPrimary, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v8M3.5 6l3 3 3-3M1 10v1.5A1.5 1.5 0 0 0 2.5 13h8A1.5 1.5 0 0 0 12 11.5V10"
                stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
        </div>

        {/* ── Table ───────────────────────── */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F0FDF4' }}>
                {[
                  'Serial number', 'Nickname', 'Device model', 'Device ID',
                  'Device status', 'Steps', 'Heart rate (bpm)', 'Blood oxygen (%)',
                  'Body temperature (°C)', 'Phone number', 'Update time', 'Operation', 'Details',
                ].map(h => <th key={h} style={thSt}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={13} style={emptyCell}>Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={13} style={emptyCell}>No data found</td></tr>
              )}
              {!loading && rows.map((d, i) => (
                <tr
                  key={d.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdSt}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={{ ...tdSt, fontWeight: 500 }}>{d.nickname}</td>
                  <td style={tdSt}>{d.model}</td>
                  <td style={{ ...tdSt, fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{d.deviceId}</td>
                  <td style={tdSt}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      color: STATUS_COLOR[d.status] || STATUS_COLOR.Unknown,
                      fontSize: '12px', fontWeight: 600,
                    }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                        background: STATUS_COLOR[d.status] || STATUS_COLOR.Unknown,
                      }}/>
                      {d.status}
                    </span>
                  </td>
                  <td style={tdSt}>{d.steps}</td>
                  <td style={tdSt}>{d.heartRate}</td>
                  <td style={tdSt}>{d.bloodOxygen}</td>
                  <td style={tdSt}>{d.bodyTemp}</td>
                  <td style={tdSt}>{d.phone}</td>
                  <td style={{ ...tdSt, fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{d.updateTime}</td>
                  <td style={tdSt}><span style={actionSt}>Edit</span></td>
                  <td style={tdSt}>
                    <span
                      style={{ ...actionSt, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => navigate(`/device/${d.id}`)}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5" stroke="#10B981" strokeWidth="1.3"/>
                        <circle cx="6.5" cy="6.5" r="1.5" fill="#10B981"/>
                      </svg>
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────── */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', gap: '4px',
        }}>
          <button style={pgBtn(false)} disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>

          {pageNums().map(n => (
            <button key={n} style={pgBtn(n === page)} onClick={() => setPage(n)}>{n}</button>
          ))}

          {totalPages > 4 && <>
            <span style={{ padding: '0 2px', color: 'var(--text-muted)', fontSize: '14px' }}>•••</span>
            <button style={pgBtn(page === totalPages)}
              onClick={() => setPage(totalPages)}>{totalPages}</button>
          </>}

          <button style={pgBtn(false)} disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>

          <select style={selectSt}>
            <option>10 / page</option>
            <option>20 / page</option>
            <option>50 / page</option>
          </select>
        </div>

      </div>
    </div>
  );
};

/* ─── Styles ───────────────────────────────────────── */
const card = {
  background: '#fff',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  overflow: 'hidden',
};
const labelSt = {
  fontSize: '13px', color: 'var(--text-secondary)',
  whiteSpace: 'nowrap', fontWeight: 500, flexShrink: 0,
};
const inputSt = {
  padding: '7px 11px',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '13px', width: '175px',
  outline: 'none',
  color: 'var(--text-primary)', background: '#fff',
  transition: 'border-color 0.15s',
};
const btnPrimary = {
  padding: '7px 18px',
  background: '#10B981',
  color: '#022C22',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px', fontWeight: 600,
  cursor: 'pointer', whiteSpace: 'nowrap',
};
const btnGhost = {
  padding: '7px 18px',
  background: '#fff',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
};
const thSt = {
  padding: '11px 13px',
  textAlign: 'left', fontWeight: 600,
  fontSize: '12px', color: '#065F46',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #BBF7D0',
};
const tdSt = { padding: '12px 13px', color: 'var(--text-primary)' };
const actionSt = {
  color: '#10B981', cursor: 'pointer',
  fontSize: '13px', fontWeight: 600,
};
const emptyCell = {
  padding: '40px', textAlign: 'center', color: 'var(--text-muted)',
};
const pgBtn = (active) => ({
  width: '30px', height: '30px',
  border: active ? 'none' : '1px solid var(--border)',
  borderRadius: '6px',
  background: active ? '#10B981' : '#fff',
  color: active ? '#022C22' : 'var(--text-primary)',
  fontSize: '13px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: active ? 700 : 400,
});
const selectSt = {
  marginLeft: '8px', padding: '5px 8px',
  border: '1px solid var(--border)', borderRadius: '6px',
  fontSize: '12px', color: 'var(--text-secondary)',
  background: '#fff', cursor: 'pointer',
};

export default Healthdata;