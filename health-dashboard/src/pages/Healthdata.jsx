import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealthData } from '../api/api';

const statusColor = { Online: '#52c41a', Offline: '#ff4d4f', Unknown: '#faad14' };

const Healthdata = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ deviceId: '', nickname: '', phone: '' });
  const [devices, setDevices] = useState([]);
 useEffect(() => {
  getHealthData()
    .then((data) => {
      setDevices(data);
    })
    .catch((err) => {
      console.log(err);
    });
}, []);
  const filtered = devices.filter(d =>
    d.deviceId.includes(search.deviceId) &&
    d.nickname.toLowerCase().includes(search.nickname.toLowerCase()) &&
    d.phone.includes(search.phone)
  );

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px' }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Device ID</label>
          <input
            placeholder="Please enter the device ID"
            value={search.deviceId}
            onChange={e => setSearch({ ...search, deviceId: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nickname</label>
          <input
            placeholder="Please enter the nickname"
            value={search.nickname}
            onChange={e => setSearch({ ...search, nickname: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Phonenumber</label>
          <input
            placeholder="Please enter a number"
            value={search.phone}
            onChange={e => setSearch({ ...search, phone: e.target.value })}
            style={inputStyle}
          />
        </div>
        <button style={btnStyle} onClick={() => {}}>Search</button>
        <button style={{ ...btnStyle, background: '#fff', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          onClick={() => setSearch({ deviceId: '', nickname: '', phone: '' })}>Reset</button>
        <button style={{ ...btnStyle, marginLeft: 'auto' }}>Export</button>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
            {['Serial number', 'Nickname', 'Device model', 'Device ID', 'Device status', 'Steps',
              'Heart rate (bpm)', 'Blood oxygen (%)', 'Body temperature (°C)', 'Phonenumber', 'Update time', 'Operation', 'Details']
              .map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {filtered.map((d, i) => (
            <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={tdStyle}>{i + 1}</td>
              <td style={tdStyle}>{d.nickname}</td>
              <td style={tdStyle}>{d.model}</td>
              <td style={tdStyle}>{d.deviceId}</td>
              <td style={tdStyle}>
                <span style={{ color: statusColor[d.status] || '#faad14', fontSize: '12px' }}>
                  • {d.status}
                </span>
              </td>
              <td style={tdStyle}>{d.steps}</td>
              <td style={tdStyle}>{d.heartRate}</td>
              <td style={tdStyle}>{d.bloodOxygen}</td>
              <td style={tdStyle}>{d.bodyTemp}</td>
              <td style={tdStyle}>{d.phone}</td>
              <td style={tdStyle}>{d.updateTime}</td>
              <td style={tdStyle}><span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>Edit</span></td>
              <td style={tdStyle}>
                <span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}
                  onClick={() => navigate(`/device/${d.id}`)}>
                  👁 View
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const inputStyle = {
  padding: '6px 10px', border: '1px solid var(--border)',
  borderRadius: '4px', fontSize: '13px', width: '180px'
};
const btnStyle = {
  padding: '6px 16px', background: 'var(--accent-blue)', color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
};
const thStyle = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px', color: 'var(--text-primary)' };

export default Healthdata;