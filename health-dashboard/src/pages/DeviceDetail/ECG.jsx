const ECG = () => (
  <div>
    <h3 style={{ marginBottom: '8px', fontSize: '15px' }}>📈 ECG <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2026-05-11</span></h3>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
      Gyro: 10 mm/mv · Movement speed: 25mm/s
    </p>
    <div style={{ background: '#fff5f5', border: '1px solid #ffccc7', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#ff4d4f', marginBottom: '16px' }}>
      No data
    </div>
    <div style={{ background: '#e6f7ff', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#1890ff', marginBottom: '16px' }}>
      ℹ AI analysis results are given by the IWOWN Intelligent Diagnosis department (database for reference only). These are not the hospital's diagnosis conclusion.
    </div>
    <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>ECG data list</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
      <thead>
        <tr style={{ background: '#f9fafb' }}>
          {['Total number', 'Heart rate (bpm)', 'Diagram type', 'Measurement time', 'Operation'].map(h =>
            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
          )}
        </tr>
      </thead>
      <tbody>
        <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
      </tbody>
    </table>
  </div>
);

export default ECG;