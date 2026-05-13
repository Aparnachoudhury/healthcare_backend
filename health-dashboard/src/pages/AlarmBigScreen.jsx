const AlarmBigScreen = () => (
  <div>
    <div style={{ marginBottom: '16px' }}>
      <h1 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Alarm Big Screen</h1>
    </div>
    <div style={{
      background: '#fff',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      padding: '24px',
    }}>
      <div style={{
        display: 'inline-block',
        background: '#f0f0f0',
        padding: '5px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 500,
        marginBottom: '16px',
      }}>
        Alarm Prompt
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        The following is a collection of device alarm records. Handling alarms in a timely manner
        can quickly respond to abnormalities and ensure the health and safety of users.
      </p>
    </div>
  </div>
);

export default AlarmBigScreen;