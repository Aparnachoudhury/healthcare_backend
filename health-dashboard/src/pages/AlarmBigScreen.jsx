const AlarmBigScreen = () => (
  <div style={{ background: '#fff', borderRadius: '8px', padding: '20px' }}>
    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
      <span style={{ background: '#f0f0f0', padding: '4px 12px', borderRadius: '4px', fontSize: '13px' }}>Alarm Prompt</span>
    </div>
    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
      The following is a collection of device alarm records. Handling alarms in a timely manner can quickly
      respond to abnormalities and ensure the health and safety of users.
    </p>
    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
      <button style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--accent-blue)', color: '#fff' }}>1</button>
    </div>
  </div>
);

export default AlarmBigScreen;