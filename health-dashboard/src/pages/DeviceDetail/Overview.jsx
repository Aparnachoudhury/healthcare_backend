const Overview = () => (
  <div>
    <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>📊 Data Overview <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2026-05-11</span></h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {[
        { label: 'Steps', value: '0', icon: '👣' },
        { label: 'Heart Rate', value: '0 bpm', icon: '❤️' },
        { label: 'Blood Oxygen', value: '--%', icon: '💧' },
        { label: 'Blood Pressure', value: '--/-- mmHg', icon: '🩸' },
        { label: 'Body Temp', value: '--°C', icon: '🌡' },
        { label: 'Sleep', value: '-- hrs', icon: '🌙' },
      ].map(item => (
        <div key={item.label} style={{
          background: '#f9fafb', borderRadius: '8px', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <span style={{ fontSize: '20px' }}>{item.icon}</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>{item.value}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Overview;